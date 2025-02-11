import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { apiService } from "../api/api";
import ConfirmModal from "../components/ConfirmModal";
import SuccessModal from "../components/SuccessModal";
import { Pencil, Trash2 } from 'lucide-react';

interface WorkingService {
  id: number;
  base_day: number;
  service_name: string;
  base_price: string;
  extra_price: string;
  units: string;
}

export default function WorkingServiceList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [services, setServices] = useState<WorkingService[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<WorkingService | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Omit<WorkingService, 'id'>>({
    service_name: '',
    base_day: 0,
    base_price: '',
    extra_price: '',
    units: '',
  });

  const fetchServices = async () => {
    try {
      const response = await apiService.getWorkingServices();
      setServices(response.results);
      setLoading(false);
    } catch (error) {
      console.error("Error loading working services:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleDelete = (service: WorkingService) => {
    setServiceToDelete(service);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;

    try {
      await apiService.deleteWorkingService(serviceToDelete.id);
      setModalMessage(t("workingService.deleteSuccess"));
      setShowSuccessModal(true);
      fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
    }
    setShowDeleteModal(false);
  };

  const openEditModal = (service: WorkingService) => {
    setServiceToDelete(service);
    setFormData({
      service_name: service.service_name,
      base_day: service.base_day,
      base_price: service.base_price,
      extra_price: service.extra_price,
      units: service.units,
    });
    setIsEditing(true);
    setIsFormModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && serviceToDelete) {
        await apiService.updateWorkingService(serviceToDelete.id, formData);
        setModalMessage(t("workingService.updateSuccess"));
      } else {
        await apiService.createWorkingService(formData);
        setModalMessage(t("workingService.createSuccess"));
      }
      setIsFormModalOpen(false);
      setShowSuccessModal(true);
      fetchServices();
    } catch (error) {
      console.error('Error saving working service:', error);
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
          {t("workingService.title")}
        </h1>
        <button
          onClick={() => navigate("/working-services/create")}
          className="bg-[#6C5DD3] text-white px-4 py-2 rounded-lg hover:bg-[#5c4eb3]"
        >
          {t("workingService.subtitle")}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("workingService.serviceName")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("workingService.baseDay")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("workingService.basePrice")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("workingService.extraPrice")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("workingService.units")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-20">
                {t("common.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {services.map((service) => (
              <tr key={service.id}>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {service.service_name}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {service.base_day}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {service.base_price}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {service.extra_price}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {service.units}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openEditModal(service)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title={t("common.edit")}
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(service)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title={t("common.delete")}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title={t("workingService.deleteTitle")}
        message={t("workingService.deleteConfirmation")}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={modalMessage}
      />

      {/* Add Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsFormModalOpen(false)} />
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <h2 className="text-xl font-semibold mb-4">
                {isEditing ? t("workingService.edit") : t("workingService.create")}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("workingService.serviceName")}
                    </label>
                    <input
                      type="text"
                      value={formData.service_name}
                      onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-[#6C5DD3] focus:ring-[#6C5DD3] sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("workingService.baseDay")}
                    </label>
                    <input
                      type="number"
                      value={formData.base_day}
                      onChange={(e) => setFormData({ ...formData, base_day: parseInt(e.target.value) })}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-[#6C5DD3] focus:ring-[#6C5DD3] sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("workingService.basePrice")}
                    </label>
                    <input
                      type="text"
                      value={formData.base_price}
                      onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-[#6C5DD3] focus:ring-[#6C5DD3] sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("workingService.extraPrice")}
                    </label>
                    <input
                      type="text"
                      value={formData.extra_price}
                      onChange={(e) => setFormData({ ...formData, extra_price: e.target.value })}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-[#6C5DD3] focus:ring-[#6C5DD3] sm:text-sm"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("workingService.units")}
                    </label>
                    <input
                      type="text"
                      value={formData.units}
                      onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-[#6C5DD3] focus:ring-[#6C5DD3] sm:text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
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
    </div>
  );
}