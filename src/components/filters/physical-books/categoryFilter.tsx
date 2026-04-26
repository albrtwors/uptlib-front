"use client"

import Input from "@/components/form/input/InputField"
import Label from "@/components/form/Label"
import { useCategories } from "@/hooks/categories/useCategories"
import { useEffect, useState } from "react"

export default function CategoryFilter({ setSearchHandler }: any) {
    const [search, setSearch] = useState('')
    const [dropDownShow, setDropdownShow] = useState(false)
    const { categories, setCategories, getCategories } = useCategories({ search })


    const handleCategorySelect = (category: any) => {
        setSearch(category.name)
        setDropdownShow(false)
        setSearchHandler(category.name)
    }

    const handleSearch = (e: any) => {
        getCategories({ search: e.target.value }).then(res => setCategories(res))
        setSearch(e.target.value)
        setSearchHandler(e.target.value)
        setDropdownShow(true)
        if (e.target.value == '') {
            setDropdownShow(false)
        }
    }

    useEffect(() => {
        getCategories({ search }).then(res => setCategories(res))
    }, [])

    return <div className="flex flex-col">
        <Label>Categoría</Label>
        <input onChange={handleSearch} className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" value={search} ></input>
        {dropDownShow && <div className="p-2 absolute bg-white  mt-20 rounded-lg shadow-xl">
            {categories.map((category: any) => {
                return <div key={category.id} onClick={() => { handleCategorySelect(category) }} className="w-50  cursor-pointer"><h1 >{category.name}</h1></div>
            })}
        </div>}

    </div>
}