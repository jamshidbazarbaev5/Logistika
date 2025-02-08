import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Menu, Moon, Sun, Truck, ChevronDown, ChevronUp } from "lucide-react";
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
  RiLogoutBoxRFill
} from 'react-icons/ri';

const mainMenuItems = [

  // { name: "Photo Report", icon: RiCameraFill, href: "/photo-report" },
  { name: "menu.createApplication", icon: RiFileAddFill, href: "/application-list" },
];

const generalItems = [{ name: "menu.account", icon: RiUserFill, href: "/account" }];

const otherItems = [
  { 
    name: "menu.settings", 
    icon: RiSettings4Fill, 
    href: "#",
    subItems: [
      { name: "menu.createProduct", icon: RiTBoxFill, href: "/product" },
      { name: "menu.createCategory", icon: RiBarChartFill, href: "/category" },
      { name: "menu.measurement", icon: RiBarChartFill, href: "/measurements" },
      { name: "menu.firm", icon: RiBuilding2Fill, href: "/firm-list" },
      { name: "menu.storage", icon: RiStore2Fill, href: "/storage-list" },
      { name: "menu.transport", icon: RiTruckFill, href: "/transport-list" },
      { name: "menu.payment", icon: RiBankCardFill, href: "/payment-list" },
      { name: "menu.createMode", icon: RiSettings4Fill, href: "/modes" },

    ]
  },
  { name: "menu.logout", icon: RiLogoutBoxRFill, href: "#" },
];

export default function Layout() {
  const [isOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

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

  const toggleSubmenu = (menuName: string) => {
    setOpenSubmenu(openSubmenu === menuName ? null : menuName);
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Update the language and theme selectors header - hide when mobile menu is open */}
      <div className={`${isMobileMenuOpen ? 'hidden' : 'fixed'} 
        top-0  p-4 z-50 flex righ-1 items-center gap-2
        lg:right-8`}>
        <button
          onClick={toggleDarkMode}
          className="p-2 rounded-md text-gray-600 ml-10 dark:text-gray-400 hover:text-gray-900 
            dark:hover:text-gray-200 bg-white  dark:bg-gray-800"
        >
          {isDarkMode ? <Sun className="h-5 w-5 md:h-6 md:w-6" /> : <Moon className="h-5 w-5 md:h-6 md:w-6" />}
        </button>   
        
        <select
          onChange={(e) => changeLanguage(e.target.value)}
          value={i18n.language}
          className="rounded-md border border-gray-300 dark:border-gray-600 
            px-1.5 py-1 text-xs
            md:px-2 md:py-1.5 md:text-sm
            lg:px-3 lg:py-2 ml-10
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

      {/* Update mobile menu button position - move it before the selectors */}
      <button
        className="fixed right-4 top-4 z-50 lg:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu className="h-5 w-5 md:h-6 md:w-6 text-gray-600 dark:text-gray-200 mr-12 mt-2" />
      </button>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-20 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          isOpen ? "w-64" : "w-[240px] md:w-70"
        } h-screen bg-white dark:bg-gray-800 fixed left-0 top-0 transition-all duration-300 
        border-r border-gray-200  dark:border-gray-700 z-30
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
        lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700 min-w-[223px]">
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
            <div className="min-w-[223px]">
              <p className="px-2 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {t('menu.mainMenu')}
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
                    <span className="ml-3">{t(item.name)}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* General */}
            <div className="min-w-[256px]">
              <p className="px-2 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {t('menu.general')}
              </p>
              <div className="mt-4 space-y-1">
                {generalItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 w-[150px]
                      rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 whitespace-nowrap"
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="ml-3">{t(item.name)}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Others */}
            <div className="min-w-[256px]">
              <p className="px-2 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {t('menu.others')}
              </p>
              <div className="mt-4 space-y-1">
                {otherItems.map((item) => (
                  <div key={item.name}>
                    <Link
                      to={item.href}
                      onClick={(e) => {
                        e.preventDefault(); // Prevent navigation for items with submenus
                        setIsMobileMenuOpen(false);
                        if (item.name === "menu.logout") {
                          handleLogout();
                        } else if (item.subItems) {
                          toggleSubmenu(item.name);
                        } else {
                          navigate(item.href);
                        }
                      }}
                      className="flex items-center justify-between px-2 py-2 text-sm font-medium text-gray-600
                        dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 whitespace-nowrap w-[220px]"
                    >
                      <div className="flex items-center">
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <span className="ml-3">{t(item.name)}</span>
                      </div>
                      {item.subItems && (
                        openSubmenu === item.name ? 
                          <ChevronUp className="h-4 w-4 mr-[100px]" /> :
                          <ChevronDown className="h-4 w-4 mr-[100px]"  />
                      )}
                    </Link>
                    
                    {item.subItems && openSubmenu === item.name && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center px-2 py-2 text-sm font-medium rounded-lg whitespace-nowrap
                              ${
                                window.location.pathname === subItem.href
                                  ? "text-[#6C5DD3] bg-[#6C5DD3]/10 dark:bg-[#6C5DD3]/20 w-[150px]"
                                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 w-[150px]"
                              }`}
                          >
                            <subItem.icon className="h-5 w-5 flex-shrink-0" />
                            <span className="ml-3">{t(subItem.name)}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Main content - update to use Outlet */}
      <main
        className={`flex-1 transition-all duration-300
          pt-16 px-4 md:px-6 lg:px-8
          ${isOpen ? "lg:ml-64" : "lg:ml-[240px] xl:ml-70"}
          mb-20 w-full
          bg-white dark:bg-gray-900 dark:text-gray-100`}
      >
        <Outlet />
      </main>
    </div>
  );
}
