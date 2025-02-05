import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from "react-i18next";
import { apiService } from '../api/api';
import { useState } from 'react';
import SuccessModal from "../components/SuccessModal";

interface TransportType {
  id: number;
  transport_type: string;
}

interface TransportNumber {
  id: number;
  transport_number: string;
  transport_type: number;
  application_id: number;
}

export default function TransportForm() {
  const { t } = useTranslation();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState<string>("");

  // Fetch transport types
  const { data: transportTypes } = useQuery({
    queryKey: ['transportTypes'],
    queryFn: () => apiService.getTransportTypes()
  });

  // Fetch transport numbers
  const { data: transportNumbers } = useQuery({
    queryKey: ['transportNumbers'],
    queryFn: () => apiService.getTransportNumbers()
  });

  const mutation = useMutation({
    mutationFn: apiService.createTransport,
    onSuccess: () => {
      setShowSuccessModal(true);
      setError("");
    },
    onError: (error: any) => {
      setError(
        error.response?.status === 401 
          ? t('createTransport.unauthorizedError', 'Please login to create transport')
          : t('createTransport.error', 'Error creating transport')
      );
      setShowSuccessModal(false);
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    
    mutation.mutate({
      transport_type: Number(formData.get('transport_type')),
      transport_number: formData.get('transport_number') as string,
      application_id: 1
    });
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('createTransport.title', 'Create Transport')}
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {t('createTransport.subtitle', 'Add a new transport to the system')}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
            {t('createTransport.transportInfo.title', 'Transport Information')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label 
                htmlFor="transport_type" 
                className="block text-sm font-medium text-gray-600 dark:text-gray-400"
              >
                {t('createTransport.transportInfo.type', 'Transport Type')}
              </label>
              <select
                name="transport_type"
                id="transport_type"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
              >
                <option value="">{t('createTransport.transportInfo.selectType', 'Select type')}</option>
                {transportTypes?.map((type: TransportType) => (
                  <option key={type.id} value={type.id}>
                    {type.transport_type}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label 
                htmlFor="transport_number" 
                className="block text-sm font-medium text-gray-600 dark:text-gray-400"
              >
                {t('createTransport.transportInfo.number', 'Transport Number')}
              </label>
              <select
                name="transport_number"
                id="transport_number"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                  px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
              >
                <option value="">{t('createTransport.transportInfo.selectNumber', 'Select number')}</option>
                {transportNumbers?.map((number: TransportNumber) => (
                  <option key={number.id} value={number.transport_number}>
                    {number.transport_number}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-[#6C5DD3] text-white px-4 py-2 text-sm rounded-lg 
              hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] 
              focus:ring-offset-2 disabled:bg-gray-300 dark:disabled:bg-gray-600 
              disabled:cursor-not-allowed"
          >
            {mutation.isPending 
              ? t('createTransport.submitting', 'Creating...')
              : t('createTransport.submit', 'Create Transport')}
          </button>
        </div>
      </form>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={t('createTransport.successMessage', 'Transport has been created successfully!')}
      />
    </div>
  );
}