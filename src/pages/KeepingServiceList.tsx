import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { api, apiService } from "../api/api";
import ConfirmModal from "../components/ConfirmModal";
import SuccessModal from "../components/SuccessModal";
import { Pencil, Trash2 } from 'lucide-react';
import { Dialog } from "@headlessui/react";

interface KeepingService {
  id: number;
  base_day: number;
  name: string;
  base_price: string;
  extra_price: string;
  year: number;
}

interface KeepingServiceFormData {
  name: string;
  base_day: number;
  base_price: string;
  extra_price: string;
}

interface KeepingServiceName {
  id: number;
  name: string;
}

interface KeepingServicePrice {
  id: number;
  year: number;
  base_day: number;
  base_price: string;
  extra_price: string;
  keeping_services_id: number;
}

interface KeepingServiceWithPriceId extends KeepingService {
  priceId?: number; // Add this to track the price record ID
}

export default function KeepingServiceList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [services, setServices] = useState<KeepingServiceWithPriceId[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<KeepingServiceWithPriceId | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<KeepingServiceFormData>({
    name: '',
    base_day: 0,
    base_price: '',
    extra_price: '',
  });
  const [showNameModal, setShowNameModal] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");

  const fetchServices = async () => {
    try {
      // Fetch both service names and prices
      const [namesResponse, pricesResponse] = await Promise.all([
        apiService.getKeepingServiceNames(),
        apiService.getKeepingServicePrices()
      ]);

      const names = namesResponse?.results ;
      const prices = pricesResponse?.results || [];
      console.log(names, prices);

      // Combine the data
      const combinedServices = names.map((name: KeepingServiceName) => {
        const price = prices.find((p: KeepingServicePrice) => p.keeping_services_id === name.id);
        return {
          id: name.id,
          name: name.name,
          base_day: price?.base_day || 0,
          base_price: price?.base_price || '0',
          extra_price: price?.extra_price || '0',
          year: price?.year || new Date().getFullYear(),
          priceId: price?.id // Store the price record ID
        };
      });

      setServices(combinedServices);
      setLoading(false);
    } catch (error) {
      console.error("Error loading keeping services:", error);
      setServices([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = (service: KeepingServiceWithPriceId) => {
    setServiceToDelete(service);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;

    try {
      await apiService.deleteKeepingService(serviceToDelete.id);
      setModalMessage(t("keepingService.deleteSuccess"));
      setShowSuccessModal(true);
      fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
    }
    setShowDeleteModal(false);
  };

  const handleEdit = (service: KeepingServiceWithPriceId) => {
    setFormData({
      name: service.name,
      base_day: service.base_day,
      base_price: service.base_price,
      extra_price: service.extra_price,
    });
    setServiceToDelete(service);
    setIsEditing(true);
    setIsFormModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && serviceToDelete) {
        // Update service name
        await api.put(
          `/keeping_service/keeping_service_name/${serviceToDelete.id}/`, 
          { name: formData.name }
        );

        // Update or create price details
        const priceData = {
          year: new Date().getFullYear(),
          base_day: formData.base_day,
          base_price: formData.base_price,
          extra_price: formData.extra_price,
          keeping_services_id: serviceToDelete.id  // Make sure this is included
        };

        if (serviceToDelete.priceId) {
          // Update existing price record
          await api.put(
            `/keeping_service/keeping_service_price/${serviceToDelete.priceId}/`,
            priceData
          );
        } else {
          // Create new price record
          await api.post(
            '/keeping_service/keeping_service_price/',
            priceData
          );
        }
        
        setModalMessage(t("keepingService.updateSuccess"));
      } else {
        // Handle create new service case
        await apiService.createKeepingService(formData);
        setModalMessage(t("keepingService.createSuccess"));
      }
      setIsFormModalOpen(false);
      setShowSuccessModal(true);
      fetchServices();
    } catch (error: any ) {
      console.error("Error saving service:", error);
      // Add more detailed error logging
      if (error.response) {
        console.error("Error response data:", error.response.data);
      }
      alert(t("keepingService.updateError", "Error updating service"));
    }
  };

  const handleCreateService = () => {
    setShowNameModal(true);
  };

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiService.createKeepingServiceName({
        name: newServiceName
      });
      
      if (response.data.id) {
        setShowNameModal(false);
        navigate(`/keeping-services/create-price?id=${response.data.id}&name=${encodeURIComponent(newServiceName)}`);
      }
    } catch (error) {
      console.error('Error creating service name:', error);
      alert(t('keepingService.createError', 'Error creating service'));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5DD3]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          {t("keepingService.title")}
        </h1>
        <button
          onClick={handleCreateService}
          className="bg-[#6C5DD3] text-white px-4 py-2 rounded-lg hover:bg-[#5c4eb3]"
        >
          {t("keepingService.create")}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("keepingService.name")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("keepingService.baseDay")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("keepingService.basePrice")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("keepingService.extraPrice")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("common.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {services?.map((service) => (
              <tr key={`service-${service.id}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {service.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {service.base_day}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {service.base_price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {service.extra_price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(service)}
                      className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                    >
                      <Pencil size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(service)}
                      className="text-red-600 hover:text-red-800 dark:hover:text-red-400"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Service Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsFormModalOpen(false)} />
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
              <h2 className="text-xl font-semibold mb-4 dark:text-white">
                {isEditing ? t("keepingService.edit") : t("keepingService.create")}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t("keepingService.name")}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-[#6C5DD3] focus:ring-[#6C5DD3] sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t("keepingService.baseDay")}
                    </label>
                    <input
                      type="number"
                      value={formData.base_day}
                      onChange={(e) => setFormData({ ...formData, base_day: parseInt(e.target.value) })}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-[#6C5DD3] focus:ring-[#6C5DD3] sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t("keepingService.basePrice")}
                    </label>
                    <input
                      type="text"
                      value={formData.base_price}
                      onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-[#6C5DD3] focus:ring-[#6C5DD3] sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t("keepingService.extraPrice")}
                    </label>
                    <input
                      type="text"
                      value={formData.extra_price}
                      onChange={(e) => setFormData({ ...formData, extra_price: e.target.value })}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-[#6C5DD3] focus:ring-[#6C5DD3] sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-[#6C5DD3] rounded-md hover:bg-[#5c4eb8]"
                  >
                    {isEditing ? t("common.update") : t("common.create")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title={t("keepingService.deleteTitle")}
        message={t("keepingService.deleteConfirmation")}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={modalMessage}
      />

      {/* Replace the existing service name selection modal with this input modal */}
      <Dialog
        open={showNameModal}
        onClose={() => setShowNameModal(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-6">
            <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t('keepingService.enterName', 'Enter Service Name')}
            </Dialog.Title>

            <form onSubmit={handleNameSubmit}>
              <div className="mt-4">
                <input
                  type="text"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="block w-full rounded-md border border-gray-300 dark:border-gray-600 
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                    px-3 py-2 text-sm md:text-base
                    focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                  placeholder={t('keepingService.namePlaceholder', 'Enter service name')}
                  required
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNameModal(false)}
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
                  {t('common.continue', 'Continue')}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}