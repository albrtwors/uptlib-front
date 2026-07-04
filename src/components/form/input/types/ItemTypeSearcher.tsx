"use client"

import Input from "@/components/form/input/InputField"
import Label from "@/components/form/Label"
import useTypes from "@/hooks/types/useTypes"
import { useEffect, useState } from "react"

export default function ItemTypeSearcher({ setSearchHandler, defaultValue, typeNameField = "typeName", typeIdField = "typeId" }: any) {
    const [search, setSearch] = useState('')
    const [selectedId, setSelectedId] = useState('') // 💡 Estado para el ID real de la BD
    const [dropDownShow, setDropdownShow] = useState(false)
    const { types, setTypes, getTypes } = useTypes({ search })

    // 💡 Sincronizar cuando el modal se abre o cuando la IA altera el estado del padre
    useEffect(() => {
        if (defaultValue?.name) {
            setSearch(defaultValue.name)
            setSelectedId(defaultValue.id || '') // Si viene de la BD o la IA tiene el ID, lo guardamos
            if (setSearchHandler) setSearchHandler(defaultValue.name)
        } else {
            setSearch('')
            setSelectedId('')
        }
    }, [defaultValue])

    const handleTypeSelect = (type: any) => {
        setSearch(type.name)
        setSelectedId(type.id) // 💡 Vinculamos el ID real seleccionado
        setDropdownShow(false)
        if (setSearchHandler) setSearchHandler(type.name)
    }

    const handleSearch = (e: any) => {
        const val = e.target.value
        getTypes({ src: val }).then(res => setTypes(res))
        setSearch(val)
        setSelectedId('') // 💡 Si el usuario escribe manualmente, rompemos el ID previo para obligar al backend a buscar/crear por nombre
        if (setSearchHandler) setSearchHandler(val)
        setDropdownShow(val !== '')
    }

    useEffect(() => {
        getTypes({ search }).then(res => setTypes(res))
    }, [])

    return (
        <div className="flex flex-col relative">
            <Label>Tipo de Item</Label>

            {/* 💡 INPUT OCULTO: Envía el ID real si el tipo ya existe en la BD */}
            <input type="hidden" name={typeIdField} value={selectedId} />

            {/* INPUT VISUAL: Envía el nombre para fallback de creación en backend */}
            <input
                name={typeNameField}
                onChange={handleSearch}
                className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                value={search}
                placeholder="Seleccione o escriba un tipo..."
                autoComplete="off"
            />

            {dropDownShow && types.length > 0 && (
                <div className="p-2 absolute z-50 bg-white dark:bg-gray-800 border dark:border-gray-700 mt-20 rounded-lg shadow-xl max-h-40 overflow-y-auto w-full">
                    {types.map((type: any) => (
                        <div
                            key={type.id}
                            onClick={() => handleTypeSelect(type)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer rounded-md transition-colors"
                        >
                            <h1 className="text-sm text-gray-700 dark:text-gray-200">{type.name}</h1>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}