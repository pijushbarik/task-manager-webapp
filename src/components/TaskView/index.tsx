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
import { move, reorder } from "./helpers";
import cogo from "cogo-toast";
import NewTask from "./NewTask";
import pick from "../../lib/utils/pick";
import useSocket from "../../lib/hooks/useSocket";

const TaskView: React.FC<TaskViewProps> = props => {
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([
    { type: "todo", tasks: [] },
    { type: "in_progress", tasks: [] },
    { type: "completed", tasks: [] },
  ]);

  const socket = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on("newData", handleNewData);
    }

    return () => {
      socket.off("newData", handleNewData);
    };
  }, [socket]);

  const handleNewData = (data: TaskResponse[]) => {
    const tasksTodo = [];
    const tasksInProgress = [];
    const tasksCompleted = [];

    const tasks: Task[] = data.map(t => ({
      ...t,
      showSubtasks: false,
    }));

    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].status === "todo") tasksTodo.push(tasks[i]);
      if (tasks[i].status === "in_progress") tasksInProgress.push(tasks[i]);
      if (tasks[i].status === "completed") tasksCompleted.push(tasks[i]);
    }

    setTaskGroups([
      { type: "todo", tasks: tasksTodo },
      { type: "in_progress", tasks: tasksInProgress },
      { type: "completed", tasks: tasksCompleted },
    ]);
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    const sInd = +source.droppableId;
    const dInd = +destination.droppableId;

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

      setTaskGroups(newState);
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
      });

      setTaskGroups(newState);
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
      <div
        className={classNames(
          "p-4 rounded-md rounded-b-none text-white font-semibold capitalize flex justify-between items-center",
          type === "todo" && "bg-gray-600",
          type === "in_progress" && "bg-blue-600",
          type === "completed" && "bg-green-600"
        )}
        key={type}
      >
        <span>{type.split("_").join(" ")}</span>
        {type === "todo" ? (
          <NewTask onAdd={handleAddTask} placeholder="Enter task title" />
        ) : null}
      </div>
    );
  };

  return (
    <div
      className={classNames(
        "flex flex-col h-full",
        props.mode === "list" && "overflow-y-scroll"
      )}
    >
      {props.mode !== "list" && (
        <div className="grid grid-cols-3 gap-6">
          {taskGroups.map(taskGroup => getGroupHeader(taskGroup.type))}
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div
          className={classNames(
            props.mode === "list" ? "" : "grid grid-cols-3 gap-6"
          )}
          style={{
            height: props.mode === "list" ? "auto" : "calc(100% - 56px)",
          }}
        >
          {taskGroups.map((taskGroup, taskGroupIndex) => (
            <div
              className={classNames(
                "p-2 bg-gray-100 rounded-md rounded-t-none",
                props.mode === "list"
                  ? "overflow-y-visible"
                  : "overflow-y-hidden h-full"
              )}
              key={taskGroup.type}
            >
              {props.mode === "list" && getGroupHeader(taskGroup.type)}
              <Droppable key={taskGroupIndex} droppableId={`${taskGroupIndex}`}>
                {provided => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={classNames(
                      props.mode === "list" ? "" : "h-full overflow-y-scroll"
                    )}
                  >
                    {taskGroup.tasks.length ? (
                      taskGroup.tasks.map((task, taskIndex) => (
                        <DraggableTaskCard
                          id={task.id}
                          title={task.title}
                          index={taskIndex}
                          groupIndex={taskGroupIndex}
                          subtasks={task.subtasks}
                          showSubtasks={task.showSubtasks}
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
                        />
                      ))
                    ) : (
                      <p className="text-center text-gray-400">
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
    </div>
  );
};

export default TaskView;
