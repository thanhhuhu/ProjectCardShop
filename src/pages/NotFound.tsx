import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <section className="mx-auto max-w-6xl px-4 py-24 text-center text-[#1a1a1a]">
            <p className="text-6xl font-black text-[#1a1a1a]">404</p>
            <h1 className="mt-4 text-2xl font-extrabold">Không tìm thấy trang</h1>
            <Link
                to="/"
                className="mt-6 inline-block rounded-full border border-[#1a1a1a] px-6 py-2 text-sm font-bold uppercase text-[#1a1a1a] transition hover:bg-[#1a1a1a] hover:text-[#f4f4f1]"
            >
                Về trang chủ
            </Link>
        </section>
    );
}