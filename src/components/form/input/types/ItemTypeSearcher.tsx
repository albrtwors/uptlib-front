"use client"

import { useState, useRef, useEffect } from "react"
import Label from "../../Label"
import useTypes from "@/hooks/types/useTypes"

export default function ItemTypeSearcher({ defaultValue = null }: any) {
    const [search, setSearch] = useState(defaultValue?.name || '')
    const [selectedType, setSelectedType] = useState<any>(defaultValue)

    // Evitamos pasar el objeto reactivo cambiante en cada renderización
    const { types, setTypes, getTypes } = useTypes({ search: "" })
    const searchTimeoutRef = useRef<NodeJS.Timeout>(null)

    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)

        if (search.trim().length < 2 || (selectedType && selectedType.name === search)) {
            if (types && types.length > 0) {
                setTypes([])
            }
            return
        }

        searchTimeoutRef.current = setTimeout(() => {
            getTypes({ src: search }).then(res => {
                if (res) setTypes(res)
            })
        }, 300)

        return () => {
            if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
        }
    }, [search, getTypes, setTypes])

    const selectType = (type: any) => {
        setSelectedType(type)
        setSearch(type.name)
        setTypes([])
    }

    const clearType = () => {
        setSelectedType(null)
        setSearch('')
        setTypes([])
    }

    return (
        <div className="space-y-2 relative">
            <div>
                <Label>Tipo de Item</Label>
                <input
                    className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                    value={search}
                    onChange={(e: any) => {
                        setSearch(e.target.value)
                        if (selectedType) setSelectedType(null)
                    }}
                    type="text"
                    placeholder="Buscar tipo o escribir uno nuevo..."
                />
            </div>

            {/* 💡 INPUTS DINÁMICOS PARA EL FORM DATA */}
            {selectedType ? (
                <input type="hidden" name="typeId" value={selectedType.id} />
            ) : (
                search.trim().length >= 2 && <input type="hidden" name="typeName" value={search.trim()} />
            )}

            {/* LISTA DE RESULTADOS SUGERIDOS */}
            {types && types.length > 0 && !selectedType && (
                <div className="max-h-48 overflow-auto border border-gray-200 rounded-lg shadow-sm bg-white dark:bg-gray-900 absolute z-50 w-full top-[4.5rem]">
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {types.slice(0, 8).map((type: any) => (
                            <div
                                key={type.id}
                                className="px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-gray-800 dark:hover:to-gray-800 cursor-pointer transition-all border-l-4 border-transparent hover:border-purple-400"
                                onClick={() => selectType(type)}
                            >
                                <div className="font-medium text-gray-900 dark:text-white truncate">{type.name}</div>
                                <div className="text-xs text-gray-500 mt-0.5">ID: {type.id}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* AVISO DE CREACIÓN AL VUELO */}
            {!selectedType && search.trim().length >= 2 && (!types || types.length === 0) && (
                <div className="p-3 border border-dashed border-purple-300 rounded-xl bg-purple-50/50 text-xs text-purple-700 flex items-center gap-2">
                    <span>✨</span>
                    <span>El tipo <strong>"{search}"</strong> no existe. Se creará automáticamente al guardar.</span>
                </div>
            )}

            {selectedType && (
                <div className="p-3 border border-emerald-200 rounded-xl bg-emerald-50/40 flex items-center justify-between text-xs">
                    <span className="text-emerald-800 truncate">Vinculado a: <strong>{selectedType.name}</strong></span>
                    <button type="button" onClick={clearType} className="text-gray-400 hover:text-red-500 font-bold ml-2">Cambiar</button>
                </div>
            )}
        </div>
    )
}