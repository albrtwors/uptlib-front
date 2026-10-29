"use client"

import { useCallback, useMemo, useState } from "react"

/**
 * Selección de filas por ID para borrado, edición o exportación en lote.
 * Los IDs se guardan como texto y sobreviven a los cambios de página: sólo
 * «Limpiar» o una acción exitosa los descarta.
 */
export default function useRowSelection(rows: any[]) {
    const [ids, setIds] = useState<string[]>([])

    const rowIds = useMemo(
        () => (Array.isArray(rows) ? rows : []).map((row: any) => `${row?.id ?? ''}`).filter(Boolean),
        [rows]
    )

    const isSelected = useCallback((id: any) => ids.includes(`${id}`), [ids])

    const toggle = useCallback((id: any) => {
        const key = `${id}`
        setIds((prev) => (prev.includes(key) ? prev.filter((current) => current !== key) : [...prev, key]))
    }, [])

    const allSelected = rowIds.length > 0 && rowIds.every((id) => ids.includes(id))

    const toggleAll = useCallback(() => {
        setIds((prev) => {
            const everyVisible = rowIds.every((id) => prev.includes(id))
            if (everyVisible) return prev.filter((id) => !rowIds.includes(id))
            return Array.from(new Set([...prev, ...rowIds]))
        })
    }, [rowIds])

    const clear = useCallback(() => setIds([]), [])

    const selectedRows = useMemo(
        () => (Array.isArray(rows) ? rows : []).filter((row: any) => ids.includes(`${row?.id}`)),
        [rows, ids]
    )

    return { ids, setIds, count: ids.length, isSelected, toggle, toggleAll, allSelected, clear, selectedRows }
}

export type RowSelection = ReturnType<typeof useRowSelection>
