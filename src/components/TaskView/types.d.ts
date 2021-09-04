export type TaskStatus = "todo" | "in_progress" | "completed";

export interface Subtask {
  id: string;
  title: string;
  status: TaskStatus;
}

export interface Task extends Subtask {
  subtasks: Subtask[];
  showSubtasks: boolean;
}

export interface TaskGroup {
  type: TaskStatus;
  tasks: Task[];
}

export interface TaskViewProps {
  mode?: "list" | "board";
}

export interface TaskResponse {
  todo: Task[];
  in_progress: Task[];
  completed: Task[];
}

interface TaskUpdateBase {
  id: string;
}

interface TaskUpdateTitle extends TaskUpdateBase {
  title: string;
}

interface TaskUpdateStatus extends TaskUpdateBase {
  status: TaskStatus;
}

export type TaskUpdateData = TaskUpdateTitle | TaskUpdateStatus;

export interface SubtaskUpdateData {
  id: string;
  taskId: string;
  title: string;
}
