import { useState, useEffect, Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { api } from "../api/api";
import ConfirmModal from "../components/ConfirmModal";
import SuccessModal from "../components/SuccessModal";
import { SearchBar, SearchField } from "../components/SearchBar";
import { Crown, User, Download } from "lucide-react";

import { Calculator } from "lucide-react"; 
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
  status: ApplicationStatus;
}

interface SearchParams extends Record<string, string> {
  firm_name: string;
  decloration_number: string;
  number_of_application: string;
  firm_INN: string;
  coming_date_gte: string;
  coming_date_lte: string;
  products: string;
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
interface ModesResponse {
  results: Mode[];
}

// Add interface for Product API response
interface ProductResponse {
  id: number;
  name: string;
  // add other fields if needed
}

interface ProductApiResponse {
  results: ProductResponse[];
}

type ApplicationStatus = 'active' | 'unpaid' | 'completed';

const getStatusClasses = (status: ApplicationStatus) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'unpaid':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'completed':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

export default function ArchiveApplicationList() {
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
    number_of_application: '',
    firm_INN: '',
    coming_date_gte: '',
    coming_date_lte: '',
    products: '',
  });

  // Add pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isFormModalOpen] = useState(false);
  const [] = useState(false);
  

  const [, setKeepingServices] = useState<Array<{ id: number; name: string; base_price: number; extra_price: number }>>([]);
  const [, setWorkingServices] = useState<Array<{ id: number; service_name: string; base_price: number; extra_price: number; units: string }>>([]);
  const [, setTransportTypes] = useState<Array<{ id: number; transport_type: string }>>([]);
  const [, setStorages] = useState<Array<{ id: number; name: string }>>([]);
  const [productsList, setProductsList] = useState<ProductResponse[]>([]);
  // const [, setAvailableModes] = useState<Array<{ id: number; name: string }>>([]);

  // Add state for available modes
  const [availableModes, setAvailableModes] = useState<Mode[]>([]);

  // Add useEffect to fetch products when component mounts
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
  ];

  const fetchApplications = async () => {
    try {
      const params = new URLSearchParams();
      
      // Add all search parameters
      Object.entries(searchParams).forEach(([key, value]) => {
        if (value) {
          params.append(key, value);
        }
      });
      
      // Add page parameter
      params.append('page', currentPage.toString());

      // Make the API call with the params
      const [applicationsResponse, firmsResponse, modesResponse, availableModesResponse] = await Promise.all([
        api.get<PaginatedResponse<Application>>(`/application/?${params.toString()}`),
        api.get<PaginatedResponse<FirmResponse>>('/firms/'),
        api.get<PaginatedResponse<ApplicationMode>>('/modes/application_modes/'),
        api.get<ModesResponse>('/modes/modes/')
      ]);

      // Filter applications to only show completed ones
      const completedApplications = Array.isArray(applicationsResponse.data?.results) 
        ? applicationsResponse.data.results.filter(app => app.status === 'completed')
        : [];

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
      setAvailableModes(Array.isArray(availableModesResponse.data.results) 
        ? availableModesResponse.data.results 
        : []);
      setApplications(completedApplications);
      setLoading(false);

      // Update pagination based on filtered results
      setTotalPages(Math.ceil(completedApplications.length / applicationsResponse.data.page_size));
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

  const handleDownloadExcel = () => {
    const params = new URLSearchParams();
    
    const searchParamsForExport = {
      firm_name: searchParams.firm_name,
      decloration_number: searchParams.decloration_number,
      number_of_application: searchParams.number_of_application,
      firm_INN: searchParams.firm_INN,
      coming_date_gte: searchParams.coming_date_gte, // Single underscore
      coming_date_lte: searchParams.coming_date_lte, // Single underscore
      products: searchParams.products
    };

    // Add all parameters, even if empty
    Object.entries(searchParamsForExport).forEach(([key, value]) => {
      console.log(`Adding parameter: ${key} = ${value}`); // Debug log
      params.append(key, value || '');
    });

    // Use the exact URL from the backend
    const downloadUrl = `https://cargo-calc.uz/api/v1/export_excel/?${params.toString()}`;
    
    console.log('Download URL:', downloadUrl); // Debug log

    // Create a temporary link element and trigger the download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', 'applications.xlsx');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          {t("applicationList.title", "Completed Applications")}
        </h1>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleDownloadExcel}
            className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 text-sm rounded-lg 
            hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2
            dark:focus:ring-offset-gray-800 transition-all duration-200 flex items-center justify-center"
          >
            <Download className="w-4 h-4 mr-2" />
            {t("applicationList.downloadExcel", "Download Excel")}
          </button>
        </div>
      </div>

      <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            {t('applicationList.search.title', 'Search Applications')}
          </h2>
        </div>
        <div className="p-4">
          <SearchBar
            fields={searchFields}
            initialValues={searchParams}
            onSearch={(values) => {
              console.log('Search values:', values); // Debug log
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
                {t("applicationList.table.modes", "Modes")}
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <PaginationControls />
    </div>
  );
}