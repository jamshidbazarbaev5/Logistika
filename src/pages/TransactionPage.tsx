import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { api } from '../api/api';
import { useNavigate } from 'react-router-dom';

interface Payment {
  payment_method: number;
  amount: number;
  comment: string;
}

interface PaymentMethod {
  id: number;
  payment_method: string;
}

export default function Transaction() {
  const { t } = useTranslation();
  const { calculatedServices, totalPrice, applicationId } = useSelector((state: any) => state.transaction);
  const [serviceNames, setServiceNames] = useState<{ [key: number]: string }>({});
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    car_number: '',
  });
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddPayment = () => {
    setPayments(prev => [...prev, {
      payment_method: 1,
      amount: 0,
      comment: ''
    }]);
  };

  const handlePaymentChange = (index: number, field: keyof Payment, value: any) => {
    setPayments(prev => prev.map((payment, i) => 
      i === index ? { ...payment, [field]: value } : payment
    ));
  };

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
    const fetchServiceNames = async () => {
      try {
        const promises = calculatedServices
          .filter((service: any) => service.amount > 0)
          .map((service: any) => 
            api.get(`/keeping_service/keeping_service_name/${service.service_type}/`)
          );
        
        const responses = await Promise.all(promises);
        const names = responses.reduce((acc: Record<number, string>, response: any, index: number) => {
          const serviceType = calculatedServices[index].service_type;
          return {
            ...acc,
            [serviceType]: response.data.name
          };
        }, {});
        
        setServiceNames(names);
      } catch (error) {
        console.error('Error fetching service names:', error);
      }
    };

    if (calculatedServices.length > 0) {
      fetchServiceNames();
    }
  }, [calculatedServices]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Filter out services with zero amounts and validate the remaining ones
      const servicesToSubmit = calculatedServices.filter((service: any) => service.amount > 0);
      
      if (servicesToSubmit.length === 0) {
        throw new Error('At least one service with amount greater than 0 is required');
      }

      // Validate payments array is not empty
      if (payments.length === 0) {
        throw new Error('At least one payment method is required');
      }

      // Validate each payment has valid amount
      const invalidPayment = payments.find(payment => payment.amount <= 0);
      if (invalidPayment) {
        throw new Error('All payments must have an amount greater than 0');
      }

      // Calculate total payment amount
      const totalPaymentAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);

      // Validate total payment matches total price
      if (totalPaymentAmount !== totalPrice) {
        throw new Error(`Total payment amount (${totalPaymentAmount}) must equal total price (${totalPrice})`);
      }

      const payload = {
        ...formData,
        total_price: totalPrice,
        application_id: applicationId,
        keeping_services: servicesToSubmit,
        products: [],
        payments: payments.map(payment => ({
          payment_method: payment.payment_method,
          amount: payment.amount,
          comment: payment.comment || ''
        })),
      };

      await api.post('/transactions/', payload);
      navigate('/application-list');
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert(error instanceof Error ? error.message : 'Error creating transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">
        {t('transaction.title', 'Create Transaction')}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t('transaction.fullName', 'Full Name')}
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                className="w-full rounded-md border p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t('transaction.phoneNumber', 'Phone Number')}
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                placeholder="+998991234567"
                className="w-full rounded-md border p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t('transaction.carNumber', 'Car Number')}
              </label>
              <input
                type="text"
                name="car_number"
                value={formData.car_number}
                onChange={handleInputChange}
                className="w-full rounded-md border p-2"
                required
              />
            </div>
          </div>
        </div>

        {/* Services Summary */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">
            {t('transaction.services', 'Services')}
          </h2>
          <div className="space-y-4">
            {calculatedServices
              .filter((service: any) => service.amount > 0)
              .map((service: any, index: any) => (
                <div key={index} className="flex justify-between">
                  <span>{serviceNames[service.service_type] || `Service ${service.service_type}`}</span>
                  <span>{service.amount} x {service.price} = {service.amount * service.price}</span>
                </div>
              ))}
            <div className="font-bold pt-4 border-t">
              {t('transaction.totalPrice', 'Total Price')}: {totalPrice}
            </div>
          </div>
        </div>

        {/* Payments */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">
              {t('transaction.payments', 'Payments')}
            </h2>
            <button
              type="button"
              onClick={handleAddPayment}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            >
              {t('transaction.addPayment', 'Add Payment')}
            </button>
          </div>

          <div className="space-y-4">
            {payments.map((payment, index) => (
              <div key={index} className="grid grid-cols-3 gap-4">
                <select
                  value={payment.payment_method}
                  onChange={(e) => handlePaymentChange(index, 'payment_method', Number(e.target.value))}
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
                  value={payment.amount}
                  onChange={(e) => handlePaymentChange(index, 'amount', Number(e.target.value))}
                  className="rounded-md border p-2"
                  placeholder="Amount"
                />
                <input
                  type="text"
                  value={payment.comment}
                  onChange={(e) => handlePaymentChange(index, 'comment', e.target.value)}
                  className="rounded-md border p-2"
                  placeholder="Comment"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#6C5DD3] text-white px-4 py-2 rounded-lg
            hover:bg-[#5c4eb3] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t('common.saving', 'Saving...') : t('common.save', 'Save')}
        </button>
      </form>
    </div>
  );
}