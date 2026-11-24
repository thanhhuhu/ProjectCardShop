import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import RequireAdmin from "./components/RequireAdmin";
import Preloader from "./components/PreLoader";
import AuthProvider from "./context/AuthProvider";
import CartProvider from "./context/CartProvider";
import WishlistProvider from "./context/WishlistProvider";
import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderHistory from "./pages/OrderHistory";
import AuthPage from "./pages/AuthPage";
import AdminUsers from "./pages/AdminUsers";
import AdminProducts from "./pages/AdminProducts";
import NotFound from "./pages/NotFound";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AdminBlog from "./pages/AdminBlog";
import AdminOrders from "./pages/AdminOrders";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import OrderLookup from "./pages/OrderLookup";
import AdminReviews from "./pages/AdminReviews";
import AdminDiscounts from "./pages/AdminDiscounts";
function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <WishlistProvider>
                <Preloader />
                <Routes>
                    <Route element={<Layout />}>
                        <Route index element={<Home />} />
                        <Route path="products" element={<ProductList />} />
                        <Route path="product/:id" element={<ProductDetail />} />
                        <Route path="blog" element={<Blog />} />
                        <Route path="blog/:id" element={<BlogPost />} />
                        <Route path="cart" element={<Cart />} />
                        <Route path="checkout" element={<Checkout />} />
                        <Route path="orders" element={<OrderHistory />} />
                        <Route path="order-lookup" element={<OrderLookup />} />
                        <Route path="profile" element={<Profile />} />
                        <Route path="wishlist" element={<Wishlist />} />

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
                        <Route
                            path="admin/orders"
                            element={
                                <RequireAdmin>
                                    <AdminOrders />
                                </RequireAdmin>
                            }
                        />
                        <Route
                            path="admin/blog"
                            element={
                                <RequireAdmin>
                                    <AdminBlog />
                                </RequireAdmin>
                            }
                        />
                        <Route
                            path="admin/reviews"
                            element={
                                <RequireAdmin>
                                    <AdminReviews />
                                </RequireAdmin>
                            }
                        />
                        <Route
                            path="admin/discounts"
                            element={
                                <RequireAdmin>
                                    <AdminDiscounts />
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
                </WishlistProvider>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;