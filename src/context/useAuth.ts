import { useContext } from "react";
import { AuthContext } from "./authState";
import type { AuthContextValue } from "./authState";

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth phải được dùng bên trong <AuthProvider>");
    }
    return context;
}