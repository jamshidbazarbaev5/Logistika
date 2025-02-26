import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { api } from "../api/api";
import { useDispatch } from 'react-redux';
import { setCalculatedServices, setApplicationId } from '../storage/slice'
import { useNavigate } from 'react-router-dom';

interface KeepingService {
  id: number;
  amount: number;
  service_type_id: number;
  application_id: number;
}

interface Application {
  id: number;
  keeping_services: KeepingService[];
  // ... other fields if needed
}

interface ServiceType {
  id: number;
  name: string;
}

interface CalculationResult {
  services: {
    service_type_id: number;
    service_name: string;
    total_amount: number;
    requested_amount: number;
    price: number;
  }[];
  total_price: number;
}

export default function CalculateServices() {
  const { t } = useTranslation();
  const { id } = useParams();
  const [application, setApplication] = useState<Application | null>(null);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [amounts, setAmounts] = useState<Record<number, number>>({});
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch application and service types
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appResponse, servicesResponse] = await Promise.all([
          api.get(`/application/${id}/`),
          api.get('/keeping_service/keeping_service_name/')
        ]);

        setApplication(appResponse.data);
        setServiceTypes(servicesResponse.data.results);

        // Initialize amounts from existing keeping services
        const initialAmounts: Record<number, number> = {};
        appResponse.data.keeping_services.forEach((service: KeepingService) => {
          initialAmounts[service.service_type_id] = service.amount;
        });
        setAmounts(initialAmounts);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleAmountChange = (serviceTypeId: number, amount: number) => {
    // Find the original service to check against its amount
    const originalService = application?.keeping_services.find(
      service => service.service_type_id === serviceTypeId
    );

    // Only update if amount is valid (not greater than original amount)
    if (originalService && amount <= originalService.amount) {
      setAmounts(prev => ({
        ...prev,
        [serviceTypeId]: amount
      }));
    }
  };

  const handleCalculate = async () => {
    if (!application) return;

    setLoading(true);
    try {
      const services = Object.entries(amounts).map(([serviceTypeId, amount]) => ({
        service_type_id: Number(serviceTypeId),
        amount
      }));

      const response = await api.post(`/keeping_service/service_calculate/${id}/`, {
        services
      });

      setCalculationResult(response.data);
      dispatch(setCalculatedServices(response.data));
      dispatch(setApplicationId(Number(id)));
    } catch (error) {
      console.error('Error calculating services:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add a button to navigate to transaction page after calculation
  const handleProceedToTransaction = () => {
    navigate('/transaction');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">
        {t('calculateServices.title', 'Calculate Services')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Selection Section - Takes up 2 columns */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4">
              {t('calculateServices.applicationServices', 'Application Services')}
            </h2>
            
            {/* Scrollable container for services */}
            <div className="max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {application?.keeping_services.map((service) => {
                  const serviceType = serviceTypes.find(st => st.id === service.service_type_id);
                  return (
                    <div 
                      key={service.id} 
                      className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex flex-col space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {serviceType?.name || `Service ${service.service_type_id}`}
                        </label>
                        <div className="flex items-center justify-between space-x-4">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {t('calculateServices.maxAmount', 'Max amount')}: {service.amount}
                          </span>
                          <input
                            type="number"
                            min="0"
                            max={service.amount}
                            value={amounts[service.service_type_id] || 0}
                            onChange={(e) => handleAmountChange(service.service_type_id, parseInt(e.target.value) || 0)}
                            className="w-24 rounded-md border border-gray-300 dark:border-gray-600 
                              bg-white dark:bg-gray-700 px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleCalculate}
              disabled={loading || !application?.keeping_services.length}
              className="mt-6 w-full bg-[#6C5DD3] text-white px-4 py-2 rounded-lg
                hover:bg-[#5c4eb3] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('common.calculating', 'Calculating...') : t('common.calculate', 'Calculate')}
            </button>
          </div>
        </div>

        {/* Results Section - Takes up 1 column and sticks to the side */}
        <div className="lg:col-span-1">
          {calculationResult ? (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow sticky top-6">
              <h2 className="text-lg font-medium mb-4">
                {t('calculateServices.results', 'Calculation Results')}
              </h2>

              <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
                {calculationResult.services
                  .filter(service => service.requested_amount > 0)
                  .map((service, index) => (
                    <div 
                      key={index} 
                      className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
                    >
                      <h3 className="font-medium text-[#6C5DD3] dark:text-[#8B7BE8] mb-2">
                        {service.service_name}
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>{t('calculateServices.requestedAmount')}:</span>
                          <span className="font-medium">{service.requested_amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('calculateServices.totalAmount')}:</span>
                          <span className="font-medium">{service.total_amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('calculateServices.price')}:</span>
                          <span className="font-medium">{service.price.toLocaleString()} сум</span>
                        </div>
                      </div>
                    </div>
                  ))}

                <div className="mt-6 pt-4 border-t dark:border-gray-600">
                  <div className="flex justify-between items-center text-lg font-medium">
                    <div>{t('calculateServices.totalPrice')}:</div>
                    <div className="text-[#6C5DD3] dark:text-[#8B7BE8]">
                      {calculationResult.total_price.toLocaleString()} сум
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleProceedToTransaction}
                disabled={!calculationResult.services.some(service => service.requested_amount > 0)}
                className="mt-6 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('calculateServices.proceedToTransaction', 'Proceed to Transaction')}
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-center text-gray-500 dark:text-gray-400">
              {t('calculateServices.noResults', 'Calculate services to see results')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}