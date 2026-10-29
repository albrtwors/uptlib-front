"use client"

import { useEffect, useState } from "react"
import Button from "@/components/ui/button/Button"
import Input from "@/components/form/input/InputField"
import Label from "@/components/form/Label"
import GenericModalContainer from "@/components/modals/GenericModalContainer"
import { formCacheKey, useCachedState } from "@/hooks/lib/useCachedForm"

export type CopyStatus = "DISPONIBLE" | "PRESTADO" | "MANTENIMIENTO" | "BAJA"

export interface Copy {
    id: string
    code: string
    status: CopyStatus
    location?: string | null
    observations?: string | null
    createdAt?: string
}

interface CopiesDraft {
    quantity: string
    codesText: string
    location: string
    codeFrom: string
    codeTo: string
}

const emptyCopiesDraft = (): CopiesDraft => ({ quantity: '1', codesText: '', location: '', codeFrom: '', codeTo: '' })

const COPY_STATUS: CopyStatus[] = ["DISPONIBLE", "PRESTADO", "MANTENIMIENTO", "BAJA"]

const statusClasses: Record<CopyStatus, string> = {
    DISPONIBLE: "bg-green-100 text-green-800",
    PRESTADO: "bg-yellow-100 text-yellow-800",
    MANTENIMIENTO: "bg-blue-100 text-blue-800",
    BAJA: "bg-gray-200 text-gray-700"
}

interface CopiesManagerProps {
    kind: "physical-book" | "inventory"
    resourceId: string
    title: string
    /** Código asignado por la biblioteca al libro o artículo: origen del prefijo de los ejemplares */
    parentCode?: string | null
    onClose: () => void
    onChanged?: () => void
}

export default function CopiesManager({ kind, resourceId, title, parentCode, onClose, onChanged }: CopiesManagerProps) {
    const [copies, setCopies] = useState<Copy[]>([])
    const [loading, setLoading] = useState(true)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState('')

    // 💡 El lote de nuevos ejemplares se guarda en el navegador mientras se escribe
    const {
        value: draft,
        setValue: setDraft,
        clear: clearDraft,
        restored: draftRestored
    } = useCachedState<CopiesDraft>(formCacheKey('copies', kind, resourceId), emptyCopiesDraft)
    const { quantity, codesText, location, codeFrom, codeTo } = draft
    const patchDraft = (changes: Partial<CopiesDraft>) => setDraft((prev) => ({ ...prev, ...changes }))

    const [editId, setEditId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState<{ code: string; status: CopyStatus; location: string; observations: string }>({
        code: '',
        status: 'DISPONIBLE',
        location: '',
        observations: ''
    })

    const base = `/api/${kind}`

    const copyBase = (parentCode ?? '').trim().toUpperCase().replace(/\s+/g, '-')
    const highestNumber = copies.reduce((highest, copy) => {
        const match = /(\d+)$/.exec(copy.code)
        if (!match) return highest
        const parsed = parseInt(match[1], 10)
        return Number.isNaN(parsed) ? highest : Math.max(highest, parsed)
    }, 0)
    const requestedQuantity = Math.max(0, parseInt(quantity, 10) || 0)
    const expectedCodes = Array.from({ length: requestedQuantity }, (_, i) => {
        const n = highestNumber + i + 1
        return `${copyBase}-${String(n).padStart(Math.max(4, `${n}`.length), '0')}`
    })

    const load = async () => {
        setLoading(true)
        try {
            const res = await fetch(`${base}/${resourceId}/copies`)
            const data = await res.json()
            setCopies(Array.isArray(data?.data) ? data.data : [])
        } catch (err: any) {
            setError(err?.message || 'Error al cargar los ejemplares')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const addCopies = async () => {
        setBusy(true)
        setError('')
        try {
            const codes = codesText.split(',').map((c) => c.trim()).filter(Boolean)
            const res = await fetch(`${base}/${resourceId}/copies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    quantity,
                    codes,
                    location: location || undefined,
                    codeFrom: codeFrom.trim() || undefined,
                    codeTo: codeTo.trim() || undefined
                })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data?.message || 'No se pudieron agregar los ejemplares')
            clearDraft()
            await load()
            onChanged?.()
        } catch (err: any) {
            setError(err?.message || 'No se pudieron agregar los ejemplares')
        } finally {
            setBusy(false)
        }
    }

    const saveEdit = async () => {
        if (!editId) return
        setBusy(true)
        setError('')
        try {
            const res = await fetch(`${base}/copies/${editId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: editForm.code,
                    status: editForm.status,
                    location: editForm.location || null,
                    observations: editForm.observations || null
                })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data?.message || 'No se pudo actualizar el ejemplar')
            setEditId(null)
            await load()
            onChanged?.()
        } catch (err: any) {
            setError(err?.message || 'No se pudo actualizar el ejemplar')
        } finally {
            setBusy(false)
        }
    }

    const removeCopy = async (copyId: string) => {
        setBusy(true)
        setError('')
        try {
            const res = await fetch(`${base}/copies/${copyId}`, { method: 'DELETE' })
            const data = await res.json()
            if (!res.ok) throw new Error(data?.message || 'No se pudo eliminar el ejemplar')
            await load()
            onChanged?.()
        } catch (err: any) {
            setError(err?.message || 'No se pudo eliminar el ejemplar')
        } finally {
            setBusy(false)
        }
    }

    return <GenericModalContainer>
        <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-bold">Ejemplares · {title}</h3>
            <Button type="button" size="sm" onClick={onClose}>X</Button>
        </div>

        {error && <div className="mb-3 rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}

        <div className="rounded-lg border border-gray-200 p-3 mb-3">
            {draftRestored && (
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-2 py-1.5">
                    <span className="text-xs text-amber-800">Se restauró el lote sin agregar de este navegador.</span>
                    <Button type="button" size="sm" variant="outline" onClick={clearDraft}>Descartar</Button>
                </div>
            )}
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <Label>Cantidad</Label>
                    <Input type="number" min="1" value={quantity} onChange={(e: any) => patchDraft({ quantity: e.target.value })} />
                </div>
                <div>
                    <Label>Ubicación (opcional)</Label>
                    <Input value={location} onChange={(e: any) => patchDraft({ location: e.target.value })} placeholder="Estante..." />
                </div>
            </div>
            <div className="mt-2">
                <Label>Códigos personalizados (opcional, separados por coma)</Label>
                <Input value={codesText} onChange={(e: any) => patchDraft({ codesText: e.target.value })} placeholder="XXX-XXXX-0001, ..." />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                    <Label>Rango desde (opcional)</Label>
                    <Input value={codeFrom} onChange={(e: any) => patchDraft({ codeFrom: e.target.value })} placeholder={`Ej: ${copyBase || 'LIB-XXXX'}-${String(highestNumber + 1).padStart(4, '0')}`} />
                </div>
                <div>
                    <Label>Rango hasta (opcional)</Label>
                    <Input value={codeTo} onChange={(e: any) => patchDraft({ codeTo: e.target.value })} placeholder={`Ej: ${copyBase || 'LIB-XXXX'}-${String(highestNumber + requestedQuantity).padStart(4, '0')}`} />
                </div>
            </div>
            {copyBase ? (
                <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                    <p className="text-xs text-gray-600">
                        Los ejemplares heredan el código del recurso: <span className="font-mono font-semibold text-gray-800">{copyBase}</span>
                    </p>
                    {!codesText.trim() && !codeFrom.trim() && requestedQuantity > 0 && (
                        <p className="text-xs text-gray-600 mt-1">
                            Se generará la numeración continuando la existente:{" "}
                            <span className="font-mono">{expectedCodes.slice(0, 5).join(", ")}{expectedCodes.length > 5 ? "…" : ""}</span>
                        </p>
                    )}
                </div>
            ) : (
                <p className="text-xs text-amber-600 mt-2">
                    El recurso no tiene código asignado: los ejemplares usarán un prefijo generado desde el ISBN o el identificador.
                </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
                Si indicas un rango, los ejemplares se numerarán consecutivamente desde ese código. Los códigos personalizados tienen prioridad sobre el rango.
            </p>
            <div className="mt-3">
                <Button type="button" size="sm" onClick={addCopies} disabled={busy}>Agregar ejemplares</Button>
            </div>
        </div>

        {loading ? (
            <p className="text-center text-gray-500 py-6">Cargando...</p>
        ) : copies.length === 0 ? (
            <p className="text-center text-gray-500 py-6">Este recurso no tiene ejemplares registrados.</p>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Código</th>
                            <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Estado</th>
                            <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Ubicación</th>
                            <th className="px-2 py-2 text-center text-xs font-semibold text-gray-700 uppercase w-32">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {copies.map((copy) => editId === copy.id ? (
                            <tr key={copy.id}>
                                <td className="px-2 py-2"><Input value={editForm.code} onChange={(e: any) => setEditForm({ ...editForm, code: e.target.value })} /></td>
                                <td className="px-2 py-2">
                                    <select value={editForm.status} onChange={(e: any) => setEditForm({ ...editForm, status: e.target.value })} className="p-2 rounded-lg border border-gray-300 text-sm">
                                        {COPY_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </td>
                                <td className="px-2 py-2"><Input value={editForm.location} onChange={(e: any) => setEditForm({ ...editForm, location: e.target.value })} /></td>
                                <td className="px-2 py-2">
                                    <div className="flex gap-1 justify-center">
                                        <Button type="button" size="sm" onClick={saveEdit} disabled={busy}>Guardar</Button>
                                        <Button type="button" size="sm" variant="outline" onClick={() => setEditId(null)}>Cancelar</Button>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            <tr key={copy.id} className="hover:bg-gray-50">
                                <td className="px-2 py-2 text-sm font-mono text-gray-800">{copy.code}</td>
                                <td className="px-2 py-2">
                                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${statusClasses[copy.status] || 'bg-gray-100 text-gray-800'}`}>
                                        {copy.status}
                                    </span>
                                </td>
                                <td className="px-2 py-2 text-sm text-gray-600">{copy.location || '—'}</td>
                                <td className="px-2 py-2">
                                    <div className="flex gap-1 justify-center">
                                        <Button type="button" size="sm" variant="outline" onClick={() => {
                                            setEditId(copy.id)
                                            setEditForm({
                                                code: copy.code,
                                                status: copy.status,
                                                location: copy.location ?? '',
                                                observations: copy.observations ?? ''
                                            })
                                        }}>Editar</Button>
                                        <Button type="button" size="sm" className="bg-red-600" onClick={() => removeCopy(copy.id)} disabled={busy}>Eliminar</Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
    </GenericModalContainer>
}
