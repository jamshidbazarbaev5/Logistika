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
  working_services: {
    id: number;
    quantity: number;
    price: string;
    service_id: number;
    application_id: number;
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appResponse, servicesResponse] = await Promise.all([
          api.get(`/application/${id}/`),
          api.get('/keeping_service/keeping_service_name/')
        ]);

        setApplication(appResponse.data);
        setServiceTypes(servicesResponse.data.results);
        setOriginalWorkingServices(appResponse.data.working_services);

        // Initialize amounts from existing keeping services
        const initialAmounts: Record<number, number> = {};
        appResponse.data.keeping_services.forEach((service: KeepingService) => {
          initialAmounts[service.service_type_id] = service.amount;
        });
        setAmounts(initialAmounts);

        // Initialize working amounts from working services
        const initialWorkingAmounts: Record<number, number> = {};
        appResponse.data.working_services.forEach((service: WorkingService) => {
          initialWorkingAmounts[service.service_id] = 0; // Start with 0
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
      // Format keeping services
      const keepingServices = Object.entries(amounts).map(([serviceTypeId, amount]) => ({
        service_type_id: Number(serviceTypeId),
        amount
      }));

      // Format working services, excluding those with amount 0
      const workingServices = Object.entries(workingAmounts)
        .filter(([, amount]) => amount > 0) // Only include services with amount > 0
        .map(([serviceId, amount]) => ({
          service_type_id: Number(serviceId),
          amount
        }));

      const response = await api.post(`/keeping_service/service_calculate/${id}/`, {
        keeping_services: keepingServices,
        working_services: workingServices // This will now only include non-zero amounts
      });

      console.log('API Response:', response.data);

      if (response.data) {
        // Map the response to include only the working services that had non-zero amounts
        const mappedWorkingServices = response.data.working_services
          .filter((service: any) => workingAmounts[service.service_type_id] > 0)
          .map((service: any) => {
            const originalAmount = workingAmounts[service.service_type_id];
            return {
              ...service,
              amount: originalAmount || 0,
              requested_amount: originalAmount || 0,
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
      
      // Fetch only payments for current application
      const response = await api.get(`/application/pay/?application=${id}`);
      const filteredPayments = response.data.results.filter(
        (payment: Payment) => payment.application === Number(id)
      );
      setPayments(filteredPayments);
      
      // Reset form
      setNewPayment({
        payment_method: 1,
        amount: "",
        comment: ""
      });
    } catch (error) {
      console.error('Error submitting payment:', error);
    }
  };

  const renderWorkingServices = () => (
    <div className="mt-6">
      <h3 className="text-lg font-medium mb-4">
        {t('calculateServices.workingServices', 'Working Services')}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {originalWorkingServices.map((service) => {
          const serviceType = workingServiceTypes.find(st => st.id === service.service_id);
          return (
            <div 
              key={service.id}
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div className="flex flex-col space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {serviceType?.service_name || `Service ${service.service_id}`}
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
                      bg-white dark:bg-gray-700 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">
        {t('calculateServices.title', 'Calculate Services')}
      </h1>

      <div className="mb-6 border-b">
        <div className="flex space-x-4">
          <button
            className={`py-2 px-4 ${
              activeTab === 'calculate'
                ? 'border-b-2 border-[#6C5DD3] text-[#6C5DD3]'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('calculate')}
          >
            {t('calculateServices.calculate', 'Calculate')}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-lg font-medium mb-4">
                {t('calculateServices.applicationServices', 'Application Services')}
              </h2>
              
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

                {renderWorkingServices()}
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

                  {calculationResult.working_services.map((service, index) => {
                    const requestedAmount = workingAmounts[service.service_type_id];
                    console.log(`Rendering service ${service.service_type_id}:`, {
                      workingAmounts,
                      requestedAmount,
                      service
                    });
                    
                    return (
                      <div 
                        key={`working-${index}`} 
                        className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600"
                      >
                        <h3 className="font-medium text-[#6C5DD3] dark:text-[#8B7BE8] mb-2">
                          {service.service_name} (Working)
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
                    !calculationResult.working_services.some(service => service.requested_amount > 0 || service.total_amount > 0))
                  }
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
      ) : activeTab === 'history' ? (
        <div className="space-y-4">
          {transactionHistory.map((transaction) => (
            <div
              key={transaction.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
            >
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">{t('transaction.fullName', 'Full Name')}:</p>
                  <p className="font-medium">{transaction.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('transaction.date', 'Date')}:</p>
                  <p className="font-medium">{new Date(transaction.date_of_transaction).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('transaction.phoneNumber', 'Phone Number')}:</p>
                  <p className="font-medium">{transaction.phone_number}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{t('transaction.carNumber', 'Car Number')}:</p>
                  <p className="font-medium">{transaction.car_number}</p>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-medium mb-2">{t('transaction.services', 'Services')}:</h3>
                <div className="space-y-2">
                  {transaction.keeping_services.map((service, index) => (
                    <div key={`keeping-${index}`} className="flex justify-between text-sm">
                      <span>
                        {serviceTypes.find(st => st.id === service.service_type)?.name || 
                          `Service ${service.service_type}`}
                        {' × '}{service.amount}
                      </span>
                      <span>{service.price} сум</span>
                    </div>
                  ))}
                  
                  {transaction.working_services.map((service, index) => (
                    <div key={`working-${index}`} className="flex justify-between text-sm">
                      <span>
                        {workingServiceTypes.find(st => st.id === service.service_type)?.service_name || 
                          `Working Service ${service.service_type}`}
                        {' × '}{service.quantity}
                      </span>
                      <span>{service.price} сум</span>
                    </div>
                  ))}
                </div>
              </div>

              {transaction.products.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium mb-2">{t('transaction.products', 'Products')}:</h3>
                  <div className="space-y-2">
                    {transaction.products.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>
                          {item.product.name}
                          {' × '}{item.quantity}
                        </span>
                        <span>{t('transaction.storage', 'Storage')}: {item.storage.storage_name} ({item.storage.storage_location})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4">
              {t('payments.newPayment', 'New Payment')}
            </h2>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={newPayment.payment_method}
                  onChange={(e) => setNewPayment(prev => ({
                    ...prev,
                    payment_method: Number(e.target.value)
                  }))}
                  className="rounded-md border p-2"
                >
                  {paymentMethods.map((method) => (
                    <option key={method.id} value={method.id}>
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
                  className="rounded-md border p-2"
                  placeholder={t('payments.amount', 'Amount')}
                  required
                />
                <input
                  type="text"
                  value={newPayment.comment}
                  onChange={(e) => setNewPayment(prev => ({
                    ...prev,
                    comment: e.target.value
                  }))}
                  className="rounded-md border p-2"
                  placeholder={t('payments.comment', 'Comment')}
                />
              </div>
              <button
                type="submit"
                className="bg-[#6C5DD3] text-white px-4 py-2 rounded-lg hover:bg-[#5c4eb3]"
              >
                {t('payments.submit', 'Submit Payment')}
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4">
              {t('payments.history', 'Payment History')}
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
    </div>
  );
}