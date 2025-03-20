import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api/api";
import SuccessModal from "../components/SuccessModal";
import CreateFirmModal from "../components/CreateFirmModal";
import { Tab } from '@headlessui/react';
import { classNames } from '../../utils/classNames'
import { useNavigate } from "react-router-dom";
import { createContext, useContext } from 'react';
import CreateProductModal from "../components/CreateProductModal";
import ErrorModal from '../components/ErrorModal';

interface ApplicationFormData {
  firm_id: number;
  brutto: number | null;
  netto: number | null;
  vip_application: boolean;
  total_price: number | null;
  discount_price: number | null;
  decloration_number?: string;
  decloration_date?: string;
  decloration_file?: File;
  keeping_services?: number[];
  working_services?: number[];
  upload_keeping_services_quantity: Array<{
    amount: number;
    service_type_id: number;
  }>;
  upload_working_services_quantity: Array<{
    service_id: number;
    quantity: number;
  }>;
  upload_transport: Array<{
    transport_number: string;
    transport_type: number;
  }>;
  upload_modes: Array<{
    mode_id: number;
  }>;
  upload_products: Array<{
    quantity: number;
    product_id: number;
    storage_id: number;
  }>;
  upload_photos?: File[];
  number_of_application: string;
}

interface Firm {
  id: number;
  firm_name: string}

interface PaymentMethod {
  id: number;
  payment_method: string;
}

interface KeepingService {
  id: number;
  year: number;
  base_day: number;
  base_price: string;
  extra_price: string;
  keeping_services_id: number;
}

interface WorkingService {
  id: number;
  tariff_id: number;  // Add this
  service_id: number; // Add this
  service_name: string;
  base_price: string;
  units: string;
  year: number;
}

interface Product {
  id: number;
  name: string;
  measurement_id: number;
  category_id: number;
  tnved_code: string;
}

interface TransportType {
  id: number;
  transport_type: string;
}

interface TabPanelProps {
    onSuccess?: () => void;
    onSubmit?: () => void;
    modeId?: number;
    setModeId?: (id: number) => void;
    setSelectedTab?: (index: number) => void;
}

interface FormContextType {
  formData: ApplicationFormData;
  setFormData: React.Dispatch<React.SetStateAction<ApplicationFormData>>;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within a FormContextProvider');
  }
  return context;
};

const PhotoReportTab: React.FC<TabPanelProps> = ({ onSuccess, setSelectedTab }) => {
  const { formData, setFormData } = useFormContext();
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const {t} = useTranslation();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData.firm_id) {
      setError('Please select a firm in the Basic Info tab first');
      return;
    }

    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        upload_photos: [...(prev.upload_photos || []), ...newFiles]
      }));
      
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
      
      setError(null);
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      upload_photos: (prev.upload_photos || []).filter((_, i) => i !== index)
    }));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleGoToBasicInfo = () => {
    if (setSelectedTab) {
      setSelectedTab(0);
    }
  };

  return (
    <div className="p-6 bg-transparent rounded-lg shadow-sm">
      {!formData.firm_id ? (
        <div className="text-center p-6">
          <div className="text-red-600 dark:text-red-400 mb-4">
            {t('createApplication.selectFirm')}
          </div>
          <button
            onClick={handleGoToBasicInfo}
            className="px-6 py-2.5 bg-[#6C5DD3] text-white rounded-lg font-medium
              hover:bg-[#5b4eb3] transition-colors duration-200 ease-in-out shadow-sm"
          >
            {t('createApplication.goToBasicInfo')}
          </button>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('createApplication.uploadPhotos')}
            </label>
            
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col w-full h-32 border-2 border-dashed 
                border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer 
                dark:hover:border-gray-500 transition-colors">
                <div className="flex flex-col items-center justify-center pt-7">
                  <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="pt-1 text-sm tracking-wider text-gray-400 dark:text-gray-500">
                    {t('createApplication.selectPhotos')}
                  </p>
                </div>
                <input 
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="opacity-0"
                />
              </label>
            </div>

            {error && (
              <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            {previews.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                  {t('createApplication.selectedPhotos')} ({previews.length})
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg 
                        bg-gray-200 dark:bg-gray-800">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <button
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white 
                          opacity-0 group-hover:opacity-100 dark:group-hover:opacity-75 
                          transition-opacity duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-6 pt-6 border-t dark:border-gray-700">
            <button
              onClick={handleNext}
              className="px-6 py-2.5 bg-[#6C5DD3] text-white rounded-lg font-medium
                hover:bg-[#5b4eb3] transition-colors duration-200 ease-in-out shadow-sm"
            >
              {t('createApplication.next')}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const ProductsTab: React.FC<TabPanelProps> = ({ onSuccess }) => {
  const { formData, setFormData } = useFormContext();
  const [quantity, setQuantity] = useState<number | string>('');
  const [selectedProduct, setSelectedProduct] = useState<number>(0);
  const [selectedStorage, setSelectedStorage] = useState<number>(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [productDetails, setProductDetails] = useState<Map<number, Product>>(new Map());
  const [storages, setStorages] = useState<any[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [storageSearch, setStorageSearch] = useState('');
  const [, setShowProductDropdown] = useState(false);
  const [showStorageDropdown, setShowStorageDropdown] = useState(false);
  // const productDropdownRef = useRef<HTMLDivElement>(null);
  const storageDropdownRef = useRef<HTMLDivElement>(null);
  const {t} = useTranslation();
  const [showCreateProductModal, setShowCreateProductModal] = useState(false);
  const [productNameSearch, setProductNameSearch] = useState('');
  const [tnvedCodeSearch, setTnvedCodeSearch] = useState('');
  const [showProductNameDropdown, setShowProductNameDropdown] = useState(false);
  const [showTnvedDropdown, setShowTnvedDropdown] = useState(false);
  const productNameDropdownRef = useRef<HTMLDivElement>(null);
  const tnvedDropdownRef = useRef<HTMLDivElement>(null);

  const fetchProductDetails = async (productId: number) => {
    try {
      const response = await api.get(`/items/product/${productId}/`);
      const product = response.data;
      setProductDetails(prev => new Map(prev).set(productId, product));
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  useEffect(() => {
    formData.upload_products.forEach(product => {
      if (!productDetails.has(product.product_id)) {
        fetchProductDetails(product.product_id);
      }
    });
  }, []);

  useEffect(() => {
    const fetchStorages = async () => {
      try {
        const response = await api.get('/storage/');
        setStorages(response.data.results || []);
      } catch (error) {
        console.error('Error fetching storages:', error);
      }
    };

    fetchStorages();
  }, []);

  const handleProductSelect = (product: Product) => {
    // Don't do anything if this product is already selected
    if (selectedProduct === product.id) {
      setShowProductNameDropdown(false);
      setShowTnvedDropdown(false);
      return;
    }

    setSelectedProduct(product.id);
    setProductNameSearch(product.name);
    setTnvedCodeSearch(product.tnved_code);
    setShowProductNameDropdown(false);
    setShowTnvedDropdown(false);
    setProductDetails(prev => new Map(prev).set(product.id, product));
  };

  const handleStorageSelect = (storage: any) => {
    console.log('Selecting storage:', storage); // Debug log
    setSelectedStorage(storage.id);
    setStorageSearch(storage.storage_name);
    setShowStorageDropdown(false);
  };

  const handleAddProduct = () => {
    if (!selectedProduct || !selectedStorage || !quantity) return;

    const newProduct = {
      quantity: parseFloat(quantity.toString()), // Convert to float
      product_id: selectedProduct,
      storage_id: selectedStorage
    };

    setFormData(prev => ({
      ...prev,
      upload_products: [...prev.upload_products, newProduct]
    }));

    // Reset form fields
    setQuantity('');
    setSelectedProduct(0);
    setSelectedStorage(0);
    setProductSearch('');
    setStorageSearch('');
  };

  const handleRemoveProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      upload_products: prev.upload_products.filter((_, i) => i !== index)
    }));
  };

  const getProductDetails = (productId: number, storageId: number) => {
    const product = productDetails.get(productId);
    const storage = storages.find(s => s.id === storageId);

    if (!product) {
      fetchProductDetails(productId);
    }

    return {
      productName: product?.name || 'Loading...',
      storageName: storage?.storage_name || 'Unknown Storage'
    };
  };

  const searchProducts = async (searchTerm: string) => {
    try {
      if (!searchTerm.trim()) {
        setProducts([]);
        setShowProductDropdown(false);
        return;
      }

      const existingProduct = Array.from(productDetails.values())
        .find(p => 
          p.name.toLowerCase() === searchTerm.toLowerCase() || 
          p.tnved_code === searchTerm
        );
      
      if (existingProduct) {
        setSelectedProduct(existingProduct.id);
        return;
      }

      // Search by both name and TNVED code
      const response = await api.get(`/items/product/?product_name=${searchTerm}&tnved_code=${searchTerm}`);
      const results = response.data.results || [];
      
      const exactMatch = results.find(
        (p: Product) => 
          p.name.toLowerCase() === searchTerm.toLowerCase() || 
          p.tnved_code === searchTerm
      );
      
      if (exactMatch) {
        handleProductSelect(exactMatch);
        setProducts([]);
      } else {
        setProducts(results);
        setShowProductDropdown(true);
      }
    } catch (error) {
      console.error('Error searching products:', error);
      setProducts([]);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts(productSearch);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [productSearch]);

  const handleProductCreated = (productResponse: any) => {
    // Convert CreateProductResponse to Product by adding required tnved_code
    const newProduct: Product = {
      ...productResponse,
      tnved_code: productResponse.tnved_code || '', // Add default value if missing
    };
    
    setProducts(prevProducts => [...prevProducts, newProduct]);
    handleProductSelect(newProduct);
  };

  const searchByProductName = async (searchTerm: string) => {
    try {
      if (!searchTerm.trim()) {
        setProducts([]);
        setShowProductNameDropdown(false);
        return;
      }

      // If the search term exactly matches the currently selected product, don't search
      const currentProduct = productDetails.get(selectedProduct);
      if (currentProduct?.name.toLowerCase() === searchTerm.toLowerCase()) {
        setProducts([]);
        setShowProductNameDropdown(false);
        return;
      }

      const response = await api.get(`/items/product/?product_name=${searchTerm}`);
      const results = response.data.results || [];
      setProducts(results);
      setShowProductNameDropdown(true);
    } catch (error) {
      console.error('Error searching products by name:', error);
      setProducts([]);
    }
  };

  const searchByTnvedCode = async (searchTerm: string) => {
    try {
      if (!searchTerm.trim()) {
        setProducts([]);
        setShowTnvedDropdown(false);
        return;
      }

      // If the search term exactly matches the currently selected product, don't search
      const currentProduct = productDetails.get(selectedProduct);
      if (currentProduct?.tnved_code === searchTerm) {
        setProducts([]);
        setShowTnvedDropdown(false);
        return;
      }

      const response = await api.get(`/items/product/?tnved_code=${searchTerm}`);
      const results = response.data.results || [];
      setProducts(results);
      setShowTnvedDropdown(true);
    } catch (error) {
      console.error('Error searching products by TNVED:', error);
      setProducts([]);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (productNameSearch) {
        searchByProductName(productNameSearch);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [productNameSearch]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (tnvedCodeSearch) {
        searchByTnvedCode(tnvedCodeSearch);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [tnvedCodeSearch]);

  console.log('selectedProduct', selectedProduct);
  console.log('productNameSearch', productNameSearch);
  console.log('tnvedCodeSearch', tnvedCodeSearch);
  console.log('storaga', selectedStorage);
  console.log('quantity', quantity);

  return (
    <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* TNVED Code Search */}
         <div className="relative" ref={tnvedDropdownRef}>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
            {t('createApplication.tnvedCode')}
          </label>
          <input
            type="text"
            value={tnvedCodeSearch}
            onChange={(e) => {
              const value = e.target.value;
              setTnvedCodeSearch(value);
              if (!value) {
                setShowTnvedDropdown(false);
                setProducts([]);
                setSelectedProduct(0);
                setProductNameSearch('');
              }
            }}
            onBlur={() => {
              setTimeout(() => {
                setShowTnvedDropdown(false);
              }, 200);
            }}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
              px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 
              focus:ring-[#6C5DD3] bg-white dark:bg-gray-700 text-gray-900 
              dark:text-gray-100 transition-colors"
            placeholder={t("createApplication.tnvedCodePlaceholder")}
          />
          
          {showTnvedDropdown && tnvedCodeSearch && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg 
              border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
              {products.length > 0 ? (
                products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className={`px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 
                      cursor-pointer text-sm text-gray-900 dark:text-gray-100
                      ${selectedProduct === product.id ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{product.name}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {t('createApplication.tnvedCode')}: {product.tnved_code}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {t('createApplication.noProductsFound')}
                  </p>
                  <button
                    onClick={() => setShowCreateProductModal(true)}
                    className="w-full text-center bg-[#6C5DD3] text-white px-4 py-2 text-sm rounded-lg 
                      hover:bg-[#5b4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2
                      dark:focus:ring-offset-gray-800"
                  >
                    {t('createApplication.createNewProduct')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        {/* Product Name Search */}
        <div className="relative" ref={productNameDropdownRef}>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
            {t('createApplication.productName')}
          </label>
          <input
            type="text"
            value={productNameSearch}
            onChange={(e) => {
              const value = e.target.value;
              setProductNameSearch(value);
              if (!value) {
                setShowProductNameDropdown(false);
                setProducts([]);
                setSelectedProduct(0);
                setTnvedCodeSearch('');
              }
            }}
            onBlur={() => {
              setTimeout(() => {
                setShowProductNameDropdown(false);
              }, 200);
            }}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
              px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 
              focus:ring-[#6C5DD3] bg-white dark:bg-gray-700 text-gray-900 
              dark:text-gray-100 transition-colors"
            placeholder={t("createApplication.productNamePlaceholder")}
          />
          
          {showProductNameDropdown && productNameSearch && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg 
              border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
              {products.length > 0 ? (
                products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className={`px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 
                      cursor-pointer text-sm text-gray-900 dark:text-gray-100
                      ${selectedProduct === product.id ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{product.name}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {t('createApplication.tnvedCode')}: {product.tnved_code}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {t('createApplication.noProductsFound')}
                  </p>
                  <button
                    onClick={() => setShowCreateProductModal(true)}
                    className="w-full text-center bg-[#6C5DD3] text-white px-4 py-2 text-sm rounded-lg 
                      hover:bg-[#5b4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2
                      dark:focus:ring-offset-gray-800"
                  >
                    {t('createApplication.createNewProduct')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

       

        {/* Storage Selection - Add this block */}
        <div className="relative" ref={storageDropdownRef}>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
            {t('createApplication.storage')}
          </label>
          <input
            type="text"
            value={storageSearch}
            onChange={(e) => {
              setStorageSearch(e.target.value);
              setShowStorageDropdown(true);
            }}
            onFocus={() => setShowStorageDropdown(true)}
            onBlur={() => {
              setTimeout(() => {
                setShowStorageDropdown(false);
              }, 200);
            }}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
              px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 
              focus:ring-[#6C5DD3] bg-white dark:bg-gray-700 text-gray-900 
              dark:text-gray-100 transition-colors"
            placeholder={t("createApplication.searchStorage")}
          />
          
          {showStorageDropdown && storages.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg 
              border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
              {storages.map((storage) => (
                <div
                  key={storage.id}
                  onClick={() => handleStorageSelect(storage)}
                  className={`px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 
                    cursor-pointer text-sm text-gray-900 dark:text-gray-100
                    ${selectedStorage === storage.id ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                >
                  {storage.storage_name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quantity input */}
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
            {t('createApplication.quantity')}
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => {
              const value = e.target.value;
              // Allow decimal numbers
              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                setQuantity(value);
              }
            }}
            min="0.1"
            step="0.1"
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
              px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 
              focus:ring-[#6C5DD3] bg-white dark:bg-gray-700 text-gray-900 
              dark:text-gray-100 transition-colors"
          />
        </div>
      </div>

      <button
        onClick={handleAddProduct}
        disabled={!selectedProduct || !selectedStorage || !quantity}
        className="mt-6 px-6 py-2.5 bg-[#6C5DD3] text-white rounded-lg 
          font-medium hover:bg-[#5b4eb3] disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200 ease-in-out shadow-sm"
      >
        {t('createApplication.addProduct')}
      </button>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('createApplication.selectedProducts')}
        </h3>
        <div className="space-y-2">
          {formData.upload_products.map((product, index) => {
            const details = getProductDetails(product.product_id, product.storage_id);
            return (
              <div key={`product-${index}`} className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <div className="flex-1">
                  <span className="font-medium dark:text-gray-100">
                    {details.productName}
                  </span>
                  <span className="mx-2 text-gray-400 dark:text-gray-500">|</span>
                  <span className="text-gray-600 dark:text-gray-300">
                    {t('createApplication.storage')}: {details.storageName}
                  </span>
                  <span className="mx-2 text-gray-400 dark:text-gray-500">|</span>
                  <span className="text-gray-600 dark:text-gray-300">
                    {t('createApplication.quantity')}: {product.quantity}
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveProduct(index)}
                  className="text-red-500 hover:text-red-700 p-2 dark:text-red-400 dark:hover:text-red-300"
                >
                  {t('createApplication.remove')}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex justify-end border-t pt-6">
        <button
          onClick={onSuccess}
          className="px-6 py-2.5 bg-[#6C5DD3] text-white rounded-lg font-medium
            hover:bg-[#5b4eb3] transition-colors duration-200 ease-in-out shadow-sm"
        >
          {t('createApplication.next')}
        </button>
      </div>

      <CreateProductModal
        isOpen={showCreateProductModal}
        onClose={() => setShowCreateProductModal(false)}
        onSuccess={handleProductCreated}
        initialProductName={productSearch}
        initialTnvedCode={tnvedCodeSearch}
      />
    </div>
  );
};

const TransportSection = ()  => {
  const { t } = useTranslation();
  const { formData, setFormData } = useFormContext();
  const [transportNumber, setTransportNumber] = useState('');
  const [transportTypeId, setTransportTypeId] = useState<number>(0);
  const [transportTypes, setTransportTypes] = useState<TransportType[]>([]);

  useEffect(() => {
    const fetchTransportTypes = async () => {
      try {
        const response = await api.get('/transport/type/');
        setTransportTypes(response.data.results);
      } catch (error) {
        console.error('Error fetching transport types:', error);
      }
    };
    fetchTransportTypes();
  }, []);

  const handleAddTransport = () => {
    if (!transportNumber || !transportTypeId) return;

    const newTransport = {
      transport_number: transportNumber,
      transport_type: transportTypeId
    };

    setFormData(prev => ({
      ...prev,
      upload_transport: [...prev.upload_transport, newTransport]
    }));

    setTransportNumber('');
    setTransportTypeId(0);
  };

  const handleRemoveTransport = (index: number) => {
    setFormData(prev => ({
      ...prev,
      upload_transport: prev.upload_transport.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="mt-8 border-t pt-8">
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {t('createApplication.transportInfo')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('createApplication.transportType')}
            </label>
            <select
              value={transportTypeId}
              onChange={(e) => setTransportTypeId(Number(e.target.value))}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 
                px-4 py-2.5 text-sm focus:border-[#6C5DD3] focus:ring-1 
                focus:ring-[#6C5DD3] bg-white dark:bg-gray-700 
                text-gray-900 dark:text-gray-100 transition-colors"
            >
              <option value={0}>
                {t('createApplication.selectTransportType')}
              </option>
              {transportTypes?.map(type => (
                <option key={type.id} value={type.id}>
                  {type.transport_type}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('createApplication.transportNumber')}
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                value={transportNumber}
                onChange={(e) => setTransportNumber(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 
                  px-4 py-2.5 text-sm focus:border-[#6C5DD3] focus:ring-1 
                  focus:ring-[#6C5DD3] bg-white dark:bg-gray-700 
                  text-gray-900 dark:text-gray-100 transition-colors"
                placeholder={t('createApplication.number')}
              />
              <button
                onClick={handleAddTransport}
                disabled={!transportNumber || !transportTypeId}
                className="px-6 py-2.5 bg-[#6C5DD3] text-white rounded-lg font-medium
                  hover:bg-[#5b4eb3] disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors duration-200 ease-in-out shadow-sm
                  whitespace-nowrap"
              >
                {t('createApplication.addTransport')}
              </button>
            </div>
          </div>
        </div>

        {/* Display selected transports */}
        {formData.upload_transport.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('createApplication.selectedTransports')}:
            </h4>
            <div className="space-y-3">
              {formData.upload_transport.map((transport, index) => (
                <div 
                  key={`transport-${index}`} 
                  className="flex justify-between items-center bg-gray-50 
                    dark:bg-gray-800 p-4 rounded-lg border border-gray-200 
                    dark:border-gray-700 hover:border-gray-300 
                    dark:hover:border-gray-600 transition-colors"
                >
                  <div className="flex-1">
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {transportTypes.find(t => t.id === transport.transport_type)?.transport_type}
                    </span>
                    <span className="mx-2 text-gray-400 dark:text-gray-500">|</span>
                    <span className="text-gray-600 dark:text-gray-300">
                      {t('createApplication.number')}: {transport.transport_number}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemoveTransport(index)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 
                      dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ServicesTab: React.FC<TabPanelProps> = ({ onSuccess }) => {
  const { formData, setFormData } = useFormContext();
  const [keepingServices, setKeepingServices] = useState<KeepingService[]>([]);
  const [workingServices, setWorkingServices] = useState<WorkingService[]>([]);
  const [] = useState<Map<number, string>>(new Map());
  const [keepingServicesNames, setKeepingServicesNames] = useState<Map<number, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keepingServicesOpen, setKeepingServicesOpen] = useState(false);
  const [workingServicesOpen, setWorkingServicesOpen] = useState(false);
  const keepingServicesRef = useRef<HTMLDivElement>(null);
  const workingServicesRef = useRef<HTMLDivElement>(null);
  const {t} = useTranslation();

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      const currentYear = new Date().getFullYear();
      
      try {
        const workingNamesRes = await api.get('/working_service/name/');
        const workingNames = workingNamesRes.data.results || [];
        
        const namesMap = new Map();
        workingNames.forEach((service: { id: number, service_name: string }) => {
          namesMap.set(service.id, service.service_name);
        });

        const workingTariffsRes = await api.get(`/working_service/tariff/?year=${currentYear}`);
        const workingTariffs = workingTariffsRes.data.results || [];

        const combinedWorkingServices = workingTariffs.map((tariff: any) => ({
          id: tariff.id,
          tariff_id: tariff.id,
          service_id: tariff.service,
          service_name: namesMap.get(tariff.service) || t('createApplication.loading'),
          base_price: tariff.base_price,
          units: tariff.units,
          year: tariff.year
        }));

        setWorkingServices(combinedWorkingServices);

        const keepingRes = await api.get(`/keeping_service/keeping_service_price/?year=${currentYear}`);
        if (keepingRes.data?.results) {
          setKeepingServices(keepingRes.data.results);
        }

        const keepingNamePromises = keepingRes.data?.results?.map((service: any) =>
          api.get(`/keeping_service/keeping_service_name/${service.keeping_services_id}/`)
        ) || [];
        
        const keepingNameResponses = await Promise.all(keepingNamePromises);
        const keepingNamesMap = new Map();
        keepingRes.data?.results?.forEach((service: any, index: number) => {
          keepingNamesMap.set(service.keeping_services_id, keepingNameResponses[index].data.name);
        });
        setKeepingServicesNames(keepingNamesMap);

      } catch (error) {
        console.error('Error fetching services:', error);
        setError(t('createApplication.errorLoadingServices'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [t]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (keepingServicesRef.current && !keepingServicesRef.current.contains(event.target as Node)) {
        setKeepingServicesOpen(false);
      }
      if (workingServicesRef.current && !workingServicesRef.current.contains(event.target as Node)) {
        setWorkingServicesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeepingServiceChange = (serviceId: number, days: number) => {
    setFormData(prev => ({
      ...prev,
      upload_keeping_services_quantity: [
        ...prev.upload_keeping_services_quantity.filter(
          item => item.service_type_id !== serviceId
        ),
        {
          amount: days,
          service_type_id: serviceId
        }
      ]
    }));
  };

  const handleWorkingServiceChange = (tariffId: number, quantity: number) => {
    console.log('Handling working service change:', { tariffId, quantity });
    if (quantity > 0) {
      setFormData(prev => {
        const newData = {
          ...prev,
          upload_working_services_quantity: [
            ...prev.upload_working_services_quantity.filter(
              item => item.service_id !== tariffId
            ),
            {
              service_id: tariffId, // Using the actual tariff ID (3, 4, 7)
              quantity: quantity
            }
          ]
        };
        console.log('Updated working services quantity:', newData.upload_working_services_quantity);
        return newData;
      });
    } else {
      handleRemoveWorkingService(tariffId);
    }
  };

  const handleRemoveKeepingService = (serviceId: number) => {
    setFormData(prev => ({
      ...prev,
      upload_keeping_services_quantity: prev.upload_keeping_services_quantity.filter(
        item => item.service_type_id !== serviceId
      )
    }));
  };

  const handleRemoveWorkingService = (tariffId: number) => {
    setFormData(prev => ({
      ...prev,
      upload_working_services_quantity: prev.upload_working_services_quantity.filter(
        item => item.service_id !== tariffId
      )
    }));
  };

  const getSelectedKeepingService = (serviceId: number) => {
    return formData.upload_keeping_services_quantity.find(
      item => item.service_type_id === serviceId
    )?.amount || 0;
  };

  const getSelectedWorkingService = (tariffId: number) => {
    const service = formData.upload_working_services_quantity.find(
      item => item.service_id === tariffId
    );
    console.log('Getting selected working service:', { tariffId, service });
    return service?.quantity || 0;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5DD3]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6 bg-transparent rounded-lg shadow-sm">
      <div className="space-y-8">
        {/* Keeping Services Dropdown */}
        <div ref={keepingServicesRef} className="relative">
          <button
            onClick={() => setKeepingServicesOpen(!keepingServicesOpen)}
            className="w-full flex justify-between items-center px-6 py-4 border-2 
              border-gray-100 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 
              hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-200">
                {t('createApplication.storageServices')}
              </span>
              {formData.upload_keeping_services_quantity.length > 0 && (
                <span className="bg-[#6C5DD3] text-white px-2.5 py-1 rounded-full text-sm">
                  {formData.upload_keeping_services_quantity.length}
                </span>
              )}
            </div>
            <svg
              className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 
                ${keepingServicesOpen ? 'transform rotate-180' : ''} 
                group-hover:text-[#6C5DD3]`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {keepingServicesOpen && (
            <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 
              border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg 
              divide-y divide-gray-100 dark:divide-gray-700">
              {keepingServices?.map(service => (
                <div key={`keeping-${service.id}`} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 
                  transition-colors duration-150">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {keepingServicesNames.get(service.keeping_services_id) || t('createApplication.loading')}
                      </h4>
                      <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>{t('createApplication.base')}: {service.base_price}</span>
                        <span>•</span>
                        <span>{t('createApplication.extra')}: {service.extra_price}</span>
                        <span>•</span>
                        <span>{t('createApplication.year')}: {service.year}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('createApplication.quantity')}:
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        value={getSelectedKeepingService(service.keeping_services_id)}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Allow decimal numbers and handle empty input
                          if (value === '' || /^\d*\.?\d*$/.test(value)) {
                            handleKeepingServiceChange(service.keeping_services_id, parseFloat(value) || 0);
                          }
                        }}
                        className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 
                          rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 
                          dark:text-gray-100 focus:ring-2 focus:ring-[#6C5DD3] 
                          focus:border-[#6C5DD3] outline-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Working Services Dropdown */}
        <div ref={workingServicesRef} className="relative">
          <button
            onClick={() => setWorkingServicesOpen(!workingServicesOpen)}
            className="w-full flex justify-between items-center px-6 py-4 border-2 
              border-gray-100 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 
              hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-3">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-200">
                {t('createApplication.laborServices')}
              </span>
              {formData.upload_working_services_quantity.length > 0 && (
                <span className="bg-[#6C5DD3] text-white px-2.5 py-1 rounded-full text-sm">
                  {formData.upload_working_services_quantity.length}
                </span>
              )}
            </div>
            <svg
              className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 
                ${workingServicesOpen ? 'transform rotate-180' : ''} 
                group-hover:text-[#6C5DD3]`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {workingServicesOpen && (
            <div className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 
              border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg 
              divide-y divide-gray-100 dark:divide-gray-700">
              {workingServices.map((service) => {
                console.log('Rendering service:', service);
                return (
                  <div 
                    key={`working-tariff-${service.tariff_id}`} 
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {service.service_name}
                        </h4>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>{t('createApplication.base')}: {service.base_price}</span>
                          <span>•</span>
                          <span>{t('createApplication.units')}: {service.units}</span>
                          <span>•</span>
                          <span>{t('createApplication.year')}: {service.year}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="number"
                          min="0.1"
                          step="0.1"
                          value={getSelectedWorkingService(service.tariff_id)}
                          onChange={(e) => {
                            const value = e.target.value;
                            // Allow decimal numbers and handle empty input
                            if (value === '' || /^\d*\.?\d*$/.test(value)) {
                              handleWorkingServiceChange(service.tariff_id, parseFloat(value) || 0);
                            }
                          }}
                          className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 
                            rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 
                            dark:text-gray-100 focus:ring-2 focus:ring-[#6C5DD3] 
                            focus:border-[#6C5DD3] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                );
              })}
            </div>
          )}
        </div>

        {/* Selected Services Summary */}
        <div className="mt-8 space-y-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b 
            dark:border-gray-700 pb-3">
            {t('createApplication.selectedServices')}
          </h3>
          
          {/* Selected Keeping Services */}
          {formData.upload_keeping_services_quantity && formData.upload_keeping_services_quantity.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700 dark:text-white text-sm uppercase tracking-wider">
                {t('createApplication.storageServices')}
              </h4>
              <div className="grid gap-3">
                {formData.upload_keeping_services_quantity.map((item) => {
                  const service = keepingServices.find(s => s.keeping_services_id === item.service_type_id);
                  return (
                    <div key={`keeping-${item.service_type_id}`} 
                      className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-4 
                        rounded-xl border border-gray-100 dark:border-gray-700 
                        hover:border-gray-200 dark:hover:border-gray-700 transition-colors duration-200">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {keepingServicesNames.get(item.service_type_id) || t('createApplication.loading')}
                        </span>
                        <div className="mt-1 flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                          <span>{item.amount} {t('createApplication.quantity')}</span>
                          <span>•</span>
                          <span>{t('createApplication.base')}: {service?.base_price}</span>
                          <span>•</span>
                          <span>{t('createApplication.extra')}: {service?.extra_price}</span>
                          <span>•</span>
                          <span>{t('createApplication.total')}: {service?.year}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveKeepingService(item.service_type_id)}
                        className="p-2 text-gray-400 hover:text-red-500 dark:text-gray-300 
                          dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 
                          rounded-lg transition-colors duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected Working Services */}
          {formData.upload_working_services_quantity && formData.upload_working_services_quantity.length > 0 && (
            <div className="space-y-4">
                <h4 className="font-medium text-gray-700 dark:text-white text-sm uppercase tracking-wider">
                {t('createApplication.workingServices')}
              </h4>
              <div className="grid gap-3">
                {formData.upload_working_services_quantity.map((item) => {
                  const service = workingServices.find(s => s.id === item.service_id);
                  return (
                    <div key={`working-${item.service_id}`} 
                      className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-4 
                        rounded-xl border border-gray-100 dark:border-gray-700 
                        hover:border-gray-200 dark:hover:border-gray-700 transition-colors duration-200"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {service?.service_name || t('createApplication.loading')}
                        </span>
                        <div className="mt-1 flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-300">
                          <span>{item.quantity} {service?.units}</span>
                          <span>•</span>
                          <span>{t('createApplication.base')}: {service?.base_price}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveWorkingService(item.service_id)}
                        className="p-2 text-gray-400 hover:text-red-500 dark:text-gray-300 
                          dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 
                          rounded-lg transition-colors duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-6 border-t">
          <button
            onClick={onSuccess}
            className="px-6 py-2.5 bg-[#6C5DD3] text-white rounded-lg font-medium
              hover:bg-[#5b4eb3] transition-colors duration-200 ease-in-out shadow-sm"
          >
            {t('createApplication.next')}
          </button>
        </div>
      </div>
    </div>
  );
};

const ModesTab: React.FC<TabPanelProps> = ({ onSubmit }) => {
  const { formData, setFormData } = useFormContext();
  const [modes, setModes] = useState<Array<{ id: number; name_mode: string; code_mode: string }>>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {t} = useTranslation();

  useEffect(() => {
    const fetchModes = async () => {
      try {
        const response = await api.get('/modes/modes/');
        setModes(response.data.results);
      } catch (error) {
        console.error('Error fetching modes:', error);
      }
    };
    fetchModes();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleModeSelect = (selectedMode: { id: number; name_mode: string; code_mode: string }) => {
    // Replace the existing mode (if any) with the new one
    setFormData(prev => ({
      ...prev,
      upload_modes: [{ mode_id: selectedMode.id }]
    }));
    
    setSearchTerm(`${selectedMode.name_mode} (${selectedMode.code_mode})`);
    setShowDropdown(false);
  };

  const filteredModes = modes.filter(mode =>
    mode.name_mode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mode.code_mode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRemoveMode = () => {
    setFormData(prev => ({
      ...prev,
      upload_modes: []
    }));
    setSearchTerm('');
  };

  const selectedMode = modes.find(mode => 
    formData.upload_modes[0]?.mode_id === mode.id
  );

  return (
    <div className="p-6 bg-transparent rounded-lg shadow-sm">
      <div className="max-w-md">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('createApplication.select')}
          </label>
          
          <div className="relative" ref={dropdownRef}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder={t('createApplication.input')}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 
                px-4 py-2.5 text-sm focus:border-[#6C5DD3] focus:ring-1 focus:ring-[#6C5DD3]
                bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 
                placeholder-gray-400 dark:placeholder-gray-500 transition-colors"
            />
            
            {showDropdown && filteredModes.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 rounded-lg 
                shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
                {filteredModes.map((mode) => (
                  <div
                    key={mode.id}
                    onClick={() => handleModeSelect(mode)}
                    className="px-4 py-3 hover:bg-gray-50 dark:bg-gray-900 cursor-pointer
                      border-b last:border-b-0 border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {mode.name_mode}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {t('createApplication.code')}: {mode.code_mode}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedMode && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Selected Mode:
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border 
              border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {selectedMode.name_mode}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Code: {selectedMode.code_mode}
                  </p>
                </div>
                <button
                  onClick={handleRemoveMode}
                  className="p-1 text-gray-400 hover:text-red-500 dark:text-red-400 rounded-full
                    hover:bg-red-50 dark:hover:bg-transparent transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 border-t pt-6">
          <button
            onClick={onSubmit}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium
              hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-200 ease-in-out shadow-sm
              focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
              dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={formData.upload_modes.length === 0}
          >
            {t('createApplication.title')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CreateApplication() {
  const { t } = useTranslation();
  const [firms, setFirms] = useState<Firm[]>([]);
  const [, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [, setKeepingServices] = useState<KeepingService[]>([]);
  const [, setWorkingServices] = useState<WorkingService[]>([]);
  const [, setStorages] = useState<any[]>([]);
  const [, setTransportTypes] = useState<TransportType[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [firmSearch, setFirmSearch] = useState("");
  const [showFirmDropdown, setShowFirmDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [, setShowPaymentMethodDropdown] = useState(false);
  const paymentMethodDropdownRef = useRef<HTMLDivElement>(null);
  const [, setKeepingServicesOpen] = useState(false);
  const [, setWorkingServicesOpen] = useState(false);
  const keepingServicesRef = useRef<HTMLDivElement>(null);
  const workingServicesRef = useRef<HTMLDivElement>(null);
  const [showCreateFirmModal, setShowCreateFirmModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const navigate = useNavigate();
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');


  const [formData, setFormData] = useState<ApplicationFormData>({
    firm_id: 0,
    brutto: null,
    netto: null,
    vip_application: false,
    total_price: null,
    discount_price: null,
    decloration_number: '',
    decloration_date: '',
    keeping_services: [],
    working_services: [],
    upload_keeping_services_quantity: [],
    upload_working_services_quantity: [],
    upload_transport: [],
    upload_modes: [],
    upload_products: [],
    upload_photos: [],
    number_of_application: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          paymentMethodsResponse,
          keepingServicesResponse,
          workingServicesResponse,
          storagesResponse,
          transportTypesResponse
        ] = await Promise.all([
          api.get('/payment_method/'),
          api.get('/keeping_service/keeping_service_price/'),
          api.get('/working_service/'),
          api.get('/storage/'),
          api.get('/transport/type/')
        ]);
        
        setPaymentMethods(paymentMethodsResponse.data.results || []);
        setKeepingServices(keepingServicesResponse.data.results);
        setWorkingServices(workingServicesResponse.data.results);
        setStorages(storagesResponse.data || []);
        setTransportTypes(transportTypesResponse.data || []);
        
        setFormData(prev => ({
          ...prev,
          payment_method: paymentMethodsResponse.data.results?.[0]?.id || null
        }));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (keepingServicesRef.current && 
          !keepingServicesRef.current.contains(event.target as Node)) {
        setKeepingServicesOpen(false);
      }
      if (workingServicesRef.current && 
          !workingServicesRef.current.contains(event.target as Node)) {
        setWorkingServicesOpen(false);
      }
      
      if (dropdownRef.current && 
          !dropdownRef.current.contains(event.target as Node)) {
        setShowFirmDropdown(false);
      }
      
      if (paymentMethodDropdownRef.current && 
          !paymentMethodDropdownRef.current.contains(event.target as Node)) {
        setShowPaymentMethodDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async () => {
    try {
      const formDataObj = new FormData();
      
      // Required fields validation
      if (!formData.firm_id) {
        setErrorMessage('Please select a firm');
        setErrorModalOpen(true);
        return;
      }

      formDataObj.append('firm_id', formData.firm_id.toString());
      formDataObj.append('vip_application', formData.vip_application ? 'true' : 'false');
      formDataObj.append('number_of_application', formData.number_of_application || '');

      // Optional fields with validation
      if (formData.brutto !== null) {
        formDataObj.append('brutto', formData.brutto.toString());
      }
      if (formData.netto !== null) {
        formDataObj.append('netto', formData.netto.toString());
      }

      // Only append declaration fields if they have values
      if (formData.decloration_number?.trim()) {
        formDataObj.append('decloration_number', formData.decloration_number);
      }
      if (formData.decloration_date?.trim()) {
        formDataObj.append('decloration_date', formData.decloration_date);
      }
      if (formData.decloration_file) {
        formDataObj.append('decloration_file', formData.decloration_file);
      }

      // Arrays
      formDataObj.append('upload_keeping_services_quantity', 
        JSON.stringify(formData.upload_keeping_services_quantity));
      formDataObj.append('upload_working_services_quantity', 
        JSON.stringify(formData.upload_working_services_quantity));
      formDataObj.append('upload_transport', 
        JSON.stringify(formData.upload_transport));
      formDataObj.append('upload_modes', 
        JSON.stringify(formData.upload_modes));
      formDataObj.append('upload_products', 
        JSON.stringify(formData.upload_products));

      // Make photos optional by only appending if they exist
      if (formData.upload_photos?.length) {
        formData.upload_photos.forEach(photo => {
          formDataObj.append('upload_photos', photo);
        });
      }

      const response = await api.post('/application/', formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Application created successfully:', response.data);
      
      // Show success modal first
      setShowSuccessModal(true);

      // Only navigate after modal is closed
      // Remove the automatic navigation here
      // The navigation will happen in handleSuccessModalClose

    } catch (error: any) {
      console.error('Error submitting application:', error);
      
      let errorMsg = '';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        errorMsg = Object.entries(errorData)
          .map(([key, value]) => {
            const fieldName = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
            if (Array.isArray(value)) {
              return `${fieldName}: ${value.join(', ')}`;
            }
            return `${fieldName}: ${value}`;
          })
          .join('\n');
      } else {
        errorMsg = 'An error occurred while creating the application.';
      }

      setErrorMessage(errorMsg);
      setErrorModalOpen(true);
    }
  };

  
  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate('/application-list'); // Navigate only after modal is closed
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'file' && 'files' in e.target && e.target.files ) {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).files![0]
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? null : Number(value)
      }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const searchFirms = async (searchTerm: string) => {
    try {
      if (!searchTerm.trim()) {
        setFirms([]);
        setShowFirmDropdown(false);
        return;
      }
      const response = await api.get(`/firms/?firm_name=${searchTerm}`);
      setFirms(response.data.results || []);
      setShowFirmDropdown(true);
    } catch (error) {
      console.error('Error searching firms:', error);
      setFirms([]);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (firmSearch) {
        searchFirms(firmSearch);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [firmSearch]);

  const handleFirmSelect = (firm: Firm) => {
    
    if (!firm.id) {
      console.error('Invalid firm selected - firm.id is falsy');
      return;
    }
    
    const firmId = Number(firm.id);
    
    setFormData(prev => {
      const updated = {
        ...prev,
        firm_id: firmId
      };
      console.log('Updated form data:', updated);
      return updated;
    });
    
    setFirmSearch(firm.firm_name);
    setShowFirmDropdown(false);
  };

 

  const handleFirmCreated = (newFirm: { id: number; firm_name: string }) => {
    setFirms(prevFirms => [...prevFirms, newFirm]);
    setFormData(prev => ({ ...prev, firm_id: newFirm.id }));
    setFirmSearch(newFirm.firm_name);
  };

  

  const inputClassName = `mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
    px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 
    focus:ring-[#6C5DD3] bg-white dark:bg-gray-700 text-gray-900 
    dark:text-gray-100 transition-colors`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        decloration_file: e.target.files![0]
      }));
    }
  };

  const handleTabChange = (index: number) => {
    setSelectedTab(index);
  };

  return (
    <FormContext.Provider value={{ formData, setFormData }}>
      <div className="p-4 sm:p-6">
        <Tab.Group selectedIndex={selectedTab} onChange={handleTabChange}>
          <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
            <Tab
              className={({ selected }) =>
                classNames(
                  'whitespace-nowrap rounded-lg py-2.5 px-4 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                  selected
                    ? 'bg-white dark:bg-gray-700 text-[#6C5DD3] shadow'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-white/[0.12] dark:hover:bg-transparent hover:text-[#6C5DD3]'
                )
              }
            >
              {t('createApplication.basicInfo', 'Basic Info')}
            </Tab>

            <Tab
              className={({ selected }) =>
                classNames(
                  'whitespace-nowrap rounded-lg py-2.5 px-4 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                  selected
                    ? 'bg-white dark:bg-gray-700 text-[#6C5DD3] shadow'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-white/[0.12] dark:hover:bg-transparent hover:text-[#6C5DD3]'
                )
              }
            >
              {t('createApplication.services')}
            </Tab>

            <Tab
              className={({ selected }) =>
                classNames(
                  'whitespace-nowrap rounded-lg py-2.5 px-4 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                  selected
                    ? 'bg-white dark:bg-gray-700 text-[#6C5DD3] shadow'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-white/[0.12] dark:hover:bg-transparent hover:text-[#6C5DD3]'
                )
              }
            >
              {t('createApplication.photos')}
            </Tab>

            <Tab
              className={({ selected }) =>
                classNames(
                  'whitespace-nowrap rounded-lg py-2.5 px-4 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                  selected
                    ? 'bg-white dark:bg-gray-700 text-[#6C5DD3] shadow'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-white/[0.12] dark:hover:bg-transparent hover:text-[#6C5DD3]'
                )
              }
            >
              {t('createApplication.products')}
            </Tab>

            <Tab
              className={({ selected }) =>
                classNames(
                  'whitespace-nowrap rounded-lg py-2.5 px-4 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                  selected
                    ? 'bg-white dark:bg-gray-700 text-[#6C5DD3] shadow'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-white/[0.12] dark:hover:bg-transparent hover:text-[#6C5DD3]'
                )
              }
            >
              {t('createApplication.declarationInfo')}
            </Tab>

            <Tab
              className={({ selected }) =>
                classNames(
                  'whitespace-nowrap rounded-lg py-2.5 px-4 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                  selected
                    ? 'bg-white dark:bg-gray-700 text-[#6C5DD3] shadow'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-white/[0.12] dark:hover:bg-transparent hover:text-[#6C5DD3]'
                )
              }
            >
              {t('createApplication.modes')}
            </Tab>
          </Tab.List>

          <Tab.Panels>
            {/* Basic Info Panel */}
            <Tab.Panel>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="sm:col-span-2 mb-4">
                    <div className="flex items-center">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">
                        {t('createApplication.vipApplication')}
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, vip_application: !prev.vip_application }))}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 
                          border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          formData.vip_application ? 'bg-[#6C5DD3]' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                        role="switch"
                        aria-checked={formData.vip_application}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full 
                            bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            formData.vip_application ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label htmlFor="number_of_application" className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
                      {t('createApplication.numberOfApplication')}
                    </label>
                    <input
                      type="text"
                      name="number_of_application"
                      id="number_of_application"
                      value={formData.number_of_application || ''}
                      onChange={handleChange}
                      className={inputClassName}
                      placeholder={t('createApplication.numberOfApplicationPlaceholder')}
                    />
                  </div>
                  <div className="relative" ref={dropdownRef}>
                    <label htmlFor="firm_search" className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
                      {t('createApplication.firmId', 'Firm')}
                    </label>
                    <input
                      type="text"
                      id="firm_search"
                      value={firmSearch}
                      onChange={(e) => {
                        setFirmSearch(e.target.value);
                        setShowFirmDropdown(true);
                      }}
                      onFocus={() => setShowFirmDropdown(true)}
                      className={inputClassName}
                      placeholder={t('createApplication.searchFirm', 'Search for a firm...')}
                    />
                    
                    {showFirmDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
                        {firms.length > 0 ? (
                          firms.map((firm) => (
                            <div
                              key={firm.id}
                              onClick={() => handleFirmSelect(firm)}
                              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-900 dark:text-gray-100"
                            >
                              {firm.firm_name}
                            </div>
                          ))
                        ) : (
                          <div className="p-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                              {t('createApplication.noFirmsFound', 'No firms found')}
                            </p>
                            <button
                              onClick={() => setShowCreateFirmModal(true)}
                              className="w-full text-center bg-[#6C5DD3] text-white px-4 py-2 text-sm rounded-lg 
                              hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2
                              dark:focus:ring-offset-gray-800"
                            >
                              {t('createApplication.createNewFirm', 'Create New Firm')}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                 

                  <div>
                    <label htmlFor="brutto" className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
                      {t('createApplication.brutto', 'Brutto')}
                    </label>
                    <input
                      type="number"
                      name="brutto"
                      id="brutto"
                      value={formData.brutto || ''}
                      onChange={handleChange}
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label htmlFor="netto" className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
                      {t('createApplication.netto', 'Netto')}
                    </label>
                    <input
                      type="number"
                      name="netto"
                      id="netto"
                      value={formData.netto || ''}
                      onChange={handleChange}
                      className={inputClassName}
                    />
                  </div>

                 

                  {/* <div className="relative" ref={paymentMethodDropdownRef}>
                    <label htmlFor="payment_method_search" className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
                      {t('createApplication.paymentMethod', 'Payment Method')}
                    </label>
                    <input
                      type="text"
                      id="payment_method_search"
                      value={paymentMethodSearch}
                      onChange={(e) => {
                        setPaymentMethodSearch(e.target.value);
                        setShowPaymentMethodDropdown(true);
                      }}
                      onFocus={() => setShowPaymentMethodDropdown(true)}
                      className={inputClassName}
                      placeholder={t('createApplication.searchPaymentMethod', 'Search for a payment method...')}
                    />
                    
                    {showPaymentMethodDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-auto">
                        {filteredPaymentMethods.length > 0 ? (
                          filteredPaymentMethods.map((method) => (
                            <div
                              key={method.id}
                              onClick={() => handlePaymentMethodSelect(method)}
                              className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-900 dark:text-gray-100"
                            >
                              {method.payment_method}
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-sm text-gray-500 dark:text-gray-400">
                            {t('createApplication.noPaymentMethodsFound', 'No payment methods found')}
                          </div>
                        )}
                      </div>
                    )}
                  </div> */}
                </div>
                
                <TransportSection />
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedTab(1)}
                  className="bg-[#6C5DD3] text-white px-6 py-2 rounded-lg hover:bg-[#5b4eb3]
                    focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2
                    dark:focus:ring-offset-gray-800"
                >
                  {t('createApplication.next')}
                </button>
              </div>
            </Tab.Panel>

            {/* Services Panel */}
            <Tab.Panel>
              <ServicesTab onSuccess={() => setSelectedTab(2)} />
            </Tab.Panel>

            {/* Photos Panel */}
            <Tab.Panel>
              <PhotoReportTab 
                onSuccess={() => setSelectedTab(3)}
                setSelectedTab={setSelectedTab}
              />
            </Tab.Panel>

            {/* Products Panel */}
            <Tab.Panel>
              <ProductsTab onSuccess={() => setSelectedTab(4)} />
            </Tab.Panel>

            {/* Declaration Panel */}
            <Tab.Panel>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="decloration_number" className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
                      {t('createApplication.declorationNumber')}
                    </label>
                    <input
                      type="text"
                      name="decloration_number"
                      id="decloration_number"
                      value={formData.decloration_number}
                      onChange={handleChange}
                      className={inputClassName}
                    />
                  </div>

                  <div>
                    <label htmlFor="decloration_date" className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
                      {t('createApplication.declorationDate')}
                    </label>
                    <input
                      type="date"
                      name="decloration_date"
                      id="decloration_date"
                      value={formData.decloration_date}
                      onChange={handleChange}
                      className={inputClassName}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors mb-2">
                      {t('createApplication.declarationFile')}
                    </label>
                    
                    <div 
                      className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center
                        ${formData.decloration_file ? 'border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-900/20' : 
                        'border-gray-300 dark:border-gray-600 hover:border-[#6C5DD3] dark:hover:border-[#6C5DD3]'}
                        transition-colors duration-200 cursor-pointer`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDragLeave={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                          const file = e.dataTransfer.files[0];
                          setFormData(prev => ({
                            ...prev,
                            decloration_file: file
                          }));
                        }
                      }}
                      onClick={() => document.getElementById('declaration-file-input')?.click()}
                    >
                      <input
                        type="file"
                        id="declaration-file-input"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        className="hidden"
                      />
                      
                      {formData.decloration_file ? (
                        <>
                          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {formData.decloration_file.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {(formData.decloration_file.size / 1024).toFixed(2)} KB
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData(prev => ({
                                ...prev,
                                decloration_file: undefined
                              }));
                            }}
                            className="mt-4 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 
                              text-xs font-medium rounded-md hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                          >
                            {t('createApplication.removeFile')}
                          </button>
                        </>
                      ) : (
                        <>
                          <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          {/* <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('createApplication.dragAndDrop')}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {t('createApplication.orClickToUpload')}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                            {t('createApplication.supportedFormats')}: PDF, DOC, DOCX, JPG, JPEG, PNG
                          </p> */}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedTab(5)}
                    className="bg-[#6C5DD3] text-white px-6 py-2 rounded-lg hover:bg-[#5b4eb3]
                      focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2
                      dark:focus:ring-offset-gray-800"
                  >
                    {t('createApplication.next')}
                  </button>
                </div>
              </div>
            </Tab.Panel>

            {/* Modes Panel */}
            <Tab.Panel>
              <ModesTab onSubmit={handleSubmit} />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>

        <SuccessModal
          isOpen={showSuccessModal}
          onClose={handleSuccessModalClose}
          message={t('createApplication.successMessage', 'Application created successfully!')}
        />

        <CreateFirmModal
          isOpen={showCreateFirmModal}
          onClose={() => setShowCreateFirmModal(false)}
          onFirmCreated={handleFirmCreated}
        />

        <ErrorModal
          isOpen={errorModalOpen}
          onClose={() => setErrorModalOpen(false)}
          message={errorMessage}
        />
      </div>
    </FormContext.Provider>
  );
} 