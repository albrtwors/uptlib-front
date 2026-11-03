"use client"

import Button from "@/components/ui/button/Button"
import GenericModalContainer from "@/components/modals/GenericModalContainer"
import QrCode from "./QrCode"
import useQrDataUrl from "@/hooks/qr/useQrDataUrl"
import { SwalAlert } from "@/hooks/lib/swal/swal"

interface QrModalProps {
    value: string
    title: string
    /** Código legible del registro o ejemplar; es lo que se lee en la etiqueta impresa. */
    code?: string | null
    onClose: () => void
}

const fileName = (value: string) => value.trim().replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'qr'

/**
 * QR listo para la etiqueta: se descarga en PNG o se manda directo a la
 * impresora con el código escrito debajo, para que el ejemplar siga siendo
 * identificable aunque el QR se desgaste.
 */
export default function QrModal({ value, title, code, onClose }: QrModalProps) {
    const { dataUrl } = useQrDataUrl(value, 240)
    const label = `${code ?? ''}`.trim() || title

    const print = () => {
        if (!dataUrl) return
        const win = window.open('', '_blank', 'width=420,height=560')
        if (!win) {
            SwalAlert.fire({ title: 'Ventana bloqueada', text: 'Permite las ventanas emergentes para imprimir la etiqueta', icon: 'warning' })
            return
        }
        // Se construye el DOM con nodos: el nombre del registro nunca se interpreta como HTML
        win.document.title = `QR ${label}`
        const img = win.document.createElement('img')
        img.src = dataUrl
        img.alt = `Código QR de ${label}`
        const caption = win.document.createElement('p')
        caption.textContent = label
        Object.assign(caption.style, { fontFamily: 'monospace', fontSize: '14px', textAlign: 'center', margin: '12px 0 0' })
        Object.assign(img.style, { width: '240px', height: '240px', display: 'block', margin: '0 auto' })
        win.document.body.append(img, caption)
        win.document.body.style.margin = '24px'
        win.focus()
        win.print()
    }

    return <GenericModalContainer>
        <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
                <h3 className="truncate text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
                {code && <p className="font-mono text-xs text-gray-500">{code}</p>}
            </div>
            <Button type="button" size="sm" variant="outline" onClick={onClose}>X</Button>
        </div>

        <div className="mt-3 flex flex-col items-center gap-2 rounded-xl border border-gray-200 p-3 dark:border-gray-800">
            <QrCode value={value} size={240} label={label} />
            <p className="max-h-16 w-full break-all text-center font-mono text-[10px] text-gray-400">{value}</p>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
            <a
                href={dataUrl || undefined}
                download={`qr-${fileName(label)}.png`}
                aria-disabled={!dataUrl}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium ring-1 ring-inset ring-gray-300 dark:ring-gray-700 ${dataUrl ? 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300' : 'pointer-events-none opacity-50'}`}
            >
                Descargar PNG
            </a>
            <Button type="button" onClick={print} disabled={!dataUrl}>Imprimir</Button>
            <Button type="button" size="md" variant="outline" className="ml-auto" onClick={onClose}>Cerrar</Button>
        </div>
    </GenericModalContainer>
}
