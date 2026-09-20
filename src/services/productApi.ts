import { ApiError, request } from "./authApi";
import type { Product } from "../types/product";

export type SortKey = "newest" | "price-asc" | "price-desc" | "rarity-desc" | "name-asc";

export interface ProductListParams {
    search?: string;
    game?: string | null;
    sort?: SortKey;
    page?: number;
    pageSize?: number;
    exclude?: number; // bỏ một thẻ ra khỏi kết quả (dùng cho "sản phẩm tương tự")
}

export interface ProductListResponse {
    products: Product[];
    total: number;
    page: number;
    pageSize: number;
}

export function listProducts(params: ProductListParams = {}): Promise<ProductListResponse> {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.game) query.set("game", params.game);
    if (params.sort && params.sort !== "newest") query.set("sort", params.sort);
    if (params.page && params.page > 1) query.set("page", String(params.page));
    if (params.pageSize) query.set("pageSize", String(params.pageSize));
    if (params.exclude) query.set("exclude", String(params.exclude));

    return request<ProductListResponse>(`/api/products?${query.toString()}`);
}

// Không có sản phẩm thì trả về null (khác với lỗi mạng hoặc lỗi server)
export async function getProduct(id: number): Promise<Product | null> {
    try {
        const data = await request<{ product: Product }>(`/api/products/${id}`);
        return data.product;
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
    }
}

export async function suggestProducts(query: string): Promise<Product[]> {
    const data = await request<{ products: Product[] }>(`/api/products/suggest?q=${encodeURIComponent(query)}`);
    return data.products;
}