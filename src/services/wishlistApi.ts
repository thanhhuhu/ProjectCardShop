import { request } from "./authApi";
import type { Product } from "../types/product";

export async function getWishlist(): Promise<Product[]> {
    const data = await request<{ products: Product[] }>("/api/wishlist");
    return data.products;
}

export async function getWishlistIds(): Promise<number[]> {
    const data = await request<{ ids: number[] }>("/api/wishlist/ids");
    return data.ids;
}

export function addToWishlist(productId: number): Promise<void> {
    return request("/api/wishlist", { method: "POST", body: { productId } });
}

export function removeFromWishlist(productId: number): Promise<void> {
    return request(`/api/wishlist/${productId}`, { method: "DELETE" });
}
