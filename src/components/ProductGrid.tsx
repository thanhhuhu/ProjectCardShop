import type { Product } from "../types/product";
import ProductCard from "./ProductCard";

interface ProductGridProps {
    products: Product[];
    onAddToCart?: (product: Product) => void;
    className?: string;
}

export default function ProductGrid({ products, onAddToCart, className }: ProductGridProps) {
    return (
        <div
            className={
                className ??
                "grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-5"
            }
        >
            {products.map((product) => (
                <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
            ))}
        </div>
    );
}