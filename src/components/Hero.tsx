import { games } from "../data/game";
import cover from "../images/cover_page.png";

export default function Hero() {
    return (
        <section className="relative isolate overflow-hidden">
            {/* Ảnh cover tràn toàn bộ nền hero */}
            <img
                src={cover}
                alt="L1zy Card Shop - Trading Card Game"
                className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
            />
            {/* Lớp phủ tối (đậm dần xuống dưới) để chữ trắng đọc rõ trên ảnh */}
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.25)_0%,rgba(0,0,0,0.3)_45%,rgba(0,0,0,0.78)_100%)]" />

            {/* Chữ đè lên ảnh, dồn xuống nửa dưới để không chồng logo LIZY ở giữa ảnh */}
            <div className="mx-auto flex min-h-[460px] max-w-6xl flex-col items-center justify-end px-4 pb-10 pt-40 text-center md:min-h-[640px] md:pb-16 md:pt-56">
                <h2 className="text-3xl font-extrabold uppercase text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)] sm:text-4xl md:text-6xl">
                    Chuyên các loại card game
                </h2>

                {/* Nút danh mục game */}
                <ul className="mt-6 flex max-w-3xl flex-wrap justify-center gap-2 sm:gap-3 md:mt-8 md:gap-4">
                    {games.map((game) => (
                        <li key={game.slug}>
                            <a
                                href={`/products?game=${game.slug}`}
                                className="block rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#3a3a3a] shadow-md transition duration-200 hover:bg-[#1a1a1a] hover:text-[#f4f4f1] hover:shadow-xl focus-visible:bg-[#1a1a1a] focus-visible:text-[#f4f4f1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:scale-95 motion-safe:hover:-translate-y-1 sm:px-5 sm:text-sm md:px-7 md:py-3 md:text-base"
                            >
                                {game.label}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
