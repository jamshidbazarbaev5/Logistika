import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/api';
import { ApplicationFormData } from '../context/FormContext';
import CreateProductModal from './CreateProductModal';

interface CreateProductResponse {
  id: number;
  name: string;
  measurement_id: number;
  category_id: number;
  tnved_code?: string;
}

interface Product {
  id?: number;
  quantity: number;
  product_id?: number;
  storage_id?: number;
  application_id?: number;
  product_name?: string;
  storage_name?: string;
}

interface Storage {
  id: number;
  storage_name: string;
  storage_location: string;
}

interface ProductDisplay {
  id: number;
  name: string;
  measurement_id: number;
  category_id: number;
  tnved_code?: string;
}

interface UploadProduct {
  quantity: number;
  product_id: number;
  storage_id: number;
}

interface MappedProduct {
  quantity: number;
  product_id: number;
  storage_id: number;
  product_name?: string;
  storage_name?: string;
  application_id?: number;
}

interface ProductsTabProps {
  formData: ApplicationFormData;
  setFormData: React.Dispatch<React.SetStateAction<ApplicationFormData>>;
  products: ProductDisplay[];
  storages: Storage[];
  onSuccess: () => void;
  readOnly?: boolean;
}

const ProductsTab: React.FC<ProductsTabProps> = ({ formData, setFormData, products: initialProducts, storages, onSuccess, readOnly = false }) => {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState<number>(0);
  const [selectedProduct, setSelectedProduct] = useState<number>(0);
  const [selectedStorage, setSelectedStorage] = useState<number>(0);
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<ProductDisplay[]>(initialProducts);
  const productDropdownRef = useRef<HTMLDivElement>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [products, setProducts] = useState<ProductDisplay[]>(initialProducts);
  const [tnvedCodeSearch, setTnvedCodeSearch] = useState('');
  const [showTnvedDropdown, setShowTnvedDropdown] = useState(false);
  const tnvedDropdownRef = useRef<HTMLDivElement>(null);

  const getProductName = (productId: number | undefined) => {
    if (!productId) return 'Unknown Product';
    const product = products.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  const getStorageName = (storageId: number | undefined) => {
    if (!storageId) return 'Unknown Storage';
    const storage = storages.find(s => s.id === storageId);
    return storage ? storage.storage_name : 'Unknown Storage';
  };

  const searchProducts = async (searchTerm: string, searchType: 'name' | 'tnved' = 'name') => {
    try {
      if (!searchTerm.trim()) {
        setFilteredProducts([]);
        setShowProductDropdown(false);
        setShowTnvedDropdown(false);
        return;
      }

      if (selectedProduct !== 0) {
        return;
      }

      const queryParam = searchType === 'name' ? 'product_name' : 'tnved_code';
      const response = await api.get(`/items/product/?${queryParam}=${searchTerm}`);
      const results = response.data.results || [];
      setFilteredProducts(results);
      
      if (searchType === 'name') {
        setShowProductDropdown(true);
        setShowTnvedDropdown(false);
      } else {
        setShowTnvedDropdown(true);
        setShowProductDropdown(false);
      }
      
      const newProducts = [...products];
      results.forEach((newProduct: ProductDisplay) => {
        if (!newProducts.some(p => p.id === newProduct.id)) {
          newProducts.push(newProduct);
        }
      });
      setProducts(newProducts);
    } catch (error) {
      console.error('Error searching products:', error);
      setFilteredProducts([]);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts(productSearch, 'name');
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [productSearch]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts(tnvedCodeSearch, 'tnved');
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [tnvedCodeSearch]);

  useEffect(() => {
    if (formData.products && formData.products.length > 0) {
      const updatedProducts = [...initialProducts];
      
      if (!readOnly) {
        const uploadProducts = formData.products
          .map(product => {
            const productId = product.id || product.product_id;
            if (!productId || !product.storage_id) return null;
            return {
              quantity: product.quantity,
              product_id: productId,
              storage_id: product.storage_id
            };
          })
          .filter((product): product is UploadProduct => product !== null);

        setFormData(prev => ({
          ...prev,
          upload_products: uploadProducts
        }));
      }

      formData.products.forEach((product: Product) => {
        if (product.product_id || product.id) {
          const productId = product.id || product.product_id;
          const existingProduct = initialProducts.find(p => p.id === productId);
          if (!existingProduct && productId) {
            updatedProducts.push({
              id: productId,
              name: product.product_name || 'Unknown Product',
              measurement_id: 0,
              category_id: 0,
            });
          }
        }
      });
      setProducts(updatedProducts);
    }
  }, [formData.products, initialProducts, readOnly]);

  const handleProductSelect = (product: ProductDisplay) => {
    setSelectedProduct(product.id);
    setProductSearch(product.name);
    setTnvedCodeSearch(product.tnved_code || '');
    setShowProductDropdown(false);
    setShowTnvedDropdown(false);
  };

  const handleAddProduct = () => {
    if (!quantity || !selectedProduct || !selectedStorage) return;

    console.log('Current formData.products:', formData.products);
    console.log('Current formData.upload_products:', formData.upload_products);

    const isDuplicate = formData.products.some(
      (product: Product) => 
        (product.product_id === selectedProduct || product.id === selectedProduct) && 
        product.storage_id === selectedStorage
    );

    if (isDuplicate) {
      console.log('Product already exists in this storage');
      return;
    }

    const newProduct: MappedProduct = {
      quantity,
      product_id: selectedProduct,
      storage_id: selectedStorage,
      application_id: formData.id,
      product_name: getProductName(selectedProduct),
      storage_name: getStorageName(selectedStorage)
    };

    setFormData((prev: ApplicationFormData): ApplicationFormData => {
      // Handle existing products
      const existingProducts = prev.products.map((product: Product): MappedProduct | null => {
        const productFromList = products.find(p => 
          p.name === product.product_name || 
          p.id === (product.product_id || product.id)
        );
        
        const storage = storages.find(s => s.storage_name === product.storage_name);
        const storage_id = storage?.id || product.storage_id;
        const product_id = productFromList?.id || product.product_id || product.id;

        if (!storage_id || !product_id) {
          console.warn('Missing required ID for product:', product);
          return null;
        }

        return {
          quantity: product.quantity,
          application_id: product.application_id,
          product_id,
          storage_id,
          product_name: product.product_name,
          storage_name: product.storage_name
        };
      }).filter((product): product is MappedProduct => product !== null);

      const updatedFormData: ApplicationFormData = {
        ...prev,
        products: [...existingProducts, newProduct],
        upload_products: prev.upload_products
      };

      console.log('Final updated formData:', updatedFormData);
      return updatedFormData;
    });

    // Reset form fields
    setQuantity(0);
    setSelectedProduct(0);
    setSelectedStorage(0);
    setProductSearch('');
  };

  const handleRemoveProduct = (index: number) => {
    setFormData(prev => {
      const existingProducts = Array.isArray(prev.products) ? [...prev.products] : [];
      const existingUploadProducts = Array.isArray(prev.upload_products) ? [...prev.upload_products] : [];
      
      const updatedProducts = existingProducts.filter((_, i) => i !== index);
      const updatedUploadProducts = existingUploadProducts.filter((_, i) => i !== index);

      return {
        ...prev,
        products: updatedProducts,
        upload_products: updatedUploadProducts
      };
    });
  };

  const handleCreateProductSuccess = (newProduct: CreateProductResponse) => {
    setProducts(prev => [...prev, newProduct]);
    setFilteredProducts(prev => [...prev, newProduct]);
    handleProductSelect(newProduct);
  };

  const handleInputClick = () => {
    if (selectedProduct === 0) {
      setShowProductDropdown(true);
    }
  };

  const clearProductInputs = () => {
    setProductSearch('');
    setTnvedCodeSearch('');
    setSelectedProduct(0);
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg shadow-sm">
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        <div className="space-y-2 sm:space-y-4">
          <label className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
            {t('editApplication.product')}
          </label>
          <div className="relative" ref={productDropdownRef}>
            <input
              type="text"
              value={productSearch}
              onChange={(e) => {
                setProductSearch(e.target.value);
                if (selectedProduct !== 0) {
                  clearProductInputs();
                }
              }}
              onClick={handleInputClick}
              className={`w-full rounded-md border border-gray-300 dark:border-gray-600 
                px-3 py-2 text-sm focus:border-[#6C5DD3] focus:ring-[#6C5DD3]
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${readOnly ? 'cursor-not-allowed bg-gray-50' : ''}`}
              placeholder={t('editApplication.searchProduct')}
              readOnly={readOnly}
              disabled={readOnly}
            />
            {showProductDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg 
                border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer
                        text-gray-900 dark:text-gray-100"
                    >
                      {product.name}
                    </div>
                  ))
                ) : (
                  <div
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer
                      text-gray-900 dark:text-gray-100"
                  >
                    {t('createProduct.createNew', 'Create new product')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="space-y-2 sm:space-y-4">
          <label className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
            {t('editApplication.tnvedCode')}
          </label>
          <div className="relative" ref={tnvedDropdownRef}>
            <input
              type="text"
              value={tnvedCodeSearch}
              onChange={(e) => {
                setTnvedCodeSearch(e.target.value);
                if (selectedProduct !== 0) {
                  clearProductInputs();
                }
              }}
              onClick={() => {
                if (selectedProduct === 0) {
                  setShowTnvedDropdown(true);
                }
              }}
              className={`w-full rounded-md border border-gray-300 dark:border-gray-600 
                px-3 py-2 text-sm focus:border-[#6C5DD3] focus:ring-[#6C5DD3]
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${readOnly ? 'cursor-not-allowed bg-gray-50' : ''}`}
              placeholder={t('editApplication.tnvedCodePlaceholder')}
              readOnly={readOnly}
              disabled={readOnly}
            />
            {showTnvedDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg 
                border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer
                        text-gray-900 dark:text-gray-100"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{product.name}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {t('editApplication.tnvedCode')}: {product.tnved_code}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer
                      text-gray-900 dark:text-gray-100"
                  >
                    {t('createProduct.createNew', 'Create new product')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>


        <div className="space-y-2 sm:space-y-4">
          <label className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
            {t('editApplication.storage')}
          </label>
          <select
            value={selectedStorage}
            onChange={(e) => setSelectedStorage(Number(e.target.value))}
            className={`w-full rounded-md border border-gray-300 dark:border-gray-600 
              px-3 py-2 text-sm focus:border-[#6C5DD3] focus:ring-[#6C5DD3]
              bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${readOnly ? 'cursor-not-allowed bg-gray-50' : ''}`}
            disabled={readOnly}
          >
            <option value={0} className="dark:bg-gray-700">{t('editApplication.selectStorage')}</option>
            {storages.map((storage) => (
              <option key={storage.id} value={storage.id} className="dark:bg-gray-700">
                {storage.storage_name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 sm:space-y-4">
          <label className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
            {t('editApplication.quantity')}
          </label>
          <div className="flex gap-4">
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className={`flex-1 rounded-md border border-gray-300 dark:border-gray-600 
                px-3 py-2 text-sm focus:border-[#6C5DD3] focus:ring-[#6C5DD3]
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ${readOnly ? 'cursor-not-allowed bg-gray-50' : ''}`}
              disabled={readOnly}
            />
            <button
              onClick={handleAddProduct}
              disabled={!quantity || !selectedProduct || !selectedStorage || readOnly}
              className={`px-6 py-2 bg-[#6C5DD3] text-white rounded-lg font-medium
                hover:bg-[#5b4eb3] disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200 ease-in-out shadow-sm whitespace-nowrap ${readOnly ? 'cursor-not-allowed bg-gray-50' : ''}`}
            >
              {t('editApplication.addProduct')}
            </button>
          </div>
        </div>

       
        <div className="space-y-3">
          {formData.products.map((product: Product, index: number) => (
            <div key={index} 
              className="flex flex-col sm:flex-row sm:items-center justify-between 
                p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs sm:text-sm"
            >
              <div className="flex-1 mb-2 sm:mb-0">
                <span className="block sm:inline font-medium">
                  {product.product_name || getProductName(product.product_id)}
                </span>
                <span className="block sm:inline sm:mx-2">-</span>
                <span className="text-gray-600 dark:text-gray-400">
                  {product.storage_name || getStorageName(product.storage_id)}
                </span>
              </div>
              <div className="flex items-center justify-between sm:justify-end">
                <span className="text-gray-600 dark:text-gray-400">
                   {t('editApplication.quantity')} {product.quantity}
                </span>
                <button
                  onClick={() => handleRemoveProduct(index)}
                  className="ml-3 p-1 text-red-500 hover:text-red-700"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <CreateProductModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateProductSuccess}
        initialProductName={productSearch}
        initialTnvedCode={tnvedCodeSearch}
      />

      {!readOnly && (
        <div className="mt-6 flex justify-end">
          <button
            onClick={onSuccess}
            className="px-6 py-2.5 bg-[#6C5DD3] text-white rounded-lg font-medium
              hover:bg-[#5b4eb3] transition-colors duration-200 ease-in-out shadow-sm"
          >
            {t('editApplication.next', 'Next')}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductsTab;