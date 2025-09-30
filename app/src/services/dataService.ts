// dataService.ts
import axios from './axiosInstance';

async function fetchProjects() {
  return axios.get('/projects').then(response => response.data);
}

async function fetchDefects(projectId: number) {
  return axios.get(`/projects/${projectId}/defects`).then(response => response.data);
}

async function submitReport(report: any) {
  return axios.post('/reports', report).then(response => response.data);
}

export { fetchProjects, fetchDefects, submitReport };