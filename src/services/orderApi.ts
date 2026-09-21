import { request } from "./authApi";

export type OrderPaymentMethod = "cod" | "bank";
export type OrderPaymentStatus = "unpaid" | "paid" | "failed";

export interface CreateOrderItem {
    productId: number;
    code: string;
    name: string;
    rarity: string;
    price: number;
    quantity: number;
    imageUrl: string;
}

export interface CreateOrderPayload {
    fullName: string;
    phone: string;
    email: string;
    city: string;
    address: string;
    note: string;
    paymentMethod: OrderPaymentMethod;
    items: CreateOrderItem[];
}

export interface OrderCreated {
    id: number;
    code: string;
    subtotal: number;
    shippingFee: number;
    total: number;
    payment: OrderPaymentMethod;
    paymentStatus: OrderPaymentStatus;
    status: string;
    bankName: string | null;
    accountNumber: string | null;
    accountName: string | null;
    transferContent: string;
    qrUrl: string | null;
}

export async function createOrder(payload: CreateOrderPayload): Promise<OrderCreated> {
    const data = await request<{ order: OrderCreated }>("/api/orders", {
        method: "POST",
        body: payload,
    });

    return data.order;
}

export async function getOrderPaymentStatus(code: string): Promise<{
    code: string;
    status: "unpaid" | "paid" | "failed";
    paymentStatus: OrderPaymentStatus;
    orderStatus: string;
    total: number;
    paidAt: string | null;
}> {
    return request("/api/orders/" + encodeURIComponent(code) + "/status");
}
