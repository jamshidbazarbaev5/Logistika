import { useState, useEffect, Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { api } from "../api/api";
import ConfirmModal from "../components/ConfirmModal";
import SuccessModal from "../components/SuccessModal";
import { SearchBar, SearchField } from "../components/SearchBar";

interface ApplicationMode {
  id: number;
  mode_id: number;
  application_id: number;
}

interface KeepingService {
  id?: number;
  day: number;
  keeping_services_id: number;
  application_id?: number;
}

interface WorkingService {
  id?: number;
  quantity: number;
  service_id: number;
  application_id?: number;
}

interface PhotoReport {
  id?: number;
  photo: string;
  application_id?: number;
}

interface Transport {
  id?: number;
  transport_number: string;
  transport_type: number;
  application_id?: number;
}

interface Product {
  id?: number;
  quantity: number;
  product_id: number;
  storage_id: number;
  application_id?: number;
}

interface Application {
  id: number;
  decloration_file: string;
  brutto: number | null;
  netto: number | null;
  coming_date: string;
  decloration_date: string;
  decloration_number: string;
  vip_application: boolean | null;
  total_price: number | null;
  discount_price: number | null;
  keeping_days: number;
  workers_hours: number;
  unloading_quantity: number;
  loading_quantity: number;
  firm_id: number;
  firm_name?: string;
  payment_method: number;
  keeping_services: KeepingService[];
  working_services: WorkingService[];
  modes?: ApplicationMode[];
  photo_report: PhotoReport[];
  transport: Transport[];
  products: Product[];
}

interface SearchParams extends Record<string, string> {
  firm_name: string;
  decloration_number: string;
  firm_INN: string;
  decloration_date_gte: string;
  decloration_date_lte: string;
}

// Add interfaces for API responses
interface PaginatedResponse<T> {
  links: {
    first: string | null;
    last: string | null;
    next: string | null;
    previous: string | null;
  };
  total_pages: number;
  current_page: number;
  page_range: number[];
  page_size: number;
  results: T[];
}

interface FirmResponse {
  id: number;
  firm_name: string;
}

export default function ApplicationList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [applicationToDelete] = useState<Application | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [firms, setFirms] = useState<Record<number, string>>({});
  const [modes, setModes] = useState<Record<number, ApplicationMode[]>>({});
  const [searchParams, setSearchParams] = useState<SearchParams>({
    firm_name: '',
    decloration_number: '',
    firm_INN: '',
    decloration_date_gte: '',
    decloration_date_lte: '',
  });

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Add these new state variables near the top with other state declarations
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Application>({
    id: 0,
    decloration_file: '',
    brutto: null,
    netto: null,
    coming_date: '',
    decloration_date: '',
    decloration_number: '',
    vip_application: null,
    total_price: null,
    discount_price: null,
    keeping_days: 0,
    workers_hours: 0,
    unloading_quantity: 0,
    loading_quantity: 0,
    firm_id: 0,
    payment_method: 0,
    keeping_services: [],
    working_services: [],
    photo_report: [],
    transport: [],
    products: [],
  });

  const searchFields: SearchField[] = [
    {
      name: 'firm_name',
      label: 'Firm Name',
      placeholder: 'Search by firm name',
      className: 'col-span-4',
    },
    {
      name: 'decloration_number',
      label: 'Declaration Number',
      placeholder: 'Search by declaration number',
      className: 'col-span-4',
    },
    {
      name: 'firm_INN',
      label: 'Firm INN',
      placeholder: 'Search by INN',
      className: 'col-span-4',
    },
    {
      name: 'decloration_date_gte',
      label: 'Declaration Date From',
      placeholder: 'From date',
      type: 'date',
      className: 'col-span-6',
    },
    {
      name: 'decloration_date_lte',
      label: 'Declaration Date To',
      placeholder: 'To date',
      type: 'date',
      className: 'col-span-6',
    },
  ];

  const fetchApplications = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      params.append('page', currentPage.toString());

      const [applicationsResponse, firmsResponse, modesResponse] = await Promise.all([
        api.get<PaginatedResponse<Application>>(`/application/?${params.toString()}`),
        api.get<PaginatedResponse<FirmResponse>>('/firms/'),
        api.get<PaginatedResponse<ApplicationMode>>('/modes/application_modes/')
      ]);

      // Add type checking and error handling for firms data
      const firmsData = Array.isArray(firmsResponse.data?.results) ? firmsResponse.data.results : [];
      const firmMap = firmsData.reduce((acc: Record<number, string>, firm: FirmResponse) => {
        if (firm && typeof firm.id === 'number' && typeof firm.firm_name === 'string') {
          acc[firm.id] = firm.firm_name;
        }
        return acc;
      }, {});

      // Add type checking and error handling for modes data
      const modesData = Array.isArray(modesResponse.data?.results) ? modesResponse.data.results : [];
      const modesMap = modesData.reduce((acc: Record<number, ApplicationMode[]>, mode: ApplicationMode) => {
        if (mode && mode.application_id) {
          if (!acc[mode.application_id]) {
            acc[mode.application_id] = [];
          }
          if (!acc[mode.application_id].some(m => m.mode_id === mode.mode_id)) {
            acc[mode.application_id].push(mode);
          }
        }
        return acc;
      }, {});

      setFirms(firmMap);
      setModes(modesMap);
      setApplications(Array.isArray(applicationsResponse.data?.results) ? applicationsResponse.data.results : []);
      setLoading(false);

      // Update pagination state
      setTotalPages(applicationsResponse.data.total_pages);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(t("applicationList.errorLoading", "Error loading applications"));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [searchParams, currentPage]);

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


  const confirmDelete = async () => {
    if (!applicationToDelete) return;

    try {
      await api.delete(`/application/${applicationToDelete.id}/`);
      setModalMessage(t("applicationList.deleteSuccess", "Application deleted successfully"));
      setShowSuccessModal(true);
      fetchApplications();
    } catch (error) {
      console.error("Error deleting application:", error);
    }
    setShowDeleteModal(false);
  };

  // Add pagination controls component
  const PaginationControls = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex justify-center items-center space-x-2 mt-4">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 disabled:opacity-50"
        >
          Previous
        </button>
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => setCurrentPage(number)}
            className={`px-3 py-1 rounded-md ${
              currentPage === number
                ? 'bg-[#6C5DD3] text-white'
                : 'bg-gray-100 dark:bg-gray-700'
            }`}
          >
            {number}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    );
  };

  // Add this new function after other function declarations
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await api.put(`/application/${formData.id}/`, formData);
        setModalMessage(t("applicationList.updateSuccess", "Application updated successfully"));
      }
      setIsFormModalOpen(false);
      setShowSuccessModal(true);
      fetchApplications();
    } catch (error) {
      console.error('Error saving application:', error);
    }
  };

  const openEditModal = (application: Application) => {
    setFormData(application);
    setIsEditing(true);
    setIsFormModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          {t("applicationList.title", "Applications")}
        </h1>
        <button
          onClick={() => navigate("/create-application")}
          className="bg-[#6C5DD3] text-white px-4 py-2 text-sm rounded-lg 
          hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2
          dark:focus:ring-offset-gray-800 transition-all duration-200"
        >
          {t("applicationList.createApplication", "Create Application")}
        </button>
      </div>

      <div className="mb-6">
        <SearchBar
          fields={searchFields}
          initialValues={searchParams}
          onSearch={setSearchParams}
          className="grid-cols-12 gap-4"
          t={t}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("applicationList.table.number", "#")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("applicationList.table.declarationNumber", "Declaration Number")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("applicationList.table.firmName", "Firm Name")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("applicationList.table.brutto", "Brutto")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("applicationList.table.dates", "Dates")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("applicationList.table.quantities", "Quantities")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("applicationList.table.modes", "Modes")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("applicationList.table.actions", "Actions")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {applications.map((application, index) => {
              console.log(`Modes for application ${application.id}:`, modes[application.id]);
              return (
                <tr key={application.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {application.decloration_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {firms[application.firm_id] || t("applicationList.unknownFirm", "Unknown Firm")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {application.brutto || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    <div>Coming: {application.coming_date}</div>
                    <div className="text-gray-500 dark:text-gray-400">
                      Declaration: {application.decloration_date}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    <div>Unloading: {application.unloading_quantity}</div>
                    <div className="text-gray-500 dark:text-gray-400">
                      Loading: {application.loading_quantity}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {modes[application.id]?.map((mode) => (
                      <span
                        key={mode.id}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 mb-1"
                      >
                        Mode {mode.mode_id}
                      </span>
                    )) || (
                      <span className="text-gray-400">-</span>
                    )}
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
                        <Menu.Items className="absolute right-0 z-50 mt-2 w-36 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => openEditModal(application)}
                                  className={`${
                                    active ? "bg-gray-100 dark:bg-gray-700" : ""
                                  } flex w-full items-center px-4 py-2 text-sm text-blue-600 dark:text-blue-400`}
                                >
                                  {t("applicationList.edit", "Edit")}
                                </button>
                              )}
                            </Menu.Item>
                          </div>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <PaginationControls />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title={t("applicationList.deleteTitle", "Delete Application")}
        message={t(
          "applicationList.deleteConfirmation",
          `Are you sure you want to delete application "${applicationToDelete?.decloration_number}"? This action cannot be undone.`
        )}
        confirmText={t("applicationList.delete", "Delete")}
        cancelText={t("common.cancel", "Cancel")}
      />

      {/* Updated Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsFormModalOpen(false)} />
            <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl p-6">
              <h2 className="text-xl font-semibold mb-4">{isEditing ? 'Edit Application' : 'Create Application'}</h2>
              <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[80vh]">
                <div className="grid grid-cols-2 gap-4">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Basic Information</h3>
                    
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Firm</label>
                      <select
                        value={formData.firm_id}
                        onChange={(e) => setFormData({ ...formData, firm_id: Number(e.target.value) })}
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-[#6C5DD3] focus:ring-[#6C5DD3] sm:text-sm"
                        required
                      >
                        <option value="">Select Firm</option>
                        {Object.entries(firms).map(([id, name]) => (
                          <option key={id} value={id}>{name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Declaration Number</label>
                      <input
                        type="text"
                        value={formData.decloration_number}
                        onChange={(e) => setFormData({ ...formData, decloration_number: e.target.value })}
                        className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-[#6C5DD3] focus:ring-[#6C5DD3] sm:text-sm"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Brutto</label>
                        <input
                          type="number"
                          value={formData.brutto || ''}
                          onChange={(e) => setFormData({ ...formData, brutto: Number(e.target.value) })}
                          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-[#6C5DD3] focus:ring-[#6C5DD3] sm:text-sm"
                        />
                      </div>

                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Netto</label>
                        <input
                          type="number"
                          value={formData.netto || ''}
                          onChange={(e) => setFormData({ ...formData, netto: Number(e.target.value) })}
                          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-[#6C5DD3] focus:ring-[#6C5DD3] sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Coming Date</label>
                        <input
                          type="date"
                          value={formData.coming_date}
                          onChange={(e) => setFormData({ ...formData, coming_date: e.target.value })}
                          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-[#6C5DD3] focus:ring-[#6C5DD3] sm:text-sm"
                          required
                        />
                      </div>

                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Declaration Date</label>
                        <input
                          type="date"
                          value={formData.decloration_date || ''}
                          onChange={(e) => setFormData({ ...formData, decloration_date: e.target.value })}
                          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-[#6C5DD3] focus:ring-[#6C5DD3] sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">VIP Application</label>
                      <input
                        type="checkbox"
                        checked={formData.vip_application || false}
                        onChange={(e) => setFormData({ ...formData, vip_application: e.target.checked })}
                        className="rounded border-gray-300 text-[#6C5DD3] focus:ring-[#6C5DD3]"
                      />
                    </div>
                  </div>

                  {/* Services and Pricing */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Services and Pricing</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Price</label>
                        <input
                          type="number"
                          value={formData.total_price || ''}
                          onChange={(e) => setFormData({ ...formData, total_price: Number(e.target.value) })}
                          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-[#6C5DD3] focus:ring-[#6C5DD3] sm:text-sm"
                        />
                      </div>

                      <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price</label>
                        <input
                          type="number"
                          value={formData.discount_price || ''}
                          onChange={(e) => setFormData({ ...formData, discount_price: Number(e.target.value) })}
                          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-[#6C5DD3] focus:ring-[#6C5DD3] sm:text-sm"
                        />
                      </div>
                    </div>

                    {/* Add sections for keeping_services, working_services, transport, and products */}
                    {/* These would likely be implemented as dynamic form arrays */}
                    
                    {/* Example for Transport section */}
                    <div className="space-y-2">
                      <h4 className="font-medium">Transport</h4>
                      {formData.transport.map((t, index) => (
                        <div key={t.id || index} className="flex gap-2">
                          <input
                            type="text"
                            value={t.transport_number}
                            onChange={(e) => {
                              const newTransport = [...formData.transport];
                              newTransport[index].transport_number = e.target.value;
                              setFormData({ ...formData, transport: newTransport });
                            }}
                            placeholder="Transport Number"
                            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-[#6C5DD3] focus:ring-[#6C5DD3] sm:text-sm"
                          />
                          <select
                            value={t.transport_type}
                            onChange={(e) => {
                              const newTransport = [...formData.transport];
                              newTransport[index].transport_type = Number(e.target.value);
                              setFormData({ ...formData, transport: newTransport });
                            }}
                            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-[#6C5DD3] focus:ring-[#6C5DD3] sm:text-sm"
                          >
                            <option value="1">Type 1</option>
                            <option value="2">Type 2</option>
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              const newTransport = formData.transport.filter((_, i) => i !== index);
                              setFormData({ ...formData, transport: newTransport });
                            }}
                            className="p-2 text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            transport: [...formData.transport, { transport_number: '', transport_type: 1 }]
                          });
                        }}
                        className="text-sm text-[#6C5DD3] hover:text-[#5c4eb8]"
                      >
                        + Add Transport
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    {t("common.cancel", "Cancel")}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-[#6C5DD3] rounded-md hover:bg-[#5c4eb8]"
                  >
                    {isEditing ? t("common.update", "Update") : t("common.create", "Create")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={t("common.success")}
        message={modalMessage}
      />
    </div>
  );
}