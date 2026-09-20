import Hero from "../components/Hero";
import NewProductsSection from "../components/Newproductsession.tsx";
import { useFetch } from "../hooks/useFetch";
import { listProducts } from "../services/productApi";

export default function Home() {
    // 8 thẻ mới nhất lấy từ server
    const { data, loading, error } = useFetch("home-new", () => listProducts({ pageSize: 8 }));

    return (
        <>
            <Hero />
            <NewProductsSection products={data?.products ?? []} loading={loading} error={error} />
        </>
    );
}