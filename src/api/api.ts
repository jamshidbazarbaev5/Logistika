import axios from 'axios';
import { Firm, Measurement, Mode, PaymentMethod, Transport } from '../types/types';
import { authService } from '../services/auth';

const BASE_URL = 'http://147.45.109.126/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Don't override Content-Type if it's multipart/form-data
    if (!config.headers['Content-Type'] && !(config.data instanceof FormData)) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await authService.refreshToken();
        if (newToken) {
          // Update the authorization header
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

interface Storage {
  storage_name: string;
  storage_location: string;
}

interface KeepingService {
  base_day: number;
  name: string;
  base_price: string;
  extra_price: string;
}

interface WorkingService {
  name: string;
  price: string;
  base_day: number;
  base_price: string;
  extra_price: string;
  units: string;
  
}

export const apiService = {
  // Transport  
  createTransport: (data: Transport) => 
    api.post('/transport/', data),
  
  // Firms
  createFirm: (data: Firm) => 
    api.post('/firms/', data),
  
  // Storage
  createStorage: (data: Storage) => 
    api.post('/storage/storage/', data),
  
  // Modes
  createMode: (data: Mode) => 
    api.post('/modes/', data),
  
  // Photo Report
  uploadPhotoReport: (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    return api.post('/photo_report/', formData);
  },
  
  // Measurement
  createMeasurement: (data: Measurement) => 
    api.post('/measurement/', data),
  
  // Payment Method
  createPaymentMethod: (data: PaymentMethod) => 
    api.post('/payment_method/', data),
  
  // Keeping Service
  createKeepingService: (data: KeepingService) => 
    api.post('/keeping_service/', data),

  // Working Service
  createWorkingService: (data: WorkingService) => 
    api.post('/working_service/', data),
};

export type { Storage, KeepingService, WorkingService };