import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, CalendarIcon } from '@heroicons/react/24/outline';

export interface SearchField {
  name: string;
  label: string;
  placeholder: string;
  type?: 'text' | 'date';
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
  onChange,
  immediate = false,
  className = "",
  t = (_, fallback) => fallback 
}: SearchBarProps<T>) {
  const [localValues, setLocalValues] = useState<T>(initialValues);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalValues(prev => ({
      ...prev,
      [name]: value
    }) as T);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(localValues);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localValues, onSearch]);

  return (
    <div className={`grid ${className}`}>
      {fields.map((field) => (
        <div key={field.name} className={`relative ${field.className || ''}`}>
          <label 
            htmlFor={field.name}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {t(`search.${field.label}`, field.label)}
          </label>
          <div className="relative group">
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
              placeholder={t(`search.${field.placeholder}`, field.placeholder)}
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
            {localValues[field.name as keyof T] && (
              <button
                type="button"
                onClick={() => {
                  setLocalValues(prev => ({
                    ...prev,
                    [field.name]: ''
                  }) as T);
                }}
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