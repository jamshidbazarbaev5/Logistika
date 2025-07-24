import { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Users,
  CheckCircle,
  Package,
  Building2,
  ChartBar,
} from "lucide-react";

interface Application {
  id: number;
  firm_id: number;
  firm_info: {
    firm_name: string;
    director_name: string;
  };
  status: "active" | "completed" | "unpaid";
  total_price: number;
  brutto: number;
  netto: number;
  products: Array<{
    quantity: number;
    product_name: string;
  }>;
  transport: Transport[];
  coming_date: string;
}

interface Transaction {
  id: number;
  application_id: number;
  full_name: string;
  keeping_services: Array<{
    service_type: number;
    amount: number;
    price: string;
  }>;
  working_services: Array<{
    service_type: string;
    quantity: number;
    price: string;
  }>;
  products: Array<{
    quantity: number;
    product: {
      id: number;
      name: string;
    };
  }>;
}

interface TransactionHistory {
  id: number;
  user: number;
  application_id: number;
  full_name: string;
  phone_number: string;
  car_number: string;
  date_of_transaction: string;
  products: Array<{
    quantity: number;
    product: {
      id: number;
      name: string;
    };
    storage: {
      id: number;
      storage_name: string;
      storage_location: string;
    };
  }>;
  keeping_services: Array<{
    service_type: number;
    amount: number;
    price: string;
  }>;
  working_services: Array<{
    service_type: string;
    quantity: number;
    price: string;
  }>;
}

interface SearchParams {
  date_from: string;
  date_to: string;
  firm_name: string;
}

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

interface Firm {
  id: number;
  firm_name: string;
  INN: number;
  full_name_director: string;
}

interface Payment {
  id: number;
  application: number;
  payment_method: number;
  amount: string;
  comment: string;
  created_at: string;
}

interface PaginatedPaymentResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Payment[];
  links:any;
}

interface Product {
  id: number;
  name: string;
  measurement_id: number;
  category_id: number;
  tnved_code: string;
}

interface Transport {
  id: number;
  transport_number: string;
  transport_type: number;
  application_id: number;
}

interface TransportType {
  id: number;
  transport_type: string;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const formatNumber = (num: number) => {
  return new Intl.NumberFormat("uz-UZ", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

export default function Dashboard2() {
  const { t } = useTranslation();
  const [applications, setApplications] = useState<Application[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setSearchParams] = useState<SearchParams>({
    date_from: "",
    date_to: "",
    firm_name: "",
  });
  const [, setSelectedProducts] = useState<string[]>([]);
  const [productDisplayLimit, setProductDisplayLimit] = useState(10);
  const [sortBy, setSortBy] = useState<"quantity" | "name">("quantity");
  const [loadingProgress] = useState(0);
  const [firms, setFirms] = useState<Firm[]>([]);
  const [selectedFirm, setSelectedFirm] = useState<Firm | null>(null);
  const [firmSearchQuery, setFirmSearchQuery] = useState("");
  const [transactionHistory, setTransactionHistory] = useState<
    TransactionHistory[]
  >([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [transportTypes, setTransportTypes] = useState<TransportType[]>([]);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const [productPage, setProductPage] = useState(1);
  const [productsPerPage] = useState(10);
  const [legendScroll, setLegendScroll] = useState(0);
  const legendRef = useRef<HTMLDivElement>(null);

  const searchFirms = async (query: string) => {
    if (!query) {
      setFirms([]);
      return;
    }
    try {
      const response = await api.get<{ results: Firm[] }>(
        `https://cargo-calc.uz/api/v1/firms/firm/?firm_name=${query}`
      );
      setFirms(response.data.results);
    } catch (error) {
      console.error("Error fetching firms:", error);
    }
  };

  const handleFirmSelect = (firm: Firm) => {
    setSelectedFirm(firm);
    setFirmSearchQuery("");
    setFirms([]);
    setSearchParams({
      date_from: "",
      date_to: "",
      firm_name: firm.firm_name,
    });

    fetchDataForFirm(firm.id);
  };

  const fetchDataForFirm = async (firmId: number, fromDate?: string, toDate?: string) => {
    try {
      setLoading(true);

      const firm = firms.find((f) => f.id === firmId) || selectedFirm;
      const firmName = firm?.firm_name;

      if (!firmName) {
        console.error("No firm name available");
        return;
      }

      const params = new URLSearchParams({
        firm_name: firmName,
        decloration_number: "",
        number_of_application: "",
        firm_INN: "",
        coming_date_gte: fromDate || "",
        coming_date_lte: toDate || "",
        products: "",
        page: "1",
      });

      const applicationsResponse = await api.get<
        PaginatedResponse<Application>
      >(`https://cargo-calc.uz/api/v1/application/?${params.toString()}`);

      setApplications(applicationsResponse.data.results);

      const allApplicationsParams = new URLSearchParams({
        firm_name: firmName,
        decloration_number: "",
        number_of_application: "",
        firm_INN: "",
        products: "",
        page: "1",
      });

      const allApplicationsResponse = await api.get<PaginatedResponse<Application>>(
        `https://cargo-calc.uz/api/v1/application/?${allApplicationsParams.toString()}`
      );

      const allApplicationIds = allApplicationsResponse.data.results.map(
        (app) => app.id
      );

      const allTransactionHistory: TransactionHistory[] = [];

      await Promise.all(
        allApplicationIds.map(async (appId) => {
          try {
            const transactionResponse = await api.get<TransactionHistory[]>(
              `https://cargo-calc.uz/api/v1/transactions/history/${appId}`
            );
            allTransactionHistory.push(...transactionResponse.data);
          } catch (error) {
            console.error(
              `Error fetching transactions for application ${appId}:`,
              error
            );
          }
        })
      );

      const filteredTransactions = allTransactionHistory.filter(transaction => {
        if (!fromDate && !toDate) return true;
        
        const transactionDate = new Date(transaction.date_of_transaction);
        const fromDateDate = fromDate ? new Date(fromDate) : null;
        const toDateDate = toDate ? new Date(toDate) : null;

        return (!fromDateDate || transactionDate >= fromDateDate) && 
               (!toDateDate || transactionDate <= toDateDate);
      });

      setTransactionHistory(filteredTransactions);

    } catch (error) {
      console.error("Error fetching data for firm:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (fromDate?: string, toDate?: string) => {
    try {
      setLoading(true);
      
      // Fetch all completed applications across all pages
      let allApplications: Application[] = [];
      let nextPage = 'https://cargo-calc.uz/api/v1/application/?status=completed';
      
      while (nextPage) {
        const response = await api.get<PaginatedResponse<Application>>(nextPage);
        allApplications = [...allApplications, ...response.data.results];
        nextPage = response.data.links?.next || '';
      }

      // Fetch all active applications
      let activeApplications: Application[] = [];
      nextPage = 'https://cargo-calc.uz/api/v1/application/?status=active';
      
      while (nextPage) {
        const response = await api.get<PaginatedResponse<Application>>(nextPage);
        activeApplications = [...activeApplications, ...response.data.results];
        nextPage = response.data.links?.next || '';
      }

      // Combine and filter applications by date if specified
      const filteredCompletedApps = allApplications.filter(app => {
        if (!fromDate && !toDate) return true;
        
        const appDate = new Date(app.coming_date.split('.').reverse().join('-'));
        const fromDateDate = fromDate ? new Date(fromDate) : null;
        const toDateDate = toDate ? new Date(toDate) : null;

        return (!fromDateDate || appDate >= fromDateDate) && 
               (!toDateDate || appDate <= toDateDate);
      });

      const filteredActiveApps = activeApplications.filter(app => {
        if (!fromDate && !toDate) return true;
        
        const appDate = new Date(app.coming_date.split('.').reverse().join('-'));
        const fromDateDate = fromDate ? new Date(fromDate) : null;
        const toDateDate = toDate ? new Date(toDate) : null;

        return (!fromDateDate || appDate >= fromDateDate) && 
               (!toDateDate || appDate <= toDateDate);
      });

      setApplications([...filteredActiveApps, ...filteredCompletedApps]);

      // Fetch payments for completed applications
      const completedAppIds = new Set(filteredCompletedApps.map(app => app.id));
      let allPayments: Payment[] = [];
      nextPage = 'https://cargo-calc.uz/api/v1/application/pay/';
      
      while (nextPage) {
        const paymentsResponse = await api.get<PaginatedPaymentResponse>(nextPage);
        const relevantPayments = paymentsResponse.data.results.filter(
          payment => completedAppIds.has(payment.application)
        );
        allPayments = [...allPayments, ...relevantPayments];
        nextPage = paymentsResponse.data.links?.next || '';
      }

      setPayments(allPayments);

      // Fetch transactions
      let allTransactions: Transaction[] = [];
      nextPage = 'https://cargo-calc.uz/api/v1/transactions/';
      
      while (nextPage) {
        const transactionsResponse = await api.get<PaginatedResponse<Transaction>>(nextPage);
        const filteredTransactions = transactionsResponse.data.results.filter(
          transaction => completedAppIds.has(transaction.application_id)
        );
        allTransactions = [...allTransactions, ...filteredTransactions];
        nextPage = transactionsResponse.data.links?.next || '';
      }

      setTransactions(allTransactions);
      
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransportTypes = async () => {
    try {
      const response = await api.get<{
        results: TransportType[];
      }>("https://cargo-calc.uz/api/v1/transport/type/");
      setTransportTypes(response.data.results);
    } catch (error) {
      console.error("Error fetching transport types:", error);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchFirms(firmSearchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [firmSearchQuery]);

  useEffect(() => {
    if (selectedFirm) {
      setSearchParams({
        date_from: "",
        date_to: "",
        firm_name: selectedFirm.firm_name,
      });
    }
  }, [selectedFirm]);

  useEffect(() => {
    handleDateChange();
    fetchTransportTypes();
  }, []);

  const applicationStats = useMemo(() => {
    let relevantApplications = selectedFirm
      ? applications.filter((app) => app.firm_id === selectedFirm.id)
      : applications;

    // Filter by selected product if any
    if (selectedProduct) {
      relevantApplications = relevantApplications.filter(app => 
        app.products.some(p => p.product_name === selectedProduct.name)
      );
    }

    return {
      total: relevantApplications.length,
      active: relevantApplications.filter((app) => app.status === "active").length,
      completed: relevantApplications.filter((app) => app.status === "completed").length,
    };
  }, [applications, selectedFirm, selectedProduct]);

  const statusData = useMemo(
    () => [
      { name: t("dashboard.active"), value: applicationStats.active },
      { name: t("dashboard.completed"), value: applicationStats.completed },
    ],
    [applicationStats, t]
  );

  const topFirmsData = useMemo(() => {
    if (selectedFirm) {
      const firmApplicationIds = new Set(
        applications
          .filter(
            (app) =>
              app.status === "completed" && app.firm_id === selectedFirm.id
          )
          .map((app) => app.id)
      );

      const totalRevenue = payments
        .filter((payment) => firmApplicationIds.has(payment.application))
        .reduce((total, payment) => total + parseFloat(payment.amount), 0);

      return [
        {
          name: selectedFirm.firm_name,
          value: totalRevenue,
        },
      ];
    }

    const firmRevenues = applications
      .filter((app) => app.status === "completed")
      .reduce((acc: { [key: string]: number }, app) => {
        const firmName = app.firm_info.firm_name;
        if (!acc[firmName]) acc[firmName] = 0;

        const applicationPayments = payments
          .filter((payment) => payment.application === app.id)
          .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

        acc[firmName] += applicationPayments;
        return acc;
      }, {});

    return Object.entries(firmRevenues)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [selectedFirm, applications, payments]);

  const productData = useMemo(() => {
    const dataSource = selectedFirm ? transactionHistory : transactions;
    const relevantApplications = selectedFirm
      ? applications.filter((app) => app.firm_id === selectedFirm.id)
      : applications;

    const relevantApplicationIds = new Set(
      relevantApplications.map((app) => app.id)
    );

    return dataSource
      .filter((transaction) =>
        relevantApplicationIds.has(transaction.application_id)
      )
      .reduce((acc: any[], transaction) => {
        transaction.products.forEach((product) => {
          const existingProduct = acc.find(
            (p) => p.name === product.product.name
          );
          if (existingProduct) {
            existingProduct.quantity += product.quantity;
          } else {
            acc.push({
              name: product.product.name,
              quantity: product.quantity,
              storage: "-",
            });
          }
        });
        return acc;
      }, []);
  }, [selectedFirm, transactions, transactionHistory, applications]);

  const firmProductData = useMemo(() => {
    console.log('Computing firmProductData with:', {
      selectedFirm: selectedFirm?.id,
      applicationsCount: applications.length,
      transactionsCount: transactionHistory.length,
      transactionsSourceCount: transactions.length
    });

    // Only consider completed applications
    const relevantApplications = selectedFirm
      ? applications.filter(app => app.firm_id === selectedFirm.id && app.status === "completed")
      : applications.filter(app => app.status === "completed");

    const relevantApplicationIds = new Set(
      relevantApplications.map((app) => app.id)
    );

    console.log('Relevant application IDs:', Array.from(relevantApplicationIds));

    // Create a map to track both quantity and application count
    const productStats = new Map();

    // First process applications' products
    relevantApplications.forEach(app => {
      app.products.forEach(product => {
        const productName = product.product_name;
        if (!productStats.has(productName)) {
          productStats.set(productName, {
            value: 0,
            applications: new Set()
          });
        }
        const stats = productStats.get(productName);
        stats.value += product.quantity;
        stats.applications.add(app.id);
      });
    });

    // Then process transactions if any
    const dataSource = selectedFirm ? transactionHistory : transactions;
    dataSource
      .filter(transaction => relevantApplicationIds.has(transaction.application_id))
      .forEach(transaction => {
        transaction.products.forEach(product => {
          const productName = product.product?.name;
          if (!productName) return;
          
          if (!productStats.has(productName)) {
            productStats.set(productName, {
              value: 0,
              applications: new Set()
            });
          }
          const stats = productStats.get(productName);
          stats.value += product.quantity;
          stats.applications.add(transaction.application_id);
        });
      });

    // Convert map to array and sort by value
    const result = Array.from(productStats.entries())
      .map(([name, stats]) => ({
        name,
        value: stats.value,
        applicationCount: stats.applications.size
      }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);

    console.log('Processed product data:', result);

    if (selectedProduct) {
      return result.filter(item => item.name === selectedProduct.name);
    }

    return result.slice(0, productDisplayLimit);
  }, [
    selectedFirm,
    applications,
    transactionHistory,
    transactions,
    selectedProduct,
    productDisplayLimit
  ]);

  const getFilteredProductData = () => {
    const filtered = firmProductData.map(item => ({
      name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
      fullName: item.name,
      quantity: item.value,
      applications: item.applicationCount,
      storage: "-"
    }));

    if (sortBy === "name") {
      filtered.sort((a, b) => a.fullName.localeCompare(b.fullName));
    }

    return filtered;
  };

  const totalRevenue = useMemo(() => {
    const completedApplicationIds = new Set(
      applications
        .filter((app) => app.status === "completed")
        .map((app) => app.id)
    );

    return payments
      .filter((payment) => completedApplicationIds.has(payment.application))
      .reduce((total, payment) => total + parseFloat(payment.amount), 0);
  }, [payments, applications]);

  const { totalBrutto, totalNetto } = useMemo(() => {
    // Only consider completed applications
    const completedApplications = applications.filter(
      (app) => app.status === "completed"
    );
    console.log('Total completed applications:', completedApplications.length);

    const relevantApplications = selectedFirm
      ? completedApplications.filter((app) => app.firm_id === selectedFirm.id)
      : completedApplications;
    
    console.log('Relevant applications for brutto/netto calc:', relevantApplications.length);

    const totals = relevantApplications.reduce(
      (acc, app) => {
        const brutto = parseFloat(app.brutto?.toString() || "0");
        const netto = parseFloat(app.netto?.toString() || "0");

        console.log(`Application ID ${app.id}:`, {
          brutto,
          netto,
          status: app.status,
          firmId: app.firm_id,
          firmName: app.firm_info.firm_name
        });

        acc.totalBrutto += brutto;
        acc.totalNetto += netto;

        return acc;
      },
      { totalBrutto: 0, totalNetto: 0 }
    );

    console.log('Final totals:', {
      totalBrutto: totals.totalBrutto,
      totalNetto: totals.totalNetto
    });

    return totals;
  }, [applications, selectedFirm]);

  const transportData = useMemo(() => {
    const relevantApplications = selectedFirm
      ? applications.filter(app => app.firm_id === selectedFirm.id && app.status === "completed")
      : applications.filter(app => app.status === "completed");

    const transportCounts = new Map<number, number>();
    
    relevantApplications.forEach(app => {
      app.transport?.forEach(transport => {
        const count = transportCounts.get(transport.transport_type) || 0;
        transportCounts.set(transport.transport_type, count + 1);
      });
    });

    return transportTypes.map(type => ({
      name: type.transport_type,
      value: transportCounts.get(type.id) || 0
    })).filter(item => item.value > 0);
  }, [applications, selectedFirm, transportTypes]);

  const statsGroups = {
    applications: {
      title: t("dashboard.applications"),
      stats: [
        {
          title: t("dashboard.totalApplications"),
          value: formatNumber(applicationStats.total),
          icon: (
            <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          ),
          color: "purple",
        },
        {
          title: t("dashboard.activeApplications"),
          value: formatNumber(applicationStats.active),
          icon: (
            <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
          ),
          color: "green",
        },
        {
          title: t("dashboard.completedApplications"),
          value: formatNumber(applicationStats.completed),
          icon: (
            <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          ),
          color: "blue",
        },
      ],
    },
    metrics: {
      title: t("dashboard.metrics"),
      stats: [
        {
          title: t("dashboard.totalRevenue"),
          value: `${formatNumber(totalRevenue)} UZS`,
          icon: (
            <svg
              className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          color: "yellow",
        },
        {
          title: t("dashboard.totalBrutto"),
          value: `${formatNumber(totalBrutto)} kg`,
          icon: (
            <svg
              className="h-6 w-6 text-pink-600 dark:text-pink-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
              />
            </svg>
          ),
          color: "pink",
        },
        {
          title: t("dashboard.totalNetto"),
          value: `${formatNumber(totalNetto)} kg`,
          icon: (
            <svg
              className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
              />
            </svg>
          ),
          color: "indigo",
        },
      ],
    },
  };

  const handleFirmReset = async () => {
    setSelectedFirm(null);
    setFirmSearchQuery("");
    setDateFrom("");
    setDateTo("");
    setSearchParams({
      date_from: "",
      date_to: "",
      firm_name: "",
    });
    setSelectedProduct(null);

    setApplications([]);
    setTransactions([]);
    setTransactionHistory([]);
    setSelectedProducts([]);

    try {
      setLoading(true);

      // Fetch all completed applications
      let allApplications: Application[] = [];
      let nextPage = 'https://cargo-calc.uz/api/v1/application/?status=completed';
      
      while (nextPage) {
        const response = await api.get<PaginatedResponse<Application>>(nextPage);
        allApplications = [...allApplications, ...response.data.results];
        nextPage = response.data.links?.next || '';
      }

      // Fetch all active applications
      let activeApplications: Application[] = [];
      nextPage = 'https://cargo-calc.uz/api/v1/application/?status=active';
      
      while (nextPage) {
        const response = await api.get<PaginatedResponse<Application>>(nextPage);
        activeApplications = [...activeApplications, ...response.data.results];
        nextPage = response.data.links?.next || '';
      }

      // Combine all applications
      setApplications([...activeApplications, ...allApplications]);

      // Fetch all transactions
      let allTransactions: Transaction[] = [];
      nextPage = 'https://cargo-calc.uz/api/v1/transactions/';
      
      while (nextPage) {
        const response = await api.get<PaginatedResponse<Transaction>>(nextPage);
        allTransactions = [...allTransactions, ...response.data.results];
        nextPage = response.data.links?.next || '';
      }
      setTransactions(allTransactions);

      // Fetch all payments for completed applications
      const completedAppIds = new Set(allApplications.map(app => app.id));
      let allPayments: Payment[] = [];
      nextPage = 'https://cargo-calc.uz/api/v1/application/pay/';
      
      while (nextPage) {
        const paymentsResponse = await api.get<PaginatedPaymentResponse>(nextPage);
        const relevantPayments = paymentsResponse.data.results.filter(
          payment => completedAppIds.has(payment.application)
        );
        allPayments = [...allPayments, ...relevantPayments];
        nextPage = paymentsResponse.data.links?.next || '';
      }
      setPayments(allPayments);

    } catch (error) {
      console.error("Error resetting data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      let allProducts: Product[] = [];
      let nextPage = 'https://cargo-calc.uz/api/v1/items/product/';
      
      while (nextPage) {
        console.log('Fetching products from:', nextPage);
        const response = await api.get<PaginatedResponse<Product>>(nextPage);
        console.log('Products response:', response.data);
        
        allProducts = [...allProducts, ...response.data.results];
        nextPage = response.data.links?.next || '';
      }
  
      console.log('Total products fetched:', allProducts.length);
      setProducts(allProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDateChange = (newDateFrom?: string, newDateTo?: string) => {
    const dateFromToUse = newDateFrom ?? dateFrom;
    const dateToToUse = newDateTo ?? dateTo;
    
    if (selectedFirm) {
      fetchDataForFirm(selectedFirm.id, dateFromToUse, dateToToUse);
    } else {
      fetchData(dateFromToUse, dateToToUse);
    }
  };

  const handleLegendScroll = (direction: 'left' | 'right') => {
    if (legendRef.current) {
      const scrollAmount = 100;
      const newScroll = direction === 'left' 
        ? legendScroll - scrollAmount 
        : legendScroll + scrollAmount;
      
      setLegendScroll(newScroll);
      legendRef.current.scrollLeft = newScroll;
    }
  };

  const indexOfLastProduct = productPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = getFilteredProductData().slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(getFilteredProductData().length / productsPerPage);

  const renderProductDistributionChart = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Package className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {selectedFirm 
              ? `${selectedFirm.firm_name} - ${t("dashboard.productDistribution")}`
              : t("dashboard.productDistribution")}
          </h3>
        </div>
      </div>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={firmProductData.slice(0, 15)} // Show only top 15 products in chart
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={150}
              label={({ name, percent }) => `${name.substring(0, 15)}... (${(percent * 100).toFixed(0)}%)`}
            >
              {firmProductData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '8px',
                border: '1px solid #e2e8f0',
              }}
              formatter={(value, _name, entry) => [
                `${formatNumber(Number(value))}`,
                entry.payload.name
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 relative">
        <button
          onClick={() => handleLegendScroll('left')}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-700 p-2 rounded-full shadow-md z-10"
        >
          ←
        </button>
        <div
          ref={legendRef}
          className="overflow-x-auto scrollbar-hide mx-8"
          style={{
            scrollBehavior: 'smooth'
          }}
        >
          <div className="flex gap-4 py-2">
            {firmProductData.map((entry, index) => (
              <div key={index} className="flex items-center whitespace-nowrap">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
        <button
          onClick={() => handleLegendScroll('right')}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-700 p-2 rounded-full shadow-md z-10"
        >
          →
        </button>
      </div>
    </div>
  );

  const renderProductTable = () => (
    <div className="mt-8">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t("dashboard.productName")}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t("dashboard.quantity")}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t("dashboard.applications")}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t("dashboard.storage")}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {currentProducts.map((product, index) => (
            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <td className="px-6 py-4 whitespace-normal text-sm text-gray-900 dark:text-gray-300">
                <span title={product.fullName}>{product.name}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                {formatNumber(product.quantity)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                {product.applications}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                {product.storage}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          {t("dashboard.showing")} {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, getFilteredProductData().length)} {t("dashboard.of")} {getFilteredProductData().length}
        </div>
        <div className="flex gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setProductPage(i + 1)}
              className={`px-3 py-1 rounded ${
                productPage === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {t("dashboard.title")}
                  </h1>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {t("dashboard.subtitle")}
                  </p>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("dashboard.selectFirm")}
                  </label>
                  <input
                    type="text"
                    value={firmSearchQuery}
                    onChange={(e) => setFirmSearchQuery(e.target.value)}
                    placeholder={t("dashboard.searchFirm")}
                    className="w-full p-3 border rounded-lg"
                  />
                  {firms.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {firms.map((firm) => (
                        <div
                          key={firm.id}
                          onClick={() => handleFirmSelect(firm)}
                          className="p-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border-b last:border-b-0 dark:border-gray-600"
                        >
                          <div className="font-medium">{firm.firm_name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            INN: {firm.INN}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedFirm && (
                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-medium text-blue-700 dark:text-blue-300">
                          {selectedFirm.firm_name}
                        </div>
                        <div className="text-sm text-blue-600 dark:text-blue-400">
                          INN: {selectedFirm.INN}
                        </div>
                      </div>
                      <button
                        onClick={handleFirmReset}
                        className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-full"
                      >
                        <svg
                          className="w-5 h-5 text-blue-700 dark:text-blue-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("dashboard.dateFrom")}
                    </label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        setDateFrom(newDate);
                        handleDateChange(newDate, dateTo);
                      }}
                      className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t("dashboard.dateTo")}
                    </label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        setDateTo(newDate);
                        handleDateChange(dateFrom, newDate);
                      }}
                      className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("dashboard.selectProduct")}
                  </label>
                  <select
                    value={selectedProduct?.id || ""}
                    onChange={(e) => {
                      const product = products.find(
                        (p) => p.id === Number(e.target.value)
                      );
                      setSelectedProduct(product || null);
                    }}
                    className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
                  >
                    <option value="">{t("dashboard.allProducts")}</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {loading && (
                <div className="mt-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400"></div>
                    <div className="text-gray-600 dark:text-gray-400">
                      {selectedFirm ? (
                        <div className="flex flex-col">
                          <span className="font-medium">{`Loading ${selectedFirm.firm_name} data...`}</span>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                            <div
                              className="bg-blue-600 dark:bg-blue-400 h-2.5 rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.round(loadingProgress)}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm mt-1">{`${Math.round(
                            loadingProgress
                          )}% complete`}</span>
                        </div>
                      ) : (
                        "Loading data..."
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {!loading && (
            <>
              <div className="grid grid-cols-1 gap-6">
                {Object.entries(statsGroups).map(([key, group]) => (
                  <div
                    key={key}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                  >
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      {group.title}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {group.stats.map((stat, index) => (
                        <div
                          key={index}
                          className={`
                          p-6 rounded-lg border
                          bg-gradient-to-br from-${stat.color}-50 to-white dark:from-gray-800 dark:to-gray-800
                          transition-all duration-300 hover:shadow-md hover:scale-[1.02]
                          flex items-center space-x-4
                        `}
                        >
                          <div
                            className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900 flex-shrink-0`}
                          >
                            {stat.icon}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              {stat.title}
                            </p>
                            <p
                              className={`text-2xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400`}
                            >
                              {stat.value}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center mb-6">
                    <ChartBar className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedFirm
                        ? `${selectedFirm.firm_name} - ${t(
                            "dashboard.applicationStatus"
                          )}`
                        : t("dashboard.applicationStatus")}
                    </h3>
                  </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                          className="drop-shadow-lg"
                        >
                          {statusData.map((_entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                              className="hover:opacity-80 transition-opacity"
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            borderRadius: "8px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center mb-6">
                    <Building2 className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t("dashboard.topFirms")}
                    </h3>
                  </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topFirmsData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          type="number"
                          tickFormatter={(value) => formatNumber(value)}
                        />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={150}
                          tick={{ fill: "#4b5563", fontSize: 12 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            borderRadius: "8px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                          }}
                          formatter={(value) =>
                            `${formatNumber(Number(value))} sum`
                          }
                        />
                        <Bar
                          dataKey="value"
                          fill="#6C5DD3"
                          radius={[0, 4, 4, 0]}
                          className="hover:opacity-80 transition-opacity"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center mb-6">
                    <svg
                      className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20"
                      />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t("dashboard.transportDistribution")}
                    </h3>
                  </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={transportData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                          className="drop-shadow-lg"
                        >
                          {transportData.map((_entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                              className="hover:opacity-80 transition-opacity"
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            borderRadius: "8px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                          }}
                          formatter={(value) => formatNumber(Number(value))}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {renderProductDistributionChart()}

                <div className="col-span-1 lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center">
                      <Package className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {t("dashboard.productDistribution")}
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <select
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm bg-white dark:bg-gray-700 dark:border-gray-600"
                        value={sortBy}
                        onChange={(e) =>
                          setSortBy(e.target.value as "quantity" | "name")
                        }
                      >
                        <option value="quantity">
                          {t("dashboard.sortByQuantity")}
                        </option>
                        <option value="name">
                          {t("dashboard.sortByName")}
                        </option>
                      </select>

                      <select
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm bg-white dark:bg-gray-700 dark:border-gray-600"
                        value={productDisplayLimit}
                        onChange={(e) =>
                          setProductDisplayLimit(Number(e.target.value))
                        }
                      >
                        <option value="2">Top 2</option>
                        <option value="10">Top 10</option>
                        <option value="20">Top 20</option>
                        <option value="50">Top 50</option>
                        <option value={productData.length}>All</option>
                      </select>
                    </div>
                  </div>

                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getFilteredProductData()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={100}
                          interval={0}
                          tick={{ fontSize: 12, fill: "#4b5563" }}
                        />
                        <YAxis
                          tickFormatter={formatNumber}
                          tick={{ fill: "#4b5563" }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            borderRadius: "8px",
                            padding: "8px",
                            border: "1px solid #e2e8f0",
                          }}
                          formatter={(value) => formatNumber(Number(value))}
                        />
                        <Bar
                          dataKey="quantity"
                          fill="#6C5DD3"
                          radius={[4, 4, 0, 0]}
                          className="hover:opacity-80 transition-opacity"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {renderProductTable()}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t("dashboard.title")}
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {t("dashboard.subtitle")}
                </p>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("dashboard.selectFirm")}
                </label>
                <input
                  type="text"
                  value={firmSearchQuery}
                  onChange={(e) => setFirmSearchQuery(e.target.value)}
                  placeholder={t("dashboard.searchFirm")}
                  className="w-full p-3 border rounded-lg"
                />
                {firms.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {firms.map((firm) => (
                      <div
                        key={firm.id}
                        onClick={() => handleFirmSelect(firm)}
                        className="p-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border-b last:border-b-0 dark:border-gray-600"
                      >
                        <div className="font-medium">{firm.firm_name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          INN: {firm.INN}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedFirm && (
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex justify-between items-center">
                    <div>
                      <div className="font-medium text-blue-700 dark:text-blue-300">
                        {selectedFirm.firm_name}
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">
                        INN: {selectedFirm.INN}
                      </div>
                    </div>
                    <button
                      onClick={handleFirmReset}
                      className="p-1 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-full"
                    >
                      <svg
                        className="w-5 h-5 text-blue-700 dark:text-blue-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("dashboard.dateFrom")}
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setDateFrom(newDate);
                      handleDateChange(newDate, dateTo);
                    }}
                    className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t("dashboard.dateTo")}
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                      const newDate = e.target.value;
                      setDateTo(newDate);
                      handleDateChange(dateFrom, newDate);
                    }}
                    className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("dashboard.selectProduct")}
                </label>
                <select
                  value={selectedProduct?.id || ""}
                  onChange={(e) => {
                    const product = products.find(
                      (p) => p.id === Number(e.target.value)
                    );
                    setSelectedProduct(product || null);
                  }}
                  className="w-full p-3 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600"
                >
                  <option value="">{t("dashboard.allProducts")}</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading && (
              <div className="mt-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400"></div>
                  <div className="text-gray-600 dark:text-gray-400">
                    {selectedFirm ? (
                      <div className="flex flex-col">
                        <span className="font-medium">{`Loading ${selectedFirm.firm_name} data...`}</span>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                          <div
                            className="bg-blue-600 dark:bg-blue-400 h-2.5 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.round(loadingProgress)}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm mt-1">{`${Math.round(
                          loadingProgress
                        )}% complete`}</span>
                      </div>
                    ) : (
                      "Loading data..."
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {!loading && (
          <>
            <div className="grid grid-cols-1 gap-6">
              {Object.entries(statsGroups).map(([key, group]) => (
                <div
                  key={key}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
                >
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {group.title}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.stats.map((stat, index) => (
                      <div
                        key={index}
                        className={`
                          p-6 rounded-lg border
                          bg-gradient-to-br from-${stat.color}-50 to-white dark:from-gray-800 dark:to-gray-800
                          transition-all duration-300 hover:shadow-md hover:scale-[1.02]
                          flex items-center space-x-4
                        `}
                      >
                        <div
                          className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900 flex-shrink-0`}
                        >
                          {stat.icon}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {stat.title}
                          </p>
                          <p
                            className={`text-2xl font-bold text-${stat.color}-600 dark:text-${stat.color}-400`}
                          >
                            {stat.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center mb-6">
                  <ChartBar className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedFirm
                      ? `${selectedFirm.firm_name} - ${t(
                          "dashboard.applicationStatus"
                        )}`
                      : t("dashboard.applicationStatus")}
                  </h3>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                        className="drop-shadow-lg"
                      >
                        {statusData.map((_entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            className="hover:opacity-80 transition-opacity"
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          borderRadius: "8px",
                          padding: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center mb-6">
                  <Building2 className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("dashboard.topFirms")}
                  </h3>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topFirmsData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        type="number"
                        tickFormatter={(value) => formatNumber(value)}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={150}
                        tick={{ fill: "#4b5563", fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          borderRadius: "8px",
                          padding: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                        formatter={(value) =>
                          `${formatNumber(Number(value))} sum`
                        }
                      />
                      <Bar
                        dataKey="value"
                        fill="#6C5DD3"
                        radius={[0, 4, 4, 0]}
                        className="hover:opacity-80 transition-opacity"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center mb-6">
                  <svg
                    className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("dashboard.transportDistribution")}
                  </h3>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={transportData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                        className="drop-shadow-lg"
                      >
                        {transportData.map((_entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            className="hover:opacity-80 transition-opacity"
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          borderRadius: "8px",
                          padding: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                        formatter={(value) => formatNumber(Number(value))}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {renderProductDistributionChart()}

              <div className="col-span-1 lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t("dashboard.productDistribution")}
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <select
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm bg-white dark:bg-gray-700 dark:border-gray-600"
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(e.target.value as "quantity" | "name")
                      }
                    >
                      <option value="quantity">
                        {t("dashboard.sortByQuantity")}
                      </option>
                      <option value="name">
                        {t("dashboard.sortByName")}
                      </option>
                    </select>

                    <select
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm bg-white dark:bg-gray-700 dark:border-gray-600"
                      value={productDisplayLimit}
                      onChange={(e) =>
                        setProductDisplayLimit(Number(e.target.value))
                      }
                    >
                      <option value="2">Top 2</option>
                      <option value="10">Top 10</option>
                      <option value="20">Top 20</option>
                      <option value="50">Top 50</option>
                      <option value={productData.length}>All</option>
                    </select>
                  </div>
                </div>

                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getFilteredProductData()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                        tick={{ fontSize: 12, fill: "#4b5563" }}
                      />
                      <YAxis
                        tickFormatter={formatNumber}
                        tick={{ fill: "#4b5563" }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          borderRadius: "8px",
                          padding: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                        formatter={(value) => formatNumber(Number(value))}
                      />
                      <Bar
                        dataKey="quantity"
                        fill="#6C5DD3"
                        radius={[4, 4, 0, 0]}
                        className="hover:opacity-80 transition-opacity"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {renderProductTable()}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
