import { api } from "@/consts/api"
import Link from "next/link"
import LikeButton from "../buttons/LikeButton"
import Button from "../ui/button/Button"
import { handleResponses } from "@/lib/responses/handleResponses"

const { base_url } = api




export default function BookCard({ id, handleQuit, title, description, routepdf }: { title: string, description: string, id: string, handleQuit?: any, routepdf: string }) {
    return (
        <div className="group relative w-80 h-96 p-8 rounded-2xl bg-white shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-500 border border-gray-100 hover:border-indigo-200 overflow-hidden">

            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/3 to-purple-500/3 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

            <div className="relative z-10 h-full flex flex-col justify-between">

                <div className="flex justify-end">
                    {!handleQuit ? <LikeButton id={id}></LikeButton> : <div>
                        <Button onClick={() => {
                            fetch(`/api/book/remove-like/${id}`, { method: 'POST' }).then(res => res.json()).then(data => {
                                handleResponses(data)
                                handleQuit()
                            })

                        }}>X</Button>

                    </div>
                    }


                </div>
                <div className="w-2 h-24 bg-gradient-to-b from-indigo-400 to-purple-400 rounded-r-full shadow-md mb-8 ml-2"></div>

                <div className="flex-1 flex flex-col justify-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 line-clamp-2 leading-tight">
                        {title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 flex-1">
                        {description}
                    </p>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                    <Link href={`/books/${id}`} className="group-hover:translate-x-1 transition-transform">
                        <div className="flex items-center justify-between text-sm font-medium text-gray-500 group-hover:text-indigo-600 transition-colors">
                            <span>Comenzar lectura</span>
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    )
}