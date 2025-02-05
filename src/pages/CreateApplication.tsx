import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/api";
import SuccessModal from "../components/SuccessModal";

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
}

interface Firm {
  id: number;
  name: string;
}

interface PaymentMethod {
  id: number;
  name: string;
}

export default function CreateApplication() {
  const { t } = useTranslation();
  const [, setFirms] = useState<Firm[]>([]);
  const [, setPaymentMethods] = useState<PaymentMethod[]>([]);
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
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [firmsResponse, paymentMethodsResponse] = await Promise.all([
          api.get('/firms/'),
          api.get('/payment-methods/')
        ]);
        
        setFirms(firmsResponse.data);
        setPaymentMethods(paymentMethodsResponse.data);
        
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      
      // Append all form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null) {
          if (key === 'decloration_file' && value instanceof File) {
            formDataToSend.append(key, value);
          } else if (Array.isArray(value)) {
            value.forEach(item => formDataToSend.append(`${key}[]`, item.toString()));
          } else {
            formDataToSend.append(key, value.toString());
          }
        }
      });

      const response = await api.post('/application/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201 || response.status === 200) {
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
        });
        
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      console.error('Error creating application:', error);
      let errorMessage = t('createApplication.errorMessage', 'Failed to create application. Please try again.');
      
      if (error.response?.data) {
        const serverError = error.response.data;
        errorMessage = typeof serverError === 'object' 
          ? Object.entries(serverError).map(([key, value]) => `${key}: ${value}`).join('\n')
          : serverError.toString();
      }
      
      console.log(errorMessage);
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

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6 md:mb-8 lg:mb-10">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white">
          {t('createApplication.title', 'Create Application')}
        </h1>
        <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
          {t('createApplication.subtitle', 'Fill in the application details below')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8 w-full">
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 lg:p-8 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-4 md:mb-6">
            {t('createApplication.basicInfo', 'Basic Information')}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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

            <div>
              <label htmlFor="firm_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('createApplication.firmId', 'Firm')}
              </label>
              <input
                type="number"
                name="firm_id"
                id="firm_id"
                value={formData.firm_id || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('createApplication.paymentMethod', 'Payment Method')}
              </label>
              <input
                type="number"
                name="payment_method"
                id="payment_method"
                value={formData.payment_method || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 lg:p-8 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-4 md:mb-6">
            {t('createApplication.declarationInfo', 'Declaration Information')}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
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

        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 lg:p-8 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-4 md:mb-6">
            {t('createApplication.quantitiesAndServices', 'Quantities and Services')}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <div>
              <label htmlFor="unloading_quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('createApplication.unloadingQuantity', 'Unloading Quantity')}
              </label>
              <input
                type="number"
                name="unloading_quantity"
                id="unloading_quantity"
                value={formData.unloading_quantity || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="loading_quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('createApplication.loadingQuantity', 'Loading Quantity')}
              </label>
              <input
                type="number"
                name="loading_quantity"
                id="loading_quantity"
                value={formData.loading_quantity || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6 md:mt-8">
          <button
            type="submit"
            className="w-full sm:w-auto min-w-[150px] bg-[#6C5DD3] text-white px-6 py-3 text-sm md:text-base 
            rounded-lg hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] 
            focus:ring-offset-2 dark:focus:ring-offset-gray-800 dark:hover:bg-[#5c4eb3] 
            transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
} 