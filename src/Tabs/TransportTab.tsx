import { useState, useEffect } from "react";
import { api } from '../api/api'
import { useTranslation } from "react-i18next";

interface TransportTabProps {
  formData: any;
  setFormData: (data: any) => void;
  handleNextTab: () => void;
}

export const TransportTab: React.FC<TransportTabProps> = ({
  formData,
  setFormData,
  handleNextTab
}) => {
  const { t } = useTranslation();
  const [transportNumber, setTransportNumber] = useState('');
  const [transportTypeId, setTransportTypeId] = useState<number>(0);
  const [transportTypes, setTransportTypes] = useState<any[]>([]);

  useEffect(() => {
    const fetchTransportTypes = async () => {
      try {
        const response = await api.get('/transport/type/');
        setTransportTypes(response.data);
      } catch (error) {
        console.error('Error fetching transport types:', error);
      }
    };
    fetchTransportTypes();
  }, []);
  
  const handleAddTransport = () => {
    if (!transportNumber || !transportTypeId) return;
  
    setFormData((prev:any) => ({
      ...prev,
      transport_numbers: [
        ...prev.transport_numbers,
        {
          transport_number: transportNumber,
          transport_type: transportTypeId
        }
      ]
    }));
  
    setTransportNumber('');
    setTransportTypeId(0);
  };
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
            {t('createApplication.transportNumber', 'Transport Number')}
          </label>
          <input
            type="text"
            value={transportNumber}
            onChange={(e) => setTransportNumber(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
              px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 
              focus:ring-[#6C5DD3] bg-white dark:bg-gray-700 text-gray-900 
              dark:text-gray-100 transition-colors"
            placeholder="Enter transport number"
          />
        </div>
  
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
            {t('createApplication.transportType', 'Transport Type')}
          </label>
          <select
            value={transportTypeId}
            onChange={(e) => setTransportTypeId(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
              px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 
              focus:ring-[#6C5DD3] bg-white dark:bg-gray-700 text-gray-900 
              dark:text-gray-100 transition-colors"
          >
            <option value={0}>{t('createApplication.selectTransportType', 'Select Transport Type')}</option>
            {transportTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.transport_type}
              </option>
            ))}
          </select>
        </div>
      </div>
  
      <button
        onClick={handleAddTransport}
        disabled={!transportNumber || !transportTypeId}
        className="mt-6 w-full sm:w-auto px-6 py-2.5 bg-[#6C5DD3] text-white rounded-lg 
          font-medium hover:bg-[#5b4eb3] disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200 ease-in-out shadow-sm"
      >
        {t('createApplication.addTransport', 'Add Transport')}
      </button>
  
      {formData.transport_numbers.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            {t('createApplication.addedTransports', 'Added Transports')}
          </h3>
          <div className="space-y-2">
            {formData.transport_numbers.map((transport: any, index: number) => {
              const type = transportTypes.find(t => t.id === transport.transport_type);
              return (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span>
                    {transport.transport_number} - {type?.transport_type}
                  </span>
                  <button
                    onClick={() => {
                      setFormData((prev:any) => ({
                        ...prev,
                        transport_numbers: prev.transport_numbers.filter((_: any, i: number) => i !== index)
                      }));
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    {t('common.remove', 'Remove')}
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
          {t('common.next', 'Next')}
        </button>
      </div>
    </div>
  );
};