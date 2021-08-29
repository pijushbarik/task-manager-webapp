import { Draggable } from "react-beautiful-dnd";
import classNames from "classnames";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import Button from "../Button";
import { useState, useEffect } from "react";

interface DraggableSubaskCardProps {
  id: string;
  title: string;
  index: number;
  onClickDeleteButton: (subtaskIndex: number) => void;
  onEditSubtask: (
    subtaskUpdateData: { id: string; title: string },
    subtaskIndex: number
  ) => void;
}

const DraggableSubtaskCard: React.FC<DraggableSubaskCardProps> = props => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (isEditing) {
      setValue(props.title);
    }
  }, [isEditing, props.title]);

  const handleCompleteEdit = () => {
    const newTitle = value.trim();

    if (newTitle.length && newTitle !== props.title) {
      props.onEditSubtask(
        {
          id: props.id,
          title: newTitle,
        },
        props.index
      );
    }
  };

  return (
    <Draggable key={props.id} draggableId={props.id} index={props.index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={classNames(
            "bg-white px-2 py-1 flex items-center justify-between border-2 border-solid mb-0.5 last:mb-0 hover:bg-gray-50 transition",
            snapshot.isDragging ? "border-yellow-500" : "border-white"
          )}
        >
          {isEditing ? (
            <input
              value={value}
              onChange={e => setValue(e.target.value)}
              onBlur={() => {
                setIsEditing(false);
                handleCompleteEdit();
              }}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  setIsEditing(false);
                  handleCompleteEdit();
                }
              }}
              autoFocus
              className="px-2 py-1 outline-none border border-green-800 rounded-sm shadow-md text-sm"
            />
          ) : (
            <span
              onClick={() => {
                setIsEditing(true);
              }}
              className="py-1 cursor-pointer text-sm"
            >
              {props.title}
            </span>
          )}
          <div>
            <Button
              icon={faTrash}
              title="Delete subtask"
              size="small"
              onClick={() => props.onClickDeleteButton(props.index)}
            />
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default DraggableSubtaskCard;
