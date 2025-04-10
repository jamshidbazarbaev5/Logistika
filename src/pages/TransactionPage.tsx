import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { api } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { clearTransaction } from '../storage/slice';
import SuccessModal from '../components/SuccessModal';
import ErrorModal from '../components/ErrorModal';
import { authService } from '../services/auth'

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
  customQuantity?: number;
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

const formatNumber = (num: number) => {
  const parts = num.toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join('.');
};

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
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
    console.log('Selecting product with ID:', productId);
    
    setAvailableProducts(prev => {
      const updated = prev.map(product => ({
        ...product,
        selected: product.product_id === productId 
          ? !product.selected 
          : product.selected
      }));
      console.log('Updated available products:', updated);
      return updated;
    });

    setProducts(prev => {
      const selectedProduct = availableProducts.find(p => p.product_id === productId);
      console.log('Selected product details:', selectedProduct);

      if (!selectedProduct) return prev;

      const existingIndex = prev.findIndex(p => p.product_id === productId);
      
      let newProducts;
      if (existingIndex >= 0) {
        newProducts = prev.filter(p => p.product_id !== productId);
      } else {
        newProducts = [...prev, {
          product_id: selectedProduct.product_id,
          quantity: selectedProduct.quantity || 1,
          storage_id: selectedProduct.storage_id,
          name: selectedProduct.name
        }];
      }
      console.log('Updated products list:', newProducts);
      return newProducts;
    });
  };

  const handleProductQuantityChange = (productId: number, quantity: number) => {
    setProducts(prev => prev.map(product => 
      product.product_id === productId 
        ? { ...product, quantity: Math.min(quantity, availableProducts.find(p => p.product_id === productId)?.quantity || 0) }
        : product
    ));
  };

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.log('No access token found');
          navigate('/login');
          return;
        }

        const response = await api.get('/payment_method/');
        console.log('Payment methods fetched:', response.data);
        setPaymentMethods(response.data.results);
      } catch (error: any) {
        console.error('Error fetching payment methods:', error);
        if (error.response?.status === 401) {
          try {
            const newToken = await authService.refreshToken();
            if (newToken) {
              const response = await api.get('/payment_method/');
              setPaymentMethods(response.data.results);
            } else {
              navigate('/login');
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            navigate('/login');
          }
        }
      }
    };
    fetchPaymentMethods();
  }, [navigate]);

  useEffect(() => {
    const fetchApplicationData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          console.log('No access token found');
          navigate('/login');
          return;
        }

        // Get application data
        const response = await api.get(`/application/${applicationId}/`);
        console.log('Application data:', response.data);
        
        setFormData({
          full_name: response.data.firm_info?.director_name || '',
          phone_number: response.data.firm_info?.phone_number || '',
          car_number: '',
        });

        // Get storage data first
        const storageResponse = await api.get('/storage/');
        console.log('Storage response:', storageResponse.data);

        // Modified storage mapping to use storage_name as key
        const storageMap = storageResponse.data.results.reduce((acc: any, storage: any) => {
          // Convert storage names to lowercase for case-insensitive comparison
          acc[storage.storage_name.toLowerCase()] = storage.id;
          console.log(`Mapping storage: ${storage.storage_name.toLowerCase()} -> ${storage.id}`);
          return acc;
        }, {});
        console.log('Complete storage mapping:', storageMap);

        // Get products data
        const productsResponse = await api.get('/items/product/');
        console.log('Products response:', productsResponse.data);
        
        const availableProductsMap = productsResponse.data.results.reduce((acc: any, product: any) => {
          acc[product.name] = product;
          return acc;
        }, {});
        
        console.log('Products from application:', response.data.products);
        
        const productsWithDetails = response.data.products
          .map((product: any) => {
            const matchingProduct = availableProductsMap[product.product_name];
            // Convert storage name to lowercase for lookup
            const storageId = storageMap[product.storage_name.toLowerCase()];
            
            console.log('Processing product:', {
              product_name: product.product_name,
              storage_name: product.storage_name,
              storage_name_lower: product.storage_name.toLowerCase(),
              matchingProduct: matchingProduct?.id,
              storageId: storageId,
              availableStorageIds: Object.values(storageMap)
            });

            if (!matchingProduct || !storageId) {
              console.log(`Skipping product ${product.product_name} - missing product or storage info`, {
                hasMatchingProduct: !!matchingProduct,
                hasStorageId: !!storageId,
                availableStorageNames: Object.keys(storageMap),
                requestedStorageName: product.storage_name.toLowerCase()
              });
              return null;
            }

            return {
              product_id: matchingProduct.id,
              quantity: product.quantity,
              storage_id: storageId,
              selected: false,
              name: product.product_name
            };
          })
          .filter((product: any) => product !== null);
        
        console.log('Final products with details:', productsWithDetails);
        setAvailableProducts(productsWithDetails);
      } catch (error: any) {
        console.error('Error fetching application data:', error);
        if (error.response?.status === 401) {
          try {
            const newToken = await authService.refreshToken();
            if (newToken) {
              fetchApplicationData();
            } else {
              navigate('/login');
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            navigate('/login');
          }
        }
      }
    };

    if (applicationId) {
      fetchApplicationData();
    }
  }, [applicationId, navigate]);

  useEffect(() => {
  // Check if we have either calculated services or working services
  const hasServices = 
    (calculatedServices?.length > 0 || workingServices?.length > 0) && 
    applicationId;

  if (!hasServices) {
    console.log('Navigating to application-list due to missing data', {
      calculatedServices,
      workingServices,
      applicationId
    });
    navigate('/application-list');
    return;
  }
}, [calculatedServices, workingServices, totalPrice, applicationId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log('Starting transaction submission...');
    console.log('Current products state:', products);
    console.log('Current available products state:', availableProducts);

    try {
      const servicesToSubmit = calculatedServices
        .filter((service: Service) => service.requested_amount > 0)
        .map((service: Service) => ({
          service_type: service.service_type_id,
          amount: service.requested_amount,
          price: Number(service.price.toFixed(2))
        }));
      console.log('Services to submit:', servicesToSubmit);

      const workingServicesToSubmit = workingServices && workingServices.length > 0 
        ? workingServices.map((service: WorkingService) => ({
            service_type: service.service_type_id,
            quantity: service.requested_amount,
            price: Number(service.price.toFixed(2))
          }))
        : [];
      console.log('Working services to submit:', workingServicesToSubmit);
      
      if (servicesToSubmit.length === 0 && workingServicesToSubmit.length === 0) {
        throw new Error('At least one service is required');
      }

      const productsPayload = products.map(product => {
        const availableProduct = availableProducts.find(p => p.product_id === product.product_id);
        console.log('Processing product for payload:', {
          product,
          availableProduct,
          matchingStorageId: availableProduct?.storage_id
        });
        return {
          product_id: product.product_id,
          storage_id: availableProduct?.storage_id, // Use the storage_id from availableProducts
          quantity: product.quantity
        };
      });
      console.log('Products payload:', productsPayload);

      const payload = {
        application_id: applicationId,
        total_price: Number(totalPrice.toFixed(2)),
        keeping_services: servicesToSubmit,
        working_services: workingServicesToSubmit,
        ...(formData.full_name && { full_name: formData.full_name }),
        ...(formData.phone_number && { phone_number: formData.phone_number }),
        ...(formData.car_number && { car_number: formData.car_number }),
        ...(products.length > 0 && { products: productsPayload }),
        ...(payments.length > 0 && {
          payments: payments.map(payment => ({
            payment_method: payment.payment_method,
            amount: payment.amount,
            comment: payment.comment || ''
          }))
        })
      };

      console.log('Final payload:', payload);
      console.log('Making API request to /transactions/...');

      const response = await api.post('/transactions/', payload);
      console.log('Transaction created successfully:', response.data);
      
      setShowSuccessModal(true);
      
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      
      let errorMsg = 'Error creating transaction';
      
      if (error.response?.data) {
        if (Array.isArray(error.response.data)) {
          errorMsg = error.response.data.join(', ');
        } else if (typeof error.response.data === 'object') {
          errorMsg = Object.entries(error.response.data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('\n');
        } else if (typeof error.response.data === 'string') {
          errorMsg = error.response.data;
        }
      } else if (error instanceof Error) {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowSuccessModal(false);
    dispatch(clearTransaction());
    navigate('/application-list');
  };
  console.log('Available products:', availableProducts);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">
        {t('transaction.title', 'Create Transaction')}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">
                {t('transaction.fullName')}
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder={t('transaction.fullNamePlaceholder')}
                className="w-full rounded-md border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">
                {t('transaction.phoneNumber')}
              </label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                placeholder={t('transaction.phoneNumberPlaceholder')}
                className="w-full rounded-md border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-200">
                {t('transaction.carNumber')}
              </label>
              <input
                type="text"
                name="car_number"
                value={formData.car_number}
                onChange={handleInputChange}
                placeholder={t('transaction.carNumberPlaceholder')}
                className="w-full rounded-md border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                  <span>{formatNumber(Number(service.price))} сум</span>
                </div>
              ))}
            
            {/* Working Services */}
            {workingServices && workingServices.length > 0 && workingServices.map((service: WorkingService, index: number) => (
              <div key={`working-${index}`} className="flex justify-between">
                <span>
                  {service.service_name} × {service.amount}
                </span>
                <span>{formatNumber(Number(service.price))} сум</span>
              </div>
            ))}
            
            <div className="font-bold pt-4 border-t">
              {t('transaction.totalPrice', 'Total Price')}: {formatNumber(totalPrice)} сум
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
                      <span className="text-sm text-gray-500 ml-2">
                        {t('transaction.availableUnits', { count: product.quantity })}
                      </span>
                    </div>
                  </div>

                  {product.selected && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        max={product.quantity}
                        value={products.find(p => p.product_id === product.product_id)?.quantity }
                        onChange={(e) => handleProductQuantityChange(product.product_id, parseFloat(e.target.value))}
                        className="w-20 rounded-md border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  )}
                </div>
              ))}
            {availableProducts.filter(product => product.quantity > 0).length === 0 && (
              <p className="text-gray-500 text-center">
                {t('transaction.noProducts')}
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
                  className="rounded-md border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">{t('transaction.selectPaymentMethod')}</option>
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
                  placeholder={t('transaction.amountPlaceholder')}
                  className="rounded-md border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <input
                  type="text"
                  value={payment.comment}
                  onChange={(e) => handlePaymentChange(index, 'comment', e.target.value)}
                  placeholder={t('transaction.commentPlaceholder')}
                  className="w-full rounded-md border p-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
        title={t('transaction.success.title', )}
        message={t('transaction.success.message', )}
      />

      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        message={errorMessage}
      />
    </div>
  );
}