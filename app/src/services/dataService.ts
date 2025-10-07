// Используйте именованный импорт вместо default
import { axiosInstance } from './axiosInstance';

// Добавьте типизацию для параметров
async function fetchProjects() {
  return axiosInstance.get('/projects').then((response: any) => response.data);
}

async function fetchDefects(projectId: number) {
  return axiosInstance.get(`/projects/${projectId}/defects`).then((response: any) => response.data);
}

async function submitReport(report: any) {
  return axiosInstance.post('/reports', report).then((response: any) => response.data);
}

export { fetchProjects, fetchDefects, submitReport };