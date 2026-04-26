"use client"
import React from 'react';
import Button from '../ui/button/Button';

const Pagination = ({
    page,
    setPage,
    totalItems = 0,
    limit,
    className = '',
    showInfo = true
}: any) => {
    const totalPages = Math.ceil(totalItems / limit);
    const isFirstPage = page === 1;
    const isLastPage = page === totalPages || totalPages === 0;

    const handlePrev = () => {
        if (!isFirstPage) {
            setPage(page - 1);
        }
    };

    const handleNext = () => {
        if (!isLastPage) {
            setPage(page + 1);
        }
    };

    if (totalPages <= 1) {
        return null; // No mostrar paginación si solo hay una página
    }

    return (
        <div className={`flex gap-3 justify-center items-center ${className}`}>
            {showInfo && (
                <span className="text-sm text-gray-500">
                    Página {page} de {totalPages} ({totalItems} registros)
                </span>
            )}

            <Button
                disabled={isFirstPage}
                onClick={handlePrev}
                className="w-10 h-10 p-0"
                aria-label="Página anterior"
            >
                {'<'}
            </Button>

            <Button
                disabled={isLastPage}
                onClick={handleNext}
                className="w-10 h-10 p-0"
                aria-label="Página siguiente"
            >
                {'>'}
            </Button>
        </div>
    );
};

export default Pagination;