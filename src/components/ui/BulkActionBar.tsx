"use client"

import type { RowSelection } from "@/hooks/lib/useRowSelection"

interface BulkActionBarProps {
    selection: RowSelection
    unit?: string
    onDelete?: () => void
    onEdit?: () => void
    onExport?: () => void
    busy?: boolean
}

const base = "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"

/** Barra de acciones sobre la selección actual; sólo aparece con filas marcadas. */
export default function BulkActionBar({ selection, unit = "registro(s)", onDelete, onEdit, onExport, busy = false }: BulkActionBarProps) {
    if (selection.count === 0) return null

    return (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2 dark:border-gray-800 dark:bg-gray-900">
            <span className="px-2 py-1 rounded-lg bg-brand-500 text-white text-xs font-semibold">
                {selection.count} {unit}
            </span>

            {onEdit && (
                <button type="button" disabled={busy} onClick={onEdit} className={`${base} bg-blue-600 text-white hover:bg-blue-700`}>
                    Editar en lote
                </button>
            )}
            {onExport && (
                <button type="button" disabled={busy} onClick={onExport} className={`${base} bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700`}>
                    Exportar JSON
                </button>
            )}
            {onDelete && (
                <button type="button" disabled={busy} onClick={onDelete} className={`${base} bg-red-600 text-white hover:bg-red-700`}>
                    Eliminar
                </button>
            )}

            <button type="button" disabled={busy} onClick={selection.clear} className={`${base} ml-auto text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800`}>
                Limpiar selección
            </button>
        </div>
    )
}
