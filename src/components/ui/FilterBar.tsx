import type { ReactNode } from "react"

/**
 * Barra de filtros responsiva: en escritorio se apila en una línea, en móvil
 * en columnas. Sustituye a las viejas barras con h-20 + overflow-y-scroll,
 * que provocaban el scroll vertical fantasma en pantallas chicas.
 */
export default function FilterBar({ children, actions }: { children: ReactNode; actions?: ReactNode }) {
    return (
        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900 lg:flex-row lg:items-end">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:flex lg:flex-1 lg:items-end">
                {children}
            </div>
            {actions && (
                <div className="flex flex-wrap gap-2 lg:shrink-0 lg:justify-end sm:[&>button]:flex-1">
                    {actions}
                </div>
            )}
        </div>
    )
}
