export interface AuthUser {
    id: number;
    username: string;
    email: string;
    role: "user" | "admin";
}

export interface RegisterPayload {
    username: string;
    email: string;
    password: string;
}

export interface LoginPayload {
    account: string; // tên tài khoản hoặc email
    password: string;
    remember: boolean;
}

// Lỗi trả về từ server, kèm lỗi theo từng ô (ví dụ { email: "Email này đã được sử dụng" })
export class ApiError extends Error {
    status: number;
    fieldErrors: Record<string, string>;

    constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.fieldErrors = fieldErrors;
    }
}

// Gọi qua "/api/..." để proxy của Vite chuyển tiếp sang server (xem vite.config.ts).
// Cùng một nguồn nên trình duyệt tự gửi kèm cookie đăng nhập.
export async function request<T>(url: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
    let response: Response;

    try {
        response = await fetch(url, {
            method: options.method ?? "GET",
            headers: options.body ? { "Content-Type": "application/json" } : undefined,
            body: options.body ? JSON.stringify(options.body) : undefined,
        });
    } catch {
        throw new ApiError("Không kết nối được máy chủ. Hãy kiểm tra server đã chạy chưa.", 0);
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new ApiError(data.message ?? `Có lỗi xảy ra (mã ${response.status})`, response.status, data.errors ?? {});
    }

    return data as T;
}

export async function register(payload: RegisterPayload): Promise<AuthUser> {
    const data = await request<{ user: AuthUser }>("/api/auth/register", { method: "POST", body: payload });
    return data.user;
}

export async function login(payload: LoginPayload): Promise<AuthUser> {
    const data = await request<{ user: AuthUser }>("/api/auth/login", { method: "POST", body: payload });
    return data.user;
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
    const data = await request<{ user: AuthUser | null }>("/api/auth/me");
    return data.user;
}

export async function logout(): Promise<void> {
    await request("/api/auth/logout", { method: "POST" });
}