import { request } from "./authApi";

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface Review {
    id: number;
    productId: number;
    user: string;
    productName?: string;
    rating: number;
    comment: string;
    status: ReviewStatus;
    createdAt: string;
}

export interface ReviewSummary {
    average: number;
    count: number;
    reviews: Review[];
}

export function getReviews(productId: number): Promise<ReviewSummary> {
    return request<ReviewSummary>(`/api/reviews?productId=${productId}`);
}

export async function getMyReview(productId: number): Promise<Review | null> {
    const data = await request<{ review: Review | null }>(`/api/reviews/mine?productId=${productId}`);
    return data.review;
}

export function submitReview(payload: { productId: number; rating: number; comment: string }): Promise<{ ok: boolean; message: string }> {
    return request("/api/reviews", { method: "POST", body: payload });
}

// Admin
export async function listAdminReviews(status?: ReviewStatus): Promise<Review[]> {
    const q = status ? `?status=${status}` : "";
    const data = await request<{ reviews: Review[] }>(`/api/reviews/admin${q}`);
    return data.reviews;
}

export function setReviewStatus(id: number, status: ReviewStatus): Promise<void> {
    return request(`/api/reviews/admin/${id}`, { method: "PATCH", body: { status } });
}

export function deleteReview(id: number): Promise<void> {
    return request(`/api/reviews/admin/${id}`, { method: "DELETE" });
}
