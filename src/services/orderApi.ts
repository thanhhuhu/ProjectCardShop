import { request } from "./authApi";

export type OrderPaymentMethod = "cod" | "bank";
export type OrderPaymentStatus = "unpaid" | "paid" | "failed";

// Chỉ gửi id sản phẩm và số lượng. Giá, tên, ảnh... server tự đọc từ database.
export interface CreateOrderItem {
    productId: number;
    quantity: number;
}

export interface CreateOrderPayload {
    fullName: string;
    phone: string;
    email: string;
    city: string;
    address: string;
    note: string;
    paymentMethod: OrderPaymentMethod;
    discountCode?: string;
    items: CreateOrderItem[];
}

export interface OrderCreated {
    id: number;
    code: string;
    subtotal: number;
    discountCode: string;
    discountAmount: number;
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

/* ---------- Lịch sử đặt hàng ---------- */

export type OrderStatus = "pending" | "confirmed" | "shipping" | "completed" | "cancelled";

export interface MyOrderItem {
    productId: number | null;
    code: string;
    name: string;
    rarity: string;
    price: number;
    quantity: number;
    lineTotal: number;
    imageUrl: string;
}

export interface MyOrder {
    id: number;
    code: string;
    fullName: string;
    phone: string;
    city: string;
    address: string;
    note: string;
    subtotal: number;
    shippingFee: number;
    discountCode: string;
    discountAmount: number;
    total: number;
    payment: OrderPaymentMethod;
    paymentStatus: OrderPaymentStatus;
    status: OrderStatus;
    paidAt: string | null;
    createdAt: string;
    // Chỉ có với đơn chuyển khoản chưa thanh toán
    paymentInfo: {
        bankName: string | null;
        accountNumber: string | null;
        accountName: string | null;
        transferContent: string;
        qrUrl: string | null;
    } | null;
    items: MyOrderItem[];
}

export interface MyOrdersResponse {
    orders: MyOrder[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export async function getMyOrders(page = 1, pageSize = 10): Promise<MyOrdersResponse> {
    return request(`/api/orders/mine?page=${page}&pageSize=${pageSize}`);
}

// Tra cứu đơn cho khách vãng lai (mã đơn + số điện thoại)
export async function lookupOrder(code: string, phone: string): Promise<MyOrder> {
    const data = await request<{ order: MyOrder }>("/api/orders/lookup", {
        method: "POST",
        body: { code, phone },
    });
    return data.order;
}
