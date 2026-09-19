import { useEffect, useState } from "react";
import logo from "../images/cover_page.png"; // đổi thành ảnh bạn muốn hiện phía trên vòng xoay

const SHOW_MS = 500; // thời gian hiện trang chờ
const FADE_MS = 300; // thời gian mờ dần khi biến mất

export default function Preloader() {
    const [phase, setPhase] = useState<"show" | "fade" | "done">("show");

    useEffect(() => {
        // Khóa cuộn trang trong lúc chờ
        document.body.style.overflow = "hidden";

        const fadeTimer = window.setTimeout(() => {
            document.body.style.overflow = ""; // mở khóa cuộn ngay khi bắt đầu mờ dần
            setPhase("fade");
        }, SHOW_MS);
        const doneTimer = window.setTimeout(() => setPhase("done"), SHOW_MS + FADE_MS);

        return () => {
            window.clearTimeout(fadeTimer);
            window.clearTimeout(doneTimer);
            document.body.style.overflow = "";
        };
    }, []);

    if (phase === "done") return null;

    return (
        <div
            role="status"
            aria-live="polite"
            className={`fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-black transition-opacity ${
                phase === "fade" ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
            style={{ transitionDuration: `${FADE_MS}ms` }}
        >
            <img
                src={logo}
                alt="Card Shop"
                className="h-20 w-auto max-w-[70vw] object-contain md:h-28"
            />
            <div className="h-9 w-9 animate-spin rounded-full border-4 border-white/20 border-t-red-600" />
            <span className="sr-only">Đang tải...</span>
        </div>
    );
}