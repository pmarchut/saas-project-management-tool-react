import { Input as KInput, InputHandle } from "@progress/kendo-react-inputs"
import { useRef, useState } from "react"

function TaskCreator({ create }: { create: (title: string) => void }) {
    const input = useRef<InputHandle | null>(null);
    const [active, setActive] = useState(false);
    const [value, setValue] = useState("");

    const handleActivate = () => {
        setActive(true);
        queueMicrotask(() => input.current?.element?.focus())
    }
    const handleEnter = () => {
        create(value);
        setValue("");
        setActive(false);
    }
    const handleBlur = () => {
        setValue("");
        setActive(false);
    }

    return (
        <div className="w-full">
            {active ?
                <KInput 
                    ref={input}
                    type="text"
                    value={value}
                    onChange={(e) => setValue(String(e.target.value))}
                    onKeyPress={(event) => {
                      if (event.key === "Enter")
                        handleEnter()
                    }}
                    onBlur={handleBlur}
                /> :
                <button
                    onClick={handleActivate}
                    className="text-gray-600 block w-full text-left p-1"
                >
                    + Create Task
                </button>}
        </div>
    )
}
    
export default TaskCreator