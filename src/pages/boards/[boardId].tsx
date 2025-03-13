import AppPageHeading from "@/components/AppPageHeading"
import { useQuery, useMutation } from '@apollo/client';
import boardQuery from '@/graphql/queries/board.query.gql';
import labelsQuery from "@/graphql/queries/labels.query.gql";
import boardsQuery from "@/graphql/queries/boards.query.gql";
import deleteBoardMutation from "@/graphql/mutations/deleteBoard.mutation.gql";
import createLabelMutation from "@/graphql/mutations/createLabel.mutation.gql";
import updateLabelMutation from "@/graphql/mutations/updateLabel.mutation.gql";
import updateBoardMutation from '@/graphql/mutations/updateBoard.mutation.gql';
import deleteLabelMutation from '@/graphql/mutations/deleteLabel.mutation.gql';
import addTaskMutation from '@/graphql/mutations/addTask.mutation.gql';
import { useEffect, useMemo, useState } from "react";
import BoardDragAndDrop from "@/components/BoardDragAndDrop";
import AppLoader from "@/components/AppLoader";
import BoardMenu from "@/components/BoardMenu";
import { useParams } from "react-router";
import { useAppDispatch } from "@/stores/store";
import { error, success } from "@/stores/alertsSlice";
import type { Board, Column, Label, Task } from "@/types";
import { useNavigate, Outlet } from 'react-router-dom';
import { cloneDeep } from 'lodash-es';

function BoardItem() {
  const { boardId } = useParams()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const [loadingLabelId, setLoadingLabelId] = useState<string | null>(null)

  const { loading, error: boardQueryError, data } = useQuery(boardQuery, { 
    variables: { id: boardId }
  });
  const board = useMemo(() => {
    return data?.board 
      ? { ...data.board, tasks: data.board.tasks?.items } 
      : {}
  }, [data]);
  const tasks = useMemo(() => {
    return data?.board?.tasks?.items || []
  }, [data]);
  const selectedLabels = useMemo<Partial<Label>[]>(() => {
    return data?.board?.labels?.items || []
  }, [data]);
  useEffect(() => {
    if (boardQueryError) {
      dispatch(error("Error loading board"))
    }
  }, [boardQueryError, dispatch]);

  const { loading: labelsLoading, error: labelsQueryError, data: labelsData } = useQuery(labelsQuery);
  const labels = useMemo(() => {
    return labelsData?.labelsList?.items || []
  }, [labelsData]);
  useEffect(() => {
    if (labelsQueryError) {
      dispatch(error("Error loading labels"))
    }
  }, [labelsQueryError, dispatch]);
  
  const idUser = localStorage.getItem("id_user");
    const boardsQueryVariables = useMemo(() => {
      return idUser ? {
        customFilter: {
          team: {
            users: {
              some: {
                id: {
                  equals: idUser
                }
              }
            }
          }
        } 
      }
      : undefined
    }, [idUser]);
  const [deleteBoard, { error: deleteBoardError, loading: deleteLoading }] = useMutation(deleteBoardMutation, {
    update(cache, { data: { boardDelete } }, { variables }) {
      if (boardDelete.success) {
        cache.updateQuery(
          { query: boardsQuery, variables: boardsQueryVariables }, 
          (res) => {
            if (res?.boardsList)
              return {
                boardsList: {
                  items: res.boardsList.items.filter(
                    (board: Partial<Board>) => board.id !== variables?.id
                  ),
                },
              }
          });
      }
    },
  });
  useEffect(() => {
    if (deleteBoardError) {
      console.error(deleteBoardError);
      dispatch(error("Error deleting board"))
    }
  }, [deleteBoardError, dispatch]);
  const handleDeleteBoard = async () => {
    try {
      const result = await deleteBoard({ variables: { id: boardId } });
  
      if (result?.data.boardDelete?.success) {
        dispatch(success(`Board with ID ${boardId} deleted successfully.`));
        navigate("/boards");
      }
    } catch (error) {
      console.error("Error deleting board:", error);
    }
  };

  const [createTaskOnBoard, { error: errorCreatingTask }] = useMutation(addTaskMutation);
  async function addTask(task: Partial<Task>): Promise<Partial<Task>> {
    const res = await createTaskOnBoard({ variables: {
      boardId: boardId,
      ...task
    }})

    dispatch(success("You added a new task"));

    return res?.data?.boardUpdate?.tasks?.items[0];
  }
  useEffect(() => {
    if (errorCreatingTask) {
      console.error(errorCreatingTask);
      dispatch(error(`Error adding task to board: ${errorCreatingTask}`))
    }
  }, [errorCreatingTask, dispatch]);

  const [createLabel, { loading: createLabelLoading }] = useMutation(createLabelMutation, {
    update(cache, { data: { labelCreate } }) {
      cache.updateQuery({ query: labelsQuery }, (res) => ({
        labelsList: {
          items: [...res.labelsList.items, labelCreate],
        },
      }));
    },
  });
  async function handleLabelCreate(label: Partial<Label>) {
    await createLabel({ variables: { data: label } });
    dispatch(success("New Label Created!"));
  }

  const [updateBoard, { loading: loadingUpdateBoard }] = useMutation(updateBoardMutation, {
    update(cache, { data: { boardUpdate } }) {
      cache.updateQuery({ query: boardQuery }, () => ({
        board: boardUpdate
      }));
    },
  });
  const handleUpdateBoard = async (b: Partial<Board>) => {
    await updateBoard({ variables: { 
      data: { 
        ...b,
        tasks: b.tasks 
          ? { update: b.tasks?.map((task) => ({ data: task })) } 
          : undefined,
        labels: undefined,
      }, 
      filter: { id: boardId },
    }});
    dispatch(success("You updated a board"));
  }
  const handleUpdateDragAndDrop = async (order: Column[]) => {
    handleUpdateBoard(cloneDeep({ ...board, order }))
  }
  const handleUpdateTask = async (t: Partial<Omit<Task, 'labels'> & { labels?: Partial<Label>[] }>) => {
    await updateBoard({ variables: { 
      data: { 
        tasks: { 
          update: {
            data: { 
              ...t,
              comments: t.comments ? { create: t.comments } : undefined,
              labels: t.labels 
                ? { reconnect: t.labels.map((l) => ({ id: l.id })) }
                : undefined,
            },
            filter: { id: t.id }
          }
        }
      },
      filter: { id: boardId }, 
    }});
    dispatch(success("You updated a board"));
  }

  const [updateLabel] = useMutation(updateLabelMutation, {
    update(cache, { data: { labelUpdate } }, { variables }) {
      cache.updateQuery({ query: labelsQuery }, (res) => {
        if (res?.labelsList)
          return {
            labelsList: {
              items: res.labelsList.items.map((label: Partial<Label>) => 
                label.id !== variables?.data.id ? label : labelUpdate
              ),
            },
          }
      });
    },
  });
  const handleUpdateLabel = async (l: Partial<Label>) => {
    try {
      const { id } = l;
  
      setLoadingLabelId(String(id));
      await updateLabel({ variables: { data: l } });
      dispatch(success("You updated a label"));
    } catch (error) {
      console.error("Error updating label:", error);
    } finally {
      setLoadingLabelId(null);
    }
  };
  
  const handleSelectLabel = async (l: Partial<Label>) => {
    const { id } = l;
  
    setLoadingLabelId(String(id));
    await updateBoard({ variables: { 
      data: { labels: { reconnect: { id } } }, 
      filter: { id: boardId } 
    }})
    dispatch(success("You updated a board"));
    setLoadingLabelId(null);
  }
  const handleDeselectLabel = async (l: Partial<Label>) => {
    const { id } = l;
  
    setLoadingLabelId(String(id));
    await updateBoard({ variables: { 
      data: { labels: { disconnect: { id } } }, 
      filter: { id: boardId } 
    }})
    dispatch(success("You updated a board"));
    setLoadingLabelId(null);
  }

  const [deleteLabel, { error: deleteLabelError }] = useMutation(
    deleteLabelMutation, 
    {
      update(cache, { data: { labelDeleteByFilter } }, { variables }) {
        if (labelDeleteByFilter.success) {
          cache.updateQuery({ query: labelsQuery }, (res) => {
            if (res?.labelsList)
              return {
                labelsList: {
                  items: res.labelsList.items.filter(
                    (label: Partial<Label>) => 
                      label.id !== variables?.filter.id.equals
                  ),
                },
              }
          });
        }
      },
    }
  );
  useEffect(() => {
    if (deleteLabelError) {
      console.error(deleteLabelError);
      dispatch(error("Error deleting label"))
    }
  }, [deleteLabelError, dispatch]);
  const handleDeleteLabel = async (l: Partial<Label>) => {
    try {
      const { id } = l;
  
      setLoadingLabelId(String(id));
      const result = await deleteLabel({ variables: { filter: { id: { equals: id } } } });
  
      if (result?.data.labelDeleteByFilter?.success)
        dispatch(success(`Label with ID ${id} deleted successfully.`));
    } catch (error) {
      console.error("Error deleting label:", error);
    } finally {
      setLoadingLabelId(null);
    }
  }

  const boardString = useMemo(() => JSON.stringify(board, null, 2), [board]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      (event.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="flex items-start justify-between">
      <div>
        {board.title && 
          <AppPageHeading>
            <input 
              type="text" 
              defaultValue={board.title}
              onKeyDown={handleKeyDown}
              onBlur={(event) => handleUpdateBoard({
                  title: (event.target as HTMLInputElement).value 
              })}
            />
          </AppPageHeading>}
      
        {board.id &&
          <BoardDragAndDrop
            board={board} 
            tasks={tasks}
            update={handleUpdateDragAndDrop}
            addTask={addTask}
          />}

        <details>
          <pre className="width-[400px] overflow-x-auto whitespace-pre-wrap break-words">
            { boardString }
          </pre>
        </details>
      </div>

      <BoardMenu 
        board={board}
        labels={labels}
        selectedLabels={selectedLabels}
        deleteLoading={deleteLoading}
        createLabelLoading={createLabelLoading}
        loadingLabelId={loadingLabelId}
        deleteBoard={handleDeleteBoard}
        createLabel={handleLabelCreate}
        selectLabel={handleSelectLabel}
        deselectLabel={handleDeselectLabel}
        deleteLabel={handleDeleteLabel}
        updateLabel={handleUpdateLabel}
      />

      <Outlet
        context={{
          loadingUpdateTask: loadingUpdateBoard,
          labels,
          updateTask: handleUpdateTask,
          close: () => navigate(`/boards/${boardId}`),
          createLabel: handleLabelCreate,
          deleteLabel: handleDeleteLabel,
          updateLabel: handleUpdateLabel
        }}
      />

      {loading || labelsLoading || loadingUpdateBoard &&
        <AppLoader 
          overlay={true}
        />}
    </div>
  )
}
  
export default BoardItem