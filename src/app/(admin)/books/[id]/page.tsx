"use client"

import { useEffect, useState } from "react"

export default function Page({ params }: { params: { id: string } }) {
    const { id } = params
    const [book, setBook] = useState<any>(null)

    return <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold">{book.title}</h1>

    </div>
}