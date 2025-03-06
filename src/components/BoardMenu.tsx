import { Button as KButton, ButtonHandle } from "@progress/kendo-react-buttons"
import { Popup as KPopup } from "@progress/kendo-react-popup";
import { useEffect, useRef, useState } from "react"
import type { Board, Label } from "@/types";
import AppLoader from "./AppLoader";
import AppImageDropzone from "./AppImageDropzone";
import AppLabelsPicker from "./AppLabelsPicker";
import { useMutation } from "@apollo/client";
import attachImageToBoardMutation from '@/graphql/mutations/attachImageToBoard.mutation.gql'
import { useAppDispatch } from "@/stores/store";
import { error } from "@/stores/alertsSlice";

function BoardMenu({ 
  board, labels, selectedLabels, deleteLoading, createLabelLoading, loadingLabelId, deleteBoard, createLabel, selectLabel, deselectLabel, deleteLabel, updateLabel 
}: {
  board: Partial<Board>;
  labels: Partial<Label>[];
  selectedLabels: Partial<Label>[];
  deleteLoading?: boolean;
  createLabelLoading?: boolean;
  loadingLabelId?: string | null;
  deleteBoard: () => void;
  createLabel: (label: Partial<Label>) => void;
  selectLabel: (l: Partial<Label>) => void;
  deselectLabel: (l: Partial<Label>) => void;
  deleteLabel: (l: Partial<Label>) => void;
  updateLabel: (l: Partial<Label>) => void;
}) {
    const dispatch = useAppDispatch()

    const button = useRef<ButtonHandle | null>(null);
    const [showMenu, setShowMenu] = useState(false);

    const [attachImageToBoard, { error: errorAttachingImage, loading: imageLoading }] = useMutation(attachImageToBoardMutation);
    useEffect(() => {
        if (errorAttachingImage) {
          dispatch(error("Error setting board image"))
        }
      }, [errorAttachingImage, dispatch]);
    async function handleAttachImageToBoard(id: string) {
      await attachImageToBoard({ 
        variables: {
          id: board.id,
          imageId: id,
        }
      })
    }

    return (
      <>
        <KButton
          ref={button}
          themeColor="error"
          fillMode="outline"
          icon="folder"
          onMouseDown={(e) => e.stopPropagation()} // Zatrzymuje propagację, aby popup się nie zamknął
          onClick={() => setShowMenu(!showMenu)}
          >Show Menu</KButton>
        <KPopup 
          anchor={button.current && button.current.element}
          show={showMenu} 
          popupClass="!p-4"
          anchorAlign={{ horizontal: 'right', vertical: 'bottom' }}
          popupAlign={{ horizontal: 'right', vertical: 'top' }}
          onMouseDownOutside={() => setShowMenu(false)}>
          <div>
            <ul>
              <li>
                <KButton
                  themeColor="error"
                  fillMode="flat"
                  icon="trash"
                  disabled={deleteLoading}
                  onClick={deleteBoard}
                >
                  {deleteLoading ? 
                    <>
                      <AppLoader overlay={false} /> Deleting...
                    </>
                  : <>Delete Board</>}
                </KButton>
              </li>
              <li>
                <strong>Board Image</strong>
                <AppImageDropzone 
                  className="aspect-video w-56"
                  image={board.image?.downloadUrl}
                  loading={imageLoading}
                  onUpload={handleAttachImageToBoard}
                />
              </li>
              <li>
                <AppLabelsPicker 
                  labels={labels}
                  selected={selectedLabels}
                  createLabelLoading={createLabelLoading}
                  loadingLabelId={loadingLabelId}
                  create={createLabel}
                  select={selectLabel}
                  deselect={deselectLabel}
                  delete={deleteLabel}
                  labelUpdate={updateLabel}
                />
              </li>
            </ul>
          </div>
        </KPopup>
      </>
  )
}
    
export default BoardMenu