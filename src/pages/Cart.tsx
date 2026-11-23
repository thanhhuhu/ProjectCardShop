import { Link } from "react-router-dom";
import { ShoppingCart, Trash2 } from "lucide-react";
import CheckoutSteps from "../components/CheckoutSteps";
import QuantityStepper from "../components/QuantityStepper";
import { useCart } from "../context/useCart";
import { FREE_SHIPPING_THRESHOLD, formatPrice, getShippingFee } from "../utils/cart";

export default function Cart() {
    const { items, totalCount, subtotal, updateQuantity, removeItem, clearCart } = useCart();

    const shippingFee = getShippingFee(subtotal);
    const total = subtotal + shippingFee;
    const remaining = Math.max(FREE_SHIPPING_THRESHOLD - subtotal, 0);
    const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

    if (items.length === 0) {
        return (
            <section className="mx-auto max-w-6xl px-4 py-16 text-center text-[#1a1a1a] md:py-24">
                <ShoppingCart size={64} className="mx-auto text-[#8a8a8a]" />
                <h1 className="mt-6 text-2xl font-extrabold">Giỏ hàng của bạn đang trống</h1>
                <p className="mt-2 text-[#6b6b6b]">Hãy chọn vài lá bài yêu thích rồi quay lại đây nhé.</p>
                <Link
                    to="/products"
                    className="mt-8 inline-block rounded-full bg-[#1a1a1a] text-[#f4f4f1] px-8 py-3 text-sm font-bold uppercase tracking-wide transition hover:bg-black"
                >
                    Mua sắm ngay
                </Link>
            </section>
        );
    }

    return (
        <section className="mx-auto max-w-6xl px-4 py-8 text-[#1a1a1a] md:py-10">
            <CheckoutSteps current={0} />

            <div className="mb-6 flex items-end justify-between gap-4">
                <h1 className="border-l-4 border-[#1a1a1a] pl-3 text-xl font-extrabold uppercase md:text-2xl">
                    Giỏ hàng{" "}
                    <span className="text-base font-semibold normal-case text-[#6b6b6b]">
                        ({totalCount} thẻ)
                    </span>
                </h1>
                <button
                    type="button"
                    onClick={() => {
                        if (window.confirm("Xóa toàn bộ sản phẩm trong giỏ hàng?")) clearCart();
                    }}
                    className="text-sm text-[#6b6b6b] underline-offset-2 transition hover:text-red-700 hover:underline"
                >
                    Xóa tất cả
                </button>
            </div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
                {/* Danh sách sản phẩm */}
                <ul className="space-y-3">
                    {items.map(({ product, quantity }) => (
                        <li
                            key={product.id}
                            className="flex gap-4 rounded-xl border border-black/10 bg-white p-3 sm:p-4"
                        >
                            <Link to={`/product/${product.id}`} className="w-20 shrink-0 sm:w-24">
                                <img
                                    src={product.imageUrl}
                                    alt={`${product.code} ${product.name}`}
                                    className="aspect-[63/88] w-full rounded-md object-cover"
                                />
                            </Link>

                            <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold tracking-wide text-[#8a8a8a]">
                                        {product.code}
                                    </p>
                                    <Link
                                        to={`/product/${product.id}`}
                                        className="line-clamp-2 text-sm font-medium leading-snug hover:underline"
                                    >
                                        {product.name}
                                    </Link>
                                    <p className="mt-1 text-xs text-[#6b6b6b]">
                                        {product.rarity} · {formatPrice(product.price)} / thẻ
                                    </p>
                                    <p className="text-xs text-[#8a8a8a]">Còn {product.stock} trong kho</p>
                                </div>

                                <div className="flex items-center justify-between gap-3 sm:justify-end">
                                    <QuantityStepper
                                        value={quantity}
                                        max={product.stock}
                                        onChange={(next) => updateQuantity(product.id, next)}
                                    />
                                    <span className="w-24 text-right text-sm font-bold sm:w-28 sm:text-base">
                                        {formatPrice(product.price * quantity)}
                                    </span>
                                    <button
                                        type="button"
                                        aria-label={`Xóa ${product.code} khỏi giỏ hàng`}
                                        onClick={() => removeItem(product.id)}
                                        className="rounded-lg p-2 text-[#6b6b6b] transition hover:bg-black/[0.06] hover:text-red-700"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>

                {/* Tóm tắt đơn hàng */}
                <aside className="h-fit rounded-xl border border-black/10 bg-white p-5 lg:sticky lg:top-4">
                    <h2 className="mb-4 text-lg font-extrabold uppercase">Tóm tắt đơn hàng</h2>

                    <div className="mb-5">
                        <p className="mb-2 text-xs text-[#3a3a3a]">
                            {remaining > 0 ? (
                                <>
                                    Mua thêm <strong className="text-[#1a1a1a]">{formatPrice(remaining)}</strong> để
                                    được miễn phí vận chuyển
                                </>
                            ) : (
                                "Đơn hàng của bạn được miễn phí vận chuyển"
                            )}
                        </p>
                        <div
                            role="progressbar"
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={Math.round(progress)}
                            className="h-2 overflow-hidden rounded-full bg-black/[0.06]"
                        >
                            <div
                                className="h-full rounded-full bg-[#1a1a1a] text-[#f4f4f1] transition-[width] duration-300 motion-reduce:transition-none"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <dl className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-[#6b6b6b]">Tạm tính</dt>
                            <dd>{formatPrice(subtotal)}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-[#6b6b6b]">Phí vận chuyển</dt>
                            <dd>{shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}</dd>
                        </div>
                        <div className="flex items-baseline justify-between border-t border-black/10 pt-3">
                            <dt className="font-bold">Tổng cộng</dt>
                            <dd className="text-2xl font-extrabold text-[#1a1a1a]">{formatPrice(total)}</dd>
                        </div>
                    </dl>

                    <Link
                        to="/checkout"
                        className="mt-5 block rounded-lg bg-[#1a1a1a] text-[#f4f4f1] py-3 text-center text-sm font-bold uppercase tracking-wide transition hover:bg-black active:scale-[0.99]"
                    >
                        Tiến hành thanh toán
                    </Link>
                    <Link
                        to="/products"
                        className="mt-3 block rounded-lg border border-black/10 py-3 text-center text-sm font-semibold text-[#3a3a3a] transition hover:border-[#1a1a1a] hover:text-black"
                    >
                        Tiếp tục mua sắm
                    </Link>
                </aside>
            </div>
        </section>
    );
}