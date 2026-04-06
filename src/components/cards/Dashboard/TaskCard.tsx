"use client"
export default function TaskCard({ icon, title, description, buttonText = 'Ver Mas' }: { icon: string, description: string, title: string, buttonText?: string }) {
    return <div className="group">
        <div className="bg-white/80 backdrop-blur-xl shadow-xl rounded-3xl p-8 border border-white/50 hover:border-indigo-200/60 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 hover:bg-white/95">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300 mx-auto">
                {icon}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors duration-300">
                {title}
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
                {description}
            </p>
            <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-2xl font-semibold shadow-lg hover:from-blue-600 hover:to-indigo-700 transform hover:scale-[1.02] transition-all duration-300">
                {buttonText}
            </button>
        </div>
    </div>
}