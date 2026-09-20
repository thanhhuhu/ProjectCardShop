import { useEffect, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Pencil, Search, Trash2, X } from "lucide-react";
import Pagination from "../components/Pagination";
import { useAuth } from "../context/useAuth";
import { ApiError } from "../services/authApi";
import { deleteUser, listUsers, updateUser } from "../services/adminApi";
import type { AdminUser, UserListResponse, UserRole } from "../services/adminApi";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const roleLabel: Record<UserRole, string> = {
    admin: "Quản trị viên",
    user: "Người dùng",
};

const keyOf = (query: string, page: number, reloadKey: number) => `${query}|${page}|${reloadKey}`;
const formatDate = (iso: string) => new Date(iso).toLocaleDateString("vi-VN");

function RoleBadge({ role }: { role: UserRole }) {
    return (
        <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                role === "admin" ? "bg-red-600/20 text-red-400" : "bg-white/10 text-gray-300"
            }`}
        >
            {roleLabel[role]}
        </span>
    );
}

/* ---------- Hộp thoại dùng chung ---------- */

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
    // Nhấn Esc để đóng
    useEffect(() => {
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onMouseDown={(event) => {
                // Bấm ra ngoài hộp thoại thì đóng
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className="w-full max-w-md rounded-2xl border border-white/10 bg-[#141414] p-6 shadow-2xl"
            >
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="text-lg font-extrabold text-white">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Đóng"
                        className="text-gray-400 transition hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

interface DialogFieldProps {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: "text" | "email" | "password";
    error?: string;
    hint?: string;
    autoFocus?: boolean;
    autoComplete?: string;
}

function DialogField({ id, label, value, onChange, type = "text", error, hint, autoFocus, autoComplete }: DialogFieldProps) {
    return (
        <div>
            <label htmlFor={id} className="mb-1 block text-sm font-semibold text-gray-200">
                {label}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                autoFocus={autoFocus}
                autoComplete={autoComplete}
                aria-invalid={error ? true : undefined}
                className={`w-full rounded-lg border bg-neutral-900 px-3 py-2.5 text-sm text-white outline-none transition focus:border-red-600 ${
                    error ? "border-red-500" : "border-white/15"
                }`}
            />
            {error ? (
                <p className="mt-1 text-xs text-red-400">{error}</p>
            ) : (
                hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>
            )}
        </div>
    );
}

/* ---------- Sửa người dùng ---------- */

interface EditUserDialogProps {
    user: AdminUser;
    isSelf: boolean;
    onClose: () => void;
    onSaved: (user: AdminUser) => void;
}

function EditUserDialog({ user, isSelf, onClose, onSaved }: EditUserDialogProps) {
    const [username, setUsername] = useState(user.username);
    const [email, setEmail] = useState(user.email);
    const [role, setRole] = useState<UserRole>(user.role);
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [message, setMessage] = useState("");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (saving) return;

        const next: Record<string, string> = {};
        if (username.trim().length < 3) next.username = "Tên tài khoản cần ít nhất 3 ký tự";
        if (!emailPattern.test(email.trim())) next.email = "Địa chỉ email không hợp lệ";
        if (password && password.length < 8) next.password = "Mật khẩu mới cần ít nhất 8 ký tự";
        setErrors(next);
        setMessage("");
        if (Object.keys(next).length > 0) return;

        setSaving(true);
        try {
            const updated = await updateUser(user.id, {
                username: username.trim(),
                email: email.trim(),
                role,
                ...(password ? { password } : {}),
            });
            onSaved(updated);
        } catch (error) {
            if (error instanceof ApiError) {
                setErrors(error.fieldErrors);
                if (Object.keys(error.fieldErrors).length === 0) setMessage(error.message);
            } else {
                setMessage("Đã có lỗi xảy ra. Vui lòng thử lại.");
            }
            setSaving(false);
        }
    };

    return (
        <Modal title={`Sửa tài khoản #${user.id}`} onClose={onClose}>
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <DialogField
                    id="edit-username"
                    label="Tên tài khoản"
                    value={username}
                    onChange={setUsername}
                    error={errors.username}
                    autoFocus
                    autoComplete="off"
                />
                <DialogField
                    id="edit-email"
                    label="Email"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    error={errors.email}
                    autoComplete="off"
                />

                <div>
                    <label htmlFor="edit-role" className="mb-1 block text-sm font-semibold text-gray-200">
                        Vai trò
                    </label>
                    <select
                        id="edit-role"
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        disabled={isSelf}
                        className="w-full rounded-lg border border-white/15 bg-neutral-900 px-3 py-2.5 text-sm text-white outline-none transition focus:border-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <option value="user">{roleLabel.user}</option>
                        <option value="admin">{roleLabel.admin}</option>
                    </select>
                    {isSelf && (
                        <p className="mt-1 text-xs text-gray-500">Bạn không thể tự đổi vai trò của chính mình.</p>
                    )}
                    {errors.role && <p className="mt-1 text-xs text-red-400">{errors.role}</p>}
                </div>

                <DialogField
                    id="edit-password"
                    label="Đặt lại mật khẩu"
                    type="password"
                    value={password}
                    onChange={setPassword}
                    error={errors.password}
                    hint="Bỏ trống nếu không muốn đổi mật khẩu."
                    autoComplete="new-password"
                />

                {message && (
                    <p role="alert" className="text-sm text-red-400">
                        {message}
                    </p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:border-white/40"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
                    >
                        {saving ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

/* ---------- Xác nhận xóa ---------- */

interface DeleteUserDialogProps {
    user: AdminUser;
    onClose: () => void;
    onDeleted: (user: AdminUser) => void;
}

function DeleteUserDialog({ user, onClose, onDeleted }: DeleteUserDialogProps) {
    const [deleting, setDeleting] = useState(false);
    const [message, setMessage] = useState("");

    const handleDelete = async () => {
        setDeleting(true);
        setMessage("");
        try {
            await deleteUser(user.id);
            onDeleted(user);
        } catch (error) {
            setMessage(error instanceof ApiError ? error.message : "Đã có lỗi xảy ra. Vui lòng thử lại.");
            setDeleting(false);
        }
    };

    return (
        <Modal title="Xóa tài khoản" onClose={onClose}>
            <p className="text-sm text-gray-300">
                Bạn sắp xóa tài khoản <strong className="text-white">{user.username}</strong> ({user.email}). Hành
                động này không thể hoàn tác.
            </p>

            {message && (
                <p role="alert" className="mt-3 text-sm text-red-400">
                    {message}
                </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:border-white/40"
                >
                    Hủy
                </button>
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
                >
                    {deleting ? "Đang xóa..." : "Xóa"}
                </button>
            </div>
        </Modal>
    );
}

/* ---------- Trang ---------- */

export default function AdminUsers() {
    const { user: me } = useAuth();

    const [searchInput, setSearchInput] = useState("");
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const [reloadKey, setReloadKey] = useState(0);
    const [result, setResult] = useState<{ key: string; data?: UserListResponse; error?: string } | null>(null);
    const [editing, setEditing] = useState<AdminUser | null>(null);
    const [deleting, setDeleting] = useState<AdminUser | null>(null);
    const [notice, setNotice] = useState("");

    // Đợi 0,3 giây sau khi ngừng gõ mới tìm, và quay về trang 1
    useEffect(() => {
        const timer = window.setTimeout(() => {
            setQuery(searchInput.trim());
            setPage(1);
        }, 300);
        return () => window.clearTimeout(timer);
    }, [searchInput]);

    // Tải danh sách mỗi khi từ khóa, trang hoặc "làm mới" thay đổi
    useEffect(() => {
        let cancelled = false;
        const key = keyOf(query, page, reloadKey);

        listUsers({ search: query, page })
            .then((data) => {
                if (!cancelled) setResult({ key, data });
            })
            .catch((error) => {
                if (!cancelled) {
                    setResult({
                        key,
                        error: error instanceof ApiError ? error.message : "Không tải được danh sách người dùng",
                    });
                }
            });

        return () => {
            cancelled = true;
        };
    }, [query, page, reloadKey]);

    // Tự ẩn thông báo sau 3 giây
    useEffect(() => {
        if (!notice) return;
        const timer = window.setTimeout(() => setNotice(""), 3000);
        return () => window.clearTimeout(timer);
    }, [notice]);

    const loading = result?.key !== keyOf(query, page, reloadKey);
    const data = result?.data;
    const users = data?.users ?? [];
    const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
    const rowCount = data?.pageSize ?? 10; // bảng luôn hiện đúng chừng này dòng

    const handleSaved = (updated: AdminUser) => {
        setEditing(null);
        setNotice(`Đã cập nhật tài khoản ${updated.username}`);
        setReloadKey((key) => key + 1);
    };

    const handleDeleted = (removed: AdminUser) => {
        setDeleting(null);
        setNotice(`Đã xóa tài khoản ${removed.username}`);
        // Xóa dòng cuối của trang cuối thì lùi về trang trước
        if (users.length === 1 && page > 1) setPage(page - 1);
        else setReloadKey((key) => key + 1);
    };

    return (
        <section className="mx-auto max-w-6xl px-4 py-8 text-white md:py-10">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="border-l-4 border-red-600 pl-3 text-xl font-extrabold uppercase md:text-2xl">
                        Quản lý người dùng
                    </h1>
                    <p className="mt-1 pl-4 text-sm text-gray-400">
                        {data ? `${data.total} tài khoản` : "Đang tải..."}
                    </p>
                </div>

                <div className="relative w-full sm:w-72">
                    <label htmlFor="user-search" className="sr-only">
                        Tìm người dùng
                    </label>
                    <Search
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        id="user-search"
                        type="search"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Tìm theo tên hoặc email..."
                        autoComplete="off"
                        className="w-full rounded-lg border border-white/15 bg-neutral-900 py-2.5 pl-9 pr-3 text-sm text-white outline-none transition focus:border-red-600"
                    />
                </div>
            </div>

            {/* Chỗ dành sẵn cho thông báo, để trang không bị dịch chuyển khi thông báo hiện ra */}
            <div className="mb-4 min-h-10">
                {notice && (
                    <p
                        role="status"
                        className="rounded-lg border border-green-600/40 bg-green-600/10 px-4 py-2 text-sm text-green-400"
                    >
                        {notice}
                    </p>
                )}
                {!notice && result?.error && (
                    <div role="alert" className="flex flex-wrap items-center gap-3 py-2 text-sm text-red-400">
                        <span>{result.error}</span>
                        <button
                            type="button"
                            onClick={() => setReloadKey((key) => key + 1)}
                            className="rounded-full border border-red-600 px-3 py-1 font-semibold transition hover:bg-red-600 hover:text-white"
                        >
                            Thử lại
                        </button>
                    </div>
                )}
            </div>

            {/* Bảng luôn cao đúng chừng ấy dòng (dòng còn thiếu được thêm dòng trống cho đủ),
                mỗi dòng cao cố định, nên chiều cao trang không đổi và footer đứng yên */}
            <div
                className={`relative overflow-x-auto rounded-xl border border-white/10 bg-[#141414] transition-opacity ${
                    loading ? "opacity-60" : ""
                }`}
            >
                <table className="w-full min-w-[820px] table-fixed text-left text-sm">
                    <colgroup>
                        <col className="w-16" />
                        <col className="w-[22%]" />
                        <col />
                        <col className="w-40" />
                        <col className="w-32" />
                        <col className="w-28" />
                    </colgroup>
                    <thead className="border-b border-white/10 text-xs uppercase text-gray-400">
                    <tr className="h-11">
                        <th className="px-4 font-semibold">ID</th>
                        <th className="px-4 font-semibold">Tên tài khoản</th>
                        <th className="px-4 font-semibold">Email</th>
                        <th className="px-4 font-semibold">Vai trò</th>
                        <th className="px-4 font-semibold">Ngày tạo</th>
                        <th className="px-4 text-right font-semibold">Thao tác</th>
                    </tr>
                    </thead>
                    <tbody>
                    {Array.from({ length: rowCount }, (_, index) => {
                        const u = users[index];

                        // Dòng trống giữ chỗ khi trang có ít hơn 10 người
                        if (!u) {
                            return (
                                <tr key={`empty-${index}`} aria-hidden="true" className="h-14 border-b border-white/5 last:border-0">
                                    <td colSpan={6} />
                                </tr>
                            );
                        }

                        const isSelf = u.id === me?.id;
                        return (
                            <tr key={u.id} className="h-14 border-b border-white/5 last:border-0 hover:bg-white/5">
                                <td className="px-4 text-gray-400">{u.id}</td>
                                <td className="truncate px-4 font-semibold text-white" title={u.username}>
                                    {u.username}
                                    {isSelf && (
                                        <span className="ml-2 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-normal text-gray-300">
                                                Bạn
                                            </span>
                                    )}
                                </td>
                                <td className="truncate px-4 text-gray-300" title={u.email}>
                                    {u.email}
                                </td>
                                <td className="px-4">
                                    <RoleBadge role={u.role} />
                                </td>
                                <td className="px-4 text-gray-400">{formatDate(u.createdAt)}</td>
                                <td className="px-4">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setEditing(u)}
                                            aria-label={`Sửa ${u.username}`}
                                            className="rounded-lg border border-white/15 p-2 text-gray-300 transition hover:border-white/40 hover:text-white"
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDeleting(u)}
                                            disabled={isSelf}
                                            aria-label={`Xóa ${u.username}`}
                                            title={isSelf ? "Bạn không thể xóa chính mình" : undefined}
                                            className="rounded-lg border border-white/15 p-2 text-gray-300 transition hover:border-red-600 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-white/15 disabled:hover:text-gray-300"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>

                {/* Thông báo nằm đè lên giữa phần thân bảng, không làm bảng đổi chiều cao */}
                {!loading && data && users.length === 0 && (
                    <p className="pointer-events-none absolute inset-x-0 bottom-0 top-11 flex items-center justify-center px-4 text-center text-sm text-gray-400">
                        {query ? `Không tìm thấy người dùng nào khớp với “${query}”.` : "Chưa có người dùng nào."}
                    </p>
                )}
                {loading && !data && (
                    <p className="pointer-events-none absolute inset-x-0 bottom-0 top-11 flex items-center justify-center text-sm text-gray-400">
                        Đang tải danh sách...
                    </p>
                )}
            </div>

            {/* Chỗ dành sẵn cho phân trang, kể cả khi chỉ có một trang */}
            <div className="min-h-20">
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>

            {editing && (
                <EditUserDialog
                    key={editing.id}
                    user={editing}
                    isSelf={editing.id === me?.id}
                    onClose={() => setEditing(null)}
                    onSaved={handleSaved}
                />
            )}
            {deleting && (
                <DeleteUserDialog
                    key={deleting.id}
                    user={deleting}
                    onClose={() => setDeleting(null)}
                    onDeleted={handleDeleted}
                />
            )}
        </section>
    );
}