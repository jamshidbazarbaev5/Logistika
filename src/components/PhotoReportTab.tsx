import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface PhotoReportTabProps {
  formData: any;
  setFormData: (data: any) => void;
  onSuccess?: () => void;
  setSelectedTab?: (index: number) => void;
}

const PhotoReportTab: React.FC<PhotoReportTabProps> = ({
  formData,
  setFormData,
  onSuccess,
  setSelectedTab
}) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData.firm_id) {
      setError('Please select a firm in the Basic Info tab first');
      return;
    }

    if (e.target.files) {
      const newPhotos = Array.from(e.target.files).map(file => ({
        photo: file,
        isNew: true  // Add flag to identify new photos
      }));

      setFormData((prev:any) => ({
        ...prev,
        photo_report: [...prev.photo_report, ...newPhotos]
      }));
      
      setError(null);
    }
  };

  const removePhoto = (index: number) => {
    setFormData((prev :any)=> ({
      ...prev,
      photo_report: prev.photo_report.filter((_:any, i:any) => i !== index)
    }));
  };

  const handleGoToBasicInfo = () => {
    if (setSelectedTab) {
      setSelectedTab(0);
    }
  };

  const openPhotoModal = (photo: any) => {
    const photoUrl = typeof photo.photo === 'string' 
      ? photo.photo 
      : URL.createObjectURL(photo.photo);
    setSelectedPhoto(photoUrl);
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
      {!formData.firm_id ? (
        <div className="text-center p-6">
          <div className="text-red-600 mb-4">
            Please select a firm in the Basic Info tab first
          </div>
          <button
            onClick={handleGoToBasicInfo}
            className="px-6 py-2.5 bg-[#6C5DD3] text-white rounded-lg font-medium
              hover:bg-[#5b4eb3] transition-colors duration-200 ease-in-out shadow-sm"
          >
            Go to Basic Info
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Photos
            </label>
            
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col w-full h-32 border-2 border-dashed border-gray-300 rounded-lg 
                cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-7">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="pt-1 text-sm tracking-wider text-gray-400">
                    Select photos
                  </p>
                </div>
                <input 
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="opacity-0"
                />
              </label>
            </div>

            {error && (
              <div className="mt-2 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Display existing and new photos */}
            {formData.photo_report.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Photos ({formData.photo_report.length})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {formData.photo_report.map((photo: any, index: number) => (
                    <div key={index} className="relative group">
                      <div 
                        className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 cursor-pointer"
                        onClick={() => openPhotoModal(photo)}
                      >
                        {typeof photo.photo === 'string' ? (
                          <img
                            src={photo.photo}
                            alt={`Photo ${index + 1}`}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <img
                            src={URL.createObjectURL(photo.photo)}
                            alt={`Preview ${index + 1}`}
                            className="object-cover w-full h-full"
                          />
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(index);
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-200
                          hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={onSuccess}
              className="px-6 py-2.5 bg-[#6C5DD3] text-white rounded-lg font-medium
                hover:bg-[#5b4eb3] transition-colors duration-200 ease-in-out shadow-sm"
            >
              {t('editApplication.next', 'Next')}
            </button>
          </div>

          {/* Photo Modal */}
          {selectedPhoto && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
              onClick={() => setSelectedPhoto(null)}
            >
              <div className="relative max-w-[90vw] max-h-[90vh]">
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 rounded-full text-white
                    hover:bg-opacity-75 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <img
                  src={selectedPhoto}
                  alt="Full size"
                  className="max-w-full max-h-[90vh] object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PhotoReportTab;