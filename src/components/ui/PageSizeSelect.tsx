"use client"

import Label from "../form/Label"

export const PAGE_SIZES = [10, 20, 30, 50, 100]

interface PageSizeSelectProps {
    limit: number | string
    onLimitChange: (limit: number) => void
    label?: string
}

/** Cambio de registros por página: lista desplegable en lugar de campo numérico. */
export default function PageSizeSelect({ limit, onLimitChange, label = 'Cantidad por página' }: PageSizeSelectProps) {
    return (
        <div className="sm:max-w-40">
            <Label>{label}</Label>
            <select
                value={Number(limit) || PAGE_SIZES[0]}
                onChange={(e: any) => onLimitChange(parseInt(e.target.value) || PAGE_SIZES[0])}
                className="h-11 w-full p-2 rounded-lg border border-gray-300 bg-white text-gray-800 dark:bg-gray-900 dark:text-white/90 dark:border-gray-700"
            >
                {PAGE_SIZES.map((size) => <option key={size} value={size}>{size} filas</option>)}
            </select>
        </div>
    )
}
