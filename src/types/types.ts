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
    name_mode: string;
    code_mode: string;
  }
  
  export interface Measurement {
    name: string;
  }
  
  export interface PaymentMethod {
    payment_method: string;
  }