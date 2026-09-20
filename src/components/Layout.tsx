import { Outlet, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { useCart } from "../context/useCart";

export default function Layout() {
    const navigate = useNavigate();
    const { totalCount } = useCart();

    return (
        <div className="flex min-h-screen flex-col bg-black">
            <Header cartCount={totalCount} onLoginClick={() => navigate("/login")} />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}