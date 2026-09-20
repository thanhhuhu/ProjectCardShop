import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Preloader from "./components/Preloader";
import CartProvider from "./context/CartProvider";
import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

function App() {
    return (
        <CartProvider>
            <Preloader />
            <Routes>
                <Route element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="products" element={<ProductList />} />
                    <Route path="product/:id" element={<ProductDetail />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="checkout" element={<Checkout />} />

                    {/* AuthPage là layout route: giữ nguyên khi chuyển giữa /login và /register */}
                    <Route element={<AuthPage />}>
                        <Route path="login" element={null} />
                        <Route path="register" element={null} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Route>
            </Routes>
        </CartProvider>
    );
}

export default App;