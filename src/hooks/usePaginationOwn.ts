
import { useRef, useState } from "react";

/**
 * Página actual de una tabla. Acepta la página inicial para que venga del
 * `?page=` de la URL y un F5 no devuelva al usuario al primer registro.
 */
export default function usePagination(initialPage: number | string = 1) {
    const parsed = parseInt(`${initialPage}`, 10)
    const [page, setPage] = useState<any>(Number.isNaN(parsed) || parsed < 1 ? 1 : parsed)
    const totalPages: any = useRef(null)

    return { page, setPage, totalPages }
}
