import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import Modal from "../components/Modal";
import { useAuth } from "../context/useAuth";
import { blogCategoryLabel, deletePost, getPost } from "../services/blogApi";
import type { BlogPost as BlogPostData } from "../services/blogApi";
import { formatDateTime } from "../utils/orderStatus";

export default function BlogPost() {
    const { id } = useParams();
    const postId = Number(id);
    const navigate = useNavigate();
    const { user } = useAuth();

    const [result, setResult] = useState<{ id: number; post: BlogPostData | null; error: string } | null>(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    useEffect(() => {
        let ignore = false;
        getPost(postId)
            .then((post) => {
                if (!ignore) setResult({ id: postId, post, error: "" });
            })
            .catch((err: unknown) => {
                if (!ignore) setResult({ id: postId, post: null, error: err instanceof Error ? err.message : "Không tìm thấy bài viết" });
            });
        return () => {
            ignore = true;
        };
    }, [postId]);

    const handleDelete = async () => {
        setDeleting(true);
        setDeleteError("");
        try {
            await deletePost(postId);
            navigate("/blog", { replace: true });
        } catch (err) {
            setDeleteError(err instanceof Error ? err.message : "Không thể xóa bài viết");
            setDeleting(false);
        }
    };

    if (result?.id !== postId) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center">
                <div role="status" aria-label="Đang tải" className="h-9 w-9 animate-spin rounded-full border-4 border-black/15 border-t-red-600" />
            </div>
        );
    }

    const post = result.post;

    return (
        <article className="mx-auto max-w-3xl px-4 py-8 text-[#1a1a1a] md:py-12">
            <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-[#6b6b6b] transition hover:text-black">
                <ArrowLeft size={16} /> Tất cả bài viết
            </Link>

            {!post ? (
                <p className="mt-8 rounded-xl border border-black/10 bg-white p-10 text-center text-[#6b6b6b]">{result.error}</p>
            ) : (
                <>
                    <header className="mt-6 border-b border-black/10 pb-6">
                        <span className="text-xs font-semibold uppercase tracking-wide text-[#8a8a8a]">{blogCategoryLabel(post.category)}</span>
                        <h1 className="mt-2 text-3xl font-extrabold leading-tight md:text-4xl">{post.title}</h1>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm text-[#8a8a8a]">{formatDateTime(post.createdAt)}{post.author && ` · ${post.author}`}</p>
                            {user?.role === "admin" && (
                                <button type="button" onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-1 rounded-lg border border-black/10 px-3 py-1.5 text-xs font-semibold text-[#3a3a3a] transition hover:border-red-400 hover:text-red-700">
                                    <Trash2 size={14} /> Xóa bài
                                </button>
                            )}
                        </div>
                    </header>

                    {/* Nội dung dạng văn bản thường: dòng trống tách đoạn */}
                    <div className="mt-6 space-y-4 text-base leading-7 text-[#2a2a2a]">
                        {post.content.split(/\n\s*\n/).map((paragraph, index) => (
                            <p key={index} className="whitespace-pre-line">{paragraph}</p>
                        ))}
                    </div>
                </>
            )}

            {confirmDelete && post && (
                <Modal title="Xóa bài viết" onClose={() => setConfirmDelete(false)}>
                    <p className="text-sm text-[#3a3a3a]">Xóa bài <strong className="text-[#1a1a1a]">{post.title}</strong>? Không thể hoàn tác.</p>
                    {deleteError && <p className="mt-3 text-sm text-red-600">{deleteError}</p>}
                    <div className="mt-6 flex justify-end gap-2">
                        <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-lg border border-black/10 px-4 py-2 text-sm font-semibold text-[#3a3a3a] hover:text-black">Không</button>
                        <button type="button" disabled={deleting} onClick={handleDelete} className="rounded-lg bg-[#1a1a1a] px-4 py-2 text-sm font-bold text-[#f4f4f1] hover:bg-black disabled:opacity-50">
                            {deleting ? "Đang xóa..." : "Xóa"}
                        </button>
                    </div>
                </Modal>
            )}
        </article>
    );
}
