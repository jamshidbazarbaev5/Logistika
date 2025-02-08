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
  applicationId: number | null;
  onSuccess?: () => void;
}

const PhotoReportTab: React.FC<TabPanelProps> = ({ applicationId, onSuccess }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  // const { t } = useTranslation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (!applicationId || !selectedFiles.length) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('application_id', applicationId.toString());
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

const ProductsTab: React.FC<TabPanelProps> = ({ applicationId, onSuccess }) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [storageId, setStorageId] = useState<number>(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [storages, setStorages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, storagesRes] = await Promise.all([
          api.get('/items/product/'),
          api.get('/storage/')
        ]);
        
        console.log('Products:', productsRes.data);
        setProducts(productsRes.data);
        setStorages(storagesRes.data);
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
    if (!applicationId || !quantity || !selectedProduct || !storageId) return;
    setLoading(true);

    try {
      const productId = getProductId(selectedProduct);
      await api.post('/items/product_quantity/', {
        quantity,
        product_id: productId,
        storage_id: storageId,
        application_id: applicationId
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product
          </label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="block w-full rounded-lg border-gray-300 shadow-sm
              focus:border-[#6C5DD3] focus:ring-[#6C5DD3]
              text-gray-700 text-sm
              transition-colors duration-200"
          >
            <option value="">Select Product</option>
            {products.map((product, index) => (
              <option 
                key={`${product.name}-${index}`} 
                value={product.name}
              >
                {product.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Storage
          </label>
          <select
            value={storageId}
            onChange={(e) => setStorageId(Number(e.target.value))}
            className="block w-full rounded-lg border-gray-300 shadow-sm
              focus:border-[#6C5DD3] focus:ring-[#6C5DD3]
              text-gray-700 text-sm
              transition-colors duration-200"
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min="1"
            className="block w-full rounded-lg border-gray-300 shadow-sm
              focus:border-[#6C5DD3] focus:ring-[#6C5DD3]
              text-gray-700 text-sm
              transition-colors duration-200"
          />
        </div>
      </div>

      <button
        onClick={handleAddProduct}
        disabled={!quantity || !selectedProduct || !storageId || loading}
        className="mt-6 w-full sm:w-auto px-6 py-2.5 bg-[#6C5DD3] text-white rounded-lg font-medium
          hover:bg-[#5b4eb3] disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200 ease-in-out shadow-sm"
      >
        {loading ? 'Adding...' : 'Add Product'}
      </button>
    </div>
  );
};

const TransportTab: React.FC<TabPanelProps> = ({ applicationId, onSuccess }) => {
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
    if (!applicationId || !transportNumber || !transportTypeId) return;
    setLoading(true);

    try {
      await api.post('/transport/number/', {
        transport_type: transportTypeId,
        transport_number: transportNumber,
        application_id: applicationId
      });
      
      // Reset form
      setTransportNumber('');
      setTransportTypeId(0);
      
      // Navigate to next tab
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

const ModesTab: React.FC<TabPanelProps> = ({ applicationId }) => {
  const [modeId, setModeId] = useState<number>(0);
  const [modes, setModes] = useState<Array<{ id: number; name_mode: string }>>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    if (!applicationId || !modeId) return;
    setLoading(true);

    try {
      await api.post('/modes/application_modes/', {
        mode_id: modeId,
        application_id: applicationId
      });
      
      // Reset all forms (you'll need to lift this state up or use context/redux)
      // For now, we'll just navigate to the applications list
      navigate('/application-list');
      
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
  const [formData, setFormData] = useState<ApplicationFormData>({
    brutto: null,
    netto: null,
    coming_date: "",
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
    firm_id: 1,
    payment_method: 1,
    keeping_services: [],
    working_services: [],
    product_quantities: [],
    transport_numbers: []
  });
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
  const [error, setError] = useState<string | null>(null);
  // const [] = useState({
  //   quantity: 0,
  //   product_id: 0,
  //   storage_id: 0
  // });
  // const [] = useState({
  //   transport_number: "",
  //   transport_type: 1
  // });
  // const [] = useState("");
  // const [] = useState("");
  // const [] = useState("");
  const [, setShowProductDropdown] = useState(false);
  const [, setShowStorageDropdown] = useState(false);
  const [, setShowTransportTypeDropdown] = useState(false);
  const productDropdownRef = useRef<HTMLDivElement>(null);
  const storageDropdownRef = useRef<HTMLDivElement>(null);
  const transportTypeDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const navigate = useNavigate();

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
        
        setFirms(firmsResponse.data);
        setPaymentMethods(paymentMethodsResponse.data);
        setKeepingServices(keepingServicesResponse.data);
        setWorkingServices(workingServicesResponse.data);
        setProducts(productsResponse.data || []);
        setStorages(storagesResponse.data || []);
        setTransportTypes(transportTypesResponse.data || []);
        
        setFormData(prev => ({
          ...prev,
          firm_id: firmsResponse.data[0]?.id || null,
          payment_method: paymentMethodsResponse.data[0]?.id || null
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
      
      if (productDropdownRef.current && 
          !productDropdownRef.current.contains(event.target as Node)) {
        setShowProductDropdown(false);
      }
      
      if (storageDropdownRef.current && 
          !storageDropdownRef.current.contains(event.target as Node)) {
        setShowStorageDropdown(false);
      }
      
      if (transportTypeDropdownRef.current && 
          !transportTypeDropdownRef.current.contains(event.target as Node)) {
        setShowTransportTypeDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      const formDataToSend = new FormData();

      // Handle basic fields first
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && 
            key !== 'keeping_services' && 
            key !== 'working_services' && 
            key !== 'product_quantities' && 
            key !== 'transport_numbers' &&
            key !== 'decloration_file') {
          formDataToSend.append(key, value.toString());
        }
      });

      // Handle file separately if it exists
      if (formData.decloration_file) {
        formDataToSend.append('decloration_file', formData.decloration_file);
      }

      // Handle keeping services
      if (formData.keeping_services.length > 0) {
        formData.keeping_services.forEach(serviceId => {
          formDataToSend.append('keeping_services[]', serviceId.toString());
        });
      } else {
        formDataToSend.append('keeping_services', '[]');
      }

      if (formData.working_services.length > 0) {
        formData.working_services.forEach(serviceId => {
          formDataToSend.append('working_services[]', serviceId.toString());
        });
      } else {
        formDataToSend.append('working_services', '[]');
      }

      const response = await api.post('/application/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Response:', response.data);

      if (response.status === 201 || response.status === 200) {
        setApplicationId(response.data.id);
        setShowSuccessModal(true);
        setSelectedTab(1);
      }
    } catch (error: any) {
      console.error('Error submitting:', error);
      console.error('Error response:', error.response?.data);
      setError(t('createApplication.errorSubmitting', 'Error submitting application'));
    }
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
    if (selectedTab === 4) {
      navigate('/application-list');
    } else {
      setSelectedTab(prev => prev + 1);
    }
  };

  const resetAllForms = () => {
    setApplicationId(null);
    setSelectedTab(0);
  };

  return (
    <div className="p-4 sm:p-6">
      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
        <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-6">
          <Tab
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                selected
                  ? 'bg-white text-[#6C5DD3] shadow'
                  : 'text-gray-500 hover:bg-white/[0.12] hover:text-[#6C5DD3]'
              )
            }
          >
            {t('createApplication.mainForm', 'Main Form')}
          </Tab>
          <Tab
            disabled={!applicationId}
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                selected
                  ? 'bg-white text-[#6C5DD3] shadow'
                  : 'text-gray-500 hover:bg-white/[0.12] hover:text-[#6C5DD3]'
              )
            }
          >
            {t('createApplication.photos', 'Photos')}
          </Tab>
          <Tab
            disabled={!applicationId}
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                selected
                  ? 'bg-white text-[#6C5DD3] shadow'
                  : 'text-gray-500 hover:bg-white/[0.12] hover:text-[#6C5DD3]'
              )
            }
          >
            {t('createApplication.products', 'Products')}
          </Tab>
          <Tab
            disabled={!applicationId}
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                selected
                  ? 'bg-white text-[#6C5DD3] shadow'
                  : 'text-gray-500 hover:bg-white/[0.12] hover:text-[#6C5DD3]'
              )
            }
          >
            {t('createApplication.transport', 'Transport')}
          </Tab>
          <Tab
            disabled={!applicationId}
            className={({ selected }) =>
              classNames(
                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                'disabled:opacity-50 disabled:cursor-not-allowed',
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
            {/* Main Form Panel */}
            <div className="mb-6">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                {t('createApplication.title', 'Create Application')}
              </h1>
              <p className="mt-1 sm:mt-2 text-sm text-gray-600 dark:text-gray-400">
                {t('createApplication.subtitle', 'Fill in the application details below')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full max-w-4xl">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700 whitespace-pre-line">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                {/* Basic Information */}
                <div className="mb-6">
                  <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
                    {t('createApplication.basicInfo', 'Basic Information')}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label htmlFor="brutto" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('createApplication.brutto', 'Brutto')}
                      </label>
                      <input
                        type="number"
                        name="brutto"
                        id="brutto"
                        value={formData.brutto || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                        px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                        bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="coming_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('createApplication.comingDate', 'Coming Date')}
                      </label>
                      <input
                        type="date"
                        name="coming_date"
                        id="coming_date"
                        value={formData.coming_date}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                        px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                        bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="relative" ref={dropdownRef}>
                      <label htmlFor="firm_search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                        px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                        bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder={t('createApplication.searchFirm', 'Search for a firm...')}
                      />
                      
                      {showFirmDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
                          {filteredFirms.length > 0 ? (
                            filteredFirms.map((firm) => (
                              <div
                                key={firm.id}
                                onClick={() => handleFirmSelect(firm)}
                                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
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
                      <label htmlFor="payment_method_search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
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
                        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                        px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                        bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder={t('createApplication.searchPaymentMethod', 'Search for a payment method...')}
                      />
                      
                      {showPaymentMethodDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
                          {filteredPaymentMethods.length > 0 ? (
                            filteredPaymentMethods.map((method) => (
                              <div
                                key={method.id}
                                onClick={() => handlePaymentMethodSelect(method)}
                                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
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
                </div>

                {/* Declaration Information */}
                <div className="mb-6">
                  <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
                    {t('createApplication.declarationInfo', 'Declaration Information')}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label htmlFor="decloration_number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('createApplication.declarationNumber', 'Declaration Number')}
                      </label>
                      <input
                        type="text"
                        name="decloration_number"
                        id="decloration_number"
                        value={formData.decloration_number}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                        px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                        bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label htmlFor="decloration_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('createApplication.declarationDate', 'Declaration Date')}
                      </label>
                      <input
                        type="date"
                        name="decloration_date"
                        id="decloration_date"
                        value={formData.decloration_date}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                        px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                        bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label htmlFor="decloration_file" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('createApplication.declarationFile', 'Declaration File')}
                      </label>
                      <input
                        type="file"
                        name="decloration_file"
                        id="decloration_file"
                        onChange={handleChange}
                        accept=".jpg,.jpeg,.png,.pdf"
                        className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-[#6C5DD3] file:text-white
                        hover:file:bg-[#5c4eb3]"
                      />
                    </div>
                  </div>
                </div>


                {/* Services Selection */}
                <div>
                  <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                    {t('createApplication.services', 'Services')}
                  </h2>
                  
                  <div className="flex flex-col gap-4">
                    {/* Keeping Services Dropdown */}
                    <div className="w-full bg-gray-50 dark:bg-gray-900 rounded-lg" ref={keepingServicesRef}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setKeepingServicesOpen(!keepingServicesOpen);
                          setWorkingServicesOpen(false);
                        }}
                        className="w-full px-4 py-3 flex items-center justify-between text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="space-y-3">
                            {keepingServices.map((service) => (
                              <div 
                                key={service.id}
                                className={`relative flex items-center p-3 rounded-lg border transition-all duration-200
                                  ${formData.keeping_services.includes(service.id)
                                    ? 'border-[#6C5DD3] bg-[#6C5DD3]/5'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-[#6C5DD3]/50'}`}
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
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                      {service.name}
                                    </span>
                                    <span className="text-sm font-semibold text-[#6C5DD3] ml-2">
                                      {service.base_price}
                                    </span>
                                  </div>
                                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Base days: {service.base_day} | Extra price: {service.extra_price}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Working Services Dropdown */}
                    <div className="w-full bg-gray-50 dark:bg-gray-900 rounded-lg" ref={workingServicesRef}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setWorkingServicesOpen(!workingServicesOpen);
                          setKeepingServicesOpen(false);
                        }}
                        className="w-full px-4 py-3 flex items-center justify-between text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="space-y-3">
                            {workingServices.map((service) => (
                              <div 
                                key={service.id}
                                className={`relative flex items-center p-3 rounded-lg border transition-all duration-200
                                  ${formData.working_services.includes(service.id)
                                    ? 'border-[#6C5DD3] bg-[#6C5DD3]/5'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-[#6C5DD3]/50'}`}
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
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                      {service.service_name}
                                    </span>
                                    <span className="text-sm font-semibold text-[#6C5DD3] ml-2">
                                      {service.base_price}
                                    </span>
                                  </div>
                                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Base days: {service.base_day} | Extra price: {service.extra_price} | Units: {service.units}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Create Application Button - Fixed at bottom */}
              <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 z-10">
                <div className="max-w-7xl mx-auto flex justify-end">
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-[#6C5DD3] text-white px-6 py-3 text-sm font-medium rounded-lg 
                    hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2
                    dark:focus:ring-offset-gray-800 dark:hover:bg-[#5c4eb3] transition-colors duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!formData.brutto || !formData.coming_date || !formData.decloration_date || !formData.decloration_number}
                  >
                    {t('createApplication.createButton', 'Create Application')}
                  </button>
                </div>
              </div>

              {/* Add padding at bottom to prevent content from being hidden behind fixed button */}
              <div className="h-20"></div>
            </form>
          </Tab.Panel>

          <Tab.Panel>
            {applicationId ? (
              <PhotoReportTab applicationId={applicationId} onSuccess={handleTabSuccess} />
            ) : (
              <div className="p-4 text-center text-gray-500">
                Please create an application first
              </div>
            )}
          </Tab.Panel>

          <Tab.Panel>
            {applicationId ? (
              <ProductsTab applicationId={applicationId} onSuccess={handleTabSuccess} />
            ) : (
              <div className="p-4 text-center text-gray-500">
                Please create an application first
              </div>
            )}
          </Tab.Panel>

          <Tab.Panel>
            {applicationId ? (
              <TransportTab 
                applicationId={applicationId} 
                onSuccess={handleTabSuccess} 
              />
            ) : (
              <div className="p-4 text-center text-gray-500">
                Please create an application first
              </div>
            )}
          </Tab.Panel>

          <Tab.Panel>
            {applicationId ? (
              <ModesTab 
                applicationId={applicationId} 
                onSuccess={() => {
                  resetAllForms();
                  navigate('/application-list');
                }} 
              />
            ) : (
              <div className="p-4 text-center text-gray-500">
                Please create an application first
              </div>
            )}
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
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