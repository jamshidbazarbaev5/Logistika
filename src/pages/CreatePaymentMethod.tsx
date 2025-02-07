import { useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/api";
import SuccessModal from "../components/SuccessModal";
import ErrorModal from "../components/ErrorModal";
import { useNavigate } from "react-router-dom";

interface PaymentMethodFormData {
  payment_method: string;
}

export default function CreatePaymentMethod() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<PaymentMethodFormData>({
    payment_method: "",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/payment_method/', formData);
      
      if (response.status === 201 || response.status === 200) {
        setFormData({
          payment_method: "",
        });
        setShowSuccessModal(true);
        navigate("/payment-list");
      }
    } catch (error: any) {
      console.error('Error creating payment method:', error);
      let errorMessage = t('createPaymentMethod.errorMessage', 'Failed to create payment method. Please try again.');
      
      if (error.response?.data) {
        const serverError = error.response.data;
        errorMessage = typeof serverError === 'object' 
          ? Object.entries(serverError).map(([key, value]) => `${key}: ${value}`).join('\n')
          : serverError.toString();
      }
      
      setErrorMessage(errorMessage);
      setShowErrorModal(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white transition-colors">
          {t('createPaymentMethod.title', 'Create Payment Method')}
        </h1>
        <p className="mt-1 sm:mt-2 text-sm text-gray-600 dark:text-gray-400 transition-colors">
          {t('createPaymentMethod.subtitle', 'Add a new payment method to the system')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full max-w-4xl">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-100 dark:border-gray-700 transition-colors">
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            <div>
              <label 
                htmlFor="payment_method" 
                className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors"
              >
                {t('createPaymentMethod.paymentMethodName', 'Payment Method Name')}
              </label>
              <input
                type="text"
                name="payment_method"
                id="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors"
                placeholder={t('createPaymentMethod.paymentMethodPlaceholder', 'Enter payment method name')}
              />
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
            {t('createPaymentMethod.submit', 'Create Payment Method')}
          </button>
        </div>
      </form>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={t('common.success')}
        message={t('createPaymentMethod.successMessage', 'Payment method has been created successfully!')}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={errorMessage}
      />
    </div>
  );
}