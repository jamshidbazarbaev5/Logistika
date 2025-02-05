import { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/api";
import SuccessModal from "../components/SuccessModal";

interface CategoryFormData {
  name: string;
}

export default function CreateItemCategory() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/items/category/', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201 || response.status === 200) {
        setFormData({
          name: "",
        });
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      console.error('Error creating category:', error);
      let errorMessage = t('createItemCategory.errorMessage', 'Failed to create category. Please try again.');
      
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
    <div className="min-h-screen p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-6 md:mb-8 lg:mb-10">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white">
          {t('createItemCategory.title', 'Create Item Category')}
        </h1>
        <p className="mt-2 text-sm md:text-base text-gray-600 dark:text-gray-400">
          {t('createItemCategory.subtitle', 'Create a new category for items')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8 w-full max-w-4xl">
        <div className="bg-white dark:bg-gray-800 p-4 md:p-6 lg:p-8 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-4 md:mb-6">
            {t('createItemCategory.categoryInfo', 'Category Information')}
          </h2>
          
          <div className="space-y-4 md:space-y-6">
            <div>
              <label 
                htmlFor="name" 
                className="block text-sm md:text-base font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                {t('createItemCategory.name', 'Category Name')}
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 
                  px-4 py-2.5 text-sm md:text-base bg-white dark:bg-gray-700 
                  text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                  focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                  transition-colors duration-200"
                placeholder={t('createItemCategory.namePlaceholder', 'Enter category name')}
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 md:pt-6">
          <button
            type="submit"
            className="w-full sm:w-auto min-w-[150px] bg-[#6C5DD3] text-white px-6 py-3 
              text-sm md:text-base rounded-lg hover:bg-[#5c4eb3] 
              focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2 
              dark:focus:ring-offset-gray-800 transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('createItemCategory.submit', 'Create Category')}
          </button>
        </div>
      </form>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={t('createItemCategory.successMessage', 'Category has been created successfully!')}
      />
    </div>
  );
} 