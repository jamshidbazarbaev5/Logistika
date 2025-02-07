import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/api';

interface TransportType {
  id: number;
  transport_type: string;
}

interface TransportNumber {
  id: number;
  transport_number: string;
  transport_type: number;
  application_id: number;
}

export default function TransportList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [transportTypes, setTransportTypes] = useState<TransportType[]>([]);
  const [transportNumbers, setTransportNumbers] = useState<TransportNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typesResponse, numbersResponse] = await Promise.all([
          api.get('/transport/type/'),
          api.get('/transport/number/')
        ]);
        
        setTransportTypes(typesResponse.data);
        setTransportNumbers(numbersResponse.data);
        setLoading(false);
      } catch (err) {
        setError(t('transportList.errorLoading', 'Error loading transports'));
        setLoading(false);
      }
    };

    fetchData();
  }, [t]);

 

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
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
    <div className="p-4 sm:p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            {t('transportList.title', 'Transports')}
          </h1>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/transport/create')}
              className="bg-[#6C5DD3] text-white px-4 py-2 text-sm rounded-lg 
              hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2
              dark:focus:ring-offset-gray-800 transition-all duration-200"
            >
              {t('transportList.createTransport', 'Create Transport Type')}
            </button>
            {/*<button*/}
            {/*  onClick={() => navigate('/transport/number/create')}*/}
            {/*  className="bg-[#6C5DD3] text-white px-4 py-2 text-sm rounded-lg */}
            {/*  hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2*/}
            {/*  dark:focus:ring-offset-gray-800 transition-all duration-200"*/}
            {/*>*/}
            {/*  {t('transportList.createNumber', 'Add Transport Number')}*/}
            {/*</button>*/}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('transportList.table.id', 'ID')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('transportList.table.type', 'Transport Type')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t('transportList.table.number', 'Transport Number')}
                </th>
              
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {transportTypes.map((type, index) => (
                <tr key={`type-${type.id}`} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {type.transport_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {transportNumbers
                      .filter(num => num.transport_type === type.id)
                      .map(num => num.transport_number)
                      .join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}