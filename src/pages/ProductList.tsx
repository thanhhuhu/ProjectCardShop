import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
import { games } from "../data/game";
import Pagination from "../components/Pagination";
import ProductGrid from "../components/ProductGrid";
import ProductGridSkeleton from "../components/ProductGridSkeleton";
import { useFetch } from "../hooks/useFetch";
import { getProductFilters, listProducts } from "../services/productApi";
import type { SortKey } from "../services/productApi";

const selectClass =
    "rounded-md border border-black/15 bg-[#f6f4ef] px-3 py-2 text-sm text-[#1a1a1a] outline-none transition hover:border-[#1a1a1a] focus:border-[#1a1a1a]";

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
    const archetype = (searchParams.get("archetype") ?? "").trim();
    const rarity = (searchParams.get("rarity") ?? "").trim();
    const sortParam = searchParams.get("sort");
    const sort: SortKey = sortOptions.find((o) => o.value === sortParam)?.value ?? "newest";
    const requestedPage = Math.max(Number(searchParams.get("page")) || 1, 1);
    const gameLabel = games.find((g) => g.slug === game)?.label;
    const hasFilters = Boolean(search || archetype || rarity);

    // Lọc, tìm, sắp xếp và phân trang đều do server làm trong SQL
    const { data, loading, error } = useFetch(
        `list|${game}|${search}|${archetype}|${rarity}|${sort}|${requestedPage}`,
        () => listProducts({ game, search, archetype, rarity, sort, page: requestedPage, pageSize: PAGE_SIZE }),
    );

    // Danh sách tộc hệ & độ hiếm có thật trong kho (đổ vào dropdown), đổi theo game đang xem
    const { data: filters } = useFetch(`filters|${game}`, () => getProductFilters(game));
    const archetypeOptions = filters?.archetypes ?? [];
    const rarityOptions = filters?.rarities ?? [];

    // Ô "Tên / mã thẻ" gõ tới đâu lọc tới đó, nhưng chờ 350ms mới gọi server để đỡ gọi liên tục
    const [nameInput, setNameInput] = useState(search);
    // Khi search đổi từ nơi khác (ô tìm ở header, nút xóa lọc), đồng bộ lại ô nhập ngay khi render
    const [lastSearch, setLastSearch] = useState(search);
    if (search !== lastSearch) {
        setLastSearch(search);
        setNameInput(search);
    }
    useEffect(() => {
        const value = nameInput.trim();
        if (value === search) return;
        const timer = setTimeout(() => {
            setSearchParams((current) => {
                const next = new URLSearchParams(current);
                if (value) next.set("search", value);
                else next.delete("search");
                next.delete("page");
                return next;
            });
        }, 350);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [nameInput, search]);

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

    // Chọn một bộ lọc (tộc hệ / độ hiếm) thì quay về trang 1
    const handleFilterChange = (key: "archetype" | "rarity", value: string) => {
        updateParams({ [key]: value || null, page: null });
    };

    const clearFilters = () => {
        updateParams({ search: null, archetype: null, rarity: null, page: null });
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
        <div className="text-[#1a1a1a]">
            {/* Thanh breadcrumb, số kết quả và sắp xếp */}
            <div className="bg-[#f6f4ef]">
                <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
                    <nav aria-label="Breadcrumb" className="text-sm uppercase text-[#6b6b6b]">
                        <Link to="/" className="transition hover:text-black">
                            Trang chủ
                        </Link>
                        <span className="mx-2">/</span>
                        <span className="font-bold text-[#1a1a1a]">{search ? "Tìm kiếm" : (gameLabel ?? "Shop")}</span>
                    </nav>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-[#3a3a3a]">
                        <span aria-live="polite">{resultText()}</span>
                        <label htmlFor="sort" className="sr-only">
                            Sắp xếp sản phẩm
                        </label>
                        <select
                            id="sort"
                            value={sort}
                            onChange={(e) => handleSortChange(e.target.value)}
                            className={selectClass}
                        >
                            {sortOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Thanh lọc: tộc hệ, độ hiếm, tên/mã thẻ */}
                <div className="mx-auto max-w-6xl border-t border-black/10 px-4 py-3">
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
                        <div className="flex flex-col gap-1">
                            <label htmlFor="filter-archetype" className="text-xs font-semibold uppercase text-[#6b6b6b]">
                                Tộc hệ
                            </label>
                            <select
                                id="filter-archetype"
                                value={archetype}
                                onChange={(e) => handleFilterChange("archetype", e.target.value)}
                                className={`${selectClass} min-w-[11rem]`}
                            >
                                <option value="">Tất cả tộc hệ</option>
                                {/* Giữ giá trị đang chọn kể cả khi danh sách chưa tải xong */}
                                {archetype && !archetypeOptions.includes(archetype) && (
                                    <option value={archetype}>{archetype}</option>
                                )}
                                {archetypeOptions.map((value) => (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label htmlFor="filter-rarity" className="text-xs font-semibold uppercase text-[#6b6b6b]">
                                Độ hiếm
                            </label>
                            <select
                                id="filter-rarity"
                                value={rarity}
                                onChange={(e) => handleFilterChange("rarity", e.target.value)}
                                className={`${selectClass} min-w-[11rem]`}
                            >
                                <option value="">Tất cả độ hiếm</option>
                                {rarity && !rarityOptions.includes(rarity) && <option value={rarity}>{rarity}</option>}
                                {rarityOptions.map((value) => (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-1 flex-col gap-1">
                            <label htmlFor="filter-name" className="text-xs font-semibold uppercase text-[#6b6b6b]">
                                Tên / mã thẻ
                            </label>
                            <input
                                id="filter-name"
                                type="search"
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                placeholder="Nhập tên hoặc mã thẻ..."
                                className={`${selectClass} w-full min-w-[12rem] placeholder:text-[#8a8a8a]`}
                            />
                        </div>

                        {hasFilters && (
                            <button
                                type="button"
                                onClick={clearFilters}
                                className="flex items-center gap-1 self-start rounded-md border border-black/15 px-3 py-2 text-sm font-semibold text-[#3a3a3a] transition hover:border-[#1a1a1a] hover:text-black sm:self-auto"
                            >
                                <X size={14} />
                                Xóa lọc
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <section className="mx-auto max-w-6xl px-4 py-8 md:py-10">
                <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <h1 className="break-words border-l-4 border-[#1a1a1a] pl-3 text-xl font-extrabold uppercase md:text-2xl">
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
                            className="flex items-center gap-1 rounded-full border border-black/15 px-3 py-1 text-xs font-semibold text-[#3a3a3a] transition hover:border-[#1a1a1a] hover:text-black"
                        >
                            <X size={14} />
                            Xóa tìm kiếm
                        </button>
                    )}
                </div>

                {error && !data ? (
                    <div role="alert" className="py-16 text-center text-[#3a3a3a]">
                        <p className="text-red-600">{error}</p>
                        <p className="mt-1 text-sm text-[#8a8a8a]">Hãy kiểm tra server đã chạy chưa.</p>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="mt-6 rounded-full border border-[#1a1a1a] px-6 py-2 text-sm font-bold uppercase text-[#1a1a1a] transition hover:bg-[#1a1a1a] hover:text-[#e9e6de]"
                        >
                            Thử lại
                        </button>
                    </div>
                ) : !data ? (
                    <ProductGridSkeleton count={PAGE_SIZE} className={GRID_CLASS} />
                ) : total === 0 ? (
                    <div className="py-16 text-center text-[#3a3a3a]">
                        <p>
                            {search
                                ? `Không tìm thấy thẻ nào khớp với “${search}”. Hãy thử từ khóa ngắn hơn hoặc kiểm tra lại chính tả.`
                                : "Chưa có sản phẩm nào trong danh mục này."}
                        </p>
                        <Link
                            to="/products"
                            className="mt-6 inline-block rounded-full border border-[#1a1a1a] px-6 py-2 text-sm font-bold uppercase text-[#1a1a1a] transition hover:bg-[#1a1a1a] hover:text-[#e9e6de]"
                        >
                            Xem tất cả sản phẩm
                        </Link>
                    </div>
                ) : items.length === 0 ? (
                    <div className="py-16 text-center text-[#3a3a3a]">
                        <p>Trang này không có sản phẩm nào.</p>
                        <button
                            type="button"
                            onClick={() => handlePageChange(1)}
                            className="mt-6 rounded-full border border-[#1a1a1a] px-6 py-2 text-sm font-bold uppercase text-[#1a1a1a] transition hover:bg-[#1a1a1a] hover:text-[#e9e6de]"
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