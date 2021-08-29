import classNames from "classnames";
import React, { useState, useEffect, useCallback } from "react";
import { DragDropContext, Droppable, DropResult } from "react-beautiful-dnd";
import DraggableTaskCard from "./DraggableTaskCard";
import { TaskGroup, Task, Subtask, TaskViewProps, TaskResponse } from "./types";
import { move, reorder } from "./helpers";
import axios from "../../lib/axios";
import cogo from "cogo-toast";
import NewTask from "./NewTask";

const TaskView: React.FC<TaskViewProps> = () => {
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

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-3 gap-6">
        {taskGroups.map(taskGroup => (
          <div
            className={classNames(
              "p-4 rounded-md rounded-b-none text-white font-semibold capitalize flex justify-between items-center",
              taskGroup.type === "todo" && "bg-gray-600",
              taskGroup.type === "in_progress" && "bg-blue-600",
              taskGroup.type === "completed" && "bg-green-600"
            )}
            key={taskGroup.type}
          >
            <span>{taskGroup.type.split("_").join(" ")}</span>
            {taskGroup.type === "todo" ? (
              <NewTask onAdd={handleAddTask} placeholder="Enter task title" />
            ) : null}
          </div>
        ))}
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div
          className="grid grid-cols-3 gap-6"
          style={{ height: "calc(100% - 56px)" }}
        >
          {taskGroups.map((taskGroup, taskGroupIndex) => (
            <div
              className="h-full overflow-y-auto p-2 bg-gray-100 rounded-md rounded-t-none"
              key={taskGroup.type}
            >
              <Droppable key={taskGroupIndex} droppableId={`${taskGroupIndex}`}>
                {provided => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="h-full overflow-y-scroll pr-2"
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
                          onClickDeleteButton={() => {
                            setTaskGroups(prev => {
                              const arr = [...prev];
                              arr[taskGroupIndex].tasks.splice(taskIndex, 1);
                              return arr;
                            });
                          }}
                          onDragEndSubtask={onDragEndSubtask}
                          onClickDeleteSubtask={subtaskIndex => {
                            setTaskGroups(prev => {
                              const arr = [...prev];
                              arr[taskGroupIndex].tasks[
                                taskIndex
                              ].subtasks.splice(subtaskIndex, 1);
                              return arr;
                            });
                          }}
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
