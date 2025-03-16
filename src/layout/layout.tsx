import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Menu, Moon, Sun, Truck, ChevronDown, ChevronRight } from "lucide-react";
import {
  RiBuilding2Fill,
  RiStore2Fill,
  RiTruckFill,
  RiBankCardFill,
  RiSettings4Fill,
  RiFileAddFill,
  RiTBoxFill,
  RiBarChartFill,
  RiUserFill,
  RiServiceFill,
  RiLogoutBoxRFill,
  RiDashboardFill
} from 'react-icons/ri';
import { authService } from '../services/auth';

const menuSections = {
  main: [
    { name: "menu.createApplication", icon: RiFileAddFill, href: "/application-list" },
    { name: "menu.archiveApplication", icon: RiFileAddFill, href: "/archive-application-list" },
  ],
  services: [
    { name: "menu.workingServices", icon: RiServiceFill, href: "/working-services" },
    { name: "menu.keepingServices", icon: RiUserFill, href: "/keeping-services" },
  ],
  settings: [
    { name: "menu.dashboard", icon: RiDashboardFill, href: "/dashboard" },

    { name: "menu.createProduct", icon: RiTBoxFill, href: "/products-list" },
    { name: "menu.createCategory", icon: RiBarChartFill, href: "/category" },
    { name: "menu.measurement", icon: RiBarChartFill, href: "/measurements" },
    { name: "menu.firm", icon: RiBuilding2Fill, href: "/firm-list" },
    { name: "menu.storage", icon: RiStore2Fill, href: "/storage-list" },
    { name: "menu.transport", icon: RiTruckFill, href: "/transport-list" },
    { name: "menu.payment", icon: RiBankCardFill, href: "/payment-list" },
    { name: "menu.createMode", icon: RiSettings4Fill, href: "/modes" },
    { name: "menu.createUser", icon: RiUserFill, href: "/user-list" }
  ]
};



export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [openSections, setOpenSections] = useState<string[]>(['main']);
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  useEffect(() => {
    // Check localStorage for saved preference
    const isDark = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(isDark);
    
    // Apply the theme class
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    // Update classList based on the new state
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save to localStorage
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  const languages = [
    // { code: 'en', name: 'English' },
    { code: "uz", name: "O'zbekcha" },
    { code: "ru", name: "Русский" },
    { code: "kaa", name: "Қарақалпақша" },
  ];

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      {/* Header with Burger Menu and Logo - adjusted top padding from top-0 to top-4 */}
      <div className="fixed top-4 left-0 z-50 flex items-center gap-3">
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Menu className="h-6 w-6 text-gray-600 dark:text-gray-200" />
        </button>
        
        {isMenuOpen && (
          <div className="flex items-center gap-3">
            <div className="bg-[#6C5DD3] p-2 rounded-lg">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Cargo-Calc  
            </h1>
          </div>
        )}
      </div>

      {/* Top Right Controls */}
      <div className="fixed top-0 right-0 p-4 z-50 flex items-center gap-4">
        <select
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          value={i18n.language}
          className="rounded-md border border-gray-300 dark:border-gray-600 
            px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200
            focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>

        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {isDarkMode ? 
            <Sun className="h-5 w-5 text-gray-600 dark:text-gray-200" /> : 
            <Moon className="h-5 w-5 text-gray-600 dark:text-gray-200" />
          }
        </button>

        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600 dark:text-red-400"
          title={t('menu.logout')}
        >
          <RiLogoutBoxRFill className="h-5 w-5" />
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full ${
        isMenuOpen ? 'w-64' : 'w-16'
      } transform transition-all duration-300 ease-in-out flex flex-col border-r 
        border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-40`}>
        <nav className="flex-1 space-y-2 p-4 pt-24 overflow-y-auto">
          {Object.entries(menuSections).map(([section, items]) => (
            <div key={section} className="space-y-1">
              <button
                onClick={() => toggleSection(section)}
                className={`w-full flex items-center ${
                  isMenuOpen ? 'gap-3 px-4' : 'justify-center'
                } py-2 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-700
                text-gray-900 dark:text-gray-200`}
              >
                {isMenuOpen ? (
                  <>
                    {openSections.includes(section) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="capitalize">{t(`menu.${section}`)}</span>
                  </>
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {openSections.includes(section) && (
                <div className="space-y-1 ml-4">
                  {items.map((item, index) => (
                    <Link
                      key={index}
                      to={item.href}
                      className={`w-full flex items-center ${
                        isMenuOpen ? 'gap-3 px-4' : 'justify-center'
                      } py-2 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-700
                      ${window.location.pathname === item.href
                        ? "text-[#6C5DD3] bg-[#6C5DD3]/10 dark:bg-[#6C5DD3]/20"
                        : "text-gray-600 dark:text-gray-300"
                      }`}
                      title={!isMenuOpen ? t(item.name) : undefined}
                    >
                      <item.icon className="h-5 w-5" />
                      {isMenuOpen && t(item.name)}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col ${
        isMenuOpen ? 'ml-64' : 'ml-16'
      } transition-all duration-300 pt-16`}>
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
