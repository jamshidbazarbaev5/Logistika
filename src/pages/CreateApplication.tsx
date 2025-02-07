import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/api";
import SuccessModal from "../components/SuccessModal";
import CreateFirmModal from "../components/CreateFirmModal";

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
  id: number;
  name: string;
}

interface Storage {
  id: number;
  storage_name: string;
}

interface TransportType {
  id: number;
  transport_type: string;
}

export default function CreateApplication() {
  const { t } = useTranslation();
  const [firms, setFirms] = useState<Firm[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [keepingServices, setKeepingServices] = useState<KeepingService[]>([]);
  const [workingServices, setWorkingServices] = useState<WorkingService[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [storages, setStorages] = useState<Storage[]>([]);
  const [transportTypes, setTransportTypes] = useState<TransportType[]>([]);
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
  const [productQuantity, setProductQuantity] = useState({
    quantity: 0,
    product_id: 0,
    storage_id: 0
  });
  const [transportNumber, setTransportNumber] = useState({
    transport_number: "",
    transport_type: 1
  });
  const [productSearch, setProductSearch] = useState("");
  const [storageSearch, setStorageSearch] = useState("");
  const [transportNumberSearch, setTransportNumberSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showStorageDropdown, setShowStorageDropdown] = useState(false);
  const [showTransportTypeDropdown, setShowTransportTypeDropdown] = useState(false);
  const productDropdownRef = useRef<HTMLDivElement>(null);
  const storageDropdownRef = useRef<HTMLDivElement>(null);
  const transportTypeDropdownRef = useRef<HTMLDivElement>(null);

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

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          if (key === 'decloration_file' && value instanceof File) {
            formDataToSend.append('decloration_file', value);
          } else if (key === 'keeping_services' || key === 'working_services') {
            const arrayValue = value as number[];
            arrayValue.forEach(id => {
              formDataToSend.append(`${key}[]`, id.toString());
            });
          } else {
            formDataToSend.append(key, value.toString());
          }
        }
      });

      formDataToSend.append('product_quantities', JSON.stringify(formData.product_quantities));
      formDataToSend.append('transport_numbers', JSON.stringify(formData.transport_numbers));

      console.log('Sending data:', {
        ...Object.fromEntries(formDataToSend),
        keeping_services: formData.keeping_services,
        working_services: formData.working_services
      });

      const response = await api.post('/application/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Success response:', response);
      
      if (response.status === 201 || response.status === 200) {
        setShowSuccessModal(true);
        setFormData({
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
      }
    } catch (error: any) {
      console.error('Error response:', error.response?.data);
      let errorMessage = 'Failed to create application. Please try again.';
      
      if (error.response?.data) {
        const serverError = error.response.data;
        console.log('Server error details:', serverError);
        errorMessage = typeof serverError === 'object' 
          ? Object.entries(serverError).map(([key, value]) => `${key}: ${value}`).join('\n')
          : serverError.toString();
      }
      
      setError(errorMessage);
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
    setFormData(prev => ({
      ...prev,
      keeping_services: prev.keeping_services.includes(serviceId)
        ? prev.keeping_services.filter(id => id !== serviceId)
        : [...prev.keeping_services, serviceId]
    }));
    console.log('Keeping services after toggle:', formData.keeping_services);
  };

  const handleWorkingServiceToggle = (serviceId: number) => {
    setFormData(prev => ({
      ...prev,
      working_services: prev.working_services.includes(serviceId)
        ? prev.working_services.filter(id => id !== serviceId)
        : [...prev.working_services, serviceId]
    }));
    console.log('Working services after toggle:', formData.working_services);
  };

  const handleFirmCreated = (newFirm: { id: number; firm_name: string }) => {
    setFirms(prevFirms => [...prevFirms, newFirm]);
    setFormData(prev => ({ ...prev, firm_id: newFirm.id }));
    setFirmSearch(newFirm.firm_name);
  };

  const handleAddProductQuantity = () => {
    if (productQuantity.quantity && productQuantity.product_id && productQuantity.storage_id) {
      setFormData(prev => ({
        ...prev,
        product_quantities: [...prev.product_quantities, productQuantity]
      }));
      setProductQuantity({ quantity: 0, product_id: 0, storage_id: 0 });
    }
  };

  const handleAddTransportNumber = () => {
    if (transportNumber.transport_number && transportNumber.transport_type) {
      setFormData(prev => ({
        ...prev,
        transport_numbers: [...prev.transport_numbers, transportNumber]
      }));
      setTransportNumber({ transport_number: "", transport_type: 1 });
    }
  };

  const filteredProducts = products.filter(product =>
    product?.name?.toLowerCase().includes(productSearch.toLowerCase() || '') || false
  );

  const filteredStorages = storages.filter(storage =>
    storage?.storage_name?.toLowerCase().includes(storageSearch.toLowerCase() || '') || false
  );

  const filteredTransportTypes = transportTypes.filter(type =>
    type?.transport_type?.toLowerCase().includes(transportNumberSearch.toLowerCase() || '') || false
  );

  return (
    <div className="p-4 sm:p-6">
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

      <div className="mb-6 sm:mb-8">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          {t('createApplication.title', 'Create Application')}
        </h1>
        <p className="mt-1 sm:mt-2 text-sm text-gray-600 dark:text-gray-400">
          {t('createApplication.subtitle', 'Fill in the application details below')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full max-w-4xl">
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

          {/* Product Quantities */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
              {t('createApplication.productQuantities', 'Product Quantities')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('createApplication.quantity', 'Quantity')}
                </label>
                <input
                  type="number"
                  value={productQuantity.quantity}
                  onChange={(e) => setProductQuantity(prev => ({
                    ...prev,
                    quantity: parseInt(e.target.value)
                  }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                />
              </div>

              <div className="relative" ref={productDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('createApplication.product', 'Product')}
                </label>
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setShowProductDropdown(true);
                  }}
                  onFocus={() => setShowProductDropdown(true)}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                  placeholder={t('createApplication.searchProduct', 'Search for a product...')}
                />
                
                {showProductDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => {
                          setProductQuantity(prev => ({ ...prev, product_id: product.id }));
                          setProductSearch(product.name);
                          setShowProductDropdown(false);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        {product.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative" ref={storageDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('createApplication.storage', 'Storage')}
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
                  px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                  placeholder={t('createApplication.searchStorage', 'Search for a storage...')}
                />
                
                {showStorageDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg">
                    {filteredStorages.map((storage) => (
                      <div
                        key={storage.id}
                        onClick={() => {
                          setProductQuantity(prev => ({ ...prev, storage_id: storage.id }));
                          setStorageSearch(storage.storage_name);
                          setShowStorageDropdown(false);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        {storage.storage_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleAddProductQuantity}
              className="mb-4 px-4 py-2 text-sm bg-[#6C5DD3] text-white rounded-lg hover:bg-[#5c4eb3]"
            >
              {t('createApplication.addProductQuantity', 'Add Product Quantity')}
            </button>

            {formData.product_quantities.length > 0 && (
              <div className="mb-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Quantity</th>
                      <th className="px-4 py-2">Product ID</th>
                      <th className="px-4 py-2">Storage ID</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.product_quantities.map((pq, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">{pq.quantity}</td>
                        <td className="px-4 py-2">{pq.product_id}</td>
                        <td className="px-4 py-2">{pq.storage_id}</td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                product_quantities: prev.product_quantities.filter((_, i) => i !== index)
                              }));
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            {t('common.delete', 'Delete')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Transport Numbers */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
              {t('createApplication.transportNumbers', 'Transport Numbers')}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('createApplication.transportNumber', 'Transport Number')}
                </label>
                <input
                  type="text"
                  value={transportNumber.transport_number}
                  onChange={(e) => setTransportNumber(prev => ({
                    ...prev,
                    transport_number: e.target.value
                  }))}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                />
              </div>

              <div className="relative" ref={transportTypeDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('createApplication.transportType', 'Transport Type')}
                </label>
                <input
                  type="text"
                  value={transportNumberSearch}
                  onChange={(e) => {
                    setTransportNumberSearch(e.target.value);
                    setShowTransportTypeDropdown(true);
                  }}
                  onFocus={() => setShowTransportTypeDropdown(true)}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                  placeholder={t('createApplication.searchTransportType', 'Search for a transport type...')}
                />
                
                {showTransportTypeDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg">
                    {filteredTransportTypes.map((type) => (
                      <div
                        key={type.id}
                        onClick={() => {
                          setTransportNumber(prev => ({ ...prev, transport_type: type.id }));
                          setTransportNumberSearch(type.transport_type);
                          setShowTransportTypeDropdown(false);
                        }}
                        className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        {type.transport_type}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddTransportNumber}
              className="mb-4 px-4 py-2 text-sm bg-[#6C5DD3] text-white rounded-lg hover:bg-[#5c4eb3]"
            >
              {t('createApplication.addTransportNumber', 'Add Transport Number')}
            </button>

            {formData.transport_numbers.length > 0 && (
              <div className="mb-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Transport Number</th>
                      <th className="px-4 py-2">Transport Type</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.transport_numbers.map((tn, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">{tn.transport_number}</td>
                        <td className="px-4 py-2">{tn.transport_type}</td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                transport_numbers: prev.transport_numbers.filter((_, i) => i !== index)
                              }));
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            {t('common.delete', 'Delete')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto bg-[#6C5DD3] text-white px-4 py-2 text-sm rounded-lg 
            hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2
            dark:focus:ring-offset-gray-800 dark:hover:bg-[#5c4eb3] transition-colors duration-200"
          >
            {t('createApplication.submit', 'Create Application')}
          </button>
        </div>
      </form>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={t('createApplication.successMessage', 'Application has been created successfully!')}
      />

      <CreateFirmModal
        isOpen={showCreateFirmModal}
        onClose={() => setShowCreateFirmModal(false)}
        onFirmCreated={handleFirmCreated}
      />
    </div>
  );
} 