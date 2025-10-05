import { User, Project, Defect, Comment, Attachment } from '../models/types.js';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage (в реальном приложении заменить на БД)
export let users: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    firstName: 'Администратор',
    lastName: 'Системы',
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    email: 'manager@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    firstName: 'Менеджер',
    lastName: 'Проектов',
    role: 'manager',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    email: 'engineer@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    firstName: 'Инженер',
    lastName: 'Строитель',
    role: 'engineer',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export let projects: Project[] = [
  {
    id: '1',
    name: 'ЖК "Северный"',
    description: 'Многоэтажный жилой комплекс в северном районе',
    address: 'ул. Северная, 123',
    startDate: '2024-01-15',
    endDate: '2024-12-31',
    status: 'in_progress',
    managerId: '2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Бизнес-центр "Центральный"',
    description: 'Офисный комплекс класса А',
    address: 'ул. Центральная, 45',
    startDate: '2024-02-01',
    endDate: '2024-11-30',
    status: 'in_progress',
    managerId: '2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export let defects: Defect[] = [
  {
    id: '1',
    title: 'Трещина в несущей стене',
    description: 'Обнаружена вертикальная трещина в несущей стене на 3 этаже',
    priority: 'high',
    status: 'in_progress',
    projectId: '1',
    assigneeId: '3',
    reporterId: '2',
    dueDate: '2024-12-15',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attachments: []
  },
  {
    id: '2',
    title: 'Протечка кровли',
    description: 'Протечка в районе вентиляционных выходов',
    priority: 'medium',
    status: 'new',
    projectId: '1',
    assigneeId: '3',
    reporterId: '2',
    dueDate: '2024-12-20',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attachments: []
  }
];

export let comments: Comment[] = [];
export let attachments: Attachment[] = [];

// Helper functions
export const generateId = () => uuidv4();
export const findUserById = (id: string) => users.find(u => u.id === id);
export const findUserByEmail = (email: string) => users.find(u => u.email === email);
export const findProjectById = (id: string) => projects.find(p => p.id === id);
export const findDefectById = (id: string) => defects.find(d => d.id === id);