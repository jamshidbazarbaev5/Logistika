import React from 'react';
import { useTranslation } from 'react-i18next';

interface Service {
  id: number;
  name?: string;
  service_name?: string;
  base_price: number;
}

interface ServicesTabProps {
  formData: any;
  setFormData: (data: any) => void;
  keepingServices: Service[];
  workingServices: Service[];
  onSuccess?: () => void;
}

const ServicesTab: React.FC<ServicesTabProps> = ({
  formData,
  setFormData,
  keepingServices,
  workingServices,
  onSuccess
}) => {
  const { t } = useTranslation();

  const handleKeepingServiceChange = (serviceId: number, days: number) => {
    const updatedServices = days > 0
      ? [
          ...formData.keeping_services.filter((s:any) => s.keeping_services_id !== serviceId),
          { keeping_services_id: serviceId, day: days }
        ]
      : formData.keeping_services.filter((s :any)=> s.keeping_services_id !== serviceId);

    setFormData({
      ...formData,
      keeping_services: updatedServices
    });
  };

  const handleWorkingServiceChange = (serviceId: number, quantity: number) => {
    const updatedServices = quantity > 0
      ? [
          ...formData.working_services.filter((s:any) => s.service_id !== serviceId),
          { service_id: serviceId, quantity }
        ]
      : formData.working_services.filter((s :any)=> s.service_id !== serviceId);

    setFormData({
      ...formData,
      working_services: updatedServices
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
      {/* Keeping Services */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          {t('editApplication.keepingServices', 'Storage Services')}
        </h3>
        <div className="space-y-3">
          {keepingServices.map(service => {
            const existingService = formData.keeping_services.find(
              (s:any) => s.keeping_services_id === service.id
            );
            return (
              <div key={service.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="flex-1 text-gray-700 dark:text-gray-300">{service.name}</span>
                <input
                  type="number"
                  min="0"
                  value={existingService?.day || ''}
                  onChange={(e) => handleKeepingServiceChange(service.id, parseInt(e.target.value))}
                  className="w-32 rounded-md border-gray-300 dark:border-gray-600 shadow-sm 
                    focus:border-[#6C5DD3] focus:ring-[#6C5DD3] dark:bg-gray-700 
                    dark:text-gray-100"
                  placeholder={t('editApplication.days')}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Working Services */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          {t('editApplication.workingServices', 'Working Services')}
        </h3>
        <div className="space-y-3">
          {workingServices.map(service => {
            const existingService = formData.working_services.find(
              (s:any) => s.service_id === service.id
            );
            return (
              <div key={service.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="flex-1 text-gray-700 dark:text-gray-300">{service.service_name}</span>
                <input
                  type="number"
                  min="0"
                  value={existingService?.quantity || ''}
                  onChange={(e) => handleWorkingServiceChange(service.id, parseInt(e.target.value))}
                  className="w-32 rounded-md border-gray-300 dark:border-gray-600 shadow-sm 
                    focus:border-[#6C5DD3] focus:ring-[#6C5DD3] dark:bg-gray-700 
                    dark:text-gray-100"
                  placeholder={t('editApplication.quantity')}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Button */}
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={onSuccess}
          className="px-6 py-2.5 bg-[#6C5DD3] text-white rounded-lg font-medium
            hover:bg-[#5b4eb3] transition-colors duration-200 ease-in-out shadow-sm"
        >
          {t('editApplication.next', 'Next')}
        </button>
      </div>
    </div>
  );
};

export default ServicesTab;