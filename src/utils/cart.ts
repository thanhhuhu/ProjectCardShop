// Quy tắc phí vận chuyển (sửa cho khớp cửa hàng của bạn)
export const FREE_SHIPPING_THRESHOLD = 150_000; // từ mức này trở lên: miễn phí vận chuyển
export const SHIPPING_FEE = 30_000;

export const formatPrice = (price: number) => `${price.toLocaleString("vi-VN")} ₫`;

export const getShippingFee = (subtotal: number) =>
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;