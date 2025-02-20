import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ApplicationFormData } from '../context/FormContext';
import { api } from '../api/api';

interface Service {
  id: number;
  name?: string;
  service_name?: string;
  base_price: string | number;
  keeping_services_id?: number;
  extra_price?: string;
  year?: number;
  base_day?: number;
}

interface ServicesTabProps {
  formData: ApplicationFormData;
  setFormData: (data: ApplicationFormData) => void;
  keepingServices: Service[];
  workingServices: Service[];
  onSuccess?: () => void;
}

interface KeepingServiceQuantity {
  amount: number;
  service_type_id: number;
}

interface WorkingServiceQuantity {
  service_id: number;
  quantity: number;
}

const ServicesTab: React.FC<ServicesTabProps> = ({
  formData,
  setFormData,
  keepingServices = [],
  workingServices = [],
  onSuccess
}) => {
  const { t } = useTranslation();
  const [keepingServicesNames, setKeepingServicesNames] = useState<Map<number, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!formData.upload_keeping_services_quantity) {
      setFormData({
        ...formData,
        upload_keeping_services_quantity: []
      });
    }
    if (!formData.upload_working_services_quantity) {
      setFormData({
        ...formData,
        upload_working_services_quantity: []
      });
    }
  }, []);

  useEffect(() => {
    const fetchServiceNames = async () => {
      if (!keepingServices.length) {
        setIsLoading(false);
        return;
      }

      try {
        const namePromises = keepingServices.map(service =>
          api.get(`/keeping_service/keeping_service_name/${service.keeping_services_id}/`)
        );
        
        const nameResponses = await Promise.all(namePromises);
        const namesMap = new Map();
        keepingServices.forEach((service, index) => {
          namesMap.set(service.keeping_services_id, nameResponses[index].data.name);
        });
        setKeepingServicesNames(namesMap);
      } catch (error) {
        console.error('Error fetching service names:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServiceNames();
  }, [keepingServices]);

  const handleKeepingServiceChange = (serviceId: number, amount: number) => {
    const currentServices = formData.upload_keeping_services_quantity || [];
    const existingIndex = currentServices.findIndex(
      (s: KeepingServiceQuantity) => s.service_type_id === serviceId
    );

    let updatedServices = [...currentServices];
    if (existingIndex >= 0) {
      if (amount === 0) {
        updatedServices = updatedServices.filter(
          (s: KeepingServiceQuantity) => s.service_type_id !== serviceId
        );
      } else {
        updatedServices[existingIndex] = { ...updatedServices[existingIndex], amount };
      }
    } else if (amount > 0) {
      updatedServices.push({ service_type_id: serviceId, amount });
    }

    setFormData({
      ...formData,
      upload_keeping_services_quantity: updatedServices
    });
  };

  const handleWorkingServiceChange = (serviceId: number, quantity: number) => {
    const currentServices = formData.upload_working_services_quantity || [];
    
    // If quantity is 0 or invalid, filter out the service entirely
    if (quantity <= 0) {
      const updatedServices = currentServices.filter(
        (s: WorkingServiceQuantity) => s.service_id !== serviceId
      );
      setFormData({
        ...formData,
        upload_working_services_quantity: updatedServices
      });
      return;
    }

    // Handle adding/updating service
    const existingIndex = currentServices.findIndex(
      (s: WorkingServiceQuantity) => s.service_id === serviceId
    );

    let updatedServices = [...currentServices];
    if (existingIndex >= 0) {
      updatedServices[existingIndex] = { 
        service_id: serviceId, 
        quantity: quantity 
      };
    } else {
      updatedServices.push({ 
        service_id: serviceId, 
        quantity: quantity 
      });
    }

    // Filter out any empty objects before updating state
    updatedServices = updatedServices.filter(
      service => service.service_id && service.quantity
    );

    setFormData({
      ...formData,
      upload_working_services_quantity: updatedServices
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5DD3]"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
      {/* Keeping Services */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          {t('editApplication.keepingServices')}
        </h3>
        <div className="space-y-3">
          {keepingServices.map(service => {
            const existingService = (formData.upload_keeping_services_quantity || [])
              .find(s => s.service_type_id === service.keeping_services_id);
            if (!service.keeping_services_id) return null;
            
            return (
              <div key={service.keeping_services_id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex-1">
                  <span className="text-gray-700 dark:text-gray-300">
                    {keepingServicesNames.get(service.keeping_services_id) || t('loading')}
                  </span>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('basePrice')}: {service.base_price} • 
                    {t('extraPrice')}: {service.extra_price}
                  </div>
                </div>
                <input
                  type="number"
                  min="0"
                  value={existingService?.amount || ''}
                  onChange={(e) => handleKeepingServiceChange(service.keeping_services_id!, parseInt(e.target.value))}
                  className="w-32 rounded-md border-gray-300 dark:border-gray-600 shadow-sm 
                    focus:border-[#6C5DD3] focus:ring-[#6C5DD3] dark:bg-gray-700 
                    dark:text-gray-100"
                  placeholder={t('editApplication.amount')}
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
            const existingService = (formData.upload_working_services_quantity || []).find(
              s => s.service_id === service.id
            );
            if (!service.id) return null;

            return (
              <div key={service.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="flex-1 text-gray-700 dark:text-gray-300">{service.service_name}</span>
                <input
                  type="number"
                  min="0"
                  value={existingService?.quantity || ''}
                  onChange={(e) => handleWorkingServiceChange(service.id!, parseInt(e.target.value))}
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