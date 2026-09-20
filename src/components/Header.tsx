import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronDown, LogOut, Menu, Search, ShoppingCart, User, Users, X } from "lucide-react";
import { navItems } from "../data/navigation";
import type { Product } from "../types/product";
import { formatPrice } from "../utils/cart";
import { suggestProducts } from "../services/productApi";
import { useAuth } from "../context/useAuth";
import logo from "../images/logo.png"; // đổi thành file logo của bạn trong src/images

interface HeaderProps {
    cartCount?: number;
    onLoginClick?: () => void;
}

export default function Header({ cartCount = 0, onLoginClick }: HeaderProps) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    /* ---------- Tài khoản (avatar khi đã đăng nhập) ---------- */
    const { user, loading, logout } = useAuth();
    const accountRef = useRef<HTMLDivElement>(null);
    const [accountOpen, setAccountOpen] = useState(false);

    // Bấm ra ngoài hoặc nhấn Esc thì đóng menu tài khoản
    useEffect(() => {
        const handlePointerDown = (event: PointerEvent) => {
            if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
        };
        const handleEscape = (event: globalThis.KeyboardEvent) => {
            if (event.key === "Escape") setAccountOpen(false);
        };
        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleEscape);
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleEscape);
        };
    }, []);

    const handleLogout = async () => {
        setAccountOpen(false);
        await logout();
        navigate("/");
    };

    const [menuOpen, setMenuOpen] = useState(false);
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    // Ô tìm kiếm hiện lại từ khóa đang tìm, và tự xóa khi bạn rời khỏi trang kết quả
    const urlSearch = searchParams.get("search") ?? "";
    const [keyword, setKeyword] = useState(urlSearch);
    const [prevUrlSearch, setPrevUrlSearch] = useState(urlSearch);
    if (urlSearch !== prevUrlSearch) {
        setPrevUrlSearch(urlSearch);
        setKeyword(urlSearch);
    }

    /* ---------- Gợi ý khi gõ ---------- */
    const searchFormRef = useRef<HTMLFormElement>(null);
    const [suggestOpen, setSuggestOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1); // -1: chưa chọn dòng nào

    const trimmedKeyword = keyword.trim();

    // Gợi ý lấy từ server. Chờ 0,25 giây sau khi ngừng gõ mới hỏi, để không gửi yêu cầu sau mỗi ký tự.
    const [suggestResult, setSuggestResult] = useState<{ query: string; products: Product[] } | null>(null);
    useEffect(() => {
        if (!trimmedKeyword) return;

        let cancelled = false;
        const timer = window.setTimeout(() => {
            suggestProducts(trimmedKeyword)
                .then((found) => {
                    if (!cancelled) setSuggestResult({ query: trimmedKeyword, products: found });
                })
                .catch(() => {
                    if (!cancelled) setSuggestResult({ query: trimmedKeyword, products: [] });
                });
        }, 250);

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
        };
    }, [trimmedKeyword]);

    const suggestions = trimmedKeyword ? (suggestResult?.products ?? []) : [];
    const suggesting = suggestResult?.query !== trimmedKeyword; // đang chờ kết quả cho từ khóa hiện tại
    const showDropdown = suggestOpen && trimmedKeyword.length > 0;
    // Các dòng có thể chọn: các thẻ gợi ý + dòng "Xem tất cả kết quả"
    const optionCount = suggestions.length > 0 ? suggestions.length + 1 : 0;

    // Bấm ra ngoài ô tìm kiếm thì đóng gợi ý
    useEffect(() => {
        const handlePointerDown = (event: PointerEvent) => {
            if (!searchFormRef.current?.contains(event.target as Node)) {
                setSuggestOpen(false);
            }
        };
        document.addEventListener("pointerdown", handlePointerDown);
        return () => document.removeEventListener("pointerdown", handlePointerDown);
    }, []);

    const closeSuggestions = () => {
        setSuggestOpen(false);
        setActiveIndex(-1);
    };

    const goToProduct = (product: Product) => {
        closeSuggestions();
        setKeyword("");
        setMenuOpen(false);
        navigate(`/product/${product.id}`);
    };

    const goToSearch = () => {
        closeSuggestions();
        setMenuOpen(false);
        navigate(
            trimmedKeyword ? `/products?search=${encodeURIComponent(trimmedKeyword)}` : "/products",
        );
    };

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        // Đang chọn một thẻ gợi ý bằng phím mũi tên thì Enter sẽ mở thẻ đó
        const active: Product | undefined = showDropdown ? suggestions[activeIndex] : undefined;
        if (active) {
            goToProduct(active);
            return;
        }
        goToSearch();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown" && optionCount > 0) {
            e.preventDefault();
            setSuggestOpen(true);
            setActiveIndex((index) => (index + 1) % optionCount);
        } else if (e.key === "ArrowUp" && optionCount > 0) {
            e.preventDefault();
            setSuggestOpen(true);
            setActiveIndex((index) => (index <= 0 ? optionCount - 1 : index - 1));
        } else if (e.key === "Escape" || e.key === "Tab") {
            closeSuggestions();
        }
    };

    return (
        <header className="text-white">
            {/* Thanh trên cùng */}
            <div className="bg-[#333] px-4 py-2 text-xs">
                <div className="mx-auto max-w-6xl">
                    Chuyên các loại Card Game &amp; Phụ kiện Card Game
                </div>
            </div>

            {/* Logo, tìm kiếm, tài khoản, giỏ hàng */}
            <div className="bg-[#1a1a1a]">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-4 md:flex-nowrap md:gap-6 md:py-6">
                    {/* Nút mở menu: chỉ hiện trên mobile */}
                    <button
                        type="button"
                        className="md:hidden"
                        aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen((open) => !open)}
                    >
                        {menuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* Logo + tên cửa hàng, bấm vào để về trang chủ */}
                    <Link to="/" className="flex shrink-0 items-center gap-2">
                        <img src={logo} alt="" aria-hidden="true" className="h-10 w-auto" />
                        <span className="text-2xl font-extrabold tracking-tight text-red-500">
                            L1ZY CARD SHOP
                        </span>
                    </Link>

                    {/* Tìm kiếm: mobile xuống hàng riêng, desktop nằm giữa */}
                    <form
                        ref={searchFormRef}
                        onSubmit={handleSearch}
                        role="search"
                        className="relative order-last flex w-full md:order-none md:flex-1"
                    >
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => {
                                setKeyword(e.target.value);
                                setSuggestOpen(true);
                                setActiveIndex(-1);
                            }}
                            onFocus={() => setSuggestOpen(true)}
                            onKeyDown={handleKeyDown}
                            placeholder="Tìm kiếm..."
                            autoComplete="off"
                            role="combobox"
                            aria-expanded={showDropdown && suggestions.length > 0}
                            aria-controls="search-suggestions"
                            aria-autocomplete="list"
                            aria-activedescendant={
                                showDropdown && activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined
                            }
                            className="min-w-0 flex-1 bg-white px-3 py-2 text-sm text-black outline-none"
                        />
                        <button
                            type="submit"
                            aria-label="Tìm kiếm"
                            className="bg-red-600 px-3 hover:bg-red-700"
                        >
                            <Search size={18} />
                        </button>

                        {/* Danh sách gợi ý */}
                        {showDropdown && (
                            <div className="absolute inset-x-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-white/10 bg-[#141414] text-left shadow-2xl">
                                {suggestions.length > 0 ? (
                                    <ul id="search-suggestions" role="listbox" aria-label="Gợi ý thẻ bài">
                                        {suggestions.map((product, index) => (
                                            <li
                                                key={product.id}
                                                id={`suggestion-${index}`}
                                                role="option"
                                                aria-selected={index === activeIndex}
                                                onMouseDown={(e) => e.preventDefault()}
                                                onMouseEnter={() => setActiveIndex(index)}
                                                onClick={() => goToProduct(product)}
                                                className={`flex cursor-pointer items-center gap-3 px-3 py-2 transition-colors ${
                                                    index === activeIndex ? "bg-white/10" : ""
                                                }`}
                                            >
                                                <img
                                                    src={product.imageUrl}
                                                    alt=""
                                                    className="h-14 w-10 shrink-0 rounded object-cover"
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-semibold text-red-400">
                                                        {product.code}
                                                    </p>
                                                    <p className="truncate text-sm text-white">
                                                        {product.name}
                                                    </p>
                                                    <p className="text-xs text-gray-400">{product.rarity}</p>
                                                </div>
                                                <span className="shrink-0 text-sm font-bold text-white">
                                                    {formatPrice(product.price)}
                                                </span>
                                            </li>
                                        ))}
                                        <li
                                            id={`suggestion-${suggestions.length}`}
                                            role="option"
                                            aria-selected={activeIndex === suggestions.length}
                                            onMouseDown={(e) => e.preventDefault()}
                                            onMouseEnter={() => setActiveIndex(suggestions.length)}
                                            onClick={goToSearch}
                                            className={`cursor-pointer border-t border-white/10 px-3 py-3 text-sm font-semibold text-red-400 transition-colors ${
                                                activeIndex === suggestions.length ? "bg-white/10" : ""
                                            }`}
                                        >
                                            Xem tất cả kết quả cho “{trimmedKeyword}”
                                        </li>
                                    </ul>
                                ) : (
                                    <p role="status" className="px-4 py-3 text-sm text-gray-400">
                                        {suggesting ? "Đang tìm..." : `Không tìm thấy thẻ nào khớp với “${trimmedKeyword}”`}
                                    </p>
                                )}
                            </div>
                        )}
                    </form>

                    {/* Tài khoản và giỏ hàng */}
                    <div className="ml-auto flex items-center gap-3 md:ml-0">
                        {/* Nút quản lý người dùng: chỉ hiện với tài khoản admin */}
                        {user?.role === "admin" && (
                            <Link
                                to="/admin/users"
                                aria-label="Quản lý người dùng"
                                className="flex items-center gap-2 rounded bg-neutral-700 px-3 py-2 text-sm font-bold uppercase transition hover:bg-neutral-600"
                            >
                                <Users size={18} />
                                <span className="hidden lg:inline">Người dùng</span>
                            </Link>
                        )}

                        {loading ? (
                            <span aria-hidden="true" className="h-9 w-9 animate-pulse rounded-full bg-white/10" />
                        ) : user ? (
                            <div ref={accountRef} className="relative">
                                <button
                                    type="button"
                                    onClick={() => setAccountOpen((open) => !open)}
                                    aria-label={`Tài khoản ${user.username}`}
                                    aria-haspopup="menu"
                                    aria-expanded={accountOpen}
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-sm font-bold uppercase text-white ring-2 ring-transparent transition hover:ring-white/40 focus-visible:ring-white"
                                >
                                    {user.username.charAt(0)}
                                </button>

                                {accountOpen && (
                                    <div
                                        role="menu"
                                        className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-lg border border-white/10 bg-[#141414] text-left shadow-2xl"
                                    >
                                        <div className="border-b border-white/10 px-4 py-3">
                                            <p className="truncate text-sm font-semibold text-white">
                                                {user.username}
                                            </p>
                                            <p className="truncate text-xs text-gray-400">{user.email}</p>
                                            {user.role === "admin" && (
                                                <span className="mt-2 inline-block rounded bg-red-600/20 px-2 py-0.5 text-[11px] font-semibold text-red-400">
                                                    Quản trị viên
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            role="menuitem"
                                            onClick={handleLogout}
                                            className="flex w-full items-center gap-2 px-4 py-3 text-sm text-gray-200 transition hover:bg-white/10"
                                        >
                                            <LogOut size={16} />
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={onLoginClick}
                                aria-label="Đăng nhập"
                                className="rounded bg-red-600 p-2 hover:bg-red-700"
                            >
                                <User size={18} />
                            </button>
                        )}

                        <Link
                            to="/cart"
                            className="relative flex items-center gap-2 rounded bg-red-600 px-3 py-2 text-sm font-bold uppercase hover:bg-red-700"
                        >
                            <span className="hidden sm:inline">Giỏ hàng</span>
                            <ShoppingCart size={18} />
                            {cartCount > 0 && (
                                <span className="absolute -right-2 -top-2 rounded-full bg-white px-1.5 text-xs font-bold text-red-600">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Menu desktop */}
            <nav className="hidden bg-[#0a0a0a] md:block">
                <ul className="mx-auto flex max-w-6xl gap-8 px-4">
                    {navItems.map((item) => (
                        <li key={item.label} className="group relative">
                            <Link
                                to={item.href}
                                className="flex items-center gap-1 py-4 text-sm font-bold uppercase text-gray-300 hover:text-white"
                            >
                                {item.label}
                                {item.children && (
                                    <ChevronDown
                                        size={14}
                                        className="transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
                                    />
                                )}
                            </Link>

                            {item.children && (
                                <ul className="invisible absolute left-0 top-full z-50 min-w-48 translate-y-2 rounded-b border-t-2 border-red-600 bg-white py-2 text-black opacity-0 shadow-lg transition-[opacity,transform,visibility] duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 motion-reduce:transition-none">
                                    {item.children.map((child) => (
                                        <li key={child.label}>
                                            <Link
                                                to={child.href}
                                                className="block px-4 py-2 text-sm hover:bg-gray-100"
                                            >
                                                {child.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Menu mobile: luôn được render, xổ xuống bằng cách animate chiều cao */}
            <nav
                className={`grid bg-[#0a0a0a] transition-[grid-template-rows,visibility] duration-300 motion-reduce:transition-none md:hidden ${
                    menuOpen ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]"
                }`}
            >
                <ul className="overflow-hidden">
                    {navItems.map((item, index) => (
                        <li key={item.label} className="border-t border-white/10">
                            <div className="flex items-center justify-between px-4">
                                <Link
                                    to={item.href}
                                    onClick={() => setMenuOpen(false)}
                                    className="flex-1 py-3 text-sm font-bold uppercase"
                                >
                                    {item.label}
                                </Link>
                                {item.children && (
                                    <button
                                        type="button"
                                        aria-label={`Mở danh mục ${item.label}`}
                                        aria-expanded={openIndex === index}
                                        onClick={() =>
                                            setOpenIndex(openIndex === index ? null : index)
                                        }
                                        className="p-2"
                                    >
                                        <ChevronDown
                                            size={18}
                                            className={`transition-transform duration-200 ${
                                                openIndex === index ? "rotate-180" : ""
                                            }`}
                                        />
                                    </button>
                                )}
                            </div>

                            {item.children && (
                                <div
                                    className={`grid transition-[grid-template-rows,visibility] duration-200 motion-reduce:transition-none ${
                                        openIndex === index
                                            ? "visible grid-rows-[1fr]"
                                            : "invisible grid-rows-[0fr]"
                                    }`}
                                >
                                    <ul className="overflow-hidden bg-black/40">
                                        {item.children.map((child) => (
                                            <li key={child.label}>
                                                <Link
                                                    to={child.href}
                                                    onClick={() => setMenuOpen(false)}
                                                    className="block py-2 pl-8 pr-4 text-sm text-gray-300"
                                                >
                                                    {child.label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            </nav>
        </header>
    );
}