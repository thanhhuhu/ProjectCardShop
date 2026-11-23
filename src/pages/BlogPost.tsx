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
                <div role="status" aria-label="Đang tải" className="h-9 w-9 animate-spin rounded-full border-4 border-white/20 border-t-red-600" />
            </div>
        );
    }

    const post = result.post;

    return (
        <article className="mx-auto max-w-3xl px-4 py-8 text-white md:py-12">
            <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-gray-400 transition hover:text-white">
                <ArrowLeft size={16} /> Tất cả bài viết
            </Link>

            {!post ? (
                <p className="mt-8 rounded-xl border border-white/10 bg-[#141414] p-10 text-center text-gray-400">{result.error}</p>
            ) : (
                <>
                    <header className="mt-6 border-b border-white/10 pb-6">
                        <span className="text-xs font-semibold uppercase tracking-wide text-red-400">{blogCategoryLabel(post.category)}</span>
                        <h1 className="mt-2 text-3xl font-extrabold leading-tight md:text-4xl">{post.title}</h1>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                            <p className="text-sm text-gray-500">{formatDateTime(post.createdAt)}{post.author && ` · ${post.author}`}</p>
                            {user?.role === "admin" && (
                                <button type="button" onClick={() => setConfirmDelete(true)} className="inline-flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-gray-300 transition hover:border-red-500 hover:text-red-400">
                                    <Trash2 size={14} /> Xóa bài
                                </button>
                            )}
                        </div>
                    </header>

                    {/* Nội dung dạng văn bản thường: dòng trống tách đoạn */}
                    <div className="mt-6 space-y-4 text-base leading-7 text-gray-200">
                        {post.content.split(/\n\s*\n/).map((paragraph, index) => (
                            <p key={index} className="whitespace-pre-line">{paragraph}</p>
                        ))}
                    </div>
                </>
            )}

            {confirmDelete && post && (
                <Modal title="Xóa bài viết" onClose={() => setConfirmDelete(false)}>
                    <p className="text-sm text-gray-300">Xóa bài <strong className="text-white">{post.title}</strong>? Không thể hoàn tác.</p>
                    {deleteError && <p className="mt-3 text-sm text-red-400">{deleteError}</p>}
                    <div className="mt-6 flex justify-end gap-2">
                        <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-gray-300 hover:text-white">Không</button>
                        <button type="button" disabled={deleting} onClick={handleDelete} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50">
                            {deleting ? "Đang xóa..." : "Xóa"}
                        </button>
                    </div>
                </Modal>
            )}
        </article>
    );
}
