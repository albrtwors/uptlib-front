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
    return (
        <div
            key={id}
            className="flex shadow-xl rounded-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100  bg-white"
        >{img ? <img
            className="w-32 h-48 object-cover rounded-l-xl"
            src={img ?? 'https://via.placeholder.com/128x192/6B7280/FFFFFF?text=📚'}
            alt={title}
        /> : <div className="w-32 h-48 object-cover rounded-l-xl" ></div>}


            <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-4 mb-4">{description}</p>
                </div>

                <div className="flex gap-2 pt-2">
                    {onEdit && (
                        <Button onClick={() => onEdit(id)}>Editar</Button>
                    )}
                    {onDelete && (
                        <Button className="bg-red-600" onClick={() => onDelete(id)}>Eliminar</Button>
                    )}
                </div>
            </div>
        </div>
    );
}