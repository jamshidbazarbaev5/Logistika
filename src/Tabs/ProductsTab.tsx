import { useState, useEffect } from "react";
import { api } from '../api/api'
import { ApplicationFormData } from "../types/types";

interface ProductsTabProps {
  formData: any;
  setFormData: (data: any) => void;
  handleNextTab: () => void;
}

export const ProductsTab: React.FC<ProductsTabProps> = ({
  formData,
  setFormData,
  handleNextTab
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [storageId, setStorageId] = useState<number>(0);
  const [products, setProducts] = useState<any[]>([]);
  const [storages, setStorages] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, storagesRes] = await Promise.all([
          api.get('/items/product/'),
          api.get('/storage/')
        ]);
        
        setProducts(productsRes.data.results || []);
        setStorages(storagesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleAddProduct = () => {
    if (!quantity || !selectedProduct || !storageId) return;

    const product = products.find(p => p.name === selectedProduct);
    if (!product) return;

    setFormData((prev: ApplicationFormData) => ({
      ...prev,
      product_quantities: [
        ...prev.product_quantities,
        {
          quantity,
          product_id: product.id,
          storage_id: storageId
        }
      ]
    }));

    setQuantity(1);
    setSelectedProduct('');
    setStorageId(0);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
            Product
          </label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
              px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 
              focus:ring-[#6C5DD3] bg-white dark:bg-gray-700 text-gray-900 
              dark:text-gray-100 transition-colors"
          >
            <option value="">Select Product</option>
            {products.map((product) => (
              <option key={product.id} value={product.name}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
            Storage
          </label>
          <select
            value={storageId}
            onChange={(e) => setStorageId(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
              px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 
              focus:ring-[#6C5DD3] bg-white dark:bg-gray-700 text-gray-900 
              dark:text-gray-100 transition-colors"
          >
            <option value={0}>Select Storage</option>
            {storages.map(storage => (
              <option key={storage.id} value={storage.id}>
                {storage.storage_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
            Quantity
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min="1"
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
              px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 
              focus:ring-[#6C5DD3] bg-white dark:bg-gray-700 text-gray-900 
              dark:text-gray-100 transition-colors"
          />
        </div>
      </div>

      <button
        onClick={handleAddProduct}
        disabled={!selectedProduct || !storageId || !quantity}
        className="mt-6 w-full sm:w-auto px-6 py-2.5 bg-[#6C5DD3] text-white rounded-lg 
          font-medium hover:bg-[#5b4eb3] disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200 ease-in-out shadow-sm"
      >
        Add Product
      </button>

      {formData.product_quantities.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Added Products</h3>
          <div className="space-y-2">
            {formData.product_quantities.map((pq: any, index: number) => {
              const product = products.find(p => p.id === pq.product_id);
              const storage = storages.find(s => s.id === pq.storage_id);
              return (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>{product?.name} - {pq.quantity} units ({storage?.storage_name})</span>
                  <button
                    onClick={() => {
                      setFormData((prev:any) => ({
                        ...prev,
                        product_quantities: prev.product_quantities.filter((_: any, i: number) => i !== index)
                      }));
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleNextTab}
          className="bg-[#6C5DD3] text-white px-6 py-2 rounded-lg hover:bg-[#5b4eb3]"
        >
          Next
        </button>
      </div>
    </div>
  );
};