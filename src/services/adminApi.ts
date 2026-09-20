import { request } from "./authApi";
import type { AuthUser } from "./authApi";

export type UserRole = AuthUser["role"];

export interface AdminUser {
    id: number;
    username: string;
    email: string;
    role: UserRole;
    createdAt: string;
}

export interface UserListResponse {
    users: AdminUser[];
    total: number;
    page: number;
    pageSize: number;
}

export interface UpdateUserPayload {
    username?: string;
    email?: string;
    role?: UserRole;
    password?: string; // đặt lại mật khẩu; bỏ qua nếu không đổi
}

export function listUsers({ search, page }: { search: string; page: number }): Promise<UserListResponse> {
    const params = new URLSearchParams({ page: String(page) });
    if (search) params.set("search", search);
    return request<UserListResponse>(`/api/admin/users?${params.toString()}`);
}

export async function updateUser(id: number, payload: UpdateUserPayload): Promise<AdminUser> {
    const data = await request<{ user: AdminUser }>(`/api/admin/users/${id}`, {
        method: "PATCH",
        body: payload,
    });
    return data.user;
}

export async function deleteUser(id: number): Promise<void> {
    await request(`/api/admin/users/${id}`, { method: "DELETE" });
}