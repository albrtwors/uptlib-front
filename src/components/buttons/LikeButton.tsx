import { handleResponses } from '@/lib/responses/handleResponses';
import { useEffect, useState } from 'react';


export const useLike = (id: any) => {
    const [like, setLike] = useState(false)

    const verifyLike = async ({ id }: any) => {
        fetch(`/api/book/verify-like/${id}`).then(res => res.json()).then(data => {
            console.log(data)
            setLike(data)
        })
    }

    useEffect(() => {
        verifyLike({ id }).then((res: any) => {

            setLike(res)
        })
    }, [])

    return { like, setLike, verifyLike }
}


export default function LikeButton({ id }: any) {
    const { like, setLike, verifyLike } = useLike(id)

    const toggleLike = (id: any) => {

        if (!like) {
            fetch(`/api/book/save/${id}`, { method: 'POST' }).then(res => res.json()).then(data => {
                handleResponses(data)
            })
        } else {
            fetch(`/api/book/remove-like/${id}`, { method: 'POST' }).then(res => res.json()).then(data => {
                handleResponses(data)
            })
        }

        setLike(!like)
    }
    return (
        <button
            className={`
                relative p-3 rounded-2xl border-2 transition-all duration-300 flex items-center gap-2
                font-medium text-sm group
                ${like
                    ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/25 border-red-400 scale-105 hover:scale-100'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50 hover:shadow-md hover:shadow-gray-100'
                }
            `}
            onClick={() => toggleLike(id)}>
            {/* Heart SVG */}
            <svg
                className={`
                    w-5 h-5 transition-transform duration-300 ${like ? 'scale-110' : 'group-hover:scale-110'}
                `}
                fill={like ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
            >
                {like ? (
                    // Heart Filled
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                ) : (
                    // Heart Outline
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                )}
            </svg>



            {/* Pulse Animation */}
            {like && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-400/50 to-pink-400/50 opacity-75 animate-ping -z-10" />
            )}
        </button>
    );
}