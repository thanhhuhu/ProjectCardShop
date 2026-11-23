import { request } from "./authApi";

// Hiện chỉ có một danh mục blog
export const BLOG_CATEGORIES = [{ value: "yugioh", label: "Tin tức Yu-Gi-Oh!" }] as const;
export type BlogCategory = (typeof BLOG_CATEGORIES)[number]["value"];

export const blogCategoryLabel = (value: string) =>
    BLOG_CATEGORIES.find((c) => c.value === value)?.label ?? value;

export interface BlogPostSummary {
    id: number;
    title: string;
    category: BlogCategory;
    author: string | null;
    createdAt: string;
    updatedAt: string;
    excerpt: string;
}

export interface BlogPost extends Omit<BlogPostSummary, "excerpt"> {
    content: string;
}

export interface BlogListResponse {
    posts: BlogPostSummary[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export function listPosts({ page, category }: { page: number; category?: string }) {
    const params = new URLSearchParams({ page: String(page) });
    if (category) params.set("category", category);
    return request<BlogListResponse>(`/api/blog?${params.toString()}`);
}

export async function getPost(id: number): Promise<BlogPost> {
    const data = await request<{ post: BlogPost }>(`/api/blog/${id}`);
    return data.post;
}

export async function createPost(payload: { title: string; category: BlogCategory; content: string }): Promise<BlogPost> {
    const data = await request<{ post: BlogPost }>("/api/blog", { method: "POST", body: payload });
    return data.post;
}

export async function deletePost(id: number): Promise<void> {
    await request(`/api/blog/${id}`, { method: "DELETE" });
}
