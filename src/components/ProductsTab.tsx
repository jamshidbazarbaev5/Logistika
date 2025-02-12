import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/api';
import { ApplicationFormData } from '../context/FormContext';


interface Product {
  id?: number;
  quantity: number;
  product_id: number;
  storage_id: number;
  application_id?: number;
}

interface Storage {
  id: number;
  name: string;
}

interface ProductDisplay {
  id: number;
  name: string;
  measurement_id: number;
  category_id: number;
}

interface ProductsTabProps {
  formData: ApplicationFormData;
  setFormData: (data: ApplicationFormData) => void;
  products: ProductDisplay[];
  storages: Storage[];
  onSuccess: () => void;
}

const ProductsTab: React.FC<ProductsTabProps> = ({ formData, setFormData, products: initialProducts, storages, onSuccess }) => {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState<number>(0);
  const [selectedProduct, setSelectedProduct] = useState<number>(0);
  const [selectedStorage, setSelectedStorage] = useState<number>(0);
  const [productSearch, setProductSearch] = useState('');
  const [storageSearch, setStorageSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [showStorageDropdown, setShowStorageDropdown] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<ProductDisplay[]>(initialProducts);
  const productDropdownRef = useRef<HTMLDivElement>(null);
  const storageDropdownRef = useRef<HTMLDivElement>(null);

  const getProductName = (productId: number) => {
    const product = initialProducts.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  const getStorageName = (storageId: number) => {
    const storage = storages.find(s => s.id === storageId);
    return storage ? storage.name : 'Unknown Storage';
  };

  // Updated searchProducts function
  const searchProducts = async (searchTerm: string) => {
    try {
      if (!searchTerm.trim()) {
        setFilteredProducts([]);
        setShowProductDropdown(false);
        return;
      }
      const response = await api.get(`/items/product/?product_name=${searchTerm}`);
      setFilteredProducts(response.data.results || []);
      setShowProductDropdown(true);
    } catch (error) {
      console.error('Error searching products:', error);
      setFilteredProducts([]);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts(productSearch);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [productSearch]);

  const handleProductSelect = (product: ProductDisplay) => {
    setSelectedProduct(product.id);
    setProductSearch(product.name);
    setShowProductDropdown(false);
  };

  const handleStorageSelect = (storage: Storage) => {
    setSelectedStorage(storage.id);
    setStorageSearch(storage.name);
    setShowStorageDropdown(false);
  };

  const handleAddProduct = () => {
    if (!quantity || !selectedProduct || !selectedStorage) return;

    const newProduct: Product = {
      quantity,
      product_id: selectedProduct,
      storage_id: selectedStorage
    };

    setFormData({
      ...formData,
      products: [...formData.products, newProduct]
    });

    // Reset form fields
    setQuantity(0);
    setSelectedProduct(0);
    setSelectedStorage(0);
    setProductSearch('');
    setStorageSearch('');
  };
  const handleRemoveProduct = (index: number) => {
    const updatedProducts = formData.products.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      products: updatedProducts
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="relative" ref={productDropdownRef}>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            {t('editApplication.product', 'Product')}
          </label>
          <input
            type="text"
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 
              px-3 py-2 text-sm focus:border-[#6C5DD3] focus:ring-[#6C5DD3]"
            placeholder="Search for a product..."
          />
          {showProductDropdown && filteredProducts.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg 
              border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                >
                  {product.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Storage Search */}
        <div className="relative" ref={storageDropdownRef}>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            {t('editApplication.storage', 'Storage')}
          </label>
          <input
            type="text"
            value={storageSearch}
            onChange={(e) => {
              setStorageSearch(e.target.value);
              setShowStorageDropdown(true);
            }}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 
              px-3 py-2 text-sm focus:border-[#6C5DD3] focus:ring-[#6C5DD3]"
            placeholder="Search for a storage..."
          />
          {showStorageDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg 
              border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
              {storages
                .filter(storage => 
                  storage.name.toLowerCase().includes(storageSearch.toLowerCase())
                )
                .map((storage) => (
                  <div
                    key={storage.id}
                    onClick={() => handleStorageSelect(storage)}
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    {storage.name}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Quantity Input */}
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
            {t('editApplication.quantity', 'Quantity')}
          </label>
          <input
            type="number"
            min="1"
            value={quantity || ''}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 
              px-3 py-2 text-sm focus:border-[#6C5DD3] focus:ring-[#6C5DD3]"
          />
        </div>
      </div>

      {/* Add Product Button */}
      <button
        onClick={handleAddProduct}
        disabled={!selectedProduct || !selectedStorage || !quantity}
        className="px-4 py-2 bg-[#6C5DD3] text-white rounded-lg 
          disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#5b4eb3]"
      >
        {t('editApplication.addProduct', 'Add Product')}
      </button>

      {/* Products List */}
      <div className="mt-6">
        <h3 className="text-lg font-medium mb-4">
          {t('editApplication.selectedProducts', 'Selected Products')}
        </h3>
        <div className="space-y-3">
          {formData.products.map((product: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex-1">
                <span className="font-medium">
                  {getProductName(product.product_id)}
                </span>
                <span className="mx-2">-</span>
                <span className="text-gray-600 dark:text-gray-400">
                  {getStorageName(product.storage_id)}
                </span>
                <span className="ml-2 text-gray-600 dark:text-gray-400">
                  ({t('editApplication.quantity_short', 'Qty')}: {product.quantity})
                </span>
              </div>
              <button
                onClick={() => handleRemoveProduct(index)}
                className="text-red-500 hover:text-red-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Next Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={onSuccess}
          className="px-6 py-2.5 bg-[#6C5DD3] text-white rounded-lg font-medium
            hover:bg-[#5b4eb3] transition-colors duration-200 ease-in-out shadow-sm"
        >
          {t('editApplication.next', 'Next')}
        </button>
      </div>
    </div>
  );
};

export default ProductsTab;