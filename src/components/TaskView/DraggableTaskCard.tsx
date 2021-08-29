import {
  Draggable,
  DragDropContext,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import classNames from "classnames";
import { faList, faTrash } from "@fortawesome/free-solid-svg-icons";
import Button from "../Button";
import { motion, AnimatePresence } from "framer-motion";
import { Subtask, SubtaskUpdateData, TaskUpdateData } from "./types";
import DraggableSubtaskCard from "./DraggableSubTaskCard";
import { useState, useEffect } from "react";
import NewTask from "./NewTask";

interface DraggableTaskCardProps {
  id: string;
  title: string;
  index: number;
  groupIndex: number;
  subtasks: Subtask[];
  showSubtasks: boolean;
  onDragEndSubtask: (result: DropResult, taskGroupIndex: number) => void;
  onClickListButton: () => void;
  onClickDeleteButton: () => void;
  onClickDeleteSubtask: (subtaskIndex: number) => void;
  onAddSubtask: (
    title: string,
    taskId: string,
    groupIndex: number,
    taskIndex: number
  ) => void;
  onEditTask: (
    taskUpdateData: TaskUpdateData,
    groupIndex: number,
    taskIndex: number
  ) => void;
  onEditSubtask: (
    subtaskUpdateData: SubtaskUpdateData,
    groupIndex: number,
    taskIndex: number,
    subtaskIndex: number
  ) => void;
}

const DraggableTaskCard: React.FC<DraggableTaskCardProps> = props => {
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
      props.onEditTask(
        {
          id: props.id,
          title: newTitle,
        },
        props.groupIndex,
        props.index
      );
    }
  };

  const handleCompleEditSubtask = (
    subtaskUpdateData: { id: string; title: string },
    subtaskIndex: number
  ) => {
    props.onEditSubtask(
      {
        ...subtaskUpdateData,
        taskId: props.id,
      },
      props.groupIndex,
      props.index,
      subtaskIndex
    );
  };

  const handleAddSubtask = (title: string, taskId?: string) => {
    if (!taskId) return;
    props.onAddSubtask(title, taskId, props.groupIndex, props.index);
  };

  return (
    <Draggable key={props.id} draggableId={props.id} index={props.index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={classNames(
            "bg-white p-4 rounded-sm shadow-md border-2 border-solid mb-2 last:mb-0 hover:bg-gray-50 transition",
            snapshot.isDragging ? "border-yellow-500" : "border-white"
          )}
        >
          <div className="flex justify-between items-center">
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
                className="px-2 py-1 outline-none border border-green-800 rounded-sm shadow-md"
              />
            ) : (
              <span
                onClick={() => {
                  setIsEditing(true);
                }}
                className="py-1 cursor-pointer"
              >
                {props.title}
              </span>
            )}
            <div className="flex items-center space-x-4">
              <Button
                icon={faList}
                title="View subtasks"
                onClick={props.onClickListButton}
              />
              <Button
                icon={faTrash}
                title="Delete task"
                onClick={props.onClickDeleteButton}
              />
            </div>
          </div>
          <AnimatePresence initial={false}>
            {props.showSubtasks && (
              <motion.div
                key="content"
                initial="collapsed"
                animate="open"
                exit="collapsed"
                variants={{
                  open: { opacity: 1, height: "auto" },
                  collapsed: { opacity: 0, height: 0 },
                }}
                transition={{
                  duration: 0.2,
                }}
              >
                <div className="my-2 flex justify-end">
                  <NewTask
                    onAdd={handleAddSubtask}
                    taskId={props.id}
                    placeholder="Enter subtask title"
                    addText="Add subtask"
                    useDefaultButton
                  />
                </div>

                <DragDropContext
                  onDragEnd={result =>
                    props.onDragEndSubtask(result, props.groupIndex)
                  }
                >
                  <Droppable droppableId={`${props.index}`}>
                    {provided => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="bg-gray-100 rounded-sm"
                      >
                        {props.subtasks.map((subtask, subtaskIndex) => (
                          <DraggableSubtaskCard
                            id={subtask.id}
                            title={subtask.title}
                            index={subtaskIndex}
                            onClickDeleteButton={props.onClickDeleteSubtask}
                            onEditSubtask={handleCompleEditSubtask}
                          />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </Draggable>
  );
};

export default DraggableTaskCard;
