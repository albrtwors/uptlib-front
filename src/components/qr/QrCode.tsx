"use client"

import useQrDataUrl from "@/hooks/qr/useQrDataUrl"

interface QrCodeProps {
    value: string
    size?: number
    label?: string
    className?: string
}

/** Muestra el QR derivado del identificador del registro o del ejemplar. */
export default function QrCode({ value, size = 176, label, className = '' }: QrCodeProps) {
    const { dataUrl, error } = useQrDataUrl(value, size)

    if (error) {
        return <p className={`text-xs text-red-600 ${className}`}>{error}</p>
    }

    if (!dataUrl) {
        return (
            <div
                className={`animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800 ${className}`}
                style={{ width: size, height: size }}
            />
        )
    }

    return (
        <figure className={`flex flex-col items-center gap-1 ${className}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={dataUrl}
                alt={label ? `Código QR de ${label}` : 'Código QR'}
                width={size}
                height={size}
                className="h-auto max-w-full rounded-lg border border-gray-200 bg-white dark:border-gray-700"
            />
            {label && <figcaption className="max-w-full truncate text-center font-mono text-[11px] text-gray-600 dark:text-gray-300">{label}</figcaption>}
        </figure>
    )
}
