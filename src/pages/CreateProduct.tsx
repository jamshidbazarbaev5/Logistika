import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { api, apiService } from "../api/api";
import SuccessModal from "../components/SuccessModal";
import FormLayout from "../components/FormLayout";
import {useNavigate} from "react-router-dom";

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
  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, measurementsData] = await Promise.all([
          apiService.getCategories(),
          apiService.getMeasurements()
        ]);
        
        const sortedCategories = [...categoriesData.results].sort((a:any, b:any) => 
          a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        );
        setCategories(sortedCategories);
        setMeasurements(measurementsData.results);
        navigate('products-list')
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
    <FormLayout
      title={t('createProduct.title')}
      subtitle={t('createProduct.subtitle')}
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full max-w-7xl mx-auto px-4 sm:px-6">
        <div className=" dark:bg-gray-800 p-4 sm:p-6 lg:p-8 rounded-lg shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="col-span-1 sm:col-span-2 lg:col-span-1">
              <label 
                htmlFor="name" 
                className="block text-sm font-medium text-gray-600 dark:text-white mb-1"
              >
                {t('createProduct.name', 'Product Name')}
              </label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                  px-3 py-2 text-sm md:text-base
                  focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                  placeholder:text-sm md:placeholder:text-base"
                placeholder={t('createProduct.namePlaceholder', 'Enter product name')}
                required
              />
            </div>

            <div className="col-span-1">
              <label 
                htmlFor="category_id" 
                className="block text-sm font-medium text-gray-600 dark:text-white mb-1"
              >
                {t('createProduct.category', 'Category')}
              </label>
              <select
                name="category_id"
                id="category_id"
                value={formData.category_id || ''}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                  px-3 py-2 text-sm md:text-base
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

            <div className="col-span-1 sm:col-span-2 lg:col-span-3">
              <label 
                htmlFor="description" 
                className="block text-sm font-medium text-gray-600 dark:text-white mb-1"
              >
                {t('createProduct.description', 'Description')}
              </label>
              <textarea
                name="description"
                id="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                  px-3 py-2 text-sm md:text-base
                  focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
                  placeholder:text-sm md:placeholder:text-base"
                placeholder={t('createProduct.descriptionPlaceholder', 'Enter product description')}
                required
              />
            </div>

           

            <div className="col-span-1">
              <label 
                htmlFor="measurement_id" 
                className="block text-sm font-medium text-gray-600 dark:text-white mb-1"
              >
                {t('createProduct.measurement', 'Measurement Unit')}
              </label>
              <select
                name="measurement_id"
                id="measurement_id"
                value={formData.measurement_id || ''}
                onChange={handleChange}
                className="block w-full rounded-md border border-gray-300 dark:border-gray-600 
                  bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                  px-3 py-2 text-sm md:text-base
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

          
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base
              bg-[#6C5DD3] text-white rounded-lg hover:bg-[#5c4eb3]
              focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2"
          >
            {t('createProduct.submit')}
          </button>
        </div>
      </form>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={t('createProduct.successMessage', 'Product has been created successfully!')}
      />
    </FormLayout>
  );
} 