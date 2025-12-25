"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatPrice, formatDate, cn } from "@/lib/utils";
import Link from "next/link";
import { Eye, Search, Filter, ShoppingBag, Loader2 } from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";

interface Order {
    id: string;
    order_number: string;
    status: string;
    payment_status: string;
    total: number;
    item_count: number;
    created_at: string;
}

const StatusBadge = ({ status, type = 'order' }: { status: string; type?: 'order' | 'payment' }) => {
    const getStyles = () => {
        const s = status?.toLowerCase();
        if (['completed', 'delivered', 'paid', 'confirmed'].includes(s)) return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
        if (['pending', 'processing'].includes(s)) return "bg-amber-500/10 text-amber-400 border-amber-500/20";
        if (['shipping'].includes(s)) return "bg-purple-500/10 text-purple-400 border-purple-500/20";
        if (['cancelled', 'failed', 'refunded'].includes(s)) return "bg-rose-500/10 text-rose-400 border-rose-500/20";
        return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    };

    return (
        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wider", getStyles())}>
            {status}
        </span>
    );
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get("/orders/admin/all/");
            setOrders(data.results || data);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter((order) =>
        order.order_number.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
            {/* Fixed Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <AuroraBackground className="h-full w-full">
                    <></>
                </AuroraBackground>
            </div>

            <div className="relative z-10 w-full min-h-screen pb-20 pt-32 px-4 md:px-6">
                <div className="container mx-auto max-w-7xl">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-2 tracking-tight">Orders</h1>
                            <p className="text-neutral-400 text-lg">Manage customer orders and shipments.</p>
                        </div>
                    </div>

                    {/* Main Card */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl shadow-purple-900/5 overflow-hidden">

                        {/* Toolbar */}
                        <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full sm:max-w-md group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-purple-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search by Order ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all"
                                />
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white rounded-xl h-11 flex-1 sm:flex-none">
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filter
                                </Button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-black/20 text-neutral-400 text-[10px] uppercase font-bold tracking-widest border-b border-white/10">
                                        <th className="px-6 py-5">Order ID</th>
                                        <th className="px-6 py-5">Date Placed</th>
                                        <th className="px-6 py-5">Status</th>
                                        <th className="px-6 py-5">Payment</th>
                                        <th className="px-6 py-5">Items</th>
                                        <th className="px-6 py-5 text-right">Total</th>
                                        <th className="px-6 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center justify-center gap-3">
                                                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                                                    <span className="text-neutral-500 font-medium">Loading orders...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredOrders.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <ShoppingBag className="w-12 h-12 text-zinc-700 mb-2" />
                                                    <h3 className="text-lg font-bold text-white">No orders found</h3>
                                                    <p className="text-neutral-500">
                                                        {orders.length === 0
                                                            ? "Wait for the first order to arrive!"
                                                            : "Try adjusting your search terms."}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredOrders.map((order) => (
                                            <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-white text-base font-mono group-hover:text-purple-400 transition-colors">
                                                        #{order.order_number}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-zinc-400 text-sm">
                                                    {formatDate(order.created_at)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={order.status} />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={order.payment_status} type="payment" />
                                                </td>
                                                <td className="px-6 py-4 text-zinc-300">
                                                    {order.item_count} items
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium text-emerald-400">
                                                    {formatPrice(order.total)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Link
                                                        href={`/admin/orders/${order.order_number}`}
                                                    >
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-neutral-400 hover:text-white hover:bg-white/10"
                                                        >
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            Details
                                                        </Button>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/10 bg-black/20 flex items-center justify-between text-xs text-neutral-500">
                            <div>Showing {filteredOrders.length} orders</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
