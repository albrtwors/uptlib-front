"use client"

import { useEffect } from "react"

/** Anillo ámbar con el que se remarca la fila recién escaneada. */
export const HIGHLIGHT_ROW = 'bg-amber-50 ring-2 ring-inset ring-amber-400 dark:bg-amber-950/40'

/**
 * Desplaza la vista hasta la fila marcada con `data-row-id` cuando llega un
 * registro por QR. La misma fila vive dos veces (tabla y tarjeta móvil), así
 * que se toma la primera realmente visible.
 *
 * El listado filtrado aún no está en el DOM en el instante del escaneo, por eso
 * se reintenta mientras llegan los datos y se detiene en cuanto aparece.
 */
export function useHighlightScroll(highlightId?: string | null) {
    useEffect(() => {
        if (!highlightId) return

        let found = false
        const timers = [0, 500, 1500].map((delay) => window.setTimeout(() => {
            if (found) return
            const nodes = Array.from(
                document.querySelectorAll<HTMLElement>(`[data-row-id="${CSS.escape(highlightId)}"]`)
            )
            const target = nodes.find((node) => node.offsetParent !== null) ?? nodes[0]
            if (!target) return
            found = true
            target.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, delay))

        return () => timers.forEach((timer) => window.clearTimeout(timer))
    }, [highlightId])
}
