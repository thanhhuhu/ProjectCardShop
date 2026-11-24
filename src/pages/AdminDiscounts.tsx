import { useState } from "react";
import type { FormEvent } from "react";
import { Trash2 } from "lucide-react";
import { useFetch } from "../hooks/useFetch";
import { createDiscount, deleteDiscount, listDiscounts, setDiscountActive } from "../services/discountApi";
import { ApiError } from "../services/authApi";
import type { DiscountType } from "../services/discountApi";
import { formatPrice } from "../utils/cart";

const inputClass = "w-full rounded-lg border border-black/15 bg-white px-3 py-2 text-sm outline-none focus:border-[#1a1a1a]";

export default function AdminDiscounts() {
    const [reloadKey, setReloadKey] = useState(0);
    const { data, loading } = useFetch(`admin-discounts-${reloadKey}`, () => listDiscounts());
    const discounts = data ?? [];
    const reload = () => setReloadKey((k) => k + 1);

    return (
        <section className="mx-auto max-w-4xl px-4 py-8 text-[#1a1a1a] md:py-10">
            <h1 className="mb-6 border-l-4 border-[#1a1a1a] pl-3 text-xl font-extrabold uppercase md:text-2xl">Mã giảm giá</h1>

            <CreateForm onCreated={reload} />

            {loading && !data ? (
                <div className="mt-6 flex min-h-[15vh] items-center justify-center">
                    <div role="status" aria-label="Đang tải" className="h-9 w-9 animate-spin rounded-full border-4 border-black/10 border-t-[#1a1a1a]" />
                </div>
            ) : discounts.length === 0 ? (
                <p className="mt-6 rounded-xl border border-black/10 bg-white p-8 text-center text-sm text-[#6b6b6b]">Chưa có mã nào.</p>
            ) : (
                <ul className="mt-6 space-y-2">
                    {discounts.map((d) => (
                        <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-black/10 bg-white p-4">
                            <div>
                                <p className="font-mono text-base font-bold">{d.code}</p>
                                <p className="text-xs text-[#6b6b6b]">
                                    Giảm {d.type === "percent" ? `${d.value}%` : formatPrice(d.value)}
                                    {d.minOrder > 0 && ` · đơn từ ${formatPrice(d.minOrder)}`}
                                    {` · đã dùng ${d.usedCount}${d.maxUses ? `/${d.maxUses}` : ""}`}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-1.5 text-xs text-[#6b6b6b]">
                                    <input type="checkbox" checked={d.active} onChange={(e) => setDiscountActive(d.id, e.target.checked).then(reload)} />
                                    {d.active ? "Đang bật" : "Đã tắt"}
                                </label>
                                <button type="button" onClick={() => deleteDiscount(d.id).then(reload)} aria-label="Xóa mã" className="rounded-lg border border-black/15 p-2 text-[#8a8a8a] transition hover:border-red-400 hover:text-red-600">
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

function CreateForm({ onCreated }: { onCreated: () => void }) {
    const [code, setCode] = useState("");
    const [type, setType] = useState<DiscountType>("percent");
    const [value, setValue] = useState("");
    const [minOrder, setMinOrder] = useState("");
    const [maxUses, setMaxUses] = useState("");
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrors({});
        setSaving(true);
        try {
            await createDiscount({
                code: code.trim().toUpperCase(),
                type,
                value: Number(value) || 0,
                minOrder: Number(minOrder) || 0,
                maxUses: maxUses.trim() ? Number(maxUses) : null,
            });
            setCode(""); setValue(""); setMinOrder(""); setMaxUses("");
            onCreated();
        } catch (err) {
            if (err instanceof ApiError && Object.keys(err.fieldErrors).length > 0) setErrors(err.fieldErrors);
            else setErrors({ code: err instanceof Error ? err.message : "Không tạo được mã" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={onSubmit} className="rounded-xl border border-black/10 bg-white p-5">
            <h2 className="mb-4 text-base font-bold">Tạo mã mới</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <label className="text-sm">Mã code
                    <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="VD: SALE10" className={`mt-1 ${inputClass}`} />
                    {errors.code && <span className="mt-1 block text-xs text-red-600">{errors.code}</span>}
                </label>
                <label className="text-sm">Loại giảm
                    <select value={type} onChange={(e) => setType(e.target.value as DiscountType)} className={`mt-1 ${inputClass}`}>
                        <option value="percent">Theo phần trăm (%)</option>
                        <option value="amount">Số tiền cố định (đ)</option>
                    </select>
                </label>
                <label className="text-sm">{type === "percent" ? "Phần trăm giảm" : "Số tiền giảm (đ)"}
                    <input type="number" value={value} onChange={(e) => setValue(e.target.value)} className={`mt-1 ${inputClass}`} />
                    {errors.value && <span className="mt-1 block text-xs text-red-600">{errors.value}</span>}
                </label>
                <label className="text-sm">Đơn tối thiểu (đ)
                    <input type="number" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} placeholder="0" className={`mt-1 ${inputClass}`} />
                </label>
                <label className="text-sm">Giới hạn lượt dùng
                    <input type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="Không giới hạn" className={`mt-1 ${inputClass}`} />
                </label>
            </div>
            <button type="submit" disabled={saving} className="mt-4 rounded-lg bg-[#1a1a1a] px-5 py-2.5 text-sm font-bold text-[#f4f4f1] transition hover:bg-black disabled:opacity-60">
                {saving ? "Đang tạo..." : "Tạo mã"}
            </button>
        </form>
    );
}
