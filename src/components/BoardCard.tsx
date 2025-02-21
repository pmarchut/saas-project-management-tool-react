import type { Board } from "@/types"
import { Link } from "react-router"
import {
  Card as KCard,
  CardTitle as KCardTitle,
} from '@progress/kendo-react-layout'
import AppImage from "./AppImage"

function BoardCard({board, className}: {board: Board, className?: string;}) {
    const randomColor = '#' + Math.floor(Math.random() * 167777215).toString()

    return (
        <Link to={`/boards/${board.id}`} className={`block w-96 ${className}`}>
            <KCard>
                {board.image?.downloadUrl 
                    ? 
                    <AppImage 
                        src={board.image.downloadUrl}
                        className="aspect-video w-full"
                    />
                    :
                    <div
                    className="aspect-video w-full"
                    style={{ backgroundColor: randomColor }}
                    ></div>}
            <KCardTitle className="p-2">
                <span className="text-gray-700 text-xl">{ board.title }</span>
            </KCardTitle>
            </KCard>
        </Link>
    )
}
  
export default BoardCard