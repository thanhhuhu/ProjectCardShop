import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../context/useCart";
import type { Product } from "../types/product";

interface ProductCardProps {
    product: Product;
    onAddToCart?: (product: Product) => void;
}

const formatPrice = (price: number) => `${price.toLocaleString("vi-VN")} ₫`;

function rarityClass(rarity: string) {
    const r = rarity.toLowerCase();
    if (r.includes("secret")) return "bg-fuchsia-600 text-white";
    if (r.includes("ultra")) return "bg-amber-400 text-black";
    if (r.includes("super")) return "bg-sky-500 text-white";
    return "bg-neutral-600 text-white";
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
    const { addItem } = useCart();
    const soldOut = product.stock <= 0;
    const detailPath = `/product/${product.id}`;

    return (
        <article className="group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#141414] transition duration-200 hover:border-red-600/60 hover:shadow-lg hover:shadow-red-900/30 motion-safe:hover:-translate-y-1">
            {/* Ảnh thẻ */}
            <Link to={detailPath} className="relative block overflow-hidden bg-black p-2">
                <img
                    src={product.imageUrl}
                    alt={`${product.code} ${product.name}`}
                    loading="lazy"
                    className="aspect-[63/88] w-full rounded-md object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
                />
                <span
                    className={`absolute left-4 top-4 rounded px-2 py-0.5 text-[11px] font-bold shadow ${rarityClass(product.rarity)}`}
                >
                    {product.rarity}
                </span>
            </Link>

            {/* Thông tin */}
            <div className="flex flex-1 flex-col gap-1 p-3">
                <p className="text-xs font-semibold tracking-wide text-red-400">
                    {product.code}
                </p>
                <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-gray-100">
                    <Link to={detailPath} className="hover:text-white hover:underline">
                        {product.name}
                    </Link>
                </h3>

                <div className="mt-auto flex items-end justify-between pt-2">
                    <span className="text-lg font-bold text-white">
                        {formatPrice(product.price)}
                    </span>
                    <span className={`text-xs ${soldOut ? "text-red-400" : "text-gray-400"}`}>
                        {soldOut ? "Hết hàng" : `Còn ${product.stock}`}
                    </span>
                </div>

                <button
                    type="button"
                    disabled={soldOut}
                    onClick={() => {
                        addItem(product);
                        onAddToCart?.(product);
                    }}
                    className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-red-700 active:scale-95 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400 disabled:active:scale-100"
                >
                    <ShoppingCart size={14} />
                    {soldOut ? "Hết hàng" : "Thêm vào giỏ"}
                </button>
            </div>
        </article>
    );
}