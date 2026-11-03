/**
 * Formato de los códigos QR del sistema.
 *
 * El QR NO se guarda en la base de datos: se deriva del identificador del
 * registro, así cualquier registro existente (incluido el papel ya impreso)
 * sigue siendo legible aunque cambie el nombre o el código. Se aceptan también
 * textos libres -el código del ejemplar escrito a mano, por ejemplo- para que
 * escanear una etiqueta vieja no deje tirado al usuario.
 */

export type QrResource = 'inventory' | 'physical-book'

export type QrPayload =
    | { type: 'record'; resource: QrResource; id: string }
    | { type: 'copy'; resource: QrResource; parentId: string; copyId: string }
    | { type: 'code'; value: string }

const MARKER = 'UPTALIB'
const VERSION = 'V1'

const TAGS: Record<QrResource, { record: string; copy: string }> = {
    inventory: { record: 'ITM', copy: 'ITMC' },
    'physical-book': { record: 'BOOK', copy: 'BOOKC' }
}

export const isQrResource = (value: any): value is QrResource =>
    value === 'inventory' || value === 'physical-book'

/** `UPTALIB:V1:ITM:<itemId>` · `UPTALIB:V1:BOOK:<bookId>` */
export function qrValueForRecord(resource: QrResource, id: string): string {
    return `${MARKER}:${VERSION}:${TAGS[resource].record}:${id}`
}

/** `UPTALIB:V1:ITMC:<itemId>:<copyId>` · `UPTALIB:V1:BOOKC:<bookId>:<copyId>` */
export function qrValueForCopy(resource: QrResource, parentId: string, copyId: string): string {
    return `${MARKER}:${VERSION}:${TAGS[resource].copy}:${parentId}:${copyId}`
}

const recordOf = (resource: QrResource, id: string): QrPayload => ({ type: 'record', resource, id })
const copyOf = (resource: QrResource, parentId: string, copyId: string): QrPayload =>
    ({ type: 'copy', resource, parentId, copyId })

const TAG_TO_RESOURCE: Record<string, { resource: QrResource; kind: 'record' | 'copy' }> = Object.entries(TAGS)
    .flatMap(([resource, tags]) => [
        { tag: tags.record, resource: resource as QrResource, kind: 'record' as const },
        { tag: tags.copy, resource: resource as QrResource, kind: 'copy' as const }
    ])
    .reduce((acc, entry) => ({ ...acc, [entry.tag]: { resource: entry.resource, kind: entry.kind } }), {})

/**
 * Interpreta el texto leído por la cámara. Todo lo que no reconozca se devuelve
 * como `code`, que los módulos usan para rellenar la búsqueda general.
 */
export function parseQrPayload(raw: string): QrPayload {
    const text = `${raw ?? ''}`.trim()
    if (!text) return { type: 'code', value: '' }

    const segments = text.split(':')
    if (segments.length < 4 || segments[0].toUpperCase() !== MARKER) {
        return { type: 'code', value: text }
    }

    const tag = (segments[2] ?? '').toUpperCase()
    const target = TAG_TO_RESOURCE[tag]
    if (!target) return { type: 'code', value: text }

    const [first, second] = segments.slice(3).map((part) => part.trim()).filter(Boolean)
    if (!first) return { type: 'code', value: text }

    // Un QR de ejemplar sin el tramo del ejemplar (etiqueta mutilada) se queda
    // en el registro: siempre es mejor llegar al recurso que no llegar a nada.
    if (target.kind === 'copy' && second) {
        return copyOf(target.resource, first, second)
    }
    return recordOf(target.resource, first)
}

/** Descripción corta para mostrarla en pantalla tras escanear. */
export function describeQrPayload(payload: QrPayload): string {
    if (payload.type === 'code') return payload.value ? `Código ${payload.value}` : 'Nada que buscar'
    const nombre = payload.resource === 'inventory' ? 'artículo' : 'libro'
    return payload.type === 'record' ? `${nombre} ${payload.id}` : `ejemplar ${payload.copyId} de ${nombre}`
}

const nameOf = (record: any): string => record?.name ?? record?.title ?? 'Registro'

/** Lo que necesita QrModal para mostrar el QR de un registro ya cargado. */
export function qrTargetForRecord(resource: QrResource, record: any) {
    return {
        value: qrValueForRecord(resource, record.id),
        title: nameOf(record),
        code: record.code ?? null
    }
}

/** Idem, pero del ejemplar: el QR identifica la unidad física, no el título. */
export function qrTargetForCopy(resource: QrResource, record: any, copy: any) {
    return {
        value: qrValueForCopy(resource, record?.id ?? copy.itemId ?? copy.bookId, copy.id),
        title: `${nameOf(record)} · ejemplar`,
        code: copy.code ?? null
    }
}

