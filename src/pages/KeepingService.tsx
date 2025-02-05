import { useState } from "react";
import { useTranslation } from "react-i18next";
import { apiService } from "../api/api";
import type { KeepingService } from "../api/api";

export default function CreateKeepingService() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<KeepingService>({
    base_day: 1,
    name: "",
    base_price: "",
    extra_price: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiService.createKeepingService(formData);
      console.log('Keeping service created:', response.data);
      setFormData({
        base_day: 1,
        name: "",
        base_price: "",
        extra_price: "",
      });
    } catch (error) {
      console.error('Error creating keeping service:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'number' 
      ? parseInt(e.target.value) 
      : e.target.value;
    
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900">
          {t('createKeepingService.title', 'Create Keeping Service')}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {t('createKeepingService.subtitle', 'Add a new keeping service to the system')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <div className="bg-white p-6 rounded-lg border border-gray-100">
          <h2 className="text-sm font-medium text-gray-900 mb-4">
            {t('createKeepingService.serviceInfo.title', 'Service Information')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label 
                htmlFor="name" 
                className="block text-sm font-medium text-gray-600"
              >
                {t('createKeepingService.serviceInfo.name', 'Service Name')}
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                placeholder={t('createKeepingService.serviceInfo.namePlaceholder', 'Enter service name')}
              />
            </div>
            <div>
              <label 
                htmlFor="base_day" 
                className="block text-sm font-medium text-gray-600"
              >
                {t('createKeepingService.serviceInfo.baseDay', 'Base Day')}
              </label>
              <input
                type="number"
                name="base_day"
                id="base_day"
                min="1"
                value={formData.base_day}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                placeholder={t('createKeepingService.serviceInfo.baseDayPlaceholder', 'Enter base day')}
              />
            </div>
            <div>
              <label 
                htmlFor="base_price" 
                className="block text-sm font-medium text-gray-600"
              >
                {t('createKeepingService.serviceInfo.basePrice', 'Base Price')}
              </label>
              <input
                type="text"
                name="base_price"
                id="base_price"
                value={formData.base_price}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                placeholder={t('createKeepingService.serviceInfo.basePricePlaceholder', 'Enter base price')}
              />
            </div>
            <div>
              <label 
                htmlFor="extra_price" 
                className="block text-sm font-medium text-gray-600"
              >
                {t('createKeepingService.serviceInfo.extraPrice', 'Extra Price')}
              </label>
              <input
                type="text"
                name="extra_price"
                id="extra_price"
                value={formData.extra_price}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                placeholder={t('createKeepingService.serviceInfo.extraPricePlaceholder', 'Enter extra price')}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#6C5DD3] text-white px-4 py-2 text-sm rounded-lg hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2"
          >
            {t('createKeepingService.submit', 'Create Service')}
          </button>
        </div>
      </form>
    </div>
  );
}