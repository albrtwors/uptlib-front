"use client"

import { useCallback, useEffect, useRef, useState } from "react"

/**
 * Los formularios administrativos se guardan solos en el navegador para que un
 * refresco, un corte de luz o una laptop cerrada a medias no tiren el trabajo.
 * Todo vive bajo `PREFIX` en localStorage y caduca para no reabrir borradores
 * abandonados hace semanas.
 */
const PREFIX = "uptalib:form:"
const DEFAULT_TTL = 1000 * 60 * 60 * 24
const WRITE_DEBOUNCE = 300

interface Envelope<T> {
    value: T
    savedAt: number
}

export const formCacheKey = (scope: string, ...parts: (string | number | undefined | null)[]) =>
    `${PREFIX}${scope}:${parts.map((part) => part ?? '').join('|')}`

export function readFormCache<T>(key: string, ttlMs: number = DEFAULT_TTL): T | null {
    if (typeof window === "undefined") return null
    try {
        const raw = window.localStorage.getItem(key)
        if (!raw) return null
        const parsed = JSON.parse(raw) as Envelope<T>
        if (!parsed || typeof parsed.savedAt !== "number") return null
        if (Date.now() - parsed.savedAt > ttlMs) {
            window.localStorage.removeItem(key)
            return null
        }
        return parsed.value
    } catch {
        return null
    }
}

export function writeFormCache<T>(key: string, value: T): void {
    if (typeof window === "undefined") return
    try {
        window.localStorage.setItem(key, JSON.stringify({ value, savedAt: Date.now() } satisfies Envelope<T>))
    } catch {
        // Cuota llena o modo privado: el formulario sigue funcionando sin caché
    }
}

export function clearFormCache(key: string): void {
    if (typeof window === "undefined") return
    try {
        window.localStorage.removeItem(key)
    } catch {
        // nada que limpiar
    }
}

/**
 * Un borrador vacío no es un borrador restaurado. La comparación ignora `key`,
 * el id volátil que generan las filas de la mesa de trabajo en cada montaje.
 */
function signature(value: unknown): string {
    return JSON.stringify(value, (key, nested) => (key === "key" ? undefined : nested))
}

export interface CachedState<T> {
    value: T
    setValue: (next: T | ((prev: T) => T)) => void
    /** Borra el borrador guardado y deja el control en su estado inicial */
    clear: () => void
    /** true cuando el contenido actual viene de la caché del navegador */
    restored: boolean
}

/**
 * Estado de formulario persistido en el navegador. El valor recuperado reemplaza
 * al inicial en cuanto el componente se monta en el cliente.
 */
export function useCachedState<T>(
    key: string,
    initial: () => T,
    options: { ttlMs?: number } = {}
): CachedState<T> {
    const { ttlMs = DEFAULT_TTL } = options
    const [value, setValue] = useState<T>(initial)
    const [restored, setRestored] = useState(false)
    const [hydratedFor, setHydratedFor] = useState<string | null>(null)
    const seed = useRef(initial)

    // 💡 La caché vive fuera de React y sólo existe en el navegador: hidratarla en un
    // efecto (no en el initializer) es lo que evita el mismatch contra el HTML del server.
    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        const cached = readFormCache<T>(key, ttlMs)
        const initial = seed.current()
        const hasDraft = cached !== null && cached !== undefined && signature(cached) !== signature(initial)
        setValue(hasDraft ? cached : initial)
        setRestored(hasDraft)
        setHydratedFor(key)
    }, [key, ttlMs])
    /* eslint-enable react-hooks/set-state-in-effect */

    // 💡 Solo se escribe cuando la clave actual ya fue leída: así un cambio de
    // clave no guarda el borrador del registro anterior en el clavechero nuevo.
    useEffect(() => {
        if (hydratedFor !== key) return
        const timer = setTimeout(() => writeFormCache(key, value), WRITE_DEBOUNCE)
        return () => clearTimeout(timer)
    }, [key, value, hydratedFor])

    const clear = useCallback(() => {
        clearFormCache(key)
        setRestored(false)
        setValue(seed.current())
    }, [key])

    return { value, setValue, clear, restored }
}
