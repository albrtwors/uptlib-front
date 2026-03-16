
import { useState, useCallback } from 'react';

interface UsePaginationProps {
    totalPages: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

export const usePagination = ({ totalPages, currentPage, onPageChange }: UsePaginationProps) => {
    const [page, setPage] = useState(currentPage);

    const goToPage = useCallback((newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
            onPageChange(newPage);
        }
    }, [totalPages, onPageChange]);

    const nextPage = useCallback(() => {
        if (page < totalPages) goToPage(page + 1);
    }, [page, totalPages, goToPage]);

    const prevPage = useCallback(() => {
        if (page > 1) goToPage(page - 1);
    }, [page, goToPage]);

    return {
        currentPage: page,
        goToPage,
        nextPage,
        prevPage,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
};