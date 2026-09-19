import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { products } from "../data/products";
import { games } from "../data/game";
import type { Product } from "../types/product";
import ProductGrid from "../components/ProductGrid";

const formatPrice = (price: number) => `${price.toLocaleString("vi-VN")} ₫`;

// Khối giá, tồn kho, số lượng và nút thêm vào giỏ.
// Được gắn key={product.id} ở bên dưới nên số lượng tự về 1 khi chuyển sang thẻ khác.
function PurchaseBox({ product }: { product: Product }) {
    const [quantity, setQuantity] = useState(1);
    const soldOut = product.stock <= 0;

    const changeQuantity = (next: number) =>
        setQuantity(Math.min(Math.max(next, 1), product.stock));

    const handleAddToCart = () => {
        // Sau này nối với giỏ hàng (CartContext) hoặc API
        console.log("Thêm vào giỏ:", product.code, "x", quantity);
    };

    return (
        <>
            <p className="mt-4 text-3xl font-bold text-white">{formatPrice(product.price)}</p>
            <p className={`mt-1 text-sm font-semibold ${soldOut ? "text-red-400" : "text-green-500"}`}>
                {soldOut ? "Hết hàng" : `Còn ${product.stock} trong kho`}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="flex items-center overflow-hidden rounded-full bg-neutral-800 text-white">
                    <button
                        type="button"
                        aria-label="Giảm số lượng"
                        disabled={soldOut || quantity <= 1}
                        onClick={() => changeQuantity(quantity - 1)}
                        className="p-3 transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Minus size={14} />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold" aria-live="polite">
                        {soldOut ? 0 : quantity}
                    </span>
                    <button
                        type="button"
                        aria-label="Tăng số lượng"
                        disabled={soldOut || quantity >= product.stock}
                        onClick={() => changeQuantity(quantity + 1)}
                        className="p-3 transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Plus size={14} />
                    </button>
                </div>

                <button
                    type="button"
                    disabled={soldOut}
                    onClick={handleAddToCart}
                    className="flex items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-red-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400 disabled:active:scale-100"
                >
                    <ShoppingCart size={16} />
                    {soldOut ? "Hết hàng" : "Thêm vào giỏ hàng"}
                </button>
            </div>
        </>
    );
}

export default function ProductDetail() {
    const { id } = useParams();
    const product = products.find((p) => p.id === Number(id));

    // Chuyển sang thẻ khác (ví dụ bấm vào sản phẩm tương tự) thì cuộn lên đầu trang
    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, [id]);

    if (!product) {
        return (
            <section className="mx-auto max-w-6xl px-4 py-20 text-center text-white">
                <h1 className="text-2xl font-extrabold">Không tìm thấy sản phẩm</h1>
                <Link
                    to="/"
                    className="mt-6 inline-block rounded-full border border-red-600 px-6 py-2 text-sm font-bold uppercase text-red-500 transition hover:bg-red-600 hover:text-white"
                >
                    Về trang chủ
                </Link>
            </section>
        );
    }

    const gameLabel = games.find((g) => g.slug === product.game)?.label ?? product.game;
    const similarProducts = products
        .filter((p) => p.id !== product.id && p.game === product.game)
        .slice(0, 5);

    return (
        <section className="mx-auto max-w-6xl px-4 py-8 text-white md:py-10">
            <div className="grid gap-6 md:grid-cols-[minmax(0,340px)_1fr] md:gap-10">
                {/* Ảnh thẻ */}
                <div className="mx-auto w-full max-w-sm md:max-w-none">
                    <div className="rounded-xl border border-white/10 bg-[#141414] p-2">
                        <img
                            src={product.imageUrl}
                            alt={`${product.code} ${product.name}`}
                            className="aspect-[63/88] w-full rounded-md object-cover"
                        />
                    </div>
                </div>

                {/* Thông tin */}
                <div>
                    <nav aria-label="Breadcrumb" className="text-xs uppercase text-gray-400">
                        <Link to="/" className="transition hover:text-white">
                            Trang chủ
                        </Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-200">{gameLabel}</span>
                    </nav>

                    <h1 className="mt-3 text-2xl font-extrabold leading-tight md:text-3xl">
                        {product.code} – {product.name} – {product.rarity}
                    </h1>
                    <div className="mt-3 h-0.5 w-10 bg-neutral-600" />

                    <PurchaseBox key={product.id} product={product} />
                </div>
            </div>

            {/* Sản phẩm tương tự */}
            {similarProducts.length > 0 && (
                <div className="mt-12 border-t border-white/10 pt-8">
                    <h2 className="mb-6 border-l-4 border-red-600 pl-3 text-lg font-extrabold uppercase md:text-xl">
                        Sản phẩm tương tự
                    </h2>
                    <ProductGrid
                        products={similarProducts}
                        className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5 lg:gap-4"
                    />
                </div>
            )}
        </section>
    );
}