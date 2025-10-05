export enum UserRole {
  ENGINEER = 'engineer',
  MANAGER = 'manager',
  OBSERVER = 'observer',
  ADMIN = 'admin'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
  
  export interface Project {
    id: string;
    name: string;
    description: string;
    address: string;
    startDate: string;
    endDate: string;
    status: ProjectStatus;
    managerId: string;
    manager?: User;
    createdAt: string;
    updatedAt: string;
  }
  
  export enum ProjectStatus {
    PLANNED = 'planned',
    IN_PROGRESS = 'in_progress',
    ON_HOLD = 'on_hold',
    COMPLETED = 'completed'
  }
  
  export interface Defect {
    id: string;
    title: string;
    description: string;
    priority: Priority;
    status: DefectStatus;
    projectId: string;
    project?: Project;
    assigneeId: string;
    assignee?: User;
    reporterId: string;
    reporter?: User;
    dueDate: string;
    createdAt: string;
    updatedAt: string;
    attachments: Attachment[];
    comments: Comment[];
  }
  
  export enum Priority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    CRITICAL = 'critical'
  }
  
  export enum DefectStatus {
    NEW = 'new',
    IN_PROGRESS = 'in_progress',
    UNDER_REVIEW = 'under_review',
    RESOLVED = 'resolved',
    CANCELLED = 'cancelled'
  }
  
  export interface Attachment {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    defectId: string;
    uploadedById: string;
    uploadedBy?: User;
    createdAt: string;
  }
  
  export interface Comment {
    id: string;
    content: string;
    defectId: string;
    authorId: string;
    author?: User;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface ReportData {
    totalDefects: number;
    defectsByStatus: { status: DefectStatus; count: number }[];
    defectsByPriority: { priority: Priority; count: number }[];
    averageResolutionTime: number;
    defectsByProject: { projectId: string; projectName: string; count: number }[];
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  }
  
  export interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
  }