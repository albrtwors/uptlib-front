"use client"

import { useEffect, useRef, useState } from "react"
import Button from "@/components/ui/button/Button"
import Input from "@/components/form/input/InputField"
import Label from "@/components/form/Label"
import GenericModalContainer from "@/components/modals/GenericModalContainer"
import { SwalAlert } from "@/hooks/lib/swal/swal"

interface QrScannerModalProps {
    /** Recibe el texto crudo del QR; el módulo decide qué hacer con él. */
    onResult: (raw: string) => void
    onClose: () => void
}

/**
 * Lector de QR con tres caminos: la cámara, la foto guardada y el código
 * escrito a mano. Así el mostrador nunca queda bloqueado por una cámara sin
 * permisos o una etiqueta rota.
 */
export default function QrScannerModal({ onResult, onClose }: QrScannerModalProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const controlsRef = useRef<any>(null)
    const readerRef = useRef<any>(null)
    const fileRef = useRef<HTMLInputElement>(null)
    const [cameraOn, setCameraOn] = useState(false)
    const [cameraError, setCameraError] = useState('')
    const [manual, setManual] = useState('')

    const getReader = async () => {
        if (readerRef.current) return readerRef.current
        const { BrowserMultiFormatReader } = await import('@zxing/browser')
        readerRef.current = new BrowserMultiFormatReader()
        return readerRef.current
    }

    const stopCamera = () => {
        controlsRef.current?.stop?.()
        controlsRef.current = null
        setCameraOn(false)
    }

    const startCamera = async () => {
        setCameraError('')
        try {
            const reader = await getReader()
            const controls = await reader.decodeFromVideoDevice(
                undefined,
                videoRef.current,
                (result: any, _error: any, instanceControls: any) => {
                    if (!result) return
                    instanceControls.stop()
                    controlsRef.current = null
                    setCameraOn(false)
                    onResult(result.getText())
                }
            )
            controlsRef.current = controls
            setCameraOn(true)
        } catch (err: any) {
            setCameraError(err?.message ?? 'No se pudo encender la cámara')
            setCameraOn(false)
        }
    }

    useEffect(() => () => { controlsRef.current?.stop?.() }, [])

    const handleImage = async (files: FileList | null) => {
        const file = files?.[0]
        if (!file) return
        const url = URL.createObjectURL(file)
        try {
            const reader = await getReader()
            const result = await reader.decodeFromImageUrl(url)
            onResult(result.getText())
        } catch {
            SwalAlert.fire({ title: 'Sin QR en la imagen', text: 'Prueba con otra foto o escribe el código', icon: 'info' })
        } finally {
            URL.revokeObjectURL(url)
        }
    }

    return <GenericModalContainer>
        <div className="flex items-start justify-between gap-2">
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Escanear QR</h3>
                <p className="text-xs text-gray-500">Apunta la etiqueta del ejemplar o del registro.</p>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={() => { stopCamera(); onClose() }}>X</Button>
        </div>

        <div className="mt-3 overflow-hidden rounded-xl border border-gray-200 bg-black dark:border-gray-800">
            <video
                ref={videoRef}
                playsInline
                muted
                className={`h-56 w-full object-contain ${cameraOn ? '' : 'opacity-40'}`}
            />
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
            {cameraOn
                ? <Button type="button" variant="outline" onClick={stopCamera}>Apagar cámara</Button>
                : <Button type="button" onClick={startCamera}>Encender cámara</Button>}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImage(e.target.files)} />
            <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>Subir foto</Button>
        </div>

        {cameraError && (
            <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                {cameraError}. La cámara necesita HTTPS y permiso del navegador; puedes usar la foto o el código manual.
            </p>
        )}

        <form
            className="mt-3 flex flex-col gap-1"
            onSubmit={(e) => {
                e.preventDefault()
                const value = manual.trim()
                if (!value) return
                onResult(value)
            }}
        >
            <Label isRequired={false}>O escribe el código</Label>
            <div className="flex gap-2">
                <Input value={manual} onChange={(e: any) => setManual(e.target.value)} placeholder="INV-0001 · LIB-ABC-0002 · UPTALIB:V1:..." />
                <Button type="submit" variant="outline">Buscar</Button>
            </div>
        </form>
    </GenericModalContainer>
}
