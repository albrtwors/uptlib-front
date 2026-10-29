"use client"
import { useState, useEffect } from 'react'
import Button from "@/components/ui/button/Button"
import Input from "@/components/form/input/InputField"
import Label from "@/components/form/Label"
import { usePnfs, PnfEntity } from "@/hooks/pnfs/usePnfs"

interface PnfSelectorModalProps {
    isOpen: boolean
    onClose: () => void
    selectedPnfs: string[]
    onChange: (pnfs: string[]) => void
    isCrud?: boolean
}

export default function PnfSelectorModal({
    isOpen,
    onClose,
    selectedPnfs,
    onChange,
    isCrud = true
}: PnfSelectorModalProps) {
    const [tab, setTab] = useState<'search' | 'create'>('search')
    const [search, setSearch] = useState('')
    const [newName, setNewName] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { pnfs, setPnfs, getPnfs } = usePnfs({ search: '', limit: 100 })

    useEffect(() => {
        if (!isCrud) setTab('search')
    }, [isCrud])

    useEffect(() => {
        if (!isOpen || tab !== 'search') return

        const delayDebounce = setTimeout(() => {
            getPnfs({ search, limit: 100 }).then((res: any) => {
                setPnfs(res)
            }).catch((err: any) => console.error(err))
        }, 300)

        return () => clearTimeout(delayDebounce)
    }, [search, isOpen, tab])

    const handleToggleCheckbox = (name: string) => {
        if (selectedPnfs.includes(name)) {
            onChange(selectedPnfs.filter(item => item !== name))
        } else {
            onChange([...selectedPnfs, name])
        }
    }

    const handleCreatePnf = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newName.trim() || isSubmitting) return
        setIsSubmitting(true)

        try {
            const res = await fetch('/api/pnf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName })
            })
            const result = await res.json()
            const created = result?.data
            if (res.ok && created?.name) {
                if (!selectedPnfs.includes(created.name)) onChange([...selectedPnfs, created.name])
                setNewName('')
                setSearch('')
                setTab('search')
                getPnfs({ search: '', limit: 100 }).then((res: any) => setPnfs(res))
            } else if (result?.message) {
                alert(result.message)
            }
        } catch (err) {
            console.error("Error al crear PNF:", err)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen) return null

    const pnfList: PnfEntity[] = Array.isArray(pnfs) ? pnfs : (pnfs?.data || [])

    return (
        <div className="fixed inset-0 z-[113948130498104300] flex items-center justify-center bg-black/50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl rounded-2xl w-full max-w-md flex flex-col max-h-[85vh] overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-950">
                    <h3 className="font-bold text-base text-gray-900 dark:text-white">Asignar PNFs Relacionados</h3>
                    <Button type="button" onClick={onClose} className="py-1 px-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs">X</Button>
                </div>

                {isCrud && (
                    <div className="flex border-b border-gray-100 dark:border-gray-800 text-sm">
                        <button
                            type="button"
                            onClick={() => setTab('search')}
                            className={`flex-1 py-2.5 font-medium border-b-2 transition-colors ${tab === 'search' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Buscar Existentes
                        </button>
                        <button
                            type="button"
                            onClick={() => setTab('create')}
                            className={`flex-1 py-2.5 font-medium border-b-2 transition-colors ${tab === 'create' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Crear Nuevo PNF
                        </button>
                    </div>
                )}

                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {tab === 'search' ? (
                        <>
                            <div>
                                <Label>Filtrar por Nombre</Label>
                                <Input
                                    placeholder="Ej: INFORMATICA, ELECTRONICA..."
                                    defaultValue={search}
                                    onChange={(e: any) => setSearch(e.target.value)}
                                />
                            </div>

                            <div className="border border-gray-100 dark:border-gray-800 rounded-xl divide-y divide-gray-100 dark:divide-gray-800 max-h-48 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-2 space-y-1">
                                {pnfList.length === 0 ? (
                                    <p className="text-center text-xs text-gray-400 py-4">No se encontraron PNFs.</p>
                                ) : (
                                    pnfList.map((pnf: PnfEntity) => (
                                        <label key={pnf.id} className="flex items-center gap-3 px-3 py-2 hover:bg-white dark:hover:bg-gray-900 rounded-lg cursor-pointer transition-colors text-sm">
                                            <input
                                                type="checkbox"
                                                checked={selectedPnfs.includes(pnf.name)}
                                                onChange={() => handleToggleCheckbox(pnf.name)}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                            />
                                            <span className="text-gray-700 dark:text-gray-200 uppercase font-medium">{pnf.name}</span>
                                        </label>
                                    ))
                                )}
                            </div>
                        </>
                    ) : (
                        <form onSubmit={handleCreatePnf} className="space-y-3">
                            <div>
                                <Label>Nombre del PNF</Label>
                                <Input
                                    placeholder="Ej: INFORMATICA"
                                    defaultValue={newName}
                                    onChange={(e: any) => setNewName(e.target.value)}
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Se guardará en mayúsculas y sin acentos. Quedará seleccionado automáticamente.
                                </p>
                            </div>
                            <Button type="submit" disabled={isSubmitting} className="w-full justify-center">
                                {isSubmitting ? 'Guardando...' : 'Registrar y Seleccionar'}
                            </Button>
                        </form>
                    )}
                </div>

                <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex justify-end">
                    <Button type="button" onClick={onClose} className="w-full sm:w-auto">Listo</Button>
                </div>
            </div>
        </div>
    )
}
