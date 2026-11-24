import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";

import { lookupOrder } from "../services/orderApi";
import type { MyOrder } from "../services/orderApi";
import { formatPrice } from "../utils/cart";
import { ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL, formatDateTime } from "../utils/orderStatus";

export default function OrderLookup() {
    const [code, setCode] = useState("");
    const [phone, setPhone] = useState("");
    const [order, setOrder] = useState<MyOrder | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setOrder(null);
        if (!code.trim() || !phone.trim()) {
            setError("Nhập mã đơn và số điện thoại");
            return;
        }
        setLoading(true);
        try {
            setOrder(await lookupOrder(code.trim(), phone.trim()));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Không tìm thấy đơn");
        } finally {
            setLoading(false);
        }
    };

    const status = order ? ORDER_STATUS_LABEL[order.status] : null;
    const paymentStatus = order ? PAYMENT_STATUS_LABEL[order.paymentStatus] : null;

    return (
        <section className="mx-auto max-w-2xl px-4 py-8 text-[#1a1a1a] md:py-10">
            <h1 className="mb-2 border-l-4 border-[#1a1a1a] pl-3 text-xl font-extrabold uppercase md:text-2xl">Tra cứu đơn hàng</h1>
            <p className="mb-6 pl-4 text-sm text-[#6b6b6b]">Nhập mã đơn và số điện thoại đã dùng khi đặt.</p>

            <form onSubmit={onSubmit} className="rounded-xl border border-black/10 bg-[#f6f4ef] p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="lk-code" className="mb-1 block text-sm font-semibold">Mã đơn</label>
                        <input id="lk-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="VD: CS1A2B3C..." className="w-full rounded-lg border border-black/15 bg-[#f6f4ef] px-3 py-2 text-sm outline-none focus:border-[#1a1a1a]" />
                    </div>
                    <div>
                        <label htmlFor="lk-phone" className="mb-1 block text-sm font-semibold">Số điện thoại</label>
                        <input id="lk-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="VD: 0905123456" className="w-full rounded-lg border border-black/15 bg-[#f6f4ef] px-3 py-2 text-sm outline-none focus:border-[#1a1a1a]" />
                    </div>
                </div>
                {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
                <button type="submit" disabled={loading} className="mt-4 rounded-lg bg-[#1a1a1a] px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-[#e9e6de] transition hover:bg-black disabled:opacity-60">
                    {loading ? "Đang tìm..." : "Tra cứu"}
                </button>
            </form>

            {order && status && paymentStatus && (
                <article className="mt-6 overflow-hidden rounded-xl border border-black/10 bg-[#f6f4ef]">
                    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-5 py-3">
                        <div>
                            <span className="text-xs text-[#8a8a8a]">Mã đơn </span>
                            <strong className="font-mono tracking-wider">{order.code}</strong>
                            <p className="text-xs text-[#8a8a8a]">Đặt lúc {formatDateTime(order.createdAt)}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>{status.text}</span>
                    </header>
                    <ul className="divide-y divide-black/5 px-5">
                        {order.items.map((item, i) => (
                            <li key={`${item.code}-${i}`} className="flex items-center gap-3 py-3">
                                <img src={item.imageUrl} alt="" className="aspect-[63/88] w-10 shrink-0 rounded object-cover" />
                                <div className="min-w-0 flex-1">
                                    <p className="line-clamp-1 text-sm">{item.name}</p>
                                    <p className="text-xs text-[#8a8a8a]">{formatPrice(item.price)} × {item.quantity}</p>
                                </div>
                                <span className="text-sm font-semibold">{formatPrice(item.lineTotal)}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="flex items-center justify-between gap-3 border-t border-black/10 px-5 py-3">
                        <span className={`text-sm ${paymentStatus.className}`}>
                            {order.payment === "cod" ? "COD" : "Chuyển khoản"} · {paymentStatus.text}
                        </span>
                        <span className="text-lg font-extrabold">{formatPrice(order.total)}</span>
                    </div>
                    {order.paymentInfo?.qrUrl && (
                        <div className="border-t border-black/10 bg-[#e9e6de] px-5 py-5 text-center">
                            <img src={order.paymentInfo.qrUrl} alt="Mã QR thanh toán" className="mx-auto h-52 w-52 rounded-lg bg-white object-contain p-2" />
                            <p className="mt-2 text-sm text-[#6b6b6b]">Nội dung CK: <strong className="text-[#1a1a1a]">{order.paymentInfo.transferContent}</strong></p>
                        </div>
                    )}
                </article>
            )}

            <p className="mt-6 text-center text-sm text-[#6b6b6b]">
                Có tài khoản? <Link to="/orders" className="font-semibold text-[#1a1a1a] underline">Xem lịch sử đặt hàng</Link>
            </p>
        </section>
    );
}
