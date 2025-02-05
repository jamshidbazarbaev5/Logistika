import { useState } from "react";
import { useTranslation } from "react-i18next";
import { apiService } from "../api/api";
import SuccessModal from "../components/SuccessModal";

interface FirmFormData {
  INN: string;
  firm_name: string;
  phoneNumber_firm: string;
  full_name_director: string;
  phoneNumber_director: string;
  firm_trustee: string;
  phoneNumber_trustee: string;
}

export default function CreateFirm() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FirmFormData>({
    INN: "",
    firm_name: "",
    phoneNumber_firm: "",
    full_name_director: "",
    phoneNumber_director: "",
    firm_trustee: "",
    phoneNumber_trustee: "",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiService.createFirm(formData);
      
      if (response.status === 201 || response.status === 200) {
        setFormData({
          INN: "",
          firm_name: "",
          phoneNumber_firm: "",
          full_name_director: "",
          phoneNumber_director: "",
          firm_trustee: "",
          phoneNumber_trustee: "",
        });
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      console.error('Error creating firm:', error);
      let errorMessage = t('createFirm.errorMessage', 'Failed to create firm. Please try again.');
      
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
          {t('createFirm.title')}
        </h1>
        <p className="mt-1 sm:mt-2 text-sm text-gray-600 dark:text-gray-400 transition-colors">
          {t('createFirm.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full max-w-4xl">
        {/* Company Information Section */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-100 dark:border-gray-700 transition-colors">
          <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-3 sm:mb-4 transition-colors">
            {t('createFirm.companyInfo.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label htmlFor="INN" className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
                {t('createFirm.companyInfo.inn')}
              </label>
              <input
                type="text"
                name="INN"
                id="INN"
                value={formData.INN}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                placeholder={t('createFirm.companyInfo.innPlaceholder')}
              />
            </div>
            <div>
              <label htmlFor="firm_name" className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
                {t('createFirm.companyInfo.firmName')}
              </label>
              <input
                type="text"
                name="firm_name"
                id="firm_name"
                value={formData.firm_name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                placeholder={t('createFirm.companyInfo.firmNamePlaceholder')}
              />
            </div>
            <div>
              <label htmlFor="phoneNumber_firm" className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
                {t('createFirm.companyInfo.phoneNumber')}
              </label>
              <input
                type="tel"
                name="phoneNumber_firm"
                id="phoneNumber_firm"
                value={formData.phoneNumber_firm}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                placeholder={t('createFirm.companyInfo.phonePlaceholder')}
              />
            </div>
          </div>
        </div>

        {/* Director Information Section */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-100 dark:border-gray-700 transition-colors">
          <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-3 sm:mb-4 transition-colors">
            {t('createFirm.directorInfo.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label htmlFor="full_name_director" className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
                {t('createFirm.directorInfo.fullName')}
              </label>
              <input
                type="text"
                name="full_name_director"
                id="full_name_director"
                value={formData.full_name_director}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                placeholder={t('createFirm.directorInfo.fullNamePlaceholder')}
              />
            </div>
            <div>
              <label htmlFor="phoneNumber_director" className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
                {t('createFirm.directorInfo.phoneNumber')}
              </label>
              <input
                type="tel"
                name="phoneNumber_director"
                id="phoneNumber_director"
                value={formData.phoneNumber_director}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                placeholder={t('createFirm.directorInfo.phonePlaceholder')}
              />
            </div>
          </div>
        </div>

        {/* Trustee Information Section */}
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-100 dark:border-gray-700 transition-colors">
          <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-3 sm:mb-4 transition-colors">
            {t('createFirm.trusteeInfo.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label htmlFor="firm_trustee" className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
                {t('createFirm.trusteeInfo.fullName')}
              </label>
              <input
                type="text"
                name="firm_trustee"
                id="firm_trustee"
                value={formData.firm_trustee}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                placeholder={t('createFirm.trusteeInfo.fullNamePlaceholder')}
              />
            </div>
            <div>
              <label htmlFor="phoneNumber_trustee" className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
                {t('createFirm.trusteeInfo.phoneNumber')}
              </label>
              <input
                type="tel"
                name="phoneNumber_trustee"
                id="phoneNumber_trustee"
                value={formData.phoneNumber_trustee}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                placeholder={t('createFirm.trusteeInfo.phonePlaceholder')}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto bg-[#6C5DD3] text-white px-4 py-2 text-sm rounded-lg 
            hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2
            dark:focus:ring-offset-gray-800 transition-all duration-200"
          >
            {t('createFirm.submit')}
          </button>
        </div>
      </form>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={t('common.success')}
        message={t('createFirm.successMessage')}
      />
    </div>
  );
}
