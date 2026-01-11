export enum FileType {
  FOLDER = 'FOLDER',
  MARKDOWN = 'MARKDOWN',
  PDF = 'PDF'
}

export interface FileNode {
  id: string;
  parentId: string | null;
  name: string;
  type: FileType;
  content?: string; // For markdown content
  url?: string; // For PDF url
  children?: string[]; // IDs of children
  isOpen?: boolean; // UI state for folders
  lastModified: number;
}

export interface FileSystem {
  [id: string]: FileNode;
}

export interface BreadcrumbItem {
  id: string;
  name: string;
}

export type ViewMode = 'read' | 'edit';