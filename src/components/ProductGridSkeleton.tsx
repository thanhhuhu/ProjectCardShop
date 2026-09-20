interface ProductGridSkeletonProps {
    count?: number;
    className?: string;
}

// Khung xám nhấp nháy giữ chỗ trong lúc tải, để trang không bị giật khi sản phẩm hiện ra
export default function ProductGridSkeleton({ count = 8, className }: ProductGridSkeletonProps) {
    return (
        <div
            aria-hidden="true"
            className={className ?? "grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-5"}
        >
            {Array.from({ length: count }, (_, index) => (
                <div
                    key={index}
                    className="animate-pulse overflow-hidden rounded-xl border border-white/10 bg-[#141414]"
                >
                    <div className="m-2 aspect-[63/88] rounded-md bg-white/10" />
                    <div className="space-y-2 p-3">
                        <div className="h-3 w-1/3 rounded bg-white/10" />
                        <div className="h-4 w-4/5 rounded bg-white/10" />
                        <div className="h-5 w-1/2 rounded bg-white/10" />
                        <div className="mt-3 h-8 rounded-lg bg-white/10" />
                    </div>
                </div>
            ))}
        </div>
    );
}