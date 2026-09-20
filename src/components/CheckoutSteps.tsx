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
                                active ? "text-white" : done ? "text-red-400" : "text-gray-500"
                            }`}
                        >
                            <span
                                className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs ${
                                    active
                                        ? "border-red-600 bg-red-600 text-white"
                                        : done
                                            ? "border-red-600 text-red-400"
                                            : "border-white/20"
                                }`}
                            >
                                {done ? <Check size={14} /> : index + 1}
                            </span>
                            <span className={active ? "inline" : "hidden sm:inline"}>{label}</span>
                        </span>
                        {index < steps.length - 1 && (
                            <span
                                aria-hidden="true"
                                className={`h-px w-6 sm:w-12 ${done ? "bg-red-600" : "bg-white/15"}`}
                            />
                        )}
                    </li>
                );
            })}
        </ol>
    );
}