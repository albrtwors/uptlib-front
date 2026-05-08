"use client"

export default function ManageLogsTable({ items, onDelete, onEdit }: any) {
    return <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
            <table className="w-full table-auto min-w-[850px]">
                <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Usuario
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Acción
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            IP
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Fecha
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
                            <td className="px-4 py-4 font-medium text-gray-900 max-w-[200px] truncate">
                                <div className="font-semibold text-gray-900 truncate mb-1">{item.id}</div>
                            </td>

                            {/* Usuario */}
                            <td className="px-4 py-4 text-sm text-gray-600">
                                <div className="font-medium text-gray-900">{item.user?.name || item.userId}</div>
                                <div className="text-xs text-gray-500">ID: {item.userId}</div>
                            </td>

                            {/* Acción */}
                            <td className="px-4 py-4 text-sm font-medium">
                                <span className="inline-flex px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full uppercase">
                                    {item.action}
                                </span>
                            </td>

                            {/* IP */}
                            <td className="px-4 py-4 text-sm text-gray-600">
                                <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                    {item.ip === '::1' ? 'local' : item.ip || 'N/A'}
                                </span>
                            </td>

                            {/* Fecha */}
                            <td className="px-4 py-4 text-sm text-gray-600">
                                <div className="font-medium text-gray-900">
                                    {new Date(item.createdAt).toLocaleDateString('es-ES')}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {new Date(item.createdAt).toLocaleTimeString('es-ES', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden mt-4 space-y-3">
            {items.map((item: any) => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all group/card">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg text-gray-900 truncate flex-1 pr-4">
                            {item.action}
                        </h3>
                        <div className="text-xs text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString('es-ES')}
                        </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                        <div>
                            <span className="font-medium text-gray-900">ID:</span>
                            <div className="font-mono text-sm ml-2">{item.id}</div>
                        </div>
                        <div>
                            <span className="font-medium text-gray-900">Usuario:</span>
                            <span className="ml-2 font-medium text-gray-900">{item.user?.name || item.userId}</span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-900">IP:</span>
                            <span className="ml-2 font-mono bg-gray-100 px-2 py-0.5 rounded text-xs">
                                {item.ip === '::1' ? 'local' : item.ip || 'N/A'}
                            </span>
                        </div>
                        <div className="text-xs text-gray-500">
                            {new Date(item.createdAt).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                            })}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
}