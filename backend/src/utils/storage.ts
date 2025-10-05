import { 
  User, 
  Project, 
  Defect, 
  Comment, 
  Attachment, 
  UserRole, 
  ProjectStatus, 
  Priority, 
  DefectStatus 
} from '../models/types';

// Тестовые данные
export const initialUsers: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'password123',
    firstName: 'Admin',
    lastName: 'User',
    role: UserRole.ADMIN,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'manager@example.com',
    password: 'password123',
    firstName: 'Project',
    lastName: 'Manager',
    role: UserRole.MANAGER,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'engineer@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Engineer',
    role: UserRole.ENGINEER,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    email: 'observer@example.com',
    password: 'password123',
    firstName: 'Observer',
    lastName: 'User',
    role: UserRole.OBSERVER,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const initialProjects: Project[] = [
  {
    id: '1',
    name: 'ЖК "Современный"',
    description: 'Многоэтажный жилой комплекс в центре города',
    address: 'г. Москва, ул. Центральная, 1',
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    status: ProjectStatus.IN_PROGRESS,
    managerId: '2',
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Торговый центр "Северный"',
    description: 'Строительство торгово-развлекательного центра',
    address: 'г. Москва, пр. Северный, 25',
    startDate: '2024-02-01',
    endDate: '2024-11-30',
    status: ProjectStatus.IN_PROGRESS,
    managerId: '2',
    createdAt: new Date('2024-02-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Офисное здание "Бизнес-Парк"',
    description: 'Строительство офисного комплекса класса А',
    address: 'г. Москва, Бизнес-парк, 5',
    startDate: '2024-03-01',
    endDate: '2024-10-31',
    status: ProjectStatus.PLANNED,
    managerId: '2',
    createdAt: new Date('2024-03-01').toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const initialDefects: Defect[] = [
  {
    id: '1',
    title: 'Трещина в несущей стене',
    description: 'Обнаружена вертикальная трещина в несущей стене на 3 этаже',
    priority: Priority.HIGH,
    status: DefectStatus.IN_PROGRESS,
    projectId: '1',
    reporterId: '2',
    assigneeId: '3',
    dueDate: '2024-12-31',
    createdAt: new Date('2024-10-01').toISOString(),
    updatedAt: new Date('2024-10-01').toISOString(),
    attachments: [],
  },
  {
    id: '2',
    title: 'Протечка в системе водоснабжения',
    description: 'Протечка в магистральном трубопроводе на цокольном этаже',
    priority: Priority.MEDIUM,
    status: DefectStatus.NEW,
    projectId: '2',
    reporterId: '1',
    assigneeId: '3',
    dueDate: '2024-11-15',
    createdAt: new Date('2024-10-02').toISOString(),
    updatedAt: new Date('2024-10-02').toISOString(),
    attachments: [],
  },
  {
    id: '3',
    title: 'Несоответствие электромонтажных работ',
    description: 'Выявлены отклонения от проектной документации в электромонтаже',
    priority: Priority.CRITICAL,
    status: DefectStatus.UNDER_REVIEW,
    projectId: '1',
    reporterId: '4',
    assigneeId: '3',
    dueDate: '2024-10-20',
    createdAt: new Date('2024-10-03').toISOString(),
    updatedAt: new Date('2024-10-03').toISOString(),
    attachments: [],
  },
];

export const initialComments: Comment[] = [
  {
    id: '1',
    content: 'Требуется срочный осмотр специалистом',
    defectId: '1',
    authorId: '2',
    createdAt: new Date('2024-10-01').toISOString(),
    updatedAt: new Date('2024-10-01').toISOString(),
  },
  {
    id: '2',
    content: 'Принято в работу, выезжаю на объект',
    defectId: '1',
    authorId: '3',
    createdAt: new Date('2024-10-02').toISOString(),
    updatedAt: new Date('2024-10-02').toISOString(),
  },
  {
    id: '3',
    content: 'Произведен первичный осмотр, требуется дополнительная диагностика',
    defectId: '1',
    authorId: '3',
    createdAt: new Date('2024-10-03').toISOString(),
    updatedAt: new Date('2024-10-03').toISOString(),
  },
];

export const initialAttachments: Attachment[] = [
  {
    id: '1',
    originalName: 'crack_photo.jpg',
    filename: 'crack_photo_12345.jpg',
    mimeType: 'image/jpeg',
    size: 2048576,
    defectId: '1',
    uploadedById: '2',
    createdAt: new Date('2024-10-01').toISOString(),
  },
  {
    id: '2',
    originalName: 'electrical_diagram.pdf',
    filename: 'electrical_diagram_67890.pdf',
    mimeType: 'application/pdf',
    size: 1048576,
    defectId: '3',
    uploadedById: '4',
    createdAt: new Date('2024-10-03').toISOString(),
  },
];

// Функции для работы с localStorage (если нужно)
export const storage = {
  getUsers(): User[] {
    if (typeof window !== 'undefined') {
      const users = localStorage.getItem('users');
      return users ? JSON.parse(users) : initialUsers;
    }
    return initialUsers;
  },

  setUsers(users: User[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('users', JSON.stringify(users));
    }
  },

  getProjects(): Project[] {
    if (typeof window !== 'undefined') {
      const projects = localStorage.getItem('projects');
      return projects ? JSON.parse(projects) : initialProjects;
    }
    return initialProjects;
  },

  setProjects(projects: Project[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('projects', JSON.stringify(projects));
    }
  },

  getDefects(): Defect[] {
    if (typeof window !== 'undefined') {
      const defects = localStorage.getItem('defects');
      return defects ? JSON.parse(defects) : initialDefects;
    }
    return initialDefects;
  },

  setDefects(defects: Defect[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('defects', JSON.stringify(defects));
    }
  },

  getComments(): Comment[] {
    if (typeof window !== 'undefined') {
      const comments = localStorage.getItem('comments');
      return comments ? JSON.parse(comments) : initialComments;
    }
    return initialComments;
  },

  setComments(comments: Comment[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('comments', JSON.stringify(comments));
    }
  },

  getAttachments(): Attachment[] {
    if (typeof window !== 'undefined') {
      const attachments = localStorage.getItem('attachments');
      return attachments ? JSON.parse(attachments) : initialAttachments;
    }
    return initialAttachments;
  },

  setAttachments(attachments: Attachment[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('attachments', JSON.stringify(attachments));
    }
  },
};

// Добавьте в конец storage.ts, перед последней закрывающей скобкой

// Вспомогательные функции для работы с пользователями
export const findUserByEmail = (email: string): User | undefined => {
  const users = storage.getUsers();
  return users.find(user => user.email === email);
};

export const findUserById = (id: string): User | undefined => {
  const users = storage.getUsers();
  return users.find(user => user.id === id);
};

export const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Функции для работы с проектами
export const findProjectById = (id: string): Project | undefined => {
  const projects = storage.getProjects();
  return projects.find(project => project.id === id);
};

// Функции для работы с дефектами
export const findDefectById = (id: string): Defect | undefined => {
  const defects = storage.getDefects();
  return defects.find(defect => defect.id === id);
};

// Экспортируем массивы для прямого доступа (если нужно)
export { initialUsers as users, initialProjects as projects, initialDefects as defects };