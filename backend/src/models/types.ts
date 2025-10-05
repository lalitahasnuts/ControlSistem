export interface User {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  export enum UserRole {
    ENGINEER = 'engineer',
    MANAGER = 'manager',
    OBSERVER = 'observer',
    ADMIN = 'admin'
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
    assigneeId: string;
    reporterId: string;
    dueDate: string;
    createdAt: string;
    updatedAt: string;
    attachments: Attachment[];
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
    createdAt: string;
  }
  
  export interface Comment {
    id: string;
    content: string;
    defectId: string;
    authorId: string;
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