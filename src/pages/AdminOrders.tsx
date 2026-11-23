import { useEffect, useState } from "react";
import { ChevronDown, PackageOpen, RefreshCw, Search } from "lucide-react";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import { listAdminOrders, updateOrderStatus } from "../services/adminOrderApi";
import type { AdminOrder, AdminOrderListResponse } from "../services/adminOrderApi";
import type { OrderStatus } from "../services/orderApi";
import { formatPrice } from "../utils/cart";
import { ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL, formatDateTime } from "../utils/orderStatus";

const TABS: { value: OrderStatus | ""; label: string }[] = [
    { value: "", label: "Tất cả" },
    { value: "pending", label: "Chờ xác nhận" },
    { value: "confirmed", label: "Đã xác nhận" },
    { value: "shipping", label: "Đang giao" },
    { value: "completed", label: "Hoàn thành" },
    { value: "cancelled", label: "Đã hủy" },
];

// Nút hành động ứng với trạng thái đích
const ACTION: Record<OrderStatus, { text: string; className: string }> = {
    pending: { text: "", className: "" },
    confirmed: { text: "Xác nhận đơn", className: "bg-red-600 hover:bg-red-700 text-white" },
    shipping: { text: "Bắt đầu giao", className: "bg-purple-600 hover:bg-purple-700 text-white" },
    completed: { text: "Đã giao xong", className: "bg-green-600 hover:bg-green-700 text-white" },
    cancelled: { text: "Hủy đơn", className: "border border-white/15 text-gray-300 hover:border-red-500 hover:text-red-400" },
};

export default function AdminOrders() {
    const [status, setStatus] = useState<OrderStatus | "">("");
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [reloadKey, setReloadKey] = useState(0);

    const requestKey = `${status}|${search}|${page}|${reloadKey}`;
    const [result, setResult] = useState<{ key: string; data: AdminOrderListResponse | null; error: string } | null>(null);

    // Gõ xong 400ms mới tìm, đỡ gọi API liên tục
    useEffect(() => {
        const timer = window.setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, 400);
        return () => window.clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        let ignore = false;
        listAdminOrders({ page, status: status || undefined, search: search || undefined })
            .then((data) => {
                if (!ignore) setResult({ key: requestKey, data, error: "" });
            })
            .catch((err: unknown) => {
                if (!ignore) {
                    const message = err instanceof Error ? err.message : "Không thể tải đơn hàng";
                    setResult((prev) => ({ key: requestKey, data: prev?.data ?? null, error: message }));
                }
            });
        return () => {
            ignore = true;
        };
    }, [page, status, search, requestKey]);

    const loading = result?.key !== requestKey;
    const data = result?.data ?? null;
    const error = loading ? "" : (result?.error ?? "");

    // Cập nhật một đơn ngay trong danh sách, không cần tải lại cả trang
    const replaceOrder = (updated: AdminOrder) =>
        setResult((prev) =>
            prev?.data
                ? { ...prev, data: { ...prev.data, orders: prev.data.orders.map((o) => (o.id === updated.id ? updated : o)) } }
                : prev,
        );

    const total = Object.values(data?.statusCounts ?? {}).reduce((sum, n) => sum + (n ?? 0), 0);

    return (
        <section className="mx-auto max-w-5xl px-4 py-8 text-white md:py-10">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="border-l-4 border-red-600 pl-3 text-xl font-extrabold uppercase md:text-2xl">Quản lý đơn hàng</h1>
                    <p className="mt-1 pl-4 text-sm text-gray-400">Đơn hàng của tất cả khách</p>
                </div>
                <button type="button" onClick={() => setReloadKey((k) => k + 1)} className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold text-gray-300 transition hover:border-red-600 hover:text-white">
                    <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Tải lại
                </button>
            </div>

            {/* Tab lọc theo trạng thái */}
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
                {TABS.map((tab) => {
                    const count = tab.value ? (data?.statusCounts[tab.value] ?? 0) : total;
                    const active = status === tab.value;
                    return (
                        <button
                            key={tab.value || "all"}
                            type="button"
                            onClick={() => {
                                setStatus(tab.value);
                                setPage(1);
                            }}
                            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${active ? "bg-red-600 text-white" : "bg-white/5 text-gray-300 hover:bg-white/10"}`}
                        >
                            {tab.label}
                            {data && <span className={`ml-2 rounded-full px-1.5 text-xs ${active ? "bg-white/20" : "bg-white/10"}`}>{count}</span>}
                        </button>
                    );
                })}
            </div>

            <div className="relative mb-6">
                <label htmlFor="order-search" className="sr-only">Tìm đơn hàng</label>
                <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                    id="order-search"
                    type="search"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Tìm theo mã đơn, tên, số điện thoại hoặc tài khoản..."
                    className="w-full rounded-lg border border-white/15 bg-neutral-900 py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-red-600"
                />
            </div>

            {error ? (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center text-sm text-red-300">{error}</div>
            ) : !data ? (
                <div className="flex min-h-[30vh] items-center justify-center">
                    <div role="status" aria-label="Đang tải" className="h-9 w-9 animate-spin rounded-full border-4 border-white/20 border-t-red-600" />
                </div>
            ) : data.orders.length === 0 ? (
                <div className="rounded-xl border border-white/10 bg-[#141414] p-10 text-center">
                    <PackageOpen size={48} className="mx-auto text-gray-500" />
                    <p className="mt-3 text-sm text-gray-400">Không có đơn hàng nào.</p>
                </div>
            ) : (
                <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
                    <ul className="space-y-4">
                        {data.orders.map((order) => (
                            <li key={order.id}>
                                <AdminOrderCard order={order} onUpdated={replaceOrder} onChanged={() => setReloadKey((k) => k + 1)} />
                            </li>
                        ))}
                    </ul>
                    <Pagination page={data.page} totalPages={data.totalPages} onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
                </div>
            )}
        </section>
    );
}

function AdminOrderCard({ order, onUpdated, onChanged }: { order: AdminOrder; onUpdated: (order: AdminOrder) => void; onChanged: () => void }) {
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState<OrderStatus | null>(null);
    const [error, setError] = useState("");
    const [confirmCancel, setConfirmCancel] = useState(false);

    const status = ORDER_STATUS_LABEL[order.status];
    const paymentStatus = PAYMENT_STATUS_LABEL[order.paymentStatus];

    const changeStatus = async (next: OrderStatus) => {
        setBusy(next);
        setError("");
        try {
            onUpdated(await updateOrderStatus(order.id, next));
            onChanged(); // cập nhật lại số đếm trên các tab
        } catch (err) {
            setError(err instanceof Error ? err.message : "Không thể cập nhật đơn hàng");
        } finally {
            setBusy(null);
            setConfirmCancel(false);
        }
    };

    return (
        <article className="overflow-hidden rounded-xl border border-white/10 bg-[#141414]">
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
                <div className="min-w-0">
                    <p>
                        <span className="text-xs text-gray-500">Mã đơn </span>
                        <strong className="font-mono tracking-wider text-red-400">{order.code}</strong>
                    </p>
                    <p className="text-xs text-gray-500">
                        {formatDateTime(order.createdAt)} ·{" "}
                        {order.username ? <>Tài khoản <span className="text-gray-300">{order.username}</span></> : "Khách chưa đăng nhập"}
                    </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>{status.text}</span>
            </header>

            <div className="grid gap-4 px-4 py-4 sm:px-5 md:grid-cols-[1fr_16rem]">
                {/* Sản phẩm */}
                <ul className="space-y-2">
                    {order.items.map((item, index) => (
                        <li key={`${item.code}-${index}`} className="flex items-center gap-3">
                            <img src={item.imageUrl} alt="" className="aspect-[63/88] w-10 shrink-0 rounded object-cover" />
                            <div className="min-w-0 flex-1">
                                <p className="line-clamp-1 text-sm">
                                    <span className="font-semibold text-red-400">{item.code}</span> {item.name}
                                </p>
                                <p className="text-xs text-gray-500">{formatPrice(item.price)} × {item.quantity}</p>
                            </div>
                            <span className="text-sm font-semibold">{formatPrice(item.lineTotal)}</span>
                        </li>
                    ))}
                </ul>

                {/* Khách hàng */}
                <div className="rounded-lg bg-black/30 p-3 text-sm">
                    <p className="font-semibold">{order.fullName}</p>
                    <a href={`tel:${order.phone}`} className="text-red-400 hover:underline">{order.phone}</a>
                    <p className="mt-1 text-xs text-gray-400">{order.address}, {order.city}</p>
                    {order.note && <p className="mt-2 text-xs italic text-yellow-200/80">“{order.note}”</p>}
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3 sm:px-5">
                <div className="text-sm">
                    <span className="text-gray-400">{order.payment === "cod" ? "COD" : "Chuyển khoản"}</span>
                    <span className="mx-2 text-gray-600">·</span>
                    <span className={paymentStatus.className}>{paymentStatus.text}</span>
                    <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="ml-3 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-white">
                        <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} /> Chi tiết
                    </button>
                </div>
                <span className="text-lg font-extrabold text-red-400">{formatPrice(order.total)}</span>
            </div>

            {open && (
                <dl className="grid grid-cols-2 gap-x-6 gap-y-2 border-t border-white/10 bg-black/20 px-4 py-3 text-sm sm:grid-cols-4 sm:px-5">
                    <div><dt className="text-xs text-gray-500">Tạm tính</dt><dd>{formatPrice(order.subtotal)}</dd></div>
                    <div><dt className="text-xs text-gray-500">Phí ship</dt><dd>{order.shippingFee === 0 ? "Miễn phí" : formatPrice(order.shippingFee)}</dd></div>
                    <div><dt className="text-xs text-gray-500">Email</dt><dd className="truncate">{order.email || "—"}</dd></div>
                    <div><dt className="text-xs text-gray-500">Thanh toán lúc</dt><dd>{order.paidAt ? formatDateTime(order.paidAt) : "—"}</dd></div>
                </dl>
            )}

            {order.nextStatuses.length > 0 && (
                <div className="flex flex-wrap items-center justify-end gap-2 border-t border-white/10 px-4 py-3 sm:px-5">
                    {error && <p className="mr-auto text-sm text-red-400">{error}</p>}
                    {order.nextStatuses.map((next) => (
                        <button
                            key={next}
                            type="button"
                            disabled={busy !== null}
                            onClick={() => (next === "cancelled" ? setConfirmCancel(true) : changeStatus(next))}
                            className={`rounded-lg px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${ACTION[next].className}`}
                        >
                            {busy === next ? "Đang lưu..." : ACTION[next].text}
                        </button>
                    ))}
                </div>
            )}

            {confirmCancel && (
                <Modal title="Hủy đơn hàng" onClose={() => setConfirmCancel(false)}>
                    <p className="text-sm text-gray-300">
                        Hủy đơn <strong className="text-white">{order.code}</strong> của {order.fullName}? Số lượng sản phẩm trong đơn sẽ được trả lại vào kho. Không thể hoàn tác.
                    </p>
                    <div className="mt-6 flex justify-end gap-2">
                        <button type="button" onClick={() => setConfirmCancel(false)} className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white">Không</button>
                        <button type="button" disabled={busy !== null} onClick={() => changeStatus("cancelled")} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50">
                            {busy === "cancelled" ? "Đang hủy..." : "Hủy đơn"}
                        </button>
                    </div>
                </Modal>
            )}
        </article>
    );
}

