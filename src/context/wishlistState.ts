import { createContext } from "react";

export interface WishlistContextValue {
    ids: Set<number>;
    isWished: (productId: number) => boolean;
    toggle: (productId: number) => Promise<void>;
}

export const WishlistContext = createContext<WishlistContextValue | null>(null);
