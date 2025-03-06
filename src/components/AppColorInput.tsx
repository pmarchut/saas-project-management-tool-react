import type { LabelColor } from "@/types";

const colors = ["red", "orange", "yellow", "green", "blue", "purple", "pink"] as LabelColor[];

function AppColorInput({ value, onUpdate }: { 
    value?: string; 
    onUpdate: (value: LabelColor) => void; 
}) {
    return (
        <div className="flex items-center">
            {colors.map((color) => (
                <button 
                    key={color} 
                    onClick={() => onUpdate(color)}
                    className={`rounded mr-2 bg-${color}-500 ${value === color ? 'p-1' : 'p-2'}`}
                >
                    {value === color && <span className="k-icon k-i-check text-white"></span>}
                </button>
            ))}
        </div>
    )
}
    
export default AppColorInput