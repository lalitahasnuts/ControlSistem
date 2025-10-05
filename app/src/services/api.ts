import axios from 'axios';
import { 
  User, 
  Project, 
  Defect, 
  ReportData, 
  LoginCredentials, 
  RegisterData,
  Comment,
  Attachment 
} from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials: LoginCredentials): Promise<{ token: string; user: User }> => {
    const response = await api.post('/auth/login', credentials);
    const data = response.data as { success: boolean; token: string; user: User; message: string };
    return { token: data.token, user: data.user };
  },

  register: async (data: RegisterData): Promise<{ token: string; user: User }> => {
    const response = await api.post('/auth/register', data);
    const responseData = response.data as { success: boolean; token: string; user: User; message: string };
    return { token: responseData.token, user: responseData.user };
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    const data = response.data as { success: boolean; user: User };
    return data.user;
  },
};

export const userService = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data as User[];
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data as User;
  },

  create: async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    const response = await api.post('/users', data);
    return response.data as User;
  },

  update: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data as User;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

export const projectService = {
  getAll: async (): Promise<Project[]> => {
    const response = await api.get('/projects');
    return response.data as Project[];
  },

  getById: async (id: string): Promise<Project> => {
    const response = await api.get(`/projects/${id}`);
    return response.data as Project;
  },

  create: async (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> => {
    const response = await api.post('/projects', data);
    return response.data as Project;
  },

  update: async (id: string, data: Partial<Project>): Promise<Project> => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data as Project;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};

export const defectService = {
  getAll: async (filters?: any): Promise<Defect[]> => {
    const response = await api.get('/defects', { params: filters });
    return response.data as Defect[];
  },

  getById: async (id: string): Promise<Defect> => {
    const response = await api.get(`/defects/${id}`);
    return response.data as Defect;
  },

  create: async (data: Omit<Defect, 'id' | 'createdAt' | 'updatedAt' | 'attachments' | 'comments'>): Promise<Defect> => {
    const response = await api.post('/defects', data);
    return response.data as Defect;
  },

  update: async (id: string, data: Partial<Defect>): Promise<Defect> => {
    const response = await api.put(`/defects/${id}`, data);
    return response.data as Defect;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/defects/${id}`);
  },

  addComment: async (defectId: string, content: string): Promise<Comment> => {
    const response = await api.post(`/defects/${defectId}/comments`, { content });
    return response.data as Comment;
  },

  uploadAttachment: async (defectId: string, file: File): Promise<Attachment> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/defects/${defectId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data as Attachment;
  },
};

export const reportService = {
  getDefectReport: async (filters?: any): Promise<ReportData> => {
    const response = await api.get('/reports/defects', { params: filters });
    return response.data as ReportData;
  },

  exportToCSV: async (filters?: any): Promise<Blob> => {
    const response = await api.get('/reports/export/csv', {
      params: filters,
      responseType: 'blob',
    });
    return response.data as Blob;
  },

  exportToExcel: async (filters?: any): Promise<Blob> => {
    const response = await api.get('/reports/export/excel', {
      params: filters,
      responseType: 'blob',
    });
    return response.data as Blob;
  },
};

export default api;