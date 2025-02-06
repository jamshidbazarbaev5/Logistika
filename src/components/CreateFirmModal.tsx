import { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/api";
import SuccessModal from "./SuccessModal";
import ErrorModal from "./ErrorModal";

interface CreateFirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFirmCreated: (firm: { id: number; firm_name: string }) => void;
}

interface FirmFormData {
  INN: string;
  firm_name: string;
  phoneNumber_firm: string;
  full_name_director: string;
  phoneNumber_director: string;
  firm_trustee: string;
  phoneNumber_trustee: string;
}

export default function CreateFirmModal({ isOpen, onClose, onFirmCreated }: CreateFirmModalProps) {
  const { t } = useTranslation();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState<FirmFormData>({
    INN: "",
    firm_name: "",
    phoneNumber_firm: "",
    full_name_director: "",
    phoneNumber_director: "",
    firm_trustee: "",
    phoneNumber_trustee: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create FormData instance for the API call
      const formDataToSend = new FormData();
      
      // Append all form fields to FormData
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          formDataToSend.append(key, value);
        }
      });

      const response = await api.post('/firms/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data', // Set content type to multipart/form-data
        }
      });
      
      if (response.status === 201 || response.status === 200) {
        setShowSuccessModal(true);
        onFirmCreated({
          id: response.data.id,
          firm_name: response.data.firm_name,
        });
        
        // Reset form data
        setFormData({
          INN: "",
          firm_name: "",
          phoneNumber_firm: "",
          full_name_director: "",
          phoneNumber_director: "",
          firm_trustee: "",
          phoneNumber_trustee: "",
        });
      }
    } catch (error: any) {
      console.error('Error creating firm:', error);
      let errorMessage = t('createFirm.errorMessage', 'Failed to create firm. Please try again.');
      
      if (error.response?.data) {
        const serverError = error.response.data;
        errorMessage = typeof serverError === 'object' 
          ? Object.entries(serverError)
              .filter(([key]) => key !== 'declaration_file') // Filter out declaration_file error
              .map(([key, value]) => `${key}: ${value}`)
              .join('\n')
          : serverError.toString();
      }
      
      if (errorMessage.trim()) { // Only show error modal if there are other errors
        setErrorMessage(errorMessage);
        setShowErrorModal(true);
      }
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

          <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white dark:bg-gray-800 rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <form onSubmit={handleSubmit} className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
              <div className="mb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  {t('createFirm.title', 'Create New Firm')}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="INN" className="block text-sm font-medium text-gray-600 dark:text-gray-300">
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
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder={t('createFirm.companyInfo.innPlaceholder')}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="firm_name" className="block text-sm font-medium text-gray-600 dark:text-gray-300">
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
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder={t('createFirm.companyInfo.firmNamePlaceholder')}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phoneNumber_firm" className="block text-sm font-medium text-gray-600 dark:text-gray-300">
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
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder={t('createFirm.companyInfo.phonePlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="full_name_director" className="block text-sm font-medium text-gray-600 dark:text-gray-300">
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
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder={t('createFirm.directorInfo.fullNamePlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="phoneNumber_director" className="block text-sm font-medium text-gray-600 dark:text-gray-300">
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
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder={t('createFirm.directorInfo.phonePlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="firm_trustee" className="block text-sm font-medium text-gray-600 dark:text-gray-300">
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
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder={t('createFirm.trusteeInfo.fullNamePlaceholder')}
                  />
                </div>

                <div>
                  <label htmlFor="phoneNumber_trustee" className="block text-sm font-medium text-gray-600 dark:text-gray-300">
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
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder={t('createFirm.trusteeInfo.phonePlaceholder')}
                  />
                </div>
              </div>

              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="submit"
                  className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-[#6C5DD3] border border-transparent rounded-md shadow-sm hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6C5DD3] sm:col-start-2 sm:text-sm"
                >
                  {t('createFirm.submit', 'Create')}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6C5DD3] sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title={t('createFirm.success', 'Success!')}
        message={t('createFirm.successMessage', 'Firm has been created successfully!')}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={errorMessage}
      />
    </>
  );
}