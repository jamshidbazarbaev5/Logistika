import axios from 'axios';
import { Firm, Measurement, Mode, PaymentMethod, Transport } from '../types/types';

const BASE_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
});

export const apiService = {
  // Transport
  createTransport: (data: Transport) => 
    api.post('/transport/', data),
  
  // Firms
  createFirm: (data: Firm) => 
    api.post('/firms/', data),
  
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
};