// app/publicBooks/layout.tsx (o la carpeta que englobe tus páginas públicas)

import Navbar from "./navbar/Navbar"

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* 💡 Invocamos la Navbar limpia, al no pasarle propiedades de secciones, funciona como un menú estático tradicional */}
            <Navbar />

            {/* 💡 Añadimos un padding superior pt-24 para que el contenido de tus páginas no se tape por el Navbar fijo (fixed) */}
            <main className="pt-24 min-h-[calc(100vh-80px)]">
                {children}
            </main>
        </div>
    )
}