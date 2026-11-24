import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { Heart, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { games } from "../data/game";
import type { Product } from "../types/product";
import ProductGrid from "../components/ProductGrid";
import { useCart } from "../context/useCart";
import { useWishlist } from "../context/useWishlist";
import { useAuth } from "../context/useAuth";
import { useFetch } from "../hooks/useFetch";
import { getProduct, getRelatedProducts } from "../services/productApi";
import { registerStockNotify } from "../services/stockNotifyApi";
import { getMyReview, getReviews, submitReview } from "../services/reviewApi";
import type { Review } from "../services/reviewApi";

const formatPrice = (price: number) => `${price.toLocaleString("vi-VN")} ₫`;

const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

// Dãy sao (chỉ hiển thị)
function Stars({ value, size = 16 }: { value: number; size?: number }) {
    return (
        <span className="inline-flex" aria-label={`${value} trên 5 sao`}>
            {[1, 2, 3, 4, 5].map((n) => (
                <Star
                    key={n}
                    size={size}
                    className={n <= Math.round(value) ? "fill-[#1a1a1a] text-[#1a1a1a]" : "text-[#d0cec8]"}
                />
            ))}
        </span>
    );
}

// Để email khi thẻ hết hàng
function BackInStock({ productId }: { productId: number }) {
    const [email, setEmail] = useState("");
    const [state, setState] = useState<{ type: "idle" | "ok" | "error"; message: string }>({ type: "idle", message: "" });
    const [submitting, setSubmitting] = useState(false);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
            setState({ type: "error", message: "Email không hợp lệ" });
            return;
        }
        setSubmitting(true);
        try {
            const res = await registerStockNotify(productId, email.trim());
            setState({ type: "ok", message: res.message });
            setEmail("");
        } catch (err) {
            setState({ type: "error", message: err instanceof Error ? err.message : "Không gửi được" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={onSubmit} className="mt-5 max-w-md rounded-lg border border-black/10 bg-[#e9e6de] p-4">
            <p className="text-sm font-semibold">Hết hàng — nhận thông báo khi có lại</p>
            <div className="mt-2 flex gap-2">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email của bạn"
                    className="flex-1 rounded-lg border border-black/15 bg-[#f6f4ef] px-3 py-2 text-sm outline-none focus:border-[#1a1a1a]"
                />
                <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-lg bg-[#1a1a1a] px-4 py-2 text-sm font-bold text-[#e9e6de] transition hover:bg-black disabled:opacity-60"
                >
                    Báo tôi
                </button>
            </div>
            {state.type !== "idle" && (
                <p className={`mt-2 text-xs ${state.type === "ok" ? "text-green-700" : "text-red-600"}`}>{state.message}</p>
            )}
        </form>
    );
}

// Khối giá, tồn kho, số lượng và nút thêm vào giỏ.
function PurchaseBox({ product }: { product: Product }) {
    const { addItem } = useCart();
    const { isWished, toggle } = useWishlist();
    const [quantity, setQuantity] = useState(1);
    const soldOut = product.stock <= 0;
    const wished = isWished(product.id);

    const changeQuantity = (next: number) => setQuantity(Math.min(Math.max(next, 1), product.stock));

    return (
        <>
            <p className="mt-4 text-3xl font-bold text-[#1a1a1a]">{formatPrice(product.price)}</p>
            <p className={`mt-1 text-sm font-semibold ${soldOut ? "text-red-600" : "text-green-700"}`}>
                {soldOut ? "Hết hàng" : `Còn ${product.stock} trong kho`}
            </p>

            {!soldOut && (
                <div className="mt-5 flex flex-wrap items-center gap-3">
                    <div className="flex items-center overflow-hidden rounded-full bg-[#eceae5] text-[#1a1a1a]">
                        <button
                            type="button"
                            aria-label="Giảm số lượng"
                            disabled={quantity <= 1}
                            onClick={() => changeQuantity(quantity - 1)}
                            className="p-3 transition hover:bg-[#e4e2dc] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <Minus size={14} />
                        </button>
                        <span className="w-10 text-center text-sm font-semibold" aria-live="polite">
                            {quantity}
                        </span>
                        <button
                            type="button"
                            aria-label="Tăng số lượng"
                            disabled={quantity >= product.stock}
                            onClick={() => changeQuantity(quantity + 1)}
                            className="p-3 transition hover:bg-[#e4e2dc] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => addItem(product, quantity)}
                        className="flex items-center gap-2 rounded-full bg-[#1a1a1a] px-6 py-3 text-sm font-bold uppercase tracking-wide text-[#e9e6de] transition hover:bg-black active:scale-95"
                    >
                        <ShoppingCart size={16} />
                        Thêm vào giỏ hàng
                    </button>

                    <button
                        type="button"
                        aria-label={wished ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                        aria-pressed={wished}
                        onClick={() => void toggle(product.id)}
                        className="flex h-12 w-12 items-center justify-center rounded-full border border-black/15 transition hover:border-[#1a1a1a]"
                    >
                        <Heart size={18} className={wished ? "fill-red-600 text-red-600" : "text-[#1a1a1a]"} />
                    </button>
                </div>
            )}

            {soldOut && <BackInStock productId={product.id} />}
        </>
    );
}

function DetailSkeleton() {
    return (
        <div aria-hidden="true" className="grid animate-pulse gap-6 md:grid-cols-[minmax(0,340px)_1fr] md:gap-10">
            <div className="mx-auto w-full max-w-sm md:max-w-none">
                <div className="aspect-[63/88] w-full rounded-xl bg-black/[0.06]" />
            </div>
            <div className="space-y-4">
                <div className="h-3 w-40 rounded bg-black/[0.06]" />
                <div className="h-8 w-3/4 rounded bg-black/[0.06]" />
                <div className="h-8 w-32 rounded bg-black/[0.06]" />
                <div className="h-11 w-64 rounded-full bg-black/[0.06]" />
            </div>
        </div>
    );
}

// Sản phẩm liên quan: cùng tộc hệ (rồi cùng game) — lấy từ API
function RelatedProducts({ product }: { product: Product }) {
    const { data } = useFetch(`related-${product.id}`, () => getRelatedProducts(product.id));
    const related = data ?? [];
    if (related.length === 0) return null;

    return (
        <div className="mt-12 border-t border-black/10 pt-8">
            <h2 className="mb-6 border-l-4 border-[#1a1a1a] pl-3 text-lg font-extrabold uppercase md:text-xl">
                Sản phẩm liên quan
            </h2>
            <ProductGrid products={related} className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 lg:gap-4" />
        </div>
    );
}

// Đánh giá sản phẩm
function ReviewsSection({ productId }: { productId: number }) {
    const { user } = useAuth();
    const [reloadKey, setReloadKey] = useState(0);
    const { data } = useFetch(`reviews-${productId}-${reloadKey}`, () => getReviews(productId));
    const { data: mine } = useFetch(user ? `myreview-${productId}-${reloadKey}` : `myreview-none-${productId}`, () =>
        user ? getMyReview(productId) : Promise.resolve(null),
    );

    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");
    const [done, setDone] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [editing, setEditing] = useState(false);

    // Nạp đánh giá cũ của mình vào form khi bấm sửa
    const startEdit = () => {
        if (mine) {
            setRating(mine.rating);
            setComment(mine.comment);
        }
        setEditing(true);
        setDone("");
    };

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (rating < 1) {
            setError("Hãy chọn số sao");
            return;
        }
        setSubmitting(true);
        setError("");
        try {
            const res = await submitReview({ productId, rating, comment: comment.trim() });
            setDone(res.message);
            setEditing(false);
            setReloadKey((k) => k + 1);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Không gửi được đánh giá");
        } finally {
            setSubmitting(false);
        }
    };

    const average = data?.average ?? 0;
    const count = data?.count ?? 0;
    const reviews = data?.reviews ?? [];
    const showForm = user && (!mine || editing);

    return (
        <div className="mt-12 border-t border-black/10 pt-8">
            <h2 className="mb-4 border-l-4 border-[#1a1a1a] pl-3 text-lg font-extrabold uppercase md:text-xl">Đánh giá</h2>

            <div className="mb-6 flex items-center gap-3">
                <span className="text-3xl font-extrabold">{count ? average.toFixed(1) : "—"}</span>
                <div>
                    <Stars value={average} />
                    <p className="text-xs text-[#6b6b6b]">{count} đánh giá</p>
                </div>
            </div>

            {/* Trạng thái đánh giá của mình */}
            {user && mine && !editing && (
                <div className="mb-6 rounded-lg border border-black/10 bg-[#e9e6de] p-4 text-sm">
                    <div className="flex items-center justify-between">
                        <Stars value={mine.rating} />
                        <button type="button" onClick={startEdit} className="text-xs font-semibold text-[#1a1a1a] underline">
                            Sửa đánh giá
                        </button>
                    </div>
                    {mine.comment && <p className="mt-2 text-[#2a2a2a]">{mine.comment}</p>}
                    <p className="mt-2 text-xs text-[#6b6b6b]">
                        {mine.status === "approved" ? "Đã duyệt — đang hiển thị công khai" : mine.status === "rejected" ? "Đánh giá không được duyệt" : "Đang chờ admin duyệt"}
                    </p>
                </div>
            )}

            {/* Form gửi / sửa */}
            {showForm && (
                <form onSubmit={onSubmit} className="mb-8 rounded-lg border border-black/10 bg-[#f6f4ef] p-4">
                    <p className="text-sm font-semibold">{mine ? "Sửa đánh giá của bạn" : "Viết đánh giá"}</p>
                    <div className="mt-2 flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <button
                                key={n}
                                type="button"
                                aria-label={`${n} sao`}
                                onClick={() => setRating(n)}
                                className="p-1"
                            >
                                <Star size={24} className={n <= rating ? "fill-[#1a1a1a] text-[#1a1a1a]" : "text-[#d0cec8]"} />
                            </button>
                        ))}
                    </div>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                        maxLength={2000}
                        placeholder="Chia sẻ cảm nhận của bạn về thẻ này..."
                        className="mt-3 w-full rounded-lg border border-black/15 bg-[#f6f4ef] px-3 py-2 text-sm outline-none focus:border-[#1a1a1a]"
                    />
                    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
                    <div className="mt-3 flex gap-2">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="rounded-lg bg-[#1a1a1a] px-4 py-2 text-sm font-bold text-[#e9e6de] transition hover:bg-black disabled:opacity-60"
                        >
                            {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                        </button>
                        {editing && (
                            <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-black/15 px-4 py-2 text-sm font-semibold">
                                Hủy
                            </button>
                        )}
                    </div>
                </form>
            )}

            {done && <p className="mb-6 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">{done}</p>}

            {!user && (
                <p className="mb-6 text-sm text-[#6b6b6b]">
                    <Link to="/login" className="font-semibold text-[#1a1a1a] underline">Đăng nhập</Link> để viết đánh giá.
                </p>
            )}

            {/* Danh sách đánh giá đã duyệt */}
            {reviews.length === 0 ? (
                <p className="text-sm text-[#6b6b6b]">Chưa có đánh giá nào được duyệt.</p>
            ) : (
                <ul className="space-y-4">
                    {reviews.map((r: Review) => (
                        <li key={r.id} className="rounded-lg border border-black/10 bg-[#f6f4ef] p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold">{r.user}</span>
                                <span className="text-xs text-[#6b6b6b]">{formatDate(r.createdAt)}</span>
                            </div>
                            <div className="mt-1"><Stars value={r.rating} size={14} /></div>
                            {r.comment && <p className="mt-2 text-sm text-[#2a2a2a]">{r.comment}</p>}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function ProductDetail() {
    const { id } = useParams();
    const productId = Number(id);

    const { data: product, loading, error } = useFetch(`product-${id}`, () =>
        Number.isInteger(productId) && productId > 0 ? getProduct(productId) : Promise.resolve(null),
    );

    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, [id]);

    if (loading) {
        return (
            <section className="mx-auto max-w-6xl px-4 py-8 text-[#1a1a1a] md:py-10">
                <DetailSkeleton />
            </section>
        );
    }

    if (error) {
        return (
            <section className="mx-auto max-w-6xl px-4 py-20 text-center text-[#1a1a1a]">
                <h1 className="text-2xl font-extrabold">Không tải được sản phẩm</h1>
                <p className="mt-2 text-sm text-[#6b6b6b]">{error}</p>
                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-6 rounded-full border border-[#1a1a1a] px-6 py-2 text-sm font-bold uppercase text-[#1a1a1a] transition hover:bg-[#1a1a1a] hover:text-[#e9e6de]"
                >
                    Thử lại
                </button>
            </section>
        );
    }

    if (!product) {
        return (
            <section className="mx-auto max-w-6xl px-4 py-20 text-center text-[#1a1a1a]">
                <h1 className="text-2xl font-extrabold">Không tìm thấy sản phẩm</h1>
                <Link
                    to="/"
                    className="mt-6 inline-block rounded-full border border-[#1a1a1a] px-6 py-2 text-sm font-bold uppercase text-[#1a1a1a] transition hover:bg-[#1a1a1a] hover:text-[#e9e6de]"
                >
                    Về trang chủ
                </Link>
            </section>
        );
    }

    const gameLabel = games.find((g) => g.slug === product.game)?.label ?? product.game;

    return (
        <section className="mx-auto max-w-6xl px-4 py-8 text-[#1a1a1a] md:py-10">
            <div className="grid gap-6 md:grid-cols-[minmax(0,340px)_1fr] md:gap-10">
                <div className="mx-auto w-full max-w-sm md:max-w-none">
                    <div className="rounded-xl border border-black/10 bg-[#f6f4ef] p-2">
                        <img
                            src={product.imageUrl}
                            alt={`${product.code} ${product.name}`}
                            className="aspect-[63/88] w-full rounded-md object-cover"
                        />
                    </div>
                </div>

                <div>
                    <nav aria-label="Breadcrumb" className="text-xs uppercase text-[#6b6b6b]">
                        <Link to="/" className="transition hover:text-black">Trang chủ</Link>
                        <span className="mx-2">/</span>
                        <span className="text-[#2a2a2a]">{gameLabel}</span>
                    </nav>

                    <h1 className="mt-3 text-2xl font-extrabold leading-tight md:text-3xl">
                        {product.code} – {product.name} – {product.rarity}
                    </h1>
                    {product.archetype && (
                        <Link
                            to={`/products?game=${product.game}&archetype=${encodeURIComponent(product.archetype)}`}
                            className="mt-2 inline-block text-sm text-[#6b6b6b] underline-offset-2 hover:text-[#1a1a1a] hover:underline"
                        >
                            Tộc hệ: {product.archetype}
                        </Link>
                    )}
                    <div className="mt-3 h-0.5 w-10 bg-[#e0ded8]" />

                    <PurchaseBox key={product.id} product={product} />
                </div>
            </div>

            <ReviewsSection key={`rev-${product.id}`} productId={product.id} />
            <RelatedProducts key={`rel-${product.id}`} product={product} />
        </section>
    );
}
