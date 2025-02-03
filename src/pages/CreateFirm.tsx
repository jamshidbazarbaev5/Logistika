import { useState } from "react";
import { useTranslation } from "react-i18next";

interface FirmFormData {
  INN: string;
  firm_name: string;
  phoneNumber_firm: string;
  full_name_director: string;
  phoneNumber_director: string;
  firm_trustee: string;
  phoneNumber_trustee: string;
}

export default function CreateFirm() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FirmFormData>({
    INN: "",
    firm_name: "",
    phoneNumber_firm: "",
    full_name_director: "",
    phoneNumber_director: "",
    firm_trustee: "",
    phoneNumber_trustee: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
    // Handle form submission here
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-gray-900">{t('createFirm.title')}</h1>
        <p className="mt-2 text-sm text-gray-600">
          {t('createFirm.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
        {/* Company Information Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-100">
          <h2 className="text-sm font-medium text-gray-900 mb-4">{t('createFirm.companyInfo.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="INN" className="block text-sm font-medium text-gray-600">
                {t('createFirm.companyInfo.inn')}
              </label>
              <input
                type="text"
                name="INN"
                id="INN"
                value={formData.INN}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                placeholder={t('createFirm.companyInfo.innPlaceholder')}
              />
            </div>
            <div>
              <label htmlFor="firm_name" className="block text-sm font-medium text-gray-600">
                {t('createFirm.companyInfo.firmName')}
              </label>
              <input
                type="text"
                name="firm_name"
                id="firm_name"
                value={formData.firm_name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                placeholder={t('createFirm.companyInfo.firmNamePlaceholder')}
              />
            </div>
            <div>
              <label htmlFor="phoneNumber_firm" className="block text-sm font-medium text-gray-600">
                {t('createFirm.companyInfo.phoneNumber')}
              </label>
              <input
                type="tel"
                name="phoneNumber_firm"
                id="phoneNumber_firm"
                value={formData.phoneNumber_firm}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                placeholder={t('createFirm.companyInfo.phonePlaceholder')}
              />
            </div>
          </div>
        </div>

        {/* Director Information Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-100">
          <h2 className="text-sm font-medium text-gray-900 mb-4">{t('createFirm.directorInfo.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="full_name_director" className="block text-sm font-medium text-gray-600">
                {t('createFirm.directorInfo.fullName')}
              </label>
              <input
                type="text"
                name="full_name_director"
                id="full_name_director"
                value={formData.full_name_director}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                placeholder={t('createFirm.directorInfo.fullNamePlaceholder')}
              />
            </div>
            <div>
              <label htmlFor="phoneNumber_director" className="block text-sm font-medium text-gray-600">
                {t('createFirm.directorInfo.phoneNumber')}
              </label>
              <input
                type="tel"
                name="phoneNumber_director"
                id="phoneNumber_director"
                value={formData.phoneNumber_director}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                placeholder={t('createFirm.directorInfo.phonePlaceholder')}
              />
            </div>
          </div>
        </div>

        {/* Trustee Information Section */}
        <div className="bg-white p-6 rounded-lg border border-gray-100">
          <h2 className="text-sm font-medium text-gray-900 mb-4">{t('createFirm.trusteeInfo.title')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firm_trustee" className="block text-sm font-medium text-gray-600">
                {t('createFirm.trusteeInfo.fullName')}
              </label>
              <input
                type="text"
                name="firm_trustee"
                id="firm_trustee"
                value={formData.firm_trustee}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                placeholder={t('createFirm.trusteeInfo.fullNamePlaceholder')}
              />
            </div>
            <div>
              <label htmlFor="phoneNumber_trustee" className="block text-sm font-medium text-gray-600">
                {t('createFirm.trusteeInfo.phoneNumber')}
              </label>
              <input
                type="tel"
                name="phoneNumber_trustee"
                id="phoneNumber_trustee"
                value={formData.phoneNumber_trustee}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                placeholder={t('createFirm.trusteeInfo.phonePlaceholder')}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#6C5DD3] text-white px-4 py-2 text-sm rounded-lg hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2"
          >
            {t('createFirm.submit')}
          </button>
        </div>
      </form>
    </div>
  );
}
