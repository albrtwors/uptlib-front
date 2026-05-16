"use client"
import useProfile from "@/hooks/profile/useProfile";
import TaskCard from "../cards/Dashboard/TaskCard";
import Label from "../form/Label";
import Link from "next/link";

export default function IndexPage() {
    const { profile }: any = useProfile();

    return (
        <div className="flex flex-col gap-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

            {/* Estado de Carga */}
            {!profile && <Label isRequired={false}>Cargando...</Label>}

            {/* VISTA: ADMIN / LIBRARIAN */}
            {profile && (profile.role === 'ADMIN' || profile.role === 'LIBRARIAN') && (
                <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        <Link href="/books">
                            <TaskCard title='Gestiona Libros' description="Administra los libros de la aplicación ..." icon="📚" />
                        </Link>
                        <Link href='/inventory'>
                            <TaskCard title='Inventario' description="Administra el inventario de la biblioteca ..." icon="📦" />
                        </Link>
                        <Link href="/inventory/loans">
                            <TaskCard title='Préstamos' description="Gestiona los préstamos de bienes ..." icon="📦" />
                        </Link>
                    </div>
                </div>
            )}

            {/* VISTA: USER (Nuevas Features / Qué hay de nuevo) */}
            {profile && profile.role === 'USER' && (
                <div className="max-w-5xl w-full mx-auto px-4 py-8">
                    {/* Banner de Bienvenida y Novedades */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-6 sm:p-8 shadow-lg mb-8">
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>

                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-white/20 backdrop-blur-md text-white rounded-full uppercase tracking-wider mb-4 animate-pulse">
                            ✨ ¡Nueva Versión Disponible!
                        </span>

                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                            Te damos la bienvenida a Uptalib
                        </h2>
                        <p className="text-blue-100 max-w-2xl text-sm sm:text-base leading-relaxed">
                            Hemos transformado tu biblioteca digital. Ahora cuentas con nuevas herramientas diseñadas para llevar tus lecturas e investigaciones al siguiente nivel. ¡Descubre todo lo que puedes hacer desde hoy!
                        </p>
                    </div>

                    {/* Grid de Características Nuevas */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Feature 1: Leer libros digitales */}
                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col items-start">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-2xl mb-4">
                                📖
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                                Lectura Online Fluida
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                Accede al catálogo completo de **libros digitales** directamente desde tu navegador. Disfruta de un lector integrado, cómodo y adaptado a tus pantallas.
                            </p>
                        </div>

                        {/* Feature 2: Descargar libros */}
                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col items-start">
                            <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-2xl mb-4">
                                ⚡
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                                Descargas Directas
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                ¿Vas a estar sin conexión? Descarga tus materiales y recursos digitales en segundos para poder continuar con tus estudios en cualquier momento y lugar.
                            </p>
                        </div>

                        {/* Feature 3: Elegir favoritos */}
                        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col items-start">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-2xl mb-4">
                                ❤️
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                                Biblioteca Personalizada
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                Marca tus **libros favoritos** con un solo clic. Organiza tu propio estante virtual para retomar tus lecturas recurrentes sin tener que buscarlas de nuevo.
                            </p>
                        </div>
                    </div>

                    {/* Sección de llamada a la acción inferior */}
                    <div className="mt-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-dashed border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            ¿Listo para empezar? Explora nuestro catálogo y estrena estas funciones ahora mismo.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}