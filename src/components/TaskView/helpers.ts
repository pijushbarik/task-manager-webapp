import { DraggableLocation } from "react-beautiful-dnd";
import { TaskGroup } from "./types";

export function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}

export function move<T>(
  source: T[],
  destination: T[],
  droppableSource: DraggableLocation,
  droppableDestination: DraggableLocation
) {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result: { [key: string]: T[] } = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
}

export function createTaskPartial(storeData: TaskGroup[], updateData: any) {
  const taskGroupIndex = storeData.findIndex(t => t.type === updateData.status);
  const tasks = [...storeData[taskGroupIndex].tasks];

  tasks.push(updateData.task);

  storeData[taskGroupIndex].tasks = tasks;

  return storeData;
}

export function updateTaskPartial(storeData: TaskGroup[], updateData: any) {
  const taskGroupIndex = storeData.findIndex(t => t.type === updateData.status);
  const tasks = [...storeData[taskGroupIndex].tasks];

  const taskIndexToUpdate = tasks.findIndex(t => t.id === updateData.id);

  const updateTaskData = {
    ...tasks[taskIndexToUpdate],
    ...updateData.task,
  };

  if (taskIndexToUpdate < 0) {
    if (updateData.updatedByOthers) {
      // Deleting the existing card if the task is moved to another group and it
      // is not updated by us.
      for (let i = 0; i < storeData.length; i++) {
        if (i === taskGroupIndex) continue;

        const currentGroupTasks = storeData[i].tasks;
        for (let j = 0; j < currentGroupTasks.length; j++) {
          if (currentGroupTasks[j].id === updateData.id) {
            currentGroupTasks.splice(j, 1);
            break;
          }
        }
      }
    }

    tasks.push(updateTaskData);
  } else {
    if (tasks[taskIndexToUpdate].order !== updateData.order) {
      const currentOrder = tasks[taskIndexToUpdate].order;

      for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id === updateData.id) continue;
        if (
          updateData.order < currentOrder &&
          tasks[i].order >= updateData.order &&
          tasks[i].order < currentOrder
        ) {
          tasks[i].order += 1;
        } else if (
          tasks[i].order <= updateData.order &&
          tasks[i].order > currentOrder
        ) {
          tasks[i].order -= 1;
        }
      }
    }

    tasks.splice(taskIndexToUpdate, 1, updateTaskData);
  }

  tasks.sort((a, b) => a.order - b.order);

  storeData[taskGroupIndex].tasks = tasks;

  return storeData;
}

export function deleteTaskPartial(storeData: TaskGroup[], updateData: any) {
  const taskGroupIndex = storeData.findIndex(t => t.type === updateData.status);
  const tasks = [...storeData[taskGroupIndex].tasks];

  const taskIndexToDelete = tasks.findIndex(t => t.id === updateData.id);
  tasks.splice(taskIndexToDelete, 1);

  storeData[taskGroupIndex].tasks = tasks;

  return storeData;
}

export function createSubtaskPartial(storeData: TaskGroup[], updateData: any) {
  const taskGroupIndex = storeData.findIndex(t => t.type === updateData.status);
  const tasks = [...storeData[taskGroupIndex].tasks];

  const taskIndexToUpdate = tasks.findIndex(t => t.id === updateData.taskId);
  tasks[taskIndexToUpdate].subtasks.push(updateData.subtask);

  storeData[taskGroupIndex].tasks = tasks;

  return storeData;
}

export function updateSubtaskPartial(storeData: TaskGroup[], updateData: any) {
  const taskGroupIndex = storeData.findIndex(t => t.type === updateData.status);
  const tasks = [...storeData[taskGroupIndex].tasks];

  const taskIndexToUpdate = tasks.findIndex(t => t.id === updateData.taskId);
  const subtaskIndexToUpdate = tasks[taskIndexToUpdate].subtasks.findIndex(
    s => s.id === updateData.id
  );
  const [deletedSubtask] = tasks[taskIndexToUpdate].subtasks.splice(
    subtaskIndexToUpdate,
    1,
    updateData.subtask
  );
  if (deletedSubtask.order !== updateData.order) {
    const subtasks = tasks[taskIndexToUpdate].subtasks;
    const currentOrder = deletedSubtask.order;

    for (let i = 0; i < subtasks.length; i++) {
      if (subtasks[i].id === updateData.id) continue;
      if (
        updateData.order < currentOrder &&
        subtasks[i].order >= updateData.order &&
        subtasks[i].order < currentOrder
      ) {
        subtasks[i].order += 1;
      } else if (
        subtasks[i].order <= updateData.order &&
        subtasks[i].order > currentOrder
      ) {
        subtasks[i].order -= 1;
      }
    }

    subtasks.sort((a, b) => a.order - b.order);
  }

  storeData[taskGroupIndex].tasks = tasks;

  return storeData;
}

export function deleteSubtaskPartial(storeData: TaskGroup[], updateData: any) {
  const taskGroupIndex = storeData.findIndex(t => t.type === updateData.status);
  const tasks = [...storeData[taskGroupIndex].tasks];

  const taskIndexToUpdate = tasks.findIndex(t => t.id === updateData.taskId);
  const subtaskIndexToDelete = tasks[taskIndexToUpdate].subtasks.findIndex(
    t => t.id === updateData.id
  );
  tasks[taskIndexToUpdate].subtasks.splice(subtaskIndexToDelete, 1);

  storeData[taskGroupIndex].tasks = tasks;

  return storeData;
}
