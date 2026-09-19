import type { NavItem } from "../types/navigation";

export const navItems: NavItem[] = [
    { label: "Trang chủ", href: "/" },
    {
        label: "Sản phẩm card game",
        href: "/products",
        children: [
            { label: "Yu-Gi-Oh!", href: "/products?game=ygo" },
            { label: "Pokémon", href: "/products?game=pokemon" },
            { label: "Digimon", href: "/products?game=digimon" },
            { label: "One Piece", href: "/products?game=onepiece" },
            { label: "Lorcana", href: "/products?game=lorcana" },
        ],
    },
    {
        label: "Phụ kiện",
        href: "/accessories",
        children: [
            { label: "Bọc bài (sleeve)", href: "/accessories?type=sleeve" },
            { label: "Hộp đựng bài", href: "/accessories?type=deckbox" },
            { label: "Thảm chơi bài", href: "/accessories?type=playmat" },
        ],
    },
    {
        label: "Khác",
        href: "/other",
        children: [
            { label: "Tin tức", href: "/news" },
            { label: "Liên hệ", href: "/contact" },
        ],
    },
];
