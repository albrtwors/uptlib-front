"use client"

export default function ManageUsersTable({ items, onEditRole, onToggleBlock }: any) {
    return (
        <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Vista de Tabla - Escritorio (hidden md:block) */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full table-auto min-w-[850px]">
                    <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Nombre
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                                Email
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                                Rol
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Estado
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-32">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {items.map((user: any) => (
                            <tr
                                key={user.id}
                                className="hover:bg-gray-50 transition-colors group"
                            >
                                {/* Nombre */}
                                <td className="px-4 py-4 font-medium text-gray-900 max-w-[200px] truncate md:max-w-none">
                                    <div className="font-semibold text-gray-900 truncate mb-1">{user.name}</div>
                                    <div className="text-sm text-gray-500">ID: {user.id}</div>
                                </td>

                                {/* Email */}
                                <td className="px-4 py-4 text-sm text-gray-600 hidden md:table-cell max-w-[250px] truncate">
                                    <span className="inline-flex px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                        {user.email}
                                    </span>
                                </td>

                                {/* Rol */}
                                <td className="px-4 py-4 text-sm text-gray-600 hidden lg:table-cell">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                            user.role === 'MODERATOR' ? 'bg-orange-100 text-orange-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>

                                {/* Bloqueado */}
                                <td className="px-4 py-4 text-right text-sm font-medium">
                                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${user.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                        {user.isBlocked ? 'Bloqueado' : 'Activo'}
                                    </span>
                                </td>

                                {/* Acciones Escritorio */}
                                <td className="px-4 py-4 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <button
                                            onClick={() => onEditRole(user)}
                                            className="p-1.5 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-all flex items-center gap-1 text-xs font-medium"
                                            title="Modificar rol"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                            <span>Rol</span>
                                        </button>

                                        <button
                                            onClick={() => onToggleBlock(user)}
                                            className={`p-1.5 rounded-lg transition-all flex items-center gap-1 text-xs font-medium ${user.isBlocked
                                                    ? 'text-green-600 hover:text-green-800 hover:bg-green-50'
                                                    : 'text-red-600 hover:text-red-800 hover:bg-red-50'
                                                }`}
                                            title={user.isBlocked ? 'Desbloquear usuario' : 'Bloquear usuario'}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            <span>{user.isBlocked ? 'Desbloquear' : 'Bloquear'}</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards - Móvil (md:hidden) */}
            <div className="md:hidden space-y-3">
                {items.map((user: any) => (
                    <div key={user.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                        {/* Encabezado */}
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex-1 pr-2">
                                <h3 className="font-bold text-base text-gray-900 line-clamp-1">
                                    {user.name}
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">ID: {user.id}</p>
                            </div>
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full shrink-0 ${user.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                }`}>
                                {user.isBlocked ? 'Bloqueado' : 'Activo'}
                            </span>
                        </div>

                        {/* Detalles */}
                        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                            <div className="col-span-2">
                                <span className="block text-xs font-medium text-gray-400 uppercase">Email</span>
                                <span className="inline-flex px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded mt-1 break-all max-w-full">
                                    {user.email}
                                </span>
                            </div>
                            <div className="col-span-2">
                                <span className="block text-xs font-medium text-gray-400 uppercase">Rol Asignado</span>
                                <span className={`inline-flex px-2.5 py-0.5 rounded text-xs font-semibold mt-1 ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                        user.role === 'MODERATOR' ? 'bg-orange-100 text-orange-800' :
                                            'bg-gray-100 text-gray-800'
                                    }`}>
                                    {user.role}
                                </span>
                            </div>
                        </div>

                        {/* Botones de Acción Móviles */}
                        <div className="flex gap-2 pt-3 border-t border-gray-100">
                            <button
                                onClick={() => onEditRole(user)}
                                className="flex-1 p-2 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                Rol
                            </button>
                            <button
                                onClick={() => onToggleBlock(user)}
                                className={`flex-1 p-2 text-white text-xs font-medium rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-sm ${user.isBlocked
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                    }`}
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                {user.isBlocked ? 'Desbloquear' : 'Bloquear'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Estado Vacío */}
            {items.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-2xl mb-2">👥</div>
                    <p className="text-gray-500 text-sm font-medium">No se encontraron usuarios registrados</p>
                </div>
            )}
        </div>
    );
}