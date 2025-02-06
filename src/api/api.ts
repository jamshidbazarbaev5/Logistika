import axios from 'axios';
import { Measurement, PaymentMethod } from '../types/types';
import { authService } from '../services/auth';

const BASE_URL = 'https://cargo-calc.uz/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
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
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
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
  service_name: string;
  base_day: number;
  base_price: string;
  extra_price: string;
  units: string;
}

interface Firm {
  id: number;
  INN: string;
  firm_name: string;
  phoneNumber_firm: string;
  full_name_director: string;
  phoneNumber_director: string;
  firm_trustee: string;
  phoneNumber_trustee: string;
}

export const apiService = {
  // Transport  
  createTransport: (data: { 
    transport_type: number; 
    transport_number: string;
    application_id: number;
  }) => 
    api.post('/transport/number/', data),
  
  // Firms
  createFirm: (data: Omit<Firm, 'id'>) => 
    api.post('/firms/', data),
  
  // Storage
  createStorage: (data: Storage) => 
    api.post('/storage/', data),
  
  createMode: async (data: { name_mode: string; code_mode: string }) => {
    return api.post('/modes/modes/', data);
  },
  
  getApplications: () => {
    return api.get('/application/');
  },
  
  uploadPhotoReport: async (formData: FormData) => {
    return api.post('/photo_report/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
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
  
  getTransportTypes: () => 
    api.get('/transport/type/').then(response => response.data),
  
  getTransportNumbers: () => 
    api.get('/transport/number/').then(response => response.data),

  // Add these new methods
  getCategories: () => 
    api.get('/items/category/').then(response => response.data),
  
  getMeasurements: () => 
    api.get('/items/measurement/').then(response => response.data),

  getFirms: () => 
    api.get('/firms/').then(response => response.data),

  getKeepingServices: () => 
    api.get('/keeping_service/').then(response => response.data),
  
  getWorkingServices: () => 
    api.get('/working_service/').then(response => response.data),

  // Add this new method
  createTransportType: (data: { transport_type: string }) => 
    api.post('/transport/type/', data),
};

export type { Storage, KeepingService, WorkingService, Firm };