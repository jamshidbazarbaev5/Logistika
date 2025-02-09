export interface Transport {
    transport_type: string;
  }
  
  export interface Firm {
    INN: string;
    firm_name: string;
    phoneNumber_firm: string;
    full_name_director: string;
    phoneNumber_director: string;
    firm_trustee: string;
    phoneNumber_trustee: string;
  }
  
  export interface Storage {
    storage_name: string;
    storage_location: string;
  }
  
  export interface Mode {
    mode_id: number;
    name_mode: string;
    code_mode: string;
  }
  
  export interface Measurement {
    name: string;
  }
  
  export interface PaymentMethod {
    payment_method: string;
  }


  export interface TabPanelProps {
    onSuccess?: () => void;
    formData: any;
    setFormData: (data: any) => void;
  }
  
  export interface ApplicationFormData {
    firm_id: number;
    brutto: number | null;
    netto: number | null;
    coming_date: string;
    decloration_file: File | null;
    decloration_date: string;
    decloration_number: string;
    vip_application: boolean | null;
    total_price: number | null;
    discount_price: number | null;
    keeping_days: number | null;
    workers_hours: number | null;
    unloading_quantity: number | null;
    loading_quantity: number | null;
    payment_method: number;
    keeping_services: number[];
    working_services: number[];
    product_quantities: ProductQuantity[];
    transport_numbers: TransportNumber[];
    modes: Mode[];
  }
  
  export interface ProductQuantity {
    quantity: number;
    product_id: number;
    storage_id: number;
  }
  
  export interface TransportNumber {
    transport_number: string;
    transport_type: number;
  }