"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Button from "@/components/ui/button/Button"
import Label from "@/components/form/Label"
import Input from "@/components/form/input/InputField"
import GenericModalContainer from "@/components/modals/GenericModalContainer"
import AuthorSelectorModal from "@/components/form/author/AuthorSelectorModal"
import CategorySelectorModal from "@/components/form/category/CategorySelectorModal"
import PnfSelectorModal from "@/components/form/pnf/PnfSelectorModal"
import PhysicalBookFormChatbot from "@/components/chatbot/physical-book/PhysicalBookFormChatbot"
import { SwalAlert } from "@/hooks/lib/swal/swal"
import { handleResponses } from "@/hooks/lib/responses/handleResponses"
import { bulkUpsertPhysicalBooks } from "@/hooks/lib/useBulkActions"
import { formCacheKey, useCachedState } from "@/hooks/lib/useCachedForm"
import {
    downloadJson,
    parseJsonText,
    physicalBookDraftToPayload,
    physicalBookToRecord,
    readJsonFile,
    recordToPhysicalBookDraft
} from "@/utils/jsonRecords"

interface Draft {
    key: string
    id?: string
    title: string
    isbn: string
    code: string
    yearOfPublication: string
    editorial: string
    totalStock: string
    codeFrom: string
    codeTo: string
    authorIds: string[]
    authorNames: string[]
    categoryIds: string[]
    categoryNames: string[]
    pnfs: string[]
    sourceBook?: any
}

const newKey = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const blankDraft = (): Draft => ({
    key: newKey(),
    id: undefined,
    title: '',
    isbn: '',
    code: '',
    yearOfPublication: '',
    editorial: '',
    totalStock: '',
    codeFrom: '',
    codeTo: '',
    authorIds: [],
    authorNames: [],
    categoryIds: [],
    categoryNames: [],
    pnfs: []
})

const draftFromBook = (book: any): Draft => ({
    ...blankDraft(),
    id: `${book.id}`,
    title: book.title ?? '',
    isbn: book.isbn ?? '',
    code: book.code ?? '',
    yearOfPublication: `${book.yearOfPublication ?? ''}`,
    editorial: book.editorial ?? '',
    totalStock: `${book.totalStock ?? 0}`,
    authorIds: (book.authors || []).map((a: any) => a.id),
    categoryIds: (book.categories || []).map((c: any) => c.id),
    pnfs: (book.pnfs || []).map((p: any) => p.name).filter(Boolean),
    sourceBook: book
})

const draftFromRecord = (record: Record<string, any>): Draft => ({
    ...blankDraft(),
    ...recordToPhysicalBookDraft(record),
    id: record.id ? `${record.id}` : undefined
})

interface RecordsWorkspaceModalProps {
    mode: 'create' | 'edit'
    seeds?: any[]
    onClose: () => void
    onSaved: () => void
}

/**
 * Mesa de trabajo de registros: crea o edita varios libros físicos a la vez,
 * importa/exporta JSON y guarda todo en un único lote contra /physical-book/bulk.
 */
export default function RecordsWorkspaceModal({ mode, seeds = [], onClose, onSaved }: RecordsWorkspaceModalProps) {
    const seedIds = seeds.map((seed: any) => `${seed?.id ?? ''}`).join(',')
    const cacheKey = formCacheKey('physical-books-workspace', mode, seedIds)
    const { value: drafts, setValue: setDrafts, clear: clearDrafts, restored } = useCachedState<Draft[]>(
        cacheKey,
        () => mode === 'edit' ? seeds.map(draftFromBook) : [blankDraft()]
    )
    const [activeKey, setActiveKey] = useState<string>(() => drafts[0]?.key ?? '')
    const [authorModal, setAuthorModal] = useState(false)
    const [categoryModal, setCategoryModal] = useState(false)
    const [pnfModal, setPnfModal] = useState(false)
    const [pasteOpen, setPasteOpen] = useState(false)
    const [pasteText, setPasteText] = useState('')
    const [failed, setFailed] = useState<{ index: number; title: string; message: string }[]>([])
    const [busy, setBusy] = useState(false)
    const fileInput = useRef<HTMLInputElement>(null)

    const active = useMemo(() => drafts.find((draft) => draft.key === activeKey) ?? drafts[0], [drafts, activeKey])

    useEffect(() => {
        if (!drafts.find((draft) => draft.key === activeKey) && drafts[0]) setActiveKey(drafts[0].key)
    }, [drafts, activeKey])

    const patchActive = (changes: Partial<Draft>) => {
        setDrafts((prev) => prev.map((draft) => (draft.key === active?.key ? { ...draft, ...changes } : draft)))
    }

    const addDraft = (draft?: Draft) => {
        const next = draft ?? blankDraft()
        setDrafts((prev) => [...prev, next])
        setActiveKey(next.key)
    }

    const duplicateActive = () => {
        if (!active) return
        addDraft({ ...active, key: newKey(), id: undefined, code: '', codeFrom: '', codeTo: '', sourceBook: undefined })
    }

    const removeDraft = (key: string) => {
        setDrafts((prev) => {
            const next = prev.filter((draft) => draft.key !== key)
            return next.length > 0 ? next : [blankDraft()]
        })
    }

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return
        const imported: Draft[] = []
        const problems: string[] = []

        for (const file of Array.from(files)) {
            try {
                const records = await readJsonFile(file)
                if (records.length === 0) problems.push(`${file.name}: no contiene registros`)
                records.forEach((record) => imported.push(draftFromRecord(record)))
            } catch (error: any) {
                problems.push(error?.message ?? 'archivo inválido')
            }
        }

        if (imported.length > 0) {
            // El borrador en blanco del inicio no aporta nada cuando llegan registros
            setDrafts((prev) => {
                const withoutEmpty = prev.filter((d) => d.title || d.id)
                const base = withoutEmpty.length > 0 ? withoutEmpty : []
                return [...base, ...imported]
            })
            setActiveKey(imported[0].key)
        }
        if (problems.length > 0) {
            SwalAlert.fire({ title: 'Importación parcial', text: problems.join(' · '), icon: 'warning' })
        }
        if (imported.length > 0 && problems.length === 0) {
            SwalAlert.fire({ title: '¡Listo!', text: `${imported.length} registro(s) cargados en el lote`, icon: 'success' })
        }
    }

    const importPasted = () => {
        try {
            const records = parseJsonText(pasteText)
            if (records.length === 0) throw new Error('El JSON no contiene registros')
            const imported = records.map(draftFromRecord)
            setDrafts((prev) => [...prev.filter((d) => d.title || d.id), ...imported])
            setActiveKey(imported[0].key)
            setPasteOpen(false)
            setPasteText('')
        } catch (error: any) {
            SwalAlert.fire({ title: 'JSON inválido', text: error?.message ?? 'No se pudo leer el texto', icon: 'error' })
        }
    }

    const exportDrafts = () => {
        downloadJson(drafts.map(physicalBookDraftToPayload), 'libros-fisicos-lote')
    }

    const exportSource = () => {
        const source = drafts.filter((d) => d.sourceBook).map((d) => physicalBookToRecord(d.sourceBook))
        if (source.length === 0) return SwalAlert.fire({ title: 'Nada que exportar', text: 'El lote no tiene registros guardados', icon: 'info' })
        downloadJson(source, 'libros-fisicos')
    }

    const save = async () => {
        const records = drafts.map(physicalBookDraftToPayload)
        setBusy(true)
        setFailed([])
        SwalAlert.loading()
        try {
            const response: any = await bulkUpsertPhysicalBooks(records)
            const errors = response?.data?.errors ?? []
            setFailed(errors)
            if (handleResponses(response)) {
                onSaved()
                if (errors.length === 0) {
                    clearDrafts()
                    onClose()
                }
                // 💡 Si el lote terminó en parte mal, deja sobre la mesa sólo los
                // registros fallidos para corregirlos y reintentar sin duplicar los buenos.
                else setDrafts((prev) => prev.filter((draft, index) => !errors.some((e: any) => e.index === index)))
            }
        } catch (error) {
            console.error('Error al guardar el lote:', error)
            SwalAlert.fire({ title: 'Error de conexión', text: 'Verifica tu conexión e inténtalo de nuevo', icon: 'error' })
        } finally {
            setBusy(false)
        }
    }

    const handleAIExtract = (data: any) => {
        if (!active) return
        patchActive({
            title: data.title ?? active.title,
            isbn: data.isbn ?? active.isbn,
            code: data.code ?? active.code,
            yearOfPublication: data.yearOfPublication ?? active.yearOfPublication,
            editorial: data.editorial ?? active.editorial,
            totalStock: data.totalStock ?? active.totalStock,
            pnfs: data.pnfs?.length ? data.pnfs : (data.pnf ? [data.pnf] : active.pnfs),
            authorNames: data.authorName ? [data.authorName] : active.authorNames,
            categoryNames: data.categoryName ? [data.categoryName] : active.categoryNames
        })
    }

    return <GenericModalContainer>
        <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {mode === 'edit' ? `Editar ${drafts.length} libro(s) físico(s)` : 'Añadir libros físicos'}
            </h2>
            <Button type="button" onClick={onClose}>X</Button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Prepara varios registros y guárdalos en un solo lote. Los registros con ID actualizan el libro existente; sin ID, se crean.
        </p>

        {restored && (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                <span className="text-xs text-amber-800">
                    Se restauró el borrador guardado en este navegador. Puedes continuar donde lo dejaste.
                </span>
                <Button type="button" size="sm" variant="outline" onClick={clearDrafts}>Descartar borrador</Button>
            </div>
        )}

        {/* PESTAÑAS DEL LOTE */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {drafts.map((draft, index) => (
                <div
                    key={draft.key}
                    className={`flex items-center gap-1 shrink-0 rounded-lg border px-2 py-1 text-xs cursor-pointer transition-colors ${draft.key === active?.key ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300' : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'}`}
                    onClick={() => setActiveKey(draft.key)}
                >
                    <span className="font-semibold max-w-[9rem] truncate">{index + 1}. {draft.title || 'Nuevo registro'}</span>
                    {drafts.length > 1 && (
                        <button type="button" aria-label={`Quitar ${draft.title || 'registro'}`} className="text-gray-400 hover:text-red-600" onClick={(e) => { e.stopPropagation(); removeDraft(draft.key) }}>✕</button>
                    )}
                </div>
            ))}
            <Button type="button" size="sm" variant="outline" onClick={() => addDraft()}>+ Registro</Button>
            <Button type="button" size="sm" variant="outline" onClick={duplicateActive}>Duplicar</Button>
        </div>

        {/* CAMPOS DEL BORRADOR ACTIVO */}
        {active && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div className="sm:col-span-2">
                    <Label>Título del libro</Label>
                    <Input value={active.title} onChange={(e: any) => patchActive({ title: e.target.value })} placeholder="Mago de Oz" />
                </div>
                <div>
                    <Label>ISBN</Label>
                    <Input value={active.isbn} onChange={(e: any) => patchActive({ isbn: e.target.value })} placeholder="1234567890" />
                </div>
                <div>
                    <Label>Código de la Biblioteca</Label>
                    <Input value={active.code} onChange={(e: any) => patchActive({ code: e.target.value })} placeholder="Ej: LIB-INF-001" />
                </div>
                <div>
                    <Label>Año</Label>
                    <Input type="number" value={active.yearOfPublication} onChange={(e: any) => patchActive({ yearOfPublication: e.target.value })} />
                </div>
                <div>
                    <Label isRequired={false}>Editorial (opcional)</Label>
                    <Input value={active.editorial} onChange={(e: any) => patchActive({ editorial: e.target.value })} />
                </div>
                <div>
                    <Label>{mode === 'edit' && active.id ? 'Stock total (reconcilia ejemplares)' : 'Stock'}</Label>
                    <Input type="number" value={active.totalStock} onChange={(e: any) => patchActive({ totalStock: e.target.value })} />
                </div>
                {!active.id && (
                    <>
                        <div>
                            <Label isRequired={false}>Código inicial del rango</Label>
                            <Input value={active.codeFrom} onChange={(e: any) => patchActive({ codeFrom: e.target.value })} placeholder="Ej: LIB-001" />
                        </div>
                        <div>
                            <Label isRequired={false}>Código final del rango</Label>
                            <Input value={active.codeTo} onChange={(e: any) => patchActive({ codeTo: e.target.value })} placeholder="Ej: LIB-010" />
                        </div>
                    </>
                )}

                <div className="sm:col-span-2 grid grid-cols-2 gap-2">
                    <Button type="button" variant="outline" onClick={() => setAuthorModal(true)}>
                        Autores ({active.authorIds.length + active.authorNames.length})
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setCategoryModal(true)}>
                        Categorías ({active.categoryIds.length + active.categoryNames.length})
                    </Button>
                </div>

                <div className="sm:col-span-2 flex flex-col gap-1">
                    <Label>PNFs Vinculados ({active.pnfs.length})</Label>
                    <div className="flex flex-wrap gap-1 bg-gray-50 dark:bg-gray-950 p-2 border rounded-lg min-h-10">
                        {active.pnfs.map((p: string) => (
                            <span key={p} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded text-[10px] font-bold uppercase">{p}</span>
                        ))}
                        {active.pnfs.length === 0 && <span className="text-xs text-gray-400">Sin PNF (se usará GENERAL)</span>}
                    </div>
                    <Button type="button" variant="outline" onClick={() => setPnfModal(true)}>Asignar Áreas PNF</Button>
                </div>
            </div>
        )}

        {failed.length > 0 && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2 dark:border-red-900 dark:bg-red-950/40">
                <p className="text-xs font-bold text-red-700 dark:text-red-300">{failed.length} registro(s) no se guardaron</p>
                <ul className="mt-1 space-y-0.5">
                    {failed.map((error) => (
                        <li key={`${error.index}-${error.title}`} className="text-[11px] text-red-700 dark:text-red-300">
                            <span className="font-semibold">{error.title}:</span> {error.message}
                        </li>
                    ))}
                </ul>
            </div>
        )}

        {pasteOpen && (
            <div className="mt-3">
                <Label>Pegar JSON (objeto, arreglo o {"{ data: [...] }"})</Label>
                <textarea
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    rows={5}
                    className="w-full rounded-lg border border-gray-300 p-2 text-xs font-mono dark:bg-gray-950 dark:border-gray-700 dark:text-white/90"
                    placeholder='[{"title": "...", "editorial": "...", "yearOfPublication": 2024, "totalStock": 3}]'
                />
                <Button type="button" size="sm" className="mt-1" onClick={importPasted}>Añadir al lote</Button>
            </div>
        )}

        {/* ACCIONES */}
        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
            <input ref={fileInput} type="file" accept="application/json,.json" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            <Button type="button" variant="outline" onClick={() => fileInput.current?.click()}>Importar JSON</Button>
            <Button type="button" variant="outline" onClick={() => setPasteOpen((open) => !open)}>Pegar JSON</Button>
            <Button type="button" variant="outline" onClick={exportDrafts}>Exportar lote</Button>
            {mode === 'edit' && <Button type="button" variant="outline" onClick={exportSource}>Exportar originales</Button>}
            <Button type="button" className="ml-auto bg-green-600 hover:bg-green-700" disabled={busy} onClick={save}>
                Guardar {drafts.length > 1 ? `${drafts.length} registros` : 'registro'}
            </Button>
        </div>

        <PhysicalBookFormChatbot mode={mode} currentBook={active?.sourceBook} onExtract={handleAIExtract} />

        {active && (
            <>
                <AuthorSelectorModal
                    isOpen={authorModal}
                    onClose={() => setAuthorModal(false)}
                    selectedIds={active.authorIds}
                    onChange={(ids: string[]) => patchActive({ authorIds: ids, authorNames: [] })}
                />
                <CategorySelectorModal
                    isOpen={categoryModal}
                    onClose={() => setCategoryModal(false)}
                    selectedIds={active.categoryIds}
                    onChange={(ids: string[]) => patchActive({ categoryIds: ids, categoryNames: [] })}
                />
                <PnfSelectorModal
                    isOpen={pnfModal}
                    onClose={() => setPnfModal(false)}
                    selectedPnfs={active.pnfs}
                    onChange={(pnfsSelected: string[]) => patchActive({ pnfs: pnfsSelected })}
                />
            </>
        )}
    </GenericModalContainer>
}
