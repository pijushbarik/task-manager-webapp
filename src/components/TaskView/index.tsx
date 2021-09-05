import classNames from "classnames";
import React, { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import DraggableTaskCard from "./DraggableTaskCard";
import {
  TaskGroup,
  Task,
  Subtask,
  TaskViewProps,
  TaskResponse,
  TaskStatus,
} from "./types";
import {
  move,
  reorder,
  createTaskPartial,
  deleteTaskPartial,
  createSubtaskPartial,
  deleteSubtaskPartial,
  updateTaskPartial,
  updateSubtaskPartial,
} from "./helpers";
import cogo from "cogo-toast";
import pick from "../../lib/utils/pick";
import useSocket from "../../lib/hooks/useSocket";
import Container from "../Container";
import FixedNewTaskButton from "./FixedNewTaskButton";

const TaskView: React.FC<TaskViewProps> = props => {
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([
    { type: "todo", tasks: [] },
    { type: "in_progress", tasks: [] },
    { type: "completed", tasks: [] },
  ]);

  const socket = useSocket();

  const handlePartialDataUpdate = useCallback((data: any) => {
    setTaskGroups(prev => {
      let newState = [...prev];
      const taskGroupIndex = newState.findIndex(t => t.type === data.status);

      if (taskGroupIndex < 0) return newState;

      switch (data.type) {
        case "CREATE_TASK":
          newState = createTaskPartial(newState, data);
          break;

        case "UPDATE_TASK":
          newState = updateTaskPartial(newState, data);
          break;

        case "DELETE_TASK":
          newState = deleteTaskPartial(newState, data);
          break;

        case "CREATE_SUBTASK":
          newState = createSubtaskPartial(newState, data);
          break;

        case "UPDATE_SUBTASK":
          newState = updateSubtaskPartial(newState, data);
          break;

        case "DELETE_SUBTASK":
          newState = deleteSubtaskPartial(newState, data);
          break;

        default:
          break;
      }

      return newState;
    });
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("newData", (data: TaskResponse) => {
        setTaskGroups([
          { type: "todo", tasks: data.todo },
          { type: "in_progress", tasks: data.in_progress },
          { type: "completed", tasks: data.completed },
        ]);
      });

      socket.emit("getTasks");

      socket.on("partialDataUpdate", handlePartialDataUpdate);

      return () => {
        socket.off("partialDataUpdate", handlePartialDataUpdate);
      };
    }
  }, [socket, handlePartialDataUpdate]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    const sInd = +source.droppableId;
    const dInd = +destination.droppableId;

    if (sInd === dInd && source.index === destination.index) return;

    if (sInd === dInd) {
      const items = reorder<Task>(
        taskGroups[sInd].tasks,
        source.index,
        destination.index
      );
      const newState: TaskGroup[] = [...taskGroups];
      newState[sInd].tasks = items;

      handleEditTask({
        id: newState[sInd].tasks[destination.index].id,
        order: destination.index,
      });
    } else {
      const result = move<Task>(
        taskGroups[sInd].tasks,
        taskGroups[dInd].tasks,
        source,
        destination
      );
      const newState = [...taskGroups];
      newState[sInd].tasks = result[sInd];
      newState[dInd].tasks = result[dInd];

      handleEditTask({
        id: newState[dInd].tasks[destination.index].id,
        status: taskGroups[dInd].type,
        order: destination.index,
      });
    }
  };

  const onDragEndSubtask = (result: DropResult, taskGroupIndex: number) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    const sInd = +source.droppableId;
    const dInd = +destination.droppableId;

    if (sInd === dInd) {
      const items = reorder<Subtask>(
        taskGroups[taskGroupIndex].tasks[sInd].subtasks,
        source.index,
        destination.index
      );
      const newState: TaskGroup[] = [...taskGroups];
      newState[taskGroupIndex].tasks[sInd].subtasks = items;
      handleEditSubtask({
        id: newState[taskGroupIndex].tasks[sInd].subtasks[destination.index].id,
        taskId: newState[taskGroupIndex].tasks[sInd].id,
        order: destination.index,
      });
      setTaskGroups(newState);
    } else {
      const result = move<Subtask>(
        taskGroups[taskGroupIndex].tasks[sInd].subtasks,
        taskGroups[taskGroupIndex].tasks[dInd].subtasks,
        source,
        destination
      );
      const newState = [...taskGroups];
      newState[taskGroupIndex].tasks[sInd].subtasks = result[taskGroupIndex];
      newState[taskGroupIndex].tasks[dInd].subtasks = result[taskGroupIndex];

      setTaskGroups(newState);
    }
  };

  const handleAddTask = useCallback(
    async (title: string) => {
      try {
        socket.emit("createTask", { title });
      } catch (e) {
        console.error(e);
        cogo.error("Failed to add task");
      }
    },
    [socket]
  );

  const handleAddSubtask = useCallback(
    async (title: string, taskId: string) => {
      try {
        socket.emit("createSubtask", { taskId, body: { title } });
      } catch (e) {
        console.error(e);
        cogo.error("Failed to add subtask");
      }
    },
    [socket]
  );

  const handleEditTask = useCallback(
    async (taskUpdateData: any) => {
      try {
        const updateBody = pick(taskUpdateData, ["title", "status", "order"]);
        socket.emit("updateTask", { id: taskUpdateData.id, updateBody });
      } catch (e) {
        console.error(e);
        cogo.error("Failed to update task");
      }
    },
    [socket]
  );

  const handleEditSubtask = useCallback(
    async (subtaskUpdateData: any) => {
      try {
        const updateBody = pick(subtaskUpdateData, ["title", "order"]);
        socket.emit("updateSubtask", {
          taskId: subtaskUpdateData.taskId,
          subtaskId: subtaskUpdateData.id,
          updateBody,
        });
      } catch (e) {
        console.error(e);
        cogo.error("Failed to update task");
      }
    },
    [socket]
  );

  const handleDeleteTask = useCallback(
    async (id: string) => {
      try {
        socket.emit("deleteTask", { id });
      } catch (e) {
        console.error(e);
        cogo.error("Failed to add task");
      }
    },
    [socket]
  );

  const handleDeleteSubtask = useCallback(
    async (id: string, taskId: string) => {
      try {
        socket.emit("deleteSubtask", { taskId, subtaskId: id });
      } catch (e) {
        console.error(e);
        cogo.error("Failed to add subtask");
      }
    },
    [socket]
  );

  const getGroupHeader = (type: TaskStatus) => {
    return (
      <div className="flex items-center justify-between">
        <div
          className={classNames(
            "px-2 py-1 rounded-md rounded-b-none text-white font-semibold text-sm capitalize",
            type === "todo" && "bg-gray-600",
            type === "in_progress" && "bg-blue-600",
            type === "completed" && "bg-green-600"
          )}
          key={type}
        >
          <span>{type.split("_").join(" ")}</span>
        </div>
      </div>
    );
  };

  return (
    <Container className={classNames("flex flex-col")}>
      {props.mode !== "list" && (
        <div className="grid grid-cols-3 gap-6">
          {taskGroups.map(taskGroup => getGroupHeader(taskGroup.type))}
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div
          className={classNames(
            props.mode !== "list" && "grid grid-cols-3 gap-6"
          )}
        >
          {taskGroups.map((taskGroup, taskGroupIndex) => (
            <div
              className={classNames(props.mode === "list" && "mb-4 last:mb-0")}
              style={{ height: "min-content" }}
              key={taskGroup.type}
            >
              {props.mode === "list" && getGroupHeader(taskGroup.type)}
              <Droppable key={taskGroupIndex} droppableId={`${taskGroupIndex}`}>
                {provided => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    {taskGroup.tasks.length ? (
                      taskGroup.tasks.map((task, taskIndex) => (
                        <DraggableTaskCard
                          id={task.id}
                          title={task.title}
                          index={taskIndex}
                          groupIndex={taskGroupIndex}
                          subtasks={task.subtasks}
                          showSubtasks={task.showSubtasks}
                          group={task.status}
                          onClickListButton={() => {
                            setTaskGroups(prev => {
                              const arr = [...prev];
                              arr[taskGroupIndex].tasks[
                                taskIndex
                              ].showSubtasks = !arr[taskGroupIndex].tasks[
                                taskIndex
                              ].showSubtasks;
                              return arr;
                            });
                          }}
                          onClickDeleteButton={() => handleDeleteTask(task.id)}
                          onDragEndSubtask={onDragEndSubtask}
                          onClickDeleteSubtask={(subtaskId, subtaskIndex) =>
                            handleDeleteSubtask(subtaskId, task.id)
                          }
                          onAddSubtask={handleAddSubtask}
                          onEditTask={handleEditTask}
                          onEditSubtask={handleEditSubtask}
                          mode={props.mode}
                        />
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm my-4">
                        No items to show here
                      </p>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <FixedNewTaskButton onAdd={handleAddTask} />
    </Container>
  );
};

export default TaskView;
