import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <section className="mx-auto max-w-6xl px-4 py-24 text-center text-white">
            <p className="text-6xl font-black text-red-600">404</p>
            <h1 className="mt-4 text-2xl font-extrabold">Không tìm thấy trang</h1>
            <Link
                to="/"
                className="mt-6 inline-block rounded-full border border-red-600 px-6 py-2 text-sm font-bold uppercase text-red-500 transition hover:bg-red-600 hover:text-white"
            >
                Về trang chủ
            </Link>
        </section>
    );
}