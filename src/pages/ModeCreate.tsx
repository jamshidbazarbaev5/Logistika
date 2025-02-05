import { useState } from "react";
import { useTranslation } from "react-i18next";
import { apiService } from "../api/api";
import SuccessModal from "../components/SuccessModal";

export default function ModeCreate() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name_mode: "",
    code_mode: "",
  });
  const [error, setError] = useState<string>("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await apiService.createMode(formData);
      setFormData({ name_mode: "", code_mode: "" });
      setShowSuccessModal(true);
    } catch (error) {
      setError(t('mode.createError', 'Error creating mode'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
          {t('mode.createTitle', 'Create New Mode')}
        </h1>
        <p className="mt-1 sm:mt-2 text-sm text-gray-600">
          {t('mode.createSubtitle', 'Add a new mode with name and code')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full max-w-lg">
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-100">
          <div className="space-y-4">
            {/* Mode Name Input */}
            <div>
              <label htmlFor="name_mode" className="block text-sm font-medium text-gray-700">
                {t('mode.name', 'Mode Name')}
              </label>
              <input
                type="text"
                id="name_mode"
                name="name_mode"
                value={formData.name_mode}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#6C5DD3] focus:ring-[#6C5DD3] sm:text-sm"
              />
            </div>

            {/* Mode Code Input */}
            <div>
              <label htmlFor="code_mode" className="block text-sm font-medium text-gray-700">
                {t('mode.code', 'Mode Code')}
              </label>
              <input
                type="text"
                id="code_mode"
                name="code_mode"
                value={formData.code_mode}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#6C5DD3] focus:ring-[#6C5DD3] sm:text-sm"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto bg-[#6C5DD3] text-white px-4 py-2 text-sm rounded-lg hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? t('mode.creating', 'Creating...')
              : t('mode.create', 'Create Mode')}
          </button>
        </div>
      </form>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={t('mode.successMessage', 'Mode has been created successfully!')}
      />
    </div>
  );
} 