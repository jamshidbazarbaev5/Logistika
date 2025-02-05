import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api, apiService } from "../api/api";
import SuccessModal from "../components/SuccessModal";

interface Category {
  id: number;
  name: string;
}

interface Measurement {
  id: number;
  name: string;
}

interface ProductFormData {
  name: string;
  category_id: number | null;
  description: string;
  price: number | null;
  quantity: number | null;
  measurement_id: number | null;
}

export default function CreateProduct() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    category_id: null,
    description: "",
    price: null,
    quantity: null,
    measurement_id: null,
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, measurementsData] = await Promise.all([
          apiService.getCategories(),
          apiService.getMeasurements()
        ]);
        
        const sortedCategories = [...categoriesData].sort((a, b) => 
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        );
        setCategories(sortedCategories);
        setMeasurements(measurementsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/items/product/', formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 201 || response.status === 200) {
        setFormData({
          name: "",
          category_id: null,
          description: "",
          price: null,
          quantity: null,
          measurement_id: null,
        });
        setShowSuccessModal(true);
      }
    } catch (error: any) {
      console.error('Error creating product:', error);
      let errorMessage = t('createProduct.errorMessage', 'Failed to create product. Please try again.');
      
      if (error.response?.data) {
        const serverError = error.response.data;
        errorMessage = typeof serverError === 'object' 
          ? Object.entries(serverError).map(([key, value]) => `${key}: ${value}`).join('\n')
          : serverError.toString();
      }
      
      alert(errorMessage);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? null : Number(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-gray-900">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          {t('createProduct.title', 'Create Product')}
        </h1>
        <p className="mt-1 sm:mt-2 text-sm text-gray-600 dark:text-gray-400">
          {t('createProduct.subtitle', 'Add a new product to your inventory')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full max-w-4xl">
        <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-100 dark:border-gray-700">
          <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
            {t('createProduct.productInfo', 'Product Information')}
          </h2>
          
          <div className="space-y-4">
            <div>
              <label 
                htmlFor="name" 
                className="block text-sm font-medium text-gray-600 dark:text-white"
              >
                {t('createProduct.name', 'Product Name')}
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm 
                  focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                placeholder={t('createProduct.namePlaceholder', 'Enter product name')}
                required
              />
            </div>

            <div>
              <label 
                htmlFor="category_id" 
                className="block text-sm font-medium text-gray-600 dark:text-white"
              >
                {t('createProduct.category', 'Category')}
              </label>
              <select
                name="category_id"
                id="category_id"
                value={formData.category_id || ''}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm 
                  focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                required
              >
                <option value="">{t('createProduct.selectCategory', 'Select a category')}</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label 
                htmlFor="description" 
                className="block text-sm font-medium text-gray-600 dark:text-white"
              >
                {t('createProduct.description', 'Description')}
              </label>
              <textarea
                name="description"
                id="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm 
                  focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                placeholder={t('createProduct.descriptionPlaceholder', 'Enter product description')}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label 
                  htmlFor="price" 
                  className="block text-sm font-medium text-gray-600 dark:text-white"
                >
                  {t('createProduct.price', 'Price')}
                </label>
                <input
                  type="number"
                  name="price"
                  id="price"
                  value={formData.price || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm 
                    focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                  placeholder={t('createProduct.pricePlaceholder', 'Enter price')}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label 
                  htmlFor="measurement_id" 
                  className="block text-sm font-medium text-gray-600 dark:text-white"
                >
                  {t('createProduct.measurement', 'Measurement Unit')}
                </label>
                <select
                  name="measurement_id"
                  id="measurement_id"
                  value={formData.measurement_id || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm 
                    focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                  required
                >
                  <option value="">{t('createProduct.selectMeasurement', 'Select a measurement unit')}</option>
                  {measurements.map(measurement => (
                    <option key={measurement.id} value={measurement.id}>
                      {measurement.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label 
                  htmlFor="quantity" 
                  className="block text-sm font-medium text-gray-600 dark:text-white"
                >
                  {t('createProduct.quantity', 'Quantity')}
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
                  placeholder={t('createProduct.quantityPlaceholder', 'Enter quantity')}
                  min="0"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="w-full sm:w-auto bg-[#6C5DD3] text-white px-4 py-2 text-sm rounded-lg 
              hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2"
          >
            {t('createProduct.submit', 'Create Product')}
          </button>
        </div>
      </form>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={t('createProduct.successMessage', 'Product has been created successfully!')}
      />
    </div>
  );
} 