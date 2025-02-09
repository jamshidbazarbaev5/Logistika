import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/api";
import SuccessModal from "../components/SuccessModal";
import CreateFirmModal from "../components/CreateFirmModal";
import { Tab } from '@headlessui/react';
import { classNames } from '../../utils/classNames'
import { useNavigate } from "react-router-dom";
import { createContext, useContext } from 'react';

interface ApplicationFormData {
  firm_id: number;
  brutto: number | null;
  netto: number | null;
  vip_application: boolean;
  total_price: number | null;
  discount_price: number | null;
  coming_date?: string;
  decloration_number?: string;
  decloration_date?: string;
  decloration_file?: File;
  payment_method?: number;
  keeping_services?: number[];
  working_services?: number[];
  upload_keeping_services_quantity: Array<{
    day: number;
    keeping_services_id: number;
  }>;
  upload_working_services_quantity: Array<{
    service_id: number;
    quantity: number;
  }>;
  upload_transport: Array<{
    transport_number: string;
    transport_type: number;
  }>;
  upload_modes: Array<{
    mode_id: number;
  }>;
  upload_products: Array<{
    quantity: number;
    product_id: number;
    storage_id: number;
  }>;
}

interface Firm {
  id: number;
  firm_name: string;
  // ... other firm properties if needed
}

interface PaymentMethod {
  id: number;
  payment_method: string;
}

interface KeepingService {
  id: number;
  base_day: number;
  name: string;
  base_price: string;
  extra_price: string;
}

interface WorkingService {
  id: number;
  base_day: number;
  service_name: string;
  base_price: string;
  extra_price: string;
  units: string;
}

// interface ProductQuantity {
//   quantity: number;
//   product_id: number;
//   storage_id: number;
// }

// interface TransportNumber {
//   transport_number: string;
//   transport_type: number;
// }

interface Product {
  name: string;
  measurement_id: number;
  category_id: number;
}

interface TransportType {
  id: number;
  transport_type: string;
}

interface TabPanelProps {
    onSuccess?: () => void;
    onSubmit?: () => void;
    modeId?: number;
    setModeId?: (id: number) => void;
}

// interface KeepingServiceQuantity {
//   day: number;
//   keeping_services_id: number;
// }

// interface WorkingServiceQuantity {
//   quantity: number;
//   service_id: number;
// }

// interface TransportUpload {
//   transport_number: string;
//   transport_type: number;
// }

// interface ModeUpload {
//   mode_id: number;
// }

// interface ProductUpload {
//   quantity: number;
//   product_id: number;
//   storage_id: number;
// }

// First, create a context to share formData and setFormData
interface FormContextType {
  formData: ApplicationFormData;
  setFormData: React.Dispatch<React.SetStateAction<ApplicationFormData>>;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

// Create a hook to use the context
const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormContextProvider');
  }
  return context;
};

const PhotoReportTab: React.FC<TabPanelProps> = ({ onSuccess }) => {
  const [, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Photos
        </label>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-[#6C5DD3] file:text-white
            hover:file:bg-[#5b4eb3]
            file:cursor-pointer"
        />
      </div>

      <button
        onClick={onSuccess}
        className="w-full sm:w-auto px-6 py-2.5 bg-[#6C5DD3] text-white rounded-lg font-medium
          hover:bg-[#5b4eb3] transition-colors duration-200 ease-in-out shadow-sm"
      >
        Next
      </button>
    </div>
  );
};

const ProductsTab: React.FC<TabPanelProps> = ({  }) => {
  const { formData, setFormData } = useFormContext();
  const [quantity, setQuantity] = useState<number>(0);
  const [selectedProduct, setSelectedProduct] = useState<number>(0);
  const [selectedStorage, setSelectedStorage] = useState<number>(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [storages, setStorages] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, storagesRes] = await Promise.all([
          api.get('/items/product/'),
          api.get('/storage/')
        ]);
        
        console.log('Products:', productsRes.data.results);
        setProducts(productsRes.data.results);
        setStorages(storagesRes.data.results);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

 

  const handleAddProduct = () => {
    if (!quantity || !selectedProduct || !selectedStorage) return;

    const newProduct = {
      quantity,
      product_id: selectedProduct,
      storage_id: selectedStorage
    };

    console.log('Adding product to form state:', newProduct);
    setFormData(prev => {
      const newState = {
        ...prev,
        upload_products: [...prev.upload_products, newProduct]
      };
      console.log('New form state after adding product:', newState);
      return newState;
    });

    // Reset form fields
    setQuantity(0);
    setSelectedProduct(0);
    setSelectedStorage(0);
  };

  // Add function to remove product
  const handleRemoveProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      upload_products: prev.upload_products.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
            Product
          </label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
              px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 
              focus:ring-[#6C5DD3] bg-white dark:bg-gray-700 text-gray-900 
              dark:text-gray-100 transition-colors"
          >
            <option value={0}>Select Product</option>
            {products.map((product, index) => (
              <option key={`${product.name}-${index}`} value={index}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
            Storage
          </label>
          <select
            value={selectedStorage}
            onChange={(e) => setSelectedStorage(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
              px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 
              focus:ring-[#6C5DD3] bg-white dark:bg-gray-700 text-gray-900 
              dark:text-gray-100 transition-colors"
          >
            <option value={0}>Select Storage</option>
            {storages.map(storage => (
              <option key={storage.id} value={storage.id}>
                {storage.storage_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
            Quantity
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min="1"
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
              px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 
              focus:ring-[#6C5DD3] bg-white dark:bg-gray-700 text-gray-900 
              dark:text-gray-100 transition-colors"
          />
        </div>
      </div>

      <button
        onClick={handleAddProduct}
        disabled={!selectedProduct || !selectedStorage || !quantity}
        className="mt-6 w-full sm:w-auto px-6 py-2.5 bg-[#6C5DD3] text-white rounded-lg 
          font-medium hover:bg-[#5b4eb3] disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200 ease-in-out shadow-sm"
      >
        Next
      </button>

      {/* Display selected products */}
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Products:</h3>
        <div className="space-y-2">
          {formData.upload_products.map((product, index) => (
            <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
              <span>
                Product: {product.product_id}, Quantity: {product.quantity}, 
                Storage: {product.storage_id}
              </span>
              <button
                onClick={() => handleRemoveProduct(index)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TransportTab: React.FC<TabPanelProps> = ({ onSuccess }) => {
  const { setFormData } = useFormContext();
  const [transportNumber, setTransportNumber] = useState('');
  const [transportTypeId, setTransportTypeId] = useState<number>(0);
  const [transportTypes, setTransportTypes] = useState<TransportType[]>([]);

  useEffect(() => {
    const fetchTransportTypes = async () => {
      try {
        const response = await api.get('/transport/type/');
        setTransportTypes(response.data.results);
      } catch (error) {
        console.error('Error fetching transport types:', error);
      }
    };
    fetchTransportTypes();
  }, []);

  const handleAddTransport = () => {
    if (!transportNumber || !transportTypeId) return;

    const newTransport = {
      transport_number: transportNumber,
      transport_type: transportTypeId
    };

    setFormData(prev => ({
      ...prev,
      upload_transport: [...prev.upload_transport, newTransport]
    }));
    
    console.log('Added transport:', newTransport);

    // Reset form
    setTransportNumber('');
    setTransportTypeId(0);
    
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Transport Type</label>
          <select
            value={transportTypeId}
            onChange={(e) => setTransportTypeId(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#6C5DD3] focus:ring-[#6C5DD3]"
          >
            <option value={0}>Select Transport Type</option>
            {transportTypes?.map(type => (
              <option key={type.id} value={type.id}>{type.transport_type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Transport Number</label>
          <input
            type="text"
            value={transportNumber}
            onChange={(e) => setTransportNumber(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#6C5DD3] focus:ring-[#6C5DD3]"
          />
        </div>
      </div>

      <button
        onClick={handleAddTransport}
        disabled={!transportNumber || !transportTypeId}
        className="mt-4 px-4 py-2 bg-[#6C5DD3] text-white rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
};

const ServicesTab: React.FC<TabPanelProps> = ({ onSuccess }) => {
  const { formData, setFormData } = useFormContext();
  const [keepingServices, setKeepingServices] = useState<KeepingService[]>([]);
  const [workingServices, setWorkingServices] = useState<WorkingService[]>([]);
  const [keepingServicesOpen, setKeepingServicesOpen] = useState(false);
  const [workingServicesOpen, setWorkingServicesOpen] = useState(false);
  const keepingServicesRef = useRef<HTMLDivElement>(null);
  const workingServicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const [keepingRes, workingRes] = await Promise.all([
          api.get('/keeping_service/keeping_service/'),
          api.get('/working_service/')
        ]);
        setKeepingServices(keepingRes.data.results);
        setWorkingServices(workingRes.data.results);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    };
    fetchServices();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (keepingServicesRef.current && !keepingServicesRef.current.contains(event.target as Node)) {
        setKeepingServicesOpen(false);
      }
      if (workingServicesRef.current && !workingServicesRef.current.contains(event.target as Node)) {
        setWorkingServicesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeepingServiceChange = (serviceId: number, days: number) => {
    setFormData(prev => ({
      ...prev,
      upload_keeping_services_quantity: [
        ...prev.upload_keeping_services_quantity.filter(
          item => item.keeping_services_id !== serviceId
        ),
        {
          keeping_services_id: serviceId,
          day: days
        }
      ]
    }));
  };

  const handleWorkingServiceChange = (serviceId: number, quantity: number) => {
    if (quantity > 0) {
      setFormData(prev => ({
        ...prev,
        upload_working_services_quantity: [
          ...prev.upload_working_services_quantity.filter(
            item => item.service_id !== serviceId
          ),
          {
            service_id: serviceId,
            quantity: quantity
          }
        ]
      }));
    } else {
      handleRemoveWorkingService(serviceId);
    }
  };

  // New remove handlers
  const handleRemoveKeepingService = (serviceId: number) => {
    setFormData(prev => ({
      ...prev,
      upload_keeping_services_quantity: prev.upload_keeping_services_quantity.filter(
        item => item.keeping_services_id !== serviceId
      )
    }));
  };

  const handleRemoveWorkingService = (serviceId: number) => {
    setFormData(prev => ({
      ...prev,
      upload_working_services_quantity: prev.upload_working_services_quantity.filter(
        item => item.service_id !== serviceId
      )
    }));
  };

  const getSelectedKeepingService = (serviceId: number) => {
    return formData.upload_keeping_services_quantity.find(
      item => item.keeping_services_id === serviceId
    )?.day || 0;
  };

  const getSelectedWorkingService = (serviceId: number) => {
    const service = formData.upload_working_services_quantity.find(
      item => item.service_id === serviceId
    );
    return service?.quantity || 0;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="space-y-8">
        {/* Keeping Services Dropdown */}
        <div ref={keepingServicesRef} className="relative">
          <button
            onClick={() => setKeepingServicesOpen(!keepingServicesOpen)}
            className="w-full flex justify-between items-center px-6 py-4 border-2 border-gray-100 
              rounded-xl bg-white hover:bg-gray-50 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg font-medium text-gray-700">Storage Services</span>
              {formData.upload_keeping_services_quantity.length > 0 && (
                <span className="bg-[#6C5DD3] text-white px-2.5 py-1 rounded-full text-sm">
                  {formData.upload_keeping_services_quantity.length}
                </span>
              )}
            </div>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform duration-200 
                ${keepingServicesOpen ? 'transform rotate-180' : ''} 
                group-hover:text-[#6C5DD3]`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {keepingServicesOpen && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg 
              divide-y divide-gray-100 transform transition-all duration-200 ease-out">
              {keepingServices.map(service => (
                <div key={service.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{service.name}</h4>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <span>Base: {service.base_price}</span>
                        <span>•</span>
                        <span>Extra: {service.extra_price}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <label className="text-sm font-medium text-gray-700">Days:</label>
                      <input
                        type="number"
                        min="0"
                        value={getSelectedKeepingService(service.id)}
                        onChange={(e) => handleKeepingServiceChange(service.id, parseInt(e.target.value) || 0)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm
                          focus:ring-2 focus:ring-[#6C5DD3] focus:border-[#6C5DD3] outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Working Services Dropdown */}
        <div ref={workingServicesRef} className="relative">
          <button
            onClick={() => setWorkingServicesOpen(!workingServicesOpen)}
            className="w-full flex justify-between items-center px-6 py-4 border-2 border-gray-100 
              rounded-xl bg-white hover:bg-gray-50 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg font-medium text-gray-700">Labor Services</span>
              {formData.upload_working_services_quantity.length > 0 && (
                <span className="bg-[#6C5DD3] text-white px-2.5 py-1 rounded-full text-sm">
                  {formData.upload_working_services_quantity.length}
                </span>
              )}
            </div>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform duration-200 
                ${workingServicesOpen ? 'transform rotate-180' : ''} 
                group-hover:text-[#6C5DD3]`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {workingServicesOpen && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-lg 
              divide-y divide-gray-100 transform transition-all duration-200 ease-out">
              {workingServices.map(service => (
                <div key={service.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{service.service_name}</h4>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                        <span>Base: {service.base_price}</span>
                        <span>•</span>
                        <span>Extra: {service.extra_price}</span>
                        <span>•</span>
                        <span>Units: {service.units}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <label className="text-sm font-medium text-gray-700">Quantity:</label>
                      <input
                        type="number"
                        min="0"
                        value={getSelectedWorkingService(service.id)}
                        onChange={(e) => handleWorkingServiceChange(service.id, parseInt(e.target.value) || 0)}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm
                          focus:ring-2 focus:ring-[#6C5DD3] focus:border-[#6C5DD3] outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Services Summary */}
        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-medium text-gray-900 border-b pb-3">Selected Services</h3>
          
          {/* Selected Keeping Services */}
          {formData.upload_keeping_services_quantity.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700 text-sm uppercase tracking-wider">Storage Services</h4>
              <div className="grid gap-3">
                {formData.upload_keeping_services_quantity.map((item) => {
                  const service = keepingServices.find(s => s.id === item.keeping_services_id);
                  return (
                    <div key={item.keeping_services_id} 
                      className="flex justify-between items-center bg-gray-50 p-4 rounded-xl
                        border border-gray-100 hover:border-gray-200 transition-colors duration-200"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{service?.name}</span>
                        <div className="mt-1 flex items-center space-x-3 text-sm text-gray-500">
                          <span>{item.day} days</span>
                          <span>•</span>
                          <span>Base: {service?.base_price}</span>
                          <span>•</span>
                          <span>Extra: {service?.extra_price}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveKeepingService(item.keeping_services_id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 
                          rounded-lg transition-colors duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Working Services */}
          {formData.upload_working_services_quantity.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700 text-sm uppercase tracking-wider">Labor Services</h4>
              <div className="grid gap-3">
                {formData.upload_working_services_quantity.map((item) => {
                  const service = workingServices.find(s => s.id === item.service_id);
                  return (
                    <div key={item.service_id} 
                      className="flex justify-between items-center bg-gray-50 p-4 rounded-xl
                        border border-gray-100 hover:border-gray-200 transition-colors duration-200"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{service?.service_name}</span>
                        <div className="mt-1 flex items-center space-x-3 text-sm text-gray-500">
                          <span>{item.quantity} {service?.units}</span>
                          <span>•</span>
                          <span>Base: {service?.base_price}</span>
                          <span>•</span>
                          <span>Extra: {service?.extra_price}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveWorkingService(item.service_id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 
                          rounded-lg transition-colors duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-6 border-t">
          <button
            onClick={onSuccess}
            className="px-6 py-2.5 bg-[#6C5DD3] text-white rounded-xl font-medium
              hover:bg-[#5b4eb3] transition-all duration-200 ease-in-out 
              shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
          >
            Continue to Next Step
          </button>
        </div>
      </div>
    </div>
  );
};

const ModesTab: React.FC<TabPanelProps> = ({  onSubmit }) => {
  const { formData, setFormData } = useFormContext();
  const [selectedMode, setSelectedMode] = useState<number>(0);
  const [modes, setModes] = useState<Array<{ id: number; name_mode: string }>>([]);

  useEffect(() => {
    const fetchModes = async () => {
      try {
        const response = await api.get('/modes/modes/');
        setModes(response.data.results);
      } catch (error) {
        console.error('Error fetching modes:', error);
      }
    };
    fetchModes();
  }, []);

  const handleModeSelect = (selectedModeId: number) => {
    if (!selectedModeId) return;
    
    // Check if mode is already selected
    const isAlreadySelected = formData.upload_modes.some(
      mode => mode.mode_id === selectedModeId
    );

    if (!isAlreadySelected) {
      const newMode = { mode_id: selectedModeId };
      
      setFormData(prev => ({
        ...prev,
        upload_modes: [...prev.upload_modes, newMode]
      }));
      
      console.log('Added mode:', selectedModeId);
    }
    
    setSelectedMode(0); // Reset selection
  };

  // Add function to remove mode
  const handleRemoveMode = (modeId: number) => {
    setFormData(prev => ({
      ...prev,
      upload_modes: prev.upload_modes.filter(mode => mode.mode_id !== modeId)
    }));
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="max-w-md">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
          <select
            value={selectedMode}
            onChange={(e) => handleModeSelect(Number(e.target.value))}
            className="block w-full rounded-lg border-gray-300 shadow-sm"
          >
            <option value={0}>Select Mode</option>
            {modes.map(mode => (
              <option key={mode.id} value={mode.id}>
                {mode.name_mode}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={onSubmit}
          className="mt-4 w-full px-6 py-2.5 bg-green-600 text-white rounded-lg font-medium
            hover:bg-green-700 transition-colors duration-200 ease-in-out shadow-sm"
        >
          Create Application
        </button>

        {/* Display selected modes */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Modes:</h3>
          <div className="space-y-2">
            {formData.upload_modes.map((mode, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <span>{modes.find(m => m.id === mode.mode_id)?.name_mode}</span>
                <button
                  onClick={() => handleRemoveMode(mode.mode_id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CreateApplication() {
  const { t } = useTranslation();
  const [firms, setFirms] = useState<Firm[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [, setKeepingServices] = useState<KeepingService[]>([]);
  const [, setWorkingServices] = useState<WorkingService[]>([]);
  const [, setProducts] = useState<Product[]>([]);
  const [, setStorages] = useState<any[]>([]);
  const [, setTransportTypes] = useState<TransportType[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [firmSearch, setFirmSearch] = useState("");
  const [showFirmDropdown, setShowFirmDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [paymentMethodSearch, setPaymentMethodSearch] = useState("");
  const [showPaymentMethodDropdown, setShowPaymentMethodDropdown] = useState(false);
  const paymentMethodDropdownRef = useRef<HTMLDivElement>(null);
  const [, setKeepingServicesOpen] = useState(false);
  const [, setWorkingServicesOpen] = useState(false);
  const keepingServicesRef = useRef<HTMLDivElement>(null);
  const workingServicesRef = useRef<HTMLDivElement>(null);
  const [showCreateFirmModal, setShowCreateFirmModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [, setApplicationId] = useState<number | null>(null);
  const navigate = useNavigate();
  const [modeId, setModeId] = useState<number>(0);
  const [selectedFiles] = useState<File[]>([]);

  // Format current date to YYYY-MM-DD
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState<ApplicationFormData>({
    firm_id: 0,
    brutto: null,
    netto: null,
    vip_application: false,
    total_price: null,
    discount_price: null,
    coming_date: getCurrentDate(),
    decloration_number: '',
    decloration_date: '',
    keeping_services: [],
    working_services: [],
    upload_keeping_services_quantity: [],
    upload_working_services_quantity: [],
    upload_transport: [],
    upload_modes: [],
    upload_products: [],
    // photo_report: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          firmsResponse, 
          paymentMethodsResponse,
          keepingServicesResponse,
          workingServicesResponse,
          productsResponse,
          storagesResponse,
          transportTypesResponse
        ] = await Promise.all([
          api.get('/firms/'),
          api.get('/payment_method/'),
          api.get('/keeping_service/'),
          api.get('/working_service/'),
          api.get('/items/product/'),
          api.get('/storage/'),
          api.get('/transport/type/')
        ]);
        
        setFirms(firmsResponse.data.results);
        setPaymentMethods(paymentMethodsResponse.data.results || []);
        setKeepingServices(keepingServicesResponse.data.results);
        setWorkingServices(workingServicesResponse.data.results);
        setProducts(productsResponse.data || []);
        setStorages(storagesResponse.data || []);
        setTransportTypes(transportTypesResponse.data || []);
        
        setFormData(prev => ({
          ...prev,
          firm_id: firmsResponse.data.results?.[0]?.id || null,
          payment_method: paymentMethodsResponse.data.results?.[0]?.id || null
        }));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (keepingServicesRef.current && 
          !keepingServicesRef.current.contains(event.target as Node)) {
        setKeepingServicesOpen(false);
      }
      if (workingServicesRef.current && 
          !workingServicesRef.current.contains(event.target as Node)) {
        setWorkingServicesOpen(false);
      }
      
      if (dropdownRef.current && 
          !dropdownRef.current.contains(event.target as Node)) {
        setShowFirmDropdown(false);
      }
      
      if (paymentMethodDropdownRef.current && 
          !paymentMethodDropdownRef.current.contains(event.target as Node)) {
        setShowPaymentMethodDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async () => {
    try {
      // Check if we have any files to upload
      const hasFiles = formData.decloration_file || selectedFiles.length > 0;

      if (hasFiles) {
        // Handle file upload separately if needed
        const formDataToSend = new FormData();
        if (formData.decloration_file) {
          formDataToSend.append('decloration_file', formData.decloration_file);
        }
        if (selectedFiles.length > 0) {
          selectedFiles.forEach(file => {
            formDataToSend.append('upload_photos', file);
          });
        }
        // Handle file upload logic here
      }

      // Prepare the JSON data
      const requestData = {
        firm_id: formData.firm_id,
        brutto: formData.brutto,
        netto: formData.netto,
        vip_application: formData.vip_application,
        total_price: formData.total_price,
        discount_price: formData.discount_price,
        coming_date: formData.coming_date,
        decloration_date: formData.decloration_date,
        decloration_number: formData.decloration_number,
        keeping_services: formData.upload_keeping_services_quantity.map(item => ({
          day: item.day,
          keeping_services_id: item.keeping_services_id
        })),
        working_services: formData.upload_working_services_quantity.map(item => ({
          quantity: item.quantity,
          service_id: item.service_id
        })),
        upload_keeping_services_quantity: formData.upload_keeping_services_quantity,
        upload_working_services_quantity: formData.upload_working_services_quantity,
        upload_transport: formData.upload_transport,
        upload_modes: formData.upload_modes,
        upload_products: formData.upload_products,
      };

      console.log('Sending data:', requestData);

      const response = await api.post('/application/', requestData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Response:', response.data);
      setApplicationId(response.data.id);
      setShowSuccessModal(true);
      navigate('/application-list');
    } catch (error: any) {
      console.error('Error submitting application:', error);
      if (error.response) {
        console.error('Server error details:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
    }
  };
  

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setSelectedTab(3); // Move to Photos tab after closing the modal
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'file' && 'files' in e.target && e.target.files ) {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).files![0]
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? null : Number(value)
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const filteredFirms = firms.filter(firm =>
    firm.firm_name.toLowerCase().includes(firmSearch.toLowerCase())
  );

  const handleFirmSelect = (firm: Firm) => {
    console.log('Selected firm:', firm);
    setFormData(prev => {
      const updated = {
        ...prev,
        firm_id: firm.id
      };
      console.log('Updated form data:', updated);
      return updated;
    });
    setFirmSearch(firm.firm_name);
    setShowFirmDropdown(false);
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setFormData(prev => ({ ...prev, payment_method: method.id }));
    setPaymentMethodSearch(method.payment_method);
    setShowPaymentMethodDropdown(false);
  };

  const filteredPaymentMethods = paymentMethods.filter(method =>
    method.payment_method.toLowerCase().includes(paymentMethodSearch.toLowerCase())
  );

  const handleFirmCreated = (newFirm: { id: number; firm_name: string }) => {
    setFirms(prevFirms => [...prevFirms, newFirm]);
    setFormData(prev => ({ ...prev, firm_id: newFirm.id }));
    setFirmSearch(newFirm.firm_name);
  };

  const handleTabSuccess = () => {
    if (selectedTab === 7) {
      navigate('/application-list');
    } else {
      setSelectedTab(prev => prev + 1);
    }
  };

  // Update the common input class styles
  const inputClassName = "mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3] bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        decloration_file: e.target.files![0]
      }));
    }
  };

  const handleTabChange = (index: number) => {
    // Remove the condition that prevents going back to tabs 0-2
    setSelectedTab(index);
  };

  return (
    <FormContext.Provider value={{ formData, setFormData }}>
      <div className="p-4 sm:p-6">
        <Tab.Group selectedIndex={selectedTab} onChange={handleTabChange}>
          <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1">
            <Tab
              className={({ selected }) =>
                classNames(
                  'whitespace-nowrap rounded-lg py-2.5 px-4 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                  selected
                    ? 'bg-white text-[#6C5DD3] shadow'
                    : 'text-gray-500 hover:bg-white/[0.12] hover:text-[#6C5DD3]'
                )
              }
            >
              {t('createApplication.basicInfo', 'Basic Info')}
            </Tab>

            <Tab
              className={({ selected }) =>
                classNames(
                  'whitespace-nowrap rounded-lg py-2.5 px-4 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                  selected
                    ? 'bg-white text-[#6C5DD3] shadow'
                    : 'text-gray-500 hover:bg-white/[0.12] hover:text-[#6C5DD3]'
                )
              }
            >

              {t('createApplication.declaration', 'Declaration')}
            </Tab>

            <Tab
              className={({ selected }) =>
                classNames(
                  'whitespace-nowrap rounded-lg py-2.5 px-4 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                  selected
                    ? 'bg-white text-[#6C5DD3] shadow'
                    : 'text-gray-500 hover:bg-white/[0.12] hover:text-[#6C5DD3]'
                )
              }
            >
              {t('createApplication.services', 'Services')}
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'whitespace-nowrap rounded-lg py-2.5 px-4 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                  selected
                    ? 'bg-white text-[#6C5DD3] shadow'
                    : 'text-gray-500 hover:bg-white/[0.12] hover:text-[#6C5DD3]'
                )
              }
            >
              {t('createApplication.photos', 'Photos')}
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'whitespace-nowrap rounded-lg py-2.5 px-4 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                  selected
                    ? 'bg-white text-[#6C5DD3] shadow'
                    : 'text-gray-500 hover:bg-white/[0.12] hover:text-[#6C5DD3]'
                )
              }
            >
              {t('createApplication.products', 'Products')}
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'whitespace-nowrap rounded-lg py-2.5 px-4 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                  selected
                    ? 'bg-white text-[#6C5DD3] shadow'
                    : 'text-gray-500 hover:bg-white/[0.12] hover:text-[#6C5DD3]'
                )
              }
            >
              {t('createApplication.transport', 'Transport')}
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'whitespace-nowrap rounded-lg py-2.5 px-4 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                  selected
                    ? 'bg-white text-[#6C5DD3] shadow'
                    : 'text-gray-500 hover:bg-white/[0.12] hover:text-[#6C5DD3]'
                )
              }
            >
              {t('createApplication.modes', 'Modes')}
            </Tab>
          </Tab.List>

          <Tab.Panels>
            <Tab.Panel>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="brutto" className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
                      {t('createApplication.brutto', 'Brutto')}
                    </label>
                    <input
                      type="number"
                      name="brutto"
                      id="brutto"
                      value={formData.brutto || ''}
                      onChange={handleChange}
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label htmlFor="netto" className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
                      {t('createApplication.netto', 'Netto')}
                    </label>
                    <input
                      type="number"
                      name="netto"
                      id="netto"
                      value={formData.netto || ''}
                      onChange={handleChange}
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label htmlFor="coming_date" className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
                      {t('createApplication.comingDate', 'Coming Date')}
                    </label>
                    <input
                      type="date"
                      name="coming_date"
                      id="coming_date"
                      value={formData.coming_date}
                      onChange={handleChange}
                      className={inputClassName}
                    />
                  </div>

                  <div className="relative" ref={dropdownRef}>
                    <label htmlFor="firm_search" className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
                      {t('createApplication.firmId', 'Firm')}
                    </label>
                    <input
                      type="text"
                      id="firm_search"
                      value={firmSearch}
                      onChange={(e) => {
                        setFirmSearch(e.target.value);
                        setShowFirmDropdown(true);
                      }}
                      onFocus={() => setShowFirmDropdown(true)}
                      className={inputClassName}
                      placeholder={t('createApplication.searchFirm', 'Search for a firm...')}
                    />
                    
                    {showFirmDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
                        {filteredFirms.length > 0 ? (
                          filteredFirms.map((firm) => (
                            <div
                              key={firm.id}
                              onClick={() => handleFirmSelect(firm)}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            >
                              {firm.firm_name}
                            </div>
                          ))
                        ) : (
                          <div className="p-4">
                            <p className="text-sm text-gray-500 mb-2">
                              {t('createApplication.noFirmsFound', 'No firms found')}
                            </p>
                            <button
                              onClick={() => setShowCreateFirmModal(true)}
                              className="w-full text-center bg-[#6C5DD3] text-white px-4 py-2 text-sm rounded-lg 
                              hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]"
                            >
                              {t('createApplication.createNewFirm', 'Create New Firm')}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="relative" ref={paymentMethodDropdownRef}>
                    <label htmlFor="payment_method_search" className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
                      {t('createApplication.paymentMethod', 'Payment Method')}
                    </label>
                    <input
                      type="text"
                      id="payment_method_search"
                      value={paymentMethodSearch}
                      onChange={(e) => {
                        setPaymentMethodSearch(e.target.value);
                        setShowPaymentMethodDropdown(true);
                      }}
                      onFocus={() => setShowPaymentMethodDropdown(true)}
                      className={inputClassName}
                      placeholder={t('createApplication.searchPaymentMethod', 'Search for a payment method...')}
                    />
                    
                    {showPaymentMethodDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
                        {filteredPaymentMethods.length > 0 ? (
                          filteredPaymentMethods.map((method) => (
                            <div
                              key={method.id}
                              onClick={() => handlePaymentMethodSelect(method)}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            >
                              {method.payment_method}
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-sm text-gray-500">
                            {t('createApplication.noPaymentMethodsFound', 'No payment methods found')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedTab(1)}
                  className="bg-[#6C5DD3] text-white px-6 py-2 rounded-lg hover:bg-[#5b4eb3]"
                >
                  Next
                </button>
              </div>
            </Tab.Panel>

            <Tab.Panel>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="decloration_number" className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
                      {t('createApplication.declaration.number', 'Declaration Number')}
                    </label>
                    <input
                      type="text"
                      name="decloration_number"
                      id="decloration_number"
                      value={formData.decloration_number}
                      onChange={handleChange}
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label htmlFor="decloration_date" className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
                      {t('createApplication.declaration.date', 'Declaration Date')}
                    </label>
                    <input
                      type="date"
                      name="decloration_date"
                      id="decloration_date"
                      value={formData.decloration_date}
                      onChange={handleChange}
                      className={inputClassName}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="decloration_file" className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
                      {t('createApplication.declaration.file', 'Declaration File')}
                    </label>
                    <input
                      type="file"
                      name="decloration_file"
                      id="decloration_file"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-[#6C5DD3] file:text-white
                        hover:file:bg-[#5b4eb3]
                        file:cursor-pointer"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedTab(2)}
                    className="bg-[#6C5DD3] text-white px-6 py-2 rounded-lg hover:bg-[#5b4eb3]"
                  >
                    Next
                  </button>
                </div>
              </div>
            </Tab.Panel>

            <Tab.Panel>
              <ServicesTab onSuccess={() => setSelectedTab(3)} />
            </Tab.Panel>

            <Tab.Panel>
              <PhotoReportTab onSuccess={() => setSelectedTab(4)} />
            </Tab.Panel>

            <Tab.Panel>
              <ProductsTab onSuccess={() => setSelectedTab(5)} />
            </Tab.Panel>

            <Tab.Panel>
              <TransportTab onSuccess={() => setSelectedTab(6)} />
            </Tab.Panel>

            <Tab.Panel>
              <ModesTab 
                onSuccess={handleTabSuccess} 
                onSubmit={handleSubmit}
                modeId={modeId}
                setModeId={setModeId}
              />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>

        <SuccessModal
          isOpen={showSuccessModal}
          onClose={handleSuccessModalClose}
          message={t('createApplication.successMessage', 'Application created successfully!')}
        />

        <CreateFirmModal
          isOpen={showCreateFirmModal}
          onClose={() => setShowCreateFirmModal(false)}
          onFirmCreated={handleFirmCreated}
        />
      </div>
    </FormContext.Provider>
  );
} 