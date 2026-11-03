"use client"

import { useState } from "react"
import { SwalAlert } from "@/hooks/lib/swal/swal"
import { describeQrPayload, parseQrPayload, type QrPayload, type QrResource } from "@/utils/qrPayload"

export interface QrScanResult {
    raw: string
    payload: QrPayload
    /** Recurso del QR; cuando el código es suelto se usa el de la página. */
    resource: QrResource
    /** Registro resuelto por ID, o null si el QR sólo trae un texto libre. */
    record: any | null
    /** Ejemplar resuelto dentro del registro, si el QR apuntaba a una unidad. */
    copy: any | null
}

interface UseQrScanOptions {
    resource: QrResource
    onResult: (result: QrScanResult) => void
}

/**
 * Abre el escáner y traduce lo leído a algo accionable: un QR propio del
 * sistema se resuelve contra la API para poder enfocar el registro exacto;
 * cualquier otro texto se trata como código de búsqueda.
 */
export function useQrScan({ resource, onResult }: UseQrScanOptions) {
    const [scanning, setScanning] = useState(false)

    const handleRaw = async (raw: string) => {
        const payload = parseQrPayload(raw)
        setScanning(false)

        if (payload.type === 'code') {
            onResult({ raw, payload, resource, record: null, copy: null })
            return
        }

        const id = payload.type === 'copy' ? payload.parentId : payload.id
        try {
            const res = await fetch(`/api/${payload.resource}/${id}`)
            const json = await res.json()
            const record = json?.data ?? null
            if (!record) throw new Error(json?.message ?? 'El registro del QR ya no existe')

            const copy = payload.type === 'copy'
                ? (record.copies ?? []).find((c: any) => c.id === payload.copyId) ?? { id: payload.copyId, code: null }
                : null

            onResult({ raw, payload, resource: payload.resource, record, copy })
        } catch (error: any) {
            SwalAlert.fire({
                title: 'QR no reconocido',
                text: `${describeQrPayload(payload)} · ${error?.message ?? 'no se pudo consultar el registro'}`,
                icon: 'error'
            })
        }
    }

    return { scanning, setScanning, handleRaw }
}
