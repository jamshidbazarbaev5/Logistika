import { createContext, useContext } from 'react';

export interface ApplicationMode {
  id?: number;
  mode_id: number;
  application_id?: number;
}

export interface KeepingService {
  id?: number;
  day: number;
  keeping_services_id: number;
  application_id?: number;
}

export interface WorkingService {
  id?: number;
  quantity: number;
  service_id: number;
  application_id?: number;
}

export interface PhotoReport {
  id?: number;
  photo: string | File;
  application_id?: number;
}

export interface Transport {
  id?: number;
  transport_number: string;
  transport_type: number;
  application_id?: number;
}

export interface Product {
  id?: number;
  quantity: number;
  product_id: number;
  storage_id: number;
  application_id?: number;
}

export interface ApplicationFormData {
  id?: number;
  firm_id: number;
  brutto: number | null;
  netto: number | null;
  coming_date: string;
  decloration_file?: string | File;
  decloration_date: string;
  decloration_number: string;
  vip_application: boolean;
  total_price: number | null;
  discount_price: number | null;
  keeping_days: number;
  workers_hours: number;
  unloading_quantity: number;
  loading_quantity: number;
  payment_method: number;
  keeping_services: KeepingService[];
  working_services: WorkingService[];
  photo_report: PhotoReport[];
  transport: Transport[];
  modes: ApplicationMode[];
  products: Product[];
}

interface FormContextType {
  formData: ApplicationFormData;
  setFormData: React.Dispatch<React.SetStateAction<ApplicationFormData>>;
}

export const FormContext = createContext<FormContextType>({
  formData: {} as ApplicationFormData,
  setFormData: () => {},
});

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormContextProvider');
  }
  return context;
};