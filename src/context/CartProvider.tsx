import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import type { Product } from "../types/product";
import { CartContext } from "./cartContext";
import type { CartContextValue, CartItem } from "./cartContext";

const STORAGE_KEY = "card-shop-cart";

// Đọc giỏ hàng đã lưu (giữ lại khi tải lại trang)
function loadCart(): CartItem[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        if (!Array.isArray(parsed)) return [];
        return (parsed as CartItem[]).filter((item) => item?.product && item.quantity > 0);
    } catch {
        return [];
    }
}

export default function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(loadCart);
    const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
    const [toastVisible, setToastVisible] = useState(false);

    // Lưu giỏ hàng mỗi khi thay đổi
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch {
            // bỏ qua nếu trình duyệt chặn lưu trữ
        }
    }, [items]);

    // Tự ẩn thông báo sau 2,5 giây
    useEffect(() => {
        if (!toast) return;
        const timer = window.setTimeout(() => setToastVisible(false), 2500);
        return () => window.clearTimeout(timer);
    }, [toast]);

    const showToast = (text: string) => {
        setToast({ id: Date.now(), text });
        setToastVisible(true);
    };

    const addItem = (product: Product, quantity = 1) => {
        const current = items.find((item) => item.product.id === product.id)?.quantity ?? 0;
        const nextQuantity = Math.min(current + quantity, product.stock);

        if (nextQuantity <= current) {
            showToast(
                product.stock <= 0
                    ? "Sản phẩm đã hết hàng"
                    : "Bạn đã thêm tối đa số lượng còn trong kho",
            );
            return;
        }

        // Thêm lại thẻ đã có trong giỏ thì cập nhật luôn thông tin mới nhất (tên, giá, tồn kho, ảnh)
        setItems((prev) =>
            prev.some((item) => item.product.id === product.id)
                ? prev.map((item) =>
                    item.product.id === product.id ? { ...item, product, quantity: nextQuantity } : item,
                )
                : [...prev, { product, quantity: nextQuantity }],
        );
        showToast(`Đã thêm vào giỏ: ${product.code}`);
    };

    const updateQuantity = (productId: number, quantity: number) => {
        setItems((prev) =>
            prev.map((item) =>
                item.product.id === productId
                    ? { ...item, quantity: Math.min(Math.max(quantity, 1), item.product.stock) }
                    : item,
            ),
        );
    };

    const removeItem = (productId: number) => {
        setItems((prev) => prev.filter((item) => item.product.id !== productId));
    };

    const clearCart = () => setItems([]);

    const value: CartContextValue = {
        items,
        totalCount: items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
    };

    return (
        <CartContext.Provider value={value}>
            {children}

            {/* Thông báo "Đã thêm vào giỏ" */}
            <div
                role="status"
                aria-live="polite"
                className={`fixed inset-x-4 bottom-4 z-50 transition-[opacity,transform,visibility] duration-300 motion-reduce:transition-none sm:inset-x-auto sm:right-4 sm:w-80 ${
                    toastVisible
                        ? "visible translate-y-0 opacity-100"
                        : "pointer-events-none invisible translate-y-3 opacity-0"
                }`}
            >
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-neutral-900 p-3 text-sm text-white shadow-2xl">
                    <CheckCircle2 size={20} className="shrink-0 text-green-500" />
                    <span className="flex-1">{toast?.text}</span>
                    <Link
                        to="/cart"
                        className="shrink-0 text-xs font-bold uppercase text-red-400 hover:text-red-300"
                    >
                        Xem giỏ
                    </Link>
                </div>
            </div>
        </CartContext.Provider>
    );
}