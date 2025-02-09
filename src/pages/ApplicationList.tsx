import { useState, useEffect, Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { api } from "../api/api";
import ConfirmModal from "../components/ConfirmModal";
import SuccessModal from "../components/SuccessModal";
import { SearchBar, type SearchField } from '../components/SearchBar';

interface ApplicationMode {
  id: number;
  mode_id: number;
  application_id: number;
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
  keeping_services: number[];
  working_services: number[];
  modes?: ApplicationMode[];
}

interface PaginationLinks {
  first: string | null;
  last: string | null;
  next: string | null;
  previous: string | null;
}

interface PaginatedResponse {
  links: PaginationLinks;
  total_pages: number;
  current_page: number;
  page_range: number[];
  page_size: number;
  results: Application[];
  count: number;
}

// Define an interface for the search parameters
interface SearchParams {
  firm_name: string;
  decloration_number: string;
  firm_INN: string;
  decloration_date_gte: string;
  decloration_date_lte: string;
  [key: string]: string; // Add index signature
}

export default function ApplicationList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState<Application | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [firms, setFirms] = useState<Record<number, string>>({});
  const [modes, setModes] = useState<Record<number, ApplicationMode[]>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageRange, setPageRange] = useState<number[]>([]);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    firm_name: '',
    decloration_number: '',
    firm_INN: '',
    decloration_date_gte: '',
    decloration_date_lte: ''
  });

  const searchFields: SearchField[] = [
    {
      name: 'firm_name',
      label: t('applicationList.search.firmName', 'Firm Name'),
      placeholder: t('applicationList.search.firmNamePlaceholder', 'Enter firm name...'),
      type: 'text',
      className: 'col-span-2' // Make firm name field wider
    },
    {
      name: 'decloration_number',
      label: t('applicationList.search.declarationNumber', 'Declaration Number'),
      placeholder: t('applicationList.search.declarationNumberPlaceholder', 'Enter declaration number...'),
      type: 'text',
      className: 'col-span-2' // Make declaration number field wider
    },
    {
      name: 'firm_INN',
      label: t('applicationList.search.firmINN', 'Firm INN'),
      placeholder: t('applicationList.search.firmINNPlaceholder', 'Enter INN...'),
      type: 'text',
      className: 'col-span-2' // Make INN field wider
    }
  ];

  const dateFields: SearchField[] = [
    {
      name: 'decloration_date_gte',
      label: t('applicationList.search.dateFrom', 'Date From'),
      placeholder: t('applicationList.search.dateFromPlaceholder', 'Start date...'),
      type: 'date',
      className: 'col-span-1'
    },
    {
      name: 'decloration_date_lte',
      label: t('applicationList.search.dateTo', 'Date To'),
      placeholder: t('applicationList.search.dateToPlaceholder', 'End date...'),
      type: 'date',
      className: 'col-span-1'
    }
  ];

  const handleSearch = (values: SearchParams) => {
    setSearchParams(values);
  };

  const fetchApplications = async (page: number = 1) => {
    try {
      setLoading(true); // Start loading
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      
      // Add search params to query
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const [applicationsResponse, firmsResponse, modesResponse] = await Promise.all([
        api.get(`/application/?${queryParams.toString()}`),
        api.get('/firms/'),
        api.get('/modes/application_modes/')
      ]);

      const paginatedData: PaginatedResponse = applicationsResponse.data;

      // Reset all states with new data
      setApplications(paginatedData.results);
      console.log('paginated data??',paginatedData.results)
      setCurrentPage(paginatedData.current_page);
      setTotalPages(paginatedData.total_pages);
      setPageRange(paginatedData.page_range);

      // Only set firms and modes if there are results
      if (paginatedData.results.length > 0) {
        const firmMap = firmsResponse.data.results?.reduce((acc: Record<number, string>, firm: any) => {
          acc[firm.id] = firm.firm_name;
          return acc;
        }, {});
        
        const modesMap = modesResponse.data.results?.reduce((acc: Record<number, ApplicationMode[]>, mode: ApplicationMode) => {
          if (!acc[mode.application_id]) {
            acc[mode.application_id] = [];
          }
          acc[mode.application_id].push(mode);
          return acc;
        }, {});

        setFirms(firmMap);
        setModes(modesMap);
      } else {
        // Clear related data if no results
        setFirms({});
        setModes({});
      }

      setLoading(false);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(t("applicationList.errorLoading", "Error loading applications"));
      setApplications([]); // Clear applications on error
      setFirms({});
      setModes({});
      setLoading(false);
    }
  };

  // Use a single useEffect for all search params
  useEffect(() => {
    fetchApplications(1); // Reset to first page on search
  }, [searchParams]); // Only depend on searchParams

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

  const handleDelete = (application: Application) => {
    setApplicationToDelete(application);
    setShowDeleteModal(true);
  };

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

  const handlePageChange = (page: number) => {
    setLoading(true);
    fetchApplications(page);
  };

  const Pagination = () => {
    return (
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {t("common.previous", "Previous")}
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {t("common.next", "Next")}
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              {t("pagination.showing", "Showing")} <span className="font-medium">{(currentPage - 1) * 10 + 1}</span>{" "}
              {t("pagination.to", "to")}{" "}
              <span className="font-medium">{Math.min(currentPage * 10, applications.length)}</span>{" "}
              {t("pagination.of", "of")}{" "}
              <span className="font-medium">{applications.length}</span>{" "}
              {t("pagination.results", "results")}
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                <span className="sr-only">{t("pagination.first", "First")}</span>
                ««
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                <span className="sr-only">{t("pagination.previous", "Previous")}</span>
                «
              </button>
              {pageRange.map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                    page === currentPage
                      ? "z-10 bg-[#6C5DD3] text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6C5DD3]"
                      : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                <span className="sr-only">{t("pagination.next", "Next")}</span>
                »
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
              >
                <span className="sr-only">{t("pagination.last", "Last")}</span>
                »»
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
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

      <div className="space-y-4 mb-6">
        {/* Main search fields */}
        <SearchBar<SearchParams>
          fields={searchFields}
          initialValues={searchParams}
          onSearch={handleSearch}
          className="grid-cols-6 gap-4"
          t={t}
        />

        {/* Date range fields */}
        <SearchBar<SearchParams>
          fields={dateFields}
          initialValues={searchParams}
          onSearch={handleSearch}
          className="grid-cols-2 gap-4"
          t={t}
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5DD3]"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {applications.length > 0 ? (
            <>
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
                              key={`mode-${application.id}-${mode.id}`}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2 mb-1"
                            >
                              Mode {mode.mode_id}
                            </span>
                          )) || (
                            <span key={`no-modes-${application.id}`}>-</span>
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
                                        onClick={() => handleDelete(application)}
                                        className={`${
                                          active ? "bg-gray-100 dark:bg-gray-700" : ""
                                        } flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400`}
                                      >
                                        {t("applicationList.delete", "Delete")}
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
              <Pagination />
            </>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <svg 
                  className="w-8 h-8 text-gray-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
                {t("applicationList.noResults.title", "No applications found")}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t("applicationList.noResults.description", "Try adjusting your search criteria")}
              </p>
            </div>
          )}
        </div>
      )}

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
        onClose={() => setShowSuccessModal(false)}
        title={t("common.success")}
        message={modalMessage}
      />
    </div>
  );
}