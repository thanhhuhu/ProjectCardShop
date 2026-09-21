import { request } from "./authApi";
import type { Product } from "../types/product";

export interface ProductPayload {
    code: string;
    name: string;
    rarity: string;
    game: string;
    price: number;
    stock: number;
    imageUrl: string;
}

export async function createProduct(payload: ProductPayload): Promise<Product> {
    const data = await request<{ product: Product }>("/api/admin/products", { method: "POST", body: payload });
    return data.product;
}

export async function updateProduct(id: number, payload: Partial<ProductPayload>): Promise<Product> {
    const data = await request<{ product: Product }>(`/api/admin/products/${id}`, { method: "PATCH", body: payload });
    return data.product;
}

export async function deleteProduct(id: number): Promise<void> {
    await request(`/api/admin/products/${id}`, { method: "DELETE" });
}

// Tải một file ảnh lên server, trả về địa chỉ ảnh (ví dụ /uploads/products/abc.jpg) để gắn vào thẻ
export async function uploadProductImage(file: File): Promise<string> {
    const form = new FormData();
    form.append("image", file);
    const data = await request<{ imageUrl: string }>("/api/admin/products/image", { method: "POST", body: form });
    return data.imageUrl;
}