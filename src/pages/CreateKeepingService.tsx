import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiService } from "../api/api";
import SuccessModal from "../components/SuccessModal";
import FormLayout from "../components/FormLayout";

interface PriceFormData {
  year: number;
  base_day: number;
  base_price: string;
  extra_price: string;
  keeping_services_id: number;
}

export default function CreateKeepingService() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const serviceId = Number(searchParams.get('id'));
  const serviceName = searchParams.get('name');

  const [formData, setFormData] = useState<PriceFormData>({
    year: new Date().getFullYear(),
    base_day: 0,
    base_price: "",
    extra_price: "",
    keeping_services_id: serviceId
  });

  useEffect(() => {
    if (!serviceId || !serviceName) {
      navigate('/keeping-services');
    }
  }, [serviceId, serviceName, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createKeepingServicePrice({
        ...formData,
        year: Number(formData.year), // Ensure year is a number
        keeping_services_id: serviceId
      });
      setShowSuccessModal(true);
      setTimeout(() => {
        navigate('/keeping-services');
      }, 2000);
    } catch (error) {
      console.error('Error creating service price:', error);
      alert(t('createKeepingService.errorMessage', 'Failed to create service. Please try again.'));
    }
  };

  return (
    <FormLayout
      title={t('createKeepingService.title', 'Create Keeping Service')}
      subtitle={decodeURIComponent(serviceName || '')}
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('keepingService.year')}
            </label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-[#6C5DD3] focus:ring-[#6C5DD3] sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
              min={2024}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('keepingService.baseDay')}
            </label>
            <input
              type="number"
              value={formData.base_day}
              onChange={(e) => setFormData({ ...formData, base_day: Number(e.target.value) })}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-[#6C5DD3] focus:ring-[#6C5DD3] sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
              min={0}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('keepingService.basePrice')}
            </label>
            <input
              type="text"
              value={formData.base_price}
              onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-[#6C5DD3] focus:ring-[#6C5DD3] sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
              pattern="^\d+(\.\d{0,2})?$"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('keepingService.extraPrice')}
            </label>
            <input
              type="text"
              value={formData.extra_price}
              onChange={(e) => setFormData({ ...formData, extra_price: e.target.value })}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-[#6C5DD3] focus:ring-[#6C5DD3] sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
              pattern="^\d+(\.\d{0,2})?$"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => navigate('/keeping-services')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-[#6C5DD3] rounded-md hover:bg-[#5c4eb3]"
          >
            {t('common.create')}
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