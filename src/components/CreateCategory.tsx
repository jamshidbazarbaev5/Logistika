import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiService } from '../api/api';
import { useNavigate } from 'react-router-dom';

export default function CreateCategory() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await apiService.createCategory({ name });
      navigate('/categories'); // Adjust this path as needed
    } catch (error: any) {
      console.error('Error creating category:', error);
      setError(error.response?.data?.message || 'Failed to create category. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {t('Create Category')}
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {t('Add a new category for items')}
          </p>
        </div>

        <div className="mt-5 md:mt-0 md:col-span-2">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="shadow sm:rounded-md sm:overflow-hidden">
              <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    {t('Category Name')}
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>
              <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isLoading ? t('Creating...') : t('Create Category')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}