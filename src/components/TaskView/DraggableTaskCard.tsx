import {
  Draggable,
  DragDropContext,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import classNames from "classnames";
import {
  faGripVertical,
  faList,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import Button from "../Button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Subtask,
  SubtaskUpdateData,
  TaskStatus,
  TaskUpdateData,
} from "./types";
import DraggableSubtaskCard from "./DraggableSubTaskCard";
import { useState, useEffect } from "react";
import avatarImg from "../../assets/images/avatar.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import NewSubtaskButton from "./NewSubtaskButton";

interface DraggableTaskCardProps {
  id: string;
  title: string;
  index: number;
  groupIndex: number;
  subtasks: Subtask[];
  showSubtasks: boolean;
  group: TaskStatus;
  mode?: "list" | "board";
  onDragEndSubtask: (result: DropResult, taskGroupIndex: number) => void;
  onClickListButton: () => void;
  onClickDeleteButton: () => void;
  onClickDeleteSubtask: (subtaskId: string, subtaskIndex: number) => void;
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
          className={classNames(
            "bg-white px-4 py-2 rounded-md first:rounded-t-none shadow-lg border-2 border-solid mb-0.5 last:mb-0 select-none",
            snapshot.isDragging ? "border-yellow-500" : "border-white"
          )}
        >
          <div className="flex items-center space-x-4 w-full">
            <div className="flex items-center space-x-4 w-6/12">
              <div {...provided.dragHandleProps}>
                <FontAwesomeIcon icon={faGripVertical} />
              </div>

              <div
                className={classNames(
                  "h-5 w-5 rounded-md",
                  props.group === "todo" && "bg-gray-600",
                  props.group === "in_progress" && "bg-blue-600",
                  props.group === "completed" && "bg-green-600"
                )}
              />
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
            </div>

            <div className={classNames("flex justify-end items-center w-2/12")}>
              <img alt="avatar" src={avatarImg} className="h-8 w-8" />
            </div>

            {props.mode === "list" && (
              <div className="flex justify-center items-center w-2/12">
                <span className="text-sm text-gray-500">
                  {new Date().toDateString()}
                </span>
              </div>
            )}

            <div
              className={classNames(
                "flex justify-end items-center space-x-4",
                props.mode === "list" ? "w-2/12" : "w-4/12"
              )}
            >
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
                <div className="bg-gray-50 rounded-md p-2 mt-2">
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
                          className="rounded-sm"
                        >
                          {props.subtasks.length > 0 ? (
                            props.subtasks.map((subtask, subtaskIndex) => (
                              <DraggableSubtaskCard
                                id={subtask.id}
                                title={subtask.title}
                                index={subtaskIndex}
                                onClickDeleteButton={props.onClickDeleteSubtask}
                                onEditSubtask={handleCompleEditSubtask}
                                mode={props.mode}
                              />
                            ))
                          ) : (
                            <p className="text-center text-sm text-gray-400">
                              No subtasks available
                            </p>
                          )}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>

                  <NewSubtaskButton
                    onAdd={handleAddSubtask}
                    taskId={props.id}
                    placeholder="Enter subtask title"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </Draggable>
  );
};

export default DraggableTaskCard;
