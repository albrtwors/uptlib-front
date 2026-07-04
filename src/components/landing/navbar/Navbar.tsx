"use client"
import { useState, useEffect } from 'react'
import {
    BookOpenIcon,
    Bars3Icon,
    XMarkIcon,
    UserPlusIcon,
    ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavbarProps {
    activeSection?: string
    onSectionChange?: (section: string) => void
}

export default function Navbar({ activeSection = 'home', onSectionChange }: NavbarProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [localActiveSection, setLocalActiveSection] = useState(activeSection)
    const pathname = usePathname()

    const isLandingPage = pathname === '/welcome'

    // 💡 Sincronizar el estado local con la sección activa provista por el scroll de la Landing
    useEffect(() => {
        setLocalActiveSection(activeSection)
    }, [activeSection])

    // 💡 NUEVO: Detectar hash si el usuario entra directo a /welcome#seccion o recarga allí
    useEffect(() => {
        if (!isLandingPage) return

        const handleInitialHash = () => {
            const hash = window.location.hash
            if (hash) {
                const sectionId = hash.replace('#', '')
                const validSections = ['home', 'mision', 'servicios', 'contacto']

                if (validSections.includes(sectionId)) {
                    setLocalActiveSection(sectionId)

                    // Disparar cambio al padre si es necesario para mantener sincronía
                    if (onSectionChange) onSectionChange(sectionId)

                    // Forzar scroll suave inicial respetando el alto de la Navbar fija
                    setTimeout(() => {
                        const element = document.getElementById(sectionId)
                        if (element) {
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
                    }, 300)
                }
            }
        }

        handleInitialHash()
    }, [isLandingPage])

    // Detectar scroll para efectos visuales translúcidos
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleNavClick = (sectionId: string) => {
        setIsOpen(false)
        setLocalActiveSection(sectionId) // Actualización inmediata en click

        if (isLandingPage && onSectionChange) {
            onSectionChange(sectionId)
            const element = document.getElementById(sectionId)
            if (element) {
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
    }

    const navItems = [
        { id: 'home', label: 'Inicio', icon: '🏠' },
        { id: 'mision', label: 'Misión', icon: '🎯' },
        { id: 'servicios', label: 'Servicios', icon: '📚' },
        { id: 'contacto', label: 'Contacto', icon: '📞' }
    ]

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled
            ? 'bg-white/95 shadow-lg backdrop-blur-md border-b border-gray-200/50'
            : 'bg-white/80 backdrop-blur-sm border-b border-transparent'
            }`}>
            <div className=" mx-auto px-6 md:px-12">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <Link href="/welcome" className="flex items-center space-x-3 group" onClick={() => handleNavClick('home')}>
                        <div className={`w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 ${scrolled ? 'shadow-xl' : 'shadow-lg'}`}>
                            <BookOpenIcon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                Biblioteca Raúl Castillo
                            </h1>
                            <p className="text-xs text-gray-500 font-medium">UPT Aragua FBF</p>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-2">
                        {navItems.map((item) => {
                            const hrefValue = isLandingPage ? `#${item.id}` : `/welcome#${item.id}`;
                            // 💡 Usamos el estado local híbrido para pintar el botón activo
                            const isLinkActive = isLandingPage && localActiveSection === item.id;

                            return (
                                <Link
                                    key={item.id}
                                    href={hrefValue}
                                    onClick={() => handleNavClick(item.id)}
                                    className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${isLinkActive
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                                        }`}
                                >
                                    <span>{item.label}</span>
                                </Link>
                            )
                        })}
                        <Link href="/publicBooks" className={`px-4 py-2 rounded-xl font-semibold transition-all duration-300 ${pathname.startsWith('/publicBooks') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`}>
                            Catálogo Público
                        </Link>
                    </div>

                    {/* Auth Buttons Desktop */}
                    <div className="hidden md:flex items-center space-x-3">
                        <Link
                            href="/signin"
                            className="px-6 py-2.5 bg-blue-700 text-white border border-gray-300  rounded-xl font-semibold hover:bg-blue-600 hover:border-gray-400 transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                            <ArrowRightOnRectangleIcon className="w-5 h-5 inline mr-1" />
                            Iniciar Sesión
                        </Link>
                        <Link
                            href="/signup"
                            className="px-6 py-2.5 bg-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform transition-all duration-300 flex items-center space-x-2"
                        >
                            <UserPlusIcon className="w-5 h-5" />
                            <span>Registrarse</span>
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors">
                        {isOpen ? <XMarkIcon className="w-7 h-7" /> : <Bars3Icon className="w-7 h-7" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden pb-6 pt-2 space-y-3 border-t border-gray-200 bg-white/95 backdrop-blur-md rounded-b-2xl">
                        {navItems.map((item) => (
                            <Link
                                key={item.id}
                                href={isLandingPage ? `#${item.id}` : `/welcome#${item.id}`}
                                onClick={() => handleNavClick(item.id)}
                                className={`px-4 py-4 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-4 ${isLandingPage && localActiveSection === item.id
                                    ? 'bg-blue-600 text-white shadow-lg'
                                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                                    }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    )
}