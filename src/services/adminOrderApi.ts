import { request } from "./authApi";
import type { MyOrder, OrderStatus } from "./orderApi";

export interface AdminOrder extends Omit<MyOrder, "paymentInfo"> {
    userId: number | null;
    username: string | null; // null: khách đặt khi chưa đăng nhập
    email: string;
    nextStatuses: OrderStatus[]; // các trạng thái admin được phép chuyển sang
}

export interface AdminOrderListResponse {
    orders: AdminOrder[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    statusCounts: Partial<Record<OrderStatus, number>>;
}

export function listAdminOrders({ page, status, search }: { page: number; status?: OrderStatus; search?: string }) {
    const params = new URLSearchParams({ page: String(page) });
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    return request<AdminOrderListResponse>(`/api/admin/orders?${params.toString()}`);
}

export async function updateOrderStatus(id: number, status: OrderStatus): Promise<AdminOrder> {
    const data = await request<{ order: AdminOrder }>(`/api/admin/orders/${id}/status`, {
        method: "PATCH",
        body: { status },
    });
    return data.order;
}
