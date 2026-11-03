"use client"

import { useEffect, useState } from "react"

interface QrDataUrl {
    dataUrl: string
    error: string
    ready: boolean
}

/** Genera el PNG del QR en el navegador; la librería se carga bajo demanda. */
export default function useQrDataUrl(value: string, size = 176): QrDataUrl {
    const [dataUrl, setDataUrl] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        let active = true
        setDataUrl('')
        setError('')
        if (!value) return

        import('qrcode')
            .then((module: any) => {
                const toDataUrl = module.toDataURL ?? module.default?.toDataURL
                if (!toDataUrl) throw new Error('el generador de QR no está disponible')
                return toDataUrl(value, { width: size, margin: 1, errorCorrectionLevel: 'M' })
            })
            .then((url: string) => { if (active) setDataUrl(url) })
            .catch((err: any) => { if (active) setError(err?.message ?? 'No se pudo generar el QR') })

        return () => { active = false }
    }, [value, size])

    return { dataUrl, error, ready: Boolean(dataUrl) }
}
