import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { api } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { clearTransaction } from '../storage/slice';
import SuccessModal from '../components/SuccessModal';

interface Payment {
  payment_method: number;
  amount: number;
  comment: string;
}

interface PaymentMethod {
  id: number;
  payment_method: string;
}

interface Product {
  product_id: number;
  quantity: number;
  storage_id: number;
  selected?: boolean;
  name?: string;
}

interface Service {
  service_type_id: number;
  service_name: string;
  total_amount: number;
  requested_amount: number;
  price: number;
}

interface CalculatedService {
  service_type_id: number;
  service_name: string;
  total_amount: number;
  requested_amount: number;
  price: number;
}

interface WorkingService {
  requested_amount: any;
  service_type_id: number;
  service_name: string;
  amount: number;
  price: number;
  quantity?: number;
}

export default function Transaction() {
  const { t } = useTranslation();
  const { calculatedServices = [], workingServices = [], totalPrice = 0, applicationId } = useSelector((state: any) => state.transaction);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    car_number: '',
  });
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddPayment = () => {
    setPayments(prev => {
      const currentTotal = prev.reduce((sum, payment) => sum + (payment.amount || 0), 0);
      const remainingAmount = Math.max(0, totalPrice - currentTotal);
      
      return [...prev, {
        payment_method: paymentMethods[0]?.id || 1,
        amount: remainingAmount,
        comment: ''
      }];
    });
  };

  const handlePaymentChange = (index: number, field: keyof Payment, value: any) => {
    setPayments(prev => {
      const newPayments = [...prev];
      
      if (field === 'amount') {
        newPayments[index] = { ...newPayments[index], [field]: value };
        
        if (index < newPayments.length - 1) {
          const totalExceptLast = newPayments.reduce((sum, payment, i) => 
            i === newPayments.length - 1 ? sum : sum + (payment.amount || 0), 0
          );
          
          const remainingAmount = Math.max(0, totalPrice - totalExceptLast);
          newPayments[newPayments.length - 1] = {
            ...newPayments[newPayments.length - 1],
            amount: remainingAmount
          };
        }
      } else {
        newPayments[index] = { ...newPayments[index], [field]: value };
      }
      
      return newPayments;
    });
  };

  const handleProductSelect = (productId: number) => {
    setAvailableProducts(prev => prev.map(product => ({
      ...product,
      selected: product.product_id === productId 
        ? !product.selected 
        : product.selected
    })));

    setProducts(prev => {
      const selectedProduct = availableProducts.find(p => p.product_id === productId);
      if (!selectedProduct) return prev;

      const existingIndex = prev.findIndex(p => p.product_id === productId);
      
      if (existingIndex >= 0) {
        return prev.filter(p => p.product_id !== productId);
      } else {
        return [...prev, {
          product_id: selectedProduct.product_id,
          quantity: selectedProduct.quantity,
          storage_id: selectedProduct.storage_id,
          name: selectedProduct.name
        }];
      }
    });
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
    const fetchApplicationData = async () => {
      try {
        const response = await api.get(`/application/${applicationId}/`);
        
        // First fetch the available products to get their correct IDs
        const productsResponse = await api.get('/items/product/');
        const availableProductsMap = productsResponse.data.results.reduce((acc: any, product: any) => {
          acc[product.name] = product;
          return acc;
        }, {});
        
        // Map products using the correct IDs from available products
        const productsWithDetails = response.data.products.map((product: any) => {
          const matchingProduct = availableProductsMap[product.product_name];
          return {
            product_id: matchingProduct?.id, // Use the ID from available products
            quantity: product.quantity,
            storage_id: product.storage_name === "Склад 1" ? 1 : 2,
            selected: false,
            name: product.product_name
          };
        }).filter((product: any) => product.product_id); // Only include products with valid IDs
        
        setAvailableProducts(productsWithDetails);
      } catch (error) {
        console.error('Error fetching application data:', error);
      }
    };

    if (applicationId) {
      fetchApplicationData();
    }
  }, [applicationId]);

  useEffect(() => {
    console.log('calculatedServices:', calculatedServices);
    console.log('workingServices detail:', {
      length: workingServices?.length,
      data: workingServices,
      isEmpty: !workingServices?.length
    });
    console.log('totalPrice:', totalPrice);
    
    if (!calculatedServices?.length || !applicationId) {
      console.log('Navigating to application-list due to missing data');
      navigate('/application-list');
      return;
    }
  }, [calculatedServices, workingServices, totalPrice, applicationId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log('Starting transaction submission...');
    console.log('Initial state:', {
      calculatedServices,
      workingServices,
      totalPrice,
      applicationId
    });

    try {
      const servicesToSubmit = calculatedServices
        .filter((service: Service) => service.requested_amount > 0)
        .map((service: Service) => ({
          service_type: service.service_type_id,
          amount: service.requested_amount,
          price: service.price
        }));

      const workingServicesToSubmit = workingServices && workingServices.length > 0 
        ? workingServices.map((service: WorkingService) => ({
            service_type: service.service_type_id,
            quantity: service.requested_amount,
            price: service.price
          }))
        : [];
      
      console.log('Services to submit:', servicesToSubmit);
      console.log('Working services to submit:', workingServicesToSubmit);
      
      if (servicesToSubmit.length === 0 && workingServicesToSubmit.length === 0) {
        throw new Error('At least one service is required');
      }

      console.log('Current payments:', payments);
      if (payments.length === 0) {
        throw new Error('At least one payment method is required');
      }

      const invalidPayment = payments.find(payment => payment.amount <= 0);
      if (invalidPayment) {
        throw new Error('All payments must have an amount greater than 0');
      }

      const totalPaymentAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
      console.log('Total payment amount:', totalPaymentAmount, 'Total price:', totalPrice);

      if (totalPaymentAmount !== totalPrice) {
        throw new Error(`Total payment amount (${totalPaymentAmount}) must equal total price (${totalPrice})`);
      }

      const payload = {
        ...formData,
        total_price: totalPrice,
        application_id: applicationId,
        keeping_services: servicesToSubmit,
        working_services: workingServicesToSubmit,
        products: products.map(product => ({
          product_id: product.product_id,
          storage_id: product.storage_id,
          quantity: product.quantity
        })),
        payments: payments.map(payment => ({
          payment_method: payment.payment_method,
          amount: payment.amount,
          comment: payment.comment || ''
        })),
      };
      console.log('Final payload:', payload);

      const response = await api.post('/transactions/', payload);
      console.log('Transaction created successfully:', response.data);
      
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Error creating transaction:', error);
      console.log('Error details:', {
        calculatedServices,
        workingServices,
        payments,
        products,
        formData
      });
      alert(error instanceof Error ? error.message : 'Error creating transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    dispatch(clearTransaction());
    navigate('/application-list');
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
            {/* Keeping Services */}
            {calculatedServices
              .filter((service: CalculatedService) => service.requested_amount > 0)
              .map((service: CalculatedService, index: number) => (
                <div key={`keeping-${index}`} className="flex justify-between">
                  <span>
                    {service.service_name} × {service.requested_amount}
                  </span>
                  <span>{service.price} сум</span>
                </div>
              ))}
            
            {/* Working Services */}
            {console.log('Working services before display:', workingServices)}
            {workingServices && workingServices.length > 0 && workingServices.map((service: WorkingService, index: number) => (
              <div key={`working-${index}`} className="flex justify-between">
                <span>
                  {service.service_name} × {service.amount}
                </span>
                <span>{service.price} сум</span>
              </div>
            ))}
            
            <div className="font-bold pt-4 border-t">
              {t('transaction.totalPrice', 'Total Price')}: {totalPrice} сум
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">
            {t('transaction.products', 'Products')}
          </h2>
          <div className="space-y-4">
            {availableProducts
              .filter(product => product.quantity > 0)
              .map((product) => (
                <div key={product.product_id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={product.selected || false}
                      onChange={() => handleProductSelect(product.product_id)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <div>
                      <span className="font-medium">{product.name}</span>
                      <span className="text-sm text-gray-500 ml-2">({product.quantity} units)</span>
                    </div>
                  </div>
                </div>
              ))}
            {availableProducts.filter(product => product.quantity > 0).length === 0 && (
              <p className="text-gray-500 text-center">
                {t('transaction.noProducts', 'No products available')}
              </p>
            )}
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

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleModalClose}
        title={t('transaction.success.title', 'Transaction Created')}
        message={t('transaction.success.message', 'Transaction has been successfully created')}
      />
    </div>
  );
}