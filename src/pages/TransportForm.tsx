import { useMutation } from '@tanstack/react-query';
import { useTranslation } from "react-i18next";
import { apiService } from '../api/api';
import { useState } from 'react';
import SuccessModal from "../components/SuccessModal";

export default function TransportForm() {
  const { t } = useTranslation();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState<string>("");

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
    setError(""); // Clear any previous errors
    const formData = new FormData(e.currentTarget);
    mutation.mutate({
      transport_type: formData.get('transport_type') as string,
    });
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900">{t('createTransport.title', 'Create Transport')}</h1>
        <p className="mt-2 text-sm text-gray-600">
          {t('createTransport.subtitle', 'Add a new transport to the system')}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        <div className="bg-white p-6 rounded-lg border border-gray-100">
          <h2 className="text-sm font-medium text-gray-900 mb-4">
            {t('createTransport.transportInfo.title', 'Transport Information')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label 
                htmlFor="transport_type" 
                className="block text-sm font-medium text-gray-600"
              >
                {t('createTransport.transportInfo.type', 'Transport Type')}
              </label>
              <input
                type="text"
                name="transport_type"
                id="transport_type"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                placeholder={t('createTransport.transportInfo.typePlaceholder', 'Enter transport type')}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="bg-[#6C5DD3] text-white px-4 py-2 text-sm rounded-lg hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
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