import { api } from "@/consts/api"
import Link from "next/link"


const { base_url } = api

export default function BookCard({ id, title, description, img = null, routepdf }: { title: string, description: string, img: string | null, id: number, routepdf: string }) {
    return <Link href={`/books/${id}`}>

        <div key={id} className="flex p-5 cursor-pointer  shadow-xl rounded-lg">

            <img className="rounded-lg size-40" src={(img && img.length > 0) ? img : 'https://cdn-icons-png.freepik.com/512/8832/8832880.png'}></img>
            <div className="flex p-5 flex-col text-left items-center  rounded-r-lg bg-white">

                { <iframe src={`${base_url}${routepdf}`} /> }
                <strong className="text-lg">{title}</strong>
                <p className="text-sm">{description}</p>
            </div>

        </div>


    </Link>
}