import { useLayoutEffect, useRef, useState } from "react";
import type { FormEvent, ReactNode, Ref } from "react";
import { Link, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import leftCover from "../images/cover_page.png"; // ảnh cover bên trái
import rightCover from "../images/side_page.png"; // ảnh cover bên phải

type Errors = Record<string, string>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


function useHeight<T extends HTMLElement>() {
    const ref = useRef<T | null>(null);
    const [height, setHeight] = useState(0);

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;

        const update = () => setHeight(el.offsetHeight);
        update(); // đo trước khi trình duyệt vẽ để khung không bị nhấp nháy
        const observer = new ResizeObserver(update);
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return [ref, height] as const;
}

/* ---------- Ô nhập liệu (có nút hiện/ẩn khi là mật khẩu) ---------- */

interface FieldProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: "text" | "email" | "password";
    autoComplete?: string;
    error?: string;
}

function Field({ id, label, value, onChange, type = "text", autoComplete, error }: FieldProps) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    return (
        <div>
            <label htmlFor={id} className="mb-1 block text-sm font-semibold text-gray-200">
                {label} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
                <input
                    id={id}
                    type={isPassword && showPassword ? "text" : type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoComplete={autoComplete}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? `${id}-error` : undefined}
                    className={`w-full rounded-lg border bg-neutral-900 px-3 py-2.5 text-sm text-white outline-none transition focus:border-red-600 ${
                        isPassword ? "pr-11" : ""
                    } ${error ? "border-red-500" : "border-white/15"}`}
                />
                {isPassword && (
                    <button
                        type="button"
                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        onClick={() => setShowPassword((show) => !show)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 transition hover:text-white"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
            {/* Luôn chừa sẵn chỗ cho dòng lỗi để form không giãn ra khi báo lỗi */}
            <p id={`${id}-error`} className="min-h-5 pt-1 text-xs text-red-400">
                {error}
            </p>
        </div>
    );
}

function SubmitButton({ children }: { children: string }) {
    return (
        <div className="pt-3">
            <button
                type="submit"
                className="w-full rounded-lg bg-red-600 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:bg-red-700 active:scale-[0.99]"
            >
                {children}
            </button>
        </div>
    );
}

/* ---------- Form đăng nhập ---------- */

function LoginForm() {
    const [account, setAccount] = useState("");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [errors, setErrors] = useState<Errors>({});

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const next: Errors = {};
        if (!account.trim()) next.account = "Vui lòng nhập tên tài khoản hoặc email";
        if (!password) next.password = "Vui lòng nhập mật khẩu";
        setErrors(next);
        if (Object.keys(next).length > 0) return;

        // TODO: gọi authService.login(account, password, remember) khi làm xong backend
        console.log("Đăng nhập:", { account, remember });
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-1">
            <Field
                id="login-account"
                label="Tên tài khoản hoặc email"
                value={account}
                onChange={setAccount}
                autoComplete="username"
                error={errors.account}
            />
            <Field
                id="login-password"
                label="Mật khẩu"
                type="password"
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
                error={errors.password}
            />

            <div className="flex items-center justify-between gap-3 pt-1 text-sm">
                <label className="flex cursor-pointer items-center gap-2 text-gray-300">
                    <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className="h-4 w-4 accent-red-600"
                    />
                    Ghi nhớ mật khẩu
                </label>
                <Link to="/forgot-password" className="text-gray-400 transition hover:text-red-400">
                    Quên mật khẩu?
                </Link>
            </div>

            <SubmitButton>Đăng nhập</SubmitButton>

            <p className="pt-3 text-center text-sm text-gray-400">
                Chưa có tài khoản?{" "}
                <Link to="/register" className="font-semibold text-red-400 hover:text-red-300">
                    Đăng ký ngay
                </Link>
            </p>
        </form>
    );
}

/* ---------- Form đăng ký ---------- */

function RegisterForm() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [errors, setErrors] = useState<Errors>({});

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        const next: Errors = {};
        if (username.trim().length < 3) next.username = "Tên tài khoản cần ít nhất 3 ký tự";
        if (!emailPattern.test(email.trim())) next.email = "Địa chỉ email không hợp lệ";
        if (password.length < 8) next.password = "Mật khẩu cần ít nhất 8 ký tự";
        if (confirm !== password) next.confirm = "Mật khẩu nhập lại không khớp";
        setErrors(next);
        if (Object.keys(next).length > 0) return;

        // TODO: gọi authService.register(username, email, password) khi làm xong backend
        console.log("Đăng ký:", { username, email });
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="space-y-1">
            <Field
                id="register-username"
                label="Tên tài khoản"
                value={username}
                onChange={setUsername}
                autoComplete="username"
                error={errors.username}
            />
            <Field
                id="register-email"
                label="Địa chỉ email"
                type="email"
                value={email}
                onChange={setEmail}
                autoComplete="email"
                error={errors.email}
            />
            <Field
                id="register-password"
                label="Mật khẩu"
                type="password"
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
                error={errors.password}
            />
            <Field
                id="register-confirm"
                label="Nhập lại mật khẩu"
                type="password"
                value={confirm}
                onChange={setConfirm}
                autoComplete="new-password"
                error={errors.confirm}
            />

            <SubmitButton>Đăng ký</SubmitButton>

            <p className="pt-3 text-center text-sm text-gray-400">
                Đã có tài khoản?{" "}
                <Link to="/login" className="font-semibold text-red-400 hover:text-red-300">
                    Đăng nhập
                </Link>
            </p>
        </form>
    );
}

/* ---------- Ảnh cover hai bên (chỉ hiện trên màn hình lớn) ---------- */
// Ảnh có chiều cao cố định, không phụ thuộc chiều cao trang, nên khi form giãn ra
// ảnh không bị phóng to hay thu nhỏ theo.

function SidePanel({ src, side }: { src: string; side: "left" | "right" }) {
    return (
        <div className="relative hidden overflow-hidden lg:block" aria-hidden="true">
            <div className="absolute inset-x-0 top-0 h-[max(100vh,900px)]">
                <img src={src} alt="" className="h-full w-full object-cover" />
                <div
                    className={`absolute inset-0 ${
                        side === "left"
                            ? "bg-[linear-gradient(to_right,rgba(0,0,0,0.2),rgba(0,0,0,0.92))]"
                            : "bg-[linear-gradient(to_left,rgba(0,0,0,0.2),rgba(0,0,0,0.92))]"
                    }`}
                />
            </div>
        </div>
    );
}

/* ---------- Một "tấm" chứa tiêu đề + form, mờ dần và trượt khi chuyển ---------- */

interface FormPanelProps {
    active: boolean;
    exit: "left" | "right"; // hướng trượt ra khi không còn active
    contentRef: Ref<HTMLDivElement>;
    title: string;
    subtitle: string;
    children: ReactNode;
}

function FormPanel({ active, exit, contentRef, title, subtitle, children }: FormPanelProps) {
    return (
        <div
            aria-hidden={!active}
            // justify-center: form ngắn hơn (đăng nhập) được căn giữa trong khung. Muốn căn sát trên thì đổi thành justify-start
            className={`absolute inset-x-2 inset-y-0 flex flex-col justify-center transition-[opacity,transform,visibility] duration-300 ease-out motion-reduce:transition-none motion-reduce:translate-x-0 ${
                active
                    ? "visible translate-x-0 opacity-100"
                    : `pointer-events-none invisible opacity-0 ${
                        exit === "left" ? "-translate-x-6" : "translate-x-6"
                    }`
            }`}
        >
            {/* Đo chiều cao của phần nội dung thật, không phải khung đã bị kéo dài */}
            <div ref={contentRef} className="pb-1">
                <h1 className="text-2xl font-extrabold">{title}</h1>
                <p className="mb-6 mt-1 text-sm text-gray-400">{subtitle}</p>
                {children}
            </div>
        </div>
    );
}

/* ---------- Trang ---------- */
// Trang này là "layout route" (xem App.tsx) nên không bị tạo lại khi đổi giữa /login và /register.
// Nhờ vậy các hiệu ứng chuyển động mới chạy được.

export default function AuthPage() {
    const { pathname } = useLocation();
    const isLogin = !pathname.startsWith("/register");

    const [loginRef, loginHeight] = useHeight<HTMLDivElement>();
    const [registerRef, registerHeight] = useHeight<HTMLDivElement>();

    const tabClass = (active: boolean) =>
        `relative z-10 rounded-md py-2 text-center transition-colors duration-300 ${
            active ? "text-white" : "text-gray-400 hover:text-white"
        }`;

    return (
        <section className="grid min-h-[70vh] bg-black text-white lg:grid-cols-[1fr_minmax(0,30rem)_1fr]">
            <SidePanel src={leftCover} side="left" />

            {/* Form ở giữa: căn sát phía trên để khung chỉ giãn xuống dưới, không nhảy hai đầu */}
            <div className="flex items-start justify-center px-4 py-10 sm:py-14">
                <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#141414]/95 p-6 shadow-2xl sm:p-8">
                    {/* Thanh chuyển tab, có thanh đỏ trượt qua lại */}
                    <div className="relative mb-6 grid grid-cols-2 rounded-lg bg-neutral-900 p-1 text-sm font-bold uppercase tracking-wide">
                        <span
                            aria-hidden="true"
                            className={`absolute inset-y-1 left-1 w-[calc(50%_-_0.25rem)] rounded-md bg-red-600 transition-transform duration-300 ease-out motion-reduce:transition-none ${
                                isLogin ? "translate-x-0" : "translate-x-full"
                            }`}
                        />
                        <Link to="/login" aria-current={isLogin ? "page" : undefined} className={tabClass(isLogin)}>
                            Đăng nhập
                        </Link>
                        <Link
                            to="/register"
                            aria-current={!isLogin ? "page" : undefined}
                            className={tabClass(!isLogin)}
                        >
                            Đăng ký
                        </Link>
                    </div>

                    {/* Khung luôn cao bằng form cao nhất nên chiều cao trang không đổi, footer đứng yên */}
                    <div
                        className="relative -mx-2 overflow-hidden px-2"
                        style={{ height: Math.max(loginHeight, registerHeight) }}
                    >
                        <FormPanel
                            active={isLogin}
                            exit="left"
                            contentRef={loginRef}
                            title="Đăng nhập"
                            subtitle="Đăng nhập để theo dõi đơn hàng và lưu giỏ hàng của bạn."
                        >
                            <LoginForm />
                        </FormPanel>

                        <FormPanel
                            active={!isLogin}
                            exit="right"
                            contentRef={registerRef}
                            title="Tạo tài khoản"
                            subtitle="Đăng ký để mua thẻ bài nhanh hơn và nhận ưu đãi."
                        >
                            <RegisterForm />
                        </FormPanel>
                    </div>
                </div>
            </div>

            <SidePanel src={rightCover} side="right" />
        </section>
    );
}