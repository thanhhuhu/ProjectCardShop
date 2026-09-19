import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    page: number;
    totalPages: number;
    onChange: (page: number) => void;
}

// Ví dụ: trang 6/20 -> [1, "…", 5, 6, 7, "…", 20]
function getPageItems(page: number, total: number): (number | "…")[] {
    const pages = new Set([1, total, page - 1, page, page + 1]);
    const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

    const items: (number | "…")[] = [];
    sorted.forEach((p, i) => {
        if (i > 0 && p - sorted[i - 1] > 1) items.push("…");
        items.push(p);
    });
    return items;
}

const baseButton =
    "flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition";

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    return (
        <nav aria-label="Phân trang" className="mt-10 flex flex-wrap items-center justify-center gap-2">
            <button
                type="button"
                aria-label="Trang trước"
                disabled={page <= 1}
                onClick={() => onChange(page - 1)}
                className={`${baseButton} border-white/15 text-gray-300 hover:border-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/15 disabled:hover:text-gray-300`}
            >
                <ChevronLeft size={16} />
            </button>

            {getPageItems(page, totalPages).map((item, index) =>
                item === "…" ? (
                    <span key={`gap-${index}`} className="px-1 text-gray-500" aria-hidden="true">
                        …
                    </span>
                ) : (
                    <button
                        key={item}
                        type="button"
                        aria-label={`Trang ${item}`}
                        aria-current={item === page ? "page" : undefined}
                        onClick={() => onChange(item)}
                        className={`${baseButton} ${
                            item === page
                                ? "border-red-600 bg-red-600 text-white"
                                : "border-white/15 text-gray-300 hover:border-red-600 hover:text-white"
                        }`}
                    >
                        {item}
                    </button>
                ),
            )}

            <button
                type="button"
                aria-label="Trang sau"
                disabled={page >= totalPages}
                onClick={() => onChange(page + 1)}
                className={`${baseButton} border-white/15 text-gray-300 hover:border-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/15 disabled:hover:text-gray-300`}
            >
                <ChevronRight size={16} />
            </button>
        </nav>
    );
}