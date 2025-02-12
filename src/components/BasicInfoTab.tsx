import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormContext } from '../context/FormContext';
import { api } from '../api/api';

interface Firm {
  id: number;
  firm_name: string;
}

interface TabPanelProps {
  onSuccess?: () => void;
}

const BasicInfoTab: React.FC<TabPanelProps> = ({ onSuccess }) => {
  const { t } = useTranslation();
  const { formData, setFormData } = useFormContext();
  const [firms, setFirms] = useState<Firm[]>([]);
  const [firmSearch, setFirmSearch] = useState("");
  const [showFirmDropdown, setShowFirmDropdown] = useState(false);

  useEffect(() => {
    const fetchFirms = async () => {
      try {
        const response = await api.get('/firms/');
        setFirms(response.data.results || []);
      } catch (error) {
        console.error('Error fetching firms:', error);
      }
    };

    fetchFirms();
  }, []);

  const searchFirms = async (searchTerm: string) => {
    try {
      if (!searchTerm.trim()) {
        setFirms([]);
        setShowFirmDropdown(false);
        return;
      }
      const response = await api.get(`/firms/?firm_name=${searchTerm}`);
      setFirms(response.data.results || []);
      setShowFirmDropdown(true);
    } catch (error) {
      console.error('Error searching firms:', error);
      setFirms([]);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (firmSearch) {
        searchFirms(firmSearch);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [firmSearch]);

  const inputClassName = `mt-1 block w-full rounded-md border border-gray-300 
    dark:border-gray-600 px-3 py-2 text-sm focus:border-[#6C5DD3] 
    focus:outline-none focus:ring-1 focus:ring-[#6C5DD3] bg-white 
    dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors`;

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative">
          <label htmlFor="firm_search" className="block text-sm font-medium text-gray-600 dark:text-gray-300">
            {t('createApplication.firm')}
          </label>
          <input
            type="text"
            id="firm_search"
            value={firmSearch}
            onChange={(e) => setFirmSearch(e.target.value)}
            className={inputClassName}
            placeholder={t('createApplication.searchFirm')}
          />
          {showFirmDropdown && firms.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
              {firms.map((firm) => (
                <div
                  key={firm.id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setFormData((prev:any) => ({ ...prev, firm_id: firm.id }));
                    setFirmSearch(firm.firm_name);
                    setShowFirmDropdown(false);
                  }}
                >
                  {firm.firm_name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('createApplication.brutto')}
          </label>
          <input
            type="number"
            value={formData.brutto || ''}
            onChange={(e) => setFormData((prev:any) => ({ ...prev, brutto: Number(e.target.value) || null }))}
            className={inputClassName}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('createApplication.netto')}
          </label>
          <input
            type="number"
            value={formData.netto || ''}
            onChange={(e) => setFormData((prev :any)=> ({ ...prev, netto: Number(e.target.value) || null }))}
            className={inputClassName}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('createApplication.comingDate')}
          </label>
          <input
            type="date"
            value={formData.coming_date || ''}
            onChange={(e) => setFormData((prev:any) => ({ ...prev, coming_date: e.target.value }))}
            className={inputClassName}
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onSuccess}
          className="bg-[#6C5DD3] text-white px-6 py-2 rounded-lg hover:bg-[#5b4eb3]
            focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2
            dark:focus:ring-offset-gray-800"
        >
          {t('createApplication.next')}
        </button>
      </div>
    </div>
  );
};

export default BasicInfoTab;