import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({
    currentPage,
    itemsPerPage,
    totalItems,
    onPageChange,
}: PaginationProps) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const hasNextPage = currentPage < totalPages;
    const hasPreviousPage = currentPage > 1;

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItemCount = Math.min(indexOfLastItem, totalItems) - indexOfFirstItem;

    const handlePrevious = () => {
        if (hasPreviousPage) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (hasNextPage) {
            onPageChange(currentPage + 1);
        }
    };

    if (totalItems === 0) {
        return null;
    }

    return (
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-sm text-slate-600">
                Page {currentPage} of {totalPages} • Showing {currentItemCount} of {totalItems} task{totalItems !== 1 ? "s" : ""}
            </p>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={!hasPreviousPage}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
                    aria-label="Previous page"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </button>

                <button
                    type="button"
                    onClick={handleNext}
                    disabled={!hasNextPage}
                    className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white"
                    aria-label="Next page"
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
