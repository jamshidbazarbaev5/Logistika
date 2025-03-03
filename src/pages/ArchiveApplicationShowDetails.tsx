    import { useState, useEffect } from "react";
    import { useParams } from "react-router-dom";
    import { useTranslation } from "react-i18next";
    import { api } from "../api/api";
    import SuccessModal from "../components/SuccessModal";
    import { Tab } from "@headlessui/react";
    import { FormContext } from '../context/FormContext';
    import ServicesTab from '../components/ServicesTab';
    import PhotoReportTab from "../components/PhotoReportTab";
    import ProductsTab from "../components/ProductsTab";
    import ModesTab from "../components/ModesTab";
    import { useFormContext } from "../context/FormContext";
    import type { ApplicationFormData } from '../context/FormContext';

    interface ShowApplicationFormState extends Omit<ApplicationFormData, 'decloration_file'> {
    decloration_file?: string;
    [key: string]: any;
    }



    export default function ShowApplicationDetails() {
    const { id } = useParams<{ id: string }>();
    const { t } = useTranslation();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    
    const [formData, setFormData] = useState<ShowApplicationFormState>({
        firm_id: 0,
        number_of_application: '',
        brutto: null,
        netto: null,
        coming_date: '',
        decloration_date: '',
        decloration_number: '',
        vip_application: false,
        total_price: null,
        discount_price: null,
        keeping_days: 0,
        workers_hours: 0,
        unloading_quantity: 0,
        loading_quantity: 0,
        payment_method: 0,
        keeping_services: [],
        working_services: [],
        upload_keeping_services_quantity: [],
        upload_working_services_quantity: [],
        photo_report: [],
        transport: [],
        modes: [],
        products: [],
        upload_products: [],
        status: 'active',
    });

    const [firms, setFirms] = useState<Array<{ id: number; firm_name: string }>>([]);
    const [keepingServices, setKeepingServices] = useState<Array<{ id: number; name: string; base_price: number }>>([]);
    const [workingServices, setWorkingServices] = useState<Array<{
        id: number;
        year: number;
        base_price: string;
        units: string;
        service: number;
    }>>([]);
    const [transportTypes, setTransportTypes] = useState<Array<{ id: number; transport_type: string }>>([]);
    const [storages, setStorages] = useState<Array<{ id: number; storage_name: string; storage_location: string }>>([]);
    const [products, setProducts] = useState<Array<{
        id: number;
        name: string;
        measurement_id: number;
        category_id: number;
    }>>([]);
    const [availableModes, setAvailableModes] = useState<Array<{ id: number; name_mode: string; code_mode: string }>>([]);

    const [selectedTab, setSelectedTab] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
        try {
            const [
            applicationRes,
            firmsRes,
            keepingServicesRes,
            workingServicesTariffRes,
            transportTypesRes,
            storagesRes,
            productsRes,
            modesRes
            ] = await Promise.all([
            api.get(`/application/${id}/`),
            api.get('/firms/'),
            api.get('/keeping_service/keeping_service_price/'),
            api.get('/working_service/tariff/'),
            api.get('/transport/type/'),
            api.get('/storage/'),
            api.get('/items/product/'),
            api.get('/modes/modes/')
            ]); 

            const applicationData = applicationRes.data;
            
            // Make sure status is set with a default value if it's not provided
            if (!applicationData.status) {
            applicationData.status = 'active';
            }

            // Transform dates
            if (applicationData.coming_date) {
            const [day, month, year] = applicationData.coming_date.split('.');
            applicationData.coming_date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
            if (applicationData.decloration_date) {
            const [day, month, year] = applicationData.decloration_date.split('.');
            applicationData.decloration_date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }

            // Transform keeping services
            applicationData.upload_keeping_services_quantity = applicationData.keeping_services.map((service: any) => ({
            service_type_id: service.service_type_id,
            amount: service.amount
            }));

            // Transform working services
            applicationData.upload_working_services_quantity = applicationData.working_services.map((service: any) => ({
            service_id: service.service_id,
            quantity: service.quantity
            }));

            // Transform modes
            if (applicationData.modes && Array.isArray(applicationData.modes)) {
            applicationData.modes = applicationData.modes.map((mode: any) => ({
                mode_id: mode.mode_id || mode.id
            }));
            }

            setFormData(applicationData);
            setFirms(firmsRes.data.results);
            setKeepingServices(keepingServicesRes.data.results);
            setWorkingServices(workingServicesTariffRes.data.results);
            setTransportTypes(transportTypesRes.data.results);
            setStorages(storagesRes.data.results);
            
            const productsWithDefaults = productsRes.data.results.map((product:any) => ({
            ...product,
            measurement_id: product.measurement_id || 0,
            category_id: product.category_id || 0,
            }));
            
            setProducts(productsWithDefaults);
            setAvailableModes(modesRes.data.results);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Error loading application data');
            setLoading(false);
        }
        };

        fetchData();
    }, [id]);

    const handleTabChange = (index: number) => {
        setSelectedTab(index);
    };

    const classNames = (...classes: string[]) => {
        return classes.filter(Boolean).join(' ');
    };

    const inputClassName = `mt-1 block w-full rounded-md border border-gray-300 
        dark:border-gray-600 px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm 
        bg-gray-50 dark:bg-gray-800 
        text-gray-900 dark:text-gray-100 cursor-not-allowed`;

    const TransportSection = () => {
        const { t } = useTranslation();
        const { formData } = useFormContext();

        return (
        <div className="mt-4 sm:mt-6 border-t pt-4 sm:pt-6">
            <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                {t('editApplication.transportInfo')}
            </h3>
            
            {formData.transport.length > 0 && (
                <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2">
                {formData.transport.map((transport:any, index:number) => (
                    <div 
                    key={index} 
                    className="flex justify-between items-center bg-gray-50 
                        dark:bg-gray-800 p-4 rounded-lg border border-gray-200 
                        dark:border-gray-700"
                    >
                    <div className="flex-1">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                        {transportTypes.find(t => t.id === transport.transport_type)?.transport_type}
                        </span>
                        <span className="mx-2 text-gray-400 dark:text-gray-500">|</span>
                        <span className="text-gray-600 dark:text-gray-300">
                        {t('editApplication.transportNumber')}: {transport.transport_number}
                        </span>
                    </div>
                    </div>
                ))}
                </div>
            )}
            </div>
        </div>
        );
    };

    const handleExport = async () => {
        try {
        const token = localStorage.getItem('accessToken');
        
        const params = new URLSearchParams({
            firm_name: formData.firm_name || '',
            decloration_number: formData.decloration_number || '',
            number_of_application: formData.number_of_application || '',
            firm_INN: formData.firm_INN || '',
            coming_date_gte: formData.coming_date_gte || '',
            coming_date_lte: formData.coming_date_lte || '',
            products: formData.products?.join(',') || ''
        });

        const response = await fetch(`https://cargo-calc.uz/api/v1/export_excel/?${params.toString()}`, {
            headers: {
            'Authorization': `Bearer ${token}`,
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'export.xlsx');
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        } catch (error: any) {
        console.error('Export failed:', error);
        let errorMessage = t('exportError', 'Failed to export data');
        
        if (error.response?.status === 401) {
            errorMessage = t('unauthorizedError', 'Please log in again to export data');
        }
        
        setModalMessage(errorMessage);
        setShowSuccessModal(true);
        }
    };

    const handleModesSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        // In read-only mode, this is just a no-op
        return Promise.resolve();
    };

    if (loading) {
        return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6C5DD3]"></div>
        </div>
        );
    }

    if (error) {
        return <div className="text-red-500 text-center p-4">{error}</div>;
    }

    return (
        <FormContext.Provider value={{ 
        formData: formData as ApplicationFormData,
        setFormData: () => {}
        }}>
        <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto">
            <div className="flex justify-end mb-4">
            <button
                onClick={handleExport}
                className="px-4 py-2 bg-[#6C5DD3] text-white rounded-lg hover:bg-[#5c4eb3] transition-colors"
            >
                {t('exportToExcel', 'Export to Excel')}
            </button>
            </div>

            <Tab.Group selectedIndex={selectedTab} onChange={handleTabChange}>
            <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1 
                overflow-x-auto sticky top-0 z-10 mb-4 -mx-2 sm:mx-0 
                scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                <Tab
                className={({ selected }) =>
                    classNames(
                    'whitespace-nowrap rounded-lg py-2 px-3 sm:py-2.5 sm:px-4 text-xs sm:text-sm font-medium leading-5',
                    'min-w-[100px] sm:min-w-[120px] flex-shrink-0',
                    'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                    'transition-all duration-200 ease-in-out',
                    selected
                        ? 'bg-white text-[#6C5DD3] shadow-sm'
                        : 'text-gray-500 hover:bg-white/[0.12] hover:text-[#6C5DD3]'
                    )
                }
                >
                {t('editApplication.basicInfo', 'Basic Info')}
                </Tab>
                <Tab
                className={({ selected }) =>
                    classNames(
                    'whitespace-nowrap rounded-lg py-2 px-3 sm:py-2.5 sm:px-4 text-xs sm:text-sm font-medium leading-5',
                    'min-w-[100px] sm:min-w-[120px] flex-shrink-0',
                    'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                    'transition-all duration-200 ease-in-out',
                    selected
                        ? 'bg-white text-[#6C5DD3] shadow-sm'
                        : 'text-gray-500 hover:bg-white/[0.12] hover:text-[#6C5DD3]'
                    )
                }
                >
                {t('editApplication.declaration')}
                </Tab>
                <Tab
                className={({ selected }) =>
                    classNames(
                    'whitespace-nowrap rounded-lg py-2 px-3 sm:py-2.5 sm:px-4 text-xs sm:text-sm font-medium leading-5',
                    'min-w-[100px] sm:min-w-[120px] flex-shrink-0',
                    'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                    'transition-all duration-200 ease-in-out',
                    selected
                        ? 'bg-white text-[#6C5DD3] shadow-sm'
                        : 'text-gray-500 hover:bg-white/[0.12] hover:text-[#6C5DD3]'
                    )
                }
                >
                {t('editApplication.services')}
                </Tab>
                <Tab
                className={({ selected }) =>
                    classNames(
                    'whitespace-nowrap rounded-lg py-2 px-3 sm:py-2.5 sm:px-4 text-xs sm:text-sm font-medium leading-5',
                    'min-w-[100px] sm:min-w-[120px] flex-shrink-0',
                    'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                    'transition-all duration-200 ease-in-out',
                    selected
                        ? 'bg-white text-[#6C5DD3] shadow-sm'
                        : 'text-gray-500 hover:bg-white/[0.12] hover:text-[#6C5DD3]'
                    )
                }
                >
                {t('editApplication.photoReport')}
                </Tab>
                <Tab
                className={({ selected }) =>
                    classNames(
                    'whitespace-nowrap rounded-lg py-2 px-3 sm:py-2.5 sm:px-4 text-xs sm:text-sm font-medium leading-5',
                    'min-w-[100px] sm:min-w-[120px] flex-shrink-0',
                    'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                    'transition-all duration-200 ease-in-out',
                    selected
                        ? 'bg-white text-[#6C5DD3] shadow-sm'
                        : 'text-gray-500 hover:bg-white/[0.12] hover:text-[#6C5DD3]'
                    )
                }
                >
                {t('editApplication.products')}
                </Tab>
                <Tab
                className={({ selected }) =>
                    classNames(
                    'whitespace-nowrap rounded-lg py-2 px-3 sm:py-2.5 sm:px-4 text-xs sm:text-sm font-medium leading-5',
                    'min-w-[100px] sm:min-w-[120px] flex-shrink-0',
                    'ring-white ring-opacity-60 ring-offset-2 focus:outline-none',
                    'transition-all duration-200 ease-in-out',
                    selected
                        ? 'bg-white text-[#6C5DD3] shadow-sm'
                        : 'text-gray-500 hover:bg-white/[0.12] hover:text-[#6C5DD3]'
                    )
                }
                >
                {t('editApplication.modes')}
                </Tab>
            </Tab.List>

            <Tab.Panels className="mt-4">
                <Tab.Panel>
                <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="sm:col-span-2 mb-4">
                        <div className="flex items-center">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3">
                            {t('editApplication.vipApplication')}
                        </label>
                        <div className={`h-6 w-11 rounded-full border-2 
                            ${formData.vip_application ? 'bg-[#6C5DD3]' : 'bg-gray-200 dark:bg-gray-700'}`}>
                            <div className={`h-5 w-5 transform rounded-full 
                            bg-white shadow ${formData.vip_application ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('editApplication.numberOfApplication')}
                        </label>
                        <input
                        type="text"
                        value={formData.number_of_application || ''}
                        readOnly
                        disabled
                        className={inputClassName}
                        />
                    </div>

                    <div className="relative">
                        <label htmlFor="firm_search" className="block text-sm font-medium text-gray-600 dark:text-gray-300">
                        {t('editApplication.firm')}
                        </label>
                        <select
                        value={formData.firm_id}
                        disabled
                        className={inputClassName}
                        >
                        <option value="">Select Firm</option>
                        {firms.map((firm) => (
                            <option key={firm.id} value={firm.id}>{firm.firm_name}</option>
                        ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('editApplication.brutto')}
                        </label>
                        <input
                        type="number"
                        value={formData.brutto || ''}
                        readOnly
                        disabled
                        className={inputClassName}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('editApplication.netto')}
                        </label>
                        <input
                        type="number"
                        value={formData.netto || ''}
                        readOnly
                        disabled
                        className={inputClassName}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('editApplication.comingDate')}
                        </label>
                        <input
                        type="date"
                        value={formData.coming_date || ''}
                        readOnly
                        disabled
                        className={inputClassName}
                        />
                    </div>
                    </div>

                    <TransportSection />
                </div>
                </Tab.Panel>

                <Tab.Panel>
                <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('editApplication.declarationNumber')}
                        </label>
                        <input
                        type="text"
                        value={formData.decloration_number}
                        readOnly
                        disabled
                        className={inputClassName}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('editApplication.declarationDate')}
                        </label>
                        <input
                        type="date"
                        value={formData.decloration_date || ''}
                        readOnly
                        disabled
                        className={inputClassName}
                        />
                    </div>

                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('editApplication.declarationFile')}
                        </label>
                        {formData.decloration_file && typeof formData.decloration_file === 'string' && (
                        <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <svg className="w-8 h-8 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {t('editApplication.currentDeclorationFile')}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={(formData.decloration_file as string).split('/').pop()}>
                                    {formData.decloration_file as string}
                                </p>
                                </div>
                            </div>
                            <a
                                href={formData.decloration_file as string}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 text-sm text-[#6C5DD3] hover:bg-[#6C5DD3]/10 rounded-lg transition-colors flex-shrink-0"
                            >
                                {t('editApplication.view')}
                            </a>
                            </div>
                        </div>
                        )}
                    </div>
                    </div>
                </div>
                </Tab.Panel>

                <Tab.Panel>
                <ServicesTab 
                    formData={formData as ApplicationFormData}
                    keepingServices={keepingServices}
                    workingServices={workingServices}
                    setFormData={() => {}}
                    onSuccess={() => {}}
                />
                </Tab.Panel>

                <Tab.Panel>
                <PhotoReportTab 
                    formData={formData as ApplicationFormData}
                    setFormData={() => {}}
                    onSuccess={() => {}}
                    setSelectedTab={(index) => handleTabChange(index)}
                />
                </Tab.Panel>

                <Tab.Panel>
                <ProductsTab 
                    formData={formData as ApplicationFormData}
                    setFormData={() => {}}
                    products={products}
                    storages={storages}
                    readOnly={true}
                    onSuccess={() => {}}
                />
                </Tab.Panel>

                <Tab.Panel>
                <div className="bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-lg shadow-sm">
                    <ModesTab 
                    formData={formData as ApplicationFormData}
                    availableModes={availableModes}
                    setFormData={() => {}}
                    onSubmit={handleModesSubmit}
                    inputClassName={inputClassName} 
                    readOnly={true}
                    />
                </div>
                </Tab.Panel>
            </Tab.Panels>
            </Tab.Group>

            <SuccessModal
            isOpen={showSuccessModal}
            onClose={() => {
                setShowSuccessModal(false);
                setModalMessage('');
            }}
            title={modalMessage.includes('Error') ? 'Error' : 'Success'}
            message={modalMessage}
            />
        </div>
        </FormContext.Provider>
    );
    }