import AppPageHeading from "@/components/AppPageHeading"
import { useQuery } from '@apollo/client';
import boardQuery from '@/graphql/queries/board.query.gql';
import { useEffect, useMemo } from "react";
import BoardDragAndDrop from "@/components/BoardDragAndDrop";
import AppLoader from "@/components/AppLoader";
import { useParams } from "react-router";

function BoardItem() {
  const { boardId } = useParams()

  const { loading, error, data } = useQuery(boardQuery, { 
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
  useEffect(() => {
    if (error) {
      console.error("Error loading board:", error);
    }
  }, [error]);

  const boardString = useMemo(() => JSON.stringify(board, null, 2), [board]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      (event.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="flex items-start justify-between w-100">
      <div>
        {board.title && 
          <AppPageHeading>
            <input 
              type="text" 
              defaultValue={board.title}
              onKeyDown={handleKeyDown}
            />
          </AppPageHeading>}
      
        {board.id &&
          <BoardDragAndDrop
            board={board} 
            tasks={tasks}
          />}

        <details>
          <pre className="width-[400px] overflow-x-auto whitespace-pre-wrap break-words">
            { boardString }
          </pre>
        </details>
      </div>

      {loading && 
        <AppLoader 
          overlay={true}
        />}
    </div>
  )
}
  
export default BoardItem