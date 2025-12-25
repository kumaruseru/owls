import { cn } from "@/lib/utils";

interface StatusBadgeProps {
    status: string;
    type?: "order" | "payment";
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    // Order Statuses
    pending: { label: "Chờ xác nhận", color: "text-amber-400", bg: "bg-amber-400/10" },
    confirmed: { label: "Đã xác nhận", color: "text-blue-400", bg: "bg-blue-400/10" },
    processing: { label: "Đang xử lý", color: "text-indigo-400", bg: "bg-indigo-400/10" },
    shipping: { label: "Đang giao", color: "text-purple-400", bg: "bg-purple-400/10" },
    delivered: { label: "Đã giao", color: "text-emerald-400", bg: "bg-emerald-400/10" },
    cancelled: { label: "Đã hủy", color: "text-rose-400", bg: "bg-rose-400/10" },

    // Payment Statuses
    unpaid: { label: "Chưa thanh toán", color: "text-zinc-400", bg: "bg-zinc-400/10" },
    paid: { label: "Đã thanh toán", color: "text-emerald-400", bg: "bg-emerald-400/10" },
    refunded: { label: "Hoàn tiền", color: "text-rose-400", bg: "bg-rose-400/10" },

    // Payment Methods
    cod: { label: "COD", color: "text-zinc-300", bg: "bg-zinc-500/10" },
    vnpay: { label: "VNPay", color: "text-blue-400", bg: "bg-blue-500/10" },
    momo: { label: "MoMo", color: "text-pink-400", bg: "bg-pink-500/10" },
    bank_transfer: { label: "Bank Transfer", color: "text-green-400", bg: "bg-green-500/10" },
};

export function StatusBadge({ status, type = "order" }: StatusBadgeProps) {
    const config = statusConfig[status] || {
        label: status,
        color: "text-zinc-400",
        bg: "bg-zinc-400/10"
    };

    return (
        <span
            className={cn(
                "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border border-transparent",
                config.color,
                config.bg
            )}
        >
            {config.label}
        </span>
    );
}
