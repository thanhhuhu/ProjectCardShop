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
        label: "Blog",
        href: "/blog",
        children: [
            { label: "Tin tức Yu-Gi-Oh!", href: "/blog?category=yugioh" },
            { label: "Hướng dẫn", href: "/blog?category=guide" },
            { label: "Deck & Chiến thuật", href: "/blog?category=deck" },
            { label: "Tin shop", href: "/blog?category=shop" },
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
