import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { api, apiService } from "../api/api";
import ConfirmModal from "../components/ConfirmModal";
import SuccessModal from "../components/SuccessModal";
import { Pencil, Trash2 } from 'lucide-react';



interface KeepingServiceFormData {
  name: string;
  base_day: number;
  base_price: string;
  extra_price: string;
  year: number;
}

interface KeepingServiceName {
  id: number;
  name: string;
}

interface KeepingServicePrice {
  id: number;
  year: number;
  base_day: number;
  base_price: string;
  extra_price: string;
  keeping_services_id: number;
  measurement: number;
  measurement_name: string;
}

interface KeepingServiceWithPriceId {
  id: number;
  name: string;
  base_day: number;
  base_price: string;
  extra_price: string;
  year: number;
  priceId: number;
  measurement: number;
  measurement_name: string;
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
  count: number;
}

const formatNumber = (num: number | string) => {
  if (typeof num === 'string') {
    num = parseFloat(num.replace(/[^\d.-]/g, ''));
  }
  if (isNaN(num)) return '0';
  
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ", ");
};

export default function KeepingServiceList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [services, setServices] = useState<KeepingServiceWithPriceId[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<KeepingServiceWithPriceId | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<KeepingServiceFormData>({
    name: '',
    base_day: 0,
    base_price: '',
    extra_price: '',
    year: new Date().getFullYear(),
  });
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  const fetchServices = async () => {
    try {
      const [namesResponse, pricesResponse] = await Promise.all([
        apiService.getKeepingServiceNames(),
        apiService.getKeepingServicePrices(selectedYear)
      ]);

      console.log('Raw namesResponse:', namesResponse);
      console.log('Raw pricesResponse:', pricesResponse);

      const names = (namesResponse?.data as PaginatedResponse<KeepingServiceName>)?.results || [];
      const prices = (pricesResponse?.data as PaginatedResponse<KeepingServicePrice>)?.results || [];

      const yearsFromServices = [...new Set(prices.map(price => price.year))] as number[];
      const uniqueYears = [...new Set([currentYear, ...yearsFromServices])];
      setAvailableYears(uniqueYears.sort((a, b) => b - a));

      const currentSelectedYear = selectedYear || (yearsFromServices.length > 0 ? Math.max(...yearsFromServices) : currentYear);
      setSelectedYear(currentSelectedYear);
      const yearPrices = prices.filter(price => price.year === currentSelectedYear);

      console.log('Names:', names);
      console.log('Filtered Prices for year', currentSelectedYear, ':', yearPrices);

      if (names.length === 0 && yearPrices.length > 0) {
        const servicesFromPrices: KeepingServiceWithPriceId[] = yearPrices.map((price: KeepingServicePrice) => ({
          id: price.keeping_services_id,
          name: `Service ${price.keeping_services_id}`,
          base_day: price.base_day,
          base_price: price.base_price,
          extra_price: price.extra_price,
          year: price.year,
          priceId: price.id,
          measurement: price.measurement,
          measurement_name: price.measurement_name
        }));

        setServices(servicesFromPrices);
      } else {
        const combinedServices: KeepingServiceWithPriceId[] = names
          .map((name: KeepingServiceName) => {
            const price = yearPrices.find((p: KeepingServicePrice) => p.keeping_services_id === name.id);
            if (!price) return null;
            
            return {
              id: name.id,
              name: name.name,
              base_day: price.base_day,
              base_price: price.base_price,
              extra_price: price.extra_price,
              year: price.year,
              priceId: price.id,
              measurement: price.measurement,
              measurement_name: price.measurement_name
            };
          })
          .filter((service): service is KeepingServiceWithPriceId => service !== null);

        setServices(combinedServices);
      }
      setLoading(false);
    } catch (error: any) {
      console.error("Error loading keeping services:", error);
      console.error("Error details:", {
        namesResponse: error?.response?.data,
        pricesResponse: error?.response?.data
      });
      setServices([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [selectedYear]);

  const handleDelete = (service: KeepingServiceWithPriceId) => {
    setServiceToDelete(service);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;

    try {
      if (serviceToDelete.priceId) {
        await api.delete(`/keeping_service/keeping_service_price/${serviceToDelete.priceId}/`);
      }

      await api.delete(`/keeping_service/keeping_service_name/${serviceToDelete.id}/`);

      setServices(prevServices => 
        prevServices.filter(service => service.id !== serviceToDelete.id)
      );

      setModalMessage(t("keepingService.deleteSuccess"));
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error deleting service:", error);
      alert(t("keepingService.deleteError", "Error deleting service"));
    }
    setShowDeleteModal(false);
  };

  const handleEdit = (service: KeepingServiceWithPriceId) => {
    setFormData({
      name: service.name,
      base_day: service.base_day,
      base_price: service.base_price,
      extra_price: service.extra_price,
      year: service.year || new Date().getFullYear(),
    });
    setServiceToDelete(service);
    setIsEditing(true);
    setIsFormModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && serviceToDelete) {
        await api.put(
          `/keeping_service/keeping_service_name/${serviceToDelete.id}/`, 
          { name: formData.name }
        );

        const priceData = {
          year: formData.year,
          base_day: formData.base_day,
          base_price: formData.base_price,
          extra_price: formData.extra_price,
          keeping_services_id: serviceToDelete.id,
          measurement: serviceToDelete.measurement,
          measurement_name: serviceToDelete.measurement_name
        };

        if (serviceToDelete.priceId) {
          await api.put(
            `/keeping_service/keeping_service_price/${serviceToDelete.priceId}/`,
            priceData
          );
        }

        setModalMessage(t("keepingService.updateSuccess"));
        
        if (formData.year !== selectedYear) {
          setSelectedYear(formData.year);
        } else {
          await fetchServices();
        }
      } else {
        // Handle create new service case
        await apiService.createKeepingService(formData);
        setModalMessage(t("keepingService.createSuccess"));
        await fetchServices();
      }
      
      setIsFormModalOpen(false);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Error saving service:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
      }
      alert(t("keepingService.updateError", "Error updating service"));
    }
  };

  const handleCreateService = () => {
    navigate('/keeping-services/create-price');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5DD3]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          {t("keepingService.title")}
        </h1>
        <button
          onClick={handleCreateService}
          className="bg-[#6C5DD3] text-white px-4 py-2 rounded-lg hover:bg-[#5c4eb3]"
        >
          {t("keepingService.create")}
        </button>
      </div>

      {/* Year Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-4" aria-label="Tabs">
            {availableYears
              .sort((a, b) => a-b)
              .map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`
                    whitespace-nowrap px-4 py-2 border-b-2 font-medium text-sm
                    ${selectedYear === year
                      ? 'border-[#6C5DD3] text-[#6C5DD3]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {year}
                </button>
              ))}
          </nav>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("keepingService.name")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("keepingService.measurement")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("keepingService.baseDay")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("keepingService.basePrice")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("keepingService.extraPrice")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("keepingService.year")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("common.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {services.length > 0 ? (
              services.map((service) => (
                <tr key={`service-${service.id}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {service.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {service.measurement_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {service.base_day}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {formatNumber(service.base_price)} сум
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {service.extra_price}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {service.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(service)}
                        className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                      >
                        <Pencil size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(service)}
                        className="text-red-600 hover:text-red-800 dark:hover:text-red-400"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  {t("keepingService.noServices")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Service Form Modal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsFormModalOpen(false)} />
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
              <h2 className="text-xl font-semibold mb-4 dark:text-white">
                {isEditing ? t("keepingService.edit") : t("keepingService.create")}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t("keepingService.name")}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-[#6C5DD3] focus:ring-[#6C5DD3] sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t("keepingService.baseDay")}
                    </label>
                    <input
                      type="number"
                      value={formData.base_day}
                      onChange={(e) => setFormData({ ...formData, base_day: parseInt(e.target.value) })}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-[#6C5DD3] focus:ring-[#6C5DD3] sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t("keepingService.basePrice")}
                    </label>
                    <input
                      type="text"
                      value={formData.base_price}
                      onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-[#6C5DD3] focus:ring-[#6C5DD3] sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t("keepingService.extraPrice")}
                    </label>
                    <input
                      type="text"
                      value={formData.extra_price}
                      onChange={(e) => setFormData({ ...formData, extra_price: e.target.value })}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-[#6C5DD3] focus:ring-[#6C5DD3] sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t("keepingService.year")}
                    </label>
                    <input
                      type="number"
                      value={currentYear}
                      onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                      className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-[#6C5DD3] focus:ring-[#6C5DD3] sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-[#6C5DD3] rounded-md hover:bg-[#5c4eb8]"
                  >
                    {isEditing ? t("common.update") : t("common.create")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title={t("keepingService.deleteTitle")}
        message={t("keepingService.deleteConfirmation")}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={modalMessage}
      />
    </div>
  );
}