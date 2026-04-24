import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const safeTotalPages = Math.max(totalPages, 1);
    const isFirst = currentPage <= 0;
    const isLast = currentPage + 1 >= safeTotalPages;

    return (
        <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-gray-600">
                Page <span className="font-bold">{currentPage + 1}</span> of{' '}
                <span className="font-bold">{safeTotalPages}</span>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                    disabled={isFirst}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-semibold disabled:opacity-50"
                >
                    Previous
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={isLast}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg text-sm font-semibold disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Pagination;
