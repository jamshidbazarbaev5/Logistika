import { useState, useEffect, Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { api } from "../api/api";
import ConfirmModal from "../components/ConfirmModal";
import SuccessModal from "../components/SuccessModal";
import { SearchBar, SearchField } from "../components/SearchBar";
import { Crown, User, Download, Edit, Calculator, FileDown, Trash2 } from "lucide-react";

interface ApplicationMode {
  id: number;
  mode_id: number;
  application_id: number;
  mode_name: string;
  name_mode: string;
}

interface KeepingService {
  id?: number;
  day: number;
  keeping_services_id: number;
  service_type_id?: number;
  amount?: number;
  application_id?: number;
}

interface WorkingService {
  id?: number;
  quantity: number;
  service_id: number;
  service_type_id?: number;
  amount?: number;
  application_id?: number;
  service_name?: string;
}

interface PhotoReport {
  id?: number;
  photo: string | File;
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
  total_cost: number;
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
  number_of_application:string
  products: Product[];
  status: 'active' | 'unpaid' | 'completed' | string;
}

interface SearchParams extends Record<string, string> {
  firm_name: string;
  decloration_number: string;
  number_of_application: string;
  firm_INN: string;
  coming_date_gte: string;
  coming_date_lte: string;
  products: string;
  status: string;
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

interface Mode {
  id: number;
  name_mode: string;
  code_mode: string;
}

interface ModesResponse {
  results: Mode[];
}

interface ProductResponse {
  id: number;
  name: string;
}

interface ProductApiResponse {
  results: ProductResponse[];
}

type ApplicationStatus = 'active' | 'unpaid' | 'completed';

const getStatusClasses = (status: ApplicationStatus) => {
  switch (status) {
    case 'active':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'unpaid':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};



const formatNumber = (num: number | string) => {
  if (typeof num === 'string') {
    num = parseFloat(num.replace(/[^\d.-]/g, ''));
  }
  if (isNaN(num)) return '0';
  
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ", ");
};

// Add new interfaces for payments and transactions
interface Payment {
  id: number;
  application: number;
  payment_method: number;
  amount: string;
  comment: string;
  created_at: string;
}

interface Transaction {
  id: number;
  application_id: number;
  // ... other fields not needed for this check
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
  const [, setModes] = useState<Record<number, ApplicationMode[]>>({});
  const [searchParams, setSearchParams] = useState<SearchParams>({
    firm_name: '',
    decloration_number: '',
    number_of_application: '',
    firm_INN: '',
    coming_date_gte: '',
    coming_date_lte: '',
    products: '',
    status: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isFormModalOpen] = useState(false);
  const [expandedApplications, setExpandedApplications] = useState<number[]>([]);
  const [calculationResults, setCalculationResults] = useState<Record<number, any>>({});
  const [calculationLoading, setCalculationLoading] = useState<Record<number, boolean>>({});

  const [, setKeepingServices] = useState<Array<{ id: number; name: string; base_price: number; extra_price: number }>>([]);
  const [, setWorkingServices] = useState<Array<{ id: number; service_name: string; base_price: number; extra_price: number; units: string }>>([]);
  // const [, setTransportTypes] = useState<Array<{ id: number; transport_type: string }>>([]);
  const [, setStorages] = useState<Array<{ id: number; name: string }>>([]);
  const [productsList, setProductsList] = useState<ProductResponse[]>([]);

  const [availableModes, setAvailableModes] = useState<Mode[]>([]);

  const [transportTypes, setTransportTypes] = useState<Record<number, string>>({});

  // Add new state variables
  const [payments, setPayments] = useState<Record<number, Payment[]>>({});
  const [transactions, setTransactions] = useState<Record<number, Transaction[]>>({});

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get<ProductApiResponse>('/items/product/');
        if (response.data && Array.isArray(response.data.results)) {
          setProductsList(response.data.results);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  const searchFields: SearchField[] = [
    {
      name: 'firm_name',
      label: t('applicationList.table.firmName'),
      placeholder: t('applicationList.table.firmName'),
      className: 'col-span-12 sm:col-span-6 lg:col-span-3',
    },
    {
      name: 'number_of_application',
      label: t('applicationList.table.applicationNumber'),
      placeholder: t('applicationList.table.applicationNumber'),
      className: 'col-span-12 sm:col-span-6 lg:col-span-3',
    },
    {
      name: 'decloration_number',
      label: t('applicationList.table.declarationNumber', ),
      placeholder: t('applicationList.table.declarationNumber',),
      className: 'col-span-12 sm:col-span-6 lg:col-span-3',
    },
    {
      name: 'firm_INN',
      label: t('createFirm.companyInfo.inn', ),
      placeholder: t('applicationList.table.inn', ),
      className: 'col-span-12 sm:col-span-6 lg:col-span-3',
    },
    {
      name: 'products',
      label: t('applicationList.table.product', ),
      placeholder: t('applicationList.table.selectProduct', ),
      type: 'select',
      options: [
        { value: '', label: t('applicationList.table.allProducts', 'All Products') },
        ...productsList.map(product => ({
          value: product.id.toString(),
          label: product.name
        }))
      ],
      className: 'col-span-12 sm:col-span-12 lg:col-span-4',
    },
    {
      name: 'coming_date_gte',
      label: t('applicationList.table.comingDateFrom',),
      placeholder: t('applicationList.table.comingDateFrom', ),
      type: 'date',
      className: 'col-span-12 sm:col-span-6 lg:col-span-4',
    },
    {
      name: 'coming_date_lte',
      label: t('applicationList.table.comingDateTo', 'Coming Date To'),
      placeholder: t('applicationList.comingDatePlaceholder', 'To'),
      type: 'date',
      className: 'col-span-12 sm:col-span-6 lg:col-span-4',
    },
    {
      name: 'status',
      label: t('applicationList.STATUS'),
      placeholder: t('applicationList.STATUS'),
      type: 'select',
      options: [
        { value: 'active', label: t('applicationList.status.active', 'Active') },
        { value: 'completed', label: t('applicationList.status.completed', 'Completed') },
        { value: 'unpaid', label: t('applicationList.status.unpaid', 'Unpaid') }
      ],
      className: 'col-span-12 sm:col-span-12 lg:col-span-4',
    },
  ];

  const fetchApplications = async () => {
    try {
      const params = new URLSearchParams();
      
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });
      
      params.append('page', currentPage.toString());

      const [applicationsResponse, firmsResponse, modesResponse, availableModesResponse, transportTypesResponse, paymentsResponse] = await Promise.all([
        api.get<PaginatedResponse<Application>>(`/application/?${params.toString()}`),
        api.get<PaginatedResponse<FirmResponse>>('/firms/'),
        api.get<PaginatedResponse<ApplicationMode>>('/modes/application_modes/'),
        api.get<ModesResponse>('/modes/modes/'),
        api.get('/transport/type/'),
        api.get('/application/pay/')
      ]);

      const firmsData = Array.isArray(firmsResponse.data?.results) ? firmsResponse.data.results : [];
      const firmMap = firmsData.reduce((acc: Record<number, string>, firm: FirmResponse) => {
        if (firm && typeof firm.id === 'number' && typeof firm.firm_name === 'string') {
          acc[firm.id] = firm.firm_name;
        }
        return acc;
      }, {});

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

      const transportTypesMap = transportTypesResponse.data.results.reduce((acc: Record<number, string>, type: { id: number; transport_type: string }) => {
        acc[type.id] = type.transport_type;
        return acc;
      }, {});
      setTransportTypes(transportTypesMap);

      // Group payments by application ID
      const paymentsMap = paymentsResponse.data.results.reduce((acc: Record<number, Payment[]>, payment: Payment) => {
        if (!acc[payment.application]) {
          acc[payment.application] = [];
        }
        acc[payment.application].push(payment);
        return acc;
      }, {});

      setPayments(paymentsMap);

      // Fetch transactions for each application
      const applicationIds = applicationsResponse.data.results.map(app => app.id);
      const transactionPromises = applicationIds.map(id => 
        api.get(`/transactions/history/${id}`).catch(() => ({ data: [] }))
      );
      const transactionResponses = await Promise.all(transactionPromises);

      const transactionsMap = transactionResponses.reduce((acc: Record<number, Transaction[]>, response, index) => {
        const appId = applicationIds[index];
        acc[appId] = response.data;
        return acc;
      }, {});

      setTransactions(transactionsMap);

      setFirms(firmMap);
      setModes(modesMap);
      setAvailableModes(Array.isArray(availableModesResponse.data.results) 
        ? availableModesResponse.data.results 
        : []);
      setApplications(Array.isArray(applicationsResponse.data?.results) 
        ? applicationsResponse.data.results 
        : []);
      setLoading(false);

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
        setProductsList(productsRes.data.results);
        setAvailableModes(modesRes.data.results);
      } catch (error) {
        console.error('Error fetching form data:', error);
      }
    };

    if (isFormModalOpen) {
      fetchFormData();
    }
  }, [isFormModalOpen]);

  const toggleApplicationExpand = async (applicationId: number) => {
    if (expandedApplications.includes(applicationId)) {
      setExpandedApplications(prev => prev.filter(id => id !== applicationId));
      return;
    }
    
    setExpandedApplications(prev => [...prev, applicationId]);
    
    // Only fetch calculation if we don't already have it
    if (!calculationResults[applicationId]) {
      setCalculationLoading(prev => ({ ...prev, [applicationId]: true }));
      
      try {
        const application = applications.find(app => app.id === applicationId);
        
        if (application) {
          // Format the keeping services correctly based on the application data structure
          const keepingServices = application.keeping_services.map(service => ({
            // Use the correct field name from your application data
            service_type_id: service.service_type_id || service.keeping_services_id,
            amount: service.amount || service.day
          }));
          
          // Format the working services correctly
          const workingServices = application.working_services.map(service => ({
            service_type_id: service.service_type_id || service.service_id,
            amount: service.amount || service.quantity
          }));
          
          console.log('Sending calculation request for application', applicationId, {
            keeping_services: keepingServices,
            working_services: workingServices
          });
          
          // Make the API call to the correct endpoint
          const response = await api.post(`/keeping_service/service_calculate/${applicationId}/`, {
            keeping_services: keepingServices,
            working_services: workingServices
          });
          
          console.log('Calculation response:', response.data);
          
          if (response.data) {
            setCalculationResults(prev => ({ 
              ...prev, 
              [applicationId]: response.data 
            }));
          }
        }
      } catch (error) {
        console.error('Error calculating services:', error);
        // Set empty result to avoid repeated failed requests
        setCalculationResults(prev => ({ 
          ...prev, 
          [applicationId]: { 
            keeping_services: [], 
            working_services: [], 
            total_price: 0 
          } 
        }));
      } finally {
        setCalculationLoading(prev => ({ ...prev, [applicationId]: false }));
      }
    }
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

  const handleDeleteClick = (application: Application) => {
    setApplicationToDelete(application);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!applicationToDelete) return;

    try {
      await api.delete(`/application/${applicationToDelete.id}/`);
      setModalMessage(t("applicationList.deleteSuccess", "Ariza muvaffaqiyatli o'chirildi"));
      setShowSuccessModal(true);
      fetchApplications();
    } catch (error) {
      console.error("Error deleting application:", error);
      setModalMessage(t("applicationList.deleteError", "Arizani o'chirishda xatolik yuz berdi"));
      setShowSuccessModal(true);
    }
    setShowDeleteModal(false);
    setApplicationToDelete(null);
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

  const handleDownloadExcel = async () => {
    try {
      const params = new URLSearchParams();
      
      const searchParamsForExport = {
        firm_name: searchParams.firm_name,
        decloration_number: searchParams.decloration_number,
        number_of_application: searchParams.number_of_application,
        firm_INN: searchParams.firm_INN,
        coming_date_gte: searchParams.coming_date_gte,
        coming_date_lte: searchParams.coming_date_lte,
        products: searchParams.products
      };

      Object.entries(searchParamsForExport).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });

      const response = await api.get('/export_excel/', {
        params: searchParamsForExport,
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'applications.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Excel file:', error);
      setModalMessage(t("applicationList.downloadError", "Error downloading Excel file"));
      setShowSuccessModal(true);
    }
  };

  const handleDownloadPreAct = async (applicationId: number) => {
    try {
      const response = await api.get(`/application/export_excel_akt/${applicationId}/`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pre-act-${applicationId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading pre-act Excel file:', error);
      setModalMessage(t("dalolatnoma.downloadError", "Faylni yuklashda xatolik yuz berdi"));
      setShowSuccessModal(true);
    }
  };

  const filteredApplications = applications
    .filter(app => {
      if (searchParams.status) {
        return app.status === searchParams.status;
      }
      return true; // Show all if no status filter
    })
    .sort((a, b) => {
      // Sort by coming_date in descending order (newest first)
      return new Date(b.coming_date).getTime() - new Date(a.coming_date).getTime();
    });

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          {t("applicationList.title", "Applications")}
        </h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleDownloadExcel}
            className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 text-sm rounded-lg 
            hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2
            dark:focus:ring-offset-gray-800 transition-all duration-200 flex items-center justify-center"
          >
            <Download className="w-4 h-4 mr-2" />
            {t("applicationList.downloadExcel")}
          </button>
          <button
            onClick={() => navigate("/create-application")}
            className="w-full sm:w-auto bg-[#6C5DD3] text-white px-4 py-2 text-sm rounded-lg 
            hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2
            dark:focus:ring-offset-gray-800 transition-all duration-200"
          >
            {t("applicationList.createApplication", "Create Application")}
          </button>
        </div>
      </div>

      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {t('applicationList.search.title')}
          </h2>
        </div>
        <div className="p-4">
          <SearchBar
            fields={searchFields}
            initialValues={searchParams}
            onSearch={(values) => {
              console.log('Search values:', values); 
              setSearchParams(values);
            }}
            className="grid grid-cols-12 gap-4"
            t={t}
          />
        </div>
      </div>

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
                {t("applicationList.table.status", "Status")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("applicationList.table.transport", "Transport")}
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
            {filteredApplications.map((application, index) => (
              <Fragment key={application.id}>
                <tr 
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  onClick={() => toggleApplicationExpand(application.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    <div className="flex items-center">
                      {application.number_of_application}
                      {expandedApplications.includes(application.id) ? (
                        <ChevronUpIcon className="h-4 w-4 ml-1 text-[#6C5DD3]" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4 ml-1 text-[#6C5DD3]" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    <span className="block truncate max-w-[200px]" title={firms[application.firm_id] || t("applicationList.unknownFirm", "Unknown Firm")}>
                      {firms[application.firm_id] || t("applicationList.unknownFirm", "Unknown Firm")}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {application.vip_application ? (
                      <div className="flex items-center text-yellow-600 dark:text-yellow-500">
                        <Crown className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-500 dark:text-gray-400">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {formatNumber(application.total_price || 0)} сум
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    <div>{t("applicationList.comingDate", "Coming")}: {application.coming_date}</div>
                    <div className="text-gray-500 dark:text-gray-400">
                      {t("applicationList.declarationDate", "Declaration")}: {application.decloration_date}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getStatusClasses(application.status as ApplicationStatus)
                    }`}>
                      {t(`applicationList.status.${application.status}`, application.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {application.transport?.map((transport, idx) => (
                      <div key={transport.id || idx} className="flex items-center space-x-1 mb-1 last:mb-0">
                        <div className="flex items-center max-w-[200px]">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-2">
                            <span className="truncate" title={transportTypes[transport.transport_type] || t("applicationList.unknownTransport", "Unknown")}>
                              {(transportTypes[transport.transport_type] || t("applicationList.unknownTransport", "Unknown")).slice(0, 15)}
                              {(transportTypes[transport.transport_type] || "").length > 15 ? "..." : ""}
                            </span>
                          </span>
                          <span className="text-gray-600 truncate" title={transport.transport_number}>
                            {transport.transport_number.slice(0, 10)}
                            {transport.transport_number.length > 10 ? "..." : ""}
                          </span>
                        </div>
                      </div>
                    ))}
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
                          {modeInfo ? `  ${modeInfo.code_mode}` : `Mode ${mode.mode_id}`}
                        </span>
                      );
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100" onClick={(e) => e.stopPropagation()}>
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
                        <Menu.Items className={`absolute right-0 z-50 w-36 rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${
                          index < 3 ? 'top-0' : 'bottom-0'
                        }`}>
                          <div className="py-1">
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => handleEditClick(application)}
                                  className={`${
                                    active ? "bg-gray-100 dark:bg-gray-700" : ""
                                  } flex w-full items-center px-4 py-2 text-sm text-blue-600 dark:text-blue-400`}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  {t("applicationList.edit")}
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => navigate(`/calculate-services/${application.id}`)}
                                  className={`${
                                    active ? "bg-gray-100 dark:bg-gray-700" : ""
                                  } flex w-full items-center px-4 py-2 text-sm text-green-600 dark:text-green-400`}
                                >
                                  <Calculator className="w-4 h-4 mr-2" />
                                  {t("applicationList.calculate")}
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => handleDownloadPreAct(application.id)}
                                  className={`${
                                    active ? "bg-gray-100 dark:bg-gray-700" : ""
                                  } flex w-full items-center px-4 py-2 text-sm text-green-600 dark:text-green-400`}
                                >
                                  <FileDown className="w-4 h-4 mr-2" />
                                  {t("dalolatnoma.download", "Dalolatnoma")}
                                </button>
                              )}
                            </Menu.Item>
                            <Menu.Item>
                              {({ active }) => (
                                <button
                                  onClick={() => handleDeleteClick(application)}
                                  className={`${
                                    active ? "bg-gray-100 dark:bg-gray-700" : ""
                                  } flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400`}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
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
                
                {expandedApplications.includes(application.id) && (
                  <tr>
                    <td colSpan={10} className="px-0 py-0 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <div className="p-6">
                        {calculationLoading[application.id] ? (
                          <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5DD3]"></div>
                          </div>
                        ) : calculationResults[application.id] ? (
                          <div className="space-y-6">
                            <div className="flex items-center justify-between">
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                {t("applicationList.serviceCalculation", )}
                              </h3>
                              
                              <div className="bg-white dark:bg-gray-700 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-700 dark:text-gray-300">{t('calculateServices.totalPrice')}:</span>
                                  <span className="text-lg font-medium text-[#6C5DD3] dark:text-[#8B7BE8]">
                                    {calculationResults[application.id].total_price.toLocaleString()} сум
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {(calculationResults[application.id].keeping_services?.length > 0 || 
                              calculationResults[application.id].working_services?.length > 0) ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {calculationResults[application.id].keeping_services
                                  ?.filter((service: any) => service.total_amount > 0 || service.price > 0)
                                  .map((service: any, idx: number) => (
                                    <div 
                                      key={`keeping-${idx}`} 
                                      className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow duration-200"
                                    >
                                      <h3 className="font-medium text-[#6C5DD3] dark:text-[#8B7BE8] mb-2 truncate" title={service.service_name}>
                                        {service.service_name}
                                      </h3>
                                      <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                          <span>{t('calculateServices.totalQuantity')}:</span>
                                          <span className="font-medium">{service.requested_amount}</span>
                                        </div>
                                        {/*<div className="flex justify-between">*/}
                                        {/*  <span>{t('calculateServices.totalAmount')}:</span>*/}
                                        {/*  <span className="font-medium">{service.total_amount}</span>*/}
                                        {/*</div>*/}
                                        <div className="flex justify-between">
                                          <span>{t('calculateServices.price')}:</span>
                                          <span className="font-medium">{service.price.toLocaleString()} сум</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                  
                                {calculationResults[application.id].working_services
                                  ?.filter((service: any) => service.total_amount > 0 || service.price > 0)
                                  .map((service: any, idx: number) => {
                                    const originalService = application.working_services.find(
                                      (ws: any) => ws.service_id === service.service_type_id
                                    );
                                    
                                    return (
                                      <div 
                                        key={`working-${idx}`} 
                                        className="bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow duration-200"
                                      >
                                        <h3 className="font-medium text-[#6C5DD3] dark:text-[#8B7BE8] mb-2 truncate" 
                                          title={originalService?.service_name || service.service_name || `Service ${service.service_type_id}`}>
                                          {originalService?.service_name || service.service_name || `Service ${service.service_type_id}`}
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                          <div className="flex justify-between">
                                            <span>{t('calculateServices.requestedAmount')}:</span>
                                            <span className="font-medium">{service.requested_amount}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>{t('calculateServices.totalQuantity')}:</span>
                                            <span className="font-medium">{service.total_amount}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span>{t('calculateServices.price')}:</span>
                                            <span className="font-medium">{service.price.toLocaleString()} сум</span>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            ) : (
                              <div className="text-center py-8 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                <div className="flex flex-col items-center justify-center">
                                  <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <p className="text-gray-500 dark:text-gray-400">
                                    {t('calculateServices.noServicesFound', 'Услуги не найдены')}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                            <div className="flex flex-col items-center justify-center">
                              <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="text-gray-500 dark:text-gray-400">
                                {t('calculateServices.noResults', 'No calculation results available')}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <PaginationControls />

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title={t("applicationList.deleteTitle", "Arizani o'chirish")}
        message={t(
          "applicationList.deleteConfirmation",
          `"${applicationToDelete?.number_of_application}" arizasini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.`
        )}
        confirmText={t("applicationList.delete", "O'chirish")}
        cancelText={t("common.cancel", "Bekor qilish")}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setModalMessage('');
        }}
        title={modalMessage.includes('xatolik') ? 'Xatolik' : 'Muvaffaqiyat'}
        message={modalMessage}
      />
    </div>
  );
}