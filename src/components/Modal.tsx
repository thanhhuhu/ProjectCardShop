import { useEffect } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
    title: string;
    onClose: () => void;
    children: ReactNode;
    wide?: boolean;
}

// Hộp thoại dùng chung: nhấn Esc hoặc bấm ra ngoài để đóng
export default function Modal({ title, onClose, children, wide = false }: ModalProps) {
    useEffect(() => {
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex overflow-y-auto bg-black/70 p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            {/* m-auto: căn giữa khi thấp, và cuộn được khi cao hơn màn hình */}
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className={`m-auto w-full rounded-2xl border border-white/10 bg-[#141414] p-6 shadow-2xl ${
                    wide ? "max-w-xl" : "max-w-md"
                }`}
            >
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="text-lg font-extrabold text-white">{title}</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Đóng"
                        className="text-gray-400 transition hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}