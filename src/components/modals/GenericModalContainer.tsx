export default function GenericModalContainer({ children, className = "" }: any) {
    return <div className="fixed inset-0 z-[999999] flex flex-col items-center justify-center bg-black/50 p-4">

        <div className={`w-full max-w-sm sm:max-w-md md:max-w-xl lg:max-w-2xl max-h-[85dvh] overflow-y-auto rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 sm:p-5 shadow-2xl ${className}`}>

            {children}


        </div>
    </div>

}
