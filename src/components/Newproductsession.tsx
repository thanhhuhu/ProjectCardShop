import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { Product } from "../types/product";
import ProductGrid from "./ProductGrid";
import ProductGridSkeleton from "./ProductGridSkeleton";

interface NewProductsSectionProps {
    products: Product[];
    loading?: boolean;
    error?: string;
    onAddToCart?: (product: Product) => void;
}

export default function NewProductsSection({ products, loading, error, onAddToCart }: NewProductsSectionProps) {
    return (
        <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
            <h2 className="mb-6 border-l-4 border-[#1a1a1a] pl-3 text-xl font-extrabold uppercase text-[#1a1a1a] md:mb-8 md:text-2xl">
                Sản phẩm mới cập nhật
            </h2>

            {error ? (
                <p role="alert" className="py-10 text-center text-sm text-red-600">
                    {error}
                </p>
            ) : loading && products.length === 0 ? (
                <ProductGridSkeleton count={8} />
            ) : (
                <ProductGrid products={products} onAddToCart={onAddToCart} />
            )}

            <div className="mt-8 text-center md:mt-10">
                <Link
                    to="/products"
                    className="inline-flex items-center gap-1 rounded-full border border-[#1a1a1a] px-6 py-2 text-sm font-bold uppercase text-[#1a1a1a] transition hover:bg-[#1a1a1a] hover:text-[#f4f4f1] active:scale-95"
                >
                    Xem thêm
                    <ChevronRight size={16} />
                </Link>
            </div>
        </section>
    );
}