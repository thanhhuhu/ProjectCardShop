import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Check } from "lucide-react";
import {
    fetchCurrentUser,
    login as loginRequest,
    logout as logoutRequest,
    register as registerRequest,
} from "../services/authApi";
import type { AuthUser, LoginPayload, RegisterPayload } from "../services/authApi";
import { AuthContext } from "./authState";
import type { AuthContextValue } from "./authState";

interface Toast {
    id: number;
    message: string;
}

export default function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<Toast | null>(null);

    // Mở trang: hỏi server cookie đăng nhập còn hiệu lực không
    useEffect(() => {
        let cancelled = false;

        fetchCurrentUser()
            .then((current) => {
                if (!cancelled) setUser(current);
            })
            .catch(() => {
                // Server chưa chạy hoặc lỗi mạng: coi như chưa đăng nhập
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    // Tự ẩn thông báo sau 3 giây
    useEffect(() => {
        if (!toast) return;
        const timer = window.setTimeout(() => setToast(null), 3000);
        return () => window.clearTimeout(timer);
    }, [toast]);

    const notify = (message: string) => setToast({ id: Date.now(), message });

    const register = useCallback(async (payload: RegisterPayload) => {
        const created = await registerRequest(payload);
        setUser(created);
        setToast({ id: Date.now(), message: "Đăng ký thành công, bạn đã được đăng nhập" });
        return created;
    }, []);

    const login = useCallback(async (payload: LoginPayload) => {
        const current = await loginRequest(payload);
        setUser(current);
        setToast({ id: Date.now(), message: `Đăng nhập thành công. Xin chào, ${current.username}!` });
        return current;
    }, []);

    const logout = useCallback(async () => {
        try {
            await logoutRequest();
        } finally {
            // Dù server lỗi, phía trình duyệt vẫn coi như đã đăng xuất
            setUser(null);
            notify("Đã đăng xuất");
        }
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({ user, loading, register, login, logout }),
        [user, loading, register, login, logout],
    );

    return (
        <AuthContext.Provider value={value}>
            {children}

            {toast && (
                <div
                    key={toast.id}
                    role="status"
                    className="fixed right-4 top-4 z-[60] flex max-w-[calc(100vw_-_2rem)] items-center gap-3 rounded-lg border border-green-600/40 bg-neutral-900 px-4 py-3 text-sm text-white shadow-xl"
                >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-600">
                        <Check size={14} />
                    </span>
                    <span>{toast.message}</span>
                </div>
            )}
        </AuthContext.Provider>
    );
}