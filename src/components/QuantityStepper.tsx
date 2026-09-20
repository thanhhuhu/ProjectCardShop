import { Minus, Plus } from "lucide-react";

interface QuantityStepperProps {
    value: number;
    max: number;
    onChange: (value: number) => void;
}

export default function QuantityStepper({ value, max, onChange }: QuantityStepperProps) {
    return (
        <div className="flex items-center overflow-hidden rounded-full bg-neutral-800 text-white">
            <button
                type="button"
                aria-label="Giảm số lượng"
                disabled={value <= 1}
                onClick={() => onChange(value - 1)}
                className="p-2.5 transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <Minus size={14} />
            </button>
            <span className="w-9 text-center text-sm font-semibold" aria-live="polite">
                {value}
            </span>
            <button
                type="button"
                aria-label="Tăng số lượng"
                disabled={value >= max}
                onClick={() => onChange(value + 1)}
                className="p-2.5 transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
                <Plus size={14} />
            </button>
        </div>
    );
}