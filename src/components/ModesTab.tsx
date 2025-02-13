import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ApplicationFormData } from '../context/FormContext';

interface Mode {
  id: number;
  name_mode: string;
  code_mode: string;
}

interface ModesTabProps {
  formData: ApplicationFormData;
  setFormData: React.Dispatch<React.SetStateAction<ApplicationFormData>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  availableModes: Mode[];
}

const ModesTab: React.FC<ModesTabProps> = ({
  formData,
  setFormData,
  onSubmit,
  availableModes = []
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Sort modes by code_mode for better organization
  const sortedModes = [...availableModes].sort((a, b) => 
    a.code_mode.localeCompare(b.code_mode)
  );

  const filteredModes = sortedModes.filter(mode =>
    mode.name_mode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mode.code_mode.includes(searchTerm)
  );

  const handleModeSelect = (mode: Mode) => {
    setFormData(prev => ({
      ...prev,
      modes: [{ mode_id: mode.id }]
    }));
    setSearchTerm('');
    setShowDropdown(false);
  };

  const selectedMode = formData.modes?.[0]?.mode_id 
    ? availableModes.find(mode => mode.id === formData.modes[0].mode_id)
    : null;

  return (
    <div className="bg-white dark:bg-gray-900 p-3 sm:p-6 rounded-lg shadow-sm">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
          {t('editApplication.selectMode')}
        </h2>

        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            className="w-full rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm 
              border border-gray-300 dark:border-gray-600 focus:outline-none
              focus:border-[#6C5DD3] focus:ring-1 focus:ring-[#6C5DD3]"
            placeholder={t('editApplication.searchModes')}
          />
          
          {showDropdown && filteredModes.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg 
              shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
              {filteredModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => handleModeSelect(mode)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700
                    border-b last:border-b-0 border-gray-100 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {mode.name_mode}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                      {mode.code_mode}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Display selected mode */}
        {selectedMode && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('editApplication.selectedMode', 'Selected Mode')}:
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border 
              border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {selectedMode.name_mode}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('editApplication.code', 'Code')}: {selectedMode.code_mode}
                  </p>
                </div>
                <button
                  onClick={() => setFormData(prev => ({ ...prev, modes: [] }))}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 
                    dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 border-t pt-6">
          <button
            onClick={onSubmit}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium
              hover:bg-green-700 transition-colors duration-200 ease-in-out shadow-sm
              focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
              dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedMode}
          >
            {t('editApplication.saveChanges', 'Save Changes')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModesTab;