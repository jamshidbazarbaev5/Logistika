import { CheckCircle2, X } from "lucide-react"
import { useTranslation } from "react-i18next"

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  message: string
  title?: string
}

export default function SuccessModal({ isOpen, onClose, message, title }: SuccessModalProps) {
  const { t } = useTranslation()
  
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="animate-success-pulse">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-center text-gray-900 mb-2">
            {title || t('common.success')}
          </h3>
          <p className="text-center text-gray-500">
            {message}
          </p>
        </div>

        {/* Action button */}
        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#6C5DD3] text-base font-medium text-white hover:bg-[#5c4eb8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#6C5DD3] sm:ml-3 sm:w-auto sm:text-sm"
          >
            {t('common.ok')}
          </button>
        </div>
      </div>
    </div>
  )
} 