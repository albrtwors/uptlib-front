"use client"

export default function ManagePhysicalBooksTable({ operations, onDelete, onEdit }: any) {
    return <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
            <table className="w-full table-auto min-w-[850px]">
                <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Título del Libro
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            ISBN del Libro
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
                            {/* Título */}
                            <td className="px-4 py-4 font-medium text-gray-900 max-w-[200px] truncate md:max-w-none">
                                <div className="font-semibold text-gray-900 truncate mb-1">{operation.book.title}</div>
                                <div className="text-sm text-gray-500">ID: {operation.book.id}</div>
                            </td>

                            {/* ISBN */}
                            <td className="px-4 py-4 text-sm text-gray-600 hidden md:table-cell">
                                <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                    {operation.book.isbn || 'N/A'}
                                </span>
                            </td>

                            {/* Año */}
                            <td className="px-4 py-4 text-sm text-gray-600 hidden lg:table-cell">
                                {
                                    operation.type == 'PRESTAMO' && <p className="font-bold text-yellow-400">{operation.type}</p>
                                }

                                {
                                    operation.type == 'DEVOLUCION' && <p className="font-bold text-blue-600">{operation.type}</p>
                                }

                                {
                                    operation.type == 'BAJA' && <p className="font-bold text-red-600">{operation.type}</p>
                                }

                                {operation.type == 'ENTRADA' && <p className="font-bold text-green-600">{operation.type}</p>}
                            </td>


                            {/* Año */}
                            <td className="px-4 py-4 text-sm text-gray-600 hidden lg:table-cell">
                                {operation.quantity || 'N/A'}
                            </td>


                            {/* Año */}
                            <td className="px-4 py-4 text-sm text-gray-600 hidden lg:table-cell">
                                {new Date(operation.createdAt).toLocaleString('es-ES')}
                            </td>







                            {/* ✅ BOTONES ACCIONES */}
                            <td className="px-4 py-4 text-center">
                                <div className="flex items-center justify-center gap-1">
                                    {/* Botón EDITAR */}
                                    <button
                                        onClick={() => onEdit(operation)}
                                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all group hover:shadow-md flex items-center gap-1 text-sm font-medium"
                                        title="Editar libro"
                                    >
                                        <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        <span className="hidden sm:inline">Editar</span>
                                    </button>

                                    {/* Botón ELIMINAR */}
                                    <button
                                        onClick={() => onDelete(operation)}
                                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all group hover:shadow-md flex items-center gap-1 text-sm font-medium"
                                        title="Eliminar libro"
                                    >
                                        <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span className="hidden sm:inline">Eliminar</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Mobile Cards - CON BOTONES */}
        <div className="md:hidden mt-4 space-y-3">
            {operations.map((book: any) => (
                <div key={book.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all group/card">
                    <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-lg text-gray-900 truncate flex-1 pr-4">
                            {book.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${book.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}>
                            {book.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                        <div>
                            <span className="font-medium text-gray-900">ISBN:</span>
                            <div className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded mt-0.5">
                                {book.isbn || 'N/A'}
                            </div>
                        </div>
                        <div>
                            <span className="font-medium text-gray-900">Año:</span>
                            <span className="ml-1">{book.yearOfPublication || 'N/A'}</span>
                        </div>
                        <div>
                            <span className="font-medium text-gray-900">Stock:</span>
                            <div className="text-lg font-bold text-gray-900 ml-1">{book.totalStock}</div>
                        </div>
                        <div>
                            <span className="font-medium text-gray-900">Editorial:</span>
                            <span className="ml-1 bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">
                                {book.editorial}
                            </span>
                        </div>
                    </div>

                    {/* ✅ BOTONES MOBILE */}
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                        <button
                            onClick={() => onEdit(book)}
                            className="flex-1 p-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                        </button>
                        <button
                            onClick={() => onDelete(book)}
                            className="flex-1 p-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Eliminar
                        </button>
                    </div>

                    <div className="text-xs text-gray-500 mt-2 text-center">
                        Autor: {book.author?.name} | Cat: {book.category?.name}
                    </div>
                </div>
            ))}
        </div>
    </div>

}