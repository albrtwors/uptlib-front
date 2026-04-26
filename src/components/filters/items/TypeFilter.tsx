"use client"

import Input from "@/components/form/input/InputField"
import Label from "@/components/form/Label"
import { useCategories } from "@/hooks/categories/useCategories"
import useTypes from "@/hooks/types/useTypes"
import { useEffect, useState } from "react"

export default function TypeFilter({ setSearchHandler }: any) {
    const [search, setSearch] = useState('')
    const [dropDownShow, setDropdownShow] = useState(false)
    const { types, setTypes, getTypes } = useTypes({ search })


    const handleTypeSelect = (type: any) => {
        setSearch(type.name)
        setDropdownShow(false)
        setSearchHandler(type.name)
    }

    const handleSearch = (e: any) => {
        getTypes({ src: e.target.value }).then(res => setTypes(res))
        setSearch(e.target.value)
        setSearchHandler(e.target.value)
        setDropdownShow(true)
        if (e.target.value == '') {
            setDropdownShow(false)
        }
    }

    useEffect(() => {
        getTypes({ search }).then(res => setTypes(res))
    }, [])

    return <div className="flex flex-col">
        <Label>Tipo</Label>
        <input onChange={handleSearch} className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" value={search} ></input>
        {dropDownShow && <div className="p-2 absolute bg-white  mt-20 rounded-lg shadow-xl">
            {types.map((type: any) => {
                return <div key={type.id} onClick={() => { handleTypeSelect(type) }} className="w-50  cursor-pointer"><h1 >{type.name}</h1></div>
            })}
        </div>}

    </div>
}