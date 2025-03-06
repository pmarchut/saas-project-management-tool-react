import type { Label, LabelColor } from "@/types"
import AppLoader from "./AppLoader";
import AppColorInput from "./AppColorInput";
import { useState } from "react";
import { Input as KInput } from "@progress/kendo-react-inputs";
import { Button as KButton } from "@progress/kendo-react-buttons";

type L = Partial<Label>

function AppLabelsPicker(props: {
    labels: L[];
    selected: L[];
    createLabelLoading?: boolean;
    loadingLabelId?: string | null;
    select?: (l: Partial<Label>) => void;
    deselect?: (l: Partial<Label>) => void;
    create: (label: Partial<Label>) => void;
    delete: (l: Partial<Label>) => void;
    labelUpdate: (l: Partial<Label>) => void;
    selectionUpdate?: (labels: Partial<Label>[]) => void;
}) {
    const colorVariants = {
        red: "bg-red-500",
        orange: "bg-orange-500",
        yellow: "bg-yellow-500",
        green: "bg-green-500",
        blue: "bg-blue-500",
        purple: "bg-purple-500",
        pink: "bg-pink-500"
    };

    const [selected, setSelected] = useState<L[]>(props.selected || []);
    const [showCreate, setShowCreate] = useState(false);
    const [newLabel, setNewLabel] = useState<L>({
        label: "",
        color: "red", 
    });

    // functions
    function clone(object: Record<string, any>) {
        return JSON.parse(JSON.stringify(object));
    }

    function handleCreate() {
        props.create(clone(newLabel));
        setShowCreate(false)
        resetNewLabel();
    }

    function handleUpdate(labelText: string, label: L) {
        props.labelUpdate({ ...label, label: labelText });
    }

    function handleDelete(label: L) {
        props.delete(clone(label));
    }

    function handleToggle(label: L) {
        if (selected.map((l) => l.id).includes(label.id)) {
            setSelected(selected.filter((l) => l.id !== label.id))

            if (props.deselect)
                props.deselect(clone(label));
        } else {
            setSelected([...selected, label])

            if (props.select)
                props.select(clone(label));
        }

        if (props.selectionUpdate)
            props.selectionUpdate(clone(selected));
    }

    function resetNewLabel() {
        setNewLabel({ label: "", color: "red" })
    }

    function updateNewLabelColor(value: LabelColor) {
        setNewLabel({ ...newLabel, color: value })
    }

    return (
        <div>
            {props.labels.map((label) => (
                <div 
                    key={label.id}
                    className={`${label.color ? colorVariants[label.color] : ''} p-2 rounded text-white my-1 flex justify-between`}
                >
                    <div className="flex items-center">
                        {props.loadingLabelId === label.id ? <AppLoader overlay={false} />
                        : <button
                            onClick={(e) => {
                                e.preventDefault()
                                handleToggle(label)
                            }}
                            className={`w-4 h-4 mr-2 ${selected.map((l) => l.id).includes(label.id) ? 'k-icon k-i-check' : ''}`}></button>}
                        <input
                            className="w-3/4 bg-transparent outline-none" 
                            type="text"
                            value={label.label}
                            onChange={(event) => {
                                handleUpdate(event.target.value, label)
                                event.target.blur()
                            }}
                        />
                    </div>
                    <button
                        className="k-icon k-i-trash"
                        disabled={props.loadingLabelId === label.id}
                        onClick={(e) => {
                            e.preventDefault()
                            handleDelete(label)
                        }}
                    ></button>
                </div>
            ))} 
            <div>
                <button className="p-2" onClick={() => setShowCreate(!showCreate)}>
                    <span className="flex">
                    {props.createLabelLoading && <AppLoader overlay={false} />}+ Create Label
                    </span>
                </button>
                {showCreate &&
                    <div>
                        <label className="block" style={{ width: '230px' }}>
                            Label
                            <KInput style={{ width: '230px' }} value={newLabel.label} onChange={(e) => setNewLabel({ ...newLabel, label: String(e.target.value) })}></KInput>
                        </label>
                        <label className="block">
                            Color
                            <AppColorInput value={newLabel.color} onUpdate={updateNewLabelColor} />
                        </label>
                        <KButton 
                            onClick={handleCreate} 
                            className="block mt-3" 
                            themeColor="primary" 
                            disabled={props.createLabelLoading}
                        >
                            Create
                        </KButton>
                    </div>}
            </div>
        </div>
    )
}
    
export default AppLabelsPicker