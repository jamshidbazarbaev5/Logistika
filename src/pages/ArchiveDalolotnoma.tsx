import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "../api/api";
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface Transaction {
  id: number;
  date_of_transaction: string;
  full_name: string;
  phone_number: string | null;
  car_number: string | null;
  products: {
    quantity: number;
    product: {
      id: number;
      name: string;
      measurement_id: number;
      category_id: number;
      tnved_code: string;
    };
    storage: {
      id: number;
      storage_name: string;
      storage_location: string;
    };
  }[];
  keeping_services: {
    service_type: number;
    amount: number;
    price: string;
  }[];
  working_services: {
    service_type: number;
    quantity: number;
    price: string;
  }[];
}

interface Payment {
  id: number;
  application: number;
  payment_method: number;
  amount: string;
  comment: string;
  created_at: string;
}

export default function ArchiveDalolatnoma() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'transactions' | 'payments' | 'dalolatnoma'>('transactions');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expandedTransactions, setExpandedTransactions] = useState<number[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await api.get(`/transactions/history/${id}`);
        if (response.data) {
          setTransactions(response.data);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setErrorMessage(t('dalolatnoma.fetchError', 'Error fetching transactions'));
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [id]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await api.get(`/application/pay/?application=${id}`);
        const filteredPayments = response.data.results.filter(
          (payment: Payment) => payment.application === Number(id)
        );
        setPayments(filteredPayments);
      } catch (error) {
        console.error('Error fetching payments:', error);
      }
    };

    fetchPayments();
  }, [id]);

  const handleDownloadExcel = async (transactionId: number) => {
    try {
      const response = await api.get(`/export_excel_transaction/${transactionId}/`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dalolatnoma_${transactionId}.xlsx`);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Excel file:', error);
      setErrorMessage(t('dalolatnoma.downloadError', 'Error downloading the file'));
    }
  };

  const toggleTransaction = (transactionId: number) => {
    setExpandedTransactions(prev => 
      prev.includes(transactionId) 
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5DD3]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-gray-900">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(`/archive/${id}`)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          title={t('common.back')}
        >
          <ArrowLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        </button>
        <h1 className="text-2xl font-semibold">
          {t('dalolatnoma.title', 'Dalolatnoma')}
        </h1>
      </div>

      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-4">
          <button
            className={`py-2 px-4 ${
              activeTab === 'transactions'
                ? 'border-b-2 border-[#6C5DD3] text-[#6C5DD3]'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('transactions')}
          >
            {t('calculateServices.calculate')}
          </button>
          <button
            className={`py-2 px-4 ${
              activeTab === 'payments'
                ? 'border-b-2 border-[#6C5DD3] text-[#6C5DD3]'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('payments')}
          >
            {t('calculateServices.payments')}
          </button>
          <button
            className={`py-2 px-4 ${
              activeTab === 'dalolatnoma'
                ? 'border-b-2 border-[#6C5DD3] text-[#6C5DD3]'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('dalolatnoma')}
          >
            {t('calculateServices.dalolatnoma')}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {activeTab === 'transactions' ? (
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t('dalolatnoma.noTransactions')}
            </div>
          ) : (
            transactions.map((transaction) => (
              <div key={transaction.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => toggleTransaction(transaction.id)}
                  className="w-full text-left px-6 py-4 flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium">
                      {t('dalolatnoma.transactionId')} #{transaction.id}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(transaction.date_of_transaction).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <ChevronDownIcon 
                      className={`h-5 w-5 transition-transform duration-200 
                        ${expandedTransactions.includes(transaction.id) ? 'transform rotate-180' : ''}`}
                    />
                  </div>
                </button>

                {expandedTransactions.includes(transaction.id) && (
                  <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    {/* Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {t('dalolatnoma.fullName')}
                        </p>
                        <p className="text-gray-900 dark:text-gray-100">{transaction.full_name}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {t('dalolatnoma.phoneNumber')}
                        </p>
                        <p className="text-gray-900 dark:text-gray-100">{transaction.phone_number}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          {t('dalolatnoma.carNumber')}
                        </p>
                        <p className="text-gray-900 dark:text-gray-100">{transaction.car_number}</p>
                      </div>
                    </div>

                    {/* Services Section */}
                    {(transaction.keeping_services.length > 0 || transaction.working_services.length > 0) && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                          {t('dalolatnoma.services')}
                        </h4>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                          {transaction.keeping_services.map((service, index) => (
                            <div 
                              key={`keeping-${index}`} 
                              className="flex justify-between items-center text-sm border-b last:border-0 border-gray-200 dark:border-gray-600 pb-2 last:pb-0"
                            >
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-900 dark:text-gray-100">
                                  {t('dalolatnoma.keepingService')} #{service.service_type}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400">
                                  × {service.amount}
                                </span>
                              </div>
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {Number(service.price).toLocaleString()} сум
                              </span>
                            </div>
                          ))}
                          
                          {transaction.working_services.map((service, index) => (
                            <div 
                              key={`working-${index}`} 
                              className="flex justify-between items-center text-sm border-b last:border-0 border-gray-200 dark:border-gray-600 pb-2 last:pb-0"
                            >
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-900 dark:text-gray-100">
                                  {t('dalolatnoma.workingService')} #{service.service_type}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400">
                                  × {service.quantity}
                                </span>
                              </div>
                              <span className="font-medium text-gray-900 dark:text-gray-100">
                                {Number(service.price).toLocaleString()} сум
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Products Section */}
                    {transaction.products.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">
                          {t('dalolatnoma.products')}
                        </h4>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                          {transaction.products.map((item, index) => (
                            <div 
                              key={index} 
                              className="flex justify-between items-center text-sm border-b last:border-0 border-gray-200 dark:border-gray-600 pb-2 last:pb-0"
                            >
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-900 dark:text-gray-100">
                                  {item.product.name}
                                </span>
                                <span className="text-gray-500 dark:text-gray-400">
                                  × {item.quantity}
                                </span>
                              </div>
                              <div className="text-right">
                                <p className="text-gray-900 dark:text-gray-100">
                                  {item.storage.storage_name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {item.storage.storage_location}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-6">
                      <button
                        onClick={() => handleDownloadExcel(transaction.id)}
                        className="inline-flex items-center space-x-2 bg-[#6C5DD3] text-white px-4 py-2 rounded-lg hover:bg-[#5c4eb3]"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span>{t('dalolatnoma.download')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : activeTab === 'payments' ? (
        <div className="space-y-4">
          {payments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t('archive.noPayments')}
            </div>
          ) : (
            payments.map((payment) => (
              <div
                key={payment.id}
                className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div>
                  <div className="font-medium">
                    {t('archive.paymentId')} #{payment.id}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(payment.created_at).toLocaleDateString()}
                  </div>
                  {payment.comment && (
                    <div className="text-sm text-gray-600">
                      {payment.comment}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-medium text-[#6C5DD3]">
                    {Number(payment.amount).toLocaleString()} сум
                  </div>
                  <div className="text-sm text-gray-500">
                    {t('archive.paymentMethod')} #{payment.payment_method}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">
            {t('calculateServices.dalolatnomaTitle')}
          </h2>
          
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t('calculateServices.noTransactions')}
            </div>
          ) : (
            <div className="space-y-4">
              {[...transactions]
                .sort((a, b) => b.id - a.id)
                .map((transaction) => (
                  <div 
                    key={transaction.id}
                    className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">
                        {t('calculateServices.transactionId')} #{transaction.id}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(transaction.date_of_transaction).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownloadExcel(transaction.id)}
                      className="inline-flex items-center space-x-2 bg-[#6C5DD3] text-white px-4 py-2 rounded-lg hover:bg-[#5c4eb3]"
                    >
                      <svg 
                        className="w-5 h-5" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
                        />
                      </svg>
                      <span>{t('calculateServices.download')}</span>
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}