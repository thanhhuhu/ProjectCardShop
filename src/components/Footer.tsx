import { Clock, Mail, MapPin, Phone } from "lucide-react";
import footerCover from "../images/footer.png"; // đổi tên file cho khớp với ảnh bạn muốn dùng làm cover

const footerLinks = [
    { label: "Về chúng tôi", href: "/about" },
    { label: "Cách thức mua hàng", href: "/how-to-buy" },
    { label: "Liên hệ", href: "/contact" },
];

// Thay bằng thông tin thật của cửa hàng
const contacts = [
    { icon: MapPin, text: "05 đường Phan Thành Tài, phường Hòa Cường, TP. Đà Nẵng", href: undefined },
    { icon: Phone, text: "0900 000 000", href: "tel:0900000000" },
    { icon: Mail, text: "contact@cardshop.vn", href: "mailto:contact@cardshop.vn" },
    { icon: Clock, text: "8:00 – 21:00 mỗi ngày", href: undefined },
];

export default function Footer() {
    return (
        <footer className="relative isolate text-gray-200">
            <img
                src={footerCover}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 -z-20 h-full w-full object-cover"
            />
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.55),rgba(0,0,0,0.9))]" />

            {/* Thông tin ở giữa */}
            <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 py-12 text-center md:py-20">
                <h2 className="text-2xl font-extrabold uppercase tracking-wide text-white drop-shadow md:text-4xl">
                    Lizy Card Shop
                </h2>
                <p className="max-w-xl text-sm text-gray-300 md:text-base">
                    Chuyên các loại card game và phụ kiện card game.
                </p>

                <nav aria-label="Liên kết chân trang">
                    <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                        {footerLinks.map((link) => (
                            <li key={link.label}>
                                <a
                                    href={link.href}
                                    className="text-xs font-semibold uppercase tracking-wider text-gray-300 transition hover:text-red-400 focus-visible:text-red-400"
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <ul className="flex flex-col items-center gap-2 text-sm text-gray-300 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-8">
                    {contacts.map(({ icon: Icon, text, href }) => (
                        <li key={text} className="flex items-center gap-2">
                            <Icon size={16} className="shrink-0 text-red-500" />
                            {href ? (
                                <a href={href} className="transition hover:text-white">
                                    {text}
                                </a>
                            ) : (
                                <span>{text}</span>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Dòng bản quyền */}
            <div className="border-t border-white/10 bg-black/60 px-4 py-4 text-center text-xs text-gray-400">
                Copyright {new Date().getFullYear()} © <strong className="text-gray-200">Lizy Card Shop</strong>
            </div>
        </footer>
    );
}