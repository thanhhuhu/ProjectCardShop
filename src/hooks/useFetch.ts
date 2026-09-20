import { useEffect, useState } from "react";
import { ApiError } from "../services/authApi";

interface FetchResult<T> {
    key: string;
    data?: T;
    error?: string;
}

// Tải dữ liệu mỗi khi `key` thay đổi (ví dụ trang, từ khóa tìm kiếm).
// Trong lúc đang tải, `data` vẫn giữ kết quả lần trước để danh sách không bị nháy khi chuyển trang.
// `loading` là true từ lúc key đổi cho tới khi có kết quả mới.
export function useFetch<T>(key: string, fetcher: () => Promise<T>) {
    const [result, setResult] = useState<FetchResult<T> | null>(null);

    useEffect(() => {
        let cancelled = false;

        fetcher()
            .then((data) => {
                if (!cancelled) setResult({ key, data });
            })
            .catch((error) => {
                if (!cancelled) {
                    setResult({
                        key,
                        error: error instanceof ApiError ? error.message : "Không tải được dữ liệu",
                    });
                }
            });

        return () => {
            cancelled = true; // bỏ qua kết quả của lần gọi cũ nếu key đã đổi
        };
        // Chỉ tải lại khi key đổi. `fetcher` được tạo mới ở mỗi lần render nên không đưa vào danh sách phụ thuộc.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    const isCurrent = result?.key === key;
    return {
        data: result?.data,
        loading: !isCurrent,
        error: isCurrent ? result?.error : undefined,
    };
}