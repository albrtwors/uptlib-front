"use client"

export default function ManageItemOperationsTable({ operations, onDelete, onEdit }: any) {
    return <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
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
                                <div className="font-semibold text-gray-900 truncate mb-1">{operation.item.name}</div>
                                <div className="text-sm text-gray-500">ID: {operation.item.id}</div>
                            </td>

                            {/* ISBN */}
                            <td className="px-4 py-4 text-sm text-gray-600 hidden md:table-cell">
                                <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                    {operation.personNames + ' ' + operation.personSurNames || 'N/A'}
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


                    <div className="text-xs text-gray-500 mt-2 text-center">
                        Autor: {book.author?.name} | Cat: {book.category?.name}
                    </div>
                </div>
            ))}
        </div>
    </div>

}