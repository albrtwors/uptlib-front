export type JsonRecord = Record<string, any>

const LIST_KEYS = ['data', 'records', 'items', 'results', 'books', 'libros']

/**
 * Acepta el JSON tal cual lo exporta esta app o uno escrito a mano: un objeto
 * suelto, un arreglo de objetos o un envoltorio { data: [...] }.
 */
export function normalizeRecords(raw: unknown): JsonRecord[] {
    if (Array.isArray(raw)) return raw.filter(isRecord)
    if (isRecord(raw)) {
        const nested = LIST_KEYS.map((key) => raw[key]).find(Array.isArray)
        if (nested) return (nested as unknown[]).filter(isRecord)
        return [raw]
    }
    return []
}

function isRecord(value: unknown): value is JsonRecord {
    return !!value && typeof value === 'object' && !Array.isArray(value)
}

export function parseJsonText(text: string): JsonRecord[] {
    return normalizeRecords(JSON.parse(text))
}

export function readJsonFile(file: File): Promise<JsonRecord[]> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            try {
                resolve(parseJsonText(`${reader.result ?? ''}`))
            } catch {
                reject(new Error(`El archivo ${file.name} no contiene JSON válido`))
            }
        }
        reader.onerror = () => reject(new Error(`No se pudo leer ${file.name}`))
        reader.readAsText(file)
    })
}

/** Descarga un objeto (archivo suelto) o un arreglo (lote) con nombre fechado. */
export function downloadJson(records: JsonRecord[] | JsonRecord, baseName: string) {
    const list = Array.isArray(records) ? records : [records]
    const payload = list.length === 1 ? list[0] : list
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${baseName}-${new Date().toISOString().slice(0, 10)}${list.length === 1 ? '' : `-${list.length}-registros`}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

const namesOf = (list: any) => (Array.isArray(list) ? list : []).map((e: any) => e?.name).filter(Boolean)

/**
 * Exporta sólo los campos que el backend vuelve a aceptar en /physical-book/bulk.
 * Autores, categorías y PNFs viajan por nombre para que el archivo sea portátil.
 */
export function physicalBookToRecord(book: any): JsonRecord {
    return {
        id: book.id,
        title: book.title,
        isbn: book.isbn ?? null,
        code: book.code ?? null,
        yearOfPublication: book.yearOfPublication ?? null,
        editorial: book.editorial ?? null,
        totalStock: book.totalStock ?? 0,
        authorNames: namesOf(book.authors),
        categoryNames: namesOf(book.categories),
        pnfs: namesOf(book.pnfs)
    }
}

export function itemToRecord(item: any): JsonRecord {
    return {
        id: item.id,
        name: item.name,
        code: item.code ?? null,
        description: item.description ?? null,
        stock: item.totalStock ?? 0,
        typeName: item.type?.name ?? null,
        authorNames: namesOf(item.authors),
        categoryNames: namesOf(item.categories)
    }
}

/**
 * Libro digital: el PDF viaja como URL, así que el JSON sirve de respaldo e
 * introducción para /book (que requiere routepdf).
 */
export function digitalBookToRecord(book: any): JsonRecord {
    return {
        id: book.id,
        title: book.title,
        description: book.description ?? null,
        routepdf: book.routepdf ?? null,
        authorNames: namesOf(book.authors),
        pnfs: (Array.isArray(book.pnfs) ? book.pnfs : []).map((link: any) => link?.pnf?.name ?? link?.name).filter(Boolean)
    }
}

/** El libro físico exportado puede venir con nulls o campos sobrantes: se limpian. */
export function recordToPhysicalBookDraft(record: JsonRecord) {
    const asArray = (value: any): string[] => (Array.isArray(value) ? value.map((v) => `${v}`).filter(Boolean) : [])
    return {
        id: record.id ? `${record.id}` : undefined,
        title: `${record.title ?? ''}`.trim(),
        isbn: `${record.isbn ?? ''}`.trim(),
        code: `${record.code ?? ''}`.trim(),
        yearOfPublication: record.yearOfPublication !== null && record.yearOfPublication !== undefined ? `${record.yearOfPublication}` : '',
        editorial: `${record.editorial ?? ''}`.trim(),
        totalStock: record.totalStock !== undefined && record.totalStock !== null ? `${record.totalStock}` : '',
        codeFrom: `${record.codeFrom ?? ''}`.trim(),
        codeTo: `${record.codeTo ?? ''}`.trim(),
        authorIds: asArray(record.authorIds),
        authorNames: asArray(record.authorNames),
        categoryIds: asArray(record.categoryIds),
        categoryNames: asArray(record.categoryNames),
        pnfs: asArray(record.pnfs ?? record.pnfNames ?? record.pnf)
    }
}

/** cuerpo del request que entiende /physical-book/bulk */
export function physicalBookDraftToPayload(draft: any): JsonRecord {
    const payload: JsonRecord = {
        title: draft.title,
        isbn: draft.isbn || undefined,
        code: draft.code || undefined,
        yearOfPublication: draft.yearOfPublication || undefined,
        editorial: draft.editorial || undefined,
        totalStock: draft.totalStock === '' ? undefined : draft.totalStock,
        authorIds: draft.authorIds,
        authorNames: draft.authorNames,
        categoryIds: draft.categoryIds,
        categoryNames: draft.categoryNames,
        pnfs: draft.pnfs,
        codeFrom: draft.codeFrom || undefined,
        codeTo: draft.codeTo || undefined
    }
    if (draft.id) payload.id = draft.id
    return payload
}
