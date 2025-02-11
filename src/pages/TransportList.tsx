import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/api';
import { Fragment } from 'react';
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import ConfirmModal from "../components/ConfirmModal";
import SuccessModal from "../components/SuccessModal";
import { Dialog } from "@headlessui/react";

interface TransportType {
  id: number;
  transport_type: string;
}

export default function TransportList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [transportTypes, setTransportTypes] = useState<TransportType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transportToDelete, setTransportToDelete] = useState<TransportType | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransport, setEditingTransport] = useState<TransportType | null>(null);
  const [editFormData, setEditFormData] = useState<Omit<TransportType, 'id'>>({
    transport_type: "",
  });

  const fetchData = async () => {
    try {
      const [typesResponse] = await Promise.all([
        api.get('/transport/type/'),
      ]);
      
      setTransportTypes(typesResponse.data.results);
      setLoading(false);
    } catch (err) {
      setError(t('transportList.errorLoading', 'Error loading transports'));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [t]);

  const handleDelete = (transport: TransportType) => {
    setTransportToDelete(transport);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!transportToDelete) return;

    try {
      await api.delete(`/transport/type/${transportToDelete.id}/`);
      setModalMessage(t("transportList.deleteSuccess", "Transport type deleted successfully"));
      setShowSuccessModal(true);
      fetchData();
    } catch (error) {
      console.error("Error deleting transport:", error);
    }
    setShowDeleteModal(false);
  };

  const handleEdit = (transport: TransportType) => {
    setEditingTransport(transport);
    setEditFormData({
      transport_type: transport.transport_type,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransport) return;

    try {
      await api.put(`/transport/type/${editingTransport.id}/`, editFormData);
      setModalMessage(t("transportList.editSuccess", "Transport type updated successfully"));
      setShowSuccessModal(true);
      setShowEditModal(false);
      fetchData();
    } catch (error) {
      console.error("Error updating transport:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5DD3]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            {t('transportList.title', 'Transports')}
          </h1>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/transport/create')}
              className="bg-[#6C5DD3] text-white px-4 py-2 text-sm rounded-lg 
              hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2
              dark:focus:ring-offset-gray-800 transition-all duration-200"
            >
              {t('transportList.createTransport', 'Create Transport Type')}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('transportList.table.id', 'ID')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('transportList.table.type', 'Transport Type')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('transportList.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {transportTypes.map((type, index) => (
                <tr key={`type-${type.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {type.transport_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    <Menu as="div" className="relative inline-block text-left">
                      <Menu.Button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <EllipsisVerticalIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                      </Menu.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute  bottom-[-15px] right-20 z-50 mt-2 w-36 rounded-md bg-white dark:bg-gray-800 shadow-lg">
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => handleEdit(type)}
                                  className={`${
                                    active ? "bg-gray-100 dark:bg-gray-700" : ""
                                  } flex w-full items-center px-4 py-2 text-sm text-blue-600 dark:text-blue-400`}
                                >
                                  {t("transportList.edit", "Edit")}
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => handleDelete(type)}
                                  className={`${
                                    active ? "bg-gray-100 dark:bg-gray-700" : ""
                                  } flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400`}
                                >
                                  {t("transportList.delete", "Delete")}
                                </button>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title={t("transportList.deleteTitle", "Delete Transport Type")}
        message={t(
          "transportList.deleteConfirmation",
          `Are you sure you want to delete transport type "${transportToDelete?.transport_type}"? This action cannot be undone.`
        )}
        confirmText={t("transportList.delete", "Delete")}
        cancelText={t("common.cancel", "Cancel")}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={t("common.success", "Success")}
        message={modalMessage}
      />

      <Dialog
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-6">
            <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {t("transportList.editTitle", "Edit Transport Type")}
            </Dialog.Title>

            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("transportList.form.type", "Transport Type")}
                </label>
                <input
                  type="text"
                  name="transport_type"
                  value={editFormData.transport_type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#6C5DD3] focus:ring-[#6C5DD3] dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {t("common.cancel", "Cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#6C5DD3] rounded-md hover:bg-[#5c4eb3]"
                >
                  {t("common.save", "Save")}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}