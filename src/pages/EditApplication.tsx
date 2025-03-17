import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../api/api";
import SuccessModal from "../components/SuccessModal";
import { Tab } from "@headlessui/react";
import { FormContext } from '../context/FormContext';
import ServicesTab from '../components/ServicesTab';
import PhotoReportTab from "../components/PhotoReportTab";
import ProductsTab from "../components/ProductsTab";
import ModesTab from "../components/ModesTab";
import { useFormContext } from "../context/FormContext";
import type { ApplicationFormData } from '../context/FormContext';

interface EditApplicationFormState extends Omit<ApplicationFormData, 'decloration_file'> {
  decloration_file?: string | File;
  deported_date?: string;
  [key: string]: any;
}

export default function EditApplication() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  
  const [formData, setFormData] = useState<EditApplicationFormState>({
    firm_id: 0,
    number_of_application: '',
    brutto: null,
    netto: null,
    coming_date: '',
    decloration_date: '',
    decloration_number: '',
    vip_application: false,
    total_price: null,
    discount_price: null,
    keeping_days: 0,
    workers_hours: 0,
    unloading_quantity: 0,
    loading_quantity: 0,
    payment_method: 0,
    keeping_services: [],
    working_services: [],
    upload_keeping_services_quantity: [],
    upload_working_services_quantity: [],
    photo_report: [],
    transport: [],
    modes: [],
    products: [],
    upload_products: [],
    status: 'active',
  });

  const [firms, setFirms] = useState<Array<{ id: number; firm_name: string }>>([]);
  const [keepingServices, setKeepingServices] = useState<Array<{ id: number; name: string; base_price: number }>>([]);
  const [workingServices, setWorkingServices] = useState<Array<{
    id: number;
    year: number;
    base_price: string;
    units: string;
    service: number;
  }>>([]);
  const [transportTypes, setTransportTypes] = useState<Array<{ id: number; transport_type: string }>>([]);
  const [storages, setStorages] = useState<Array<{ id: number; storage_name: string; storage_location: string }>>([]);
  const [products, setProducts] = useState<Array<{
    id: number;
    name: string;
    measurement_id: number;
    category_id: number;
  }>>([]);
  const [availableModes, setAvailableModes] = useState<Array<{ id: number; name_mode: string; code_mode: string }>>([]);

  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          applicationRes,
          firmsRes,
          keepingServicesRes,
          workingServicesTariffRes,
          transportTypesRes,
          storagesRes,
          productsRes,
          modesRes
        ] = await Promise.all([
          api.get(`/application/${id}/`),
          api.get('/firms/'),
          api.get('/keeping_service/keeping_service_price/'),
          api.get('/working_service/tariff/'),
          api.get('/transport/type/'),
          api.get('/storage/'),
          api.get('/items/product/'),
          api.get('/modes/modes/')
        ]); 

        const applicationData = applicationRes.data;
        
        if (!applicationData.status) {
          applicationData.status = 'active';
        }

        // Transform dates using the new helper function
        if (applicationData.coming_date) {
          applicationData.coming_date = formatDateString(applicationData.coming_date);
        }
        if (applicationData.decloration_date) {
          applicationData.decloration_date = formatDateString(applicationData.decloration_date);
        }
        if (applicationData.deported_date) {
          applicationData.deported_date = formatDateString(applicationData.deported_date);
        }

        // Transform keeping services
        applicationData.upload_keeping_services_quantity = applicationData.keeping_services.map((service: any) => ({
          service_type_id: service.service_type_id,
          amount: service.amount
        }));

        // Transform working services
        applicationData.upload_working_services_quantity = applicationData.working_services.map((service: any) => ({
          service_id: service.service_id,
          quantity: service.quantity
        }));

        // Transform modes
        if (applicationData.modes && Array.isArray(applicationData.modes)) {
          applicationData.modes = applicationData.modes.map((mode: any) => ({
            mode_id: mode.mode_id || mode.id
          }));
        }

        setFormData(applicationData);
        setFirms(firmsRes.data.results);
        setKeepingServices(keepingServicesRes.data.results);
        setWorkingServices(workingServicesTariffRes.data.results);
        setTransportTypes(transportTypesRes.data.results);
        setStorages(storagesRes.data.results);
        
        const productsWithDefaults = productsRes.data.results.map((product:any) => ({
          ...product,
          measurement_id: product.measurement_id || 0,
          category_id: product.category_id || 0,
        }));
        
        setProducts(productsWithDefaults);
        setAvailableModes(modesRes.data.results);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error loading application data');
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();
      
      // Create upload_transport array from transport data
      const upload_transport = formData.transport.map(t => ({
        transport_number: t.transport_number,
        transport_type: t.transport_type
      }));

      // Create a copy of form data without the transport array
      const formDataWithoutTransport = {
        ...formData,
        upload_transport, // Add the upload_transport array
        transport: undefined // Remove the original transport array
      };

      // Append all form data
      Object.entries(formDataWithoutTransport).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== 'decloration_file' && key !== 'photo_report') {
          if (Array.isArray(value)) {
            formDataToSend.append(key, JSON.stringify(value));
          } else {
            formDataToSend.append(key, value.toString());
          }
        }
      });

      // Handle file uploads
      if (formData.decloration_file instanceof File) {
        formDataToSend.append('decloration_file', formData.decloration_file);
      }

      if (formData.photo_report && Array.isArray(formData.photo_report)) {
        formData.photo_report.forEach((photo) => {
          if (photo instanceof File) {
            formDataToSend.append('photo_report', photo);
          }
        });
      }

      const response = await api.put(`/application/${id}/`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (response.status === 200) {
        setModalMessage(t('editApplication.successMessage'));
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      console.error('Error updating application:', error);
      if (error.response?.status === 401) {
        setModalMessage(t('common.sessionExpired'));
        setShowSuccessModal(true);
        setTimeout(() => {
          navigate('/login');
        }, 1500);
        return;
      }
      
      let errorMessages = '';
      if (error.response?.data) {
        errorMessages = Object.entries(error.response.data)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n');
      }
      setModalMessage(`Error updating application:\n${errorMessages}`);
      setShowSuccessModal(true);
    }
  };

  const handleDeclarationSubmit = () => {
    if (!formData.decloration_number || !formData.decloration_date) {
      setModalMessage(t('editApplication.declarationFieldsRequired'));
      setShowSuccessModal(true);
      return;
    }

    setModalMessage(t('editApplication.declarationAdded'));
    setShowSuccessModal(true);
    
    setTimeout(() => {
      setSelectedTab(5);
    }, 1500);
  };

  const validateDate = (dateString: string): boolean => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'coming_date' | 'decloration_date') => {
    const value = e.target.value;
    if (validateDate(value)) {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        decloration_file: file
      }));
    }
  };

  const handleTabChange = (index: number) => {
    setSelectedTab(index);
  };

  const classNames = (...classes: string[]) => {
    return classes.filter(Boolean).join(' ');
  };

  const inputClassName = `mt-1 block w-full rounded-md border border-gray-300 
    dark:border-gray-600 px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm 
    focus:border-[#6C5DD3] focus:outline-none focus:ring-1 
    focus:ring-[#6C5DD3] bg-white dark:bg-gray-700 
    text-gray-900 dark:text-gray-100 transition-colors`;

  const TransportSection = () => {
    const { t } = useTranslation();
    const { formData, setFormData } = useFormContext();
    const [transportNumber, setTransportNumber] = useState('');
    const [transportTypeId, setTransportTypeId] = useState<number>(0);

    const typedFormData = formData as EditApplicationFormState;

    const handleAddTransport = () => {
      if (!transportNumber || !transportTypeId) return;

      const isDuplicate = typedFormData.transport.some(
        (t: any) => t.transport_number.toLowerCase() === transportNumber.toLowerCase()
      );

      if (isDuplicate) {
        alert(t('editApplication.duplicateTransportNumber'));
        return;
      }

      const newTransport = {
        transport_number: transportNumber,
        transport_type: transportTypeId
      };

      setFormData((prev:any) => ({
        ...prev,
        transport: [...prev.transport, newTransport]
      }));

      setTransportNumber('');
      setTransportTypeId(0);
    };

    const handleRemoveTransport = (index: number) => {
      setFormData((prev:any) => ({
        ...prev,
        transport: prev.transport.filter((_:any, i:number) => i !== index)
      }));
    };

    return (
      <div className="mt-4 sm:mt-6 border-t pt-4 sm:pt-6">
        <div className="space-y-3 sm:space-y-4">
          <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
            {t('editApplication.transportInfo')}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('editApplication.transportType')}
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
                  {t('editApplication.selectTransportType')}
                </option>
                {transportTypes?.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.transport_type}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('editApplication.transportNumber')}
              </label>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                <input
                  type="text"
                  value={transportNumber}
                  onChange={(e) => setTransportNumber(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 
                    px-3 sm:px-4 py-2 sm:py-2.5 text-sm focus:border-[#6C5DD3] focus:ring-1 
                    focus:ring-[#6C5DD3] bg-white dark:bg-gray-700 
                    text-gray-900 dark:text-gray-100 transition-colors"
                  placeholder={t('editApplication.transportNumber')}
                />
                <button
                  onClick={handleAddTransport}
                  disabled={!transportNumber || !transportTypeId}
                  className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-[#6C5DD3] text-white 
                    rounded-lg font-medium hover:bg-[#5b4eb3] disabled:opacity-50 
                    disabled:cursor-not-allowed transition-colors duration-200 ease-in-out 
                    shadow-sm whitespace-nowrap text-sm"
                >
                  {t('editApplication.addTransport')}
                </button>
              </div>
            </div>
          </div>

          {typedFormData.transport.length > 0 && (
            <div className="mt-4 sm:mt-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                {t('editApplication.selectedTransports')}:
              </h4>
              <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2">
                {typedFormData.transport.map((transport:any, index:number) => (
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
                        {t('editApplication.transportNumber')}: {transport.transport_number}
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

  const truncateFileName = (url: string, maxLength: number = 30) => {
    const fileName = url.split('/').pop() || '';
    if (fileName.length <= maxLength) return fileName;
    
    const extension = fileName.split('.').pop() || '';
    const nameWithoutExt = fileName.slice(0, fileName.lastIndexOf('.'));
    
    const truncatedName = nameWithoutExt.slice(0, maxLength - extension.length - 4) + '...'; 
    return `${truncatedName}.${extension}`;
  };

  const formatDateString = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '';

    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      const fullYear = year.length === 2 ? `20${year}` : year;
      return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    if (dateStr.includes('.')) {
      const [day, month, year] = dateStr.split('.');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      return dateStr;
    }

    return dateStr;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5DD3]"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <FormContext.Provider value={{ 
      formData: formData as ApplicationFormData, 
      setFormData: setFormData as React.Dispatch<React.SetStateAction<ApplicationFormData>>
    }}>
      <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto">
        <Tab.Group selectedIndex={selectedTab} onChange={handleTabChange}>
          <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1 
            overflow-x-auto sticky top-0 z-10 mb-4 -mx-2 sm:mx-0 
            scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            <Tab
              className={({ selected }) =>
                classNames(
                  'whitespace-nowrap rounded-lg py-2 px-3 sm:py-2.5 sm:px-4 text-xs sm:text-sm font-medium leading-5',
                  'min-w-[100px] sm:min-w-[120px] flex-shrink-0',
                  'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                  'transition-all duration-200 ease-in-out',
                  selected
                    ? 'bg-white text-[#6C5DD3] shadow-sm'
                    : 'text-gray-500 hover:bg-white/[0.12] hover:text-[#6C5DD3]'
                )
              }
            >
              {t('editApplication.basicInfo', 'Basic Info')}
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'whitespace-nowrap rounded-lg py-2 px-3 sm:py-2.5 sm:px-4 text-xs sm:text-sm font-medium leading-5',
                  'min-w-[100px] sm:min-w-[120px] flex-shrink-0',
                  'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                  'transition-all duration-200 ease-in-out',
                  selected
                    ? 'bg-white text-[#6C5DD3] shadow-sm'
                    : 'text-gray-500 hover:bg-white/[0.12] hover:text-[#6C5DD3]'
                )
              }
            >
              {t('editApplication.services')}
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'whitespace-nowrap rounded-lg py-2 px-3 sm:py-2.5 sm:px-4 text-xs sm:text-sm font-medium leading-5',
                  'min-w-[100px] sm:min-w-[120px] flex-shrink-0',
                  'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                  'transition-all duration-200 ease-in-out',
                  selected
                    ? 'bg-white text-[#6C5DD3] shadow-sm'
                    : 'text-gray-500 hover:bg-white/[0.12] hover:text-[#6C5DD3]'
                )
              }
            >
              {t('editApplication.photoReport')}
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'whitespace-nowrap rounded-lg py-2 px-3 sm:py-2.5 sm:px-4 text-xs sm:text-sm font-medium leading-5',
                  'min-w-[100px] sm:min-w-[120px] flex-shrink-0',
                  'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                  'transition-all duration-200 ease-in-out',
                  selected
                    ? 'bg-white text-[#6C5DD3] shadow-sm'
                    : 'text-gray-500 hover:bg-white/[0.12] hover:text-[#6C5DD3]'
                )
              }
            >
              {t('editApplication.products')}
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'whitespace-nowrap rounded-lg py-2 px-3 sm:py-2.5 sm:px-4 text-xs sm:text-sm font-medium leading-5',
                  'min-w-[100px] sm:min-w-[120px] flex-shrink-0',
                  'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                  'transition-all duration-200 ease-in-out',
                  selected
                    ? 'bg-white text-[#6C5DD3] shadow-sm'
                    : 'text-gray-500 hover:bg-white/[0.12] hover:text-[#6C5DD3]'
                )
              }
            >
              {t('editApplication.declaration')}
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'whitespace-nowrap rounded-lg py-2 px-3 sm:py-2.5 sm:px-4 text-xs sm:text-sm font-medium leading-5',
                  'min-w-[100px] sm:min-w-[120px] flex-shrink-0',
                  'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                  'transition-all duration-200 ease-in-out',
                  selected
                    ? 'bg-white text-[#6C5DD3] shadow-sm'
                    : 'text-gray-500 hover:bg-white/[0.12] hover:text-[#6C5DD3]'
                )
              }
            >
              {t('editApplication.modes')}
            </Tab>
          </Tab.List>

          <Tab.Panels className="mt-4">
            <Tab.Panel>
              <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="sm:col-span-2 mb-4">
                    <div className="flex items-center">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">
                        {t('editApplication.vipApplication')}
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, vip_application: !prev.vip_application }))}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 
                          border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          formData.vip_application ? 'bg-[#6C5DD3]' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                        role="switch"
                        aria-checked={formData.vip_application}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full 
                            bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            formData.vip_application ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('editApplication.applicationNumber')}
                    </label>
                    <input
                      type="text"
                      value={formData.number_of_application || ''}
                      onChange={(e) => setFormData({ ...formData, number_of_application: e.target.value })}
                      className={inputClassName}
                      placeholder={t('editApplication.enterApplicationNumber')}
                    />
                  </div>

                  <div className="relative">
                    <label htmlFor="firm_search" className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                      {t('editApplication.firm')}
                    </label>
                    <select
                      value={formData.firm_id}
                      onChange={(e) => setFormData({ ...formData, firm_id: Number(e.target.value) })}
                      className={inputClassName}
                    >
                      <option value="">Select Firm</option>
                      {firms.map((firm) => (
                        <option key={firm.id} value={firm.id}>{firm.firm_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('editApplication.brutto')}
                    </label>
                    <input
                      type="number"
                      value={formData.brutto || ''}
                      onChange={(e) => setFormData({ ...formData, brutto: Number(e.target.value) })}
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('editApplication.netto')}
                    </label>
                    <input
                      type="number"
                      value={formData.netto || ''}
                      onChange={(e) => setFormData({ ...formData, netto: Number(e.target.value) })}
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('editApplication.comingDate')}
                    </label>
                    <input
                      type="date"
                      value={formData.coming_date || ''}
                      onChange={(e) => handleDateChange(e, 'coming_date')}
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('editApplication.deportedDate')}
                    </label>
                    <input
                      type="date"
                      value={formData.deported_date ? formatDateString(formData.deported_date) : ''}
                      readOnly
                      disabled
                      className={`${inputClassName} bg-gray-100 dark:bg-gray-800 cursor-not-allowed`}
                    />
                  </div>
                </div>

                <TransportSection />

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedTab(1)}
                    className="w-full sm:w-auto bg-[#6C5DD3] text-white px-6 py-2.5 rounded-lg 
                      hover:bg-[#5b4eb3] transition-colors duration-200 ease-in-out
                      text-sm font-medium shadow-sm"
                  >
                    {t('editApplication.next')}
                  </button>
                </div>
              </div>
            </Tab.Panel>

            <Tab.Panel>
              <ServicesTab 
                formData={formData as ApplicationFormData}
                setFormData={setFormData as React.Dispatch<React.SetStateAction<ApplicationFormData>>}
                keepingServices={keepingServices}
                workingServices={workingServices}
                onSuccess={() => setSelectedTab(2)}
              />
            </Tab.Panel>

            <Tab.Panel>
              <PhotoReportTab 
                formData={formData as ApplicationFormData}
                setFormData={setFormData as React.Dispatch<React.SetStateAction<ApplicationFormData>>}
                onSuccess={() => setSelectedTab(3)}
                setSelectedTab={setSelectedTab}
              />
            </Tab.Panel>

            <Tab.Panel>
              <ProductsTab 
                formData={formData as ApplicationFormData}
                setFormData={setFormData as React.Dispatch<React.SetStateAction<ApplicationFormData>>}
                products={products}
                storages={storages}
                onSuccess={() => setSelectedTab(4)}
              />
            </Tab.Panel>

            <Tab.Panel>
              <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg shadow-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('editApplication.declarationNumber')}
                    </label>
                    <input
                      type="text"
                      value={formData.decloration_number}
                      onChange={(e) => setFormData({ ...formData, decloration_number: e.target.value })}
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t('editApplication.declarationDate')}
                    </label>
                    <input
                      type="date"
                      value={formData.decloration_date || ''}
                      onChange={(e) => handleDateChange(e, 'decloration_date')}
                      className={inputClassName}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('editApplication.declarationFile')}
                    </label>
                    {formData.decloration_file && typeof formData.decloration_file === 'string' && (
                      <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <svg className="w-8 h-8 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {t('editApplication.currentDeclorationFile')}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={(formData.decloration_file as string).split('/').pop()}>
                                {truncateFileName(formData.decloration_file as string)}
                              </p>
                            </div>
                          </div>
                          <a
                            href={formData.decloration_file as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 text-sm text-[#6C5DD3] hover:bg-[#6C5DD3]/10 rounded-lg transition-colors flex-shrink-0"
                          >
                            {t('editApplication.view')}
                          </a>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-24 sm:h-32 
                        border-2 border-gray-300 border-dashed rounded-lg cursor-pointer 
                        bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <div className="flex flex-col items-center justify-center pt-4 pb-5 sm:pt-5 sm:pb-6">
                          <svg className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-4 text-gray-500 dark:text-gray-400" 
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="mb-1 sm:mb-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">{t('editApplication.clickToUpload')}</span>
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            PDF, JPG, PNG (MAX. 10MB)
                          </p>
                        </div>
                        <input type="file" className="hidden" onChange={handleFileChange} 
                          accept=".pdf,.jpg,.jpeg,.png" />
                      </label>
                    </div>
                    
                    {formData.decloration_file instanceof File && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {t('editApplication.selectedFile')}: {formData.decloration_file.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedTab(3)}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 border border-gray-300 
                      rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
                  >
                    {t('editApplication.back')}
                  </button>
                  <button
                    type="button"
                    onClick={handleDeclarationSubmit}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 bg-[#6C5DD3] 
                      text-white rounded-lg hover:bg-[#5b4eb3] text-sm font-medium"
                  >
                    {t('editApplication.addDeclaration')}
                  </button>
                </div>
              </div>
            </Tab.Panel>

            <Tab.Panel>
              <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg shadow-sm">
                <ModesTab 
                  formData={formData as ApplicationFormData}
                  setFormData={setFormData as React.Dispatch<React.SetStateAction<ApplicationFormData>>}
                  onSubmit={handleSubmit}
                  availableModes={availableModes}
                  inputClassName={inputClassName}
                />
                
                <div className="mt-6 flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedTab(4)}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 border border-gray-300 
                      rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
                  >
                    {t('editApplication.back')}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/calculate-services/${id}`)}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 border border-[#6C5DD3] 
                      text-[#6C5DD3] rounded-lg hover:bg-[#6C5DD3]/10 text-sm font-medium"
                  >
                    {t('editApplication.calculate')}
                  </button>
                
                </div>
              </div>
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>

        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            setModalMessage('');
          }}
          title={modalMessage.includes('Error') ? 'Error' : 'Success'}
          message={modalMessage}
        />
      </div>
    </FormContext.Provider>
  );
}