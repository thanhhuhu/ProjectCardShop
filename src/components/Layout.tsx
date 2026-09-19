import { Outlet, useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout() {
    const navigate = useNavigate();

    return (
        <div className="flex min-h-screen flex-col bg-black">
            <Header cartCount={0} onLoginClick={() => navigate("/login")} />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
}