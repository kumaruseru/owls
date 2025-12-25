"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Plus, Search, Pencil, Trash2, Package, Loader2, Filter, MoreVertical } from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Product {
    id: string;
    name: string;
    slug: string;
    current_price: number | string;
    stock: number;
    category_name: string;
    is_in_stock: boolean;
    primary_image: string | null;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get("/products/");
            // Handle both pagination (results array) and direct list response
            const data = response.data.results || response.data;
            setProducts(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch products:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category_name?.toLowerCase().includes(search.toLowerCase())
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
                            <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-2 tracking-tight">Products</h1>
                            <p className="text-neutral-400 text-lg">Manage your store's catalog and inventory.</p>
                        </div>
                        <Link href="/admin/products/new">
                            <Button
                                size="xl"
                                className="bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-wider shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)] transition-all rounded-xl"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Add New Product
                            </Button>
                        </Link>
                    </div>

                    {/* Content Container */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl shadow-purple-900/5 overflow-hidden">

                        {/* Toolbar */}
                        <div className="p-6 border-b border-white/10 flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full md:max-w-md group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 group-focus-within:text-purple-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search by name or category..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all"
                                />
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white rounded-xl h-11">
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filters
                                </Button>
                                <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white rounded-xl h-11">
                                    <Package className="w-4 h-4 mr-2" />
                                    Export
                                </Button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-black/20 text-neutral-400 text-[10px] uppercase font-bold tracking-widest border-b border-white/10">
                                        <th className="px-6 py-5">Product Details</th>
                                        <th className="px-6 py-5">Category</th>
                                        <th className="px-6 py-5">Price</th>
                                        <th className="px-6 py-5">Stock Status</th>
                                        <th className="px-6 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center justify-center gap-3">
                                                    <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                                                    <span className="text-neutral-500 font-medium">Loading catalog...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredProducts.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-20 text-center">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <Package className="w-12 h-12 text-neutral-700 mb-2" />
                                                    <h3 className="text-lg font-bold text-white">No products found</h3>
                                                    <p className="text-neutral-500">
                                                        {products.length === 0
                                                            ? "Get started by adding your first product."
                                                            : "Try adjusting your search terms."}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredProducts.map((product) => (
                                            <tr key={product.id} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 overflow-hidden flex-shrink-0 relative">
                                                            {product.primary_image ? (
                                                                <img src={product.primary_image} alt={product.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-neutral-700 bg-neutral-900">
                                                                    <Package size={20} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white text-base group-hover:text-purple-400 transition-colors">{product.name}</div>
                                                            <div className="text-xs text-neutral-500 font-mono mt-0.5">{product.slug}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-neutral-300 border border-white/10">
                                                        {product.category_name || "Uncategorized"}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-white">
                                                    {typeof product.current_price === 'number'
                                                        ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.current_price)
                                                        : product.current_price}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "w-2 h-2 rounded-full",
                                                            product.is_in_stock ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                                                        )} />
                                                        <div>
                                                            <div className={cn(
                                                                "text-sm font-medium",
                                                                product.is_in_stock ? "text-emerald-400" : "text-red-400"
                                                            )}>
                                                                {product.is_in_stock ? "In Stock" : "Out of Stock"}
                                                            </div>
                                                            <div className="text-xs text-neutral-500">{product.stock} units</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                        <button className="p-2 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-all">
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-2 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-red-400 transition-all">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-2 rounded-lg hover:bg-white/10 text-neutral-400 hover:text-white transition-all md:hidden">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer / Pagination (Placeholder) */}
                        <div className="p-4 border-t border-white/10 bg-black/20 flex items-center justify-between text-xs text-neutral-500">
                            <div>Showing {filteredProducts.length} products</div>
                            {/* Add pagination controls here if needed */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}