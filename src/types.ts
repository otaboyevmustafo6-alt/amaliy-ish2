export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export type Priority = 'low' | 'medium' | 'high';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: number;
}

export interface Board {
  id: string;
  title: string;
  ownerId: string;
  members: string[];
  createdAt: number;
  updatedAt: number;
  columnOrder: string[];
}

export interface Column {
  id: string;
  title: string;
  boardId: string;
  order: number;
  taskOrder: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  dueDate: string | null;
  boardId: string;
  columnId: string;
  ownerId: string;
  assignees: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  text: string;
  createdAt: number;
}

export interface Activity {
  id: string;
  boardId: string;
  userId: string;
  action: string;
  targetId: string;
  targetType: string;
  createdAt: number;
}
