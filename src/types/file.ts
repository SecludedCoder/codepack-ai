// src/types/file.ts
export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  lastModified?: Date;
  content?: File;
  children?: FileNode[];
}