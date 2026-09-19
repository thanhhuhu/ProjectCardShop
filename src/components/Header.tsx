import { useState } from "react";
import type { FormEvent } from "react";
import { ChevronDown, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { navItems } from "../data/navigation";

interface HeaderProps {
    cartCount?: number;
    onLoginClick?: () => void;
}

export default function Header({ cartCount = 0, onLoginClick }: HeaderProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [keyword, setKeyword] = useState("");

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        // Sau này chuyển sang trang kết quả: /products?search=...
        console.log("Tìm kiếm:", keyword);
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

                    {/* Logo: thay bằng <img src={logo} /> khi có logo riêng */}
                    <img src="./team_spirit.png" alt=""/>
                    <a href="" className="text-2xl font-extrabold tracking-tight text-red-500">
                        L1ZY CARD SHOP
                    </a>

                    {/* Tìm kiếm: mobile xuống hàng riêng, desktop nằm giữa */}
                    <form
                        onSubmit={handleSearch}
                        className="order-last flex w-full md:order-none md:flex-1"
                    >
                        <input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            placeholder="Tìm kiếm..."
                            className="min-w-0 flex-1 bg-white px-3 py-2 text-sm text-black outline-none"
                        />
                        <button
                            type="submit"
                            aria-label="Tìm kiếm"
                            className="bg-red-600 px-3 hover:bg-red-700"
                        >
                            <Search size={18} />
                        </button>
                    </form>

                    {/* Tài khoản và giỏ hàng */}
                    <div className="ml-auto flex items-center gap-3 md:ml-0">
                        <button
                            type="button"
                            onClick={onLoginClick}
                            aria-label="Tài khoản"
                            className="rounded bg-red-600 p-2 hover:bg-red-700"
                        >
                            <User size={18} />
                        </button>

                        <a
                            href="/cart"
                            className="relative flex items-center gap-2 rounded bg-red-600 px-3 py-2 text-sm font-bold uppercase hover:bg-red-700"
                        >
                            <span className="hidden sm:inline">Giỏ hàng</span>
                            <ShoppingCart size={18} />
                            {cartCount > 0 && (
                                <span className="absolute -right-2 -top-2 rounded-full bg-white px-1.5 text-xs font-bold text-red-600">
                                    {cartCount}
                                </span>
                            )}
                        </a>
                    </div>
                </div>
            </div>

            {/* Menu desktop */}
            <nav className="hidden bg-[#0a0a0a] md:block">
                <ul className="mx-auto flex max-w-6xl gap-8 px-4">
                    {navItems.map((item) => (
                        <li key={item.label} className="group relative">
                            <a
                                href={item.href}
                                className="flex items-center gap-1 py-4 text-sm font-bold uppercase text-gray-300 hover:text-white"
                            >
                                {item.label}
                                {item.children && (
                                    <ChevronDown
                                        size={14}
                                        className="transition-transform duration-200 group-hover:rotate-180 group-focus-within:rotate-180"
                                    />
                                )}
                            </a>

                            {item.children && (
                                <ul className="invisible absolute left-0 top-full z-50 min-w-48 translate-y-2 rounded-b border-t-2 border-red-600 bg-white py-2 text-black opacity-0 shadow-lg transition-[opacity,transform,visibility] duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 motion-reduce:transition-none">
                                    {item.children.map((child) => (
                                        <li key={child.label}>
                                            <a
                                                href={child.href}
                                                className="block px-4 py-2 text-sm hover:bg-gray-100"
                                            >
                                                {child.label}
                                            </a>
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
                                <a
                                    href={item.href}
                                    className="flex-1 py-3 text-sm font-bold uppercase"
                                >
                                    {item.label}
                                </a>
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
                                                <a
                                                    href={child.href}
                                                    className="block py-2 pl-8 pr-4 text-sm text-gray-300"
                                                >
                                                    {child.label}
                                                </a>
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