import { useState, useEffect, Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { Menu, Transition } from "@headlessui/react";
import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import ConfirmModal from "../components/ConfirmModal";
import SuccessModal from "../components/SuccessModal";
import { Dialog } from "@headlessui/react";
import { SearchBar, type SearchField } from '../components/SearchBar';
import { apiService } from "../api/api";

interface Product {
  id: number;
  name: string;
  measurement_id: number;
  category_id: number;
}

interface Measurement {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

// interface ProductResponse {
//   links: {
//     first: string | null;
//     last: string | null;
//     next: string | null;
//     previous: string | null;
//   };
//   total_pages: number;
//   current_page: number;
//   page_range: number[];
//   page_size: number;
//   results: Product[];
//   count: number;
// }

export default function ProductList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editFormData, setEditFormData] = useState<Product>({
    id: 0,
    name: "",
    measurement_id: 1,
    category_id: 1,
  });
  const [searchParams, setSearchParams] = useState({
    name: "",
  });
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const searchFields: SearchField[] = [
    {
      name: 'name',
      label: 'Search by Product Name',
      placeholder: 'Enter product name...'
    }
  ];

  const handleSearch = (values: Record<string, string>) => {
    setSearchParams(values as { name: string });
  };

  const fetchProducts = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (searchParams.name) queryParams.append("product_name", searchParams.name);
      queryParams.append("ordering", "id");
      
      const response = await apiService.getProducts(queryParams.toString());
      setProducts(response.results);
      setLoading(false);
    } catch (err) {
      setError(t("productList.errorLoading", "Error loading products"));
      setLoading(false);
    }
  };

  const fetchMeasurementsAndCategories = async () => {
    try {
      const [measurementsResponse, categoriesResponse] = await Promise.all([
        apiService.getMeasurements(),
        apiService.getCategories()
      ]);
      setMeasurements(measurementsResponse.results);
      setCategories(categoriesResponse.results);
    } catch (error) {
      console.error('Error fetching measurements and categories:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchMeasurementsAndCategories();
  }, [searchParams, t]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5DD3]"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      await apiService.deleteProduct(productToDelete.id);
      setModalMessage(t("productList.deleteSuccess", "Product deleted successfully"));
      setShowSuccessModal(true);
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      setModalMessage(t("productList.deleteError", "Failed to delete product"));
      setShowSuccessModal(true);
    }
    setShowDeleteModal(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setEditFormData({
      id: product.id,
      name: product.name,
      measurement_id: product.measurement_id,
      category_id: product.category_id,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      await apiService.updateProduct(editingProduct.id, {
        name: editFormData.name,
        measurement_id: Number(editFormData.measurement_id),
        category_id: Number(editFormData.category_id),
      });

      setModalMessage(t("productList.editSuccess", "Product updated successfully"));
      setShowSuccessModal(true);
      setShowEditModal(false);
      fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      setModalMessage(t("productList.editError", "Failed to update product"));
      setShowSuccessModal(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: name.includes('_id') ? Number(value) : value
    }));
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
          {t("productList.title", "Products")}
        </h1>
        <button
          onClick={() => navigate("/products/create")}
          className="bg-[#6C5DD3] text-white px-4 py-2 text-sm rounded-lg 
          hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2
          dark:focus:ring-offset-gray-800 transition-all duration-200"
        >
          {t("productList.createProduct", "Create Product")}
        </button>
      </div>

      <SearchBar 
        fields={searchFields}
        initialValues={searchParams}
        onSearch={handleSearch}
        className="mb-6"
        t={t}
      />

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("productList.table.number", "#")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("productList.table.name", "Name")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("productList.table.measurement", "Measurement")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("productList.table.category", "Category")}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                {t("productList.table.actions", "Actions")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {products.map((product, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {product.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {measurements.find(m => m.id === product.measurement_id)?.name || product.measurement_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {categories.find(c => c.id === product.category_id)?.name || product.category_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  <Menu as="div" className="relative inline-block text-left">
                    <Menu.Button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                      <EllipsisVerticalIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className={`absolute z-50 mt-2 w-36 rounded-md bg-white dark:bg-gray-800 
                        shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none
                        ${products.indexOf(product) >= products.length - 3 ? "bottom-full mb-2" : "top-full"} 
                        ${products.indexOf(product) >= products.length - 3 ? "origin-bottom-right" : "origin-top-right"}
                        right-0`}>
                        <div className="py-1">
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => handleEdit(product)}
                                className={`${
                                  active ? "bg-gray-100 dark:bg-gray-700" : ""
                                } flex w-full items-center px-4 py-2 text-sm text-blue-600 dark:text-blue-400`}
                              >
                                {t("productList.edit", "Edit")}
                              </button>
                            )}
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={() => handleDelete(product)}
                                className={`${
                                  active ? "bg-gray-100 dark:bg-gray-700" : ""
                                } flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400`}
                              >
                                {t("productList.delete", "Delete")}
                              </button>
                            )}
                          </Menu.Item>
                        </div>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title={t("productList.deleteTitle", "Delete Product")}
        message={t(
          "productList.deleteConfirmation",
          `Are you sure you want to delete product "${productToDelete?.name}" (ID: ${productToDelete?.id})? This action cannot be undone.`
        )}
        confirmText={t("productList.delete", "Delete")}
        cancelText={t("common.cancel", "Cancel")}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={t("common.success")}
        message={modalMessage}
      />

      <Dialog
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto w-full max-w-md rounded-lg bg-white dark:bg-gray-800 p-6">
            <Dialog.Title className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {t("productList.editTitle", "Edit Product")}
            </Dialog.Title>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("productList.form.name", "Name")}
                </label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#6C5DD3] focus:ring-[#6C5DD3] dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("productList.form.measurement", "Measurement")}
                </label>
                <select
                  name="measurement_id"
                  value={editFormData.measurement_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#6C5DD3] focus:ring-[#6C5DD3] dark:bg-gray-700 dark:border-gray-600"
                >
                  {measurements.map(measurement => (
                    <option key={measurement.id} value={measurement.id}>
                      {measurement.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t("productList.form.category", "Category")}
                </label>
                <select
                  name="category_id"
                  value={editFormData.category_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#6C5DD3] focus:ring-[#6C5DD3] dark:bg-gray-700 dark:border-gray-600"
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {t("common.cancel", "Cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#6C5DD3] rounded-md hover:bg-[#5c4eb3]"
                >
                  {t("common.save", "Save")}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}