import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/api";
import SuccessModal from "../components/SuccessModal";

interface Product {
  id: number;
  name: string;
  measurement_id: number;
  category_id: number;
}

interface Storage {
  id: number;
  storage_name: string;
  storage_location: string;
}

interface Application {
  id: number;
  decloration_number: string | null;
  brutto: number | null;
  coming_date: string;
  firm_id: number;
}

interface ProductQuantityFormData {
  quantity: number | null;
  product_id: number | null;
  storage_id: number | null;
  application_id: number | null;
}

export default function CreateProductQuantity() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [storages, setStorages] = useState<Storage[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [formData, setFormData] = useState<ProductQuantityFormData>({
    quantity: null,
    product_id: null,
    storage_id: null,
    application_id: null,
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, storagesRes, applicationsRes] = await Promise.all([
          api.get('/items/product/'),
          api.get('/storage/'),
          api.get('/application/'),
        ]);
        
        setProducts(productsRes.data);
        setStorages(storagesRes.data);
        setApplications(applicationsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/items/product_quantity/', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201 || response.status === 200) {
        setFormData({
          quantity: null,
          product_id: null,
          storage_id: null,
          application_id: null,
        });
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      console.error('Error creating product quantity:', error);
      let errorMessage = t('createProductQuantity.errorMessage', 'Failed to create product quantity. Please try again.');
      
      if (error.response?.data) {
        const serverError = error.response.data;
        errorMessage = typeof serverError === 'object' 
          ? Object.entries(serverError).map(([key, value]) => `${key}: ${value}`).join('\n')
          : serverError.toString();
      }
      
      alert(errorMessage);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: ['product_id', 'storage_id', 'application_id', 'quantity'].includes(name)
        ? (value === '' ? null : Number(value))
        : value
    }));
  };

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-gray-900">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          {t('createProductQuantity.title', 'Create Product Quantity')}
        </h1>
        <p className="mt-1 sm:mt-2 text-sm text-gray-600 dark:text-gray-400">
          {t('createProductQuantity.subtitle', 'Assign product quantities to storage and applications')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full max-w-4xl">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
            {t('createProductQuantity.quantityInfo', 'Quantity Information')}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label 
                htmlFor="product_id" 
                className="block text-sm font-medium text-gray-600 dark:text-gray-400"
              >
                {t('createProductQuantity.product', 'Product')}
              </label>
              <select
                name="product_id"
                id="product_id"
                value={formData.product_id || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm 
                  focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                required
              >
                <option value="">{t('createProductQuantity.selectProduct', 'Select a product')}</option>
                {products.map(product => (
                  <option key={product.name} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label 
                htmlFor="storage_id" 
                className="block text-sm font-medium text-gray-600 dark:text-gray-400"
              >
                {t('createProductQuantity.storage', 'Storage')}
              </label>
              <select
                name="storage_id"
                id="storage_id"
                value={formData.storage_id || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm 
                  focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                required
              >
                <option value="">{t('createProductQuantity.selectStorage', 'Select a storage')}</option>
                {storages.map(storage => (
                  <option key={storage.id} value={storage.id}>
                    {storage.storage_name} - {storage.storage_location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label 
                htmlFor="application_id" 
                className="block text-sm font-medium text-gray-600 dark:text-gray-400"
              >
                {t('createProductQuantity.application', 'Application')}
              </label>
              <select
                name="application_id"
                id="application_id"
                value={formData.application_id || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm 
                  focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                required
              >
                <option value="">{t('createProductQuantity.selectApplication', 'Select an application')}</option>
                {applications.map(application => (
                  <option key={application.id} value={application.id}>
                    {application.decloration_number || `Application ${application.id} (${application.coming_date})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label 
                htmlFor="quantity" 
                className="block text-sm font-medium text-gray-600 dark:text-gray-400"
              >
                {t('createProductQuantity.quantity', 'Quantity')}
              </label>
              <input
                type="number"
                name="quantity"
                id="quantity"
                value={formData.quantity || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm 
                  focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                placeholder={t('createProductQuantity.quantityPlaceholder', 'Enter quantity')}
                min="0"
                required
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto bg-[#6C5DD3] text-white px-4 py-2 text-sm rounded-lg 
              hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2"
          >
            {t('createProductQuantity.submit', 'Create Product Quantity')}
          </button>
        </div>
      </form>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={t('createProductQuantity.successMessage', 'Product quantity has been created successfully!')}
      />
    </div>
  );
} 