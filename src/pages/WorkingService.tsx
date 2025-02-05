import { useState } from "react";
import { useTranslation } from "react-i18next";
import { apiService } from "../api/api";
import type { WorkingService } from "../api/api";

export default function CreateWorkingService() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<WorkingService>({
    name: "",
    price: "",
    base_day: 1,
    base_price: "",
    extra_price: "",
    units: "day"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiService.createWorkingService(formData);
      console.log('Working service created:', response.data);
      setFormData({
        name: "",
        price: "",
        base_day: 1,
        base_price: "",
        extra_price: "",
        units: "day"
      });
    } catch (error) {
      console.error('Error creating working service:', error);
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
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900">{t('createWorkingService.title')}</h1>
        <p className="mt-1 sm:mt-2 text-sm text-gray-600">
          {t('createWorkingService.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full max-w-4xl">
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-100">
          <h2 className="text-sm font-medium text-gray-900 mb-3 sm:mb-4">{t('createWorkingService.serviceInfo.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label 
                htmlFor="name" 
                className="block text-sm font-medium text-gray-600"
              >
                {t('createWorkingService.serviceInfo.name', 'Service Name')}
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                placeholder={t('createWorkingService.serviceInfo.namePlaceholder', 'Enter service name')}
              />
            </div>
            <div>
              <label 
                htmlFor="base_day" 
                className="block text-sm font-medium text-gray-600"
              >
                {t('createWorkingService.serviceInfo.baseDay', 'Base Days')}
              </label>
              <input
                type="number"
                name="base_day"
                id="base_day"
                value={formData.base_day}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                placeholder={t('createWorkingService.serviceInfo.baseDayPlaceholder', 'Enter base days')}
              />
            </div>
            <div>
              <label 
                htmlFor="base_price" 
                className="block text-sm font-medium text-gray-600"
              >
                {t('createWorkingService.serviceInfo.basePrice', 'Base Price')}
              </label>
              <input
                type="text"
                name="base_price"
                id="base_price"
                value={formData.base_price}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                placeholder={t('createWorkingService.serviceInfo.basePricePlaceholder', 'Enter base price')}
              />
            </div>
            <div>
              <label 
                htmlFor="extra_price" 
                className="block text-sm font-medium text-gray-600"
              >
                {t('createWorkingService.serviceInfo.extraPrice', 'Extra Price')}
              </label>
              <input
                type="text"
                name="extra_price"
                id="extra_price"
                value={formData.extra_price}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                placeholder={t('createWorkingService.serviceInfo.extraPricePlaceholder', 'Enter extra price')}
              />
            </div>
            <div>
              <label 
                htmlFor="units" 
                className="block text-sm font-medium text-gray-600"
              >
                {t('createWorkingService.serviceInfo.units', 'Units')}
              </label>
              <input
                type="text"
                name="units"
                id="units"
                value={formData.units}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
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
            {t('createWorkingService.submit')}
          </button>
        </div>
      </form>
    </div>
  );
}