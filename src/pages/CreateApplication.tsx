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
  upload_photos?: File[];
}

interface Firm {
  id: number;
  firm_name: string}

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

interface Product {
  id: number;
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
    setSelectedTab?: (index: number) => void;
}

interface FormContextType {
  formData: ApplicationFormData;
  setFormData: React.Dispatch<React.SetStateAction<ApplicationFormData>>;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormContextProvider');
  }
  return context;
};

const PhotoReportTab: React.FC<TabPanelProps> = ({ onSuccess, setSelectedTab }) => {
  const { formData, setFormData } = useFormContext();
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const {t} = useTranslation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData.firm_id) {
      setError('Please select a firm in the Basic Info tab first');
      return;
    }

    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        upload_photos: [...(prev.upload_photos || []), ...newFiles]
      }));
      
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
      
      setError(null);
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      upload_photos: (prev.upload_photos || []).filter((_, i) => i !== index)
    }));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (!formData.firm_id) {
      setError('Please select a firm in the Basic Info tab first');
      return;
    }
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleGoToBasicInfo = () => {
    if (setSelectedTab) {
      setSelectedTab(0);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
      {!formData.firm_id ? (
        <div className="text-center p-6">
          <div className="text-red-600 mb-4">
            Please select a firm in the Basic Info tab first
          </div>
          <button
            onClick={handleGoToBasicInfo}
            className="px-6 py-2.5 bg-[#6C5DD3] text-white rounded-lg font-medium
              hover:bg-[#5b4eb3] transition-colors duration-200 ease-in-out shadow-sm"
          >
            Go to Basic Info
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Photos
            </label>
            
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col w-full h-32 border-2 border-dashed border-gray-300 rounded-lg 
                cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-7">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="pt-1 text-sm tracking-wider text-gray-400">
                    Select photos
                  </p>
                </div>
                <input 
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="opacity-0"
                />
              </label>
            </div>

            {error && (
              <div className="mt-2 text-sm text-red-600">
                {error}
              </div>
            )}

            {previews.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Selected Photos ({previews.length})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-200
                          hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-6 pt-6 border-t">
            <button
              onClick={handleNext}
              className="px-6 py-2.5 bg-[#6C5DD3] text-white rounded-lg font-medium
                hover:bg-[#5b4eb3] transition-colors duration-200 ease-in-out shadow-sm"
            >
              {t('createApplication.next')}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const ProductsTab: React.FC<TabPanelProps> = ({ onSuccess }) => {
  const { formData, setFormData } = useFormContext();
  const [quantity, setQuantity] = useState<number>(0);
  const [selectedProduct, setSelectedProduct] = useState<number>(0);
  const [selectedStorage, setSelectedStorage] = useState<number>(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [productDetails, setProductDetails] = useState<Map<number, Product>>(new Map());
  const [storages, setStorages] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [storageSearch, setStorageSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showStorageDropdown, setShowStorageDropdown] = useState(false);
  const productDropdownRef = useRef<HTMLDivElement>(null);
  const storageDropdownRef = useRef<HTMLDivElement>(null);
  const {t} = useTranslation();
  const fetchProductDetails = async (productId: number) => {
    try {
      const response = await api.get(`/items/product/${productId}/`);
      const product = response.data;
      setProductDetails(prev => new Map(prev).set(productId, product));
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  useEffect(() => {
    formData.upload_products.forEach(product => {
      if (!productDetails.has(product.product_id)) {
        fetchProductDetails(product.product_id);
      }
    });
  }, []);

  useEffect(() => {
    const fetchStorages = async () => {
      try {
        const response = await api.get('/storage/');
        setStorages(response.data.results || []);
      } catch (error) {
        console.error('Error fetching storages:', error);
      }
    };

    fetchStorages();
  }, []);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product.id);
    setProductSearch(product.name);
    setShowProductDropdown(false);
    setProductDetails(prev => new Map(prev).set(product.id, product));
  };

  const handleStorageSelect = (storage: any) => {
    setSelectedStorage(storage.id);
    setStorageSearch(storage.storage_name);
    setShowStorageDropdown(false);
  };

  const handleAddProduct = () => {
    if (!quantity || !selectedProduct || !selectedStorage) return;

    const newProduct = {
      quantity,
      product_id: selectedProduct,
      storage_id: selectedStorage
    };

    setFormData(prev => ({
      ...prev,
      upload_products: [...prev.upload_products, newProduct]
    }));

    // Reset form fields
    setQuantity(0);
    setSelectedProduct(0);
    setSelectedStorage(0);
    setProductSearch('');
    setStorageSearch('');
  };

  const handleRemoveProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      upload_products: prev.upload_products.filter((_, i) => i !== index)
    }));
  };

  const getProductDetails = (productId: number, storageId: number) => {
    const product = productDetails.get(productId);
    const storage = storages.find(s => s.id === storageId);

    // If product details are not found, fetch them
    if (!product) {
      fetchProductDetails(productId);
    }

    return {
      productName: product?.name || 'Loading...',
      storageName: storage?.storage_name || 'Unknown Storage'
    };
  };

  // Update the searchProducts function
  const searchProducts = async (searchTerm: string) => {
    try {
      if (!searchTerm.trim()) {
        setProducts([]);
        setShowProductDropdown(false);
        return;
      }
      const response = await api.get(`/items/product/?product_name=${searchTerm}`);
      setProducts(response.data.results || []);
      setShowProductDropdown(true);
    } catch (error) {
      console.error('Error searching products:', error);
      setProducts([]);
    }
  };

  // Add debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts(productSearch);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [productSearch]);

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative" ref={productDropdownRef}>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
            Product
          </label>
          <input
            type="text"
            value={productSearch}
            onChange={(e) => {
              setProductSearch(e.target.value);
              setSelectedProduct(0); // Reset selected product when searching
            }}
            onFocus={() => {
              if (productSearch) {
                setShowProductDropdown(true);
              }
            }}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
              px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 
              focus:ring-[#6C5DD3] bg-white dark:bg-gray-700 text-gray-900 
              dark:text-gray-100 transition-colors"
            placeholder="Search for a product..."
          />
          
          {showProductDropdown && products.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg 
              border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 
                    cursor-pointer text-sm text-gray-900 dark:text-gray-100"
                >
                  {product.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative" ref={storageDropdownRef}>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
            Storage
          </label>
          <input
            type="text"
            value={storageSearch}
            onChange={(e) => {
              setStorageSearch(e.target.value);
              setShowStorageDropdown(true);
            }}
            onFocus={() => setShowStorageDropdown(true)}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
              px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 
              focus:ring-[#6C5DD3] bg-white dark:bg-gray-700 text-gray-900 
              dark:text-gray-100 transition-colors"
            placeholder="Search for a storage..."
          />
          
          {showStorageDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg 
              border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
              {storages
                .filter(storage => 
                  storage.storage_name.toLowerCase().includes(storageSearch.toLowerCase())
                )
                .map((storage) => (
                  <div
                    key={storage.id}
                    onClick={() => handleStorageSelect(storage)}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 
                      cursor-pointer text-sm text-gray-900 dark:text-gray-100"
                  >
                    {storage.storage_name}
                  </div>
                ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
            Quantity
          </label>
          <input
            type="number"
            value={quantity || ''}
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
        className="mt-6 px-6 py-2.5 bg-[#6C5DD3] text-white rounded-lg 
          font-medium hover:bg-[#5b4eb3] disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200 ease-in-out shadow-sm"
      >
        Add Product
      </button>

      {/* Display selected products */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selected Products:</h3>
        <div className="space-y-2">
          {formData.upload_products.map((product, index) => {
            const details = getProductDetails(product.product_id, product.storage_id);
            return (
              <div key={index} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <div className="flex-1">
                  <span className="font-medium dark:text-gray-100">
                    {details.productName}
                  </span>
                  <span className="mx-2 text-gray-400 dark:text-gray-500">|</span>
                  <span className="text-gray-600 dark:text-gray-300">
                    Storage: {details.storageName}
                  </span>
                  <span className="mx-2 text-gray-400 dark:text-gray-500">|</span>
                  <span className="text-gray-600 dark:text-gray-300">Quantity: {product.quantity}</span>
                </div>
                <button
                  onClick={() => handleRemoveProduct(index)}
                  className="text-red-500 hover:text-red-700 p-2 dark:text-red-400 dark:hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex justify-end border-t pt-6">
        <button
          onClick={onSuccess}
          className="px-6 py-2.5 bg-[#6C5DD3] text-white rounded-lg font-medium
            hover:bg-[#5b4eb3] transition-colors duration-200 ease-in-out shadow-sm"
        >
          {t('createApplication.next')}
        </button>
      </div>
    </div>
  );
};

const TransportSection = ()  => {
  const { t } = useTranslation();
  const { formData, setFormData } = useFormContext();
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

    setTransportNumber('');
    setTransportTypeId(0);
  };

  const handleRemoveTransport = (index: number) => {
    setFormData(prev => ({
      ...prev,
      upload_transport: prev.upload_transport.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="mt-8 border-t pt-8">
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {t('createApplication.transportInfo')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('createApplication.transportType')}
            </label>
            <select
              value={transportTypeId}
              onChange={(e) => setTransportTypeId(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 
                px-4 py-2.5 text-sm focus:border-[#6C5DD3] focus:ring-1 
                focus:ring-[#6C5DD3] bg-white dark:bg-gray-700 
                text-gray-900 dark:text-gray-100 transition-colors"
            >
              <option value={0}>
                {t('createApplication.selectTransportType')}
              </option>
              {transportTypes?.map(type => (
                <option key={type.id} value={type.id}>
                  {type.transport_type}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('createApplication.transportNumber')}
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                value={transportNumber}
                onChange={(e) => setTransportNumber(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 
                  px-4 py-2.5 text-sm focus:border-[#6C5DD3] focus:ring-1 
                  focus:ring-[#6C5DD3] bg-white dark:bg-gray-700 
                  text-gray-900 dark:text-gray-100 transition-colors"
                placeholder={t('createApplication.number')}
              />
              <button
                onClick={handleAddTransport}
                disabled={!transportNumber || !transportTypeId}
                className="px-6 py-2.5 bg-[#6C5DD3] text-white rounded-lg font-medium
                  hover:bg-[#5b4eb3] disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors duration-200 ease-in-out shadow-sm
                  whitespace-nowrap"
              >
                {t('createApplication.addTransport')}
              </button>
            </div>
          </div>
        </div>

        {/* Display selected transports */}
        {formData.upload_transport.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('createApplication.selectedTransports')}:
            </h4>
            <div className="space-y-3">
              {formData.upload_transport.map((transport, index) => (
                <div 
                  key={index} 
                  className="flex justify-between items-center bg-gray-50 
                    dark:bg-gray-800 p-4 rounded-lg border border-gray-200 
                    dark:border-gray-700 hover:border-gray-300 
                    dark:hover:border-gray-600 transition-colors"
                >
                  <div className="flex-1">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {transportTypes.find(t => t.id === transport.transport_type)?.transport_type}
                    </span>
                    <span className="mx-2 text-gray-400 dark:text-gray-500">|</span>
                    <span className="text-gray-600 dark:text-gray-300">
                      {t('createApplication.number')}: {transport.transport_number}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveTransport(index)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 
                      dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
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
  const {t} = useTranslation()

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const [keepingRes, workingRes] = await Promise.all([
          api.get('/keeping_service/'),
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
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
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
            {t('createApplication.next')}
          </button>
        </div>
      </div>
    </div>
  );
};

const ModesTab: React.FC<TabPanelProps> = ({ onSubmit }) => {
  const { formData, setFormData } = useFormContext();
  const [modes, setModes] = useState<Array<{ id: number; name_mode: string; code_mode: string }>>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {t} = useTranslation();

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleModeSelect = (selectedMode: { id: number; name_mode: string; code_mode: string }) => {
    // Replace the existing mode (if any) with the new one
    setFormData(prev => ({
      ...prev,
      upload_modes: [{ mode_id: selectedMode.id }]
    }));
    
    setSearchTerm(`${selectedMode.name_mode} (${selectedMode.code_mode})`);
    setShowDropdown(false);
  };

  const filteredModes = modes.filter(mode =>
    mode.name_mode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mode.code_mode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRemoveMode = () => {
    setFormData(prev => ({
      ...prev,
      upload_modes: []
    }));
    setSearchTerm('');
  };

  const selectedMode = modes.find(mode => 
    formData.upload_modes[0]?.mode_id === mode.id
  );

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
      <div className="max-w-md">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('createApplication.select')}
          </label>
          
          <div className="relative" ref={dropdownRef}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder={t('createApplication.input')}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 
                px-4 py-2.5 text-sm focus:border-[#6C5DD3] focus:ring-1 focus:ring-[#6C5DD3]
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
            />
            
            {showDropdown && filteredModes.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg 
                shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
                {filteredModes.map((mode) => (
                  <div
                    key={mode.id}
                    onClick={() => handleModeSelect(mode)}
                    className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer
                      border-b last:border-b-0 border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {mode.name_mode}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {t('createApplication.code')}: {mode.code_mode}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Display selected mode */}
        {selectedMode && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Selected Mode:
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border 
              border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {selectedMode.name_mode}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Code: {selectedMode.code_mode}
                  </p>
                </div>
                <button
                  onClick={handleRemoveMode}
                  className="p-1 text-gray-400 hover:text-red-500 rounded-full
                    hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 border-t pt-6">
          <button
            onClick={onSubmit}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium
              hover:bg-green-700 transition-colors duration-200 ease-in-out shadow-sm
              focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
              dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={formData.upload_modes.length === 0}
          >
            {t('createApplication.title')}
          </button>
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
    upload_photos: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          paymentMethodsResponse,
          keepingServicesResponse,
          workingServicesResponse,
          storagesResponse,
          transportTypesResponse
        ] = await Promise.all([
          api.get('/payment_method/'),
          api.get('/keeping_service/'),
          api.get('/working_service/'),
          api.get('/storage/'),
          api.get('/transport/type/')
        ]);
        
        setPaymentMethods(paymentMethodsResponse.data.results || []);
        setKeepingServices(keepingServicesResponse.data.results);
        setWorkingServices(workingServicesResponse.data.results);
        setStorages(storagesResponse.data || []);
        setTransportTypes(transportTypesResponse.data || []);
        
        setFormData(prev => ({
          ...prev,
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
      const formDataObj = new FormData();

      formDataObj.append('firm_id', formData.firm_id.toString());
      formDataObj.append('brutto', formData.brutto?.toString() || '');
      formDataObj.append('netto', formData.netto?.toString() || '');
      formDataObj.append('vip_application', formData.vip_application ? 'true' : 'false');
      formDataObj.append('total_price', formData.total_price?.toString() || '');
      formDataObj.append('coming_date', formData.coming_date || '');
      formDataObj.append('decloration_date', formData.decloration_date || '');
      formDataObj.append('decloration_number', formData.decloration_number || '');

      formDataObj.append('upload_keeping_services_quantity', 
        JSON.stringify(formData.upload_keeping_services_quantity));
      
      formDataObj.append('upload_working_services_quantity', 
        JSON.stringify(formData.upload_working_services_quantity));
      
      formDataObj.append('upload_transport', 
        JSON.stringify(formData.upload_transport));
      
      formDataObj.append('upload_modes', 
        JSON.stringify(formData.upload_modes));
      
      formDataObj.append('upload_products', 
        JSON.stringify(formData.upload_products));

      if (formData.decloration_file) {
        formDataObj.append('decloration_file', formData.decloration_file);
      }

      if (formData.upload_photos?.length) {
        formData.upload_photos.forEach(photo => {
          formDataObj.append('upload_photos', photo);
        });
      }

      const endpoint = '/application/';
      const method = 'post';

      const response = await api[method](endpoint, formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log(`Application created successfully:`, response.data);
      setApplicationId(response.data.id);
      setShowSuccessModal(true);
      navigate('/application-list');

    } catch (error: any) {
      console.error(`Error submitting application:`, error);
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
    setSelectedTab(3);
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

  const searchFirms = async (searchTerm: string) => {
    try {
      if (!searchTerm.trim()) {
        setFirms([]);
        setShowFirmDropdown(false);
        return;
      }
      const response = await api.get(`/firms/?firm_name=${searchTerm}`);
      setFirms(response.data.results || []);
      setShowFirmDropdown(true);
    } catch (error) {
      console.error('Error searching firms:', error);
      setFirms([]);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (firmSearch) {
        searchFirms(firmSearch);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [firmSearch]);

  const handleFirmSelect = (firm: Firm) => {
    console.log('Selected firm:', firm);
    
    if (!firm.id) {
      console.error('Invalid firm selected - firm.id is falsy');
      return;
    }
    
    const firmId = Number(firm.id);
    
    setFormData(prev => {
      const updated = {
        ...prev,
        firm_id: firmId
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

  

  const inputClassName = `mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
    px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 
    focus:ring-[#6C5DD3] bg-white dark:bg-gray-700 text-gray-900 
    dark:text-gray-100 transition-colors`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        decloration_file: e.target.files![0]
      }));
    }
  };

  const handleTabChange = (index: number) => {
    setSelectedTab(index);
  };

  return (
    <FormContext.Provider value={{ formData, setFormData }}>
      <div className="p-4 sm:p-6">
        <Tab.Group selectedIndex={selectedTab} onChange={handleTabChange}>
          <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
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

              {t('createApplication.declaration')}
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
              {t('createApplication.photos')}
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
              {t('createApplication.products',)}
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
              {t('createApplication.modes',)}
            </Tab>
          </Tab.List>

          <Tab.Panels>
            <Tab.Panel>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
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
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
                        {firms.length > 0 ? (
                          firms.map((firm) => (
                            <div
                              key={firm.id}
                              onClick={() => handleFirmSelect(firm)}
                              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-900 dark:text-gray-100"
                            >
                              {firm.firm_name}
                            </div>
                          ))
                        ) : (
                          <div className="p-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                              {t('createApplication.noFirmsFound', 'No firms found')}
                            </p>
                            <button
                              onClick={() => setShowCreateFirmModal(true)}
                              className="w-full text-center bg-[#6C5DD3] text-white px-4 py-2 text-sm rounded-lg 
                              hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2
                              dark:focus:ring-offset-gray-800"
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
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
                        {filteredPaymentMethods.length > 0 ? (
                          filteredPaymentMethods.map((method) => (
                            <div
                              key={method.id}
                              onClick={() => handlePaymentMethodSelect(method)}
                              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-900 dark:text-gray-100"
                            >
                              {method.payment_method}
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                            {t('createApplication.noPaymentMethodsFound', 'No payment methods found')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <TransportSection />
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedTab(1)}
                  className="bg-[#6C5DD3] text-white px-6 py-2 rounded-lg hover:bg-[#5b4eb3]
                    focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2
                    dark:focus:ring-offset-gray-800"
                >
                  {t('createApplication.next')}
                </button>
              </div>
            </Tab.Panel>

            <Tab.Panel>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
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
                        file:cursor-pointer
                        dark:file:bg-[#6C5DD3] dark:file:text-white
                        dark:hover:file:bg-[#5b4eb3]"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedTab(2)}
                    className="bg-[#6C5DD3] text-white px-6 py-2 rounded-lg hover:bg-[#5b4eb3]
                      focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2
                      dark:focus:ring-offset-gray-800"
                  >
                    {t('createApplication.next')}
                  </button>
                </div>
              </div>
            </Tab.Panel>

            <Tab.Panel>
              <ServicesTab onSuccess={() => setSelectedTab(3)} />
            </Tab.Panel>

            <Tab.Panel>
              <PhotoReportTab 
                onSuccess={() => setSelectedTab(4)}
                setSelectedTab={setSelectedTab}
              />
            </Tab.Panel>

            <Tab.Panel>
              <ProductsTab onSuccess={() => setSelectedTab(5)} />
            </Tab.Panel>

            <Tab.Panel>
              <ModesTab onSubmit={handleSubmit} />
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