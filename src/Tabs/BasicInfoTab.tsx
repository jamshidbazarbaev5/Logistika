import { useTranslation } from "react-i18next";

interface BasicInfoTabProps {
  formData: any;
  setFormData: (data: any) => void;
  firms: any[];
  firmSearch: string;
  setFirmSearch: (search: string) => void;
  setShowFirmDropdown: (show: boolean) => void;
  showFirmDropdown: boolean;
  filteredFirms: any[];
  handleFirmSelect: (firm: any) => void;
  setShowCreateFirmModal: (show: boolean) => void;
  paymentMethodSearch: string;
  setPaymentMethodSearch: (search: string) => void;
  showPaymentMethodDropdown: boolean;
  setShowPaymentMethodDropdown: (show: boolean) => void;
  paymentMethods: any[];
  handleNextTab: () => void;
}

export const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  formData,
  setFormData,

  firmSearch,
  setFirmSearch,
  showFirmDropdown,
  setShowFirmDropdown,
  filteredFirms,
  handleFirmSelect,
  setShowCreateFirmModal,
  paymentMethodSearch,
  setPaymentMethodSearch,
  showPaymentMethodDropdown,
  setShowPaymentMethodDropdown,
  paymentMethods,
  handleNextTab
}) => {
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
              px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 
              focus:ring-[#6C5DD3] bg-white dark:bg-gray-700 text-gray-900 
              dark:text-gray-100 transition-colors"
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
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
              px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 
              focus:ring-[#6C5DD3] bg-white dark:bg-gray-700 text-gray-900 
              dark:text-gray-100 transition-colors"
          />
        </div>

        <div>
          <label htmlFor="coming_date" className="block text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors">
            {t('createApplication.comingDate', 'Coming Date')}
          </label>
          <input
            type="date"
            name="coming_date"
            id="coming_date"
            value={formData.coming_date}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
              px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 
              focus:ring-[#6C5DD3] bg-white dark:bg-gray-700 text-gray-900 
              dark:text-gray-100 transition-colors"
          />
        </div>

        <div className="relative">
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
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
              px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 
              focus:ring-[#6C5DD3] bg-white dark:bg-gray-700 text-gray-900 
              dark:text-gray-100 transition-colors"
            placeholder={t('createApplication.searchFirm', 'Search for a firm...')}
          />
          
          {showFirmDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
              {filteredFirms.length > 0 ? (
                filteredFirms.map((firm) => (
                  <div
                    key={firm.id}
                    onClick={() => handleFirmSelect(firm)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    {firm.firm_name}
                  </div>
                ))
              ) : (
                <div className="p-4">
                  <p className="text-sm text-gray-500 mb-2">
                    {t('createApplication.noFirmsFound', 'No firms found')}
                  </p>
                  <button
                    onClick={() => setShowCreateFirmModal(true)}
                    className="w-full text-center bg-[#6C5DD3] text-white px-4 py-2 text-sm rounded-lg 
                    hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]"
                  >
                    {t('createApplication.createNewFirm', 'Create New Firm')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative">
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
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
              px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 
              focus:ring-[#6C5DD3] bg-white dark:bg-gray-700 text-gray-900 
              dark:text-gray-100 transition-colors"
            placeholder={t('createApplication.searchPaymentMethod', 'Search for a payment method...')}
          />
          
          {showPaymentMethodDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  onClick={() => {
                    setFormData((prev: any) => ({
                      ...prev,
                      payment_method: method.id
                    }));
                    setPaymentMethodSearch(method.payment_method);
                    setShowPaymentMethodDropdown(false);
                  }}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  {method.payment_method}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={handleNextTab}
          className="bg-[#6C5DD3] text-white px-6 py-2 rounded-lg hover:bg-[#5b4eb3]"
        >
          {t('common.next', 'Next')}
        </button>
      </div>
    </div>
  );
};