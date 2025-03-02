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
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const [filteredProducts, setFilteredProducts] = useState<ProductDisplay[]>(initialProducts);
    const productDropdownRef = useRef<HTMLDivElement>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [products, setProducts] = useState<ProductDisplay[]>(initialProducts);

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

    const searchProducts = async (searchTerm: string) => {
        try {
            if (!searchTerm.trim()) {
                setFilteredProducts([]);
                setShowProductDropdown(false);
                return;
            }

            if (selectedProduct !== 0) {
                return;
            }

            const response = await api.get(`/items/product/?product_name=${searchTerm}`);
            const results = response.data.results || [];
            setFilteredProducts(results);
            setShowProductDropdown(true);

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
            searchProducts(productSearch);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [productSearch]);

    useEffect(() => {
        if (formData.products && formData.products.length > 0) {
            const updatedProducts = [...initialProducts];
            formData.products.forEach((product: Product) => {
                if (product.product_id) {
                    const existingProduct = initialProducts.find(p => p.id === product.product_id);
                    if (!existingProduct) {
                        updatedProducts.push({
                            id: product.product_id,
                            name: product.product_name || 'Unknown Product',
                            measurement_id: 0,
                            category_id: 0,
                        });
                    }
                }
            });
            setProducts(updatedProducts);
        }
    }, [formData.products, initialProducts]);

    const handleProductSelect = (product: ProductDisplay) => {
        setSelectedProduct(product.id);
        setProductSearch(product.name);
        setShowProductDropdown(false);
    };

    const handleAddProduct = () => {
        if (!quantity || !selectedProduct || !selectedStorage) return;

        console.log('Before adding - Current formData:', {
            products: formData.products,
            upload_products: formData.upload_products
        });

        // Check if product with same product_id and storage_id already exists
        const isDuplicate = formData.products.some(
            product =>
                product.product_id === selectedProduct &&
                product.storage_id === selectedStorage
        );

        if (isDuplicate) {
            console.log('Product already exists in this storage');
            // Optionally show an error message to the user
            return;
        }

        // Create new product with the required format matching API structure
        const newProduct = {
            quantity,
            application_id: formData.id,
            product_id: selectedProduct,
            storage_id: selectedStorage,
            product_name: getProductName(selectedProduct),
            storage_name: getStorageName(selectedStorage)
        };

        // Get existing products
        const existingProducts = Array.isArray(formData.products) ? [...formData.products] : [];

        // Create upload_products array
        const updatedUploadProducts = [...existingProducts, newProduct].map(product => ({
            quantity: product.quantity,
            product_id: product.product_id || selectedProduct,
            storage_id: product.storage_id || selectedStorage
        })).filter(product =>
            product.product_id &&
            product.storage_id &&
            product.quantity
        );

        console.log('Debug mapping:', {
            existingProducts,
            newProduct,
            updatedUploadProducts
        });

        // Update form data with both arrays
        setFormData({
            ...formData,
            products: [...existingProducts, newProduct],
            upload_products: updatedUploadProducts
        });

        // Reset form fields
        setQuantity(0);
        setSelectedProduct(0);
        setSelectedStorage(0);
        setProductSearch('');
    };

    const handleRemoveProduct = (index: number) => {
        const currentProducts = Array.isArray(formData.products) ? [...formData.products] : [];

        // Remove the product at the specified index
        const updatedProducts = currentProducts.filter((_, i) => i !== index);

        // Recreate upload_products array from the remaining products, ensuring all required fields
        const updatedUploadProducts = updatedProducts.map(product => ({
            quantity: product.quantity,
            product_id: product.product_id,
            storage_id: product.storage_id
        })).filter(product =>
            product.product_id &&
            product.storage_id &&
            product.quantity
        );

        setFormData({
            ...formData,
            products: updatedProducts,
            upload_products: updatedUploadProducts
        });
    };

    const handleCreateProductSuccess = (newProduct: CreateProductResponse) => {
        // Update the products state with the newly created product
        setProducts(prev => [...prev, newProduct]);
        setFilteredProducts(prev => [...prev, newProduct]);
        // Select the newly created product
        handleProductSelect(newProduct);
    };

    const handleInputClick = () => {
        if (selectedProduct === 0) {
            setShowProductDropdown(true);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-900 p-3 sm:p-6 rounded-lg shadow-sm">
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div className="space-y-2 sm:space-y-4">
                    <label className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                        {t('editApplication.product')}
                    </label>
                    <div className="relative" ref={productDropdownRef}>
                        <input
                            type="text"
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            onClick={handleInputClick}
                            className="w-full rounded-md border border-gray-300 dark:border-gray-600
                px-3 py-2 text-sm focus:border-[#6C5DD3] focus:ring-[#6C5DD3]
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            placeholder={t('editApplication.searchProduct')}
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
                        {t('editApplication.storage')}
                    </label>
                    <select
                        value={selectedStorage}
                        onChange={(e) => setSelectedStorage(Number(e.target.value))}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600
              px-3 py-2 text-sm focus:border-[#6C5DD3] focus:ring-[#6C5DD3]
              bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
                            className="flex-1 rounded-md border border-gray-300 dark:border-gray-600
                px-3 py-2 text-sm focus:border-[#6C5DD3] focus:ring-[#6C5DD3]
                bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                        <button
                            onClick={handleAddProduct}
                            disabled={!quantity || !selectedProduct || !selectedStorage}
                            className="px-6 py-2 bg-[#6C5DD3] text-white rounded-lg font-medium
                hover:bg-[#5b4eb3] disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-200 ease-in-out shadow-sm whitespace-nowrap"
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
            />

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