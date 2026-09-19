import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Preloader from "./components/Preloader";
import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

function App() {
    return (
        <>
            <Preloader />
            <Routes>
                <Route element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="products" element={<ProductList />} />
                    <Route path="product/:id" element={<ProductDetail />} />

                    {/* AuthPage là layout route: giữ nguyên khi chuyển giữa /login và /register */}
                    <Route element={<AuthPage />}>
                        <Route path="login" element={null} />
                        <Route path="register" element={null} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </>
    );
}

export default App;