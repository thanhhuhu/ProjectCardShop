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
                className={`${baseButton} border-black/10 text-[#3a3a3a] hover:border-[#1a1a1a] hover:text-black disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-black/15 disabled:hover:text-[#2a2a2a]`}
            >
                <ChevronLeft size={16} />
            </button>

            {getPageItems(page, totalPages).map((item, index) =>
                item === "…" ? (
                    <span key={`gap-${index}`} className="px-1 text-[#8a8a8a]" aria-hidden="true">
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
                                ? "border-[#1a1a1a] bg-[#1a1a1a] text-[#e9e6de]"
                                : "border-black/10 text-[#3a3a3a] hover:border-[#1a1a1a] hover:text-black"
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
                className={`${baseButton} border-black/10 text-[#3a3a3a] hover:border-[#1a1a1a] hover:text-black disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-black/15 disabled:hover:text-[#2a2a2a]`}
            >
                <ChevronRight size={16} />
            </button>
        </nav>
    );
}