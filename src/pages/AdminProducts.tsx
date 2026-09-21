import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { ImagePlus, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import { games } from "../data/game";
import { useFetch } from "../hooks/useFetch";
import { ApiError } from "../services/authApi";
import { createProduct, deleteProduct, updateProduct, uploadProductImage } from "../services/adminProductApi.ts";
import { listProducts } from "../services/productApi";
import type { Product } from "../types/product";
import { formatPrice } from "../utils/cart";

const PAGE_SIZE = 10;
const MAX_IMAGE_BYTES = 3 * 1024 * 1024; // khớp với giới hạn ở server
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const RARITIES = ["Common", "Rare", "Super Rare", "Ultra Rare", "Secret Rare", "Prismatic Secret Rare"];

// Bỏ mọi ký tự không phải số: "35.000" hay "35,000" đều thành 35000
const toNumber = (text: string) => Number(text.replace(/\D/g, ""));

/* ---------- Ô nhập trong hộp thoại ---------- */

interface FieldProps {
    id: string;
    label: string;
    children: ReactNode;
    error?: string;
    hint?: string;
}

function Field({ id, label, children, error, hint }: FieldProps) {
    return (
        <div>
            <label htmlFor={id} className="mb-1 block text-sm font-semibold text-gray-200">
                {label}
            </label>
            {children}
            {error ? (
                <p className="mt-1 text-xs text-red-400">{error}</p>
            ) : (
                hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>
            )}
        </div>
    );
}

const inputClass = (error?: string) =>
    `w-full rounded-lg border bg-neutral-900 px-3 py-2.5 text-sm text-white outline-none transition focus:border-red-600 ${
        error ? "border-red-500" : "border-white/15"
    }`;

/* ---------- Thêm / sửa thẻ (kèm tải ảnh) ---------- */

interface ProductFormDialogProps {
    product: Product | null; // null: thêm thẻ mới
    onClose: () => void;
    onSaved: (product: Product, created: boolean) => void;
}

function ProductFormDialog({ product, onClose, onSaved }: ProductFormDialogProps) {
    const [code, setCode] = useState(product?.code ?? "");
    const [name, setName] = useState(product?.name ?? "");
    const [rarity, setRarity] = useState(product?.rarity ?? "Common");
    const [game, setGame] = useState(product?.game ?? games[0]?.slug ?? "");
    const [price, setPrice] = useState(product ? String(product.price) : "");
    const [stock, setStock] = useState(product ? String(product.stock) : "0");
    const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [message, setMessage] = useState("");
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Nếu thẻ đang có game không nằm trong danh sách thì vẫn hiện để không mất dữ liệu
    const gameOptions = games.some((g) => g.slug === game) || !game ? games : [...games, { label: game, slug: game }];

    const setError = (field: string, text: string) => setErrors((current) => ({ ...current, [field]: text }));

    // Gõ lại vào một ô thì xóa thông báo lỗi của ô đó
    const onChangeOf = (field: string, setter: (value: string) => void) => (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        setter(e.target.value);
        if (errors[field]) setError(field, "");
    };

    const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = ""; // cho phép chọn lại đúng file vừa chọn
        if (!file) return;

        if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
            setError("imageUrl", "Chỉ nhận ảnh JPG, PNG hoặc WebP");
            return;
        }
        if (file.size > MAX_IMAGE_BYTES) {
            setError("imageUrl", "Ảnh quá lớn, tối đa 3 MB");
            return;
        }

        setError("imageUrl", "");
        setUploading(true);
        try {
            setImageUrl(await uploadProductImage(file));
        } catch (error) {
            setError("imageUrl", error instanceof ApiError ? error.message : "Tải ảnh lên thất bại");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (saving || uploading) return;

        const next: Record<string, string> = {};
        if (!code.trim()) next.code = "Vui lòng nhập mã thẻ";
        if (!name.trim()) next.name = "Vui lòng nhập tên thẻ";
        if (!rarity.trim()) next.rarity = "Vui lòng nhập độ hiếm";
        if (!game) next.game = "Vui lòng chọn game";
        if (!/\d/.test(price)) next.price = "Vui lòng nhập giá";
        if (!/\d/.test(stock)) next.stock = "Vui lòng nhập số lượng";
        setErrors(next);
        setMessage("");
        if (Object.keys(next).length > 0) return;

        const payload = {
            code: code.trim(),
            name: name.trim(),
            rarity: rarity.trim(),
            game,
            price: toNumber(price),
            stock: toNumber(stock),
            imageUrl,
        };

        setSaving(true);
        try {
            const saved = product ? await updateProduct(product.id, payload) : await createProduct(payload);
            onSaved(saved, product === null);
        } catch (error) {
            if (error instanceof ApiError) {
                setErrors(error.fieldErrors);
                if (Object.keys(error.fieldErrors).length === 0) setMessage(error.message);
            } else {
                setMessage("Đã có lỗi xảy ra. Vui lòng thử lại.");
            }
            setSaving(false);
        }
    };

    return (
        <Modal title={product ? `Sửa thẻ #${product.id}` : "Thêm thẻ mới"} onClose={onClose} wide>
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {/* Ảnh */}
                <div className="flex gap-4">
                    <div className="relative h-32 w-24 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-black">
                        {imageUrl ? (
                            <img src={imageUrl} alt="Ảnh thẻ" className="h-full w-full object-cover" />
                        ) : (
                            <div className="flex h-full items-center justify-center px-2 text-center text-xs text-gray-500">
                                Chưa có ảnh
                            </div>
                        )}
                        {uploading && (
                            <div
                                role="status"
                                className="absolute inset-0 flex items-center justify-center bg-black/70 text-xs text-white"
                            >
                                Đang tải...
                            </div>
                        )}
                    </div>

                    <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm font-semibold text-gray-200 transition focus-within:border-red-600 hover:border-white/40">
                                <ImagePlus size={16} />
                                {imageUrl ? "Đổi ảnh" : "Chọn ảnh"}
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleFile}
                                    disabled={uploading}
                                    aria-label="Chọn file ảnh"
                                    className="sr-only"
                                />
                            </label>
                            {imageUrl && (
                                <button
                                    type="button"
                                    onClick={() => setImageUrl("")}
                                    className="text-sm text-gray-400 transition hover:text-red-400"
                                >
                                    Bỏ ảnh
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-gray-500">
                            JPG, PNG hoặc WebP, tối đa 3 MB. Nên dùng ảnh dọc, tỉ lệ khoảng 63:88.
                        </p>
                        {errors.imageUrl && <p className="text-xs text-red-400">{errors.imageUrl}</p>}
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field id="product-code" label="Mã thẻ" error={errors.code}>
                        <input
                            id="product-code"
                            value={code}
                            onChange={onChangeOf("code", setCode)}
                            autoFocus
                            autoComplete="off"
                            className={inputClass(errors.code)}
                        />
                    </Field>
                    <Field id="product-rarity" label="Độ hiếm" error={errors.rarity}>
                        <input
                            id="product-rarity"
                            value={rarity}
                            onChange={onChangeOf("rarity", setRarity)}
                            list="rarity-options"
                            autoComplete="off"
                            className={inputClass(errors.rarity)}
                        />
                        <datalist id="rarity-options">
                            {RARITIES.map((r) => (
                                <option key={r} value={r} />
                            ))}
                        </datalist>
                    </Field>
                </div>

                <Field id="product-name" label="Tên thẻ" error={errors.name}>
                    <input
                        id="product-name"
                        value={name}
                        onChange={onChangeOf("name", setName)}
                        autoComplete="off"
                        className={inputClass(errors.name)}
                    />
                </Field>

                <div className="grid gap-4 sm:grid-cols-3">
                    <Field id="product-game" label="Game" error={errors.game}>
                        <select
                            id="product-game"
                            value={game}
                            onChange={onChangeOf("game", setGame)}
                            className={inputClass(errors.game)}
                        >
                            {gameOptions.map((g) => (
                                <option key={g.slug} value={g.slug}>
                                    {g.label}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field
                        id="product-price"
                        label="Giá (VND)"
                        error={errors.price}
                        hint={/\d/.test(price) ? formatPrice(toNumber(price)) : undefined}
                    >
                        <input
                            id="product-price"
                            value={price}
                            onChange={onChangeOf("price", setPrice)}
                            inputMode="numeric"
                            autoComplete="off"
                            className={inputClass(errors.price)}
                        />
                    </Field>
                    <Field id="product-stock" label="Số lượng kho" error={errors.stock}>
                        <input
                            id="product-stock"
                            value={stock}
                            onChange={onChangeOf("stock", setStock)}
                            inputMode="numeric"
                            autoComplete="off"
                            className={inputClass(errors.stock)}
                        />
                    </Field>
                </div>

                {message && (
                    <p role="alert" className="text-sm text-red-400">
                        {message}
                    </p>
                )}

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:border-white/40"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={saving || uploading}
                        className="rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
                    >
                        {saving ? "Đang lưu..." : product ? "Lưu thay đổi" : "Thêm thẻ"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

/* ---------- Xác nhận xóa ---------- */

interface DeleteProductDialogProps {
    product: Product;
    onClose: () => void;
    onDeleted: (product: Product) => void;
}

function DeleteProductDialog({ product, onClose, onDeleted }: DeleteProductDialogProps) {
    const [deleting, setDeleting] = useState(false);
    const [message, setMessage] = useState("");

    const handleDelete = async () => {
        setDeleting(true);
        setMessage("");
        try {
            await deleteProduct(product.id);
            onDeleted(product);
        } catch (error) {
            setMessage(error instanceof ApiError ? error.message : "Đã có lỗi xảy ra. Vui lòng thử lại.");
            setDeleting(false);
        }
    };

    return (
        <Modal title="Xóa thẻ" onClose={onClose}>
            <p className="text-sm text-gray-300">
                Bạn sắp xóa thẻ{" "}
                <strong className="text-white">
                    {product.code} – {product.name}
                </strong>{" "}
                ({product.rarity}). Ảnh do bạn tải lên của thẻ này cũng bị xóa. Hành động này không thể hoàn tác.
            </p>

            {message && (
                <p role="alert" className="mt-3 text-sm text-red-400">
                    {message}
                </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-gray-200 transition hover:border-white/40"
                >
                    Hủy
                </button>
                <button
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="rounded-lg bg-red-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
                >
                    {deleting ? "Đang xóa..." : "Xóa"}
                </button>
            </div>
        </Modal>
    );
}

/* ---------- Trang ---------- */

export default function AdminProducts() {
    const [searchInput, setSearchInput] = useState("");
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const [reloadKey, setReloadKey] = useState(0);
    const [form, setForm] = useState<{ product: Product | null } | null>(null);
    const [deleting, setDeleting] = useState<Product | null>(null);
    const [notice, setNotice] = useState("");

    // Đợi 0,3 giây sau khi ngừng gõ mới tìm, và quay về trang 1
    useEffect(() => {
        const timer = window.setTimeout(() => {
            setQuery(searchInput.trim());
            setPage(1);
        }, 300);
        return () => window.clearTimeout(timer);
    }, [searchInput]);

    // Tự ẩn thông báo sau 3 giây
    useEffect(() => {
        if (!notice) return;
        const timer = window.setTimeout(() => setNotice(""), 3000);
        return () => window.clearTimeout(timer);
    }, [notice]);

    const { data, loading, error } = useFetch(`admin-products|${query}|${page}|${reloadKey}`, () =>
        listProducts({ search: query, page, pageSize: PAGE_SIZE }),
    );

    const items = data?.products ?? [];
    const total = data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const reload = () => setReloadKey((key) => key + 1);

    const handleSaved = (saved: Product, created: boolean) => {
        setForm(null);
        setNotice(`${created ? "Đã thêm" : "Đã cập nhật"} thẻ ${saved.code} – ${saved.name}`);
        if (created) {
            // Thẻ mới nằm đầu danh sách "mới nhất", nên về trang 1 và bỏ bộ lọc tìm kiếm để thấy nó
            setSearchInput("");
            setQuery("");
            setPage(1);
        }
        reload();
    };

    const handleDeleted = (removed: Product) => {
        setDeleting(null);
        setNotice(`Đã xóa thẻ ${removed.code} – ${removed.name}`);
        // Xóa dòng cuối của trang cuối thì lùi về trang trước
        if (items.length === 1 && page > 1) setPage(page - 1);
        else reload();
    };

    return (
        <section className="mx-auto max-w-6xl px-4 py-8 text-white md:py-10">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="border-l-4 border-red-600 pl-3 text-xl font-extrabold uppercase md:text-2xl">
                        Quản lý sản phẩm
                    </h1>
                    <p className="mt-1 pl-4 text-sm text-gray-400">{data ? `${total} thẻ` : "Đang tải..."}</p>
                </div>

                <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
                    <div className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
                        <label htmlFor="product-search" className="sr-only">
                            Tìm sản phẩm
                        </label>
                        <Search
                            size={16}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            id="product-search"
                            type="search"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="Tìm theo tên hoặc mã..."
                            autoComplete="off"
                            className="w-full rounded-lg border border-white/15 bg-neutral-900 py-2.5 pl-9 pr-3 text-sm text-white outline-none transition focus:border-red-600"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => setForm({ product: null })}
                        className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
                    >
                        <Plus size={16} />
                        Thêm thẻ
                    </button>
                </div>
            </div>

            {/* Chỗ dành sẵn cho thông báo, để trang không bị dịch chuyển khi thông báo hiện ra */}
            <div className="mb-4 min-h-10">
                {notice && (
                    <p
                        role="status"
                        className="rounded-lg border border-green-600/40 bg-green-600/10 px-4 py-2 text-sm text-green-400"
                    >
                        {notice}
                    </p>
                )}
                {!notice && error && (
                    <div role="alert" className="flex flex-wrap items-center gap-3 py-2 text-sm text-red-400">
                        <span>{error}</span>
                        <button
                            type="button"
                            onClick={reload}
                            className="rounded-full border border-red-600 px-3 py-1 font-semibold transition hover:bg-red-600 hover:text-white"
                        >
                            Thử lại
                        </button>
                    </div>
                )}
            </div>

            {/* Bảng luôn cao đúng 10 dòng, mỗi dòng cao cố định, nên chiều cao trang không đổi và footer đứng yên */}
            <div
                className={`relative overflow-x-auto rounded-xl border border-white/10 bg-[#141414] transition-opacity ${
                    loading ? "opacity-60" : ""
                }`}
            >
                <table className="w-full min-w-[960px] table-fixed text-left text-sm">
                    <colgroup>
                        <col className="w-20" />
                        <col className="w-32" />
                        <col />
                        <col className="w-36" />
                        <col className="w-28" />
                        <col className="w-28" />
                        <col className="w-20" />
                        <col className="w-28" />
                    </colgroup>
                    <thead className="border-b border-white/10 text-xs uppercase text-gray-400">
                    <tr className="h-11">
                        <th className="px-4 font-semibold">Ảnh</th>
                        <th className="px-4 font-semibold">Mã thẻ</th>
                        <th className="px-4 font-semibold">Tên</th>
                        <th className="px-4 font-semibold">Độ hiếm</th>
                        <th className="px-4 font-semibold">Game</th>
                        <th className="px-4 font-semibold">Giá</th>
                        <th className="px-4 font-semibold">Kho</th>
                        <th className="px-4 text-right font-semibold">Thao tác</th>
                    </tr>
                    </thead>
                    <tbody>
                    {Array.from({ length: PAGE_SIZE }, (_, index) => {
                        const p = items[index];

                        // Dòng trống giữ chỗ khi trang có ít hơn 10 thẻ
                        if (!p) {
                            return (
                                <tr
                                    key={`empty-${index}`}
                                    aria-hidden="true"
                                    className="h-16 border-b border-white/5 last:border-0"
                                >
                                    <td colSpan={8} />
                                </tr>
                            );
                        }

                        return (
                            <tr key={p.id} className="h-16 border-b border-white/5 last:border-0 hover:bg-white/5">
                                <td className="px-4">
                                    <div className="relative h-12 w-9 overflow-hidden rounded bg-neutral-800">
                                        {p.imageUrl && (
                                            <img
                                                src={p.imageUrl}
                                                alt=""
                                                loading="lazy"
                                                className="absolute inset-0 h-full w-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.style.visibility = "hidden";
                                                }}
                                            />
                                        )}
                                    </div>
                                </td>
                                <td className="truncate px-4 font-semibold text-red-400" title={p.code}>
                                    {p.code}
                                </td>
                                <td className="truncate px-4 text-white" title={p.name}>
                                    {p.name}
                                </td>
                                <td className="truncate px-4 text-gray-300" title={p.rarity}>
                                    {p.rarity}
                                </td>
                                <td className="truncate px-4 text-gray-400">{p.game}</td>
                                <td className="px-4 text-gray-200">{formatPrice(p.price)}</td>
                                <td className={`px-4 ${p.stock === 0 ? "font-semibold text-red-400" : "text-gray-300"}`}>
                                    {p.stock}
                                </td>
                                <td className="px-4">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setForm({ product: p })}
                                            aria-label={`Sửa ${p.code} ${p.name}`}
                                            className="rounded-lg border border-white/15 p-2 text-gray-300 transition hover:border-white/40 hover:text-white"
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setDeleting(p)}
                                            aria-label={`Xóa ${p.code} ${p.name}`}
                                            className="rounded-lg border border-white/15 p-2 text-gray-300 transition hover:border-red-600 hover:text-red-400"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                    </tbody>
                </table>

                {/* Thông báo nằm đè lên giữa phần thân bảng, không làm bảng đổi chiều cao */}
                {!loading && data && items.length === 0 && (
                    <p className="pointer-events-none absolute inset-x-0 bottom-0 top-11 flex items-center justify-center px-4 text-center text-sm text-gray-400">
                        {query ? `Không tìm thấy thẻ nào khớp với “${query}”.` : "Chưa có sản phẩm nào. Bấm “Thêm thẻ” để tạo."}
                    </p>
                )}
                {!data && !error && (
                    <p className="pointer-events-none absolute inset-x-0 bottom-0 top-11 flex items-center justify-center text-sm text-gray-400">
                        Đang tải danh sách...
                    </p>
                )}
            </div>

            {/* Chỗ dành sẵn cho phân trang, kể cả khi chỉ có một trang */}
            <div className="min-h-20">
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>

            {form && (
                <ProductFormDialog
                    key={form.product?.id ?? "new"}
                    product={form.product}
                    onClose={() => setForm(null)}
                    onSaved={handleSaved}
                />
            )}
            {deleting && (
                <DeleteProductDialog
                    key={deleting.id}
                    product={deleting}
                    onClose={() => setDeleting(null)}
                    onDeleted={handleDeleted}
                />
            )}
        </section>
    );
}