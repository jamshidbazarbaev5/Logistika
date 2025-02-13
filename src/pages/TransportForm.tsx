import { useMutation } from '@tanstack/react-query';
import { useTranslation } from "react-i18next";
import { api } from '../api/api';
import { useState } from 'react';
import SuccessModal from "../components/SuccessModal";
import ErrorModal from "../components/ErrorModal";
import {useNavigate} from "react-router-dom";


export default function TransportForm() {
  const { t } = useTranslation();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [error, setError] = useState<string>("");
  const [transportType, setTransportType] = useState("");
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: (data: { transport_type: string }) => 
      api.post('/transport/type/', data),
    onSuccess: () => {
      setShowSuccessModal(true);
      setTransportType(""); 
      setError("");
      navigate('transport-list');


    },
    onError: (error: any) => {
      setError(
        error.response?.status === 401 
          ? t('createTransport.unauthorizedError', 'Please login to create transport')
          : t('createTransport.error', 'Error creating transport')
      );
      setShowErrorModal(true);
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    
    mutation.mutate({
      transport_type: transportType
    });
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('createTransport.title', 'Create Transport Type')}
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {t('createTransport.subtitle', 'Add a new transport type to the system')}
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
            {t('createTransport.title')}
          </h2>
          <div>
            <label 
              htmlFor="transport_type" 
              className="block text-sm font-medium text-gray-600 dark:text-gray-400"
            >
              {t('createTransport.subtitle')}
            </label>
            <input
              type="text"
              id="transport_type"
              value={transportType}
              onChange={(e) => setTransportType(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
              placeholder={t('createTransport.placeholder')}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={mutation.isPending || !transportType.trim()}
            className="bg-[#6C5DD3] text-white px-4 py-2 text-sm rounded-lg 
              hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] 
              focus:ring-offset-2 disabled:bg-gray-300 dark:disabled:bg-gray-600 
              disabled:cursor-not-allowed"
          >
            {mutation.isPending 
              ? t('createTransport.submitting', 'Creating...')
              : t('createTransport.submit')}
          </button>
        </div>
      </form>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={t('createTransport.successMessage', 'Transport type has been created successfully!')}
      />

      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={error}
      />
    </div>
  );
}