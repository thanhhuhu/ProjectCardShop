import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "./useAuth";
import { addToWishlist, getWishlistIds, removeFromWishlist } from "../services/wishlistApi";
import { WishlistContext } from "./wishlistState";

export default function WishlistProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [ids, setIds] = useState<Set<number>>(new Set());

    // Đăng nhập -> tải danh sách id đã thích (chỉ setState trong callback async)
    useEffect(() => {
        if (!user) return;
        let ignore = false;
        getWishlistIds()
            .then((list) => {
                if (!ignore) setIds(new Set(list));
            })
            .catch(() => undefined);
        return () => {
            ignore = true;
        };
    }, [user]);

    // Đăng xuất -> xóa danh sách (chỉnh state khi render, có chặn vòng lặp)
    if (!user && ids.size > 0) setIds(new Set());

    const isWished = useCallback((productId: number) => ids.has(productId), [ids]);

    const toggle = useCallback(
        async (productId: number) => {
            if (!user) {
                window.location.href = "/login";
                return;
            }
            const wished = ids.has(productId);
            setIds((prev) => {
                const next = new Set(prev);
                if (wished) next.delete(productId);
                else next.add(productId);
                return next;
            });
            try {
                if (wished) await removeFromWishlist(productId);
                else await addToWishlist(productId);
            } catch {
                // Lỗi thì hoàn lại
                setIds((prev) => {
                    const next = new Set(prev);
                    if (wished) next.add(productId);
                    else next.delete(productId);
                    return next;
                });
            }
        },
        [ids, user],
    );

    const value = useMemo(() => ({ ids, isWished, toggle }), [ids, isWished, toggle]);
    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
