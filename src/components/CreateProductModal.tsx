import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/api';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (product: CreateProductResponse) => void;
  initialProductName: string;
}

interface CreateProductResponse {
  id: number;
  name: string;
  measurement_id: number;
  category_id: number;
}

interface Category {
  id: number;
  name: string;
}

interface Measurement {
  id: number;
  name: string;
}

export default function CreateProductModal({
  isOpen,
  onClose,
  onSuccess,
  initialProductName
}: CreateProductModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: initialProductName,
    category_id: '',
    measurement_id: '',
    description: ''
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, measurementsRes] = await Promise.all([
          api.get('/items/category/'),
          api.get('/items/measurement/')
        ]);
        setCategories(categoriesRes.data.results || []);
        setMeasurements(measurementsRes.data.results || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(t('createProduct.fetchError'));
      }
    };
    fetchData();
  }, [t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/items/product/', formData);
      onSuccess(response.data);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || t('createProduct.createError'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  {t('createProduct.title')}
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t('createProduct.name')}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#6C5DD3] focus:ring-[#6C5DD3]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t('createProduct.category')}
                    </label>
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#6C5DD3] focus:ring-[#6C5DD3]"
                      required
                    >
                      <option value="">{t('createProduct.selectCategory')}</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t('createProduct.measurement')}
                    </label>
                    <select
                      name="measurement_id"
                      value={formData.measurement_id}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#6C5DD3] focus:ring-[#6C5DD3]"
                      required
                    >
                      <option value="">{t('createProduct.selectMeasurement')}</option>
                      {measurements.map(measurement => (
                        <option key={measurement.id} value={measurement.id}>
                          {measurement.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {t('createProduct.description')}
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#6C5DD3] focus:ring-[#6C5DD3]"
                    />
                  </div>

                  {error && (
                    <div className="text-red-500 text-sm">{error}</div>
                  )}

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-[#6C5DD3] rounded-md hover:bg-[#5c4eb3] disabled:opacity-50"
                    >
                      {loading ? t('common.saving') : t('common.save')}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}