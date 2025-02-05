import { useState } from "react";
import { useTranslation } from "react-i18next";
import { apiService } from "../api/api";
import SuccessModal from "../components/SuccessModal";

export default function PhotoUpload() {
  const { t } = useTranslation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [, setSuccessMessage] = useState<string>("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError(t('photoUpload.errorFileType', 'Please select an image file'));
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError(t('photoUpload.errorNoFile', 'Please select a file to upload'));
      return;
    }

    setIsUploading(true);
    setSuccessMessage("");
    try {
      await apiService.uploadPhotoReport(selectedFile);
      setSelectedFile(null);
      setPreviewUrl(null);
      setIsSuccessModalOpen(true);
    } catch (error) {
      setError(t('photoUpload.errorUpload', 'Error uploading file'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
          {t('photoUpload.title', 'Upload Photo Report')}
        </h1>
        <p className="mt-1 sm:mt-2 text-sm text-gray-600">
          {t('photoUpload.subtitle', 'Upload your photo report documentation here')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full max-w-4xl">
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-100">
          <div className="space-y-4">
            {/* File Upload Area */}
            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-[#6C5DD3] hover:text-[#5c4eb3] focus-within:outline-none"
                  >
                    <span>{t('photoUpload.uploadButton', 'Upload a file')}</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">{t('photoUpload.dragDrop', 'or drag and drop')}</p>
                </div>
                <p className="text-xs text-gray-500">
                  {t('photoUpload.fileTypes', 'PNG, JPG, GIF up to 10MB')}
                </p>
              </div>
            </div>

            {/* Preview Area */}
            {previewUrl && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  {t('photoUpload.preview', 'Preview')}
                </h3>
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-64 rounded-lg object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

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
            disabled={!selectedFile || isUploading}
            className="w-full sm:w-auto bg-[#6C5DD3] text-white px-4 py-2 text-sm rounded-lg hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isUploading
              ? t('photoUpload.uploading', 'Uploading...')
              : t('photoUpload.submit', 'Upload Photo')}
          </button>
        </div>
      </form>

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message={t('photoUpload.successUpload', 'Photo uploaded successfully!')}
        title={t('photoUpload.successTitle', 'Success!')}
      />
    </div>
  );
}
