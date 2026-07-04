"use client"
import Button from "@/components/ui/button/Button"

interface PnfSelectorModalProps {
    isOpen: boolean
    onClose: () => void
    options: string[]
    selectedPnfs: string[]
    onChange: (pnfs: string[]) => void
}

export default function PnfSelectorModal({ isOpen, onClose, options, selectedPnfs, onChange }: PnfSelectorModalProps) {
    if (!isOpen) return null

    const handleToggle = (pnf: string) => {
        if (selectedPnfs.includes(pnf)) {
            onChange(selectedPnfs.filter(item => item !== pnf))
        } else {
            onChange([...selectedPnfs, pnf])
        }
    }

    return (
        <div className="fixed inset-0 z-[113948130498104300] flex items-center justify-center bg-black/50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl rounded-2xl w-full max-w-md flex flex-col max-h-[80vh] overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-950">
                    <h3 className="font-bold text-base text-gray-900 dark:text-white">Asignar PNFs Relacionados</h3>
                    <Button onClick={onClose} className="py-1 px-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs">X</Button>
                </div>

                <div className="flex-1 p-4 overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {options.map((option) => {
                            const isChecked = selectedPnfs.includes(option)
                            return (
                                <label
                                    key={option}
                                    className={`flex items-center gap-3 px-3 py-2.5 border rounded-xl cursor-pointer transition-all text-xs font-medium uppercase ${isChecked
                                        ? 'bg-blue-50/70 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900 text-blue-700 dark:text-blue-400'
                                        : 'bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => handleToggle(option)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                    />
                                    {option}
                                </label>
                            )
                        })}
                    </div>
                </div>

                <div className="p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex justify-end">
                    <Button onClick={onClose} className="w-full sm:w-auto">Confirmar</Button>
                </div>
            </div>
        </div>
    )
}