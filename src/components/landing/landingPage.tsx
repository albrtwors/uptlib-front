"use client"
import { useEffect, useState } from 'react'
import {
    BookOpenIcon,
    UsersIcon,
    MapPinIcon,
    PhoneIcon,
    ClockIcon,
    ChevronDownIcon
} from '@heroicons/react/24/outline'
import Navbar from './navbar/Navbar'
import Link from 'next/link'

export default function LandingPage() {
    const [isOpen, setIsOpen] = useState(false)
    const [activeSection, setActiveSection] = useState('home')

    // Detectar sección activa automáticamente mediante scroll
    useEffect(() => {
        const handleScroll = () => {
            // 💡 Sincronizado exactamente con los IDs reales de tus secciones abajo
            const sections = ['home', 'mision', 'servicios', 'contacto']
            for (let section of sections) {
                const element = document.getElementById(section)
                if (element) {
                    const rect = element.getBoundingClientRect()
                    // Si el inicio de la sección cruzó el umbral superior
                    if (rect.top < 120 && rect.bottom > 120) {
                        setActiveSection(section)
                        break
                    }
                }
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToSection = (sectionId: string) => {
        setActiveSection(sectionId)
        const element = document.getElementById(sectionId)
        if (element) {
            // Un pequeño offset para compensar el alto de la barra de navegación fija (fixed)
            const offset = 80
            const bodyRect = document.body.getBoundingClientRect().top
            const elementRect = element.getBoundingClientRect().top
            const elementPosition = elementRect - bodyRect
            const offsetPosition = elementPosition - offset

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            })
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

            {/* Navbar pasándole el estado activo y el manejador de scroll adaptado a /welcome */}
            <Navbar activeSection={activeSection} onSectionChange={scrollToSection} />

            {/* Hero Section */}
            <section id='home' className="relative overflow-hidden bg-blue-600 text-white py-32 px-6 md:px-12">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative max-w-6xl mx-auto text-center">
                    <div className="mb-8">
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                            Biblioteca Raúl Castillo
                        </h1>
                        <p className="text-xl md:text-2xl font-light max-w-3xl mx-auto leading-relaxed">
                            Tu espacio de conocimiento en la <strong>Universidad Politécnica Territorial de Aragua</strong>
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
                        <Link href="/signin">
                            <span className="cursor-pointer bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-300 inline-block">
                                Explora nuestro catálogo virtual
                            </span>
                        </Link>
                    </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/30 to-transparent"></div>
            </section>

            {/* Misión y Visión */}
            <section id="mision" className="py-24 px-6 md:px-12 bg-whiteScroll pt-28">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                                <BookOpenIcon className="w-5 h-5 mr-2" />
                                Nuestra Esencia
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
                                Misión y <span className="text-blue-600">Visión</span>
                            </h2>
                            <div className="space-y-8 text-lg text-gray-600">
                                <div>
                                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">Misión</h3>
                                    <p>Promover el acceso equitativo al conocimiento mediante servicios bibliotecarios innovadores, fomentando la lectura, investigación y actividades culturales que enriquezcan la formación integral de nuestra comunidad universitaria.</p>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-semibold text-gray-900 mb-3">Visión</h3>
                                    <p>Ser el referente bibliotecario de la región, caracterizado por su excelencia en servicios, tecnología de vanguardia y compromiso con la formación de líderes del conocimiento en la UPT de Aragua.</p>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl p-12 backdrop-blur-sm border border-white/30 shadow-2xl">
                                <BookOpenIcon className="w-32 h-32 text-blue-400 mx-auto mb-8 opacity-40" />
                                <div className="text-center">
                                    <div className="text-6xl font-bold text-gray-900 mb-4">+10K</div>
                                    <p className="text-xl text-gray-600">Libros disponibles</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Servicios */}
            <section id='servicios' className="py-24 px-6 md:px-12 bg-gradient-to-b from-gray-50 to-white pt-28">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            Lo que <span className="text-blue-600">ofrecemos</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Servicios diseñados para enriquecer tu experiencia académica y personal
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/50 hover:shadow-2xl hover:-translate-y-4 transition-all duration-500 hover:bg-white">
                            <BookOpenIcon className="w-16 h-16 text-blue-600 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Préstamo de Libros</h3>
                            <p className="text-gray-600 text-center leading-relaxed">Amplio catálogo académico y recreativo disponible para toda la comunidad UPT.</p>
                        </div>

                        <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/50 hover:shadow-2xl hover:-translate-y-4 transition-all duration-500 hover:bg-white">
                            <UsersIcon className="w-16 h-16 text-purple-600 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Juegos de Mesa</h3>
                            <p className="text-gray-600 text-center leading-relaxed">Espacios recreativos con ajedrez, damas y otros juegos para el disfrute colectivo.</p>
                        </div>

                        <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/50 hover:shadow-2xl hover:-translate-y-4 transition-all duration-500 hover:bg-white">
                            <ClockIcon className="w-16 h-16 text-green-600 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Curso de Ajedrez</h3>
                            <p className="text-gray-600 text-center leading-relaxed">Talleres gratuitos para desarrollar habilidades estratégicas y concentración.</p>
                        </div>

                        <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-white/50 hover:shadow-2xl hover:-translate-y-4 transition-all duration-500 hover:bg-white">
                            <BookOpenIcon className="w-16 h-16 text-orange-600 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300" />
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">Taller de Dibujo</h3>
                            <p className="text-gray-600 text-center leading-relaxed">Curso acreditable que potencia la creatividad y habilidades artísticas.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contacto y Ubicación */}
            <section id="contacto" className="py-24 px-6 md:px-12 pt-28">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            <span className="text-blue-600">Contáctanos</span> o visítanos
                        </h2>
                        <p className="text-xl text-gray-600">
                            Estamos aquí para ayudarte en tu camino del conocimiento
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
                                <MapPinIcon className="w-12 h-12 text-blue-600 mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Ubicación</h3>
                                    <p className="text-lg text-gray-600">
                                        Universidad Politécnica Territorial de Aragua (F.B.F.)<br />
                                        <span className="font-semibold">Biblioteca Raúl Castillo</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-4 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl">
                                <PhoneIcon className="w-12 h-12 text-green-600 mt-1 flex-shrink-0" />
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Horario</h3>
                                    <div className="space-y-2 text-lg text-gray-600">
                                        <p>Lunes - Viernes: 8:00 AM - 6:00 PM</p>
                                        <p>Sábados: 9:00 AM - 2:00 PM</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
                                <button
                                    onClick={() => setIsOpen(!isOpen)}
                                    className="w-full flex items-center justify-between text-left p-4 font-semibold text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200"
                                >
                                    <span>📧 Escríbenos</span>
                                    <ChevronDownIcon className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isOpen && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <p className="text-gray-600 mb-4">biblioteca@uptfbf.edu.ve</p>
                                        <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
                                            Enviar mensaje
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mapa placeholder */}
                        <div className="relative h-96 rounded-3xl bg-gradient-to-br from-gray-400 to-gray-600 shadow-2xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center text-white/90">
                                    <MapPinIcon className="w-24 h-24 mx-auto mb-6 opacity-80" />
                                    <div className="text-3xl font-bold mb-4">📍 UPT Aragua FBF</div>
                                    <p className="text-xl">Aquí encontrarás la biblioteca</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12 px-6 md:px-12">
                <div className="max-w-6xl mx-auto text-center">
                    <h3 className="text-3xl font-bold mb-6">Biblioteca Raúl Castillo</h3>
                    <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                        © 2026 Universidad Politécnica Territorial de Aragua - FBF. Todos los derechos reservados.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-gray-400">
                        <a href="#" className="hover:text-white transition-colors">Política de Privacidad</a>
                        <a href="#" className="hover:text-white transition-colors">Términos de Uso</a>
                        <a href="#" className="hover:text-white transition-colors">Accesibilidad</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}