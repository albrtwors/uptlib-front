"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Button from "@/components/ui/button/Button"
import Label from "@/components/form/Label"
import Input from "@/components/form/input/InputField"
import GenericModalContainer from "@/components/modals/GenericModalContainer"
import ItemTypeSelectorModal, { ItemTypeOption } from "@/components/form/types/ItemTypeSelectorModal"
import InventoryFormChatbot from "@/components/chatbot/inventory/InventoryFormChatbot"
import { SwalAlert } from "@/hooks/lib/swal/swal"
import { handleResponses } from "@/hooks/lib/responses/handleResponses"
import { bulkUpsertInventory } from "@/hooks/lib/useBulkActions"
import { formCacheKey, useCachedState } from "@/hooks/lib/useCachedForm"
import {
    downloadJson,
    inventoryDraftToPayload,
    itemToRecord,
    parseJsonText,
    readJsonFile,
    recordToInventoryDraft
} from "@/utils/jsonRecords"

interface Draft {
    key: string
    id?: string
    name: string
    code: string
    description: string
    stock: string
    types: ItemTypeOption[]
    sourceItem?: any
}

const newKey = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const blankDraft = (): Draft => ({
    key: newKey(),
    id: undefined,
    name: '',
    code: '',
    description: '',
    stock: '',
    types: []
})

const draftFromItem = (item: any): Draft => ({
    ...blankDraft(),
    id: `${item.id}`,
    name: item.name ?? '',
    code: item.code ?? '',
    description: item.description ?? '',
    stock: `${item.totalStock ?? 0}`,
    types: (item.types || []).map((type: any) => ({ id: type.id, name: type.name })),
    sourceItem: item
})

const draftFromRecord = (record: Record<string, any>): Draft => ({
    ...blankDraft(),
    ...recordToInventoryDraft(record),
    id: record.id ? `${record.id}` : undefined,
    key: newKey()
})

const mergeSelectedTypes = (current: ItemTypeOption[], ids: string[], options: ItemTypeOption[] = []) => {
    const byId = new Map(current.filter((type) => type.id).map((type) => [type.id, type]))
    options.forEach((type) => byId.set(type.id, type))
    const selected = ids.map((id) => byId.get(id)).filter((type): type is ItemTypeOption => Boolean(type))
    const selectedNames = new Set(selected.map((type) => type.name.toLowerCase()))
    const pending = current.filter((type) => !type.id && !selectedNames.has(type.name.toLowerCase()))
    return [...pending, ...selected]
}

const extractedTypes = (data: any): ItemTypeOption[] | null => {
    if (Array.isArray(data.typeNames) && data.typeNames.length > 0) {
        const names = data.typeNames
            .map((name: any) => `${name}`.trim())
            .filter(Boolean)
            .map((name: string) => ({ id: '', name }))
        if (names.length > 0) return names
    }
    return data.typeName ? [{ id: '', name: data.typeName }] : null
}

interface InventoryRecordsWorkspaceModalProps {
    mode: 'create' | 'edit'
    seeds?: any[]
    onClose: () => void
    onSaved: () => void
}

/**
 * Mesa de trabajo de inventario: crea o edita varios artículos a la vez,
 * importa/exporta JSON y guarda todo en un único lote contra /inventory/bulk.
 */
export default function InventoryRecordsWorkspaceModal({ mode, seeds = [], onClose, onSaved }: InventoryRecordsWorkspaceModalProps) {
    const seedIds = seeds.map((seed: any) => `${seed?.id ?? ''}`).join(',')
    const cacheKey = formCacheKey('inventory-workspace', mode, seedIds)
    const { value: drafts, setValue: setDrafts, clear: clearDrafts, restored } = useCachedState<Draft[]>(
        cacheKey,
        () => mode === 'edit' ? seeds.map(draftFromItem) : [blankDraft()]
    )
    const [activeKey, setActiveKey] = useState<string>(() => drafts[0]?.key ?? '')
    const [typeModal, setTypeModal] = useState(false)
    const [pasteOpen, setPasteOpen] = useState(false)
    const [pasteText, setPasteText] = useState('')
    const [failed, setFailed] = useState<{ index: number; name: string; message: string }[]>([])
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
        addDraft({ ...active, key: newKey(), id: undefined, code: '', sourceItem: undefined })
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
            setDrafts((prev) => {
                const withoutEmpty = prev.filter((draft) => draft.name || draft.id)
                return [...withoutEmpty, ...imported]
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
            setDrafts((prev) => [...prev.filter((draft) => draft.name || draft.id), ...imported])
            setActiveKey(imported[0].key)
            setPasteOpen(false)
            setPasteText('')
        } catch (error: any) {
            SwalAlert.fire({ title: 'JSON inválido', text: error?.message ?? 'No se pudo leer el texto', icon: 'error' })
        }
    }

    const exportDrafts = () => {
        downloadJson(drafts.map(inventoryDraftToPayload), 'inventario-lote')
    }

    const exportSource = () => {
        const source = drafts.filter((draft) => draft.sourceItem).map((draft) => itemToRecord(draft.sourceItem))
        if (source.length === 0) return SwalAlert.fire({ title: 'Nada que exportar', text: 'El lote no tiene registros guardados', icon: 'info' })
        downloadJson(source, 'inventario')
    }

    const save = async () => {
        const records = drafts.map(inventoryDraftToPayload)
        setBusy(true)
        setFailed([])
        SwalAlert.loading()
        try {
            const response: any = await bulkUpsertInventory(records)
            const errors = response?.data?.errors ?? []
            setFailed(errors)
            if (handleResponses(response)) {
                onSaved()
                if (errors.length === 0) {
                    clearDrafts()
                    onClose()
                } else {
                    setDrafts((prev) => prev.filter((draft, index) => !errors.some((e: any) => e.index === index)))
                }
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
        const types = extractedTypes(data)
        patchActive({
            name: data.name ?? active.name,
            code: data.code ?? active.code,
            description: data.description ?? active.description,
            stock: data.stock ?? active.stock,
            types: types ?? active.types
        })
    }

    return <GenericModalContainer>
        <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {mode === 'edit' ? `Editar ${drafts.length} artículo(s)` : 'Añadir artículos al inventario'}
            </h2>
            <Button type="button" onClick={onClose}>X</Button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Prepara varios registros y guárdalos en un solo lote. Los registros con ID actualizan el artículo existente; sin ID, se crean.
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
                    <span className="font-semibold max-w-[9rem] truncate">{index + 1}. {draft.name || 'Nuevo registro'}</span>
                    {drafts.length > 1 && (
                        <button type="button" aria-label={`Quitar ${draft.name || 'registro'}`} className="text-gray-400 hover:text-red-600" onClick={(e) => { e.stopPropagation(); removeDraft(draft.key) }}>✕</button>
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
                    <Label>Nombre del artículo</Label>
                    <Input value={active.name} onChange={(e: any) => patchActive({ name: e.target.value })} placeholder="Ej: Borrador blanco" />
                </div>
                <div>
                    <Label isRequired={false}>Código</Label>
                    <Input value={active.code} onChange={(e: any) => patchActive({ code: e.target.value })} placeholder="Ej: INV-001" />
                </div>
                <div>
                    <Label>Stock</Label>
                    <Input type="number" value={active.stock} onChange={(e: any) => patchActive({ stock: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                    <Label isRequired={false}>Descripción (opcional)</Label>
                    <Input value={active.description} onChange={(e: any) => patchActive({ description: e.target.value })} />
                </div>

                <div className="sm:col-span-2 flex flex-col gap-1">
                    <Label>Tipos de artículo ({active.types.length})</Label>
                    <div className="flex flex-wrap gap-1 bg-gray-50 dark:bg-gray-950 p-2 border rounded-lg min-h-10">
                        {active.types.map((type) => (
                            <span key={`${type.id}-${type.name}`} className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 rounded text-[10px] font-bold uppercase">
                                {type.name}
                                <button type="button" aria-label={`Quitar ${type.name}`} className="text-brand-500 hover:text-red-600" onClick={() => patchActive({ types: active.types.filter((item) => item !== type) })}>✕</button>
                            </span>
                        ))}
                        {active.types.length === 0 && <span className="text-xs text-gray-400">Sin tipos asignados</span>}
                    </div>
                    <Button type="button" variant="outline" onClick={() => setTypeModal(true)}>Seleccionar tipos</Button>
                </div>
            </div>
        )}

        {failed.length > 0 && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2 dark:border-red-900 dark:bg-red-950/40">
                <p className="text-xs font-bold text-red-700 dark:text-red-300">{failed.length} registro(s) no se guardaron</p>
                <ul className="mt-1 space-y-0.5">
                    {failed.map((error) => (
                        <li key={`${error.index}-${error.name}`} className="text-[11px] text-red-700 dark:text-red-300">
                            <span className="font-semibold">{error.name}:</span> {error.message}
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
                    placeholder='[{"name": "Papel bond", "stock": 20, "typeNames": ["Papelería"]}]'
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

        <InventoryFormChatbot mode={mode} currentItem={active?.sourceItem} onExtract={handleAIExtract} />

        {active && (
            <ItemTypeSelectorModal
                isOpen={typeModal}
                onClose={() => setTypeModal(false)}
                selectedIds={active.types.map((type) => type.id).filter(Boolean)}
                onChange={(ids, options) => patchActive({ types: mergeSelectedTypes(active.types, ids, options) })}
            />
        )}
    </GenericModalContainer>
}
