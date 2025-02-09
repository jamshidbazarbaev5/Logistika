import { useTranslation } from "react-i18next";
import { ApplicationFormData } from "../types/types";

interface DeclarationTabProps {
  formData: ApplicationFormData;
  setFormData: (update: ApplicationFormData | ((prev: ApplicationFormData) => ApplicationFormData)) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNextTab: () => void;
}

export const DeclarationTab: React.FC<DeclarationTabProps> = ({
  formData,
  setFormData,
  handleFileChange,
  handleNextTab
}) => {
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: ApplicationFormData) => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="decloration_number" className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
            {t('createApplication.declaration.number', 'Declaration Number')}
          </label>
          <input
            type="text"
            name="decloration_number"
            id="decloration_number"
            value={formData.decloration_number}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
              px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 
              focus:ring-[#6C5DD3] bg-white dark:bg-gray-700 text-gray-900 
              dark:text-gray-100 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="decloration_date" className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
            {t('createApplication.declaration.date', 'Declaration Date')}
          </label>
          <input
            type="date"
            name="decloration_date"
            id="decloration_date"
            value={formData.decloration_date}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
              px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 
              focus:ring-[#6C5DD3] bg-white dark:bg-gray-700 text-gray-900 
              dark:text-gray-100 transition-colors"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="decloration_file" className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
            {t('createApplication.declaration.file', 'Declaration File')}
          </label>
          <input
            type="file"
            name="decloration_file"
            id="decloration_file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-[#6C5DD3] file:text-white
              hover:file:bg-[#5b4eb3]
              file:cursor-pointer"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleNextTab}
          className="bg-[#6C5DD3] text-white px-6 py-2 rounded-lg hover:bg-[#5b4eb3]"
        >
          {t('common.next', 'Next')}
        </button>
      </div>
    </div>
  );
};