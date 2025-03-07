import React, { useState, useEffect, useRef } from 'react';
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
  inputClassName: string;
  readOnly?: boolean;
}

const ModesTab: React.FC<ModesTabProps> = ({
  formData,
  setFormData,
  onSubmit,
  availableModes = [],
  inputClassName,
  readOnly = false
}) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Check if declaration information is complete
  const hasDeclarationInfo = Boolean(
    formData.decloration_number && 
    formData.decloration_date
  );

  // Determine if status can be set to completed
  const canBeCompleted = 
    formData.vip_application || // VIP applications can always be completed
    (formData.total_price === 0 && hasDeclarationInfo); // Non-VIP needs total_price = 0 and declaration info

  return (
    <div className="bg-white dark:bg-gray-900 p-3 sm:p-6 rounded-lg shadow-sm">
      <div className="mb-6">
        <div className="flex items-center">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">
            {t('editApplication.status')}
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              status: e.target.value as 'active' | 'unpaid' | 'completed' 
            }))}
            className={`${inputClassName} capitalize`}
            disabled={readOnly}
          >
            <option value="active">{t('status.active')}</option>
            <option value="unpaid">{t('status.unpaid')}</option>
            <option 
              value="completed" 
              disabled={!canBeCompleted}
            >
              {t('status.completed')}
            </option>
          </select>
        </div>

        {/* Status requirements helper text */}
        {!canBeCompleted && (
          <div className="mt-3 space-y-2">
            {!formData.vip_application && formData.total_price !== 0 && (
              <div className="flex items-center space-x-2 text-red-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">
                  {t('editApplication.completedDisabledPrice', 'Total price must be 0 to mark as completed')}
                </span>
              </div>
            )}
            {!formData.vip_application && !hasDeclarationInfo && (
              <div className="flex items-center space-x-2 text-red-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">
                  {t('editApplication.completedDisabledDeclaration', 'Declaration information is required to mark as completed')}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
          {t('editApplication.selectMode')}
        </h2>

        <div className="relative" ref={dropdownRef}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowDropdown(true);
            }}
            onClick={() => setShowDropdown(true)}
            className="w-full rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm 
              border border-gray-300 dark:border-gray-600 focus:outline-none bg-white
              dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400
              focus:border-[#6C5DD3] focus:ring-1 focus:ring-[#6C5DD3]"
            placeholder={t('editApplication.searchModes')}
            disabled={readOnly}
          />
          
          {showDropdown && (
            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg 
              shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
              {filteredModes.length > 0 ? (
                filteredModes.map((mode) => (
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
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {t('editApplication.noModesFound', 'No modes found')}
                </div>
              )}
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
                {!readOnly && (
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, modes: [] }))}
                    className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 
                      hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {!readOnly && (
          <div className="mt-6 border-t dark:border-gray-700 pt-6">
            <button
              onClick={onSubmit}
              className="w-full px-6 py-3 bg-green-600 dark:bg-green-500 text-white rounded-lg font-medium
                hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-200 ease-in-out shadow-sm
                focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:ring-offset-2
                dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!selectedMode}
            >
              {t('editApplication.saveChanges', 'Save Changes')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModesTab;