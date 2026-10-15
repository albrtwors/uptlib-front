"use client"

import { useEffect, useState } from "react"
import Label from "@/components/form/Label"

export type CopyStatus = "DISPONIBLE" | "PRESTADO" | "MANTENIMIENTO" | "BAJA"

export interface Copy {
    id: string
    code: string
    status: CopyStatus
    location?: string | null
}

interface CopySelectorProps {
    kind: "physical-book" | "inventory"
    resourceId: string
    onChange?: (ids: string[]) => void
}

export default function CopySelector({ kind, resourceId, onChange }: CopySelectorProps) {
    const [copies, setCopies] = useState<Copy[]>([])
    const [selected, setSelected] = useState<string[]>([])
    const [loading, setLoading] = useState(true)

    const base = `/api/${kind}`

    useEffect(() => {
        let active = true
        fetch(`${base}/${resourceId}/copies`)
            .then((res) => res.json())
            .then((data) => {
                if (!active) return
                const list: Copy[] = Array.isArray(data?.data) ? data.data : []
                setCopies(list.filter((c) => c.status === 'DISPONIBLE'))
            })
            .catch(() => { if (active) setCopies([]) })
            .finally(() => { if (active) setLoading(false) })
        return () => { active = false }
    }, [resourceId, base])

    const toggle = (id: string) => {
        setSelected((prev) => {
            const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
            onChange?.(next)
            return next
        })
    }

    if (loading) {
        return <p className="text-sm text-gray-500 py-2">Cargando ejemplares...</p>
    }

    if (copies.length === 0) {
        return <p className="text-sm text-gray-500 py-2">Este recurso no tiene ejemplares disponibles. Se usará la cantidad.</p>
    }

    return (
        <div className="space-y-2">
            <Label isRequired={false}>Ejemplares a prestar ({selected.length} seleccionados)</Label>
            <div className="flex flex-wrap gap-2 p-2 border border-gray-200 rounded-lg max-h-40 overflow-auto">
                {copies.map((copy) => (
                    <label
                        key={copy.id}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm cursor-pointer transition-all ${selected.includes(copy.id)
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                            }`}
                    >
                        <input
                            type="checkbox"
                            name="copyIds"
                            value={copy.id}
                            checked={selected.includes(copy.id)}
                            onChange={() => toggle(copy.id)}
                            className="hidden"
                        />
                        <span className="font-mono">{copy.code}</span>
                    </label>
                ))}
            </div>
        </div>
    )
}
