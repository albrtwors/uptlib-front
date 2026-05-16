"use client"

export default function ManageItemOperationsTable({ operations, onDelete, onEdit }: any) {
    return (
        <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Vista de Tabla - Se oculta en móviles (hidden md:block) */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full table-auto min-w-[850px]">
                    <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Item
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Responsable
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                                Tipo de operación
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                                Cantidad
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden xl:table-cell">
                                Fecha
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {operations.map((operation: any) => (
                            <tr
                                key={operation.id}
                                className="hover:bg-gray-50 transition-colors group"
                            >
                                {/* Item */}
                                <td className="px-4 py-4 font-medium text-gray-900 max-w-[200px] truncate md:max-w-none">
                                    <div className="font-semibold text-gray-900 truncate mb-1">{operation.item?.name}</div>
                                    <div className="text-sm text-gray-500">ID: {operation.item?.id}</div>
                                </td>

                                {/* Responsable */}
                                <td className="px-4 py-4 text-sm text-gray-600">
                                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                        {operation.personNames && operation.personSurNames
                                            ? `${operation.personNames} ${operation.personSurNames}`
                                            : 'N/A'}
                                    </span>
                                </td>

                                {/* Tipo de Operación */}
                                <td className="px-4 py-4 text-sm font-bold hidden md:table-cell">
                                    {operation.type === 'PRESTAMO' && <span className="text-yellow-500">{operation.type}</span>}
                                    {operation.type === 'DEVOLUCION' && <span className="text-blue-600">{operation.type}</span>}
                                    {operation.type === 'BAJA' && <span className="text-red-600">{operation.type}</span>}
                                    {operation.type === 'ENTRADA' && <span className="text-green-600">{operation.type}</span>}
                                </td>

                                {/* Cantidad */}
                                <td className="px-4 py-4 text-sm font-semibold text-gray-900 hidden lg:table-cell">
                                    {operation.quantity || '0'}
                                </td>

                                {/* Fecha */}
                                <td className="px-4 py-4 text-sm text-gray-600 hidden xl:table-cell">
                                    {new Date(operation.createdAt).toLocaleString('es-ES')}
                                </td>

                                {/* Acciones Tabla */}
                                <td className="px-4 py-4 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <button
                                            onClick={() => onEdit(operation)}
                                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
                                            title="Editar operación"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => onDelete(operation)}
                                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
                                            title="Eliminar operación"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards - Se muestra SOLO en móviles (md:hidden) */}
            <div className="md:hidden space-y-3">
                {operations.map((operation: any) => (
                    <div key={operation.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                        {/* Encabezado: Nombre del Item y Etiqueta del tipo de operación */}
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex-1 pr-2">
                                <h3 className="font-bold text-base text-gray-900 line-clamp-2">
                                    {operation.item?.name}
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">Item ID: {operation.item?.id}</p>
                            </div>

                            {/* Badge de color según el tipo */}
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${operation.type === 'PRESTAMO' ? 'bg-yellow-100 text-yellow-800' :
                                    operation.type === 'DEVOLUCION' ? 'bg-blue-100 text-blue-800' :
                                        operation.type === 'BAJA' ? 'bg-red-100 text-red-800' :
                                            'bg-green-100 text-green-800'
                                }`}>
                                {operation.type}
                            </span>
                        </div>

                        {/* Grid de detalles */}
                        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                            <div className="col-span-2 bg-gray-50 p-2 rounded-lg">
                                <span className="block text-xs font-medium text-gray-400 uppercase">Responsable</span>
                                <div className="font-semibold text-gray-900 mt-0.5">
                                    {operation.personNames && operation.personSurNames
                                        ? `${operation.personNames} ${operation.personSurNames}`
                                        : 'N/A'}
                                </div>
                            </div>
                            <div>
                                <span className="block text-xs font-medium text-gray-400 uppercase">Cantidad</span>
                                <div className="text-lg font-bold text-gray-900 mt-0.5">
                                    {operation.quantity || '0'} <span className="text-xs font-normal text-gray-500">uds.</span>
                                </div>
                            </div>
                            <div>
                                <span className="block text-xs font-medium text-gray-400 uppercase">Fecha y Hora</span>
                                <span className="text-gray-900 text-xs block mt-1 leading-tight">
                                    {new Date(operation.createdAt).toLocaleString('es-ES')}
                                </span>
                            </div>
                        </div>

                        {/* Botones de Acción Móviles */}
                        <div className="flex gap-2 pt-3 border-t border-gray-100">
                            <button
                                onClick={() => onEdit(operation)}
                                className="flex-1 p-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Editar
                            </button>
                            <button
                                onClick={() => onDelete(operation)}
                                className="flex-1 p-2 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Eliminar
                            </button>
                        </div>

                        <div className="text-[10px] text-gray-400 mt-2 text-center font-mono">
                            OP ID: {operation.id}
                        </div>
                    </div>
                ))}
            </div>

            {/* Estado Vacío */}
            {operations.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-2xl mb-2">📋</div>
                    <p className="text-gray-500 text-sm font-medium">No hay operaciones registradas en el historial</p>
                </div>
            )}
        </div>
    )
}