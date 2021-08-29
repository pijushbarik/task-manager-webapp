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
import axios from "../../lib/axios";
import cogo from "cogo-toast";
import NewTask from "./NewTask";

const TaskView: React.FC<TaskViewProps> = props => {
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([
    { type: "todo", tasks: [] },
    { type: "in_progress", tasks: [] },
    { type: "completed", tasks: [] },
  ]);

  const fetchData = useCallback(async () => {
    try {
      const res = await axios.get<TaskResponse[]>("/tasks");

      const tasksTodo = [];
      const tasksInProgress = [];
      const tasksCompleted = [];

      const tasks: Task[] = res.data.map(t => ({
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
    } catch (e) {
      console.error(e);
      cogo.error("Something went wrong");
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

      handleEditTask(
        {
          id: newState[dInd].tasks[destination.index].id,
          status: taskGroups[dInd].type,
        },
        dInd,
        destination.index
      );

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

  const handleAddTask = useCallback(async (title: string) => {
    try {
      const res = await axios.post<Task>("/tasks", { title });

      setTaskGroups(prev => {
        const arr = [...prev];
        arr[0].tasks.push(res.data);

        return arr;
      });
    } catch (e) {
      console.error(e);
      cogo.error("Failed to add task");
    }
  }, []);

  const handleAddSubtask = useCallback(
    async (
      title: string,
      taskId: string,
      groupIndex: number,
      taskIndex: number
    ) => {
      try {
        const res = await axios.post<Subtask>(`/tasks/${taskId}/s`, { title });

        setTaskGroups(prev => {
          const arr = [...prev];
          arr[groupIndex].tasks[taskIndex].subtasks.push(res.data);

          return arr;
        });
      } catch (e) {
        console.error(e);
        cogo.error("Failed to add subtask");
      }
    },
    []
  );

  const handleEditTask = useCallback(
    async (taskUpdateData: any, groupIndex: number, taskIndex: number) => {
      try {
        const updateData = {};

        if (taskUpdateData.title) {
          Object.assign(updateData, { title: taskUpdateData.title });
        }

        if (taskUpdateData.status) {
          Object.assign(updateData, { status: taskUpdateData.status });
        }

        const res = await axios.put<Task>(
          `/tasks/${taskUpdateData.id}`,
          updateData
        );

        setTaskGroups(prev => {
          const arr = [...prev];
          arr[groupIndex].tasks[taskIndex] = res.data;

          return arr;
        });
      } catch (e) {
        console.error(e);
        cogo.error("Failed to update task");
      }
    },
    []
  );

  const handleEditSubtask = useCallback(
    async (
      subtaskUpdateData: any,
      groupIndex: number,
      taskIndex: number,
      subtaskIndex: number
    ) => {
      try {
        const res = await axios.put<Subtask>(
          `/tasks/${subtaskUpdateData.taskId}/s/${subtaskUpdateData.id}`,
          {
            title: subtaskUpdateData.title,
          }
        );

        setTaskGroups(prev => {
          const arr = [...prev];
          arr[groupIndex].tasks[taskIndex].subtasks[subtaskIndex] = res.data;

          return arr;
        });
      } catch (e) {
        console.error(e);
        cogo.error("Failed to update task");
      }
    },
    []
  );

  const handleDeleteTask = useCallback(
    async (id: string, groupIndex: number, taskIndex: number) => {
      try {
        await axios.delete(`/tasks/${id}`);

        setTaskGroups(prev => {
          const arr = [...prev];
          arr[groupIndex].tasks.splice(taskIndex, 1);

          return arr;
        });
      } catch (e) {
        console.error(e);
        cogo.error("Failed to add task");
      }
    },
    []
  );

  const handleDeleteSubtask = useCallback(
    async (
      id: string,
      taskId: string,
      groupIndex: number,
      taskIndex: number,
      subtaskIndex: number
    ) => {
      try {
        await axios.delete(`/tasks/${taskId}/s/${id}`);

        setTaskGroups(prev => {
          const arr = [...prev];
          arr[groupIndex].tasks[taskIndex].subtasks.splice(subtaskIndex, 1);

          return arr;
        });
      } catch (e) {
        console.error(e);
        cogo.error("Failed to add subtask");
      }
    },
    []
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
                          onClickDeleteButton={() =>
                            handleDeleteTask(task.id, taskGroupIndex, taskIndex)
                          }
                          onDragEndSubtask={onDragEndSubtask}
                          onClickDeleteSubtask={(subtaskId, subtaskIndex) =>
                            handleDeleteSubtask(
                              subtaskId,
                              task.id,
                              taskGroupIndex,
                              taskIndex,
                              subtaskIndex
                            )
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
