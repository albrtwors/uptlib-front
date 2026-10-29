"use client"

import Input from "./input/InputField"
import Label from "./Label"

interface SearchFieldProps {
    label: string
    value: string
    onValueChange: (value: string) => void
    /** Recibe el término con el que se dispara la consulta, así el padre nunca usa un estado obsoleto. */
    onSubmit: (term: string) => void
    placeholder?: string
    className?: string
}

/** Campo de búsqueda que sólo consulta al pulsar Buscar o Enter. */
export default function SearchField({ label, value, onValueChange, onSubmit, placeholder, className = "" }: SearchFieldProps) {
    return (
        <div className={`flex-1 min-w-[14rem] ${className}`}>
            <Label>{label}</Label>
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Input
                        value={value}
                        placeholder={placeholder}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onValueChange(e.target.value)}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                onSubmit(value)
                            }
                        }}
                    />
                    {value && (
                        <button
                            type="button"
                            aria-label={`Limpiar la búsqueda de ${label}`}
                            onClick={() => {
                                onValueChange('')
                                onSubmit('')
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => onSubmit(value)}
                    className="h-11 shrink-0 rounded-lg bg-brand-500 px-4 text-sm font-medium text-white shadow-theme-xs transition-colors hover:bg-brand-600"
                >
                    Buscar
                </button>
            </div>
        </div>
    )
}
