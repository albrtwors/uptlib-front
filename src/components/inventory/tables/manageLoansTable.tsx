"use client"

export default function ManageItemLoansTable({ loanOperations, onSettle, onEdit }: any) {
    return (
        <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
                <table className="w-full table-auto min-w-[850px]">
                    <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Item
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Persona
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                                Cantidad
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                                Tipo
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                                Fecha Préstamo
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden xl:table-cell">
                                Observaciones
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Días
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loanOperations.map((loan: any) => {
                            const daysAgo = Math.floor(
                                (new Date().getTime() - new Date(loan.createdAt).getTime()) / (1000 * 3600 * 24)
                            );

                            return (
                                <tr
                                    key={loan.id}
                                    className="hover:bg-gray-50 transition-colors group"
                                >
                                    {/* Libro */}
                                    <td className="px-4 py-4 font-medium text-gray-900 max-w-[200px] truncate md:max-w-none">
                                        <div className="font-semibold text-gray-900 truncate mb-1">
                                            {loan.item.name || `Item ID: ${loan.itemId}`}
                                        </div>
                                        <div className="text-sm text-gray-500">ID: {loan.itemId}</div>
                                    </td>

                                    {/* Persona */}
                                    <td className="px-4 py-4 text-sm text-gray-600 max-w-[180px] md:max-w-none">
                                        <div className="font-semibold text-gray-900">
                                            {loan.personNames} {loan.personSurNames}
                                        </div>
                                        {loan.personId && (
                                            <div className="text-xs text-gray-500">ID: {loan.personId}</div>
                                        )}
                                    </td>

                                    {/* Cantidad */}
                                    <td className="px-4 py-4 text-sm font-bold text-gray-900 hidden md:table-cell">
                                        <div className="text-2xl font-bold text-orange-600">
                                            {loan.quantity}
                                        </div>
                                        <div className="text-xs text-gray-500">unidades</div>
                                    </td>

                                    {/* Tipo */}
                                    <td className="px-4 py-4 text-sm text-gray-600 hidden lg:table-cell">
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                                            {loan.type}
                                        </span>
                                    </td>

                                    {/* Fecha Préstamo */}
                                    <td className="px-4 py-4 text-sm text-gray-600 hidden lg:table-cell">
                                        {new Date(loan.createdAt).toLocaleDateString('es-ES')}
                                    </td>

                                    {/* Observaciones */}
                                    <td className="px-4 py-4 text-sm text-gray-600 hidden xl:table-cell max-w-[150px] truncate">
                                        {loan.observations ? (
                                            <span className="inline-flex px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full truncate max-w-full">
                                                {loan.observations}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-xs italic">Sin observaciones</span>
                                        )}
                                    </td>

                                    {/* Días */}
                                    <td className="px-4 py-4 text-right">
                                        <div className={`text-sm font-semibold ${daysAgo > 7 ? 'text-red-600' : daysAgo > 3 ? 'text-orange-600' : 'text-green-600'
                                            }`}>
                                            {daysAgo} días
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(loan.updatedAt).toLocaleDateString('es-ES')}
                                        </div>
                                    </td>

                                    {/* ✅ BOTONES ACCIONES */}
                                    <td className="px-4 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            {/* Botón SALDAR */}
                                            <button
                                                onClick={() => onSettle(loan.id)}
                                                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-all group hover:shadow-md flex items-center gap-1 text-sm font-medium"
                                                title="Marcar como devuelto"
                                            >
                                                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                <span className="hidden sm:inline">Saldar</span>
                                            </button>

                                            {/* Botón EDITAR */}
                                            <button
                                                onClick={() => onEdit(loan)}
                                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all group hover:shadow-md flex items-center gap-1 text-sm font-medium"
                                                title="Editar operación"
                                            >
                                                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                <span className="hidden sm:inline">Editar</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden mt-4 space-y-3">
                {loanOperations.map((loan: any) => {
                    const daysAgo = Math.floor(
                        (new Date().getTime() - new Date(loan.createdAt).getTime()) / (1000 * 3600 * 24)
                    );

                    return (
                        <div key={loan.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all group/card">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-lg text-gray-900 truncate flex-1 pr-4">
                                    {loan.bookTitle || `Libro ID: ${loan.bookId}`}
                                </h3>
                                <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                                    {loan.type}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                                <div>
                                    <span className="font-medium text-gray-900">Persona:</span>
                                    <div className="font-semibold text-gray-900 mt-1">
                                        {loan.personNames} {loan.personSurNames}
                                    </div>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-900">Cantidad:</span>
                                    <div className="text-2xl font-bold text-orange-600 mt-1">
                                        {loan.quantity}
                                    </div>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-900">Inicio:</span>
                                    <span className="ml-1 block mt-1 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                        {new Date(loan.createdAt).toLocaleDateString('es-ES')}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-900">Días:</span>
                                    <div className={`text-lg font-bold mt-1 ${daysAgo > 7 ? 'text-red-600' : daysAgo > 3 ? 'text-orange-600' : 'text-green-600'
                                        }`}>
                                        {daysAgo}
                                    </div>
                                </div>
                            </div>

                            {loan.observations && (
                                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <span className="font-medium text-gray-900 text-sm block mb-1">Observaciones:</span>
                                    <p className="text-sm text-yellow-800">{loan.observations}</p>
                                </div>
                            )}

                            {/* ✅ BOTONES MOBILE */}
                            <div className="flex gap-2 pt-2 border-t border-gray-100">
                                <button
                                    onClick={() => onSettle(loan)}
                                    className="flex-1 p-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Saldar
                                </button>
                                <button
                                    onClick={() => onEdit(loan)}
                                    className="flex-1 p-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Editar
                                </button>
                            </div>

                            <div className="text-xs text-gray-500 mt-2 text-center">
                                ID: {loan.id.slice(-8)}
                            </div>
                        </div>
                    );
                })}
            </div>

            {loanOperations.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-lg mb-2">📚</div>
                    <p className="text-gray-500 text-sm">No hay préstamos activos</p>
                </div>
            )}
        </div>
    )

}