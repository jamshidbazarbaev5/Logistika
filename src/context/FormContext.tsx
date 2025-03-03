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
  status: 'active' | 'unpaid' | 'completed';
  number_of_application: string;
  brutto: number | null;
  netto: number | null;
  coming_date: string;
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
  keeping_services: Array<{
    id?: number;
    amount: number;
    service_type_id: number;
    application_id?: number;
  }>;
  working_services: Array<{
    id?: number;
    quantity: number;
    service_id: number;
    application_id?: number;
  }>;
  upload_keeping_services_quantity: Array<{
    amount: number;
    service_type_id: number;
  }>;
  upload_working_services_quantity: Array<{
    service_id: number;
    quantity: number;
  }>;
  photo_report: Array<{
    id?: number;
    photo: string | File;
    application_id?: number;
  }>;
  transport: Array<{
    id?: number;
    transport_number: string;
    transport_type: number;
    application_id?: number;
  }>;
  modes: Array<{
    id?: number;
    mode_id: number;
    application_id?: number;
  }>;
  products: Array<{
    quantity: number;
    product_id: number;
    storage_id: number;
    product_name?: string;
    storage_name?: string;
    id?: number;
  }>;
  upload_products: Array<{
    quantity: number;
    product_id: number;
    storage_id: number;
  }>;
  decloration_file?: File;
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