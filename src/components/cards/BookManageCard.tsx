interface BookManageCardProps {
    id: number;
    title: string;
    description?: string;
    pnf?: string; // 💡 Nueva propiedad
    onEdit: () => void;
    onDelete: () => void;
}

export default function BookManageCard({ title, description, pnf, onEdit, onDelete }: BookManageCardProps) {
    return (
        <div className="flex flex-col justify-between p-4 rounded-xl border bg-white shadow-xs dark:bg-gray-900 dark:border-gray-800 h-full">
            <div className="flex flex-col gap-1.5">
                {/* Badge del PNF Estilizado */}
                {pnf && (
                    <span className="self-start px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
                        {pnf}
                    </span>
                )}
                <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2 mt-1">{title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed">{description || 'Sin descripción'}</p>
            </div>

            <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button type="button" onClick={onEdit} className="flex-1 text-xs py-2 px-3 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 font-medium transition-colors">
                    Editar
                </button>
                <button type="button" onClick={onDelete} className="flex-1 text-xs py-2 px-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50 font-medium transition-colors">
                    Eliminar
                </button>
            </div>
        </div>
    );
}