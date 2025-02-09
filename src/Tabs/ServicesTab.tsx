import { useTranslation } from "react-i18next";
import { useRef, useState } from "react";
import {api} from '../api/api'

interface ServicesTabProps {
  formData: any;
  setFormData: (data: any) => void;
  keepingServices: any[];
  workingServices: any[];
  keepingServicesOpen: boolean;
  setKeepingServicesOpen: (open: boolean) => void;
  workingServicesOpen: boolean;
  setWorkingServicesOpen: (open: boolean) => void;
  handleNextTab: () => void;
  setShowSuccessModal: (show: boolean) => void;
  setModalMessage: (message: string) => void;
}

export const ServicesTab: React.FC<ServicesTabProps> = ({
  formData,
  setFormData,
  keepingServices,
  workingServices,
  keepingServicesOpen,
  setKeepingServicesOpen,
  workingServicesOpen,
  setWorkingServicesOpen,
  handleNextTab,
  setShowSuccessModal,
  setModalMessage
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const keepingServicesRef = useRef<HTMLDivElement>(null);
  const workingServicesRef = useRef<HTMLDivElement>(null);

  const handleCreateApplication = async () => {
    setLoading(true);
    try {
      // Format dates
      const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ru-RU', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      };

      const basicApplicationData = {
        firm_id: formData.firm_id,
        brutto: formData.brutto,
        netto: formData.netto,
        coming_date: formatDate(formData.coming_date),
        decloration_date: formData.decloration_date ? formatDate(formData.decloration_date) : '',
        decloration_number: formData.decloration_number,
        vip_application: formData.vip_application,
        total_price: formData.total_price,
        discount_price: formData.discount_price,
        keeping_days: formData.keeping_days,
        workers_hours: formData.workers_hours,
        unloading_quantity: formData.unloading_quantity,
        loading_quantity: formData.loading_quantity,
        payment_method: formData.payment_method,
        keeping_services: formData.keeping_services,
        working_services: formData.working_services
      };

      const formDataToSend = new FormData();
      
      Object.entries(basicApplicationData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formDataToSend.append(key, JSON.stringify(value));
        } else if (value !== null) {
          formDataToSend.append(key, value.toString());
        }
      });

      if (formData.decloration_file) {
        formDataToSend.append('decloration_file', formData.decloration_file);
      }

      const response = await api.post('/application/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        const newApplicationId = response.data.id;
        localStorage.setItem('currentApplicationId', newApplicationId.toString());
        setModalMessage(t("createApplication.success", "Application created successfully!"));
        setShowSuccessModal(true);
        handleNextTab(); // Move to next tab after successful creation
      }
    } catch (error) {
      console.error('Error creating application:', error);
      setModalMessage(t("createApplication.error", "Error creating application"));
      setShowSuccessModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="w-full bg-gray-50 rounded-lg" ref={keepingServicesRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setKeepingServicesOpen(!keepingServicesOpen);
              setWorkingServicesOpen(false);
            }}
            className="w-full px-4 py-3 flex items-center justify-between text-left rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700">
                {t('createApplication.keepingServices', 'Keeping Services')}
              </span>
              <span className="ml-2 bg-[#6C5DD3] text-white text-xs px-2 py-1 rounded-full">
                {formData.keeping_services.length} selected
              </span>
            </div>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                keepingServicesOpen ? 'transform rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {keepingServicesOpen && (
            <div className="p-4 border-t border-gray-200">
              <div className="space-y-3">
                {keepingServices.map((service) => (
                  <div 
                    key={service.id}
                    className={`relative flex items-center p-3 rounded-lg border transition-all duration-200
                      ${formData.keeping_services.includes(service.id)
                        ? 'border-[#6C5DD3] bg-[#6C5DD3]/5'
                        : 'border-gray-200 hover:border-[#6C5DD3]/50'}`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.keeping_services.includes(service.id)}
                      onChange={(e) => {
                        setFormData((prev: any) => ({
                          ...prev,
                          keeping_services: e.target.checked
                            ? [...prev.keeping_services, service.id]
                            : prev.keeping_services.filter((id: number) => id !== service.id)
                        }));
                      }}
                      className="rounded border-gray-300 text-[#6C5DD3] focus:ring-[#6C5DD3]
                        w-4 h-4 mr-3 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-700">
                          {service.name}
                        </span>
                        <span className="text-sm font-semibold text-[#6C5DD3] ml-2">
                          {service.base_price}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Base days: {service.base_day} | Extra price: {service.extra_price}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-full bg-gray-50 rounded-lg" ref={workingServicesRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setWorkingServicesOpen(!workingServicesOpen);
              setKeepingServicesOpen(false);
            }}
            className="w-full px-4 py-3 flex items-center justify-between text-left rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700">
                {t('createApplication.workingServices', 'Working Services')}
              </span>
              <span className="ml-2 bg-[#6C5DD3] text-white text-xs px-2 py-1 rounded-full">
                {formData.working_services.length} selected
              </span>
            </div>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                workingServicesOpen ? 'transform rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {workingServicesOpen && (
            <div className="p-4 border-t border-gray-200">
              <div className="space-y-3">
                {workingServices.map((service) => (
                  <div 
                    key={service.id}
                    className={`relative flex items-center p-3 rounded-lg border transition-all duration-200
                      ${formData.working_services.includes(service.id)
                        ? 'border-[#6C5DD3] bg-[#6C5DD3]/5'
                        : 'border-gray-200 hover:border-[#6C5DD3]/50'}`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.working_services.includes(service.id)}
                      onChange={(e) => {
                        setFormData((prev: any) => ({
                          ...prev,
                          working_services: e.target.checked
                            ? [...prev.working_services, service.id]
                            : prev.working_services.filter((id: number) => id !== service.id)
                        }));
                      }}
                      className="rounded border-gray-300 text-[#6C5DD3] focus:ring-[#6C5DD3]
                        w-4 h-4 mr-3 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-gray-700">
                          {service.service_name}
                        </span>
                        <span className="text-sm font-semibold text-[#6C5DD3] ml-2">
                          {service.base_price}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        Base days: {service.base_day} | Extra price: {service.extra_price} | Units: {service.units}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleCreateApplication}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium
              hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200 ease-in-out shadow-sm"
          >
            {loading ? 
              t('createApplication.creating', 'Creating...') : 
              t('createApplication.createApplication', 'Create Application')
            }
          </button>
          <button
            type="button"
            onClick={handleNextTab}
            disabled={loading}
            className="bg-[#6C5DD3] text-white px-6 py-2.5 rounded-lg font-medium
              hover:bg-[#5b4eb3] disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-200 ease-in-out shadow-sm"
          >
            {t('common.next', 'Next')}
          </button>
        </div>
      </div>
    </div>
  );
};