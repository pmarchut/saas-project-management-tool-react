import type { Task } from '@/types'
import { Link } from "react-router"
import { useParams } from "react-router"
import {
  Card,
  CardHeader,
  CardTitle,
  CardSubtitle,
  Avatar,
} from '@progress/kendo-react-layout'
import { Chip } from '@progress/kendo-react-buttons'
import moment from "moment"
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function TaskCard({ task }: { 
  task: Task; 
}) {
  const { boardId } = useParams();
  const date = moment(task.dueAt).format("MM/DD");

  const { 
    setNodeRef, 
    attributes, 
    listeners, 
    transform, 
    transition,
    isDragging 
  } = useSortable({
    id: task.id,
    data: {
      type: "Task",
      task
    }
  })
  
  const style = {
    transition,
    transform: CSS.Transform.toString(transform)
  }

  if (isDragging) {
    return (
      <div
        ref={setNodeRef} 
        className="cursor-grab min-h-[96px] opacity-30 border-2"
        style={style}
      ></div>
    )
  }
  
  return (
    <div
      {...attributes}
      {...listeners} 
      ref={setNodeRef} 
      style={style}
    >
      <Link to={`/boards/${boardId}/task/${task.id}`} className="cursor-grab">
        <Card>
          <CardHeader>
            <div className="flex justify-between">
              <CardTitle>{task.title}</CardTitle>
              <Avatar type="image" size="medium">
                <img
                  style={{ height: "45px", width: "45px" }}
                  src="https://api.dicebear.com/9.x/adventurer/svg?seed=Ryker"
                />
              </Avatar>
            </div>
          
            <CardSubtitle className="min-h-[24px]">
              {task.dueAt && (<Chip text={date} value="chip" rounded="full" icon="k-i-clock" themeColor="info" />)}
            </CardSubtitle>
          </CardHeader>
        </Card>
      </Link>
    </div>
  );
}
  
export default TaskCard