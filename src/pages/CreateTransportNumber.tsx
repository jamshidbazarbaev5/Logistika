import { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/api";
import SuccessModal from "../components/SuccessModal";

interface TransportNumberFormData {
  transport_number: string;
  transport_type: number;
  application_id: number;
}

export default function CreateTransportNumber() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<TransportNumberFormData>({
    transport_number: "",
    transport_type: 1,
    application_id: 1,
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/transport/number/', formData);
      setFormData({
        transport_number: "",
        transport_type: 1,
        application_id: 1,
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating transport number:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const value = e.target.type === 'number' 
      ? parseInt(e.target.value, 10) 
      : e.target.value;
    
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          {t('createTransportNumber.title', 'Create Transport Number')}
        </h1>
        <p className="mt-1 sm:mt-2 text-sm text-gray-600 dark:text-gray-400">
          {t('createTransportNumber.subtitle', 'Enter the transport number details below')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full max-w-4xl">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
            {t('createTransportNumber.transportInfo', 'Transport Information')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label 
                htmlFor="transport_number" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t('createTransportNumber.number', 'Transport Number')}
              </label>
              <input
                type="text"
                name="transport_number"
                id="transport_number"
                value={formData.transport_number}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                placeholder-gray-400 dark:placeholder-gray-500"
                placeholder={t('createTransportNumber.numberPlaceholder', 'Enter transport number')}
              />
            </div>

            <div>
              <label 
                htmlFor="transport_type" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t('createTransportNumber.type', 'Transport Type')}
              </label>
              <select
                name="transport_type"
                id="transport_type"
                value={formData.transport_type}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value={1}>Type 1</option>
                <option value={2}>Type 2</option>
                <option value={3}>Type 3</option>
              </select>
            </div>

            <div>
              <label 
                htmlFor="application_id" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {t('createTransportNumber.applicationId', 'Application ID')}
              </label>
              <input
                type="number"
                name="application_id"
                id="application_id"
                value={formData.application_id}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                placeholder-gray-400 dark:placeholder-gray-500"
                placeholder={t('createTransportNumber.applicationIdPlaceholder', 'Enter application ID')}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto bg-[#6C5DD3] text-white px-4 py-2 text-sm rounded-lg 
            hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2
            dark:focus:ring-offset-gray-800 dark:hover:bg-[#5c4eb3] transition-colors duration-200"
          >
            {t('createTransportNumber.submit', 'Create Transport Number')}
          </button>
        </div>
      </form>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={t('createTransportNumber.successMessage', 'Transport number has been created successfully!')}
      />
    </div>
  );
} 