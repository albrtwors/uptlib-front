import Button from "../ui/button/Button";

export default function BookCard({
    id,
    title,
    description,
    img,
    onEdit,
    onDelete
}: {
    id: number;
    title: string;
    description: string;
    img?: string | null;
    onEdit?: (book: any) => void;
    onDelete?: (id: number) => void;
}) {
    const hasImage = img && img !== '';

    return (
        <div className="group relative flex shadow-lg rounded-2xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 bg-gradient-to-br from-white to-gray-50 overflow-hidden">
            {/* Image Container */}
            <div className={`
                w-32 flex-shrink-0 relative overflow-hidden transition-all duration-300 group-hover:scale-105
                ${hasImage
                    ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-r border-blue-100'
                    : 'bg-gradient-to-br from-gray-100 to-gray-200'
                }
            `}>
                {hasImage ? (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-300/50 to-gray-400/50">
                        <span className="text-2xl opacity-80 font-bold tracking-wider">📚</span>
                    </div>
                )}
                <div className="w-full h-48 flex items-center justify-center p-4">
                    <div className={`
                        w-20 h-28 rounded-xl shadow-lg border-2 transition-all duration-300
                        ${hasImage
                            ? 'bg-gradient-to-br from-blue-100 to-purple-100 border-blue-200 group-hover:shadow-xl group-hover:scale-105'
                            : 'bg-gradient-to-br from-gray-200 to-gray-300 border-gray-300'
                        }
                    `} />
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 flex flex-col justify-between min-w-0">
                <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-4 pr-2">
                        {description}
                    </p>
                </div>

                {/* Action Buttons - DISEÑO ORIGINAL CONSERVADO */}
                <div className="flex gap-2 pt-2">
                    {onEdit && (
                        <Button onClick={() => onEdit(id)}>Editar</Button>
                    )}
                    {onDelete && (
                        <Button className="bg-red-600" onClick={() => onDelete(id)}>Eliminar</Button>
                    )}
                </div>
            </div>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl -z-10" />
        </div>
    );
}