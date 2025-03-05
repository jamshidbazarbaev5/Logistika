import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";

import SuccessModal from "../components/SuccessModal";
import { Pencil, Trash2 } from 'lucide-react';

interface WorkingService {
  id: number;
  year: number;
  base_price: string;
  units: string;
  service: number;
  service_name?: string; 
}

export default function WorkingServiceList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [services, setServices] = useState<WorkingService[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const currentYear = new Date().getFullYear();
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  const fetchServices = async () => {
    try {
      const [namesResponse, servicesResponse] = await Promise.all([
        api.get('https://cargo-calc.uz/api/v1/working_service/name/'),
        api.get(`https://cargo-calc.uz/api/v1/working_service/servces/${selectedYear}/`)
      ]);

      const names = namesResponse.data.results || [];
      const services = servicesResponse.data || [];

      const servicesWithNames = services
        .map((service: any) => ({
          ...service,
          service_name: names.find((name: any) => name.id === service.service)?.service_name,
          units: normalizeUnits(service.units)
        }))
        // Sort by ID to maintain consistent order
        .sort((a: WorkingService, b: WorkingService) => a.id - b.id);

      const yearsFromServices = [...new Set(services.map((service: any) => service.year))];
      const uniqueYears:any = [...new Set([currentYear, ...yearsFromServices])];
      setAvailableYears(uniqueYears.sort((a:any, b:any) => b - a));

      setServices(servicesWithNames);
      setLoading(false);
    } catch (error) {
      console.error("Error loading working services:", error);
      setServices([]);
      setLoading(false);
    }
  };

  // Add this function to normalize units
  const normalizeUnits = (unit: string): string => {
    const unitMap: { [key: string]: string } = {
      'час': 'hour',
      'шт': 'sht'
    };
    return unitMap[unit] || unit;
  };

  // Add this function to display units in Russian
  const displayUnit = (unit: string): string => {
    const unitDisplayMap: { [key: string]: string } = {
      'hour': 'час',
      'sht': 'шт'
    };
    return unitDisplayMap[unit] || unit;
  };

  useEffect(() => {
    setLoading(true);
    fetchServices();
  }, [selectedYear]);

  const handleDelete = async (service: WorkingService) => {
    try {
      await api.delete(`/working_service/tariff/${service.id}/`);
      setModalMessage(t("workingService.deleteSuccess", "Service deleted successfully"));
      setShowSuccessModal(true);
      fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
      alert(t("workingService.deleteError", "Error deleting service"));
    }
  };

  const handleCreateService = () => {
    if (selectedYear !== currentYear) {
      setSelectedYear(currentYear);
    }
    navigate('/working-services/create');
  };

  const handleEdit = (service: WorkingService) => {
    navigate(`/working-services/edit/${service.id}`);
  };

  // Add the helper function
  const formatNumber = (num: number | string) => {
    if (typeof num === 'string') {
      num = parseFloat(num.replace(/[^\d.-]/g, ''));
    }
    if (isNaN(num)) return '0';
    
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ", ");
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
          {t("workingService.title", "Working Services")}
        </h1>
        <button
          onClick={handleCreateService}
          className="bg-[#6C5DD3] text-white px-4 py-2 rounded-lg hover:bg-[#5c4eb3]"
        >
          {t("workingService.create", "Create Service")}
        </button>
      </div>

      {/* Year Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-4" aria-label="Tabs">
            {availableYears
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
                {t("workingService.name", "Service Name")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("workingService.basePrice", "Base Price")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("workingService.units", "Units")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("workingService.year")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("common.actions", "Actions")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {services.length > 0 ? (
              services.map((service) => (
                <tr key={service.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {service.service_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {formatNumber(service.base_price)} сум
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {displayUnit(service.units)}
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
                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  {t("workingService.noServices", "No services found")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={modalMessage}
      />
    </div>
  );
}