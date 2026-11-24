import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "../services/authApi";
import { BLOG_CATEGORIES, createPost } from "../services/blogApi";
import type { BlogCategory } from "../services/blogApi";

type Field = "title" | "category" | "content";

const inputClass = (error?: string) =>
    `w-full rounded-lg border bg-[#f6f4ef] px-4 py-3 text-sm text-[#1a1a1a] outline-none placeholder:text-[#8a8a8a] focus:border-[#1a1a1a] ${error ? "border-red-400" : "border-black/10"}`;

// Trang viết blog: chỉ admin vào được (được bọc bởi <RequireAdmin> trong App.tsx)
export default function AdminBlog() {
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState<BlogCategory>(BLOG_CATEGORIES[0].value);
    const [content, setContent] = useState("");
    const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
    const [submitError, setSubmitError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const next: Partial<Record<Field, string>> = {};
        if (title.trim().length < 5) next.title = "Tiêu đề cần ít nhất 5 ký tự";
        if (content.trim().length < 20) next.content = "Nội dung cần ít nhất 20 ký tự";
        setErrors(next);
        if (Object.keys(next).length > 0) return;

        setSubmitting(true);
        setSubmitError("");
        try {
            const post = await createPost({ title: title.trim(), category, content: content.trim() });
            navigate(`/blog/${post.id}`);
        } catch (error) {
            if (error instanceof ApiError && Object.keys(error.fieldErrors).length > 0) {
                setErrors(error.fieldErrors as Partial<Record<Field, string>>);
            }
            setSubmitError(error instanceof Error ? error.message : "Không thể đăng bài");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="mx-auto max-w-5xl px-4 py-8 text-[#1a1a1a] md:py-10">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="border-l-4 border-[#1a1a1a] pl-3 text-2xl font-extrabold uppercase">Viết Blog</h1>
                    <p className="mt-2 pl-4 text-sm text-[#6b6b6b]">Tạo bài viết mới cho L1ZY CARD SHOP</p>
                </div>
                <Link to="/blog" className="text-sm text-[#6b6b6b] transition hover:text-black">Xem trang blog →</Link>
            </div>

            <form onSubmit={handleSubmit} noValidate className="rounded-xl border border-black/10 bg-[#f6f4ef] p-6">
                <div className="space-y-5">
                    <div>
                        <label htmlFor="blog-title" className="mb-2 block text-sm font-semibold text-[#2a2a2a]">Tiêu đề</label>
                        <input id="blog-title" type="text" value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} placeholder="Nhập tiêu đề bài viết..." aria-invalid={errors.title ? true : undefined} className={inputClass(errors.title)} />
                        {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
                    </div>

                    <div>
                        <label htmlFor="blog-category" className="mb-2 block text-sm font-semibold text-[#2a2a2a]">Danh mục</label>
                        <select id="blog-category" value={category} onChange={(e) => setCategory(e.target.value as BlogCategory)} className={inputClass(errors.category)}>
                            {BLOG_CATEGORIES.map((item) => (
                                <option key={item.value} value={item.value}>{item.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="blog-content" className="mb-2 block text-sm font-semibold text-[#2a2a2a]">Nội dung</label>
                        <textarea id="blog-content" value={content} onChange={(e) => setContent(e.target.value)} placeholder="Viết nội dung bài blog... (xuống dòng 2 lần để tách đoạn)" rows={15} aria-invalid={errors.content ? true : undefined} className={`${inputClass(errors.content)} resize-y leading-6`} />
                        {errors.content && <p className="mt-1 text-xs text-red-600">{errors.content}</p>}
                    </div>

                    {submitError && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{submitError}</p>}

                    <div className="flex justify-end">
                        <button type="submit" disabled={submitting} className="rounded-lg bg-[#1a1a1a] px-5 py-3 text-sm font-bold text-[#e9e6de] transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60">
                            {submitting ? "Đang đăng..." : "Đăng bài"}
                        </button>
                    </div>
                </div>
            </form>
        </section>
    );
}
