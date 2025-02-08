import { useState, useEffect, Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { api, apiService } from "../api/api";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import ConfirmModal from "../components/ConfirmModal";
import SuccessModal from "../components/SuccessModal";
import { Dialog } from "@headlessui/react";

interface Firm {
  id: number;
  INN: string;
  firm_name: string;
  phoneNumber_firm: string;
  full_name_director: string;
  phoneNumber_director: string;
  firm_trustee: string;
  phoneNumber_trustee: string;
}

export default function FirmList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [firms, setFirms] = useState<Firm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [firmToDelete, setFirmToDelete] = useState<Firm | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingFirm, setEditingFirm] = useState<Firm | null>(null);
  const [editFormData, setEditFormData] = useState<Omit<Firm, 'id'>>({
    INN: "",
    firm_name: "",
    phoneNumber_firm: "",
    full_name_director: "",
    phoneNumber_director: "",
    firm_trustee: "",
    phoneNumber_trustee: "",
  });

  const fetchFirms = async () => {
    try {
      const response = await apiService.getFirms();
      setFirms(response);
      setLoading(false);
    } catch (err) {
      setError(t("firmList.errorLoading", "Error loading firms"));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFirms();
  }, [t]);

  console.log(firms);
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

  const handleDelete = (firm: Firm) => {
    setFirmToDelete(firm);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!firmToDelete) return;

    try {
      await api.delete(`/firms/${firmToDelete.id}/`);
      setModalMessage(t("firmList.deleteSuccess", "Firm deleted successfully"));
      setShowSuccessModal(true);
      fetchFirms();
    } catch (error) {
      console.error("Error deleting firm:", error);
    }
    setShowDeleteModal(false);
  };

  const handleEdit = (firm: Firm) => {
    setEditingFirm(firm);
    setEditFormData({
      INN: firm.INN,
      firm_name: firm.firm_name,
      phoneNumber_firm: firm.phoneNumber_firm,
      full_name_director: firm.full_name_director,
      phoneNumber_director: firm.phoneNumber_director,
      firm_trustee: firm.firm_trustee,
      phoneNumber_trustee: firm.phoneNumber_trustee,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFirm) return;

    try {
      await apiService.updateFirm(editingFirm.id, editFormData);
      setFirms(prevFirms => 
        prevFirms.map(firm => 
          firm.id === editingFirm.id 
            ? { ...firm, ...editFormData } 
            : firm
        )
      );
      setModalMessage(t("firmList.editSuccess", "Firm updated successfully"));
      setShowSuccessModal(true);
      setShowEditModal(false);
    } catch (error) {
      console.error("Error updating firm:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          {t("firmList.title", "Firms")}
        </h1>
        <button
          onClick={() => navigate("/firms")}
          className="bg-[#6C5DD3] text-white px-4 py-2 text-sm rounded-lg 
          hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2
          dark:focus:ring-offset-gray-800 transition-all duration-200"
        >
          {t("firmList.createFirm", "Create Firm")}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("firmList.table.number", "#")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("firmList.table.inn", "INN")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("firmList.table.firmName", "Firm Name")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("firmList.table.phoneNumber", "Phone Number")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("firmList.table.director", "Director")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("firmList.table.trustee", "Trustee")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("firmList.table.actions", "Actions")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {firms?.map((firm, index) => (
              <tr
                key={firm.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {firm.INN}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {firm.firm_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {firm.phoneNumber_firm}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  <div>{firm.full_name_director}</div>
                  <div className="text-gray-500 dark:text-gray-400">
                    {firm.phoneNumber_director}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  <div>{firm.firm_trustee}</div>
                  <div className="text-gray-500 dark:text-gray-400">
                    {firm.phoneNumber_trustee}
                  </div>
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
                      <Menu.Items
                        className={`absolute z-50 mt-2 w-36 rounded-md bg-white dark:bg-gray-800 
                        shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none
                        ${
                          firms.indexOf(firm) >= firms.length - 3
                            ? "bottom-full mb-2"
                            : "top-full"
                        } 
                        ${
                          firms.indexOf(firm) >= firms.length - 3
                            ? "origin-bottom-right"
                            : "origin-top-right"
                        }
                        right-0`}
                      >
                        <div className="py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => handleEdit(firm)}
                                className={`${
                                  active ? "bg-gray-100 dark:bg-gray-700" : ""
                                } flex w-full items-center px-4 py-2 text-sm text-blue-600 dark:text-blue-400`}
                              >
                                {t("firmList.edit", "Edit")}
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => handleDelete(firm)}
                                className={`${
                                  active ? "bg-gray-100 dark:bg-gray-700" : ""
                                } flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400`}
                              >
                                {t("firmList.delete", "Delete")}
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

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title={t("firmList.deleteTitle", "Delete Firm")}
        message={t(
          "firmList.deleteConfirmation",
          `Are you sure you want to delete firm "${firmToDelete?.firm_name}"? This action cannot be undone.`
        )}
        confirmText={t("firmList.delete", "Delete")}
        cancelText={t("common.cancel", "Cancel")}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={t("common.success")}
        message={modalMessage}
      />

      <Dialog
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto w-full max-w-3xl rounded-lg bg-white dark:bg-gray-800 p-8 overflow-y-auto max-h-[90vh]">
            <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              {t("firmList.editTitle", "Edit Firm")}
            </Dialog.Title>

            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("firmList.form.inn", "INN")}
                  </label>
                  <input
                    type="text"
                    name="INN"
                    value={editFormData.INN}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#6C5DD3] focus:ring-[#6C5DD3] dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("firmList.form.firmName", "Firm Name")}
                  </label>
                  <input
                    type="text"
                    name="firm_name"
                    value={editFormData.firm_name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#6C5DD3] focus:ring-[#6C5DD3] dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("firmList.form.phoneNumberFirm", "Firm Phone Number")}
                  </label>
                  <input
                    type="text"
                    name="phoneNumber_firm"
                    value={editFormData.phoneNumber_firm}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#6C5DD3] focus:ring-[#6C5DD3] dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("firmList.form.fullNameDirector", "Director Full Name")}
                  </label>
                  <input
                    type="text"
                    name="full_name_director"
                    value={editFormData.full_name_director}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#6C5DD3] focus:ring-[#6C5DD3] dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("firmList.form.phoneNumberDirector", "Director Phone Number")}
                  </label>
                  <input
                    type="text"
                    name="phoneNumber_director"
                    value={editFormData.phoneNumber_director}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#6C5DD3] focus:ring-[#6C5DD3] dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("firmList.form.firmTrustee", "Firm Trustee")}
                  </label>
                  <input
                    type="text"
                    name="firm_trustee"
                    value={editFormData.firm_trustee}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#6C5DD3] focus:ring-[#6C5DD3] dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t("firmList.form.phoneNumberTrustee", "Trustee Phone Number")}
                  </label>
                  <input
                    type="text"
                    name="phoneNumber_trustee"
                    value={editFormData.phoneNumber_trustee}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#6C5DD3] focus:ring-[#6C5DD3] dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
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
