import AppLoader from "@/components/AppLoader";
import AppLabelsPicker from "@/components/AppLabelsPicker";
import getTaskQuery from "@/graphql/queries/task.query.gql";
import { useQuery } from "@apollo/client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useOutletContext } from "react-router";
import { useAppDispatch } from "@/stores/store";
import { error } from "@/stores/alertsSlice";
import type { Label, Task, Comment } from "@/types";
import { TextArea as KTextArea } from '@progress/kendo-react-inputs';
import { Dialog as KDialog, DialogActionsBar as KDialogActionsBar } from "@progress/kendo-react-dialogs";
import { Editor as KEditor, EditorTools } from "@progress/kendo-react-editor";
import { Button as KButton } from "@progress/kendo-react-buttons";
import { Calendar as KCalendar } from "@progress/kendo-react-dateinputs";
import moment from "moment";
import { useBreakpoint } from "@/hooks/useBreakpoint";

function TaskItem() {
    const props = useOutletContext<{
        loadingUpdateTask: boolean;
        labels: Partial<Label>[];
        updateTask: (t: Partial<Omit<Task, 'labels'> & { labels?: Partial<Label>[] }>) => Promise<void>;
        close: () => void | Promise<void>;
        createLabel: (label: Partial<Label>) => void;
        deleteLabel: (l: Partial<Label>) => void;
        updateLabel: (l: Partial<Label>) => void;
    }>()

    const { taskId } = useParams()
    const dispatch = useAppDispatch()
    const breakpoint = useBreakpoint()

    const {
        Bold, Italic, Underline, Strikethrough,
        AlignLeft, AlignCenter, AlignRight, AlignJustify,
        OrderedList, UnorderedList,
        Indent, Outdent,
        FontSize,
        FormatBlock,
        Undo, Redo,
        Link, Unlink, InsertImage, ViewHtml
    } = EditorTools

    const [task, setTask] = useState<null | Partial<Task>>(null);
    const [labels, setLabels] = useState<Partial<Label>[]>([]);
    const [comments, setComments] = useState<Partial<Comment>[]>([]);
    const [editorIncrementToRenderer, setEditorIncrementToRenderer] = useState(0);

    const newComment = useRef("")

    const { loading, data: taskResult, error: taskError, called } = useQuery(
        getTaskQuery,
        { variables: { id: taskId, }, fetchPolicy: "cache-and-network" },
    );
    useEffect(() => {
        if (taskError) {
          dispatch(error("Error loading task"))
        }
    }, [taskError, dispatch]);
    useEffect(() => {
        if (taskResult && called) {
            const data = taskResult?.task;
            if (!data) {
                setTask(null);
                return;
            }
          
            // Konwersja danych do mutowalnej formy
            const parsedTask = JSON.parse(JSON.stringify(data));
            if (parsedTask.dueAt) {
                parsedTask.dueAt = new Date(parsedTask.dueAt);
            }
              
            setLabels(JSON.parse(JSON.stringify(data.labels?.items || [])));
            setComments(JSON.parse(JSON.stringify(data.comments?.items || [])));
            // Usunięcie niepotrzebnych pól
            delete parsedTask.labels;
            delete parsedTask.comments;
            setTask(parsedTask);
        }
    }, [taskResult, called]);

    const taskString = useMemo(() => JSON.stringify(task, null, 2), [task]);
    const commentsString = useMemo(() => JSON.stringify(comments, null, 2), [comments]);
    const labelsString = useMemo(() => JSON.stringify(labels, null, 2), [labels]);

    function handleNewComment() {
        if (!newComment.current) return;

        const newComments = [...comments]

        newComments.push({ message: newComment.current })
        setComments(newComments)
        newComment.current = "";
        setEditorIncrementToRenderer(editorIncrementToRenderer + 1)
    }

    function onCloseClicked() {
        props.close()
    }

    function onSelectionUpdate(labels: Partial<Label>[]) {
        setLabels(labels)
    }

    function onSaveClicked() {
        const newComments = comments.filter(
          (c, index) => 
            comments.length - editorIncrementToRenderer <= index
        );
      
        props.updateTask({ 
          ...task, 
          dueAt: task?.dueAt 
            ? moment(task.dueAt).format("YYYY-MM-DD") 
            : undefined,
          comments: newComments.length ? newComments : undefined,
          labels: labels.length ? labels : undefined,
        })
        onCloseClicked()
    }
    
    useEffect(() => {
        function updateDialogPosition() {
            const viewport = window.visualViewport;
            const dialog = document.querySelector('[aria-labelledby="task-dialog"]') as HTMLElement;
            const app = document.getElementById("root") as HTMLElement;

            if (dialog && app && viewport && breakpoint === "sm") {
                app.style.overflow = "hidden";
                dialog.style.position = "absolute";
                dialog.style.left = `${viewport.offsetLeft}px`;
                dialog.style.top = "0";
                dialog.style.width = `${viewport.width}px`;
                dialog.style.height = `${viewport.height}px`;
            } else if (app) {
                app.style.overflow = "";

                if (dialog) {
                    dialog.style.position = "";
                    dialog.style.left = "";
                    dialog.style.top = "";
                    dialog.style.width = "";
                    dialog.style.height = "";
                }
            } 
        }

        setTimeout(() => {
            updateDialogPosition(); 
        }, 400)

        return () => {
            const app = document.getElementById("root") as HTMLElement;
            if (app) {
                app.style.overflow = "";
            }
        }
    }, [breakpoint]); // Wywołuje `updateDialogPosition` przy każdej zmianie `breakpoint`
    
    return (
        <div>
            {loading &&
                <AppLoader overlay />}
            {task &&
                <KDialog
                    title={taskResult?.task?.title}
                    onClose={onCloseClicked}
                    autoFocus={true}
                    className="task-dialog"
                    id="task-dialog"
                >
                    <div className="sm:flex">
                        <main>
                            <div className="form-group">
                                <label htmlFor="description" className="font-bold text-xl">
                                <span className="k-icon k-i-align-left"></span>
                                    Description
                                </label>
                                <KTextArea id="description" value={task.description} onChange={(event) => setTask({ ...task, description: event.target.value })} />
                            </div>

                            <div className="form-group mt-10">
                                <label htmlFor="comments" className="font-bold text-xl">
                                <span className="k-icon k-i-comment"></span>
                                    Comments
                                </label>
                                <KEditor 
                                    onChange={(event) => newComment.current = event.html}
                                    key={editorIncrementToRenderer}
                                    tools={[
                                        [Bold, Italic, Underline, Strikethrough],
                                        [AlignLeft, AlignCenter, AlignRight, AlignJustify],
                                        [OrderedList, UnorderedList],
                                        [Indent, Outdent],
                                        FontSize,
                                        FormatBlock,
                                        [Undo, Redo],
                                        [Link, Unlink, InsertImage, ViewHtml],
                                    ]}
                                    content-style={{
                                        height: '200px',
                                    }}
                                />
                                <KButton themeColor="primary" onClick={handleNewComment}
                                >Add Comment</KButton>
                            </div>

                            {comments.map((comment) => (
                                <div
                                    key={comment.message}
                                    dangerouslySetInnerHTML={{ __html: String(comment.message) }}
                                ></div>
                            ))}

                            <strong>Task</strong>
                            <pre>{ taskString }</pre>
                            <strong>Comments</strong>
                            <pre className="whitespace-pre-wrap">{ commentsString }</pre>
                            <strong>Labels</strong>
                            <pre>{ labelsString }</pre>
                        </main>
                        <aside
                            className="pl-5 sm:w-[400px] border-t-gray-300 border-t-2 pt-5 mt-5 sm:border-t-0"
                        >
                            <ul className="m-auto">
                                <li className="my-3">
                                    <strong className="text-xs mb-2 block">Task Labels</strong>
                                    <AppLabelsPicker 
                                        key={labelsString}
                                        labels={props.labels} 
                                        selected={labels}
                                        selectionUpdate={onSelectionUpdate}
                                        create={props.createLabel}
                                        delete={props.deleteLabel}
                                        labelUpdate={props.updateLabel}
                                    />
                                </li>
                                <li className="my-3">
                                    <strong className="text-xs mb-2 block"
                                        >Task Due Date</strong>
                                    <KCalendar value={task.dueAt as Date} onChange={(event) => setTask({ ...task, dueAt: event.value })} />
                                </li>
                            </ul>
                        </aside>
                    </div>

                    <KDialogActionsBar>
                        <KButton onClick={onCloseClicked}>Cancel</KButton>
                        <KButton 
                            onClick={onSaveClicked}
                            disabled={props.loadingUpdateTask}
                            themeColor="primary"
                        >
                        Save Task
                        </KButton>
                    </KDialogActionsBar>
                </KDialog>}
        </div>
    )
}
    
export default TaskItem