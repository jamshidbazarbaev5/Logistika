import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ApplicationFormData } from '../context/FormContext';



interface ModesTabProps {
  formData: ApplicationFormData;
  setFormData: React.Dispatch<React.SetStateAction<ApplicationFormData>>;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  availableModes: Array<{ id: number; name_mode: string; code_mode: string }>;
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedMode, setSelectedMode] = useState<{id: number; name_mode: string; code_mode: string} | null>(null);

  // Filter modes based on search term, with null check
  const filteredModes = availableModes?.filter(mode =>
    mode.name_mode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mode.code_mode.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Set initial selected mode if there's one in formData
  useEffect(() => {
    if (formData.modes?.[0]?.mode_id && availableModes?.length) {
      const currentMode = availableModes.find(mode => mode.id === formData.modes[0].mode_id);
      if (currentMode) {
        setSelectedMode(currentMode);
      }
    }
  }, [formData.modes, availableModes]);

  const handleModeSelect = (mode: {id: number; name_mode: string; code_mode: string}) => {
    setSelectedMode(mode);
    setFormData(prev => ({
      ...prev,
      modes: [{ mode_id: mode.id }]
    }));
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleRemoveMode = () => {
    setSelectedMode(null);
    setFormData(prev => ({
      ...prev,
      modes: []
    }));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!availableModes) {
    return (
      <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
        <div className="text-center text-gray-500 dark:text-gray-400">
          {t('editApplication.loading', 'Loading modes...')}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          {t('editApplication.selectMode', 'Select Mode')}
        </h2>

        <div className="relative" ref={dropdownRef}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            onFocus={() => setShowDropdown(true)}
            placeholder={t('createApplication.input')}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 
              px-4 py-2.5 text-sm focus:border-[#6C5DD3] focus:ring-1 focus:ring-[#6C5DD3]
              bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
              placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
          />
          
          {showDropdown && filteredModes.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg 
              shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
              {filteredModes.map((mode) => (
                <div
                  key={mode.id}
                  onClick={() => handleModeSelect(mode)}
                  className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer
                    border-b last:border-b-0 border-gray-100 dark:border-gray-700"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {mode.name_mode}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {t('createApplication.code')}: {mode.code_mode}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Display selected mode */}
        {selectedMode && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Selected Mode:
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border 
              border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {selectedMode.name_mode}    
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Code: {selectedMode.code_mode}
                  </p>
                </div>
                <button
                  onClick={handleRemoveMode}
                  className="p-1 text-gray-400 hover:text-red-500 rounded-full
                    hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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
            disabled={formData.modes.length === 0}
          >
            {t('editApplication.saveChanges', 'Save Changes')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModesTab;