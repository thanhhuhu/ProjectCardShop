import { useState } from "react";
import { Check, Star, Trash2, X } from "lucide-react";
import { useFetch } from "../hooks/useFetch";
import { deleteReview, listAdminReviews, setReviewStatus } from "../services/reviewApi";
import type { ReviewStatus } from "../services/reviewApi";
import { formatDateTime } from "../utils/orderStatus";

const TABS: { value: ReviewStatus | ""; label: string }[] = [
    { value: "pending", label: "Chờ duyệt" },
    { value: "approved", label: "Đã duyệt" },
    { value: "rejected", label: "Từ chối" },
    { value: "", label: "Tất cả" },
];

export default function AdminReviews() {
    const [tab, setTab] = useState<ReviewStatus | "">("pending");
    const [reloadKey, setReloadKey] = useState(0);
    const { data, loading } = useFetch(`admin-reviews-${tab}-${reloadKey}`, () => listAdminReviews(tab || undefined));
    const [busy, setBusy] = useState<number | null>(null);

    const act = async (fn: () => Promise<void>, id: number) => {
        setBusy(id);
        try {
            await fn();
            setReloadKey((k) => k + 1);
        } finally {
            setBusy(null);
        }
    };

    const reviews = data ?? [];

    return (
        <section className="mx-auto max-w-4xl px-4 py-8 text-[#1a1a1a] md:py-10">
            <h1 className="mb-6 border-l-4 border-[#1a1a1a] pl-3 text-xl font-extrabold uppercase md:text-2xl">Duyệt đánh giá</h1>

            <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
                {TABS.map((t) => (
                    <button
                        key={t.value || "all"}
                        type="button"
                        onClick={() => setTab(t.value)}
                        className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${tab === t.value ? "bg-[#1a1a1a] text-[#e9e6de]" : "bg-black/[0.04] text-[#3a3a3a] hover:bg-black/[0.06]"}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {loading && !data ? (
                <div className="flex min-h-[20vh] items-center justify-center">
                    <div role="status" aria-label="Đang tải" className="h-9 w-9 animate-spin rounded-full border-4 border-black/10 border-t-[#1a1a1a]" />
                </div>
            ) : reviews.length === 0 ? (
                <p className="rounded-xl border border-black/10 bg-[#f6f4ef] p-10 text-center text-sm text-[#6b6b6b]">Không có đánh giá nào.</p>
            ) : (
                <ul className="space-y-3">
                    {reviews.map((r) => (
                        <li key={r.id} className="rounded-xl border border-black/10 bg-[#f6f4ef] p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <p className="text-sm font-semibold">{r.productName}</p>
                                    <p className="text-xs text-[#8a8a8a]">{r.user} · {formatDateTime(r.createdAt)}</p>
                                </div>
                                <span className="inline-flex">
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <Star key={n} size={15} className={n <= r.rating ? "fill-[#1a1a1a] text-[#1a1a1a]" : "text-[#d0cec8]"} />
                                    ))}
                                </span>
                            </div>
                            {r.comment && <p className="mt-2 text-sm text-[#2a2a2a]">{r.comment}</p>}
                            <div className="mt-3 flex flex-wrap gap-2">
                                {r.status !== "approved" && (
                                    <button type="button" disabled={busy === r.id} onClick={() => act(() => setReviewStatus(r.id, "approved"), r.id)} className="inline-flex items-center gap-1 rounded-lg bg-[#1a1a1a] px-3 py-1.5 text-xs font-bold text-[#e9e6de] transition hover:bg-black disabled:opacity-50">
                                        <Check size={14} /> Duyệt
                                    </button>
                                )}
                                {r.status !== "rejected" && (
                                    <button type="button" disabled={busy === r.id} onClick={() => act(() => setReviewStatus(r.id, "rejected"), r.id)} className="inline-flex items-center gap-1 rounded-lg border border-black/15 px-3 py-1.5 text-xs font-semibold transition hover:border-red-400 hover:text-red-600 disabled:opacity-50">
                                        <X size={14} /> Từ chối
                                    </button>
                                )}
                                <button type="button" disabled={busy === r.id} onClick={() => act(() => deleteReview(r.id), r.id)} className="inline-flex items-center gap-1 rounded-lg border border-black/15 px-3 py-1.5 text-xs font-semibold text-[#8a8a8a] transition hover:border-red-400 hover:text-red-600 disabled:opacity-50">
                                    <Trash2 size={14} /> Xóa
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
