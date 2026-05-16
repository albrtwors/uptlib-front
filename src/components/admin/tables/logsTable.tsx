"use client"

export default function ManageLogsTable({ items, onDelete, onEdit }: any) {
    return (
        <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Vista de Tabla - Escritorio (hidden md:block) */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full table-auto min-w-[850px]">
                    <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider w-1/4">
                                ID Registro
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Usuario
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Acción
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Dirección IP
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Fecha y Hora
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {items.map((item: any) => (
                            <tr
                                key={item.id}
                                className="hover:bg-gray-50 transition-colors group"
                            >
                                {/* ID */}
                                <td className="px-4 py-4 font-mono text-xs text-gray-500 max-w-[180px] truncate">
                                    {item.id}
                                </td>

                                {/* Usuario */}
                                <td className="px-4 py-4 text-sm text-gray-600">
                                    <div className="font-semibold text-gray-900">{item.user?.name || item.userId || 'N/A'}</div>
                                    <div className="text-xs text-gray-400 font-mono mt-0.5">UID: {item.userId}</div>
                                </td>

                                {/* Acción */}
                                <td className="px-4 py-4 text-sm font-medium">
                                    <span className="inline-flex px-2.5 py-1 text-xs font-bold bg-blue-100 text-blue-800 rounded-full uppercase tracking-wider">
                                        {item.action}
                                    </span>
                                </td>

                                {/* IP */}
                                <td className="px-4 py-4 text-sm text-gray-600">
                                    <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200">
                                        {item.ip === '::1' ? 'local' : item.ip || 'N/A'}
                                    </span>
                                </td>

                                {/* Fecha */}
                                <td className="px-4 py-4 text-sm text-gray-600">
                                    <div className="font-medium text-gray-900">
                                        {new Date(item.createdAt).toLocaleDateString('es-ES')}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-0.5">
                                        {new Date(item.createdAt).toLocaleTimeString('es-ES', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit'
                                        })}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards - Móvil (md:hidden) */}
            <div className="md:hidden space-y-3">
                {items.map((item: any) => (
                    <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                        {/* Encabezado de la Card */}
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex-1 pr-2">
                                <span className="inline-flex px-2.5 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-full uppercase tracking-wider">
                                    {item.action}
                                </span>
                            </div>
                            <span className="text-xs text-gray-400 font-medium shrink-0">
                                {new Date(item.createdAt).toLocaleDateString('es-ES')}
                            </span>
                        </div>

                        {/* Grid de detalles */}
                        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-2">
                            <div className="col-span-2">
                                <span className="block text-xs font-medium text-gray-400 uppercase">Usuario</span>
                                <div className="font-semibold text-gray-900 mt-0.5">
                                    {item.user?.name || item.userId || 'N/A'}
                                </div>
                                <span className="text-[10px] text-gray-400 font-mono block">UID: {item.userId}</span>
                            </div>

                            <div>
                                <span className="block text-xs font-medium text-gray-400 uppercase">Dirección IP</span>
                                <span className="inline-flex font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-100 mt-1">
                                    {item.ip === '::1' ? 'local' : item.ip || 'N/A'}
                                </span>
                            </div>

                            <div>
                                <span className="block text-xs font-medium text-gray-400 uppercase">Hora</span>
                                <span className="text-gray-900 font-medium block mt-1">
                                    {new Date(item.createdAt).toLocaleTimeString('es-ES', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit'
                                    })}
                                </span>
                            </div>
                        </div>

                        {/* Footer de la tarjeta: ID del Log */}
                        <div className="mt-3 pt-2 border-t border-gray-50 flex items-center justify-between">
                            <span className="text-[10px] text-gray-400 uppercase font-medium">Log ID</span>
                            <span className="text-[10px] font-mono text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded truncate max-w-[180px]">
                                {item.id}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Estado Vacío */}
            {items.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-2xl mb-2">📄</div>
                    <p className="text-gray-500 text-sm font-medium">No se encontraron registros en el historial de auditoría</p>
                </div>
            )}
        </div>
    );
}