import { LoginCredentials, RegisterData, ApiResponse, User } from '../types';
import { axiosInstance } from './axiosInstance';

interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  login: async (email: string, password: string): Promise<ApiResponse<LoginResponse>> => {
    try {
      const credentials: LoginCredentials = { email, password };
      console.log('Sending login request:', credentials);
      
      const response = await axiosInstance.post<ApiResponse<LoginResponse>>(
        '/auth/login', 
        credentials
      );
      
      console.log('Login response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Login service error:', error);
      throw error;
    }
  },

  signup: async (userData: RegisterData): Promise<ApiResponse<LoginResponse>> => {
    try {
      console.log('Sending signup request:', userData);
      
      const response = await axiosInstance.post<ApiResponse<LoginResponse>>(
        '/auth/register', 
        userData
      );
      
      console.log('Full signup response:', response);
      console.log('Signup response data:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Signup service error:', error);
      console.error('Error response:', error.response);
      throw error;
    }
  },

  setAuthToken: (token: string | null) => {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }
};