import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/api";
import SuccessModal from "../components/SuccessModal";
import FormLayout from "../components/FormLayout";
import { useNavigate, useParams } from 'react-router-dom';
import { Dialog } from "@headlessui/react";

interface WorkingServiceFormData {
  service_name?: string;
  year: number;
  base_price: string;
  units: string;
  service: number;
}

interface ServiceName {
  id: number;
  service_name: string;
}

export default function CreateWorkingService() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [serviceNames, setServiceNames] = useState<ServiceName[]>([]);
  const [showCreateNameModal, setShowCreateNameModal] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  
  const currentYear = new Date().getFullYear();
  const availableYears = [currentYear];

  const [formData, setFormData] = useState<WorkingServiceFormData>({
    year: currentYear,
    base_price: "",
    units: "sht",
    service: 0
  });

  // Add loading state
  const [loading, setLoading] = useState(id ? true : false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch service names
        const serviceResponse = await api.get('https://cargo-calc.uz/api/v1/working_service/name/');
        setServiceNames(serviceResponse.data.results || []);

        // If we have an ID, fetch the existing service data
        if (id) {
          const [serviceData] = await Promise.all([
            api.get(`https://cargo-calc.uz/api/v1/working_service/tariff/${id}/`)
          ]);

          // Validate year when editing
          const serviceYear = serviceData.data.year;
          if (!availableYears.includes(serviceYear)) {
            alert(t('createWorkingService.invalidYear', 'Cannot edit service from this year. Only current, previous, and next year are allowed.'));
            navigate('/working-services');
            return;
          }

          // Normalize the units value before setting form data
          const normalizedUnits = serviceData.data.units === 'час' ? 'hour' : 
                                serviceData.data.units === 'шт' ? 'sht' : 
                                serviceData.data.units;

          // Update form with existing data and normalized units
          setFormData({
            service: serviceData.data.service,
            year: serviceYear,
            base_price: serviceData.data.base_price,
            units: normalizedUnits // Use the normalized value
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        navigate('/working-services');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate, t]);

  // Add loading state display
  if (loading) {
    return (
      <FormLayout
        title={t('createWorkingService.title', 'Edit Working Service')}
        subtitle={t('createWorkingService.subtitle', 'Edit details for the working service')}
      >
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5DD3]"></div>
        </div>
      </FormLayout>
    );
  }

  const handleCreateNewName = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/working_service/name/', {
        service_name: newServiceName
      });
      const newService = response.data;
      setServiceNames([...serviceNames, newService]);
      setFormData(prev => ({
        ...prev,
        service: newService.id
      }));
      setShowCreateNameModal(false);
      setNewServiceName("");
    } catch (error) {
      console.error('Error creating service name:', error);
      alert(t('createWorkingService.errorCreatingName', 'Error creating service name'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        units: formData.units // Make sure this is always 'sht' or 'hour'
      };

      if (id) {
        await api.put(`/working_service/tariff/${id}/`, submitData);
      } else {
        await api.post('/working_service/tariff/', submitData);
      }
      setShowSuccessModal(true);
      navigate('/working-services');
    } catch (error) {
      console.error('Error saving working service:', error);
      alert(t('createWorkingService.errorSaving', 'Error saving service'));
    }
  };

  return (
    <FormLayout
      title={id ? t('createWorkingService.editTitle', ) : t('createWorkingService.title', )}
      subtitle={id ? t('createWorkingService.editSubtitle',) : t('createWorkingService.subtitle', )}
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full max-w-7xl mx-auto px-4 sm:px-6">
        <div className="dark:bg-gray-800 p-4 sm:p-6 lg:p-8 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Service Name Selection */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-600 dark:text-white mb-1">
                {t('createWorkingService.serviceName', )}
              </label>
              <div className="relative">
                <select
                  value={formData.service}
                  onChange={(e) => setFormData({ ...formData, service: Number(e.target.value) })}
                  className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3] sm:text-sm"
                  required
                >
                  <option value="">{t('createWorkingService.selectService',)}</option>
                  {serviceNames.map((name) => (
                    <option key={name.id} value={name.id}>
                      {name.service_name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowCreateNameModal(true)}
                  className="mt-2 text-[#6C5DD3] hover:text-[#5c4eb3] text-sm font-medium"
                >
                  {t('createWorkingService.createNewName',)}
                </button>
              </div>
            </div>

            {/* Year */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-white mb-1">
                {t('createWorkingService.year', )}
              </label>
              <select
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3] sm:text-sm"
                required
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Base Price */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-white mb-1">
                {t('createWorkingService.basePrice',)}
              </label>
              <input
                type="text"
                value={formData.base_price}
                onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3] sm:text-sm"
                required
              />
            </div>

            {/* Units */}
            <div>
              <label className="block text-sm font-medium text-gray-600 dark:text-white mb-1">
                {t('createWorkingService.serviceInfo.units', )}
              </label>
              <select
                value={formData.units}
                onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3] sm:text-sm"
                required
              >
                <option value="sht">{t('createWorkingService.serviceInfo.unitsSelect.piece', )}</option>
                <option value="hour">{t('createWorkingService.serviceInfo.unitsSelect.hour', )}</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#6C5DD3] text-white px-4 py-2 rounded-lg hover:bg-[#5c4eb3]"
          >
            {id ? t('common.update', 'Update') : t('common.create', 'Create')}
          </button>
        </div>
      </form>

      {/* Create Name Modal */}
      <Dialog
        open={showCreateNameModal}
        onClose={() => setShowCreateNameModal(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-6">
            <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t('createWorkingService.createNewService',)}
            </Dialog.Title>

            <form onSubmit={handleCreateNewName}>
              <input
                type="text"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-gray-900 dark:text-white focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3] sm:text-sm"
                placeholder={t('createWorkingService.createNewService', )}
                required
              />
              
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateNameModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#6C5DD3] rounded-md hover:bg-[#5c4eb3]"
                >
                  {t('common.create', 'Create')}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={t('createWorkingService.successMessage', 'Service has been saved successfully!')}
      />
    </FormLayout>
  );
}