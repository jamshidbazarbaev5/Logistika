import { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/api";
import SuccessModal from "../components/SuccessModal";
import { useNavigate } from "react-router-dom";

interface MeasurementFormData {
  name: string;
}

export default function CreateMeasurement() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<MeasurementFormData>({
    name: "",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/items/measurement/', formData);
      
      if (response.status === 201 || response.status === 200) {
        setFormData({
          name: "",
        });
        setShowSuccessModal(true);
        // Optionally navigate to measurement list after success
        navigate('/measurements');
      }
    } catch (error: any) {
      console.error('Error creating measurement:', error);
      let errorMessage = t('createMeasurement.errorMessage', 'Failed to create measurement. Please try again.');
      
      if (error.response?.data) {
        const serverError = error.response.data;
        errorMessage = typeof serverError === 'object' 
          ? Object.entries(serverError).map(([key, value]) => `${key}: ${value}`).join('\n')
          : serverError.toString();
      }
      
      alert(errorMessage);
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
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white transition-colors">
          {t('createMeasurement.title', 'Create Measurement')}
        </h1>
        <p className="mt-1 sm:mt-2 text-sm text-gray-600 dark:text-gray-400 transition-colors">
          {t('createMeasurement.subtitle', 'Add a new measurement unit to the system')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full max-w-4xl">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-100 dark:border-gray-700 transition-colors">
          <div>
            <label 
              htmlFor="name" 
              className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors"
            >
              {t('createMeasurement.form.name', 'Measurement Name')}
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
              px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
              bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
              placeholder={t('createMeasurement.form.namePlaceholder', 'Enter measurement name (e.g., kg, m, pcs)')}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto bg-[#6C5DD3] text-white px-4 py-2 text-sm rounded-lg 
            hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2
            dark:focus:ring-offset-gray-800 transition-all duration-200"
          >
            {t('createMeasurement.submit', 'Create Measurement')}
          </button>
        </div>
      </form>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={t('common.success')}
        message={t('createMeasurement.successMessage', 'Measurement has been created successfully!')}
      />
    </div>
  );
}