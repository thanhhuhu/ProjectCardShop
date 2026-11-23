import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Newspaper, PenSquare } from "lucide-react";
import Pagination from "../components/Pagination";
import { useAuth } from "../context/useAuth";
import { blogCategoryLabel, listPosts } from "../services/blogApi";
import type { BlogListResponse } from "../services/blogApi";
import { formatDateTime } from "../utils/orderStatus";

// Trang danh sách bài viết (ai cũng xem được). Admin thấy thêm nút "Viết bài".
export default function Blog() {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const category = searchParams.get("category") ?? "";

    const requestKey = `${category}|${page}`;
    const [result, setResult] = useState<{ key: string; data: BlogListResponse | null; error: string } | null>(null);

    useEffect(() => {
        let ignore = false;
        listPosts({ page, category: category || undefined })
            .then((data) => {
                if (!ignore) setResult({ key: requestKey, data, error: "" });
            })
            .catch((err: unknown) => {
                if (!ignore) setResult({ key: requestKey, data: null, error: err instanceof Error ? err.message : "Không thể tải bài viết" });
            });
        return () => {
            ignore = true;
        };
    }, [page, category, requestKey]);

    const loading = result?.key !== requestKey;
    const data = loading ? null : (result?.data ?? null);
    const error = loading ? "" : (result?.error ?? "");

    const changePage = (next: number) => {
        const params = new URLSearchParams(searchParams);
        if (next > 1) params.set("page", String(next));
        else params.delete("page");
        setSearchParams(params);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <section className="mx-auto max-w-6xl px-4 py-8 text-[#1a1a1a] md:py-10">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="border-l-4 border-[#1a1a1a] pl-3 text-2xl font-extrabold uppercase">
                        {category ? blogCategoryLabel(category) : "Blog"}
                    </h1>
                    <p className="mt-2 pl-4 text-sm text-[#6b6b6b]">Tin tức và bài viết từ L1ZY CARD SHOP</p>
                </div>
                {user?.role === "admin" && (
                    <Link to="/admin/blog" className="inline-flex items-center gap-2 rounded-lg bg-[#1a1a1a] text-[#f4f4f1] px-4 py-2.5 text-sm font-bold transition hover:bg-black">
                        <PenSquare size={16} /> Viết bài
                    </Link>
                )}
            </div>

            {loading ? (
                <div className="flex min-h-[30vh] items-center justify-center">
                    <div role="status" aria-label="Đang tải" className="h-9 w-9 animate-spin rounded-full border-4 border-black/15 border-t-red-600" />
                </div>
            ) : error ? (
                <p className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">{error}</p>
            ) : !data || data.posts.length === 0 ? (
                <div className="rounded-xl border border-black/10 bg-white p-10 text-center">
                    <Newspaper size={48} className="mx-auto text-[#8a8a8a]" />
                    <p className="mt-3 text-sm text-[#6b6b6b]">Chưa có bài viết nào.</p>
                </div>
            ) : (
                <>
                    <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {data.posts.map((post) => (
                            <li key={post.id}>
                                <Link to={`/blog/${post.id}`} className="group flex h-full flex-col rounded-xl border border-black/10 bg-white p-5 transition hover:border-black/50">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-[#8a8a8a]">{blogCategoryLabel(post.category)}</span>
                                    <h2 className="mt-2 line-clamp-2 text-lg font-extrabold group-hover:text-[#1a1a1a]">{post.title}</h2>
                                    <p className="mt-2 line-clamp-4 flex-1 whitespace-pre-line text-sm text-[#6b6b6b]">{post.excerpt}</p>
                                    <p className="mt-4 text-xs text-[#8a8a8a]">{formatDateTime(post.createdAt)}{post.author && ` · ${post.author}`}</p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <Pagination page={data.page} totalPages={data.totalPages} onChange={changePage} />
                </>
            )}
        </section>
    );
}
