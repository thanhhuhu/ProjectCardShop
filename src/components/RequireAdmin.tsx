import type { ReactNode } from "react";
import { useAuth } from "../context/useAuth";
import NotFound from "../pages/NotFound";

export default function RequireAdmin({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div
                    role="status"
                    aria-label="Đang tải"
                    className="h-9 w-9 animate-spin rounded-full border-4 border-white/20 border-t-red-600"
                />
            </div>
        );
    }

    if (user?.role !== "admin") return <NotFound />;

    return <>{children}</>;
}