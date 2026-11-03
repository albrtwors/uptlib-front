export default function PageFallback() {
    return <div className="flex items-center gap-3 p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <p className="text-sm text-gray-500">Cargando…</p>
    </div>
}
