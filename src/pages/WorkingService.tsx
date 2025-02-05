import { useState } from "react";
import { useTranslation } from "react-i18next";
import { apiService } from "../api/api";
import type { WorkingService } from "../api/api";
import SuccessModal from "../components/SuccessModal";

export default function CreateWorkingService() {
  const { t } = useTranslation();
  const [error, setError] = useState<string>("");
  const [formData, setFormData] = useState<WorkingService>({
    service_name: "",
    base_day: 1,
    base_price: "",
    extra_price: "",
    units: "day"
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const validateForm = () => {
    if (!formData.service_name.trim()) {
      setError(t('createWorkingService.error.serviceName', 'Service name is required'));
      return false;
    }
    if (!formData.base_price.trim()) {
      setError(t('createWorkingService.error.basePrice', 'Base price is required'));
      return false;
    }
    if (!formData.extra_price.trim()) {
      setError(t('createWorkingService.error.extraPrice', 'Extra price is required'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      // Format prices to have 2 decimal places
      const formattedData = {
        ...formData,
        base_price: Number(formData.base_price).toFixed(2),
        extra_price: Number(formData.extra_price).toFixed(2)
      };

      const response = await apiService.createWorkingService(formattedData);
      console.log('Working service created:', response.data);
      
      // Reset form after successful submission
      setFormData({
        service_name: "",
        base_day: 1,
        base_price: "",
        extra_price: "",
        units: "day"
      });
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Error creating working service:', error);
      setError(
        error.response?.data?.detail || 
        t('createWorkingService.error.generic', 'Failed to create working service')
      );
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Validate number inputs
    if (name === 'base_day') {
      const numValue = parseInt(value);
      if (numValue < 1) return;
      setFormData(prev => ({ ...prev, [name]: numValue }));
      return;
    }

    // Validate price inputs
    if (name === 'base_price' || name === 'extra_price') {
      if (!/^\d*\.?\d{0,2}$/.test(value)) return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-gray-900">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          {t('createWorkingService.title', 'Create Working Service')}
        </h1>
        <p className="mt-1 sm:mt-2 text-sm text-gray-600 dark:text-gray-400">
          {t('createWorkingService.subtitle', 'Add a new working service')}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full max-w-4xl">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
            {t('createWorkingService.serviceInfo.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label htmlFor="service_name" className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                {t('createWorkingService.serviceInfo.name', 'Service Name')}*
              </label>
              <input
                type="text"
                name="service_name"
                id="service_name"
                required
                value={formData.service_name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm 
                  focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                placeholder={t('createWorkingService.serviceInfo.namePlaceholder', 'Enter service name')}
              />
            </div>
            <div>
              <label 
                htmlFor="base_day" 
                className="block text-sm font-medium text-gray-600 dark:text-gray-400"
              >
                {t('createWorkingService.serviceInfo.baseDay', 'Base Days')}
              </label>
              <input
                type="number"
                name="base_day"
                id="base_day"
                value={formData.base_day}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm 
                  focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                placeholder={t('createWorkingService.serviceInfo.baseDayPlaceholder', 'Enter base days')}
              />
            </div>
            <div>
              <label 
                htmlFor="base_price" 
                className="block text-sm font-medium text-gray-600 dark:text-gray-400"
              >
                {t('createWorkingService.serviceInfo.basePrice', 'Base Price')}
              </label>
              <input
                type="text"
                name="base_price"
                id="base_price"
                value={formData.base_price}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm 
                  focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                placeholder={t('createWorkingService.serviceInfo.basePricePlaceholder', 'Enter base price')}
              />
            </div>
            <div>
              <label 
                htmlFor="extra_price" 
                className="block text-sm font-medium text-gray-600 dark:text-gray-400"
              >
                {t('createWorkingService.serviceInfo.extraPrice', 'Extra Price')}
              </label>
              <input
                type="text"
                name="extra_price"
                id="extra_price"
                value={formData.extra_price}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm 
                  focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                placeholder={t('createWorkingService.serviceInfo.extraPricePlaceholder', 'Enter extra price')}
              />
            </div>
            <div>
              <label 
                htmlFor="units" 
                className="block text-sm font-medium text-gray-600 dark:text-gray-400"
              >
                {t('createWorkingService.serviceInfo.units', 'Units')}
              </label>
              <input
                type="text"
                name="units"
                id="units"
                value={formData.units}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm 
                  focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                placeholder={t('createWorkingService.serviceInfo.unitsPlaceholder', 'Enter units')}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto bg-[#6C5DD3] text-white px-4 py-2 text-sm rounded-lg hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2"
          >
            {t('createWorkingService.submit', 'Create Service')}
          </button>
        </div>
      </form>
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={t('createWorkingService.success', 'Working service created successfully')}
      />
    </div>
  );
}