// Create a new shared layout component for forms
export default function FormLayout({ 
    title, 
    subtitle, 
    children 
  }: { 
    title: string; 
    subtitle: string; 
    children: React.ReactNode;
  }) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          </div>
          {children}
        </div>
      </div>
    );
  }