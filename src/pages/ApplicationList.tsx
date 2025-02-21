import { useState, useEffect, Fragment, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { api } from "../api/api";
import ConfirmModal from "../components/ConfirmModal";
import SuccessModal from "../components/SuccessModal";
import { SearchBar, SearchField } from "../components/SearchBar";
import { Crown, User } from "lucide-react";







interface Application {
  id: number;
  firm_id: number;
  number_of_application: string;
  brutto: number;
  netto: number;
  coming_date: string;
  decloration_date: string | null;
  decloration_number: string | null;
  vip_application: boolean;
  total_price: string;
  total_cost_keeping_service: number;
  total_cost_working_service: number;
  total_cost: number;
  keeping_services: Array<{
    id: number;
    amount: number;
    service_type_id: number;
    application_id: number;
  }>;
  working_services: Array<{
    id: number;
    quantity: number;
    price: string;
    service_id: number;
    application_id: number;
  }>;
  transport: Array<{
    id: number;
    transport_number: string;
    transport_type: number;
    application_id: number;
  }>;
  modes: Array<{
    mode_id: number;
    date_created: string;
  }>;
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

// Update the interface to include name_mode and code_mode
interface Mode {
  id: number;
  name_mode: string;
  code_mode: string;
}

// Update the interface for the modes API response

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
  const [searchParams, setSearchParams] = useState({
    firm_name: '',
    decloration_number: '',
    firm_INN: '',
    decloration_date_gte: '',
    decloration_date_lte: ''
  });

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Add these new state variables near the top with other state declarations
  const [isFormModalOpen] = useState(false);
  const [] = useState(false);
  

  const [, setKeepingServices] = useState<Array<{ id: number; name: string; base_price: number; extra_price: number }>>([]);
  const [, setWorkingServices] = useState<Array<{ id: number; service_name: string; base_price: number; extra_price: number; units: string }>>([]);
  const [, setTransportTypes] = useState<Array<{ id: number; transport_type: string }>>([]);
  const [, setStorages] = useState<Array<{ id: number; name: string }>>([]);
  const [, setProducts] = useState<Array<{ id: number; name: string }>>([]);
  // const [, setAvailableModes] = useState<Array<{ id: number; name: string }>>([]);

  // Add state for available modes
  const [availableModes, setAvailableModes] = useState<Mode[]>([]);

  const searchFields: SearchField[] = [
    {
      name: 'firm_name',
      label: t('applicationList.table.firmName'),
      placeholder: t('applicationList.table.firmName'),
      className: 'col-span-12 sm:col-span-6 lg:col-span-4',
    },
    {
      name: 'decloration_number',
      label: t('applicationList.table.declarationNumber', 'Declaration Number'),
      placeholder: t('createApplication.declorationNumberPlaceholder', 'Enter declaration number'),
      className: 'col-span-12 sm:col-span-6 lg:col-span-4',
    },
    {
      name: 'firm_INN',
      label: t('createFirm.companyInfo.inn', 'INN'),
      placeholder: t('createFirm.companyInfo.innPlaceholder', 'Enter INN number'),
      className: 'col-span-12 sm:col-span-6 lg:col-span-4',
    },
    {
      name: 'decloration_date_gte',
      label: t('applicationList.table.dates', 'Declaration Date From'),
      placeholder: t('createApplication.declorationDatePlaceholder', 'Enter declaration date'),
      type: 'date',
      className: 'col-span-12 sm:col-span-6',
    },
    {
      name: 'decloration_date_lte',
      label: t('applicationList.table.dates', 'Declaration Date To'),
      placeholder: t('createApplication.declorationDatePlaceholder', 'Enter declaration date'),
      type: 'date',
      className: 'col-span-12 sm:col-span-6',
    },
  ];

  // Modified handleSearch callback
  const handleSearch = useCallback((values: typeof searchParams) => {
    console.log('Search initiated with values:', values);
    setCurrentPage(1);
    setSearchParams(values);
  }, []);

  const fetchApplications = async () => {
    try {
      const params = new URLSearchParams();
      
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          if (key.includes('date') && value) {
            const formattedDate = new Date(value).toISOString().split('T')[0];
            params.append(key, formattedDate);
          } else {
            params.append(key, value.trim());
          }
        }
      });

      // Fetch applications and firms data in parallel
      const [applicationsResponse, firmsResponse] = await Promise.all([
        api.get<PaginatedResponse<Application>>(`/application/?${params.toString()}`),
        api.get<PaginatedResponse<FirmResponse>>('/firms/') // Make sure to fetch all firms
      ]);

      // Process firms data into a lookup map
      const firmsData = firmsResponse.data.results || [];
      const firmsMap = firmsData.reduce((acc: Record<number, string>, firm) => {
        acc[firm.id] = firm.firm_name;
        return acc;
      }, {});

      // Update firms state
      setFirms(firmsMap);

      // Process applications data
      if ('results' in applicationsResponse.data) {
        setApplications(applicationsResponse.data.results);
        setTotalPages(applicationsResponse.data.total_pages);
      } else {
        setApplications(applicationsResponse.data as unknown as Application[]);
        setTotalPages(Math.ceil((applicationsResponse.data as unknown as Application[]).length / 10));
      }
      
      setLoading(false);
      setError(null);

    } catch (err) {
      console.error('Error in fetchApplications:', err);
      setError(t("applicationList.errorLoading", "Error loading applications"));
      setLoading(false);
    }
  };

  // Add dependency array to prevent infinite loops
  useEffect(() => {
    console.log('useEffect triggered with:', { searchParams, currentPage });
    fetchApplications();
  }, [searchParams, currentPage]); // Add other dependencies if needed

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const [
          keepingRes,
          workingRes,
          transportTypesRes,
          storagesRes,
          productsRes,
          modesRes
        ] = await Promise.all([
          api.get('/keeping_service/'),
          api.get('/working_service/'),
          api.get('/transport/type/'),
          api.get('/storage/'),
          api.get('/items/product/'),
          api.get('/modes/')
        ]);

        setKeepingServices(keepingRes.data.results);
        setWorkingServices(workingRes.data.results);
        setTransportTypes(transportTypesRes.data.results);
        setStorages(storagesRes.data.results);
        setProducts(productsRes.data.results);
        setAvailableModes(modesRes.data.results);
        console.log(keepingRes.data.results);
      } catch (error) {
        console.error('Error fetching form data:', error);
      }
    };

    if (isFormModalOpen) {
      fetchFormData();
    }
  }, [isFormModalOpen]);

  // Render loading state
  if (loading) {
    console.log('Rendering loading state');
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5DD3]"></div>
      </div>
    );
  }

  // Render error state
  if (error) {
    console.log('Rendering error state:', error);
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  console.log('About to render applications:', applications);

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
          {t("applicationList.previous")}
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
          {t("applicationList.next")}
        </button>
      </div>
    );
  };

  const handleEditClick = (application: Application) => {
    navigate(`/edit-application/${application.id}`);
  };

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          {t("applicationList.title", "Applications")}
        </h1>
        <button
          onClick={() => navigate("/create-application")}
          className="w-full sm:w-auto bg-[#6C5DD3] text-white px-4 py-2 text-sm rounded-lg 
          hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2
          dark:focus:ring-offset-gray-800 transition-all duration-200"
        >
          {t("applicationList.createApplication", "Create Application")}
        </button>
      </div>

      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <SearchBar
          fields={searchFields}
          initialValues={searchParams}
          onSearch={handleSearch}
          className="grid grid-cols-12 gap-3"
          t={t}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5DD3]"></div>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center p-4">{error}</div>
      ) : !applications?.length ? (
        <div className="text-center py-4 text-gray-500">
          {t("applicationList.noApplications", "No applications found")}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("applicationList.table.number", "#")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("applicationList.numberOfApplication",)}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("applicationList.table.firmName", "Firm Name")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("applicationList.table.vipStatus", "VIP Status")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("applicationList.totalCost")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("applicationList.table.dates", "Dates")}
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
                console.log('Rendering application:', application);
                return (
                  <tr key={application.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {application.number_of_application}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {firms[application.firm_id] || t("applicationList.unknownFirm", "Unknown Firm")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {application.vip_application ? (
                        <div className="flex items-center text-yellow-600 dark:text-yellow-500">
                          <Crown className="w-5 h-5 mr-1" />
                          <span>{t("applicationList.vip", "VIP")}</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                          <User className="w-5 h-5 mr-1" />
                          <span>{t("applicationList.regular", "Regular")}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {application.total_price } сум
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      <div>{t("applicationList.comingDate", "Coming")}: {application.coming_date}</div>
                      <div className="text-gray-500 dark:text-gray-400">
                        {t("applicationList.declarationDate", "Declaration")}: {application.decloration_date}
                      </div>
                    </td>
                   
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                      {application.modes?.map((mode) => {
                        const modeInfo = Array.isArray(availableModes) 
                          ? availableModes.find(m => m.id === mode.mode_id)
                          : undefined;
                        return (
                          <span
                            key={mode.mode_id}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 mb-1"
                          >
                            {modeInfo ? `  (${modeInfo.code_mode})` : `Mode ${mode.mode_id}`}
                          </span>
                        );
                      })}
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
                                    onClick={() => handleEditClick(application)}
                                    className={`${
                                      active ? "bg-gray-100 dark:bg-gray-700" : ""
                                    } flex w-full items-center px-4 py-2 text-sm text-blue-600 dark:text-blue-400`}
                                  >
                                    {t("applicationList.edit")}
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
      )}

      {!loading && !error && applications?.length > 0 && <PaginationControls />}

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

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setModalMessage('');
        }}
        title={modalMessage.includes('error') || modalMessage.includes('Error') ? 'Error' : 'Success'}
        message={modalMessage}
      />
    </div>
  );
}