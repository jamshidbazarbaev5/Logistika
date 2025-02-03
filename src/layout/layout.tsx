import { useState } from "react"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"
import {
  Squares2X2Icon,
  TruckIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  FlagIcon,
  QuestionMarkCircleIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline"

const mainMenuItems = [
  { name: "Overview", icon: Squares2X2Icon, href: "/" },
  { name: "firm", icon: TruckIcon, href: "/firms", current: true },
  // { name: "Orders", icon: BoxesStackedIcon, href: "/orders" },
  { name: "Message", icon: ChatBubbleLeftRightIcon, href: "/messages", badge: 6 },
  { name: "Activity", icon: ChartBarIcon, href: "/activity" },
]

const generalItems = [
  { name: "Report", icon: FlagIcon, href: "/report" },
  { name: "Support", icon: QuestionMarkCircleIcon, href: "/support" },
  { name: "Account", icon: UserCircleIcon, href: "/account" },
]

const otherItems = [
  { name: "Settings", icon: Cog6ToothIcon, href: "/settings" },
  { name: "Log out", icon: ArrowRightOnRectangleIcon, href: "/logout" },
]

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isOpen, setIsOpen] = useState(true)
  const { i18n } = useTranslation()

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'uz', name: 'O\'zbekcha' },
    { code: 'ru', name: 'Русский' },
    { code: 'kaa', name: 'Қарақалпақша' }
  ]

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  return (
    <div className="flex">
      <div
        className={`${isOpen ? "w-64" : "w-20"} h-screen bg-white fixed left-0 top-0 transition-width duration-300 border-r border-gray-200`}
      >
        {/* Logo */}
        <div className="flex items-center p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-[#6C5DD3] p-2 rounded-lg">
              <TruckIcon className="h-6 w-6 text-white" />
            </div>
            {isOpen && <span className="text-xl font-semibold">Drivergo</span>}
          </div>
        </div>

        {/* Language Selector */}
        <div className="px-4 py-2 border-b border-gray-100">
          {isOpen ? (
            <select
              onChange={(e) => changeLanguage(e.target.value)}
              value={i18n.language}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          ) : (
            <button
              onClick={() => setIsOpen(true)}
              className="w-full p-2 text-center"
              title="Open to change language"
            >
              {i18n.language.toUpperCase()}
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6">
          {/* Main Menu */}
          <div className="space-y-6">
            <div>
              <p className="px-2 text-xs font-medium text-gray-400 uppercase tracking-wider">
                {isOpen ? "MAIN MENU" : ""}
              </p>
              <div className="mt-4 space-y-1">
                {mainMenuItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-2 py-2 text-sm font-medium rounded-lg group relative
                      ${item.current ? "text-[#6C5DD3] bg-[#6C5DD3]/10" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                    {isOpen && <span>{item.name}</span>}
                    {item.badge && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* General */}
            <div>
              <p className="px-2 text-xs font-medium text-gray-400 uppercase tracking-wider">{isOpen ? "GENERAL" : ""}</p>
              <div className="mt-4 space-y-1">
                {generalItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50"
                  >
                    <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                    {isOpen && <span>{item.name}</span>}
                  </Link>
                ))}
              </div>
            </div>

            {/* Others */}
            <div>
              <p className="px-2 text-xs font-medium text-gray-400 uppercase tracking-wider">{isOpen ? "OTHERS" : ""}</p>
              <div className="mt-4 space-y-1">
                {otherItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50"
                  >
                    <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                    {isOpen && <span>{item.name}</span>}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>
      </div>
      <main className={`flex-1 ${isOpen ? "ml-64" : "ml-20"} transition-margin duration-300`}>
        {children}
      </main>
    </div>
  )
}

