import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { apiService } from "../api/api";
import SuccessModal from "../components/SuccessModal";

interface WorkingServiceFormData {
  base_day: number;
  service_name: string;
  base_price: string;
  extra_price: string;
  units: string;
}

export default function CreateWorkingService() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<WorkingServiceFormData>({
    base_day: 1,
    service_name: "",
    base_price: "",
    extra_price: "",
    units: "day",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiService.createWorkingService(formData);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error creating working service:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'base_day' ? parseInt(value) || 0 : value
    }));
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          {t("createWorkingService.title")}
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {t("createWorkingService.subtitle")}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow">
          <div className="space-y-4">
            <div>
              <label htmlFor="service_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("createWorkingService.serviceInfo.name")}
              </label>
              <input
                type="text"
                id="service_name"
                name="service_name"
                value={formData.service_name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            <div>
              <label htmlFor="base_day" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("createWorkingService.serviceInfo.baseDay")}
              </label>
              <input
                type="number"
                id="base_day"
                name="base_day"
                value={formData.base_day}
                onChange={handleChange}
                min="1"
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            <div>
              <label htmlFor="base_price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("createWorkingService.serviceInfo.basePrice")}
              </label>
              <input
                type="number"
                id="base_price"
                name="base_price"
                value={formData.base_price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            <div>
              <label htmlFor="extra_price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("createWorkingService.serviceInfo.extraPrice")}
              </label>
              <input
                type="number"
                id="extra_price"
                name="extra_price"
                value={formData.extra_price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              />
            </div>

            <div>
              <label htmlFor="units" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("createWorkingService.serviceInfo.units")}
              </label>
              <select
                id="units"
                name="units"
                value={formData.units}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
              >
                <option value="day">{t("createWorkingService.serviceInfo.units.day")}</option>
                <option value="hour">{t("createWorkingService.serviceInfo.units.hour")}</option>
                <option value="piece">{t("createWorkingService.serviceInfo.units.piece")}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate("/working-services")}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-[#6C5DD3] rounded-md hover:bg-[#5c4eb3]"
          >
            {t("common.create")}
          </button>
        </div>
      </form>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate("/working-services");
        }}
        message={t("workingService.createSuccess")}
      />
    </div>
  );
}