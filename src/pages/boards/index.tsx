import { useMutation, useQuery } from '@apollo/client';
import boardsQuery from '@/graphql/queries/boards.query.gql';
import { useEffect, useMemo } from 'react';
import BoardCard from '@/components/BoardCard';
import { Board } from '@/types';
import { useAppDispatch, useAppSelector } from '@/stores/store';
import createBoardMutation from "@/graphql/mutations/createBoard.mutation.gql";
import { success, error } from '@/stores/alertsSlice';

function Boards() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch()
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
  const { loading, error: boardsQueryError, data } = useQuery(boardsQuery, { variables: boardsQueryVariables });
  const boards = useMemo(() => {
      return data?.boardsList?.items || [];
  }, [data]);
  useEffect(() => {
    if (boardsQueryError) {
      dispatch(error("Error loading boards"))
    }
  }, [boardsQueryError, dispatch]);

  const getCoolGradient = (index: number) => {
    let finalGradientString = ""
    switch (index) {
      case 1: 
        finalGradientString = "from-orange-400 from-0% to-pink-500 to-100%";
        break;
      case 2: 
        finalGradientString = "from-green-400 from-0% to-blue-400 to-100%";
        break;
      case 3: 
        finalGradientString = "from-purple-400 from-0% to-blue-400 to-100%";
        break;
      default:
        finalGradientString = "from-orange-400 from-0% to-yellow-500 to-100%";
    }
    return finalGradientString;
  }

  const [createBoard] = useMutation(createBoardMutation, {
    update(cache, { data: { boardCreate } }) {
      cache.updateQuery(
        { query: boardsQuery, variables: boardsQueryVariables },
        (res) => {
          if (!res) return null;
          return {
            boardsList: {
              items: [...res.boardsList.items, boardCreate],
            },
          };
        }
      );
    },
  });

  async function handleBoardCreate() {
    const newBoardPayload = {
      data: {
        team: { connect: { id: user?.team.items[0].id } },
        title: "My New Board",
      }
    };
    await createBoard({ variables: newBoardPayload });
    dispatch(success("New Board Created!"));
  }

  return (
    <>
      <h1 className="text-3xl mb-5">Boards</h1>
      <div className="flex flex-wrap gap-2">
        {boards.map((board: Board, index: number) =>
          <div 
            key={board.id}
            className={`border rounded-md bg-gradient-to-tr ${getCoolGradient(index)}`}
          >
            <BoardCard 
              board={board}
              className="transition duration-100 ease-in border rounded-md hover:-rotate-3"
            />
          </div>
        )}
        <button className="text-gray-500" onClick={handleBoardCreate}>
          <span>New Board +</span>
        </button>
      </div>
      {loading && <p v-if="loading">Loading...</p>}
    </>
  )
}
  
export default Boards