import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/api';
import SuccessModal from "../components/SuccessModal";
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import ConfirmModal from "../components/ConfirmModal";

interface Measurement {
  id: number;
  name: string;
}

export default function MeasurementList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [editingMeasurement, setEditingMeasurement] = useState<Measurement | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [measurementToDelete, setMeasurementToDelete] = useState<Measurement | null>(null);

  const fetchMeasurements = async () => {
    try {
      const response = await api.get('/items/measurement/');
      setMeasurements(response.data);
      setLoading(false);
    } catch (err) {
      setError(t('measurementList.errorLoading', 'Error loading measurements'));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeasurements();
  }, [t]);

  const handleDelete = async (id: number, name: string) => {
    setMeasurementToDelete({ id, name } as Measurement);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!measurementToDelete) return;

    try {
      await api.delete(`/items/measurement/${measurementToDelete.id}/`);
      setModalMessage(t('measurementList.deleteSuccess', 'Measurement deleted successfully'));
      setShowSuccessModal(true);
      fetchMeasurements();
    } catch (error) {
      console.error('Error deleting measurement:', error);
      alert(t('measurementList.deleteError', 'Failed to delete measurement'));
    }
  };

  const handleEdit = (measurement: Measurement) => {
    setEditingMeasurement(measurement);
  };

  const handleSaveEdit = async (id: number) => {
    if (!editingMeasurement) return;

    try {
      await api.put(`/items/measurement/${id}/`, {
        name: editingMeasurement.name
      });
      setModalMessage(t('measurementList.editSuccess', 'Measurement updated successfully'));
      setShowSuccessModal(true);
      setEditingMeasurement(null);
      fetchMeasurements();
    } catch (error) {
      console.error('Error updating measurement:', error);
      alert(t('measurementList.editError', 'Failed to update measurement'));
    }
  };

  const handleCancelEdit = () => {
    setEditingMeasurement(null);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          {t('measurementList.title', 'Measurements')}
        </h1>
        <button
          onClick={() => navigate('/measurements/create')}
          className="bg-[#6C5DD3] text-white px-4 py-2 text-sm rounded-lg 
          hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2
          dark:focus:ring-offset-gray-800 transition-all duration-200"
        >
          {t('measurementList.createMeasurement', 'Create Measurement')}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t('measurementList.table.id', 'ID')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t('measurementList.table.name', 'Name')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t('measurementList.table.actions', 'Actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {measurements.map((measurement, index) => (
              <tr key={measurement.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {editingMeasurement?.id === measurement.id ? (
                    <input
                      type="text"
                      value={editingMeasurement.name}
                      onChange={(e) => setEditingMeasurement({ ...editingMeasurement, name: e.target.value })}
                      className="rounded-md border border-gray-300 dark:border-gray-600 
                      px-3 py-1 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  ) : (
                    measurement.name
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {editingMeasurement?.id === measurement.id ? (
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleSaveEdit(measurement.id)}
                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300
                        transition-colors duration-200"
                      >
                        {t('measurementList.save', 'Save')}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300
                        transition-colors duration-200"
                      >
                        {t('measurementList.cancel', 'Cancel')}
                      </button>
                    </div>
                  ) : (
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
                        <Menu.Items 
                          className={`absolute z-50 mt-2 w-36 rounded-md bg-white dark:bg-gray-800 
                          shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none
                          ${measurements.indexOf(measurement) >= measurements.length - 3 ? 'bottom-2 mb-2' : 'top-full'} 
                          ${measurements.indexOf(measurement) >= measurements.length - 3 ? 'origin-bottom-right' : 'origin-top-right'}
                          right-0`}
                        >
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => handleEdit(measurement)}
                                  className={`${
                                    active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                  } flex w-full items-center px-4 py-2 text-sm text-blue-600 dark:text-blue-400`}
                                >
                                  {t('measurementList.edit', 'Edit')}
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => handleDelete(measurement.id, measurement.name)}
                                  className={`${
                                    active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                  } flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400`}
                                >
                                  {t('measurementList.delete', 'Delete')}
                                </button>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={t('common.success')}
        message={modalMessage}
      />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title={t('measurementList.deleteTitle', 'Delete Measurement')}
        message={t('measurementList.deleteConfirmation', 
          `Are you sure you want to delete measurement "${measurementToDelete?.name}"? This action cannot be undone.`)}
        confirmText={t('measurementList.delete', 'Delete')}
        cancelText={t('common.cancel', 'Cancel')}
      />
    </div>
  );
}