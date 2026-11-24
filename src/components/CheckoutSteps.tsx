import { Check } from "lucide-react";

const steps = ["Giỏ hàng", "Thanh toán", "Hoàn tất"];

// current: 0 = Giỏ hàng, 1 = Thanh toán, 2 = Hoàn tất
export default function CheckoutSteps({ current }: { current: number }) {
    return (
        <ol className="mb-8 flex items-center justify-center gap-2 text-xs font-bold uppercase sm:gap-4 sm:text-sm">
            {steps.map((label, index) => {
                const done = index < current;
                const active = index === current;

                return (
                    <li key={label} className="flex items-center gap-2 sm:gap-4">
                        <span
                            aria-current={active ? "step" : undefined}
                            className={`flex items-center gap-2 ${
                                active ? "text-[#1a1a1a]" : done ? "text-[#1a1a1a]" : "text-[#8a8a8a]"
                            }`}
                        >
                            <span
                                className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs ${
                                    active
                                        ? "border-[#1a1a1a] bg-[#1a1a1a] text-[#e9e6de]"
                                        : done
                                            ? "border-[#1a1a1a] text-[#1a1a1a]"
                                            : "border-black/15"
                                }`}
                            >
                                {done ? <Check size={14} /> : index + 1}
                            </span>
                            <span className={active ? "inline" : "hidden sm:inline"}>{label}</span>
                        </span>
                        {index < steps.length - 1 && (
                            <span
                                aria-hidden="true"
                                className={`h-px w-6 sm:w-12 ${done ? "bg-[#1a1a1a] text-[#e9e6de]" : "bg-black/[0.08]"}`}
                            />
                        )}
                    </li>
                );
            })}
        </ol>
    );
}