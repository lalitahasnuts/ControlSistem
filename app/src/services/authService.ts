// authService.ts
import axios from './axiosInstance';

async function login(email: string, password: string) {
  return axios.post('/auth/login', { email, password }).then(response => response.data);
}

async function register(name: string, email: string, password: string) {
  return axios.post('/auth/register', { name, email, password }).then(response => response.data);
}

async function checkToken() {
  return axios.get('/auth/check').then(response => response.data);
}

export { login, register, checkToken };