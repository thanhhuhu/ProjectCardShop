import { games } from "../data/game";
import cover from "../images/cover_page.png";
const heroBackground = [
    "repeating-linear-gradient(90deg, rgba(0,0,0,0.04) 0 3px, transparent 3px 72px)",
    "radial-gradient(ellipse at 50% 65%, #f6f4ef 0%, #e9e6de 38%, #e4e2dc 72%, #d2d0c9 100%)",
].join(", ");

export default function Hero() {
    return (
        <section
            className="relative overflow-hidden"
            style={{
                backgroundImage: heroBackground,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div className="mx-auto flex min-h-[440px] max-w-6xl flex-col items-center justify-center px-4 py-10 text-center md:min-h-[600px] md:py-16">
                <h1 className="w-full max-w-3xl">
                    <img
                        src={cover}
                        alt="L1zy Card Shop - Trading Card Game"
                        className="mx-auto h-auto w-full drop-shadow-xl"
                    />
                </h1>

                <h2 className="mt-8 text-2xl font-extrabold uppercase text-[#1a1a1a] drop-shadow-sm sm:text-3xl md:mt-12 md:text-5xl">
                    Chuyên các loại card game
                </h2>

                {/* Nút danh mục game */}
                <ul className="mt-5 flex max-w-3xl flex-wrap justify-center gap-2 sm:gap-3 md:mt-6 md:gap-4">
                    {games.map((game) => (
                        <li key={game.slug}>
                            <a
                                href={`/products?game=${game.slug}`}
                                className="block rounded-full bg-[#f6f4ef] px-4 py-2 text-xs font-bold uppercase tracking-wide text-[#8a8a8a] shadow-md transition duration-200 hover:bg-[#1a1a1a] hover:text-[#e9e6de] hover:shadow-xl focus-visible:bg-[#1a1a1a] focus-visible:text-[#e9e6de] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/40 active:scale-95 motion-safe:hover:-translate-y-1 sm:px-5 sm:text-sm md:px-7 md:py-3 md:text-base"
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