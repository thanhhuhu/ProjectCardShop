import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { CheckCircle2, Copy, RefreshCw } from "lucide-react";
import CheckoutSteps from "../components/CheckoutSteps";
import { useCart } from "../context/useCart";
import { useAuth } from "../context/useAuth";
import { formatPrice, getShippingFee } from "../utils/cart";
import { createOrder, getOrderPaymentStatus } from "../services/orderApi";
import type { OrderCreated } from "../services/orderApi";
import { getProfile } from "../services/authApi";
import { validateDiscount } from "../services/discountApi";

type PaymentMethod = "cod" | "bank";

interface FormState {
    fullName: string;
    phone: string;
    email: string;
    city: string;
    address: string;
    note: string;
    payment: PaymentMethod;
}

type Errors = Partial<Record<keyof FormState, string>>;

const initialForm: FormState = {
    fullName: "",
    phone: "",
    email: "",
    city: "",
    address: "",
    note: "",
    payment: "cod",
};

const phonePattern = /^(0|\+84)\d{9}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass = (error?: string) =>
    `w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-[#1a1a1a] outline-none transition focus:border-[#1a1a1a] ${error ? "border-red-400" : "border-black/10"}`;

function Card({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="rounded-xl border border-black/10 bg-white p-4 sm:p-6">
            <h2 className="mb-4 text-lg font-extrabold uppercase">{title}</h2>
            {children}
        </section>
    );
}

interface TextFieldProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    required?: boolean;
    type?: "text" | "email" | "tel";
    autoComplete?: string;
}

function TextField({ id, label, value, onChange, error, required, type = "text", autoComplete }: TextFieldProps) {
    return (
        <div>
            <label htmlFor={id} className="mb-1 block text-sm font-semibold text-[#2a2a2a]">
                {label} {required && <span className="text-[#1a1a1a]">*</span>}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                autoComplete={autoComplete}
                aria-invalid={error ? true : undefined}
                className={inputClass(error)}
            />
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}

const paymentOptions: { value: PaymentMethod; title: string; description: string }[] = [
    { value: "cod", title: "Thanh toán khi nhận hàng (COD)", description: "Trả tiền mặt khi shipper giao thẻ tới bạn." },
    { value: "bank", title: "Chuyển khoản ngân hàng / QR", description: "Sau khi tạo đơn, hệ thống hiển thị QR với đúng số tiền và mã đơn hàng." },
];

export default function Checkout() {
    const { items, subtotal, clearCart } = useCart();
    const { user } = useAuth();
    const [form, setForm] = useState<FormState>(initialForm);
    const [errors, setErrors] = useState<Errors>({});
    const [placed, setPlaced] = useState<OrderCreated | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    // Mã giảm giá
    const [discountInput, setDiscountInput] = useState("");
    const [applied, setApplied] = useState<{ code: string; amount: number } | null>(null);
    const [discountMsg, setDiscountMsg] = useState<{ ok: boolean; text: string } | null>(null);
    const [checkingDiscount, setCheckingDiscount] = useState(false);

    // Đổi giỏ hàng thì bỏ mã đã áp (số tiền giảm có thể không còn đúng)
    const [lastSubtotal, setLastSubtotal] = useState(subtotal);
    if (subtotal !== lastSubtotal) {
        setLastSubtotal(subtotal);
        setApplied(null);
        setDiscountMsg(null);
    }

    // Tự điền thông tin giao hàng từ hồ sơ (nếu đã đăng nhập)
    useEffect(() => {
        if (!user) return;
        let ignore = false;
        getProfile()
            .then((p) => {
                if (ignore) return;
                setForm((prev) => ({
                    ...prev,
                    fullName: prev.fullName || p.fullName,
                    phone: prev.phone || p.phone,
                    email: prev.email || p.email,
                    city: prev.city || p.city,
                    address: prev.address || p.address,
                }));
            })
            .catch(() => undefined);
        return () => {
            ignore = true;
        };
    }, [user]);

    const shippingFee = getShippingFee(subtotal);
    const discountAmount = applied ? Math.min(applied.amount, subtotal) : 0;
    const total = subtotal - discountAmount + shippingFee;

    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const applyDiscount = async () => {
        const code = discountInput.trim();
        if (!code) return;
        setCheckingDiscount(true);
        setDiscountMsg(null);
        try {
            const res = await validateDiscount(code, subtotal);
            if (res.ok && res.discount) {
                setApplied({ code: res.discount.code, amount: res.discount.amount });
                setDiscountMsg({ ok: true, text: res.message });
            } else {
                setApplied(null);
                setDiscountMsg({ ok: false, text: res.message });
            }
        } catch (err) {
            setDiscountMsg({ ok: false, text: err instanceof Error ? err.message : "Không kiểm tra được mã" });
        } finally {
            setCheckingDiscount(false);
        }
    };

    const removeDiscount = () => {
        setApplied(null);
        setDiscountInput("");
        setDiscountMsg(null);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const next: Errors = {};
        if (form.fullName.trim().length < 2) next.fullName = "Vui lòng nhập họ và tên";
        if (!phonePattern.test(form.phone.replace(/[\s.-]/g, ""))) next.phone = "Số điện thoại gồm 10 số, ví dụ 0905123456 hoặc +84905123456";
        if (form.email.trim() && !emailPattern.test(form.email.trim())) next.email = "Địa chỉ email không hợp lệ";
        if (!form.city.trim()) next.city = "Vui lòng nhập tỉnh / thành phố";
        if (form.address.trim().length < 5) next.address = "Vui lòng nhập địa chỉ giao hàng cụ thể";
        setErrors(next);
        if (Object.keys(next).length > 0) return;

        setSubmitError("");
        setSubmitting(true);

        try {
            const order = await createOrder({
                fullName: form.fullName.trim(),
                phone: form.phone.replace(/[\s.-]/g, ""),
                email: form.email.trim(),
                city: form.city.trim(),
                address: form.address.trim(),
                note: form.note.trim(),
                paymentMethod: form.payment,
                discountCode: applied?.code,
                items: items.map(({ product, quantity }) => ({ productId: product.id, quantity })),
            });

            setPlaced(order);
            clearCart();
            window.scrollTo({ top: 0 });
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : "Không thể tạo đơn hàng.");
        } finally {
            setSubmitting(false);
        }
    };

    if (placed) {
        return <OrderSuccess order={placed} />;
    }

    if (items.length === 0) return <Navigate to="/cart" replace />;

    return (
        <section className="mx-auto max-w-6xl px-4 py-8 text-[#1a1a1a] md:py-10">
            <CheckoutSteps current={1} />
            <h1 className="mb-6 border-l-4 border-[#1a1a1a] pl-3 text-xl font-extrabold uppercase md:text-2xl">Thanh toán</h1>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
                <form id="checkout-form" onSubmit={handleSubmit} noValidate className="space-y-6">
                    <Card title="Thông tin giao hàng">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <TextField id="fullName" label="Họ và tên" required value={form.fullName} onChange={(v) => setField("fullName", v)} autoComplete="name" error={errors.fullName} />
                            <TextField id="phone" label="Số điện thoại" type="tel" required value={form.phone} onChange={(v) => setField("phone", v)} autoComplete="tel" error={errors.phone} />
                            <div className="sm:col-span-2">
                                <TextField id="email" label="Email (không bắt buộc)" type="email" value={form.email} onChange={(v) => setField("email", v)} autoComplete="email" error={errors.email} />
                            </div>
                            <TextField id="city" label="Tỉnh / Thành phố" required value={form.city} onChange={(v) => setField("city", v)} error={errors.city} />
                            <TextField id="address" label="Địa chỉ cụ thể" required value={form.address} onChange={(v) => setField("address", v)} autoComplete="street-address" error={errors.address} />
                            <div className="sm:col-span-2">
                                <label htmlFor="note" className="mb-1 block text-sm font-semibold text-[#2a2a2a]">Ghi chú đơn hàng</label>
                                <textarea id="note" rows={3} value={form.note} onChange={(e) => setField("note", e.target.value)} placeholder="Ví dụ: giao giờ hành chính..." className={`${inputClass()} resize-y placeholder:text-[#8a8a8a]`} />
                            </div>
                        </div>
                    </Card>

                    <Card title="Phương thức thanh toán">
                        <fieldset className="space-y-3">
                            {paymentOptions.map((option) => {
                                const selected = form.payment === option.value;
                                return (
                                    <label key={option.value} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${selected ? "border-[#1a1a1a] bg-black/[0.06]" : "border-black/10 hover:border-black/25"}`}>
                                        <input type="radio" name="payment" value={option.value} checked={selected} onChange={() => setField("payment", option.value)} className="mt-1 h-4 w-4 accent-red-600" />
                                        <span>
                                            <span className="block text-sm font-semibold">{option.title}</span>
                                            <span className="block text-xs text-[#6b6b6b]">{option.description}</span>
                                        </span>
                                    </label>
                                );
                            })}
                        </fieldset>
                    </Card>
                </form>

                <aside className="h-fit rounded-xl border border-black/10 bg-white p-5 lg:sticky lg:top-4">
                    <h2 className="mb-4 text-lg font-extrabold uppercase">Đơn hàng của bạn</h2>
                    <ul className="max-h-72 space-y-3 overflow-y-auto pr-1">
                        {items.map(({ product, quantity }) => (
                            <li key={product.id} className="flex items-center gap-3">
                                <div className="relative w-12 shrink-0">
                                    <img src={product.imageUrl} alt="" className="aspect-[63/88] w-full rounded object-cover" />
                                    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#1a1a1a] text-[#f4f4f1] px-1 text-[11px] font-bold">{quantity}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-[#8a8a8a]">{product.code}</p>
                                    <p className="line-clamp-1 text-sm">{product.name}</p>
                                </div>
                                <span className="text-sm font-semibold">{formatPrice(product.price * quantity)}</span>
                            </li>
                        ))}
                    </ul>

                    <dl className="mt-5 space-y-2 border-t border-black/10 pt-4 text-sm">
                        <div className="flex justify-between"><dt className="text-[#6b6b6b]">Tạm tính</dt><dd>{formatPrice(subtotal)}</dd></div>

                        {/* Mã giảm giá */}
                        <div className="border-t border-black/10 pt-3">
                            {applied ? (
                                <div className="flex items-center justify-between gap-2">
                                    <dt className="text-[#6b6b6b]">Giảm giá (<span className="font-mono">{applied.code}</span>)</dt>
                                    <dd className="flex items-center gap-2">
                                        <span className="text-[#1a1a1a]">−{formatPrice(discountAmount)}</span>
                                        <button type="button" onClick={removeDiscount} className="text-xs text-[#8a8a8a] underline hover:text-[#1a1a1a]">Bỏ</button>
                                    </dd>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={discountInput}
                                        onChange={(e) => setDiscountInput(e.target.value.toUpperCase())}
                                        placeholder="Mã giảm giá"
                                        className="min-w-0 flex-1 rounded-lg border border-black/15 bg-white px-3 py-2 text-sm uppercase outline-none focus:border-[#1a1a1a]"
                                    />
                                    <button
                                        type="button"
                                        onClick={applyDiscount}
                                        disabled={checkingDiscount || !discountInput.trim()}
                                        className="rounded-lg border border-[#1a1a1a] px-4 py-2 text-sm font-bold text-[#1a1a1a] transition hover:bg-[#1a1a1a] hover:text-[#f4f4f1] disabled:opacity-50"
                                    >
                                        {checkingDiscount ? "..." : "Áp dụng"}
                                    </button>
                                </div>
                            )}
                            {discountMsg && (
                                <p className={`mt-1.5 text-xs ${discountMsg.ok ? "text-green-700" : "text-red-600"}`}>{discountMsg.text}</p>
                            )}
                        </div>

                        <div className="flex justify-between"><dt className="text-[#6b6b6b]">Phí vận chuyển</dt><dd>{shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}</dd></div>
                        <div className="flex items-baseline justify-between border-t border-black/10 pt-3"><dt className="font-bold">Tổng cộng</dt><dd className="text-2xl font-extrabold text-[#1a1a1a]">{formatPrice(total)}</dd></div>
                    </dl>

                    {submitError && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{submitError}</p>}

                    <button disabled={submitting} type="submit" form="checkout-form" className="mt-5 w-full rounded-lg bg-[#1a1a1a] text-[#f4f4f1] py-3 text-sm font-bold uppercase tracking-wide transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60">
                        {submitting ? "Đang tạo đơn..." : "Đặt hàng"}
                    </button>
                    <Link to="/cart" className="mt-3 block text-center text-sm text-[#6b6b6b] transition hover:text-black">← Quay lại giỏ hàng</Link>
                </aside>
            </div>
        </section>
    );
}

// Đơn COD: sau bấy nhiêu giây thì tự đưa người dùng về trang chủ
const COD_REDIRECT_SECONDS = 5;

function OrderSuccess({ order }: { order: OrderCreated }) {
    const navigate = useNavigate();
    const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
    const [checking, setChecking] = useState(false);
    const [secondsLeft, setSecondsLeft] = useState(COD_REDIRECT_SECONDS);

    // Đếm ngược rồi chuyển về trang chủ (chỉ với đơn COD; đơn chuyển khoản cần ở lại để quét QR)
    useEffect(() => {
        if (order.payment !== "cod") return;
        if (secondsLeft <= 0) {
            navigate("/", { replace: true });
            return;
        }
        const timer = window.setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
        return () => window.clearTimeout(timer);
    }, [order.payment, secondsLeft, navigate]);

    useEffect(() => {
        if (order.payment !== "bank" || paymentStatus === "paid") return;

        const timer = window.setInterval(async () => {
            try {
                const current = await getOrderPaymentStatus(order.code);
                setPaymentStatus(current.paymentStatus);
            } catch {
                // Không làm gián đoạn màn hình thanh toán nếu lần kiểm tra này thất bại.
            }
        }, 5000);

        return () => window.clearInterval(timer);
    }, [order.code, order.payment, paymentStatus]);

    const checkNow = async () => {
        setChecking(true);
        try {
            const current = await getOrderPaymentStatus(order.code);
            setPaymentStatus(current.paymentStatus);
        } finally {
            setChecking(false);
        }
    };

    const copy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
        } catch {
            // clipboard có thể bị trình duyệt chặn.
        }
    };

    return (
        <section className="mx-auto max-w-2xl px-4 py-10 text-[#1a1a1a] md:py-14">
            <CheckoutSteps current={2} />
            <div className="rounded-2xl border border-black/10 bg-white p-6 text-center sm:p-8">
                <CheckCircle2 size={56} className="mx-auto text-green-700" />
                <h1 className="mt-4 text-2xl font-extrabold">Đặt hàng thành công</h1>
                <p className="mt-2 text-sm text-[#6b6b6b]">Mã đơn hàng</p>
                <p className="mt-1 text-2xl font-black tracking-widest text-[#1a1a1a]">{order.code}</p>
                <p className="mt-4 text-sm text-[#6b6b6b]">Tổng thanh toán: <strong className="text-[#1a1a1a]">{formatPrice(order.total)}</strong></p>

                {order.payment === "bank" && (
                    <div className="mt-6 rounded-xl border border-black/10 bg-[#f4f4f1] p-5 text-left">
                        <h2 className="text-lg font-extrabold text-center">Thanh toán bằng QR</h2>
                        {order.qrUrl ? (
                            <img src={order.qrUrl} alt="Mã QR thanh toán" className="mx-auto mt-4 h-64 w-64 rounded-lg bg-white object-contain p-2" />
                        ) : (
                            <p className="mt-4 text-center text-sm text-red-600">Shop chưa cấu hình tài khoản ngân hàng.</p>
                        )}

                        <div className="mt-5 space-y-2 text-sm">
                            <p><span className="text-[#6b6b6b]">Ngân hàng:</span> {order.bankName ?? "—"}</p>
                            <p><span className="text-[#6b6b6b]">Số tài khoản:</span> {order.accountNumber ?? "—"}</p>
                            <p><span className="text-[#6b6b6b]">Chủ tài khoản:</span> {order.accountName ?? "—"}</p>
                            <div className="flex items-center justify-between gap-2 rounded-lg border border-black/10 bg-white p-3">
                                <span><span className="block text-xs text-[#8a8a8a]">Nội dung chuyển khoản</span><strong className="text-[#1a1a1a]">{order.transferContent}</strong></span>
                                <button type="button" onClick={() => copy(order.transferContent)} className="rounded-lg p-2 text-[#3a3a3a] hover:bg-black/[0.06]" aria-label="Sao chép nội dung"><Copy size={17} /></button>
                            </div>
                        </div>

                        <div className="mt-5 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 text-xs text-yellow-200">
                            Chuyển đúng số tiền và giữ nguyên nội dung <strong>{order.transferContent}</strong>. Hệ thống sẽ tự cập nhật trạng thái khi webhook thanh toán được cấu hình.
                        </div>

                        <div className="mt-4 flex items-center justify-between rounded-lg bg-white p-3">
                            <span className="text-sm">Trạng thái: <strong className={paymentStatus === "paid" ? "text-green-700" : "text-yellow-400"}>{paymentStatus === "paid" ? "Đã thanh toán" : "Chờ thanh toán"}</strong></span>
                            <button type="button" onClick={checkNow} disabled={checking} className="inline-flex items-center gap-2 text-xs font-semibold text-[#3a3a3a] hover:text-black disabled:opacity-50">
                                <RefreshCw size={14} className={checking ? "animate-spin" : ""} /> Kiểm tra
                            </button>
                        </div>
                    </div>
                )}

                {order.payment === "cod" && (
                    <>
                        <p className="mx-auto mt-5 max-w-md text-sm text-[#6b6b6b]">
                            Cửa hàng sẽ liên hệ qua số điện thoại bạn cung cấp để xác nhận đơn hàng và giao hàng.
                            Vui lòng chuẩn bị <strong className="text-[#1a1a1a]">{formatPrice(order.total)}</strong> tiền mặt khi nhận hàng.
                        </p>
                        <p className="mt-4 text-sm text-[#8a8a8a]" aria-live="polite">
                            Tự động quay về trang chủ sau <strong className="text-[#1a1a1a]">{secondsLeft}</strong> giây…
                        </p>
                    </>
                )}

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link to="/products" className="rounded-lg bg-[#1a1a1a] text-[#f4f4f1] px-6 py-3 text-sm font-bold uppercase tracking-wide transition hover:bg-black">Tiếp tục mua sắm</Link>
                    <Link to="/" className="rounded-lg border border-black/10 px-6 py-3 text-sm font-semibold text-[#3a3a3a] transition hover:border-[#1a1a1a] hover:text-black">Về trang chủ</Link>
                </div>
            </div>
        </section>
    );
}
