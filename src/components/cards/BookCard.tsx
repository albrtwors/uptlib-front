export default function BookCard({ id, title, description, img = null }: { title: string, description: string, img: string | null, id: number }) {
    return <div key={id} className="flex  shadow-xl rounded-lg">
        <img className="rounded-l-lg" src={(img && img.length > 0) ? img : 'https://cdn-icons-png.freepik.com/512/8832/8832880.png'}></img>
        <div className="flex p-5 flex-col text-left items-center  rounded-r-lg bg-white">
            <strong className="text-lg">{title}</strong>
            <p className="text-sm">{description}</p>
        </div>

    </div>
}