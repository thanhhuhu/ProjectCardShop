import { request } from "./authApi";

// Khách để email cho thẻ đang hết hàng
export function registerStockNotify(productId: number, email: string): Promise<{ ok: boolean; message: string }> {
    return request("/api/stock-notify", { method: "POST", body: { productId, email } });
}
