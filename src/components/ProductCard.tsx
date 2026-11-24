import { Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { useCart } from "../context/useCart";
import { useWishlist } from "../context/useWishlist";
import type { Product } from "../types/product";

interface ProductCardProps {
    product: Product;
    onAddToCart?: (product: Product) => void;
}

const formatPrice = (price: number) => `${price.toLocaleString("vi-VN")} ₫`;

function rarityClass(rarity: string) {
    const r = rarity.toLowerCase();
    if (r.includes("secret")) return "bg-[#1a1a1a] text-[#e9e6de]";
    if (r.includes("ultra")) return "bg-[#5a5a5a] text-[#e9e6de]";
    if (r.includes("super")) return "bg-[#8f8f8f] text-[#e9e6de]";
    return "bg-[#e0ded8] text-[#1a1a1a]";
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
    const { addItem } = useCart();
    const { isWished, toggle } = useWishlist();
    const soldOut = product.stock <= 0;
    const wished = isWished(product.id);
    const detailPath = `/product/${product.id}`;

    return (
        <article className="group flex flex-col overflow-hidden rounded-xl border border-black/10 bg-[#f6f4ef] transition duration-200 hover:border-black/50 hover:shadow-lg hover:shadow-black/10 motion-safe:hover:-translate-y-1">
            {/* Ảnh thẻ */}
            <Link to={detailPath} className="relative block overflow-hidden bg-[#e9e6de] p-2">
                <img
                    src={product.imageUrl}
                    alt={`${product.code} ${product.name}`}
                    loading="lazy"
                    className="aspect-[63/88] w-full rounded-md object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
                />
                <span
                    className={`absolute left-4 bottom-4 rounded px-2 py-0.5 text-[11px] font-bold shadow ${rarityClass(product.rarity)}`}
                >
                    {product.rarity}
                </span>
                {/* Nút tim: thêm/bỏ yêu thích */}
                <button
                    type="button"
                    aria-label={wished ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                    aria-pressed={wished}
                    onClick={(e) => {
                        e.preventDefault();
                        void toggle(product.id);
                    }}
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#f6f4ef]/90 text-[#1a1a1a] shadow transition hover:bg-[#f6f4ef]"
                >
                    <Heart size={16} className={wished ? "fill-red-600 text-red-600" : ""} />
                </button>
            </Link>

            {/* Thông tin */}
            <div className="flex flex-1 flex-col gap-1 p-3">
                <p className="text-xs font-semibold tracking-wide text-[#8a8a8a]">
                    {product.code}
                </p>
                <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-[#1a1a1a]">
                    <Link to={detailPath} className="hover:text-black hover:underline">
                        {product.name}
                    </Link>
                </h3>

                <div className="mt-auto flex items-end justify-between pt-2">
                    <span className="text-lg font-bold text-[#1a1a1a]">
                        {formatPrice(product.price)}
                    </span>
                    <span className={`text-xs ${soldOut ? "text-red-600" : "text-[#6b6b6b]"}`}>
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
                    className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-[#1a1a1a] px-3 py-2 text-xs font-bold uppercase tracking-wide text-[#e9e6de] transition hover:bg-black active:scale-95 disabled:cursor-not-allowed disabled:bg-[#eceae5] disabled:text-[#6b6b6b] disabled:active:scale-100"
                >
                    <ShoppingCart size={14} />
                    {soldOut ? "Hết hàng" : "Thêm vào giỏ"}
                </button>
            </div>
        </article>
    );
}