"use client"

import { useState } from "react"
import { fetchPostConfig } from "./fetch/fetchConfig"
import { handleResponses } from "./responses/handleResponses"
import { SwalAlert } from "./swal/swal"
import { downloadJson } from "@/utils/jsonRecords"
import type { RowSelection } from "./useRowSelection"

/** POST /api/{resource}/bulk-delete — se usa POST porque DELETE con cuerpo se pierde en varios proxies. */
export const bulkDeleteRequest = (resource: string, ids: (string | number)[]) =>
    fetch(`/api/${resource}/bulk-delete`, fetchPostConfig({ ids })).then((res) => res.json())

export const bulkUpsertPhysicalBooks = (records: any[]) =>
    fetch(`/api/physical-book/bulk`, fetchPostConfig({ records })).then((res) => res.json())

interface BulkActionsOptions {
    resource: string
    selection: RowSelection
    unit?: string
    /** Refresca la lista después de una operación exitosa. */
    onDone: () => void
    /** Serializa los registros seleccionados para el archivo JSON. */
    toRecord?: (row: any) => Record<string, any>
    fileBaseName?: string
}

/** Borrado masivo y exportación JSON sobre la selección actual de una tabla. */
export function useBulkActions({ resource, selection, unit = "registro(s)", onDone, toRecord, fileBaseName = "registros" }: BulkActionsOptions) {
    const [busy, setBusy] = useState(false)

    const deleteSelected = async () => {
        if (selection.count === 0) return
        const confirmed = await SwalAlert.confirm(
            `¿Eliminar ${selection.count} ${unit}?`,
            'Esta acción no se puede deshacer y elimina también los ejemplares asociados.'
        )
        if (!confirmed) return

        SwalAlert.loading()
        setBusy(true)
        try {
            const response = await bulkDeleteRequest(resource, selection.ids)
            if (handleResponses(response)) {
                selection.clear()
                onDone()
            }
        } catch (error) {
            console.error('Error al eliminar en lote:', error)
            SwalAlert.fire({ title: 'Error de conexión', text: 'Verifica tu conexión e inténtalo de nuevo', icon: 'error' })
        } finally {
            setBusy(false)
        }
    }

    const exportSelected = () => {
        const rows = toRecord ? selection.selectedRows.map(toRecord) : selection.selectedRows
        downloadJson(rows, fileBaseName)
    }

    /** Exporta toda la página visible cuando no hay selección. */
    const exportAll = (rows: any[]) => {
        downloadJson(toRecord ? rows.map(toRecord) : rows, fileBaseName)
    }

    return { deleteSelected, exportSelected, exportAll, busy }
}
