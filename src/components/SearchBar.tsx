import { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface SelectOption {
  value: string;
  label: string;
}

export interface SearchField {
  name: string;
  label: string;
  placeholder: string;
  type?: 'text' | 'date' | 'select';
  options?: SelectOption[];
  className?: string;
}

interface SearchBarProps<T extends Record<keyof T, string>> {
  fields: SearchField[];
  initialValues: T;
  onSearch: (values: T) => void;
  onChange?: (values: T) => void;
  immediate?: boolean;
  className?: string;
  t: (key: string, defaultValue: string) => string;
}

export function SearchBar<T extends Record<keyof T, string>>({ 
  fields, 
  initialValues, 
  onSearch, 
  className = "",
}: SearchBarProps<T>) {
  const [localValues, setLocalValues] = useState<T>(initialValues);

  useEffect(() => {
    console.log('SearchBar initialValues changed:', initialValues);
    setLocalValues(initialValues);
  }, [initialValues]);

  useEffect(() => {
    console.log('SearchBar localValues changed:', localValues);
    const timeoutId = setTimeout(() => {
      console.log('Debounce timer triggered, calling onSearch with:', localValues);
      onSearch(localValues);
    }, 500);

    return () => {
      console.log('Cleaning up previous debounce timer');
      clearTimeout(timeoutId);
    };
  }, [localValues, onSearch]);

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    console.log('Input changed:', { name, value });
    setLocalValues(prev => {
      const newValues = {
        ...prev,
        [name]: value
      } as T;
      console.log('New localValues:', newValues);
      return newValues;
    });
  }, []);

  const handleClearInput = useCallback((fieldName: string) => {
    console.log('Clearing input:', fieldName);
    setLocalValues(prev => {
      const newValues = {
        ...prev,
        [fieldName]: ''
      } as T;
      console.log('New localValues after clear:', newValues);
      return newValues;
    });
  }, []);

  return (
    <div className={`grid ${className}`}>
      {fields.map((field) => (
        <div key={field.name} className={`relative ${field.className || ''}`}>
          <label 
            htmlFor={field.name}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {field.label}
          </label>
          <div className="relative group">
            {field.type === 'select' ? (
              <select
                id={field.name}
                name={field.name}
                value={localValues[field.name as keyof T] || ''}
                onChange={handleInputChange}
                className={`
                  w-full rounded-lg border border-gray-300 bg-white py-2
                  px-3 text-sm placeholder-gray-400
                  shadow-sm transition-all duration-200
                  focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                  hover:border-gray-400
                  dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 
                  dark:placeholder-gray-500 dark:hover:border-gray-500
                  dark:focus:border-[#6C5DD3] dark:focus:ring-[#6C5DD3]
                `}
              >
                <option value="">{field.placeholder}</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <>
                {field.type === 'date' ? (
                  <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 
                    group-hover:text-gray-500 pointer-events-none" />
                ) : (
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 
                    group-hover:text-gray-500 pointer-events-none" />
                )}
                <input
                  id={field.name}
                  type={field.type || 'text'}
                  name={field.name}
                  value={localValues[field.name as keyof T] || ''}
                  onChange={handleInputChange}
                  placeholder={field.placeholder}
                  className={`
                    w-full rounded-lg border border-gray-300 bg-white py-2
                    pl-10 pr-3 text-sm placeholder-gray-400
                    shadow-sm transition-all duration-200
                    focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                    hover:border-gray-400
                    dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 
                    dark:placeholder-gray-500 dark:hover:border-gray-500
                    dark:focus:border-[#6C5DD3] dark:focus:ring-[#6C5DD3]
                    ${field.type === 'date' ? 'cursor-pointer' : ''}
                  `}
                />
              </>
            )}
            {localValues[field.name as keyof T] && field.type !== 'select' && (
              <button
                type="button"
                onClick={() => handleClearInput(field.name)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5
                  text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2
                  focus:ring-[#6C5DD3] focus:ring-offset-2"
              >
                <span className="sr-only">Clear search</span>
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}