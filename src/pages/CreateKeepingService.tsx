import { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/api";
import SuccessModal from "../components/SuccessModal";
import FormLayout from "../components/FormLayout";
import { useNavigate, useSearchParams } from 'react-router-dom';

interface KeepingServiceFormData {
  year: number;
  base_day: number;
  base_price: string;
  extra_price: string;
  keeping_services_id: number;
}

export default function CreateKeepingService() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const serviceId = Number(searchParams.get('id'));
  const serviceName = searchParams.get('name');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState<KeepingServiceFormData>({
    year: new Date().getFullYear(),
    base_day: 0,
    base_price: "",
    extra_price: "",
    keeping_services_id: serviceId,
  });
  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? 0 : Number(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/keeping_service/keeping_service_price/', {
        year: formData.year,
        base_day: formData.base_day,
        base_price: formData.base_price,
        extra_price: formData.extra_price,
        keeping_services_id: serviceId
      });

      setShowSuccessModal(true);
      
      // Reset form
      setFormData({
        year: new Date().getFullYear(),
        base_day: 0,
        base_price: "",
        extra_price: "",
        keeping_services_id: serviceId,
      });
      navigate('/keeping-services');
    
    } catch (error: any) {
      console.error('Error creating keeping service:', error);
      let errorMessage = t('createKeepingService.errorMessage', 'Failed to create service. Please try again.');
      
      if (error.response?.data) {
        const serverError = error.response.data;
        errorMessage = typeof serverError === 'object' 
          ? Object.entries(serverError).map(([key, value]) => `${key}: ${value}`).join('\n')
          : serverError.toString();
      }
      
      alert(errorMessage);
    }
  };

  return (
    <FormLayout
      title={t('createKeepingService.title', 'Create Keeping Service Price')}
      subtitle={serviceName ? t('createKeepingService.subtitleWithName', 'Add pricing details for {{name}}', { name: serviceName }) 
        : t('createKeepingService.subtitle', 'Add pricing details for the service')}
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full max-w-7xl mx-auto px-4 sm:px-6">
        <div className="dark:bg-gray-800 p-4 sm:p-6 lg:p-8 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="col-span-1">
              <label 
                htmlFor="year" 
                className="block text-sm font-medium text-gray-600 dark:text-white mb-1"
              >
                {t('createKeepingService.year', 'Year')}
              </label>
              <input
                type="number"
                name="year"
                id="year"
                value={formData.year}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                  px-3 py-2 text-sm md:text-base
                  focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                required
              />
            </div>

            <div className="col-span-1">
              <label 
                htmlFor="base_day" 
                className="block text-sm font-medium text-gray-600 dark:text-white mb-1"
              >
                {t('createKeepingService.baseDays', 'Base Days')}
              </label>
              <input
                type="number"
                name="base_day"
                id="base_day"
                value={formData.base_day}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                  px-3 py-2 text-sm md:text-base
                  focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                required
              />
            </div>

            <div className="col-span-1">
              <label 
                htmlFor="base_price" 
                className="block text-sm font-medium text-gray-600 dark:text-white mb-1"
              >
                {t('createKeepingService.basePrice', 'Base Price')}
              </label>
              <input
                type="text"
                name="base_price"
                id="base_price"
                value={formData.base_price}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                  px-3 py-2 text-sm md:text-base
                  focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                required
              />
            </div>

            <div className="col-span-1">
              <label 
                htmlFor="extra_price" 
                className="block text-sm font-medium text-gray-600 dark:text-white mb-1"
              >
                {t('createKeepingService.extraPrice', 'Extra Price')}
              </label>
              <input
                type="text"
                name="extra_price"
                id="extra_price"
                value={formData.extra_price}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                  px-3 py-2 text-sm md:text-base
                  focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base
              bg-[#6C5DD3] text-white rounded-lg hover:bg-[#5c4eb3]
              focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2"
          >
            {t('createKeepingService.submit', 'Create Service')}
          </button>
        </div>
      </form>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={t('createKeepingService.successMessage', 'Service has been created successfully!')}
      />
    </FormLayout>
  );
}