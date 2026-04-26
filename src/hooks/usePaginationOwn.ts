
import { useEffect, useRef, useState } from "react";

export default function usePagination() {
    const [page, setPage] = useState<any>(1)
    const totalPages: any = useRef(null)

    return { page, setPage, totalPages }

}