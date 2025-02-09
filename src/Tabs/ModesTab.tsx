import { useState, useEffect } from "react";
import { api } from '../api/api'
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ApplicationFormData } from "../types/types";

interface ModesTabProps {
  formData: ApplicationFormData;
  setFormData: (data: ApplicationFormData | ((prev: ApplicationFormData) => ApplicationFormData)) => void;
  setShowSuccessModal: (show: boolean) => void;
  setModalMessage: (message: string) => void;
}

interface ModeResponse {
  id: number;
  name_mode: string;
  code_mode: string;
}

export const ModesTab: React.FC<ModesTabProps> = ({
  formData,
  setFormData,
  setShowSuccessModal,
  setModalMessage
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [modes, setModes] = useState<ModeResponse[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchModes = async () => {
      try {
        const response = await api.get('/modes/modes/');
        setModes(response.data.results || []);
      } catch (error) {
        console.error('Error fetching modes:', error);
      }
    };
    fetchModes();
  }, []);

  const handleCreateApplication = async () => {
    if (!formData.modes?.[0]?.mode_id) return;
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

      // Create initial application with basic data
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
      
      // Append all data to FormData
      Object.entries(basicApplicationData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          formDataToSend.append(key, JSON.stringify(value));
        } else if (value !== null) {
          formDataToSend.append(key, value.toString());
        }
      });

      // Add declaration file if exists
      if (formData.decloration_file) {
        formDataToSend.append('decloration_file', formData.decloration_file);
      }

      // First create the application
      const response = await api.post('/application/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        const newApplicationId = response.data.id;
        localStorage.setItem('currentApplicationId', newApplicationId.toString());
        
        // Now add the mode to the created application
        await api.post('/modes/application_modes/', {
          mode_id: formData.modes[0].mode_id,
          application_id: newApplicationId
        });

        setModalMessage(t("createApplication.success", "Application created successfully!"));
        setShowSuccessModal(true);
        navigate('/application-list');
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
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="max-w-md">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('createApplication.mode', 'Mode')}
          </label>
          <select
            value={formData.modes?.[0]?.mode_id || ''}
            onChange={(e) => {
              const selectedMode = modes.find(mode => mode.id === Number(e.target.value));
              if (selectedMode) {
                setFormData(prev => ({
                  ...prev,
                  modes: [{ 
                    mode_id: selectedMode.id,
                    name_mode: selectedMode.name_mode,
                    code_mode: selectedMode.code_mode
                  }]
                }));
              }
            }}
            className="block w-full rounded-lg border-gray-300 shadow-sm
              focus:border-[#6C5DD3] focus:ring-[#6C5DD3]
              text-gray-700 text-sm
              transition-colors duration-200"
          >
            <option value="">{t('createApplication.selectMode', 'Select Mode')}</option>
            {modes.map(mode => (
              <option key={mode.id} value={mode.id}>
                {mode.name_mode}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleCreateApplication}
          disabled={!formData.modes?.[0]?.mode_id || loading}
          className="w-full px-6 py-2.5 bg-[#6C5DD3] text-white rounded-lg font-medium
            hover:bg-[#5b4eb3] disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200 ease-in-out shadow-sm"
        >
          {loading ? 
            t('createApplication.creating', 'Creating...') : 
            t('createApplication.createApplication', 'Create Application')
          }
        </button>
      </div>
    </div>
  );
};