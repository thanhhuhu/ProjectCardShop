import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import RequireAdmin from "./components/RequireAdmin";
import Preloader from "./components/Preloader";
import AuthProvider from "./context/AuthProvider";
import CartProvider from "./context/CartProvider";
import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import AuthPage from "./pages/AuthPage";
import AdminUsers from "./pages/AdminUsers";
import AdminProducts from "./pages/AdminProducts";
import NotFound from "./pages/NotFound";
import Blog from "./pages/Blog.tsx";
function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <Preloader />
                <Routes>
                    <Route element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="products" element={<ProductList />} />
                        <Route path="product/:id" element={<ProductDetail />} />
                        <Route path="blog" element={<Blog />} />
                        <Route path="cart" element={<Cart />} />
                        <Route path="checkout" element={<Checkout />} />

                        {/* Trang quản trị: chỉ admin mới thấy, người khác nhận trang 404 */}
                        <Route
                            path="admin/users"
                            element={
                                <RequireAdmin>
                                    <AdminUsers />
                                </RequireAdmin>
                            }
                        />
                        <Route
                            path="admin/products"
                            element={
                                <RequireAdmin>
                                    <AdminProducts />
                                </RequireAdmin>
                            }
                        />

                        {/* AuthPage là layout route: giữ nguyên khi chuyển giữa /login và /register */}
                        <Route element={<AuthPage />}>
                            <Route path="login" element={null} />
                            <Route path="register" element={null} />
                        </Route>

                        <Route path="*" element={<NotFound />} />
                    </Route>
                </Routes>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;