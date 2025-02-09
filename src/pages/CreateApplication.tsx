import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/api";
import SuccessModal from "../components/SuccessModal";
import CreateFirmModal from "../components/CreateFirmModal";
import { Tab } from '@headlessui/react';
import { classNames } from '../../utils/classNames'
import { useNavigate } from "react-router-dom";

interface ApplicationFormData {
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
  firm_id: number;
  payment_method: number;
  keeping_services: number[];
  working_services: number[];
  product_quantities: ProductQuantity[];
  transport_numbers: TransportNumber[];
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

interface ProductQuantity {
  quantity: number;
  product_id: number;
  storage_id: number;
}

interface TransportNumber {
  transport_number: string;
  transport_type: number;
}

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
}

const PhotoReportTab: React.FC<TabPanelProps> = ({ onSuccess }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;
    setLoading(true);

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('photo', file);
    });

    try {
      await api.post('/photo_report/', formData);
      setSelectedFiles([]);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
    } finally {
      setLoading(false);
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
        onClick={handleUpload}
        disabled={!selectedFiles.length || loading}
        className="w-full sm:w-auto px-6 py-2.5 bg-[#6C5DD3] text-white rounded-lg font-medium
          hover:bg-[#5b4eb3] disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200 ease-in-out shadow-sm"
      >
        {loading ? 'Uploading...' : `Upload ${selectedFiles.length} file(s)`}
      </button>
    </div>
  );
};

const ProductsTab: React.FC<TabPanelProps> = ({ onSuccess }) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [storageId, setStorageId] = useState<number>(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [storages, setStorages] = useState<any[]>([]);
  const [, setLoading] = useState(false);

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

  const getProductId = (productName: string): number => {
    // Find the index of the product in the array and add 1 (1-based index)
    const index = products.findIndex(p => p.name === productName);
    return index + 1;
  };

  const handleAddProduct = async () => {
    if (!quantity || !selectedProduct || !storageId) return;
    setLoading(true);

    try {
      const productId = getProductId(selectedProduct);
      await api.post('/items/product_quantity/', {
        quantity,
        product_id: productId,
        storage_id: storageId,
      });
      
      // Reset form
      setQuantity(1);
      setSelectedProduct('');
      setStorageId(0);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error adding product:', error);
    } finally {
      setLoading(false);
    }
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
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
              px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 
              focus:ring-[#6C5DD3] bg-white dark:bg-gray-700 text-gray-900 
              dark:text-gray-100 transition-colors"
          >
            <option value="">Select Product</option>
            {products.map((product, index) => (
              <option key={`${product.name}-${index}`} value={product.name}>
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
            value={storageId}
            onChange={(e) => setStorageId(Number(e.target.value))}
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
        disabled={!selectedProduct || !storageId || !quantity}
        className="mt-6 w-full sm:w-auto px-6 py-2.5 bg-[#6C5DD3] text-white rounded-lg 
          font-medium hover:bg-[#5b4eb3] disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200 ease-in-out shadow-sm"
      >
        Add Product
      </button>
    </div>
  );
};

const TransportTab: React.FC<TabPanelProps> = ({ onSuccess }) => {
  const [transportNumber, setTransportNumber] = useState('');
  const [transportTypeId, setTransportTypeId] = useState<number>(0);
  const [transportTypes, setTransportTypes] = useState<TransportType[]>([]);
  const [, setLoading] = useState(false);

  useEffect(() => {
    const fetchTransportTypes = async () => {
      try {
        const response = await api.get('/transport/type/');
        setTransportTypes(response.data);
      } catch (error) {
        console.error('Error fetching transport types:', error);
      }
    };
    fetchTransportTypes();
  }, []);

  const handleAddTransport = async () => {
    if (!transportNumber || !transportTypeId) return;
    setLoading(true);

    try {
      await api.post('/transport/number/', {
        transport_type: transportTypeId,
        transport_number: transportNumber
      });
      
      // Reset form
      setTransportNumber('');
      setTransportTypeId(0);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error adding transport:', error);
    } finally {
      setLoading(false);
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
            {transportTypes.map(type => (
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
        Add Transport
      </button>
    </div>
  );
};

const ModesTab: React.FC<TabPanelProps> = ({ onSuccess }) => {
  const [modeId, setModeId] = useState<number>(0);
  const [modes, setModes] = useState<Array<{ id: number; name_mode: string }>>([]);
  const [loading, setLoading] = useState(false);
  // const navigate = useNavigate();

  useEffect(() => {
    const fetchModes = async () => {
      try {
        const response = await api.get('/modes/modes/');
        setModes(response.data);
      } catch (error) {
        console.error('Error fetching modes:', error);
      }
    };
    fetchModes();
  }, []);

  const handleAddMode = async () => {
    if (!modeId) return;
    setLoading(true);

    try {
      await api.post('/modes/application_modes/', {
        mode_id: modeId
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error adding mode:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="max-w-md">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
          <select
            value={modeId || ''}
            onChange={(e) => setModeId(Number(e.target.value))}
            className="block w-full rounded-lg border-gray-300 shadow-sm
              focus:border-[#6C5DD3] focus:ring-[#6C5DD3]
              text-gray-700 text-sm
              transition-colors duration-200"
          >
            <option value="">Select Mode</option>
            {modes.map(mode => (
              <option key={mode.id} value={mode.id}>
                {mode.name_mode}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleAddMode}
          disabled={!modeId || loading}
          className="w-full px-6 py-2.5 bg-[#6C5DD3] text-white rounded-lg font-medium
            hover:bg-[#5b4eb3] disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200 ease-in-out shadow-sm"
        >
          {loading ? 'Adding...' : 'Add Mode'}
        </button>
      </div>
    </div>
  );
};

export default function CreateApplication() {
  const { t } = useTranslation();
  const [firms, setFirms] = useState<Firm[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [keepingServices, setKeepingServices] = useState<KeepingService[]>([]);
  const [workingServices, setWorkingServices] = useState<WorkingService[]>([]);
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
  const [keepingServicesOpen, setKeepingServicesOpen] = useState(false);
  const [workingServicesOpen, setWorkingServicesOpen] = useState(false);
  const keepingServicesRef = useRef<HTMLDivElement>(null);
  const workingServicesRef = useRef<HTMLDivElement>(null);
  const [showCreateFirmModal, setShowCreateFirmModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [, setApplicationId] = useState<number | null>(null);
  const navigate = useNavigate();

  // Format current date to YYYY-MM-DD
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState<ApplicationFormData>({
    brutto: null,
    netto: null,
    coming_date: getCurrentDate(), // Set current date as default
    decloration_file: null,
    decloration_date: "",
    decloration_number: "",
    vip_application: null,
    total_price: null,
    discount_price: null,
    keeping_days: null,
    workers_hours: null,
    unloading_quantity: null,
    loading_quantity: null,
    firm_id: 0,
    payment_method: 0,
    keeping_services: [],
    working_services: [],
    product_quantities: [],
    transport_numbers: [],
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
      const formDataToSend = new FormData();
      
      // Handle dates separately
      formDataToSend.append('coming_date', formData.coming_date);
      formDataToSend.append('decloration_date', formData.decloration_date || '');
      
      // Append other form data fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && 
            key !== 'decloration_file' && 
            key !== 'coming_date' && 
            key !== 'decloration_date') {
          formDataToSend.append(key, JSON.stringify(value));
        }
      });

      // Append file if exists
      if (formData.decloration_file) {
        formDataToSend.append('decloration_file', formData.decloration_file);
      }

      const response = await api.post('/application/', formDataToSend);
      
      setApplicationId(response.data.id);
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Error creating application:', error);
    }
  };

  // Modify the success modal close handler
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
    setFormData(prev => ({ ...prev, firm_id: firm.id }));
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

  const handleKeepingServiceToggle = (serviceId: number) => {
    setFormData(prev => {
      const newServices = prev.keeping_services.includes(serviceId)
        ? prev.keeping_services.filter(id => id !== serviceId)
        : [...prev.keeping_services, serviceId];
      
      console.log('Keeping services after toggle:', newServices); // Debug log
      return {
        ...prev,
        keeping_services: newServices
      };
    });
  };

  const handleWorkingServiceToggle = (serviceId: number) => {
    setFormData(prev => {
      const newServices = prev.working_services.includes(serviceId)
        ? prev.working_services.filter(id => id !== serviceId)
        : [...prev.working_services, serviceId];
      
      console.log('Working services after toggle:', newServices); // Debug log
      return {
        ...prev,
        working_services: newServices
      };
    });
  };

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
                  {t('common.next', 'Next')}
                </button>
              </div>
            </div>
          </Tab.Panel>

          <Tab.Panel>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex flex-col gap-4">
                <div className="w-full bg-gray-50 rounded-lg" ref={keepingServicesRef}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setKeepingServicesOpen(!keepingServicesOpen);
                      setWorkingServicesOpen(false);
                    }}
                    className="w-full px-4 py-3 flex items-center justify-between text-left rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700">
                        {t('createApplication.keepingServices', 'Keeping Services')}
                      </span>
                      <span className="ml-2 bg-[#6C5DD3] text-white text-xs px-2 py-1 rounded-full">
                        {formData.keeping_services.length} selected
                      </span>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                        keepingServicesOpen ? 'transform rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {keepingServicesOpen && keepingServices.length > 0 && (
                    <div className="p-4 border-t border-gray-200">
                      <div className="space-y-3">
                        {keepingServices.map((service) => (
                          <div 
                            key={service.id}
                            className={`relative flex items-center p-3 rounded-lg border transition-all duration-200
                              ${formData.keeping_services.includes(service.id)
                                ? 'border-[#6C5DD3] bg-[#6C5DD3]/5'
                                : 'border-gray-200 hover:border-[#6C5DD3]/50'}`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.keeping_services.includes(service.id)}
                              onChange={() => handleKeepingServiceToggle(service.id)}
                              className="rounded border-gray-300 text-[#6C5DD3] focus:ring-[#6C5DD3]
                                w-4 h-4 mr-3 cursor-pointer"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <span className="text-sm font-medium text-gray-700">
                                  {service.name}
                                </span>
                                <span className="text-sm font-semibold text-[#6C5DD3] ml-2">
                                  {service.base_price}
                                </span>
                              </div>
                              <div className="mt-1 text-xs text-gray-500">
                                Base days: {service.base_day} | Extra price: {service.extra_price}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-full bg-gray-50 rounded-lg" ref={workingServicesRef}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setWorkingServicesOpen(!workingServicesOpen);
                      setKeepingServicesOpen(false);
                    }}
                    className="w-full px-4 py-3 flex items-center justify-between text-left rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700">
                        {t('createApplication.workingServices', 'Working Services')}
                      </span>
                      <span className="ml-2 bg-[#6C5DD3] text-white text-xs px-2 py-1 rounded-full">
                        {formData.working_services.length} selected
                      </span>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                        workingServicesOpen ? 'transform rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {workingServicesOpen && workingServices.length > 0 && (
                    <div className="p-4 border-t border-gray-200">
                      <div className="space-y-3">
                        {workingServices.map((service) => (
                          <div 
                            key={service.id}
                            className={`relative flex items-center p-3 rounded-lg border transition-all duration-200
                              ${formData.working_services.includes(service.id)
                                ? 'border-[#6C5DD3] bg-[#6C5DD3]/5'
                                : 'border-gray-200 hover:border-[#6C5DD3]/50'}`}
                          >
                            <input
                              type="checkbox"
                              checked={formData.working_services.includes(service.id)}
                              onChange={() => handleWorkingServiceToggle(service.id)}
                              className="rounded border-gray-300 text-[#6C5DD3] focus:ring-[#6C5DD3]
                                w-4 h-4 mr-3 cursor-pointer"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <span className="text-sm font-medium text-gray-700">
                                  {service.service_name}
                                </span>
                                <span className="text-sm font-semibold text-[#6C5DD3] ml-2">
                                  {service.base_price}
                                </span>
                              </div>
                              <div className="mt-1 text-xs text-gray-500">
                                Base days: {service.base_day} | Extra price: {service.extra_price} | Units: {service.units}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="bg-[#6C5DD3] text-white px-6 py-2.5 rounded-lg font-medium
                      hover:bg-[#5b4eb3] transition-colors duration-200 ease-in-out shadow-sm"
                  >
                    {t('createApplication.createApplication', 'Create Application')}
                  </button>
                </div>
              </div>
            </div>
          </Tab.Panel>

          <Tab.Panel>
            <PhotoReportTab onSuccess={handleTabSuccess} />
          </Tab.Panel>

          <Tab.Panel>
            <ProductsTab onSuccess={handleTabSuccess} />
          </Tab.Panel>

          <Tab.Panel>
            <TransportTab onSuccess={handleTabSuccess} />
          </Tab.Panel>

          <Tab.Panel>
            <ModesTab onSuccess={handleTabSuccess} />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      {selectedTab === 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10">
          <div className="max-w-7xl mx-auto flex justify-end">
            <button
              type="button"
              onClick={() => setSelectedTab(1)}
              className="bg-[#6C5DD3] text-white px-6 py-2 rounded-lg hover:bg-[#5b4eb3]"
            >
              {t('common.next', 'Next')}
            </button>
          </div>
        </div>
      )}

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
  );
} 