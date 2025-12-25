"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { formatPrice, formatDate } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import Link from "next/link";
import { Eye, Search, Filter } from "lucide-react";

interface Order {
    id: string;
    order_number: string;
    status: string;
    payment_status: string;
    total: number;
    item_count: number;
    created_at: string;
}

export function OrderTable() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get("/orders/admin/all/");
            setOrders(data.results || data); // Store fetching all results
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
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Search order ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg text-sm border border-white/10 transition-colors">
                    <Filter className="w-4 h-4" />
                    Filter
                </button>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-white/10 bg-black/20 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="px-6 py-4 font-medium text-zinc-400">Order ID</th>
                                <th className="px-6 py-4 font-medium text-zinc-400">Date</th>
                                <th className="px-6 py-4 font-medium text-zinc-400">Status</th>
                                <th className="px-6 py-4 font-medium text-zinc-400">Payment</th>
                                <th className="px-6 py-4 font-medium text-zinc-400">Items</th>
                                <th className="px-6 py-4 font-medium text-zinc-400 text-right">Total</th>
                                <th className="px-6 py-4 font-medium text-zinc-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">
                                        Loading orders...
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-zinc-500">
                                        No orders found.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-medium font-mono text-indigo-400">
                                            #{order.order_number}
                                        </td>
                                        <td className="px-6 py-4 text-zinc-300">
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
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/admin/orders/${order.order_number}`}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors text-xs font-medium border border-indigo-500/20"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
