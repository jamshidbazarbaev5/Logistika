            import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Calendar,
  DollarSign,
  Package,
  Building2,
  Truck,
  PieChart as PieChartIcon,
  Filter,
  RefreshCcw
} from 'lucide-react';
// import { DatePicker } from '@/components/ui/date-picker';

interface ApplicationStatus {
  status: string;
  count: number;
}

interface Metrics {
  total_brutto: number;
  total_netto: number;
  incomes: number;
}

interface Organization {
  firm_id: number;
  firm_id__firm_name: string;
  total_amount: number;
}

interface Transport {
  transport_type: number;
  transport_type__transport_type: string;
  count: number;
}

interface Product {
  product_id: number;
  product_id__name: string;
  amount: number;
}

interface DashboardData {
  applications: ApplicationStatus[];
  metriks: Metrics[];
  organizations: Organization[];
  transport: Transport[];
  products: Product[];
}

interface Product {
  id: number;
  name: string;
  measurement_id: number;
  category_id: number;
  tnved_code: string;
}

type DateFilterType = {
  coming_date_gte: string | undefined;
  coming_date_lte: string | undefined;
  created_at_gte: string | undefined;
  created_at_lte: string | undefined;
  firm_name: string | undefined;
  product_id: number | undefined;
  top: number;
};

const COLORS = ['#60a5fa', '#4ade80', '#fbbf24', '#f43f5e', '#a78bfa'];

const chartTheme = {
  dark: {
    text: {
      fill: '#e5e7eb', // gray-200
    },
    cartesianGrid: {
      stroke: '#374151', // gray-700
    },
  },
  light: {
    text: {
      fill: '#111827', // gray-900
    },
    cartesianGrid: {
      stroke: '#e5e7eb', // gray-200
    },
  },
};

const useSystemTheme = () => {
  const [isDark, setIsDark] = useState(
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches);
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isDark;
};

const Dashboard = () => {
  const { t } = useTranslation();
  const isDarkMode = useSystemTheme();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<DateFilterType>({
    coming_date_gte: undefined,
    coming_date_lte: undefined,
    created_at_gte: undefined,
    created_at_lte: undefined,
    firm_name: undefined,
    product_id: undefined,
    top: 10,
  });

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('No access token found');
        return;
      }

      let allProducts: Product[] = [];
      let nextPage = 'https://cargo-calc.uz/api/v1/items/product/?page=1';
      
      while (nextPage) {
        const response = await fetch(nextPage, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        allProducts = [...allProducts, ...data.results];
        nextPage = data.links.next;
      }
      
      setProducts(allProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.coming_date_gte) params.append('coming_date_gte', filters.coming_date_gte);
      if (filters.coming_date_lte) params.append('coming_date_lte', filters.coming_date_lte);
      if (filters.created_at_gte) params.append('created_at_gte', filters.created_at_gte);
      if (filters.created_at_lte) params.append('created_at_lte', filters.created_at_lte);
      if (filters.firm_name) params.append('firm_name', filters.firm_name);
      if (filters.product_id) params.append('products', filters.product_id.toString());
      if (filters.top) params.append('top', filters.top.toString());

      const url = `https://cargo-calc.uz/api/v1/reports/application_count/${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchProducts();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <RefreshCcw className="h-8 w-8 text-blue-500 dark:text-blue-400 animate-spin" />
          <p className="text-lg text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const handleApplyFilters = () => {
    fetchData();
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 min-h-screen space-y-6">
      {/* Date Filters */}
      <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-6 w-6 text-blue-500 dark:text-blue-400" />
          <h2 className="text-xl font-bold dark:text-gray-100">{t("dashboard.dateFilters")}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-semibold">{t("dashboard.comingDateRange")}</h3>
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="date"
                className="px-3 py-2 border dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                value={filters.coming_date_gte || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, coming_date_gte: e.target.value || undefined }))}
              />
              <span className="text-gray-500 dark:text-gray-400">{t("dashboard.to")}</span>
              <input
                type="date"
                className="px-3 py-2 border dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                value={filters.coming_date_lte || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, coming_date_lte: e.target.value || undefined }))}
              />
            </div>
          </div>
          <div>
             <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-semibold">{t("dashboard.firmName")}</h3>
            </div>
            <input
              type="text"
              className="w-full px-3 py-2 border dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder={t("dashboard.enterFirmName")}
              value={filters.firm_name || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, firm_name: e.target.value || undefined }))}
            />
          </div>
            {/* <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-semibold">{t("dashboard.createdDateRange")}</h3>
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="date"
                  className="px-3 py-2 border dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                value={filters.created_at_gte || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, created_at_gte: e.target.value || undefined }))}
              />
              <span className="text-gray-500 dark:text-gray-400">{t("dashboard.to")}</span>
              <input
                type="date"
                 className="px-3 py-2 border dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                value={filters.created_at_lte || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, created_at_lte: e.target.value || undefined }))}
              />
            </div> */}
          </div>
        </div>
        <div className="mt-4">
         
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-semibold">{t("dashboard.product")}</h3>
            </div>
            <select
              className="w-full px-3 py-2 border dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={filters.product_id || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, product_id: e.target.value ? parseInt(e.target.value) : undefined }))}
            >
              <option value="">{t("dashboard.allProducts")}</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4">
            <Button onClick={handleApplyFilters} className="bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200">
              <RefreshCcw className="h-4 w-4 mr-2" />
              {t("dashboard.applyFilters")}
            </Button>
          </div>
        </div>
      </Card>

      {/* Application Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
              <div className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">A</div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t("dashboard.activeApplications")}</h3>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{data.applications.find(a => a.status === 'active')?.count || 0}</p>
        </Card>
        <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-sky-100 dark:bg-sky-900 rounded-lg">
              <div className="h-5 w-5 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">C</div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t("dashboard.completedApplications")}</h3>
          </div>
          <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">{data.applications.find(a => a.status === 'completed')?.count || 0}</p>
        </Card>
        <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <div className="h-5 w-5 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">T</div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t("dashboard.totalApplications")}</h3>
          </div>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{data.applications.find(a => a.status === 'all')?.count || 0}</p>
        </Card>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-pink-100 dark:bg-pink-900 rounded-lg">
              <Package className="h-5 w-5 text-pink-600 dark:text-pink-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t("dashboard.totalBrutto")}</h3>
          </div>
          <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">{data.metriks[0].total_brutto.toLocaleString()} kg</p>
        </Card>
        <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <Package className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t("dashboard.totalNetto")}</h3>
          </div>
          <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{data.metriks[0].total_netto.toLocaleString()} kg</p>
        </Card>
        <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <DollarSign className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t("dashboard.totalIncome")}</h3>
          </div>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{data.metriks[0].incomes.toLocaleString()} UZS</p>
        </Card>
      </div>

      {/* Application Status and Top Products */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Application Status */}
        <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
              <PieChartIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t("dashboard.applicationStatus")}</h2>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.applications}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => (
                    <text fill={isDarkMode ? '#e5e7eb' : '#111827'}>
                      {`${name} ${(percent * 100).toFixed(0)}%`}
                    </text>
                  )}
                >
                  {data.applications.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor:"white" }} />
                <Legend 
                  formatter={(value) => (
                    <span style={{ color:'black' }}>
                      {t(`dashboard.${value?.toLowerCase()}`)}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Products */}
        <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg">
              <PieChartIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t("dashboard.topProducts")}</h2>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.products}
                  dataKey="amount"
                  nameKey="product_id__name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => (
                    <text fill={isDarkMode ? '#e5e7eb' : '#111827'}>
                      {`${name} ${(percent * 100).toFixed(0)}%`}
                    </text>
                  )}
                >
                  {data.products.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor:'white'}} />
                <Legend 
                  formatter={(value) => (
                    <div
                      style={{
                        position: 'relative',
                        display: 'inline-block',
                        // color: isDarkMode ? '#e5e7eb' : '#111827',
                      }}
                      onMouseEnter={(e) => {
                        const tooltip = e.currentTarget.querySelector('.tooltip') as HTMLElement;
                        if (tooltip) {
                          tooltip.style.visibility = 'visible';
                          tooltip.style.opacity = '1';
                        }
                      }}
                      onMouseLeave={(e) => {
                        const tooltip = e.currentTarget.querySelector('.tooltip') as HTMLElement;
                        if (tooltip) {
                          tooltip.style.visibility = 'hidden';
                          tooltip.style.opacity = '0';
                        }
                      }}
                    >
                      <span style={{
                        display: 'inline-block',
                        maxWidth: '120px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        verticalAlign: 'bottom'
                      }}>
                        {value}
                      </span>
                      <div
                        className="tooltip"
                        style={{
                          visibility: 'hidden',
                          opacity: '0',
                          position: 'absolute',
                          bottom: '100%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          padding: '4px 8px',
                          backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                          border: '1px solid ' + (isDarkMode ? '#4B5563' : '#E5E7EB'),
                          borderRadius: '4px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          whiteSpace: 'nowrap',
                          zIndex: 1000,
                          transition: 'all 0.2s ease',
                          fontSize: '12px',
                          color: isDarkMode ? '#e5e7eb' : '#111827',
                        }}
                      >
                        {value}
                      </div>
                    </div>
                  )}
                  wrapperStyle={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    paddingRight: '10px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top Organizations */}
      <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-violet-100 dark:bg-violet-900 rounded-lg">
            <Building2 className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t("dashboard.topOrganizations")}</h2>
        </div>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.organizations}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 250, bottom: 5 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={isDarkMode ? chartTheme.dark.cartesianGrid.stroke : chartTheme.light.cartesianGrid.stroke} 
              />
              <XAxis 
                type="number" 
                tick={{ fill: 'black' }} 
              />
              <YAxis
                type="category"
                dataKey="firm_id__firm_name"
                width={240}
                tick={{ 
                  fontSize: 12, 
                //   fill: isDarkMode ? chartTheme.dark.text.fill : '#000000',
                  fontWeight: 600
                }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
                  color: 'white',
                  border: isDarkMode ? '1px solid #374151' : '1px solid #e5e7eb'
                }} 
              />
              <Bar dataKey="total_amount" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Transport Types */}
      <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
            <Truck className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t("dashboard.transportDistribution")}</h2>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.transport}
                dataKey="count"
                nameKey="transport_type__transport_type"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => (
                  <text fill={isDarkMode ? '#e5e7eb' : '#111827'}>
                    {`${name} ${(percent * 100).toFixed(0)}%`}
                  </text>
                )}
              >
                {data.transport.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'white' }} />
              <Legend 
                formatter={(value) => (
                  <span style={{ color:'black' }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

    </div>
  );
};

export default Dashboard;
