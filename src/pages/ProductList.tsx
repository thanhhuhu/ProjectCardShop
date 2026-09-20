import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
import { products } from "../data/products";
import { games } from "../data/game";
import type { Product } from "../types/product";
import ProductGrid from "../components/ProductGrid";
import Pagination from "../components/Pagination";
import { matchesSearch } from "../utils/search";

const PAGE_SIZE = 20; // 5 thẻ mỗi hàng x 4 hàng

const sortOptions = [
    { value: "newest", label: "Mới cập nhật" },
    { value: "price-asc", label: "Giá: thấp đến cao" },
    { value: "price-desc", label: "Giá: cao đến thấp" },
    { value: "rarity-desc", label: "Độ hiếm: cao đến thấp" },
    { value: "name-asc", label: "Tên: A đến Z" },
] as const;

type SortKey = (typeof sortOptions)[number]["value"];

// Độ hiếm càng cao thì điểm càng lớn (dùng cho mục "giá trị card")
function rarityRank(rarity: string) {
    const r = rarity.toLowerCase();
    if (r.includes("prismatic")) return 6;
    if (r.includes("secret")) return 5;
    if (r.includes("ultra")) return 4;
    if (r.includes("super")) return 3;
    if (r.includes("rare")) return 2;
    return 1; // Common
}

function sortProducts(list: Product[], sort: SortKey): Product[] {
    const sorted = [...list];
    switch (sort) {
        case "price-asc":
            return sorted.sort((a, b) => a.price - b.price);
        case "price-desc":
            return sorted.sort((a, b) => b.price - a.price);
        case "rarity-desc":
            return sorted.sort(
                (a, b) => rarityRank(b.rarity) - rarityRank(a.rarity) || b.price - a.price,
            );
        case "name-asc":
            return sorted.sort((a, b) => a.name.localeCompare(b.name, "vi"));
        default:
            return sorted; // giữ nguyên thứ tự trong dữ liệu (mới nhất trước)
    }
}

export default function ProductList() {
    // game, sort, page nằm trên URL: /products?game=ygo&sort=price-asc&page=2
    const [searchParams, setSearchParams] = useSearchParams();

    const game = searchParams.get("game");
    const search = (searchParams.get("search") ?? "").trim();
    const sortParam = searchParams.get("sort");
    const sort: SortKey = sortOptions.find((o) => o.value === sortParam)?.value ?? "newest";
    const gameLabel = games.find((g) => g.slug === game)?.label;

    const sortedProducts = useMemo(() => {
        let filtered = game ? products.filter((p) => p.game === game) : products;
        if (search) filtered = filtered.filter((p) => matchesSearch(p, search));
        return sortProducts(filtered, sort);
    }, [game, search, sort]);

    const total = sortedProducts.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const page = Math.min(Math.max(Number(searchParams.get("page")) || 1, 1), totalPages);
    const start = (page - 1) * PAGE_SIZE;
    const pageItems = sortedProducts.slice(start, start + PAGE_SIZE);

    const updateParams = (changes: Record<string, string | null>) => {
        const next = new URLSearchParams(searchParams);
        Object.entries(changes).forEach(([key, value]) => {
            if (value === null) next.delete(key);
            else next.set(key, value);
        });
        setSearchParams(next);
    };

    const handleSortChange = (value: string) => {
        // Đổi cách sắp xếp thì quay về trang 1
        updateParams({ sort: value === "newest" ? null : value, page: null });
    };

    const handlePageChange = (nextPage: number) => {
        updateParams({ page: nextPage === 1 ? null : String(nextPage) });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="text-white">
            {/* Thanh breadcrumb, số kết quả và sắp xếp */}
            <div className="bg-[#1a1a1a]">
                <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
                    <nav aria-label="Breadcrumb" className="text-sm uppercase text-gray-400">
                        <Link to="/" className="transition hover:text-white">
                            Trang chủ
                        </Link>
                        <span className="mx-2">/</span>
                        <span className="font-bold text-white">{search ? "Tìm kiếm" : (gameLabel ?? "Shop")}</span>
                    </nav>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
                        <span aria-live="polite">
                            {total === 0
                                ? "Không có kết quả"
                                : `Hiển thị ${start + 1}–${start + pageItems.length} của ${total} kết quả`}
                        </span>
                        <label htmlFor="sort" className="sr-only">
                            Sắp xếp sản phẩm
                        </label>
                        <select
                            id="sort"
                            value={sort}
                            onChange={(e) => handleSortChange(e.target.value)}
                            className="rounded-md border border-white/20 bg-neutral-900 px-3 py-2 text-sm text-white outline-none transition hover:border-red-600 focus:border-red-600"
                        >
                            {sortOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <section className="mx-auto max-w-6xl px-4 py-8 md:py-10">
                <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <h1 className="break-words border-l-4 border-red-600 pl-3 text-xl font-extrabold uppercase md:text-2xl">
                        {search ? (
                            <>
                                Kết quả cho <span className="normal-case">“{search}”</span>
                            </>
                        ) : (
                            (gameLabel ?? "Tất cả sản phẩm")
                        )}
                    </h1>
                    {search && (
                        <button
                            type="button"
                            onClick={() => updateParams({ search: null, page: null })}
                            className="flex items-center gap-1 rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-gray-300 transition hover:border-red-600 hover:text-white"
                        >
                            <X size={14} />
                            Xóa tìm kiếm
                        </button>
                    )}
                </div>

                {total === 0 ? (
                    <div className="py-16 text-center text-gray-300">
                        <p>
                            {search
                                ? `Không tìm thấy thẻ nào khớp với “${search}”. Hãy thử từ khóa ngắn hơn hoặc kiểm tra lại chính tả.`
                                : "Chưa có sản phẩm nào trong danh mục này."}
                        </p>
                        <Link
                            to="/products"
                            className="mt-6 inline-block rounded-full border border-red-600 px-6 py-2 text-sm font-bold uppercase text-red-500 transition hover:bg-red-600 hover:text-white"
                        >
                            Xem tất cả sản phẩm
                        </Link>
                    </div>
                ) : (
                    <>
                        <ProductGrid
                            products={pageItems}
                            onAddToCart={(p) => console.log("Thêm vào giỏ:", p.code)}
                            className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-4"
                        />
                        <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
                    </>
                )}
            </section>
        </div>
    );
}