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
  const [firms, setFirms] = useState<Firm[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
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
    <div className="p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          {t('createApplication.title', 'Create Application')}
        </h1>
        <p className="mt-1 sm:mt-2 text-sm text-gray-600 dark:text-gray-400">
          {t('createApplication.subtitle', 'Fill in the application details below')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full max-w-4xl">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
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
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label htmlFor="firm_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('createApplication.firmId', 'Firm')}
              </label>
              <select
                name="firm_id"
                id="firm_id"
                value={formData.firm_id || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="">{t('createApplication.selectFirm', 'Select Firm')}</option>
                {firms.map(firm => (
                  <option key={firm.id} value={firm.id}>{firm.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('createApplication.paymentMethod', 'Payment Method')}
              </label>
              <select
                name="payment_method"
                id="payment_method"
                value={formData.payment_method || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="">{t('createApplication.selectPaymentMethod', 'Select Payment Method')}</option>
                {paymentMethods.map(method => (
                  <option key={method.id} value={method.id}>{method.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Declaration Information */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
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
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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

        {/* Quantities and Services */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
            {t('createApplication.quantitiesAndServices', 'Quantities and Services')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
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
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
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
    </div>
  );
} 