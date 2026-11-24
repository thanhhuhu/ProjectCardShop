import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useFetch } from "../hooks/useFetch";
import { ApiError, changePassword, getProfile, updateProfile } from "../services/authApi";

const inputClass = "w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1a1a1a]";

export default function Profile() {
    const { user, loading: authLoading } = useAuth();
    const { data: profile, loading } = useFetch(user ? "profile" : "profile-none", () =>
        user ? getProfile() : Promise.resolve(null),
    );

    if (authLoading || (user && loading)) {
        return (
            <section className="mx-auto max-w-2xl px-4 py-16 text-center">
                <div role="status" aria-label="Đang tải" className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-black/10 border-t-[#1a1a1a]" />
            </section>
        );
    }

    if (!user || !profile) {
        return (
            <section className="mx-auto max-w-lg px-4 py-16 text-center text-[#1a1a1a]">
                <h1 className="text-2xl font-extrabold">Hồ sơ</h1>
                <p className="mt-2 text-sm text-[#6b6b6b]">Vui lòng đăng nhập để xem hồ sơ.</p>
                <Link to="/login" className="mt-6 inline-block rounded-lg bg-[#1a1a1a] px-6 py-3 text-sm font-bold uppercase text-[#f4f4f1] transition hover:bg-black">Đăng nhập</Link>
            </section>
        );
    }

    return (
        <section className="mx-auto max-w-2xl px-4 py-8 text-[#1a1a1a] md:py-10">
            <h1 className="mb-6 border-l-4 border-[#1a1a1a] pl-3 text-xl font-extrabold uppercase md:text-2xl">Hồ sơ của tôi</h1>
            <div className="space-y-6">
                <AccountInfo username={profile.username} email={profile.email} />
                <ProfileForm initial={profile} />
                <PasswordForm />
            </div>
        </section>
    );
}

function AccountInfo({ username, email }: { username: string; email: string }) {
    return (
        <div className="rounded-xl border border-black/10 bg-[#f4f4f1] p-5 text-sm">
            <p><span className="text-[#6b6b6b]">Tài khoản:</span> <strong>{username}</strong></p>
            <p className="mt-1"><span className="text-[#6b6b6b]">Email:</span> {email}</p>
        </div>
    );
}

function ProfileForm({ initial }: { initial: { fullName: string; phone: string; city: string; address: string } }) {
    const [fullName, setFullName] = useState(initial.fullName);
    const [phone, setPhone] = useState(initial.phone);
    const [city, setCity] = useState(initial.city);
    const [address, setAddress] = useState(initial.address);
    const [saving, setSaving] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState("");

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setDone(false);
        setError("");
        try {
            await updateProfile({ fullName: fullName.trim(), phone: phone.trim(), city: city.trim(), address: address.trim() });
            setDone(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Không lưu được");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={onSubmit} className="rounded-xl border border-black/10 bg-white p-5">
            <h2 className="text-base font-bold">Thông tin giao hàng</h2>
            <p className="mb-4 text-xs text-[#6b6b6b]">Lưu sẵn để lần sau thanh toán nhanh hơn.</p>
            <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm">Họ và tên
                    <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={`mt-1 ${inputClass}`} />
                </label>
                <label className="text-sm">Số điện thoại
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} className={`mt-1 ${inputClass}`} />
                </label>
                <label className="text-sm">Tỉnh / Thành phố
                    <input value={city} onChange={(e) => setCity(e.target.value)} className={`mt-1 ${inputClass}`} />
                </label>
                <label className="text-sm">Địa chỉ cụ thể
                    <input value={address} onChange={(e) => setAddress(e.target.value)} className={`mt-1 ${inputClass}`} />
                </label>
            </div>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            {done && <p className="mt-3 text-sm text-green-700">Đã lưu thông tin.</p>}
            <button type="submit" disabled={saving} className="mt-4 rounded-lg bg-[#1a1a1a] px-5 py-2.5 text-sm font-bold text-[#f4f4f1] transition hover:bg-black disabled:opacity-60">
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
        </form>
    );
}

function PasswordForm() {
    const [current, setCurrent] = useState("");
    const [next, setNext] = useState("");
    const [confirm, setConfirm] = useState("");
    const [saving, setSaving] = useState(false);
    const [done, setDone] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setDone(false);
        const local: Record<string, string> = {};
        if (next.length < 8) local.newPassword = "Mật khẩu mới cần ít nhất 8 ký tự";
        if (next !== confirm) local.confirm = "Mật khẩu nhập lại không khớp";
        setErrors(local);
        if (Object.keys(local).length > 0) return;

        setSaving(true);
        try {
            await changePassword(current, next);
            setDone(true);
            setCurrent(""); setNext(""); setConfirm("");
            setErrors({});
        } catch (err) {
            if (err instanceof ApiError && Object.keys(err.fieldErrors).length > 0) setErrors(err.fieldErrors);
            else setErrors({ newPassword: err instanceof Error ? err.message : "Không đổi được mật khẩu" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={onSubmit} className="rounded-xl border border-black/10 bg-white p-5">
            <h2 className="mb-4 text-base font-bold">Đổi mật khẩu</h2>
            <div className="space-y-3">
                <label className="block text-sm">Mật khẩu hiện tại
                    <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} className={`mt-1 ${inputClass}`} />
                    {errors.currentPassword && <span className="mt-1 block text-xs text-red-600">{errors.currentPassword}</span>}
                </label>
                <label className="block text-sm">Mật khẩu mới
                    <input type="password" value={next} onChange={(e) => setNext(e.target.value)} className={`mt-1 ${inputClass}`} />
                    {errors.newPassword && <span className="mt-1 block text-xs text-red-600">{errors.newPassword}</span>}
                </label>
                <label className="block text-sm">Nhập lại mật khẩu mới
                    <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={`mt-1 ${inputClass}`} />
                    {errors.confirm && <span className="mt-1 block text-xs text-red-600">{errors.confirm}</span>}
                </label>
            </div>
            {done && <p className="mt-3 text-sm text-green-700">Đổi mật khẩu thành công.</p>}
            <button type="submit" disabled={saving} className="mt-4 rounded-lg bg-[#1a1a1a] px-5 py-2.5 text-sm font-bold text-[#f4f4f1] transition hover:bg-black disabled:opacity-60">
                {saving ? "Đang đổi..." : "Đổi mật khẩu"}
            </button>
        </form>
    );
}
