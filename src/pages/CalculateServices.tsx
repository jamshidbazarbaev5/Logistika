  import { useState, useEffect } from "react";
  import { useTranslation } from "react-i18next";
  import { useParams } from "react-router-dom";
  import { api } from "../api/api";
  import { useDispatch } from 'react-redux';
  import { setCalculatedServices, setApplicationId } from '../storage/slice'
  import { useNavigate } from 'react-router-dom';
  import ErrorModal from '../components/ErrorModal';
  import { ChevronDownIcon } from '@heroicons/react/24/outline';
  import { ArrowLeft } from 'lucide-react';

  interface KeepingService {
    id: number;
    amount: number;
    service_type_id: number;
    application_id: number;
  }

  interface Application {
    id: number;
    keeping_services: KeepingService[];
    working_services: {
      id: number;
      quantity: number;
      price: string;
      service_id: number;
      application_id: number;
      service_name: string;
    }[];
  }

  interface ServiceType {
    id: number;
    name: string;
  }

  interface CalculationResult {
    keeping_services: {
      service_type_id: number;
      service_name: string;
      total_amount: number;
      requested_amount: number;
      price: number;
    }[];
    working_services: {
      service_type_id: number;
      service_name: string;
      total_amount: number;
      requested_amount: number;
      price: number;
    }[];
    total_price: number;
  }

  interface TransactionHistory {
    id: number;
    user: number;
    application_id: number;
    full_name: string;
    phone_number: string;
    car_number: string;
    date_of_transaction: string;
    products: {
      quantity: number;
      product: {
        id: number;
        name: string;
        measurement_id: number;
        category_id: number;
      };
      storage: {
        id: number;
        storage_name: string;
        storage_location: string;
      };
    }[];
    keeping_services: {
      service_type: number;
      amount: number;
      price: string;
    }[];
    working_services: {
      service_type: number;
      quantity: number;
      price: string;
    }[];
  } 

  interface Product {
    id: number;
    name: string;
  }

  interface Payment {
    id: number;
    application: number;
    payment_method: number;
    amount: string;
    comment: string;
    created_at: string;
  }

  interface PaymentMethod {
    id: number;
    payment_method: string;
  }

  interface WorkingServiceType {
    id: number;
    service_name: string;
  }

  interface WorkingService {
    id: number;
    quantity: number;
    price: string;
    service_id: number;
    application_id: number;
    service_name: string;
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
    const [activeTab, setActiveTab] = useState<'calculate' | 'history' | 'payments'>('calculate');
    const [transactionHistory, setTransactionHistory] = useState<TransactionHistory[]>([]);
    const [ , setProducts] = useState<Record<number, Product>>({});
    const [payments, setPayments] = useState<Payment[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [newPayment, setNewPayment] = useState({
      payment_method: 1,
      amount: "",
      comment: ""
    });
    const [workingAmounts, setWorkingAmounts] = useState<Record<number, number>>({});
    const [workingServiceTypes, setWorkingServiceTypes] = useState<WorkingServiceType[]>([]);
    const [originalWorkingServices, setOriginalWorkingServices] = useState<WorkingService[]>([]);
    const [applicationData, setApplicationData] = useState<any>(null);
    const [errorModalOpen, setErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [expandedTransactions, setExpandedTransactions] = useState<number[]>([]);
    const [showSuccessNotification, setShowSuccessNotification] = useState(false);

    useEffect(() => {
      const fetchData = async () => {
        try {
          const [appResponse, servicesResponse] = await Promise.all([
            api.get(`/application/${id}/`),
            api.get('/keeping_service/keeping_service_name/')
          ]);

          setApplication(appResponse.data);
          setApplicationData(appResponse.data);
          setServiceTypes(servicesResponse.data.results);
          setOriginalWorkingServices(appResponse.data.working_services as WorkingService[]);

          const initialAmounts: Record<number, number> = {};
          appResponse.data.keeping_services.forEach((service: KeepingService) => {
            initialAmounts[service.service_type_id] = service.amount; 
          });
          setAmounts(initialAmounts);

          const initialWorkingAmounts: Record<number, number> = {};
          appResponse.data.working_services.forEach((service: WorkingService) => {
            initialWorkingAmounts[service.service_id] = service.quantity;
          });
          setWorkingAmounts(initialWorkingAmounts);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      };

      if (id) {
        fetchData();
      }
    }, [id]);

    useEffect(() => {
      const fetchTransactionHistory = async () => {
        try {
          const response = await api.get(`/transactions/history/${id}`);
          setTransactionHistory(response.data);
        } catch (error) {
          console.error('Error fetching transaction history:', error);
        }
      };

      if (id) {
        fetchTransactionHistory();
      }
    }, [id]);

    useEffect(() => {
      const fetchProducts = async () => {
        try {
          const productIds = new Set(
            transactionHistory.flatMap(transaction => 
              transaction.products.map(product => product.product.id)
            )
          );

          const productPromises = Array.from(productIds).map(id =>
            api.get(`/items/product/${id}/`)
          );

          const responses = await Promise.all(productPromises);
          const productsMap = responses.reduce((acc, response) => ({
            ...acc,
            [response.data.id]: response.data
          }), {});

          setProducts(productsMap);
        } catch (error) {
          console.error('Error fetching products:', error);
        }
      };

      if (transactionHistory.length > 0) {
        fetchProducts();
      }
    }, [transactionHistory]);

    useEffect(() => {
      const fetchPaymentMethods = async () => {
        try {
          const response = await api.get('/payment_method/');
          setPaymentMethods(response.data.results);
        } catch (error) {
          console.error('Error fetching payment methods:', error);
        }
      };

      fetchPaymentMethods();
    }, []);

    useEffect(() => {
      const fetchPayments = async () => {
        if (!id) return;
        try {
          const response = await api.get(`/application/pay/?application=${id}`);
          const filteredPayments = response.data.results.filter(
            (payment: Payment) => payment.application === Number(id)
          );
          setPayments(filteredPayments);
        } catch (error) {
          console.error('Error fetching payments:', error);
        }
      };

      fetchPayments();
    }, [id]);

    useEffect(() => {
      const fetchWorkingServices = async () => {
        try {
          const response = await api.get('/working_service/name/');
          setWorkingServiceTypes(response.data.results);
        } catch (error) {
          console.error('Error fetching working service types:', error);
        }
      };

      fetchWorkingServices();
    }, []);

    useEffect(() => {
      if (activeTab === 'payments' && applicationData?.total_price) {
        setNewPayment(prev => ({
          ...prev,
          amount: applicationData.total_price.toString()
        }));
      }
    }, [activeTab, applicationData]);

  

    const handleAmountChange = (serviceTypeId: number, amount: number) => {
      const originalService = application?.keeping_services.find(
        service => service.service_type_id === serviceTypeId
      );

      if (originalService && amount <= originalService.amount) {
        setAmounts(prev => ({
          ...prev,
          [serviceTypeId]: amount
        }));
      }
    };

    const handleWorkingAmountChange = (serviceTypeId: number, amount: number) => {
      if (amount >= 0) {
        setWorkingAmounts(prev => ({
          ...prev,
          [serviceTypeId]: amount
        }));
      }
    };

    const handleCalculate = async () => {
      if (!application) return;

      setLoading(true);
      try {
        const keepingServices = Object.entries(amounts).map(([serviceTypeId, amount]) => ({
          service_type_id: Number(serviceTypeId),
          amount
        }));

        const workingServices = Object.entries(workingAmounts)
          .filter(([, amount]) => amount > 0) 
          .map(([serviceId, amount]) => ({
            service_type_id: Number(serviceId),
            amount
          }));

        const response = await api.post(`/keeping_service/service_calculate/${id}/`, {
          keeping_services: keepingServices,
          working_services: workingServices 
        });

        if (response.data) {
          const mappedWorkingServices = response.data.working_services
            .filter((service: any) => workingAmounts[service.service_type_id] > 0)
            .map((service: any) => {
              const originalService = application.working_services.find(
                ws => ws.service_id === service.service_type_id
              );
              return {
                ...service,
                service_name: originalService?.service_name || service.service_name,
                amount: workingAmounts[service.service_type_id] || 0,
                requested_amount: workingAmounts[service.service_type_id] || 0,
                total_amount: service.total_amount
              };
            });

          setCalculationResult({
            ...response.data,
            working_services: mappedWorkingServices
          });

          dispatch(setCalculatedServices({
            services: response.data.keeping_services,
            working_services: mappedWorkingServices,
            total_price: response.data.total_price
          }));
        }
      } catch (error) {
        console.error('Error calculating services:', error);
      } finally {
        setLoading(false);
      }
    };

    const handleProceedToTransaction = () => {
      if (calculationResult) {
        console.log('Proceeding to transaction with:', {
          keeping_services: calculationResult.keeping_services,
          working_services: calculationResult.working_services,
          total_price: calculationResult.total_price
        });
        
        dispatch(setCalculatedServices({
          services: calculationResult.keeping_services,
          working_services: calculationResult.working_services,
          total_price: calculationResult.total_price
        }));
        dispatch(setApplicationId(Number(id)));
        navigate('/transaction');
      }
    };

    const handlePaymentSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const payload = {
          application: Number(id),
          payment_method: newPayment.payment_method,
          amount: newPayment.amount,
          comment: newPayment.comment
        };

        await api.post('/application/pay/', payload);
        
          const [appResponse, paymentsResponse] = await Promise.all([
          api.get(`/application/${id}/`),
          api.get(`/application/pay/?application=${id}`)
        ]);

        setApplicationData(appResponse.data);
        
        const filteredPayments = paymentsResponse.data.results.filter(
          (payment: Payment) => payment.application === Number(id)
        );
        setPayments(filteredPayments);
        
        if (appResponse.data.total_price === 0) {
          setShowSuccessNotification(true);
          setTimeout(() => {
            setShowSuccessNotification(false);
          }, 5000);
        }
        
        setNewPayment({
          payment_method: 1,
          amount: "",
          comment: ""
        });
      } catch (error: any) {
        console.error('Error submitting payment:', error);
        if (error.response?.data?.amount) {
          setErrorMessage(error.response.data.amount.join(' '));
          setErrorModalOpen(true);
        } else {
          setErrorMessage('An error occurred while submitting the payment.');
          setErrorModalOpen(true);
        }
      }
    };

    const toggleTransaction = (transactionId: number) => {
      setExpandedTransactions(prev => 
        prev.includes(transactionId) 
          ? prev.filter(id => id !== transactionId)
          : [...prev, transactionId]
      );
    };

   

    return (
      <div className="p-6 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(`/edit-application/${id}`)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            title={t('common.back')}
          >
            <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
          <h1 className="text-2xl font-semibold">
            {t('calculateServices.title', 'Calculate Services')}
          </h1>
        </div>

        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-4">
            <button
              className={`py-2 px-4 ${
                activeTab === 'calculate'
                  ? 'border-b-2 border-[#6C5DD3] text-[#6C5DD3]'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('calculate')}
            >
              {t('calculateServices.calculate', )}
            </button>
            <button
              className={`py-2 px-4 ${
                activeTab === 'history'
                  ? 'border-b-2 border-[#6C5DD3] text-[#6C5DD3]'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('history')}
            >
              {t('calculateServices.history', 'Transaction History')}
            </button>
            <button
              className={`py-2 px-4 ${
                activeTab === 'payments'
                  ? 'border-b-2 border-[#6C5DD3] text-[#6C5DD3]'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('payments')}
            >
              {t('calculateServices.payments', 'Payments')}
            </button>
          </div>
        </div>

        {activeTab === 'calculate' ? (
          <>
            {(!application?.keeping_services.some(service => service.amount > 0) &&
             !application?.working_services.some(service => service.quantity > 0) &&
             applicationData?.total_price > 0) && (
              <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      {t('calculateServices.unpaidAmount', 'You have unpaid amount')}: {applicationData?.total_price} сум
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('payments')}
                    className="text-sm font-medium text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300"
                  >
                    {t('calculateServices.goToPayments', 'Go to Payments')} →
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h2 className="text-lg font-medium mb-4">
                    {t('calculateServices.applicationServices', 'Application Services')}
                  </h2>
                  
                  <div className="max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                    {application?.keeping_services.some(service => service.amount > 0) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {application.keeping_services
                          .filter(service => service.amount > 0)
                          .map((service) => {
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
                                        bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100
                                        focus:ring-[#6C5DD3] dark:focus:ring-[#8B7BE8] focus:border-[#6C5DD3] dark:focus:border-[#8B7BE8]"
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}

                    {application?.working_services.some(service => service.quantity > 0) && (
                      <div className="mt-6">
                        <h3 className="text-lg font-medium mb-4">
                          {t('calculateServices.workingServices', 'Working Services')}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(application.working_services as WorkingService[])
                            .filter(service => service.quantity > 0)
                            .map((service) => (
                              <div 
                                key={service.id}
                                className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
                              >
                                <div className="flex flex-col space-y-2">
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {service.service_name}
                                  </label>
                                  <div className="flex items-center justify-between space-x-4">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {t('calculateServices.maxAmount', 'Max amount')}: {service.quantity}
                                    </span>
                                    <input
                                      type="number"
                                      min="0"
                                      max={service.quantity}
                                      value={workingAmounts[service.service_id] || 0}
                                      onChange={(e) => handleWorkingAmountChange(service.service_id, parseInt(e.target.value) || 0)}
                                      className="w-24 rounded-md border border-gray-300 dark:border-gray-600 
                                        bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100
                                        focus:ring-[#6C5DD3] dark:focus:ring-[#8B7BE8] focus:border-[#6C5DD3] dark:focus:border-[#8B7BE8]"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {(!application?.keeping_services.some(service => service.amount > 0) && 
                     !application?.working_services.some(service => service.quantity > 0)) && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        {t('calculateServices.noServicesAvailable')}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleCalculate}
                    disabled={
                      loading || 
                      (!application?.keeping_services.some(service => service.amount > 0) &&
                       !application?.working_services.some(service => service.quantity > 0))
                    }
                    className="mt-6 w-full bg-[#6C5DD3] text-white px-4 py-2 rounded-lg
                      hover:bg-[#5c4eb3] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? t('common.calculating') : t('calculateServices.calculate')}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-1">
                {calculationResult && calculationResult.keeping_services ? (
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow sticky top-6">
                    <h2 className="text-lg font-medium mb-4">
                      {t('calculateServices.results', 'Calculation Results')}
                    </h2>

                    <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-2">
                      {calculationResult.keeping_services
                        .filter(service => service && service.requested_amount > 0)
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

                      {calculationResult.working_services
                        .filter(service => service.total_amount > 0 || service.price > 0)
                        .map((service, index) => {
                          const requestedAmount = workingAmounts[service.service_type_id];
                          console.log('Result service:', service);
                          console.log('Available types:', workingServiceTypes);
                          
                          const serviceType = workingServiceTypes.find(st => 
                            st.id === service.service_type_id || 
                            st.id === originalWorkingServices.find(ows => ows.service_id === service.service_type_id)?.service_id
                          );
                          
                          return (
                            <div 
                              key={`working-${index}`} 
                              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
                            >
                              <h3 className="font-medium text-[#6C5DD3] dark:text-[#8B7BE8] mb-2">
                                {serviceType?.service_name || service.service_name || `Service ${service.service_type_id}`}
                              </h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>{t('calculateServices.requestedAmount')}:</span>
                                  <span className="font-medium">{requestedAmount}</span>
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
                          );
                        })}

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
                      disabled={
                        !calculationResult ||
                        (!calculationResult.keeping_services.some(service => service.requested_amount > 0) && 
                        !calculationResult.working_services.some(service => service.total_amount > 0 || service.price > 0))
                      }
                      className="mt-6 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 
                        disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {t('calculateServices.proceedToTransaction', 'Proceed to Transaction')}
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 text-center text-gray-500 dark:text-gray-400">
                    {t('calculateServices.noResults',)}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : activeTab === 'history' ? (
          <div className="space-y-4">
            {transactionHistory.length === 0 ? (
              <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  {t('calculateServices.noHistory',)}
                </p>
              </div>
            ) : (
              transactionHistory.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <button
                    onClick={() => toggleTransaction(transaction.id)}
                    className="w-full text-left px-6 py-4 bg-gray-50 dark:bg-gray-800"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <ChevronDownIcon 
                          className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 
                            ${expandedTransactions.includes(transaction.id) ? 'transform rotate-180' : ''}`}
                        />
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            {t('transaction.transactionId',)} #{transaction.id}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {transaction.full_name} • {transaction.car_number}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(transaction.date_of_transaction).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </button>

                  {expandedTransactions.includes(transaction.id) && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                      {/* Customer Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {t('transaction.fullName', 'Full Name')}
                          </p>
                          <p className="text-gray-900 dark:text-gray-100">{transaction.full_name}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {t('transaction.phoneNumber', 'Phone Number')}
                          </p>
                          <p className="text-gray-900 dark:text-gray-100">{transaction.phone_number}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            {t('transaction.carNumber', 'Car Number')}
                          </p>
                          <p className="text-gray-900 dark:text-gray-100">{transaction.car_number}</p>
                        </div>
                      </div>

                      {/* Services Section */}
                      {(transaction.keeping_services.length > 0 || transaction.working_services.length > 0) && (
                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                            {t('transaction.services', 'Services')}
                          </h4>
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                            {transaction.keeping_services.map((service, index) => (
                              <div 
                                key={`keeping-${index}`} 
                                className="flex justify-between items-center text-sm border-b last:border-0 border-gray-200 dark:border-gray-600 pb-2 last:pb-0"
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-900 dark:text-gray-100">
                                    {serviceTypes.find(st => st.id === service.service_type)?.name || 
                                      `Service ${service.service_type}`}
                                  </span>
                                  <span className="text-gray-500 dark:text-gray-400">
                                    × {service.amount}
                                  </span>
                                </div>
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  {Number(service.price).toLocaleString()} сум
                                </span>
                              </div>
                            ))}
                            
                            {transaction.working_services.map((service, index) => (
                              <div 
                                key={`working-${index}`} 
                                className="flex justify-between items-center text-sm border-b last:border-0 border-gray-200 dark:border-gray-600 pb-2 last:pb-0"
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-900 dark:text-gray-100">
                                    {workingServiceTypes.find(st => st.id === service.service_type)?.service_name || 
                                      `Working Service ${service.service_type}`}
                                  </span>
                                  <span className="text-gray-500 dark:text-gray-400">
                                    × {service.quantity}
                                  </span>
                                </div>
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                  {Number(service.price).toLocaleString()} сум
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Products Section */}
                      {transaction.products.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                            {t('transaction.products', 'Products')}
                          </h4>
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                            {transaction.products.map((item, index) => (
                              <div 
                                key={index} 
                                className="flex justify-between items-center text-sm border-b last:border-0 border-gray-200 dark:border-gray-600 pb-2 last:pb-0"
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="text-gray-900 dark:text-gray-100">
                                    {item.product.name}
                                  </span>
                                  <span className="text-gray-500 dark:text-gray-400">
                                    × {item.quantity}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <p className="text-gray-900 dark:text-gray-100">
                                    {item.storage.storage_name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {item.storage.storage_location}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {applicationData && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-medium">
                    {t('calculateServices.totalAmount')}:
                  </h2>
                  <span className={`text-xl font-bold ${
                    applicationData.total_price === 0
                      ? 'text-green-500'
                      : 'text-[#6C5DD3]'
                  }`}>
                    {(applicationData.total_price || 0).toLocaleString()} сум
                  </span>
                </div>
                <div className="mt-2 text-sm">
                  <span className="font-medium">{t('payments.status', 'Status')}:</span>
                  <span className={`ml-2 ${
                    applicationData.total_price === 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {applicationData.total_price === 0 
                      ? t('calculateServices.fullyPaid', )
                      : t('calculateServices.unpaid')}
                  </span>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium mb-4">
                {t('calculateServices.newPayment', )}
              </h2>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select
                    value={newPayment.payment_method}
                    onChange={(e) => setNewPayment(prev => ({
                      ...prev,
                      payment_method: Number(e.target.value)
                    }))}
                    className="rounded-md border border-gray-300 dark:border-gray-600 
                      bg-white dark:bg-gray-700 p-2 text-gray-900 dark:text-gray-100
                      focus:ring-[#6C5DD3] dark:focus:ring-[#8B7BE8] focus:border-[#6C5DD3] dark:focus:border-[#8B7BE8]"
                  >
                    {paymentMethods.map((method) => (
                      <option 
                        key={method.id} 
                        value={method.id}
                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        {method.payment_method}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment(prev => ({
                      ...prev,
                      amount: e.target.value
                    }))}
                    className="rounded-md border border-gray-300 dark:border-gray-600 
                      bg-white dark:bg-gray-700 p-2 text-gray-900 dark:text-gray-100
                      focus:ring-[#6C5DD3] dark:focus:ring-[#8B7BE8] focus:border-[#6C5DD3] dark:focus:border-[#8B7BE8]
                      placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder={t('calculateServices.amount',)}
                    required
                  />
                  <input
                    type="text"
                    value={newPayment.comment}
                    onChange={(e) => setNewPayment(prev => ({
                      ...prev,
                      comment: e.target.value
                    }))}
                    className="rounded-md border border-gray-300 dark:border-gray-600 
                      bg-white dark:bg-gray-700 p-2 text-gray-900 dark:text-gray-100
                      focus:ring-[#6C5DD3] dark:focus:ring-[#8B7BE8] focus:border-[#6C5DD3] dark:focus:border-[#8B7BE8]
                      placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder={t('calculateServices.comment', 'Comment (optional)')}
                  />
                </div>
                <button
                  type="submit"
                  className="bg-[#6C5DD3] text-white px-4 py-2 rounded-lg hover:bg-[#5c4eb3]"
                >
                  {t('calculateServices.submit', )}
                </button>
              </form>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium mb-4">
                {t('calculateServices.history', )}
              </h2>
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <span className="font-medium">
                        {paymentMethods.find(m => m.id === payment.payment_method)?.payment_method}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        {new Date(payment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="font-medium">{payment.amount} сум</span>
                      {payment.comment && (
                        <span className="text-sm text-gray-500">({payment.comment})</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Success Notification */}
        {showSuccessNotification && (
          <div className="fixed bottom-4 right-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 shadow-lg max-w-md animate-slide-up">
            <div className="flex items-center space-x-3">
              <svg 
                className="h-6 w-6 text-green-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  {t('calculateServices.paymentSuccess')}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {t('calculateServices.fullyPaidMessage',)}
                </p>
              </div>
              <button
                onClick={() => setShowSuccessNotification(false)}
                className="text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path 
                    fillRule="evenodd" 
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                    clipRule="evenodd" 
                  />
                </svg>
              </button>
            </div>
          </div>
        )}

        <ErrorModal
          isOpen={errorModalOpen}
          onClose={() => setErrorModalOpen(false)}
          message={errorMessage}
          // className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
      </div>
    );
  }