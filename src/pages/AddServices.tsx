// import React, { useState } from 'react';
// import { apiService } from '../api/api';
// import { useNavigate } from 'react-router-dom';

// interface ServiceForm {
//   keepingServices: {
//     name: string;
//     base_day: number;
//     base_price: string;
//     extra_price: string;
//   }[];
//   workingServices: {
//     name: string;
//     price: string;
//     base_day: number;
//     base_price: string;
//     extra_price: string;
//     units: string;
//   }[];
// }

// const AddServices: React.FC = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState<ServiceForm>({
//     keepingServices: [{ name: '', base_day: 0, base_price: '', extra_price: '' }],
//     workingServices: [{ name: '', price: '', base_day: 0, base_price: '', extra_price: '', units: '' }]
//   });

//   const handleKeepingServiceChange = (index: number, field: keyof typeof formData.keepingServices[0], value: string | number) => {
//     const newServices = [...formData.keepingServices];
//     newServices[index] = { ...newServices[index], [field]: value };
//     setFormData({ ...formData, keepingServices: newServices });
//   };

//   const handleWorkingServiceChange = (index: number, field: keyof typeof formData.workingServices[0], value: string | number) => {
//     const newServices = [...formData.workingServices];
//     newServices[index] = { ...newServices[index], [field]: value };
//     setFormData({ ...formData, workingServices: newServices });
//   };

//   const addKeepingService = () => {
//     setFormData({
//       ...formData,
//       keepingServices: [...formData.keepingServices, { name: '', base_day: 0, base_price: '', extra_price: '' }]
//     });
//   };

//   const addWorkingService = () => {
//     setFormData({
//       ...formData,
//       workingServices: [...formData.workingServices, { name: '', price: '', base_day: 0, base_price: '', extra_price: '', units: '' }]
//     });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       // Submit all keeping services
//       for (const service of formData.keepingServices) {
//         await apiService.createKeepingService(service);
//       }
//       // Submit all working services
//       for (const service of formData.workingServices) {
//         await apiService.createWorkingService(service);
//       }
//       navigate('/dashboard');
//     } catch (error) {
//       console.error('Error creating services:', error);
//     }
//   };

//   return (
//     <div className="p-4 sm:p-6">
//       <div className="mb-6 sm:mb-8">
//         <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
//           Add Services
//         </h1>
//         <p className="mt-1 sm:mt-2 text-sm text-gray-600 dark:text-gray-400">
//           Add keeping and working services for your firm
//         </p>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full max-w-4xl">
//         {/* Keeping Services Section */}
//         <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-100 dark:border-gray-700">
//           <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
//             Keeping Services
//           </h2>
//           {formData.keepingServices.map((service, index) => (
//             <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
//                   Service Name
//                 </label>
//                 <input
//                   type="text"
//                   value={service.name}
//                   onChange={(e) => handleKeepingServiceChange(index, 'name', e.target.value)}
//                   className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
//                   px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
//                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
//                   placeholder="Enter service name"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
//                   Base Days
//                 </label>
//                 <input
//                   type="number"
//                   value={service.base_day}
//                   onChange={(e) => handleKeepingServiceChange(index, 'base_day', parseInt(e.target.value))}
//                   className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
//                   px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
//                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
//                   placeholder="Enter base days"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
//                   Base Price
//                 </label>
//                 <input
//                   type="text"
//                   value={service.base_price}
//                   onChange={(e) => handleKeepingServiceChange(index, 'base_price', e.target.value)}
//                   className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
//                   px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
//                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
//                   placeholder="Enter base price"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
//                   Extra Price
//                 </label>
//                 <input
//                   type="text"
//                   value={service.extra_price}
//                   onChange={(e) => handleKeepingServiceChange(index, 'extra_price', e.target.value)}
//                   className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
//                   px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
//                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
//                   placeholder="Enter extra price"
//                 />
//               </div>
//             </div>
//           ))}
//           <button
//             type="button"
//             onClick={addKeepingService}
//             className="w-full sm:w-auto bg-[#6C5DD3] text-white px-4 py-2 text-sm rounded-lg 
//             hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2
//             dark:focus:ring-offset-gray-800"
//           >
//             Add Another Keeping Service
//           </button>
//         </div>

//         {/* Working Services Section */}
//         <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border border-gray-100 dark:border-gray-700">
//           <h2 className="text-sm font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">
//             Working Services
//           </h2>
//           {formData.workingServices.map((service, index) => (
//             <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
//                   Service Name
//                 </label>
//                 <input
//                   type="text"
//                   value={service.name}
//                   onChange={(e) => handleWorkingServiceChange(index, 'name', e.target.value)}
//                   className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
//                   px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
//                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
//                   placeholder="Enter service name"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
//                   Base Days
//                 </label>
//                 <input
//                   type="number"
//                   value={service.base_day}
//                   onChange={(e) => handleWorkingServiceChange(index, 'base_day', parseInt(e.target.value))}
//                   className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
//                   px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
//                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
//                   placeholder="Enter base days"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
//                   Base Price
//                 </label>
//                 <input
//                   type="text"
//                   value={service.base_price}
//                   onChange={(e) => handleWorkingServiceChange(index, 'base_price', e.target.value)}
//                   className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
//                   px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
//                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
//                   placeholder="Enter base price"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
//                   Extra Price
//                 </label>
//                 <input
//                   type="text"
//                   value={service.extra_price}
//                   onChange={(e) => handleWorkingServiceChange(index, 'extra_price', e.target.value)}
//                   className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
//                   px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
//                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
//                   placeholder="Enter extra price"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600 dark:text-gray-300">
//                   Units
//                 </label>
//                 <input
//                   type="text"
//                   value={service.units}
//                   onChange={(e) => handleWorkingServiceChange(index, 'units', e.target.value)}
//                   className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 
//                   px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
//                   bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
//                   placeholder="Enter units"
//                 />
//               </div>
//             </div>
//           ))}
//           <button
//             type="button"
//             onClick={addWorkingService}
//             className="w-full sm:w-auto bg-[#6C5DD3] text-white px-4 py-2 text-sm rounded-lg 
//             hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2
//             dark:focus:ring-offset-gray-800"
//           >
//             Add Another Working Service
//           </button>
//         </div>

//         <div className="flex justify-end">
//           <button
//             type="submit"
//             className="w-full sm:w-auto bg-[#6C5DD3] text-white px-4 py-2 text-sm rounded-lg 
//             hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2
//             dark:focus:ring-offset-gray-800"
//           >
//             Save All Services
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default AddServices;