import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Check, ChevronDown, Copy, PackageOpen, QrCode, RefreshCw } from "lucide-react";
import Pagination from "../components/Pagination";
import { useAuth } from "../context/useAuth";
import { getMyOrders } from "../services/orderApi";
import type { MyOrder, MyOrdersResponse, OrderPaymentStatus, OrderStatus } from "../services/orderApi";
import { formatPrice } from "../utils/cart";

const STATUS_LABEL: Record<OrderStatus, { text: string; className: string }> = {
    pending: { text: "Chờ xác nhận", className: "bg-yellow-500/15 text-yellow-300" },
    confirmed: { text: "Đã xác nhận", className: "bg-blue-500/15 text-blue-300" },
    shipping: { text: "Đang giao", className: "bg-purple-500/15 text-purple-300" },
    completed: { text: "Hoàn thành", className: "bg-green-500/15 text-green-300" },
    cancelled: { text: "Đã hủy", className: "bg-white/10 text-gray-400" },
};

const PAYMENT_STATUS_LABEL: Record<OrderPaymentStatus, { text: string; className: string }> = {
    unpaid: { text: "Chưa thanh toán", className: "text-yellow-300" },
    paid: { text: "Đã thanh toán", className: "text-green-400" },
    failed: { text: "Thanh toán lỗi", className: "text-red-400" },
};

const formatDate = (value: string) =>
    new Date(value).toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });

function Spinner() {
    return (
        <div className="flex min-h-[40vh] items-center justify-center">
            <div role="status" aria-label="Đang tải" className="h-9 w-9 animate-spin rounded-full border-4 border-white/20 border-t-red-600" />
        </div>
    );
}

export default function OrderHistory() {
    const { user, loading: authLoading } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Math.max(1, Number(searchParams.get("page")) || 1);

    const [reloadKey, setReloadKey] = useState(0);
    // Kết quả gắn với "khóa" của lần tải (trang + số lần thử lại).
    // Khóa hiện tại khác khóa của kết quả nghĩa là đang tải.
    const requestKey = `${page}:${reloadKey}`;
    const [result, setResult] = useState<{ key: string; data: MyOrdersResponse | null; error: string } | null>(null);

    useEffect(() => {
        if (!user) return;
        let ignore = false;

        getMyOrders(page)
            .then((orders) => {
                if (!ignore) setResult({ key: requestKey, data: orders, error: "" });
            })
            .catch((err: unknown) => {
                if (!ignore) {
                    const message = err instanceof Error ? err.message : "Không thể tải lịch sử đặt hàng";
                    setResult((prev) => ({ key: requestKey, data: prev?.data ?? null, error: message }));
                }
            });

        return () => {
            ignore = true;
        };
    }, [user, page, requestKey]);

    const loading = result?.key !== requestKey;
    const data = result?.data ?? null;
    const error = loading ? "" : (result?.error ?? "");

    const changePage = (next: number) => {
        setSearchParams(next > 1 ? { page: String(next) } : {});
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (authLoading) return <Spinner />;

    if (!user) {
        return (
            <section className="mx-auto max-w-lg px-4 py-16 text-center text-white">
                <PackageOpen size={56} className="mx-auto text-gray-500" />
                <h1 className="mt-4 text-2xl font-extrabold">Lịch sử đặt hàng</h1>
                <p className="mt-2 text-sm text-gray-400">Vui lòng đăng nhập để xem các đơn hàng bạn đã đặt.</p>
                <Link to="/login" className="mt-6 inline-block rounded-lg bg-red-600 px-6 py-3 text-sm font-bold uppercase tracking-wide transition hover:bg-red-700">
                    Đăng nhập
                </Link>
            </section>
        );
    }

    return (
        <section className="mx-auto max-w-4xl px-4 py-8 text-white md:py-10">
            <div className="mb-6 flex items-center justify-between gap-4">
                <h1 className="border-l-4 border-red-600 pl-3 text-xl font-extrabold uppercase md:text-2xl">Lịch sử đặt hàng</h1>
                {data && data.total > 0 && <span className="text-sm text-gray-400">{data.total} đơn hàng</span>}
            </div>

            {loading && !data ? (
                <Spinner />
            ) : error ? (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
                    <p className="text-sm text-red-300">{error}</p>
                    <button type="button" onClick={() => setReloadKey((k) => k + 1)} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold hover:border-red-600">
                        <RefreshCw size={15} /> Thử lại
                    </button>
                </div>
            ) : data && data.orders.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-[#141414] p-10 text-center">
                    <PackageOpen size={56} className="mx-auto text-gray-500" />
                    <p className="mt-4 font-semibold">Bạn chưa có đơn hàng nào</p>
                    <p className="mt-1 text-sm text-gray-400">Các đơn đặt khi đã đăng nhập sẽ hiện ở đây.</p>
                    <Link to="/products" className="mt-6 inline-block rounded-lg bg-red-600 px-6 py-3 text-sm font-bold uppercase tracking-wide transition hover:bg-red-700">
                        Mua sắm ngay
                    </Link>
                </div>
            ) : (
                data && (
                    <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
                        <ul className="space-y-4">
                            {data.orders.map((order) => (
                                <li key={order.id}>
                                    <OrderCard order={order} />
                                </li>
                            ))}
                        </ul>
                        <Pagination page={data.page} totalPages={data.totalPages} onChange={changePage} />
                    </div>
                )
            )}
        </section>
    );
}

function CopyButton({ text, label }: { text: string; label: string }) {
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
        } catch {
            // trình duyệt có thể chặn clipboard
        }
    };

    return (
        <button type="button" onClick={copy} aria-label={label} title={label} className="rounded p-1 text-gray-400 transition hover:bg-white/10 hover:text-white">
            {copied ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
        </button>
    );
}

function OrderCard({ order }: { order: MyOrder }) {
    const [open, setOpen] = useState(false);
    const [showQr, setShowQr] = useState(false);
    const status = STATUS_LABEL[order.status] ?? STATUS_LABEL.pending;
    const paymentStatus = PAYMENT_STATUS_LABEL[order.paymentStatus];
    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <article className="overflow-hidden rounded-xl border border-white/10 bg-[#141414]">
            {/* Đầu thẻ: mã đơn, ngày đặt, trạng thái */}
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
                <div>
                    <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-500">Mã đơn</span>
                        <strong className="ml-1 font-mono tracking-wider text-red-400">{order.code}</strong>
                        <CopyButton text={order.code} label="Sao chép mã đơn" />
                    </div>
                    <p className="text-xs text-gray-500">Đặt lúc {formatDate(order.createdAt)}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>{status.text}</span>
            </header>

            {/* Sản phẩm */}
            <ul className="divide-y divide-white/5 px-4 sm:px-5">
                {order.items.map((item, index) => (
                    <li key={`${item.code}-${index}`} className="flex items-center gap-3 py-3">
                        {item.productId ? (
                            <Link to={`/product/${item.productId}`} className="w-12 shrink-0">
                                <img src={item.imageUrl} alt="" className="aspect-[63/88] w-full rounded object-cover" />
                            </Link>
                        ) : (
                            <img src={item.imageUrl} alt="" className="aspect-[63/88] w-12 shrink-0 rounded object-cover" />
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-red-400">{item.code}</p>
                            <p className="line-clamp-1 text-sm">{item.name}</p>
                            <p className="text-xs text-gray-500">
                                {item.rarity && `${item.rarity} · `}
                                {formatPrice(item.price)} × {item.quantity}
                            </p>
                        </div>
                        <span className="text-sm font-semibold">{formatPrice(item.lineTotal)}</span>
                    </li>
                ))}
            </ul>

            {/* Tổng tiền + thanh toán */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3 sm:px-5">
                <div className="text-sm">
                    <span className="text-gray-400">{order.payment === "cod" ? "Thanh toán khi nhận hàng" : "Chuyển khoản"}</span>
                    <span className="mx-2 text-gray-600">·</span>
                    <span className={paymentStatus.className}>{paymentStatus.text}</span>
                </div>
                <div className="text-right">
                    <span className="text-xs text-gray-500">{itemCount} sản phẩm · Tổng </span>
                    <span className="text-lg font-extrabold text-red-400">{formatPrice(order.total)}</span>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-white/10 px-4 py-2 sm:px-5">
                <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-gray-300 transition hover:bg-white/10 hover:text-white">
                    <ChevronDown size={15} className={`transition-transform ${open ? "rotate-180" : ""}`} />
                    {open ? "Ẩn chi tiết" : "Xem chi tiết"}
                </button>
                {order.paymentInfo && (
                    <button type="button" onClick={() => setShowQr((v) => !v)} aria-expanded={showQr} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/10">
                        <QrCode size={15} /> {showQr ? "Ẩn mã QR" : "Thanh toán ngay"}
                    </button>
                )}
            </div>

            {open && (
                <dl className="grid gap-x-6 gap-y-2 border-t border-white/10 bg-black/20 px-4 py-4 text-sm sm:grid-cols-2 sm:px-5">
                    <div><dt className="text-xs text-gray-500">Người nhận</dt><dd>{order.fullName}</dd></div>
                    <div><dt className="text-xs text-gray-500">Số điện thoại</dt><dd>{order.phone}</dd></div>
                    <div className="sm:col-span-2"><dt className="text-xs text-gray-500">Địa chỉ</dt><dd>{order.address}, {order.city}</dd></div>
                    {order.note && <div className="sm:col-span-2"><dt className="text-xs text-gray-500">Ghi chú</dt><dd className="whitespace-pre-line">{order.note}</dd></div>}
                    <div><dt className="text-xs text-gray-500">Tạm tính</dt><dd>{formatPrice(order.subtotal)}</dd></div>
                    <div><dt className="text-xs text-gray-500">Phí vận chuyển</dt><dd>{order.shippingFee === 0 ? "Miễn phí" : formatPrice(order.shippingFee)}</dd></div>
                    {order.paidAt && <div><dt className="text-xs text-gray-500">Thanh toán lúc</dt><dd>{formatDate(order.paidAt)}</dd></div>}
                </dl>
            )}

            {showQr && order.paymentInfo && (
                <div className="border-t border-white/10 bg-black/20 px-4 py-5 text-center sm:px-5">
                    {order.paymentInfo.qrUrl ? (
                        <img src={order.paymentInfo.qrUrl} alt="Mã QR thanh toán" className="mx-auto h-56 w-56 rounded-lg bg-white object-contain p-2" />
                    ) : (
                        <p className="text-sm text-red-300">Shop chưa cấu hình tài khoản ngân hàng.</p>
                    )}
                    <p className="mt-3 text-sm text-gray-400">
                        Nội dung chuyển khoản: <strong className="text-red-400">{order.paymentInfo.transferContent}</strong>
                    </p>
                    <p className="mt-1 text-xs text-gray-500">Chuyển đúng {formatPrice(order.total)} và giữ nguyên nội dung để hệ thống tự xác nhận.</p>
                </div>
            )}
        </article>
    );
}
