import { request } from "./authApi";

export interface DiscountResult {
    ok: boolean;
    message: string;
    discount: { id: number; code: string; amount: number } | null;
}

// Xem thử mã ở trang thanh toán
export function validateDiscount(code: string, subtotal: number): Promise<DiscountResult> {
    return request<DiscountResult>("/api/discounts/validate", { method: "POST", body: { code, subtotal } });
}

export type DiscountType = "percent" | "amount";

export interface Discount {
    id: number;
    code: string;
    type: DiscountType;
    value: number;
    minOrder: number;
    maxUses: number | null;
    usedCount: number;
    active: boolean;
    expiresAt: string | null;
    createdAt: string;
}

export async function listDiscounts(): Promise<Discount[]> {
    const data = await request<{ discounts: Discount[] }>("/api/discounts/admin");
    return data.discounts;
}

export function createDiscount(payload: {
    code: string;
    type: DiscountType;
    value: number;
    minOrder: number;
    maxUses: number | null;
}): Promise<{ discount: Discount }> {
    return request("/api/discounts/admin", { method: "POST", body: payload });
}

export function setDiscountActive(id: number, active: boolean): Promise<void> {
    return request(`/api/discounts/admin/${id}`, { method: "PATCH", body: { active } });
}

export function deleteDiscount(id: number): Promise<void> {
    return request(`/api/discounts/admin/${id}`, { method: "DELETE" });
}
