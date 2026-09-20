import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Link, Navigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import CheckoutSteps from "../components/CheckoutSteps";
import { useCart } from "../context/useCart";
import { formatPrice, getShippingFee } from "../utils/cart";

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

interface PlacedOrder {
    code: string;
    total: number;
    phone: string;
    payment: PaymentMethod;
}

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
    `w-full rounded-lg border bg-neutral-900 px-3 py-2.5 text-sm text-white outline-none transition focus:border-red-600 ${
        error ? "border-red-500" : "border-white/15"
    }`;

function Card({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="rounded-xl border border-white/10 bg-[#141414] p-4 sm:p-6">
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
            <label htmlFor={id} className="mb-1 block text-sm font-semibold text-gray-200">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                autoComplete={autoComplete}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? `${id}-error` : undefined}
                className={inputClass(error)}
            />
            {error && (
                <p id={`${id}-error`} className="mt-1 text-xs text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
}

const paymentOptions: { value: PaymentMethod; title: string; description: string }[] = [
    { value: "cod", title: "Thanh toán khi nhận hàng (COD)", description: "Trả tiền mặt khi shipper giao thẻ tới bạn." },
    { value: "bank", title: "Chuyển khoản ngân hàng", description: "Bạn sẽ nhận thông tin chuyển khoản khi cửa hàng xác nhận đơn." },
];

export default function Checkout() {
    const { items, subtotal, clearCart } = useCart();
    const [form, setForm] = useState<FormState>(initialForm);
    const [errors, setErrors] = useState<Errors>({});
    const [placed, setPlaced] = useState<PlacedOrder | null>(null);

    const shippingFee = getShippingFee(subtotal);
    const total = subtotal + shippingFee;

    const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const next: Errors = {};
        if (form.fullName.trim().length < 2) next.fullName = "Vui lòng nhập họ và tên";
        if (!phonePattern.test(form.phone.replace(/\s/g, ""))) next.phone = "Số điện thoại không hợp lệ";
        if (form.email.trim() && !emailPattern.test(form.email.trim())) next.email = "Địa chỉ email không hợp lệ";
        if (!form.city.trim()) next.city = "Vui lòng nhập tỉnh / thành phố";
        if (form.address.trim().length < 5) next.address = "Vui lòng nhập địa chỉ giao hàng cụ thể";
        setErrors(next);
        if (Object.keys(next).length > 0) return;

        // TODO: gửi đơn hàng lên backend (POST /api/orders) khi làm xong phần backend
        const code = `CS${Date.now().toString().slice(-8)}`;
        setPlaced({ code, total, phone: form.phone.trim(), payment: form.payment });
        clearCart();
        window.scrollTo({ top: 0 });
    };

    // Đặt hàng xong
    if (placed) {
        return (
            <section className="mx-auto max-w-2xl px-4 py-10 text-white md:py-14">
                <CheckoutSteps current={2} />
                <div className="rounded-2xl border border-white/10 bg-[#141414] p-8 text-center">
                    <CheckCircle2 size={56} className="mx-auto text-green-500" />
                    <h1 className="mt-4 text-2xl font-extrabold">Đặt hàng thành công</h1>
                    <p className="mt-2 text-sm text-gray-400">Mã đơn hàng của bạn</p>
                    <p className="mt-1 text-2xl font-black tracking-widest text-red-400">{placed.code}</p>
                    <p className="mx-auto mt-4 max-w-md text-sm text-gray-400">
                        Cửa hàng sẽ liên hệ qua số <strong className="text-white">{placed.phone}</strong> để xác
                        nhận đơn. Tổng thanh toán:{" "}
                        <strong className="text-white">{formatPrice(placed.total)}</strong>
                        {placed.payment === "bank"
                            ? ". Thông tin chuyển khoản sẽ được gửi cho bạn khi đơn được xác nhận."
                            : "."}
                    </p>
                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                        <Link
                            to="/products"
                            className="rounded-lg bg-red-600 px-6 py-3 text-sm font-bold uppercase tracking-wide transition hover:bg-red-700"
                        >
                            Tiếp tục mua sắm
                        </Link>
                        <Link
                            to="/"
                            className="rounded-lg border border-white/15 px-6 py-3 text-sm font-semibold text-gray-300 transition hover:border-red-600 hover:text-white"
                        >
                            Về trang chủ
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

    // Giỏ trống thì quay về trang giỏ hàng
    if (items.length === 0) return <Navigate to="/cart" replace />;

    return (
        <section className="mx-auto max-w-6xl px-4 py-8 text-white md:py-10">
            <CheckoutSteps current={1} />

            <h1 className="mb-6 border-l-4 border-red-600 pl-3 text-xl font-extrabold uppercase md:text-2xl">
                Thanh toán
            </h1>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
                {/* Thông tin giao hàng và phương thức thanh toán */}
                <form id="checkout-form" onSubmit={handleSubmit} noValidate className="space-y-6">
                    <Card title="Thông tin giao hàng">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <TextField
                                id="fullName"
                                label="Họ và tên"
                                required
                                value={form.fullName}
                                onChange={(v) => setField("fullName", v)}
                                autoComplete="name"
                                error={errors.fullName}
                            />
                            <TextField
                                id="phone"
                                label="Số điện thoại"
                                type="tel"
                                required
                                value={form.phone}
                                onChange={(v) => setField("phone", v)}
                                autoComplete="tel"
                                error={errors.phone}
                            />
                            <div className="sm:col-span-2">
                                <TextField
                                    id="email"
                                    label="Email (không bắt buộc)"
                                    type="email"
                                    value={form.email}
                                    onChange={(v) => setField("email", v)}
                                    autoComplete="email"
                                    error={errors.email}
                                />
                            </div>
                            <TextField
                                id="city"
                                label="Tỉnh / Thành phố"
                                required
                                value={form.city}
                                onChange={(v) => setField("city", v)}
                                autoComplete="address-level1"
                                error={errors.city}
                            />
                            <TextField
                                id="address"
                                label="Địa chỉ cụ thể"
                                required
                                value={form.address}
                                onChange={(v) => setField("address", v)}
                                autoComplete="street-address"
                                error={errors.address}
                            />
                            <div className="sm:col-span-2">
                                <label htmlFor="note" className="mb-1 block text-sm font-semibold text-gray-200">
                                    Ghi chú đơn hàng
                                </label>
                                <textarea
                                    id="note"
                                    rows={3}
                                    value={form.note}
                                    onChange={(e) => setField("note", e.target.value)}
                                    placeholder="Ví dụ: giao giờ hành chính, gọi trước khi giao..."
                                    className={`${inputClass()} resize-y placeholder:text-gray-500`}
                                />
                            </div>
                        </div>
                    </Card>

                    <Card title="Phương thức thanh toán">
                        <fieldset className="space-y-3">
                            <legend className="sr-only">Chọn phương thức thanh toán</legend>
                            {paymentOptions.map((option) => {
                                const selected = form.payment === option.value;
                                return (
                                    <label
                                        key={option.value}
                                        className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                                            selected
                                                ? "border-red-600 bg-red-600/10"
                                                : "border-white/15 hover:border-white/30"
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            value={option.value}
                                            checked={selected}
                                            onChange={() => setField("payment", option.value)}
                                            className="mt-1 h-4 w-4 accent-red-600"
                                        />
                                        <span>
                                            <span className="block text-sm font-semibold">{option.title}</span>
                                            <span className="block text-xs text-gray-400">{option.description}</span>
                                        </span>
                                    </label>
                                );
                            })}
                        </fieldset>
                    </Card>
                </form>

                {/* Tóm tắt đơn hàng */}
                <aside className="h-fit rounded-xl border border-white/10 bg-[#141414] p-5 lg:sticky lg:top-4">
                    <h2 className="mb-4 text-lg font-extrabold uppercase">Đơn hàng của bạn</h2>

                    <ul className="max-h-72 space-y-3 overflow-y-auto pr-1">
                        {items.map(({ product, quantity }) => (
                            <li key={product.id} className="flex items-center gap-3">
                                <div className="relative w-12 shrink-0">
                                    <img
                                        src={product.imageUrl}
                                        alt=""
                                        className="aspect-[63/88] w-full rounded object-cover"
                                    />
                                    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold">
                                        {quantity}
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-red-400">{product.code}</p>
                                    <p className="line-clamp-1 text-sm">{product.name}</p>
                                </div>
                                <span className="text-sm font-semibold">
                                    {formatPrice(product.price * quantity)}
                                </span>
                            </li>
                        ))}
                    </ul>

                    <dl className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm">
                        <div className="flex justify-between">
                            <dt className="text-gray-400">Tạm tính</dt>
                            <dd>{formatPrice(subtotal)}</dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-gray-400">Phí vận chuyển</dt>
                            <dd>{shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}</dd>
                        </div>
                        <div className="flex items-baseline justify-between border-t border-white/10 pt-3">
                            <dt className="font-bold">Tổng cộng</dt>
                            <dd className="text-2xl font-extrabold text-red-400">{formatPrice(total)}</dd>
                        </div>
                    </dl>

                    <button
                        type="submit"
                        form="checkout-form"
                        className="mt-5 w-full rounded-lg bg-red-600 py-3 text-sm font-bold uppercase tracking-wide transition hover:bg-red-700 active:scale-[0.99]"
                    >
                        Đặt hàng
                    </button>
                    <Link
                        to="/cart"
                        className="mt-3 block text-center text-sm text-gray-400 transition hover:text-white"
                    >
                        ← Quay lại giỏ hàng
                    </Link>
                </aside>
            </div>
        </section>
    );
}