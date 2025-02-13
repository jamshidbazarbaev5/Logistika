import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../api/api";
import SuccessModal from "../components/SuccessModal";
import { Tab } from "@headlessui/react";
import { FormContext, ApplicationFormData } from "../context/FormContext";
import ServicesTab from  '../components/ServicesTab'
import PhotoReportTab from "../components/PhotoReportTab";
import ProductsTab from "../components/ProductsTab";
import ModesTab from "../components/ModesTab";
import { useFormContext } from "../context/FormContext";


export default function EditApplication() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  
  const [formData, setFormData] = useState<ApplicationFormData>({
    firm_id: 0,
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
    photo_report: [],
    transport: [],
    modes: [],
    products: [],
    decloration_file: undefined,
  });

  const [firms, setFirms] = useState<Array<{ id: number; firm_name: string }>>([]);
  const [keepingServices, setKeepingServices] = useState<Array<{ id: number; name: string; base_price: number }>>([]);
  const [workingServices, setWorkingServices] = useState<Array<{ id: number; service_name: string; base_price: number }>>([]);
  const [, setTransportTypes] = useState<Array<{ id: number; transport_type: string }>>([]);
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
          workingServicesRes,
          transportTypesRes,
          storagesRes,
          productsRes,
          modesRes
        ] = await Promise.all([
          api.get(`/application/${id}/`),
          api.get('/firms/'),
          api.get('/keeping_service/'),
          api.get('/working_service/'),
          api.get('/transport/type/'),
          api.get('/storage/'),
          api.get('/items/product/'),
          api.get('/modes/modes/')
        ]); 

        const applicationData = applicationRes.data;
        if (applicationData.coming_date) {
          const [day, month, year] = applicationData.coming_date.split('.');
          applicationData.coming_date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        if (applicationData.decloration_date) {
          const [day, month, year] = applicationData.decloration_date.split('.');
          applicationData.decloration_date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }

        if (applicationData.modes && Array.isArray(applicationData.modes)) {
          applicationData.modes = applicationData.modes.map((mode: any) => ({
            mode_id: mode.mode_id || mode.id
          }));
        }

        setFormData(applicationData);
        setFirms(firmsRes.data.results);
        setKeepingServices(keepingServicesRes.data.results);
        setWorkingServices(workingServicesRes.data.results);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        JSON.stringify(formData.keeping_services.map(service => ({
          keeping_services_id: service.keeping_services_id,
          day: service.day
        })))
      );
      
      formDataObj.append('upload_working_services_quantity', 
        JSON.stringify(formData.working_services.map(service => ({
          service_id: service.service_id,
          quantity: service.quantity
        })))
      );
      
      formDataObj.append('upload_transport', 
        JSON.stringify(formData.transport.map(t => ({
          transport_type: t.transport_type,
          transport_number: t.transport_number
        })))
      );
      
      formDataObj.append('upload_modes', 
        JSON.stringify(formData.modes)
      );
      
      formDataObj.append('upload_products', 
        JSON.stringify(formData.products.map(product => ({
          product_id: product.product_id,
          storage_id: product.storage_id,
          quantity: product.quantity
        })))
      );

      if (formData.decloration_file instanceof File) {
        formDataObj.append('decloration_file', formData.decloration_file);
      }

      if (formData.photo_report && formData.photo_report.length > 0) {
        const photoData: any[] = [];
        
        formData.photo_report.forEach((photo: any) => {
          if (photo.isNew && photo.photo instanceof File) {
            formDataObj.append(`upload_photos`, photo.photo);
          } else if (typeof photo.photo === 'string') {
            photoData.push({ photo: photo.photo });
          }
        });
      } else {
        formDataObj.append('upload_photos', '[]');
      }

      await api.put(`/application/${id}/`, formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setModalMessage('Application updated successfully!');
      setShowSuccessModal(true);
      
      setTimeout(() => {
        navigate('/application-list');
      }, 2000);

    } catch (error: any) {
      console.error('Error updating application:', error);
      if (error.response?.data) {
        const errorMessages = Object.entries(error.response.data)
          .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
          .join('\n');
        setModalMessage(`Error updating application:\n${errorMessages}`);
      } else {
        setModalMessage('Error updating application');
      }
      setShowSuccessModal(true);
    }
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
    const [transportTypes, setTransportTypes] = useState<Array<{ id: number; transport_type: string }>>([]);

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

      // Check if transport number already exists for this application
      const isDuplicate = formData.transport.some(
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
      <div className="mt-6 sm:mt-8 border-t pt-6 sm:pt-8">
        <div className="space-y-4">
          <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
            {t('editApplication.transportInfo')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
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

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('editApplication.transportNumber')}
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
                  placeholder={t('editApplication.transportNumber')}
                />
                <button
                  onClick={handleAddTransport}
                  disabled={!transportNumber || !transportTypeId}
                  className="px-6 py-2.5 bg-[#6C5DD3] text-white rounded-lg font-medium
                    hover:bg-[#5b4eb3] disabled:opacity-50 disabled:cursor-not-allowed
                    transition-colors duration-200 ease-in-out shadow-sm
                    whitespace-nowrap"
                >
                  {t('editApplication.addTransport')}
                </button>
              </div>
            </div>
          </div>

          {formData.transport.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                {t('editApplication.selectedTransports')}:
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                {formData.transport.map((transport:any, index:number) => (
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
    <FormContext.Provider value={{ formData, setFormData }}>
      <div className="p-2 sm:p-4 md:p-6">
        <Tab.Group selectedIndex={selectedTab} onChange={handleTabChange}>
          <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1 overflow-x-auto sticky top-0 z-10 mb-4">
            <Tab
              className={({ selected }) =>
                classNames(
                  'whitespace-nowrap rounded-lg py-2.5 px-4 text-sm font-medium leading-5 min-w-[120px]',
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
                  'whitespace-nowrap rounded-lg py-2.5 px-4 text-sm font-medium leading-5 min-w-[120px]',
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
                  'whitespace-nowrap rounded-lg py-2.5 px-4 text-sm font-medium leading-5 min-w-[120px]',
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
                  'whitespace-nowrap rounded-lg py-2.5 px-4 text-sm font-medium leading-5 min-w-[120px]',
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
                  'whitespace-nowrap rounded-lg py-2.5 px-4 text-sm font-medium leading-5 min-w-[120px]',
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
                  'whitespace-nowrap rounded-lg py-2.5 px-4 text-sm font-medium leading-5 min-w-[120px]',
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                    <label className="block text-sm font-medium text-gray-700">Declaration Number</label>
                    <input
                      type="text"
                      value={formData.decloration_number}
                      onChange={(e) => setFormData({ ...formData, decloration_number: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#6C5DD3] focus:ring-[#6C5DD3]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Brutto</label>
                    <input
                      type="number"
                      value={formData.brutto || ''}
                      onChange={(e) => setFormData({ ...formData, brutto: Number(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#6C5DD3] focus:ring-[#6C5DD3]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Netto</label>
                    <input
                      type="number"
                      value={formData.netto || ''}
                      onChange={(e) => setFormData({ ...formData, netto: Number(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#6C5DD3] focus:ring-[#6C5DD3]"
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
              <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t('editApplication.comingDate')}
                    </label>
                    <input
                      type="date"
                      value={formData.coming_date}
                      onChange={(e) => handleDateChange(e, 'coming_date')}
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t('editApplication.declarationDate')}
                    </label>
                    <input
                      type="date"
                      value={formData.decloration_date}
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
                            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                Current Declaration File
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formData.decloration_file.split('/').pop()}
                              </p>
                            </div>
                          </div>
                          <a
                            href={formData.decloration_file}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 text-sm text-[#6C5DD3] hover:bg-[#6C5DD3]/10 rounded-lg transition-colors"
                          >
                            View
                          </a>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            PDF, JPG, PNG (MAX. 10MB)
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          accept=".pdf,.jpg,.jpeg,.png"
                        />
                      </label>
                    </div>
                    
                    {formData.decloration_file instanceof File && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Selected file: {formData.decloration_file.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setSelectedTab(0)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    {t('editApplication.back')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedTab(2)}
                    className="bg-[#6C5DD3] text-white px-6 py-2 rounded-lg hover:bg-[#5b4eb3]"
                  >
                    {t('editApplication.next')}
                  </button>
                </div>
              </div>
            </Tab.Panel>

            <Tab.Panel>
              <ServicesTab 
                formData={formData}
                setFormData={setFormData}
                keepingServices={keepingServices}
                workingServices={workingServices}
                onSuccess={() => setSelectedTab(3)}
              />
            </Tab.Panel>

            <Tab.Panel>
              <PhotoReportTab 
                formData={formData}
                setFormData={setFormData}
                onSuccess={() => setSelectedTab(4)}
                setSelectedTab={setSelectedTab}
              />
            </Tab.Panel>

            <Tab.Panel>
              <ProductsTab 
                formData={formData}
                setFormData={setFormData}
                products={products}
                storages={storages}
                onSuccess={() => setSelectedTab(5)}
              />
            </Tab.Panel>

            <Tab.Panel>
              <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg shadow-sm">
                {/* Add VIP Application toggle before the modes section */}
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">
                      {t('editApplication.vipApplication')}
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, vip_application: !prev.vip_application }))}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        formData.vip_application ? 'bg-[#6C5DD3]' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                      role="switch"
                      aria-checked={formData.vip_application}
                    >
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          formData.vip_application ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                
                <ModesTab 
                  formData={formData}
                  setFormData={setFormData}
                  onSubmit={handleSubmit}
                  availableModes={availableModes}
                />
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