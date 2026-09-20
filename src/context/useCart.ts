import { useContext } from "react";
import { CartContext } from "./cartContext";

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart phải được dùng bên trong <CartProvider>");
    }
    return context;
}