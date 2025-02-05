import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Menu, Moon, Sun, Truck } from "lucide-react";
import {
  RiBuilding2Fill,
  RiStore2Fill,
  RiTruckFill,
  RiBankCardFill,
  RiCameraFill,
  RiArchiveFill,
  RiToolsFill,
  RiSettings4Fill,
  RiFileAddFill,
  RiTBoxFill,
  RiBarChartFill,
  RiUserFill,
  RiLogoutBoxRFill
} from 'react-icons/ri';

const mainMenuItems = [
  { name: "firm", icon: RiBuilding2Fill, href: "/firms" },
  { name: "Storage", icon: RiStore2Fill, href: "/storage" },
  { name: "Transport", icon: RiTruckFill, href: "/transport" },
  { name: "Payment", icon: RiBankCardFill, href: "/payment" },
  { name: "Photo Report", icon: RiCameraFill, href: "/photo-report" },
  { name: "Keeping Service", icon: RiArchiveFill, href: "/keeping_service" },
  { name: "Working Service", icon: RiToolsFill, href: "/working_service" },
  { name: "CreateMode", icon: RiSettings4Fill, href: "/mode" },
  { name: "CreateApplication", icon: RiFileAddFill, href: "/application" },
  { name: "CreateProduct", icon: RiTBoxFill, href: "/product" },
  { name: "CreateProductQuantity", icon: RiBarChartFill, href: "/product-quantity" },
];

const generalItems = [{ name: "Account", icon: RiUserFill, href: "/account" }];

const otherItems = [
  { name: "Settings", icon: RiSettings4Fill, href: "/settings" },
  { name: "Log out", icon: RiLogoutBoxRFill, href: "#" },
];

export default function Layout() {
  const [isOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  useEffect(() => {

    const isDark = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(isDark);
    if (isDark) {
        document.documentElement.classList.add('dark');
    }
}, []);

const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', (!isDarkMode).toString());
};

  const languages = [
    // { code: 'en', name: 'English' },
    { code: "uz", name: "O'zbekcha" },
    { code: "ru", name: "Русский" },
    { code: "kaa", name: "Қарақалпақша" },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Update the language and theme selectors header */}
      <div className="fixed top-0 right-16 lg:right-0 p-4 z-40 flex items-center gap-2">
      <button
                                onClick={toggleDarkMode}
                                className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                            >
                                {isDarkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
                            </button>   
        
        <select
          onChange={(e) => changeLanguage(e.target.value)}
          value={i18n.language}
          className="rounded-md border border-gray-300 dark:border-gray-600 px-2 py-1 lg:px-3 lg:py-2 text-xs lg:text-sm 
          focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]
          bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <button
        className="fixed right-4 top-4 z-30 lg:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu className="h-6 w-6 text-gray-600 dark:text-gray-200" />
      </button>

      {/* Sidebar */}
      <div
        className={`${
          isOpen ? "w-64" : "w-70"
        } h-screen bg-white dark:bg-gray-800 fixed left-0 top-0 transition-all duration-300 
        border-r border-gray-200 dark:border-gray-700 z-30 overflow-hidden
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 min-w-[256px]">
          <div className="flex items-center gap-3">
            <div className="bg-[#6C5DD3] p-2 rounded-lg">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              Drivergo
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6">
          <div className="space-y-6">
            <div className="min-w-[256px]">
              <p className="px-2 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                MAIN MENU
              </p>
              <div className="mt-4 space-y-1">
                {mainMenuItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center px-2 py-2 text-sm font-medium rounded-lg group whitespace-nowrap
                      ${
                        window.location.pathname === item.href
                          ? "text-[#6C5DD3] bg-[#6C5DD3]/10 dark:bg-[#6C5DD3]/20"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="ml-3">{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* General */}
            <div className="min-w-[256px]">
              <p className="px-2 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                GENERAL
              </p>
              <div className="mt-4 space-y-1">
                {generalItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 
                      rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 whitespace-nowrap"
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="ml-3">{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Others */}
            <div className="min-w-[256px]">
              <p className="px-2 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                OTHERS
              </p>
              <div className="mt-4 space-y-1">
                {otherItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={(e) => {
                      setIsMobileMenuOpen(false);
                      if (item.name === "Log out") {
                        e.preventDefault();
                        handleLogout();
                      }
                    }}
                    className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 
                      rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 whitespace-nowrap"
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="ml-3">{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Main content - update to use Outlet */}
      <main
        className={`flex-1 transition-all duration-300 pt-16
          ${isOpen ? "lg:ml-64" : "lg:ml-70"}
          ml-80 mb-40 w-full
          bg-white dark:bg-gray-900 dark:text-gray-100`}
      >
        <Outlet />
      </main>
    </div>
  );
}
