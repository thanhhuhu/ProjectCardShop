import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import ProductGrid from "../components/ProductGrid";
import ProductGridSkeleton from "../components/ProductGridSkeleton";
import { useAuth } from "../context/useAuth";
import { useWishlist } from "../context/useWishlist";
import { useFetch } from "../hooks/useFetch";
import { getWishlist } from "../services/wishlistApi";

export default function Wishlist() {
    const { user, loading: authLoading } = useAuth();
    const { ids } = useWishlist();
    const { data, loading } = useFetch(user ? "wishlist" : "wishlist-none", () =>
        user ? getWishlist() : Promise.resolve([]),
    );

    if (authLoading) {
        return (
            <section className="mx-auto max-w-6xl px-4 py-8 md:py-10">
                <ProductGridSkeleton count={6} />
            </section>
        );
    }

    if (!user) {
        return (
            <section className="mx-auto max-w-lg px-4 py-16 text-center text-[#1a1a1a]">
                <Heart size={56} className="mx-auto text-[#c0bdb4]" />
                <h1 className="mt-4 text-2xl font-extrabold">Yêu thích</h1>
                <p className="mt-2 text-sm text-[#6b6b6b]">Đăng nhập để lưu và xem các thẻ bạn thích.</p>
                <Link to="/login" className="mt-6 inline-block rounded-lg bg-[#1a1a1a] px-6 py-3 text-sm font-bold uppercase tracking-wide text-[#f4f4f1] transition hover:bg-black">
                    Đăng nhập
                </Link>
            </section>
        );
    }

    // Chỉ hiện thẻ vẫn còn trong danh sách yêu thích (bỏ tim thì biến mất ngay)
    const products = (data ?? []).filter((p) => ids.has(p.id));

    return (
        <section className="mx-auto max-w-6xl px-4 py-8 text-[#1a1a1a] md:py-10">
            <h1 className="mb-6 border-l-4 border-[#1a1a1a] pl-3 text-xl font-extrabold uppercase md:text-2xl">
                Thẻ yêu thích
            </h1>
            {loading ? (
                <ProductGridSkeleton count={6} />
            ) : products.length === 0 ? (
                <div className="rounded-xl border border-black/10 bg-white p-10 text-center">
                    <Heart size={48} className="mx-auto text-[#c0bdb4]" />
                    <p className="mt-3 text-sm text-[#6b6b6b]">Bạn chưa thích thẻ nào. Bấm biểu tượng trái tim trên mỗi thẻ để lưu lại.</p>
                    <Link to="/products" className="mt-6 inline-block rounded-lg bg-[#1a1a1a] px-6 py-3 text-sm font-bold uppercase tracking-wide text-[#f4f4f1] transition hover:bg-black">
                        Khám phá sản phẩm
                    </Link>
                </div>
            ) : (
                <ProductGrid products={products} className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4" />
            )}
        </section>
    );
}
