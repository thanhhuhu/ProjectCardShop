import { ChevronRight } from "lucide-react";
import type { Product } from "../types/product";
import ProductGrid from "./ProductGrid";

interface NewProductsSectionProps {
    products: Product[];
    onAddToCart?: (product: Product) => void;
}

export default function NewProductsSection({ products, onAddToCart }: NewProductsSectionProps) {
    return (
        <section className="mx-auto max-w-6xl px-4 py-10 md:py-14">
            <h2 className="mb-6 border-l-4 border-red-600 pl-3 text-xl font-extrabold uppercase text-white md:mb-8 md:text-2xl">
                Sản phẩm mới cập nhật
            </h2>

            <ProductGrid products={products} onAddToCart={onAddToCart} />

            <div className="mt-8 text-center md:mt-10">
                <a
                    href="/products"
                    className="inline-flex items-center gap-1 rounded-full border border-red-600 px-6 py-2 text-sm font-bold uppercase text-red-500 transition hover:bg-red-600 hover:text-white active:scale-95"
                >
                    Xem thêm
                    <ChevronRight size={16} />
                </a>
            </div>
        </section>
    );
}