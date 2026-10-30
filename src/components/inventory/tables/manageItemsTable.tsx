"use client"

import Checkbox from "@/components/form/input/Checkbox"
import type { RowSelection } from "@/hooks/lib/useRowSelection"

export default function ManageItemsTable({ items, onDelete, onEdit, onCopies, selection }: { items: any[], onDelete: any, onEdit: any, onCopies?: any, selection?: RowSelection }) {
    return (
        <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 dark:bg-gray-900">
            {/* Vista de Tabla - Se oculta en móviles (md:block) */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full table-auto min-w-[850px]">
                    <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            {selection && (
                                <th className="px-3 py-3 w-10">
                                    <Checkbox checked={selection.allSelected} onChange={selection.toggleAll} />
                                </th>
                            )}
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Nombre
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden md:table-cell">
                                Código
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                                Descripción
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider hidden xl:table-cell">
                                Tipos
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Stock
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider w-24">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {items.map((item: any) => (
                            <tr
                                key={item.id}
                                className="hover:bg-gray-50 transition-colors group"
                            >
                                {selection && (
                                    <td className="px-3 py-4 w-10">
                                        <Checkbox checked={selection.isSelected(item.id)} onChange={() => selection.toggle(item.id)} />
                                    </td>
                                )}
                                {/* Título / Nombre */}
                                <td className="px-4 py-4 font-medium text-gray-900 max-w-[200px] truncate md:max-w-none">
                                    <div className="font-semibold text-gray-900 truncate mb-1">{item.name}</div>
                                    <div className="text-sm text-gray-500">ID: {item.id}</div>
                                </td>

                                {/* Código */}
                                <td className="px-4 py-4 text-sm text-gray-600 hidden md:table-cell">
                                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                        {item.code || 'N/A'}
                                    </span>
                                </td>

                                {/* Descripción */}
                                <td className="px-4 py-4 text-sm text-gray-600 hidden lg:table-cell">
                                    {item.description || 'N/A'}
                                </td>

                                {/* Tipos */}
                                <td className="px-4 py-4 text-sm text-gray-600 hidden xl:table-cell max-w-[220px]">
                                    <div className="flex flex-wrap gap-1">
                                        {(item.types || []).map((type: any) => (
                                            <span key={type.id} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                {type.name}
                                            </span>
                                        ))}
                                        {!item.types?.length && <span>N/A</span>}
                                    </div>
                                </td>

                                {/* Stock */}
                                <td className="px-4 py-4 text-right text-sm font-medium">
                                    <div className="text-2xl font-bold text-gray-900">
                                        {item.totalStock}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        Disp: {item.availableStock || 0}
                                    </div>
                                </td>

                                {/* Status */}
                                <td className="px-4 py-4 text-right text-sm font-medium">
                                    <span className="inline-block text-xs font-semibold rounded-full px-3 py-1 bg-gray-100 text-gray-800">
                                        {item.status}
                                    </span>
                                </td>

                                {/* Acciones Tabla */}
                                <td className="px-4 py-4 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => onCopies?.(item)}
                                            className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-all"
                                            title="Gestionar ejemplares"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10a2 2 0 002 2h10M8 7V5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2h-2M4 7a2 2 0 012-2h2" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => onEdit(item)}
                                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
                                            title="Editar ítem"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => onDelete(item)}
                                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
                                            title="Eliminar ítem"
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

            {/* Mobile Cards - Se muestra SOLO en pantallas chicas (md:hidden) */}
            <div className="md:hidden space-y-3">
                {items.map((item: any) => (
                    <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                        {/* Encabezado de la Card: Nombre y Estado */}
                        <div className="flex justify-between items-start mb-2">
                            {selection && (
                                <div className="pt-1 pr-2">
                                    <Checkbox checked={selection.isSelected(item.id)} onChange={() => selection.toggle(item.id)} />
                                </div>
                            )}
                            <div className="flex-1 pr-2">
                                <h3 className="font-bold text-base text-gray-900 truncate">
                                    {item.name}
                                </h3>
                                <p className="text-xs text-gray-500">ID: {item.id}</p>
                            </div>
                            <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                {item.status}
                            </span>
                        </div>

                        {/* Descripción (si existe) */}
                        {item.description && (
                            <p className="text-xs text-gray-600 mb-3 line-clamp-2 bg-gray-50 p-2 rounded-lg">
                                {item.description}
                            </p>
                        )}

                        {/* Detalles en Grid de 2 Columnas */}
                        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                            <div>
                                <span className="block text-xs font-medium text-gray-400 uppercase">Código</span>
                                <span className="inline-flex px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded mt-0.5">
                                    {item.code || 'N/A'}
                                </span>
                            </div>
                            <div>
                                <span className="block text-xs font-medium text-gray-400 uppercase">Tipos</span>
                                <div className="flex flex-wrap gap-1 mt-0.5">
                                    {(item.types || []).map((type: any) => (
                                        <span key={type.id} className="inline-flex px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                            {type.name}
                                        </span>
                                    ))}
                                    {!item.types?.length && <span className="text-gray-900 font-medium">N/A</span>}
                                </div>
                            </div>
                            <div>
                                <span className="block text-xs font-medium text-gray-400 uppercase">Stock Total</span>
                                <span className="text-lg font-bold text-gray-900 mt-0.5 block">
                                    {item.totalStock}
                                </span>
                            </div>
                            <div>
                                <span className="block text-xs font-medium text-gray-400 uppercase">Disponible</span>
                                <span className="text-lg font-bold text-green-600 mt-0.5 block">
                                    {item.availableStock || 0}
                                </span>
                            </div>
                        </div>

                        {/* Acciones Mobile */}
                        <div className="flex gap-2 pt-3 border-t border-gray-100">
                            <button
                                onClick={() => onCopies?.(item)}
                                className="flex-1 p-2 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-700 transition-all flex items-center justify-center gap-1.5"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10a2 2 0 002 2h10M8 7V5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2h-2M4 7a2 2 0 012-2h2" />
                                </svg>
                                Ejemplares
                            </button>
                            <button
                                onClick={() => onEdit(item)}
                                className="flex-1 p-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-1.5"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Editar
                            </button>
                            <button
                                onClick={() => onDelete(item)}
                                className="flex-1 p-2 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-1.5"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}