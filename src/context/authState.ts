import { createContext } from "react";
import type { AuthUser, LoginPayload, RegisterPayload } from "../services/authApi";

export interface AuthContextValue {
    user: AuthUser | null;
    loading: boolean; // đang hỏi server xem đã đăng nhập chưa (lúc mới mở trang)
    register: (payload: RegisterPayload) => Promise<AuthUser>;
    login: (payload: LoginPayload) => Promise<AuthUser>;
    logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);