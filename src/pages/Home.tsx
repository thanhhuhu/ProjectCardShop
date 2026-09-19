import Hero from "../components/Hero";
import NewProductsSection from "../components/Newproductsession.tsx";
import { products } from "../data/products";

export default function Home() {
    return (
        <>
            <Hero />
            <NewProductsSection
                products={products.slice(0, 8)}
                onAddToCart={(p) => console.log("Thêm vào giỏ:", p.code)}
            />
        </>
    );
}