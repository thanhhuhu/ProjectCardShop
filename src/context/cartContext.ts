import { createContext } from "react";
import type { Product } from "../types/product";

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface CartContextValue {
    items: CartItem[];
    totalCount: number; // tổng số thẻ, hiện trên biểu tượng giỏ hàng
    subtotal: number; // tạm tính
    addItem: (product: Product, quantity?: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    removeItem: (productId: number) => void;
    clearCart: () => void;
}

export const CartContext = createContext<CartContextValue | null>(null);