import type { OrderPaymentStatus, OrderStatus } from "../services/orderApi";

// Nhãn + màu cho trạng thái đơn hàng, dùng chung cho trang khách và trang admin
export const ORDER_STATUS_LABEL: Record<OrderStatus, { text: string; className: string }> = {
    pending: { text: "Chờ xác nhận", className: "bg-yellow-500/15 text-yellow-300" },
    confirmed: { text: "Đã xác nhận", className: "bg-blue-500/15 text-blue-300" },
    shipping: { text: "Đang giao", className: "bg-purple-500/15 text-purple-300" },
    completed: { text: "Hoàn thành", className: "bg-green-500/15 text-green-300" },
    cancelled: { text: "Đã hủy", className: "bg-white/10 text-gray-400" },
};

export const PAYMENT_STATUS_LABEL: Record<OrderPaymentStatus, { text: string; className: string }> = {
    unpaid: { text: "Chưa thanh toán", className: "text-yellow-300" },
    paid: { text: "Đã thanh toán", className: "text-green-400" },
    failed: { text: "Thanh toán lỗi", className: "text-red-400" },
};

export const formatDateTime = (value: string) =>
    new Date(value).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
