'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Save, Lock, LayoutGrid, Phone, Loader2, Globe, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SiteConfig {
    site_name: string;
    site_description: string;
    maintenance_mode: boolean;
    support_email: string;
    support_phone: string;
}

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'security'>('general');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    // Config State
    const [config, setConfig] = useState<SiteConfig>({
        site_name: "",
        site_description: "",
        maintenance_mode: false,
        support_email: "",
        support_phone: "",
    });

    // Password State
    const [passwords, setPasswords] = useState({
        old_password: "",
        new_password: "",
        new_password2: "",
    });

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            const response = await api.get("/core/config/");
            setConfig(response.data);
        } catch (error) {
            console.error("Failed to fetch settings:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveConfig = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsSaving(true);
        try {
            await api.patch("/core/config/", config);
            toast.success("System settings updated successfully!");
        } catch (error) {
            console.error("Failed to save settings:", error);
            toast.error("Failed to save settings.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (passwords.new_password !== passwords.new_password2) {
            toast.error("New passwords do not match.");
            return;
        }

        setIsSaving(true);
        try {
            await api.put("/users/change-password/", passwords);
            toast.success("Password changed successfully.");
            setPasswords({ old_password: "", new_password: "", new_password2: "" });
        } catch (error: any) {
            console.error("Failed to change password:", error);
            const msg = error.response?.data?.new_password?.[0] || error.response?.data?.old_password?.[0] || "Failed to change password.";
            toast.error(msg);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <Loader2 className="animate-spin text-purple-500" size={32} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-purple-500/30">
            {/* Fixed Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <AuroraBackground className="h-full w-full">
                    <></>
                </AuroraBackground>
            </div>

            <div className="relative z-10 w-full min-h-screen pb-20 pt-32 px-4 md:px-6">
                <div className="container mx-auto max-w-5xl">
                    <div className="mb-10">
                        <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-2 tracking-tight">System Settings</h1>
                        <p className="text-neutral-400">Manage global store configuration and preferences.</p>
                    </div>

                    <div className="grid lg:grid-cols-4 gap-8">
                        {/* Sidebar Navigation */}
                        <div className="lg:col-span-1">
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-4 backdrop-blur-xl sticky top-32">
                                <nav className="space-y-2">
                                    <button
                                        onClick={() => setActiveTab('general')}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
                                            activeTab === 'general'
                                                ? "bg-white/10 text-white shadow-lg shadow-purple-900/10 border border-white/5"
                                                : "text-neutral-400 hover:bg-white/5 hover:text-white"
                                        )}
                                    >
                                        <LayoutGrid size={18} />
                                        General
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('contact')}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
                                            activeTab === 'contact'
                                                ? "bg-white/10 text-white shadow-lg shadow-purple-900/10 border border-white/5"
                                                : "text-neutral-400 hover:bg-white/5 hover:text-white"
                                        )}
                                    >
                                        <Phone size={18} />
                                        Contact Info
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('security')}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
                                            activeTab === 'security'
                                                ? "bg-white/10 text-white shadow-lg shadow-purple-900/10 border border-white/5"
                                                : "text-neutral-400 hover:bg-white/5 hover:text-white"
                                        )}
                                    >
                                        <Lock size={18} />
                                        Security
                                    </button>
                                </nav>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="lg:col-span-3">
                            {/* General Settings Tab */}
                            {activeTab === 'general' && (
                                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl shadow-purple-900/5">
                                    <h2 className="text-xl font-bold text-white mb-8 border-b border-white/10 pb-4 flex items-center gap-2">
                                        <Globe size={20} className="text-purple-400" />
                                        General Information
                                    </h2>

                                    <form onSubmit={handleSaveConfig} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Store Name</label>
                                            <input
                                                type="text"
                                                value={config.site_name}
                                                onChange={(e) => setConfig({ ...config, site_name: e.target.value })}
                                                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all"
                                                placeholder="My Awesome Store"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Store Description</label>
                                            <textarea
                                                rows={4}
                                                value={config.site_description}
                                                onChange={(e) => setConfig({ ...config, site_description: e.target.value })}
                                                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all resize-none"
                                                placeholder="A brief description of your store..."
                                            />
                                        </div>

                                        <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex items-center justify-between">
                                            <div>
                                                <div className="font-bold text-white text-sm">Maintenance Mode</div>
                                                <div className="text-xs text-neutral-400 mt-1">Temporarily disable the public storefront</div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={config.maintenance_mode}
                                                    onChange={(e) => setConfig({ ...config, maintenance_mode: e.target.checked })}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                            </label>
                                        </div>

                                        <div className="pt-4">
                                            <Button
                                                type="submit"
                                                disabled={isSaving}
                                                size="xl"
                                                className="w-full md:w-auto rounded-xl bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-wider text-sm transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)]"
                                            >
                                                {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                                                Save Settings
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Contact Settings Tab */}
                            {activeTab === 'contact' && (
                                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl shadow-purple-900/5">
                                    <h2 className="text-xl font-bold text-white mb-8 border-b border-white/10 pb-4 flex items-center gap-2">
                                        <Phone size={20} className="text-blue-400" />
                                        Contact Information
                                    </h2>

                                    <form onSubmit={handleSaveConfig} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Support Email</label>
                                            <input
                                                type="email"
                                                value={config.support_email}
                                                onChange={(e) => setConfig({ ...config, support_email: e.target.value })}
                                                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all"
                                                placeholder="support@example.com"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Support Phone</label>
                                            <input
                                                type="text"
                                                value={config.support_phone}
                                                onChange={(e) => setConfig({ ...config, support_phone: e.target.value })}
                                                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all"
                                                placeholder="+1 (555) 000-0000"
                                            />
                                        </div>

                                        <div className="pt-4">
                                            <Button
                                                type="submit"
                                                disabled={isSaving}
                                                size="xl"
                                                className="w-full md:w-auto rounded-xl bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-wider text-sm transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)]"
                                            >
                                                {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                                                Update Contact Info
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Security Settings Tab */}
                            {activeTab === 'security' && (
                                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl shadow-purple-900/5">
                                    <h2 className="text-xl font-bold text-white mb-8 border-b border-white/10 pb-4 flex items-center gap-2">
                                        <ShieldAlert size={20} className="text-red-400" />
                                        Admin Security
                                    </h2>

                                    <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Current Password</label>
                                            <input
                                                type="password"
                                                value={passwords.old_password}
                                                onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })}
                                                required
                                                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">New Password</label>
                                            <input
                                                type="password"
                                                value={passwords.new_password}
                                                onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                                                required
                                                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 ml-1">Confirm New Password</label>
                                            <input
                                                type="password"
                                                value={passwords.new_password2}
                                                onChange={(e) => setPasswords({ ...passwords, new_password2: e.target.value })}
                                                required
                                                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 text-white placeholder:text-neutral-600 transition-all"
                                            />
                                        </div>

                                        <div className="pt-4">
                                            <Button
                                                type="submit"
                                                disabled={isSaving}
                                                size="xl"
                                                className="w-full rounded-xl bg-white text-black hover:bg-neutral-200 font-bold uppercase tracking-wider text-sm transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)]"
                                            >
                                                {isSaving ? <Loader2 size={18} className="animate-spin mr-2" /> : <Save size={18} className="mr-2" />}
                                                Change Password
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}