import { useState } from "react";

const categories = [
    { value: "yugioh", label: "Tin tức Yu-Gi-Oh!" },
    { value: "guide", label: "Hướng dẫn" },
    { value: "deck", label: "Deck & Chiến thuật" },
    { value: "shop", label: "Tin shop" },
];

export default function Blog() {
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("yugioh");
    const [content, setContent] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        console.log({
            title,
            category,
            content,
        });

        // Sau này sẽ gửi dữ liệu lên backend
    };

    return (
        <section className="mx-auto max-w-5xl px-4 py-8 text-white md:py-10">
            <div className="mb-8">
                <h1 className="border-l-4 border-red-600 pl-3 text-2xl font-extrabold uppercase">
                    Viết Blog
                </h1>
                <p className="mt-2 pl-4 text-sm text-gray-400">
                    Tạo bài viết mới cho L1ZY CARD SHOP
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="rounded-xl border border-white/10 bg-[#141414] p-6"
            >
                <div className="space-y-5">
                    <div>
                        <label
                            htmlFor="blog-title"
                            className="mb-2 block text-sm font-semibold text-gray-200"
                        >
                            Tiêu đề
                        </label>

                        <input
                            id="blog-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Nhập tiêu đề bài viết..."
                            className="w-full rounded-lg border border-white/15 bg-neutral-900 px-4 py-3 text-sm text-white outline-none focus:border-red-600"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="blog-category"
                            className="mb-2 block text-sm font-semibold text-gray-200"
                        >
                            Danh mục
                        </label>

                        <select
                            id="blog-category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full rounded-lg border border-white/15 bg-neutral-900 px-4 py-3 text-sm text-white outline-none focus:border-red-600"
                        >
                            {categories.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label
                            htmlFor="blog-content"
                            className="mb-2 block text-sm font-semibold text-gray-200"
                        >
                            Nội dung
                        </label>

                        <textarea
                            id="blog-content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Viết nội dung bài blog..."
                            rows={15}
                            className="w-full resize-y rounded-lg border border-white/15 bg-neutral-900 px-4 py-3 text-sm leading-6 text-white outline-none focus:border-red-600"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="rounded-lg bg-red-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-700"
                        >
                            Đăng bài
                        </button>
                    </div>
                </div>
            </form>
        </section>
    );
}