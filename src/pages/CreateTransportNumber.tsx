import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/api";
import SuccessModal from "../components/SuccessModal";
import {useNavigate} from "react-router-dom";

interface TransportType {
  id: number;
  transport_type: string;
}

interface Firm {
  id: number;
  firm_name: string;
}

interface TransportNumberFormData {
  transport_number: string;
  transport_type: string;
  application_id: string;
}

export default function CreateTransportNumber() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<TransportNumberFormData>({
    transport_number: "",
    transport_type: "",
    application_id: "",
  });
  const [transportTypes, setTransportTypes] = useState<TransportType[]>([]);
  const [firms, setFirms] = useState<Firm[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transportTypesResponse, firmsResponse] = await Promise.all([
          api.get('/transport/type/'),
          api.get('/firms/'), // Adjust this endpoint according to your API
        ]);
        
        setTransportTypes(transportTypesResponse.data);
        setFirms(firmsResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/transport/number/', {
        ...formData,
        transport_type: Number(formData.transport_type),
        application_id: Number(formData.application_id),
      });
      
      if (response.status === 201 || response.status === 200) {
        setFormData({
          transport_number: "",
          transport_type: "",
          application_id: "",
        });
        setShowSuccessModal(true);
        navigate("/transport-list");

      }
    } catch (error: any) {
      console.error('Error creating transport number:', error);
      let errorMessage = t('createTransportNumber.errorMessage', 'Failed to create transport number. Please try again.');
      
      if (error.response?.data) {
        const serverError = error.response.data;
        errorMessage = typeof serverError === 'object' 
          ? Object.entries(serverError).map(([key, value]) => `${key}: ${value}`).join('\n')
          : serverError.toString();
      }
      
      alert(errorMessage);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5DD3]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white transition-colors">
          {t('createTransportNumber.title', 'Create Transport Number')}
        </h1>
        <p className="mt-1 sm:mt-2 text-sm text-gray-600 dark:text-gray-400 transition-colors">
          {t('createTransportNumber.subtitle', 'Add a new transport number to the system')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full max-w-4xl">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Transport Number */}
            <div>
              <label 
                htmlFor="transport_number" 
                className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors"
              >
                {t('createTransportNumber.form.number', 'Transport Number')}
              </label>
              <input
                type="text"
                name="transport_number"
                id="transport_number"
                value={formData.transport_number}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                placeholder={t('createTransportNumber.form.numberPlaceholder', 'Enter transport number')}
              />
            </div>

            {/* Transport Type Dropdown */}
            <div>
              <label 
                htmlFor="transport_type" 
                className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors"
              >
                {t('createTransportNumber.form.type', 'Transport Type')}
              </label>
              <select
                name="transport_type"
                id="transport_type"
                value={formData.transport_type}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
              >
                <option value="">Select transport type</option>
                {transportTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.transport_type}
                  </option>
                ))}
              </select>
            </div>

            {/* Application ID Dropdown */}
            <div>
              <label 
                htmlFor="application_id" 
                className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors"
              >
                {t('createTransportNumber.form.applicationId', 'Application ID')}
              </label>
              <select
                name="application_id"
                id="application_id"
                value={formData.application_id}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
              >
                <option value="">Select application</option>
                {firms.map((firm) => (
                  <option key={firm.id} value={firm.id}>
                    {firm.firm_name} (ID: {firm.id})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto bg-[#6C5DD3] text-white px-4 py-2 text-sm rounded-lg 
            hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2
            dark:focus:ring-offset-gray-800 transition-all duration-200"
          >
            {t('createTransportNumber.submit', 'Create Transport Number')}
          </button>
        </div>
      </form>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={t('common.success')}
        message={t('createTransportNumber.successMessage', 'Transport number has been created successfully!')}
      />
    </div>
  );
}