'use client'

import { useState } from 'react'
import Image from 'next/image'
import { LayoutDashboard, Wallet, ShoppingCart, Receipt, Menu, X, LogOut, ChevronDown, Users, Truck, FileBarChart, ShoppingBag } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'

interface NavigationProps {
    activeTab: string
    onTabChange: (tab: string) => void
}

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { data: session } = useSession()

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'reports', label: 'Rapports', icon: FileBarChart },
        { id: 'ventes', label: 'Ventes', icon: ShoppingBag },
        { id: 'clients', label: 'Clients', icon: Users },
        { id: 'suppliers', label: 'Fournisseurs', icon: Truck },
        { id: 'caisses', label: 'Caisses', icon: Wallet },
        { id: 'achats', label: 'Achats', icon: ShoppingCart },
        { id: 'charges', label: 'Charges', icon: Receipt },
    ]

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/login' })
    }

    return (
        <nav className="nav-glass sticky top-0 z-50 mb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Image 
                            src="/hannour.png" 
                            alt="Hannour Logo" 
                            width={180} 
                            height={60}
                            className="h-12 w-auto object-contain"
                            priority
                        />
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = activeTab === item.id
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => onTabChange(item.id)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-300 ${isActive
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                                    <span className="font-medium text-sm">{item.label}</span>
                                </button>
                            )
                        })}
                    </div>

                    {/* User Menu */}
                    <div className="hidden md:flex items-center gap-4">
                        <div className="h-8 w-[1px] bg-white/10"></div>
                        <div className="flex items-center gap-3">
                            {session?.user && (
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-white">{session.user.name}</p>
                                    <p className="text-xs text-slate-400">Admin</p>
                                </div>
                            )}
                            <button
                                onClick={handleLogout}
                                className="p-2.5 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
                                title="Déconnexion"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-white/10 text-slate-300"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 space-y-2 border-t border-white/5 animate-fade-in">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = activeTab === item.id
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        onTabChange(item.id)
                                        setMobileMenuOpen(false)
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                            ? 'bg-indigo-600 text-white'
                                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            )
                        })}

                        {/* Mobile User Info */}
                        {session?.user && (
                            <div className="px-4 py-4 border-t border-white/5 mt-2">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-sm font-medium text-white">{session.user.name}</p>
                                        <p className="text-xs text-slate-400">{session.user.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/20"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Déconnexion</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    )
}
