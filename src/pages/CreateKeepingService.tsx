import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/api";
import SuccessModal from "../components/SuccessModal";
import FormLayout from "../components/FormLayout";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Dialog } from "@headlessui/react";

interface KeepingServiceFormData {
  year: number;
  base_day: number;
  base_price: string;
  extra_price: string;
  keeping_services_id: number;
}

interface KeepingServiceName {
  id: number;
  name: string;
}

export default function CreateKeepingService() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const serviceId = Number(searchParams.get('id'));
  const serviceName = searchParams.get('name');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState<KeepingServiceFormData>({
    year: new Date().getFullYear(),
    base_day: 0,
    base_price: "",
    extra_price: "",
    keeping_services_id: serviceId,
  });
  const navigate = useNavigate();
  const [serviceNames, setServiceNames] = useState<KeepingServiceName[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateNameModal, setShowCreateNameModal] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchServiceNames = async () => {
      try {
        const response = await api.get('/keeping_service/keeping_service_name/');
        setServiceNames(response.data.results);
      } catch (error) {
        console.error('Error fetching service names:', error);
      }
    };
    fetchServiceNames();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen && !(event.target as Element).closest('.service-select')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const filteredNames = serviceNames.filter(service => 
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNewName = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/keeping_service/keeping_service_name/', {
        name: newServiceName
      });
      const newService = response.data;
      setServiceNames([...serviceNames, newService]);
      setFormData(prev => ({
        ...prev,
        keeping_services_id: newService.id
      }));
      setSearchQuery(newService.name);
      setShowCreateNameModal(false);
      setNewServiceName("");
    } catch (error) {
      console.error('Error creating service name:', error);
      alert(t('createKeepingService.errorCreatingName', 'Error creating service name'));
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? 0 : Number(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/keeping_service/keeping_service_price/', {
        year: formData.year,
        base_day: formData.base_day,
        base_price: formData.base_price,
        extra_price: formData.extra_price,
        keeping_services_id: formData.keeping_services_id
      });

      setShowSuccessModal(true);
      
      // Reset form
      setFormData({
        year: new Date().getFullYear(),
        base_day: 0,
        base_price: "",
        extra_price: "",
        keeping_services_id: formData.keeping_services_id,
      });
      navigate('/keeping-services');
    
    } catch (error: any) {
      console.error('Error creating keeping service:', error);
      let errorMessage = t('createKeepingService.errorMessage', 'Failed to create service. Please try again.');
      
      if (error.response?.data) {
        const serverError = error.response.data;
        errorMessage = typeof serverError === 'object' 
          ? Object.entries(serverError).map(([key, value]) => `${key}: ${value}`).join('\n')
          : serverError.toString();
      }
      
      alert(errorMessage);
    }
  };

  return (
    <FormLayout
      title={t('createKeepingService.title', 'Create Keeping Service Price')}
      subtitle={serviceName ? t('createKeepingService.subtitleWithName', 'Add pricing details for {{name}}', { name: serviceName }) 
        : t('createKeepingService.subtitle', 'Add pricing details for the service')}
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full max-w-7xl mx-auto px-4 sm:px-6">
        <div className="dark:bg-gray-800 p-4 sm:p-6 lg:p-8 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-600 dark:text-white mb-1">
                {t('createKeepingService.serviceName', 'Service Name')}
              </label>
              <div className="relative service-select">
                <div
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="block w-full rounded-md border border-gray-300 dark:border-gray-600 
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                    px-3 py-2 text-sm md:text-base cursor-pointer
                    focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                >
                  {serviceNames.find(s => s.id === formData.keeping_services_id)?.name || 
                   t('createKeepingService.selectService', 'Select a service')}
                </div>
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full px-3 py-2 text-sm border-b border-gray-300 dark:border-gray-600
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                        focus:outline-none"
                      placeholder={t('createKeepingService.searchNames', 'Search service names...')}
                      onClick={(e) => e.stopPropagation()}
                    />
                    {filteredNames.map((service) => (
                      <div
                        key={service.id}
                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600
                          ${service.id === formData.keeping_services_id ? 'bg-gray-100 dark:bg-gray-600' : ''}`}
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            keeping_services_id: service.id
                          }));
                          setIsDropdownOpen(false);
                          setSearchQuery('');
                        }}
                      >
                        {service.name}
                      </div>
                    ))}
                    {filteredNames.length === 0 && (
                      <div className="px-4 py-2">
                        <p className="text-gray-500 dark:text-gray-400">
                          {t('createKeepingService.noResults', 'No services found')}
                        </p>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setNewServiceName(searchQuery);
                            setShowCreateNameModal(true);
                            setIsDropdownOpen(false);
                          }}
                          className="text-[#6C5DD3] hover:text-[#5c4eb3] font-medium"
                        >
                          {t('createKeepingService.createNew', '+ Create new service')}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-1">
              <label 
                htmlFor="year" 
                className="block text-sm font-medium text-gray-600 dark:text-white mb-1"
              >
                {t('createKeepingService.year', 'Year')}
              </label>
              <input
                type="number"
                name="year"
                id="year"
                value={formData.year}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                  px-3 py-2 text-sm md:text-base
                  focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                required
              />
            </div>

            <div className="col-span-1">
              <label 
                htmlFor="base_day" 
                className="block text-sm font-medium text-gray-600 dark:text-white mb-1"
              >
                {t('createKeepingService.baseDays', 'Base Days')}
              </label>
              <input
                type="number"
                name="base_day"
                id="base_day"
                value={formData.base_day}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                  px-3 py-2 text-sm md:text-base
                  focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                required
              />
            </div>

            <div className="col-span-1">
              <label 
                htmlFor="base_price" 
                className="block text-sm font-medium text-gray-600 dark:text-white mb-1"
              >
                {t('createKeepingService.basePrice', 'Base Price')}
              </label>
              <input
                type="text"
                name="base_price"
                id="base_price"
                value={formData.base_price}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                  px-3 py-2 text-sm md:text-base
                  focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                required
              />
            </div>

            <div className="col-span-1">
              <label 
                htmlFor="extra_price" 
                className="block text-sm font-medium text-gray-600 dark:text-white mb-1"
              >
                {t('createKeepingService.extraPrice', 'Extra Price')}
              </label>
              <input
                type="text"
                name="extra_price"
                id="extra_price"
                value={formData.extra_price}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                  px-3 py-2 text-sm md:text-base
                  focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base
              bg-[#6C5DD3] text-white rounded-lg hover:bg-[#5c4eb3]
              focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2"
          >
            {t('createKeepingService.submit', 'Create Service')}
          </button>
        </div>
      </form>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={t('createKeepingService.successMessage', 'Service has been created successfully!')}
      />

      <Dialog
        open={showCreateNameModal}
        onClose={() => setShowCreateNameModal(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-6">
            <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t('createKeepingService.createNewService', 'Create New Service')}
            </Dialog.Title>

            <form onSubmit={handleCreateNewName}>
              <div className="mt-4">
                <input
                  type="text"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 dark:border-gray-600 
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                    px-3 py-2 text-sm md:text-base
                    focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                  placeholder={t('createKeepingService.enterServiceName', 'Enter service name')}
                  required
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateNameModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 
                    rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 
                    dark:hover:bg-gray-600"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#6C5DD3] 
                    rounded-md hover:bg-[#5c4eb3]"
                >
                  {t('common.create', 'Create')}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </FormLayout>
  );
}