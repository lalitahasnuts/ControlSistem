// src/services/axiosInstance.ts
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://example.com/api/', // твой API endpoint
  timeout: 5000,                     // таймаут ожидания ответа
});

export default instance;