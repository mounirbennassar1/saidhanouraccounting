'use client'

import { useEffect, useState } from 'react'
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    ShoppingCart,
    Receipt,
    AlertCircle,
    ArrowUpRight,
    ArrowDownRight,
    Activity,
    DollarSign,
    PieChart as PieChartIcon,
    BarChart3,
    Users
} from 'lucide-react'
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    Legend
} from 'recharts'

interface DashboardStats {
    caisses: Array<{
        id: string
        name: string
        type: string
        balance: number
        fixedAmount: number | null
        totalAchats: number
        totalCharges: number
        totalRevenue: number
        totalSpent: number
        transactionCount: number
    }>
    totalCaisseBalance: number
    initialCapital: number
    totalAchats: number
    totalCharges: number
    paidCharges: number
    unpaidCharges: number
    netBalance: number
    cashFlow: {
        inflow: number
        outflow: number
        net: number
    }
    clientStats: {
        totalClients: number
        totalClientRevenue: number
        totalOutstandingBalance: number
        clientsWithDebt: number
        averageOrderValue: number
    }
    achatsByCategory: Record<string, number>
    chargesByCategory: Record<string, number>
    achatsByCaisse: Record<string, number>
    chargesByCaisse: Record<string, number>
}

const COLORS = ['#6366f1', '#ec4899', '#06b6d4', '#f59e0b', '#ef4444']

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/dashboard/stats')
            if (response.ok) {
                const data = await response.json()
                setStats(data)
            }
        } catch (error) {
            console.error('Error fetching stats:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400 animate-pulse">Chargement des données...</p>
                </div>
            </div>
        )
    }

    // Dynamic calculations
    const totalSpent = (stats?.totalAchats || 0) + (stats?.paidCharges || 0)
    const utilizationRate = stats?.initialCapital ? ((totalSpent / stats.initialCapital) * 100) : 0
    const chargesPaidPercentage = stats?.totalCharges ? ((stats.paidCharges / stats.totalCharges) * 100) : 0
    const liquidityRatio = stats?.unpaidCharges ? (stats.totalCaisseBalance / stats.unpaidCharges) : 0

    const achatChartData = stats ? Object.entries(stats.achatsByCategory).map(([category, amount]) => ({
        name: category.charAt(0) + category.slice(1).toLowerCase(),
        value: amount
    })) : []

    const chargeChartData = stats ? Object.entries(stats.chargesByCategory).map(([category, amount]) => ({
        name: category.replace(/_/g, ' ').toLowerCase(),
        value: amount
    })) : []

    // Caisse distribution data
    const caisseDistributionData = stats?.caisses.map(caisse => ({
        name: caisse.name,
        balance: caisse.balance,
        achats: caisse.totalAchats,
        charges: caisse.totalCharges
    })) || []

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Vue d'ensemble</h1>
                    <p className="text-slate-400">Bienvenue sur votre tableau de bord financier.</p>
                </div>
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/5">
                    <span className="px-3 py-1 text-xs font-medium text-indigo-400 bg-indigo-500/10 rounded-md">Temps réel</span>
                    <span className="px-3 py-1 text-xs font-medium text-slate-400">Dernière màj: {new Date().toLocaleTimeString()}</span>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Caisse */}
                <div className="card p-6 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Wallet className="w-24 h-24 text-indigo-500" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-full border border-indigo-500/20">
                            Disponible
                        </span>
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-medium mb-1">Solde Total Caisse</p>
                        <h3 className="text-3xl font-bold text-white tracking-tight">
                            {stats?.totalCaisseBalance.toLocaleString()} <span className="text-lg text-slate-500 font-normal">DH</span>
                        </h3>
                        <div className="mt-3 pt-3 border-t border-white/5">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500">Capital Initial</span>
                                <span className="text-slate-400 font-medium">{stats?.initialCapital.toLocaleString()} DH</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Achats */}
                <div className="card p-6 relative overflow-hidden group hover:border-pink-500/30 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ShoppingCart className="w-24 h-24 text-pink-500" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
                            <ShoppingCart className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium text-pink-400 bg-pink-500/10 px-2 py-1 rounded-full border border-pink-500/20 flex items-center gap-1">
                            <ArrowDownRight className="w-3 h-3" />
                            Sorties
                        </span>
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-medium mb-1">Total Achats</p>
                        <h3 className="text-3xl font-bold text-white tracking-tight">
                            {stats?.totalAchats.toLocaleString()} <span className="text-lg text-slate-500 font-normal">DH</span>
                        </h3>
                        <div className="mt-3 pt-3 border-t border-white/5">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500">% du Capital</span>
                                <span className="text-pink-400 font-medium">
                                    {stats?.initialCapital ? ((stats.totalAchats / stats.initialCapital) * 100).toFixed(1) : 0}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Charges */}
                <div className="card p-6 relative overflow-hidden group hover:border-cyan-500/30 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Receipt className="w-24 h-24 text-cyan-500" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            <Receipt className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/20">
                            {stats?.unpaidCharges ? `${stats.unpaidCharges.toLocaleString()} DH impayé` : 'Tout payé'}
                        </span>
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-medium mb-1">Total Charges</p>
                        <h3 className="text-3xl font-bold text-white tracking-tight">
                            {stats?.totalCharges.toLocaleString()} <span className="text-lg text-slate-500 font-normal">DH</span>
                        </h3>
                        <div className="mt-3 pt-3 border-t border-white/5">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500">Payé</span>
                                <span className="text-emerald-400 font-medium">{stats?.paidCharges.toLocaleString()} DH ({chargesPaidPercentage.toFixed(0)}%)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Net Balance */}
                <div className="card p-6 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity className={`w-24 h-24 ${stats?.netBalance && stats.netBalance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`} />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 rounded-xl border ${stats?.netBalance && stats.netBalance >= 0
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}>
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full border flex items-center gap-1 ${stats?.netBalance && stats.netBalance >= 0
                                ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                                : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                            }`}>
                            {stats?.netBalance && stats.netBalance >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            Bilan
                        </span>
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm font-medium mb-1">Résultat Net</p>
                        <h3 className={`text-3xl font-bold tracking-tight ${stats?.netBalance && stats.netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                            {stats?.netBalance.toLocaleString()} <span className="text-lg text-slate-500 font-normal">DH</span>
                        </h3>
                        <div className="mt-3 pt-3 border-t border-white/5">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500">Charges Impayées</span>
                                <span className={`font-medium ${stats?.unpaidCharges && stats.unpaidCharges > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                    {stats?.unpaidCharges.toLocaleString()} DH
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cash Flow & Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {/* Total Spent */}
                <div className="card p-5 hover:border-violet-500/30 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-xs font-medium mb-1">Dépenses Totales</p>
                            <h4 className="text-2xl font-bold text-white">{totalSpent.toLocaleString()} DH</h4>
                            <p className="text-xs text-slate-500 mt-1">Achats + Charges Payées</p>
                        </div>
                        <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                            <TrendingDown className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Utilization Rate */}
                <div className="card p-5 hover:border-orange-500/30 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-xs font-medium mb-1">Taux d'Utilisation</p>
                            <h4 className="text-2xl font-bold text-white">{utilizationRate.toFixed(1)}%</h4>
                            <p className="text-xs text-slate-500 mt-1">Du capital initial dépensé</p>
                        </div>
                        <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                            <Activity className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Liquidity Ratio */}
                <div className="card p-5 hover:border-teal-500/30 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-xs font-medium mb-1">Ratio de Liquidité</p>
                            <h4 className="text-2xl font-bold text-white">{liquidityRatio.toFixed(2)}x</h4>
                            <p className="text-xs text-slate-500 mt-1">Capacité de paiement</p>
                        </div>
                        <div className={`p-3 rounded-xl border ${liquidityRatio >= 1.5 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                            {liquidityRatio >= 1.5 ? <TrendingUp className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        </div>
                    </div>
                </div>
            </div>

            {/* Client Statistics Section */}
            {stats?.clientStats && stats.clientStats.totalClients > 0 && (
                <>
                    <h2 className="text-xl font-bold text-white mt-8 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-violet-400" />
                        Statistiques Clients
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Total Clients */}
                        <div className="card p-5 hover:border-violet-500/30 transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-xs font-medium mb-1">Total Clients</p>
                                    <h4 className="text-2xl font-bold text-white">{stats.clientStats.totalClients}</h4>
                                    <p className="text-xs text-slate-500 mt-1">Clients actifs</p>
                                </div>
                                <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
                                    <Users className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        {/* Client Revenue */}
                        <div className="card p-5 hover:border-emerald-500/30 transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-xs font-medium mb-1">Revenu Clients</p>
                                    <h4 className="text-2xl font-bold text-emerald-400">
                                        {stats.clientStats.totalClientRevenue.toLocaleString()} DH
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-1">Total encaissé</p>
                                </div>
                                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    <DollarSign className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        {/* Outstanding Balance */}
                        <div className="card p-5 hover:border-amber-500/30 transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-xs font-medium mb-1">Soldes Impayés</p>
                                    <h4 className="text-2xl font-bold text-amber-400">
                                        {stats.clientStats.totalOutstandingBalance.toLocaleString()} DH
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-1">En attente</p>
                                </div>
                                <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                            </div>
                        </div>

                        {/* Clients with Debt */}
                        <div className="card p-5 hover:border-rose-500/30 transition-all">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-400 text-xs font-medium mb-1">Clients avec Dette</p>
                                    <h4 className="text-2xl font-bold text-rose-400">
                                        {stats.clientStats.clientsWithDebt}
                                    </h4>
                                    <p className="text-xs text-slate-500 mt-1">Paiements partiels</p>
                                </div>
                                <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                    <TrendingDown className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Caisses Detail Grid */}
            <h2 className="text-xl font-bold text-white mt-8 mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-indigo-400" />
                Détail des Caisses
                <span className="text-sm font-normal text-slate-400 ml-2">({stats?.caisses.length} caisses actives)</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats?.caisses.map((caisse, index) => {
                    const utilizationPercent = caisse.fixedAmount 
                        ? ((caisse.totalSpent / caisse.fixedAmount) * 100) 
                        : caisse.balance > 0 
                            ? ((caisse.totalSpent / (caisse.balance + caisse.totalSpent)) * 100)
                            : 0

                    return (
                        <div key={caisse.id} className="card p-6 hover:border-indigo-500/30 transition-all duration-300 relative overflow-hidden group">
                            {/* Background gradient effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            
                            <div className="relative">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-semibold text-white text-lg">{caisse.name}</h3>
                                        <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">{caisse.type}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className={`w-2 h-2 rounded-full ${caisse.balance > 0 ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-rose-400'}`}></div>
                                        <span className="text-xs text-slate-500">{caisse.transactionCount} trans.</span>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <p className="text-xs text-slate-500 mb-1">Solde Actuel</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-white">{caisse.balance.toLocaleString()}</span>
                                        <span className="text-sm text-slate-500">DH</span>
                                    </div>

                                    {/* Transactions breakdown */}
                                    <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-400 flex items-center gap-2">
                                                <ShoppingCart className="w-3 h-3 text-pink-400" />
                                                Achats
                                            </span>
                                            <span className="text-pink-400 font-medium">-{caisse.totalAchats.toLocaleString()} DH</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-400 flex items-center gap-2">
                                                <Receipt className="w-3 h-3 text-cyan-400" />
                                                Charges
                                            </span>
                                            <span className="text-cyan-400 font-medium">-{caisse.totalCharges.toLocaleString()} DH</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm pt-2 border-t border-white/5">
                                            <span className="text-slate-400 flex items-center gap-2">
                                                <ArrowDownRight className="w-3 h-3 text-violet-400" />
                                                Total Dépensé
                                            </span>
                                            <span className="text-violet-400 font-bold">-{caisse.totalSpent.toLocaleString()} DH</span>
                                        </div>
                                    </div>

                                    {/* Fixed Amount or Utilization */}
                                    {caisse.fixedAmount ? (
                                        <div className="mt-4 pt-4 border-t border-white/5">
                                            <div className="flex justify-between items-center text-sm mb-2">
                                                <span className="text-slate-400">Montant Fixe</span>
                                                <span className="text-white font-medium">{caisse.fixedAmount.toLocaleString()} DH</span>
                                            </div>
                                            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                                                <div 
                                                    className={`h-full transition-all ${
                                                        utilizationPercent > 80 ? 'bg-rose-500' : 
                                                        utilizationPercent > 50 ? 'bg-amber-500' : 
                                                        'bg-emerald-500'
                                                    }`}
                                                    style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1 text-right">{utilizationPercent.toFixed(1)}% utilisé</p>
                                        </div>
                                    ) : (
                                        <div className="mt-4 pt-4 border-t border-white/5">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-slate-500">Taux utilisation</span>
                                                <span className={`font-medium ${
                                                    utilizationPercent > 70 ? 'text-rose-400' : 
                                                    utilizationPercent > 40 ? 'text-amber-400' : 
                                                    'text-emerald-400'
                                                }`}>
                                                    {utilizationPercent.toFixed(1)}%
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                {/* Achats Chart */}
                <div className="card p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-pink-400" />
                        Répartition des Achats par Catégorie
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={achatChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                    label={({ value }) => `${value.toLocaleString()} DH`}
                                    labelLine={false}
                                >
                                    {achatChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(20, 25, 38, 0.9)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                                        color: '#fff'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                    formatter={(value: number) => `${value.toLocaleString()} DH`}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                        {achatChartData.map((entry, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                <span className="text-sm text-slate-400">{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Charges Chart */}
                <div className="card p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-cyan-400" />
                        Répartition des Charges par Type
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chargeChartData} layout="vertical" margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                <XAxis type="number" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    width={100}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{
                                        backgroundColor: 'rgba(20, 25, 38, 0.9)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                                        color: '#fff'
                                    }}
                                    formatter={(value: number) => `${value.toLocaleString()} DH`}
                                />
                                <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Caisse Distribution Chart */}
            <div className="card p-6 mt-6">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-400" />
                    Utilisation des Caisses (Achats vs Charges)
                </h3>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={caisseDistributionData} margin={{ bottom: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis 
                                dataKey="name" 
                                stroke="#94a3b8" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false}
                                angle={-45}
                                textAnchor="end"
                            />
                            <YAxis 
                                stroke="#64748b" 
                                fontSize={12} 
                                tickLine={false} 
                                axisLine={false}
                                tickFormatter={(value) => `${value.toLocaleString()}`}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{
                                    backgroundColor: 'rgba(20, 25, 38, 0.9)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                                    color: '#fff'
                                }}
                                formatter={(value: number) => `${value.toLocaleString()} DH`}
                            />
                            <Legend 
                                wrapperStyle={{ paddingTop: '20px' }}
                                iconType="circle"
                            />
                            <Bar dataKey="balance" name="Solde Actuel" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="achats" name="Achats" fill="#ec4899" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="charges" name="Charges" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Summary Section */}
            <div className="card p-6 mt-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-2">Résumé Financier</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                            <div>
                                <p className="text-xs text-slate-400 mb-1">Capital Initial</p>
                                <p className="text-lg font-bold text-white">{stats?.initialCapital.toLocaleString()} DH</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 mb-1">Total Dépensé</p>
                                <p className="text-lg font-bold text-rose-400">-{totalSpent.toLocaleString()} DH</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 mb-1">Solde Disponible</p>
                                <p className="text-lg font-bold text-emerald-400">{stats?.totalCaisseBalance.toLocaleString()} DH</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400 mb-1">Charges Impayées</p>
                                <p className="text-lg font-bold text-amber-400">-{stats?.unpaidCharges.toLocaleString()} DH</p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-sm text-slate-300">
                                <span className="font-semibold">Note:</span> Le résultat net ({stats?.netBalance.toLocaleString()} DH) représente votre solde actuel moins les charges impayées. 
                                {liquidityRatio < 1.5 && stats?.unpaidCharges && stats.unpaidCharges > 0 && (
                                    <span className="text-amber-400"> ⚠️ Attention: Votre ratio de liquidité est bas. Considérez régler les charges impayées.</span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
