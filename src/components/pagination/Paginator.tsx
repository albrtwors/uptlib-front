'use client';

import { usePagination } from '@/hooks/usePagination';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface PaginationProps {
    totalPages: number;
    currentPage: number;
    basePath: string;
}

export default function Pagination({
    totalPages,
    currentPage,
    basePath
}: PaginationProps) {
    const {
        currentPage: page,
        goToPage,
        nextPage,
        prevPage,
        hasNext,
        hasPrev,
    } = usePagination({
        totalPages,
        currentPage,
        onPageChange: () => { }
    });

    const getVisiblePages = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];
        let l;

        range.push(1);
        for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
            range.push(i);
        }
        if (totalPages > 1) {
            range.push(totalPages);
        }

        for (let i of range) {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        }

        return rangeWithDots;
    };

    return (
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
                <button
                    onClick={prevPage}
                    disabled={!hasPrev}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                    Anterior
                </button>
                <button
                    onClick={nextPage}
                    disabled={!hasNext}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                    Siguiente
                </button>
            </div>

            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Mostrando <span className="font-medium">{(currentPage - 1) * 10 + 1}</span> a{' '}
                        <span className="font-medium">{Math.min(currentPage * 10, 100)}</span> de{' '}
                        <span className="font-medium">100</span> resultados
                    </p>
                </div>

                <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                        <Link
                            href={`${basePath}?page=${currentPage - 1}`}
                            onClick={(e) => !hasPrev && e.preventDefault()}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:pointer-events-none"
                        >
                            <span className="sr-only">Anterior</span>
                            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                        </Link>

                        {getVisiblePages().map((pageNum, index) => (
                            <Link
                                key={index}
                                href={`${basePath}?page=${pageNum}`}
                                className={`relative z-10 inline-flex items-center ${pageNum === currentPage
                                    ? 'z-20 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                                    } px-4 py-2 text-sm font-semibold`}
                            >
                                {pageNum === '...' ? '...' : pageNum}
                            </Link>
                        ))}

                        <Link
                            href={`${basePath}?page=${currentPage + 1}`}
                            onClick={(e) => !hasNext && e.preventDefault()}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:pointer-events-none"
                        >
                            <span className="sr-only">Siguiente</span>
                            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                        </Link>
                    </nav>
                </div>
            </div>
        </div>
    );
}