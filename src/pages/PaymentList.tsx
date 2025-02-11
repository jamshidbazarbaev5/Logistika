import { useState, useEffect, Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import ConfirmModal from "../components/ConfirmModal";
import SuccessModal from "../components/SuccessModal";

interface PaymentMethod {
  id: number;
  payment_method: string;
}

export default function PaymentMethodList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<PaymentMethod | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

  const fetchPaymentMethods = async () => {
    try {
      const response = await api.get('/payment_method/');
      setPaymentMethods(response.data.results);
      setLoading(false);
    } catch (err) {
      setError(t("paymentMethodList.errorLoading", "Error loading payment methods"));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const handleDelete = (method: PaymentMethod) => {
    setMethodToDelete(method);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!methodToDelete) return;

    try {
      await api.delete(`/payment_method/${methodToDelete.id}/`);
      setModalMessage(t("paymentMethodList.deleteSuccess", "Payment method deleted successfully"));
      setShowSuccessModal(true);
      fetchPaymentMethods();
    } catch (error) {
      console.error("Error deleting payment method:", error);
    }
    setShowDeleteModal(false);
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
  };

  const handleSaveEdit = async (id: number) => {
    if (!editingMethod) return;

    try {
      await api.put(`/payment_method/${id}/`, {
        payment_method: editingMethod.payment_method
      });
      setModalMessage(t("paymentMethodList.editSuccess", "Payment method updated successfully"));
      setShowSuccessModal(true);
      setEditingMethod(null);
      fetchPaymentMethods();
    } catch (error) {
      console.error("Error updating payment method:", error);
    }
  };

  const handleCancelEdit = () => {
    setEditingMethod(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5DD3]"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            {t("paymentMethodList.title")}
          </h1>
          <p className="mt-1 sm:mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t("paymentMethodList.subtitle", "Manage payment methods")}
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => navigate("/payment-methods/create")}
            className="inline-flex items-center px-4 py-2 border border-transparent 
              rounded-md shadow-sm text-sm font-medium text-white bg-[#6C5DD3] 
              hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 
              focus:ring-offset-2 focus:ring-[#6C5DD3]"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            {t("paymentMethodList.createButton", "Create Payment Method")}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                {t("paymentMethodList.idColumn", "ID")}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                {t("paymentMethodList.title")}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                {t("paymentMethodList.actionsColumn")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paymentMethods.map((method, index) => (
              <tr key={method.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {editingMethod?.id === method.id ? (
                    <input
                      type="text"
                      value={editingMethod.payment_method}
                      onChange={(e) => setEditingMethod({ ...editingMethod, payment_method: e.target.value })}
                      className="rounded-md border border-gray-300 dark:border-gray-600 
                      px-3 py-1 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                      bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    />
                  ) : (
                    method.payment_method
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {editingMethod?.id === method.id ? (
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleSaveEdit(method.id)}
                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300
                        transition-colors duration-200"
                      >
                        {t("paymentMethodList.save", "Save")}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300
                        transition-colors duration-200"
                      >
                        {t("paymentMethodList.cancel", "Cancel")}
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
                          ${paymentMethods.indexOf(method) >= paymentMethods.length - 3 ? 'bottom-0 mb-2' : 'top-full'} 
                          ${paymentMethods.indexOf(method) >= paymentMethods.length - 3 ? 'origin-bottom-right' : 'origin-top-right'}
                          right-0`}
                        >
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => handleEdit(method)}
                                  className={`${
                                    active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                  } flex w-full items-center px-4 py-2 text-sm text-blue-600 dark:text-blue-400`}
                                >
                                  {t("paymentMethodList.edit", "Edit")}
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => handleDelete(method)}
                                  className={`${
                                    active ? 'bg-gray-100 dark:bg-gray-700' : ''
                                  } flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400`}
                                >
                                  {t("paymentMethodList.delete", "Delete")}
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

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title={t("paymentMethodList.deleteTitle", "Delete Payment Method")}
        message={t(
          "paymentMethodList.deleteConfirmation",
          `Are you sure you want to delete payment method "${methodToDelete?.payment_method}"? This action cannot be undone.`
        )}
        confirmText={t("paymentMethodList.delete", "Delete")}
        cancelText={t("common.cancel", "Cancel")}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={t("common.success", "Success")}
        message={modalMessage}
      />
    </div>
  );
}