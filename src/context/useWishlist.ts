import { useContext } from "react";
import { WishlistContext } from "./wishlistState";
import type { WishlistContextValue } from "./wishlistState";

export function useWishlist(): WishlistContextValue {
    const context = useContext(WishlistContext);
    if (!context) throw new Error("useWishlist phải nằm trong <WishlistProvider>");
    return context;
}
