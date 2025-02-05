import { useState } from "react";
import { useTranslation } from "react-i18next";
import { apiService } from "../api/api";
import type { Storage } from "../api/api";
import SuccessModal from "../components/SuccessModal";

export default function CreateStorage() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Storage>({
    storage_name: "",
    storage_location: "",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiService.createStorage(formData);
      console.log('Storage created:', response.data);
      setFormData({
        storage_name: "",
        storage_location: "",
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating storage:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900">{t('createStorage.title')}</h1>
        <p className="mt-1 sm:mt-2 text-sm text-gray-600">
          {t('createStorage.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full max-w-4xl">
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-100">
          <h2 className="text-sm font-medium text-gray-900 mb-3 sm:mb-4">{t('createStorage.storageInfo.title')}</h2>
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            <div>
              <label 
                htmlFor="storage_name" 
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                {t('createStorage.storageInfo.name', 'Storage Name')}
              </label>
              <input
                type="text"
                name="storage_name"
                id="storage_name"
                value={formData.storage_name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                placeholder={t('createStorage.storageInfo.namePlaceholder', 'Enter storage name')}
              />
            </div>
            <div>
              <label 
                htmlFor="storage_location" 
                className="block text-sm font-medium text-gray-600 mb-1"
              >
                {t('createStorage.storageInfo.location', 'Storage Location')}
              </label>
              <input
                type="text"
                name="storage_location"
                id="storage_location"
                value={formData.storage_location}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                placeholder={t('createStorage.storageInfo.locationPlaceholder', 'Enter storage location')}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto bg-[#6C5DD3] text-white px-4 py-2 text-sm rounded-lg hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2"
          >
            {t('createStorage.submit')}
          </button>
        </div>
      </form>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={t('createStorage.successMessage', 'Storage has been created successfully!')}
      />
    </div>
  );
} 