import { Draggable } from "react-beautiful-dnd";
import classNames from "classnames";
import { faGripVertical, faTrash } from "@fortawesome/free-solid-svg-icons";
import Button from "../Button";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface DraggableSubaskCardProps {
  id: string;
  title: string;
  index: number;
  mode?: "list" | "board";
  onClickDeleteButton: (subtaskId: string, subtaskIndex: number) => void;
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
          className={classNames(
            "bg-white px-2 py-1 flex items-center justify-between border-2 border-solid shadow-md mb-0.5 last:mb-0 rounded-md",
            snapshot.isDragging ? "border-yellow-500" : "border-white"
          )}
        >
          <div className="grid gap-4 grid-cols-2 w-full">
            <div className="flex items-center space-x-4">
              <div {...provided.dragHandleProps}>
                <FontAwesomeIcon icon={faGripVertical} />
              </div>

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
            </div>
            <div className="flex justify-end">
              <Button
                icon={faTrash}
                title="Delete subtask"
                size="small"
                onClick={() => props.onClickDeleteButton(props.id, props.index)}
              />
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default DraggableSubtaskCard;
