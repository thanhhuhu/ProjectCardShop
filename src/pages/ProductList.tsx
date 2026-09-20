import { Link, useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
import { games } from "../data/game";
import Pagination from "../components/Pagination";
import ProductGrid from "../components/ProductGrid";
import ProductGridSkeleton from "../components/ProductGridSkeleton";
import { useFetch } from "../hooks/useFetch";
import { listProducts } from "../services/productApi";
import type { SortKey } from "../services/productApi";

const PAGE_SIZE = 20; // 5 thẻ mỗi hàng x 4 hàng
const GRID_CLASS = "grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-4";

const sortOptions: { value: SortKey; label: string }[] = [
    { value: "newest", label: "Mới cập nhật" },
    { value: "price-asc", label: "Giá: thấp đến cao" },
    { value: "price-desc", label: "Giá: cao đến thấp" },
    { value: "rarity-desc", label: "Độ hiếm: cao đến thấp" },
    { value: "name-asc", label: "Tên: A đến Z" },
];

export default function ProductList() {
    // game, search, sort, page nằm trên URL: /products?game=ygo&search=angel&sort=price-asc&page=2
    const [searchParams, setSearchParams] = useSearchParams();

    const game = searchParams.get("game");
    const search = (searchParams.get("search") ?? "").trim();
    const sortParam = searchParams.get("sort");
    const sort: SortKey = sortOptions.find((o) => o.value === sortParam)?.value ?? "newest";
    const requestedPage = Math.max(Number(searchParams.get("page")) || 1, 1);
    const gameLabel = games.find((g) => g.slug === game)?.label;

    // Lọc, tìm, sắp xếp và phân trang đều do server làm trong SQL
    const { data, loading, error } = useFetch(
        `list|${game}|${search}|${sort}|${requestedPage}`,
        () => listProducts({ game, search, sort, page: requestedPage, pageSize: PAGE_SIZE }),
    );

    const total = data?.total ?? 0;
    const items = data?.products ?? [];
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const activePage = Math.min(requestedPage, totalPages);
    const first = data ? (data.page - 1) * PAGE_SIZE + 1 : 0;

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

    const resultText = () => {
        if (error) return "Không tải được dữ liệu";
        if (!data) return "Đang tải...";
        if (total === 0) return "Không có kết quả";
        if (items.length === 0) return `${total} kết quả`;
        return `Hiển thị ${first}–${first + items.length - 1} của ${total} kết quả`;
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
                        <span aria-live="polite">{resultText()}</span>
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

                {error && !data ? (
                    <div role="alert" className="py-16 text-center text-gray-300">
                        <p className="text-red-400">{error}</p>
                        <p className="mt-1 text-sm text-gray-500">Hãy kiểm tra server đã chạy chưa.</p>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="mt-6 rounded-full border border-red-600 px-6 py-2 text-sm font-bold uppercase text-red-500 transition hover:bg-red-600 hover:text-white"
                        >
                            Thử lại
                        </button>
                    </div>
                ) : !data ? (
                    <ProductGridSkeleton count={PAGE_SIZE} className={GRID_CLASS} />
                ) : total === 0 ? (
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
                ) : items.length === 0 ? (
                    <div className="py-16 text-center text-gray-300">
                        <p>Trang này không có sản phẩm nào.</p>
                        <button
                            type="button"
                            onClick={() => handlePageChange(1)}
                            className="mt-6 rounded-full border border-red-600 px-6 py-2 text-sm font-bold uppercase text-red-500 transition hover:bg-red-600 hover:text-white"
                        >
                            Về trang đầu
                        </button>
                    </div>
                ) : (
                    <div className={`transition-opacity ${loading ? "opacity-60" : ""}`}>
                        <ProductGrid products={items} className={GRID_CLASS} />
                        <Pagination page={activePage} totalPages={totalPages} onChange={handlePageChange} />
                    </div>
                )}
            </section>
        </div>
    );
}