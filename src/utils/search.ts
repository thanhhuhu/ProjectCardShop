import type { Product } from "../types/product";

// Bỏ dấu, đổi thành chữ thường: "Đá" và "da" coi như giống nhau
export function normalizeText(text: string) {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "D")
        .toLowerCase();
}

// Thẻ khớp khi mọi từ trong ô tìm kiếm đều xuất hiện trong tên hoặc mã thẻ
export function matchesSearch(product: Product, query: string) {
    const haystack = normalizeText(`${product.name} ${product.code}`);
    return normalizeText(query)
        .split(/\s+/)
        .filter(Boolean)
        .every((word) => haystack.includes(word));
}

// Gợi ý cho ô tìm kiếm: ưu tiên thẻ có mã hoặc tên bắt đầu bằng từ khóa
export function searchProducts(list: Product[], query: string, limit = 6): Product[] {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const normalized = normalizeText(trimmed);
    const firstWord = normalized.split(/\s+/)[0];

    const score = (product: Product) => {
        const name = normalizeText(product.name);
        const code = normalizeText(product.code);
        if (code.startsWith(normalized) || name.startsWith(normalized)) return 0;
        if (name.split(/\s+/).some((word) => word.startsWith(firstWord))) return 1;
        return 2;
    };

    return list
        .filter((product) => matchesSearch(product, trimmed))
        .sort((a, b) => score(a) - score(b))
        .slice(0, limit);
}