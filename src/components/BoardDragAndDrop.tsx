import { useEffect, useMemo, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import TaskCard from "./TaskCard";
import TaskCreator from "./TaskCreator";
import type { Board, Column, Task } from '@/types';
import { DndContext, DragStartEvent, DragOverlay, DragEndEvent, useSensors, useSensor, PointerSensor, DragOverEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createPortal } from "react-dom";
import { useAppDispatch } from "@/stores/store";
import { error } from "@/stores/alertsSlice";

interface Props {
  board: Board;
  tasks: Task[];
  update: (order: Column[]) => Promise<void>;
  addTask: (task: Partial<Task>) => Promise<Partial<Task>>;
}

const ColumnComponent = ({
  column,
  tasks,
  updateColumn,
  handleAddTask
}: {
  column: Column;
  tasks: Task[];
  updateColumn(column: Column): void;
  handleAddTask({ column, title }: {
    column: Column;
    title: string;
  }): Promise<void>
}) => {
  const { 
    setNodeRef, 
    attributes, 
    listeners, 
    transform, 
    transition,
    isDragging 
  } = useSortable({
    id: column.id,
    data: {
      type: "Column",
      column
    }
  })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform)
  }

  function create(title: string) {
    handleAddTask({ column, title })
  }

  if (isDragging) {
    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        className="bg-gray-100 flex flex-col rounded-lg p-3 mr-4 w-[300px] cursor-grab opacity-40 border-2 min-h-[456px]"
      ></div>
    )
  }

  return (
    <div 
      {...attributes}
      {...listeners}
      ref={setNodeRef} 
      style={style} 
      className="bg-gray-100 flex flex-col rounded-lg p-3 mr-4 w-[300px] cursor-grab"
    >
      <h3>
        <input
          type="text"
          defaultValue={column.title}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return
            (e.target as HTMLInputElement).blur()
          }}
          onBlur={(e) => updateColumn({ ...column, title: e.target.value })}
          className="mb-2 bg-transparent"
        />
      </h3>
      <div className="min-h-[400px]">
        <SortableContext items={column.taskIds}>
          {column.taskIds.map((taskId) => {
            const task = tasks.find((t) => t.id === taskId)
            return task ? (
              <TaskCard
                key={taskId}
                task={task}
              />
            ) : null
          })}
        </SortableContext>
      </div>
      <TaskCreator 
        create={create} 
      />
    </div>
  );
};

// Główny komponent tablicy
function BoardDragAndDrop({ board, tasks, update, addTask }: Props) {
  const dispatch = useAppDispatch()

  const [columns, setColumns] = useState<Column[]>(board.order || []);
  const columnsIds = useMemo(() => columns.map((col) => col.id), [columns])
  const lastColumns = useRef(columns);

  const [activeColumn, setActiveColumn] = useState<Column | null>(null);

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3
      }
    })
  )

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === "Column") {
      setActiveColumn(event.active.data.current.column)
      return
    }

    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task)
      return
    }
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null)
    setActiveTask(null)
    isDragOver.current = false

    if (needToSaveColumns.current.length) {
      update(needToSaveColumns.current);
      lastColumns.current = needToSaveColumns.current
      needToSaveColumns.current = []
    }

    const { active, over } = event
    const isActiveAColumn = active.data.current?.type === "Column"
    if (!over || !isActiveAColumn) return

    const activeColumnId = active.id
    const overColumnId = over.id

    if (activeColumnId === overColumnId) return

    setColumns((columns) => {
      const activeColumnIndex = columns.findIndex(
        (col) => col.id === activeColumnId
      )

      const overColumnIndex = columns.findIndex(
        (col) => col.id === overColumnId
      )

      return arrayMove(columns, activeColumnIndex, overColumnIndex)
    })
  }

  function onDragOver(event: DragOverEvent) {
    isDragOver.current = true

    const { active, over } = event
    if (!over) return

    const activeId = active.id
    const overId = over.id

    if (activeId === overId) return

    const isActiveATask = active.data.current?.type === "Task"
    const isOverATask = over.data.current?.type === "Task"

    if (!isActiveATask) return

    // Im dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      setColumns((prevColumns) => {
        const newColumns = prevColumns.map(col => ({
          ...col,
          taskIds: [...col.taskIds] // Tworzymy kopię taskIds dla każdej kolumny
        }));
    
        const activeColumnIndex = newColumns.findIndex(col => col.taskIds.includes(String(activeId)));
        const overColumnIndex = newColumns.findIndex(col => col.taskIds.includes(String(overId)));
        const overIndexInColumn = newColumns[overColumnIndex].taskIds.findIndex(taskId => taskId === overId);
    
        // Tworzymy nową wersję kolumny aktywnej (jeśli zadanie zmienia kolumnę)
        if (newColumns[activeColumnIndex].id !== newColumns[overColumnIndex].id) {
          newColumns[activeColumnIndex] = {
            ...newColumns[activeColumnIndex],
            taskIds: newColumns[activeColumnIndex].taskIds.filter(taskId => taskId !== activeId)
          };
        }
    
        // Tworzymy nową wersję kolumny docelowej i wstawiamy zadanie
        if (newColumns[activeColumnIndex].id === newColumns[overColumnIndex].id) {
          const activeIndexInColumn = newColumns[overColumnIndex].taskIds.findIndex(taskId => taskId === activeId);

          newColumns[overColumnIndex] = {
            ...newColumns[overColumnIndex],
            taskIds: arrayMove(newColumns[overColumnIndex].taskIds, activeIndexInColumn, overIndexInColumn)
          };
        } else {
          const newTaskIds = [...newColumns[overColumnIndex].taskIds]
          
          newTaskIds.splice(overIndexInColumn, 0, String(activeId))
          newColumns[overColumnIndex] = {
            ...newColumns[overColumnIndex],
            taskIds: newTaskIds
          };
        }
      
        needToSaveColumns.current = newColumns;
        return newColumns;
      });
    }

    const isOverAColumn = over.data.current?.type === "Column"

    // Im dropping Task over a column
    if (isActiveATask && isOverAColumn) {
      setColumns((prevColumns) => {
        const newColumns = prevColumns.map(col => ({
          ...col,
          taskIds: [...col.taskIds] // Tworzymy kopię taskIds dla każdej kolumny
        }));
    
        const activeColumnIndex = newColumns.findIndex(col => col.taskIds.includes(String(activeId)));
        const overColumnIndex = newColumns.findIndex(col => col.id === overId);
        
        if (newColumns[activeColumnIndex].id !== newColumns[overColumnIndex].id) {
          // Tworzymy nową wersję kolumny aktywnej (jeśli zadanie zmienia kolumnę)
          newColumns[activeColumnIndex] = {
            ...newColumns[activeColumnIndex],
            taskIds: newColumns[activeColumnIndex].taskIds.filter(taskId => taskId !== activeId)
          };

          // Tworzymy nową wersję kolumny docelowej i wstawiamy zadanie
          newColumns[overColumnIndex] = {
            ...newColumns[overColumnIndex],
            taskIds: [...newColumns[overColumnIndex].taskIds, String(activeId)]
          };
        }
      
        needToSaveColumns.current = newColumns;
        return newColumns;
      });
    }
  }

  function updateColumn(column: Column) {
    const newColumns = columns.map((col) => {
      if (col.id !== column.id) return col
      return column
    })

    setColumns(newColumns)
  }

  async function handleAddTask({ column, title } : { column: Column, title: string }) {
    const newTask = { title }
    try {
      const savedTask = await addTask(newTask);
      const newColumns = columns.map((col) => {
        if (col.id === column.id) return { ...col, taskIds: [...col.taskIds, String(savedTask.id)] }
        return col
      })
      
      setColumns(newColumns)
    } catch (e) {
      console.error(e);
      dispatch(error("Error creating task!"))
    }
  }

  const isFirstRender = useRef(true);
  const isDragOver = useRef(false);
  const needToSaveColumns = useRef<Column[]>([]);

  useEffect(() => {
    if (isFirstRender.current) {
      setTimeout(() => {
        isFirstRender.current = false;
      }, 200);
      return;
    }
  
    if (isDragOver.current) {
      return;
    }
  
    if (JSON.stringify(columns) !== JSON.stringify(lastColumns.current)) {
      update(columns);
      lastColumns.current = columns; // Zapisz nową wartość
    }
  }, [columns, update]);

  return (
    <DndContext
      sensors={sensors} 
      onDragStart={onDragStart} 
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
    >
      <div className="flex items-start py-12">
        <div className="flex flex-grow-0 flex-shrink-0 overflow-x-scroll">
          <SortableContext items={columnsIds}>
            {columns.map((column) => (
              <ColumnComponent
                key={column.id}
                column={column}
                tasks={tasks}
                updateColumn={updateColumn}
                handleAddTask={handleAddTask}
              />
            ))}
          </SortableContext>
        </div>
        <button className="text-gray-500" onClick={() => setColumns([...columns, { id: uuidv4(), title: "New column", taskIds: [] }])}>
          New Column +
        </button>
      </div>

      {createPortal(
        <DragOverlay>
          {activeColumn && (
            <ColumnComponent 
              column={activeColumn}
              tasks={tasks}
              updateColumn={updateColumn}
              handleAddTask={handleAddTask}
            />
          )}
          {activeTask && (
            <TaskCard 
              task={activeTask}
            />
          )}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}

export default BoardDragAndDrop
