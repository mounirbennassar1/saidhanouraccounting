'use client'

import { useState, useEffect } from 'react'
import { Calendar, Download, FileText, TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react'

interface ReportData {
  summary: {
    totalRevenue: number
    totalExpenses: number
    netProfit: number
    totalAchats: number
    totalCharges: number
    clientPayments: number
    supplierPayments: number
  }
  caisses: Array<{
    id: string
    name: string
    type: string
    balance: number
    transactions: number
  }>
  achats: Array<{
    id: string
    description: string
    amount: number
    category: string
    date: string
    reference?: string
  }>
  charges: Array<{
    id: string
    description: string
    amount: number
    category: string
    date: string
    isPaid: boolean
  }>
  clientOrders: Array<{
    id: string
    orderNumber: string
    clientName: string
    totalAmount: number
    paidAmount: number
    remainingAmount: number
    status: string
    orderDate: string
  }>
  supplierOrders: Array<{
    id: string
    orderNumber: string
    supplierName: string
    totalAmount: number
    paidAmount: number
    remainingAmount: number
    status: string
    orderDate: string
  }>
  transactions: Array<{
    id: string
    type: string
    amount: number
    description: string
    date: string
    caisseName?: string
  }>
}

export default function Reports() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(1) // First day of current month
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0]
  })
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchReport = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/reports?startDate=${startDate}&endDate=${endDate}`)
      if (!response.ok) throw new Error('Failed to fetch report')
      const data = await response.json()
      setReportData(data)
    } catch (err) {
      setError('Erreur lors du chargement du rapport')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [])

  const handleGenerateReport = () => {
    fetchReport()
  }

  const exportToCSV = () => {
    if (!reportData) return

    let csv = 'Type,Description,Montant,Date,Catégorie,Référence\n'
    
    // Add Achats
    reportData.achats.forEach(achat => {
      csv += `Achat,"${achat.description}",${achat.amount},"${new Date(achat.date).toLocaleDateString('fr-FR')}","${achat.category}","${achat.reference || ''}"\n`
    })
    
    // Add Charges
    reportData.charges.forEach(charge => {
      csv += `Charge,"${charge.description}",${charge.amount},"${new Date(charge.date).toLocaleDateString('fr-FR')}","${charge.category}","${charge.isPaid ? 'Payé' : 'Non payé'}"\n`
    })
    
    // Add Client Orders
    reportData.clientOrders.forEach(order => {
      csv += `Commande Client,"${order.clientName} - ${order.orderNumber}",${order.totalAmount},"${new Date(order.orderDate).toLocaleDateString('fr-FR')}","${order.status}","Payé: ${order.paidAmount}"\n`
    })
    
    // Add Supplier Orders
    reportData.supplierOrders.forEach(order => {
      csv += `Commande Fournisseur,"${order.supplierName} - ${order.orderNumber}",${order.totalAmount},"${new Date(order.orderDate).toLocaleDateString('fr-FR')}","${order.status}","Payé: ${order.paidAmount}"\n`
    })

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rapport_${startDate}_${endDate}.csv`
    a.click()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      style: 'currency',
      currency: 'MAD'
    }).format(amount)
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-3xl font-bold gradient-text mb-2">Rapports & Analyses</h2>
        <p className="text-muted">Visualisez toutes vos activités financières</p>
      </div>

      {/* Date Range Selector */}
      <div className="card p-6 mb-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white">Période du Rapport</h3>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-2 text-slate-300 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
              Date de début
            </label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white 
                         hover:border-indigo-500/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 
                         transition-all outline-none text-sm font-medium
                         [color-scheme:dark]"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-2 text-slate-300 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              Date de fin
            </label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 bg-[#0B0F19] border border-white/10 rounded-xl text-white 
                         hover:border-purple-500/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 
                         transition-all outline-none text-sm font-medium
                         [color-scheme:dark]"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="btn btn-primary bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 
                       px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all
                       hover:scale-[1.02] active:scale-[0.98]"
            >
              <Calendar className="w-5 h-5" />
              <span>{loading ? 'Chargement...' : 'Générer'}</span>
            </button>
            {reportData && (
              <button
                onClick={exportToCSV}
                className="btn btn-secondary bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/25
                         px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2
                         transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="w-5 h-5" />
                <span>Exporter CSV</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="glass-card p-4 mb-6 border-l-4 border-red-500">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {reportData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted">Revenus Total</span>
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-2xl font-bold text-green-400">{formatCurrency(reportData.summary.totalRevenue)}</p>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted">Dépenses Total</span>
                <TrendingDown className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-2xl font-bold text-red-400">{formatCurrency(reportData.summary.totalExpenses)}</p>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted">Bénéfice Net</span>
                <DollarSign className="w-5 h-5 text-indigo-400" />
              </div>
              <p className={`text-2xl font-bold ${reportData.summary.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(reportData.summary.netProfit)}
              </p>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted">Achats</span>
                <FileText className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-2xl font-bold text-yellow-400">{formatCurrency(reportData.summary.totalAchats)}</p>
            </div>
          </div>

          {/* Caisses Overview */}
          <div className="glass-card p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-4">État des Caisses</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {reportData.caisses.map((caisse) => (
                <div key={caisse.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-white">{caisse.name}</p>
                      <p className="text-xs text-muted">{caisse.type}</p>
                    </div>
                    <span className="text-xs text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded">
                      {caisse.transactions} transactions
                    </span>
                  </div>
                  <p className="text-lg font-bold text-green-400">{formatCurrency(caisse.balance)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Transactions Table */}
          <div className="glass-card p-6 mb-6">
            <h3 className="text-xl font-bold text-white mb-4">Transactions Récentes</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Description</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Caisse</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.transactions.slice(0, 10).map((transaction) => (
                    <tr key={transaction.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 text-sm text-slate-300">
                        {new Date(transaction.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded ${
                          transaction.type === 'REVENUE' ? 'bg-green-400/10 text-green-400' :
                          transaction.type === 'ACHAT' ? 'bg-yellow-400/10 text-yellow-400' :
                          transaction.type === 'CHARGE' ? 'bg-red-400/10 text-red-400' :
                          'bg-blue-400/10 text-blue-400'
                        }`}>
                          {transaction.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-300">{transaction.description}</td>
                      <td className="py-3 px-4 text-sm text-slate-400">{transaction.caisseName || '-'}</td>
                      <td className={`py-3 px-4 text-sm text-right font-semibold ${
                        transaction.type === 'REVENUE' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {transaction.type === 'REVENUE' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Achats List */}
          {reportData.achats.length > 0 && (
            <div className="glass-card p-6 mb-6">
              <h3 className="text-xl font-bold text-white mb-4">Achats ({reportData.achats.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {reportData.achats.map((achat) => (
                  <div key={achat.id} className="bg-white/5 rounded-lg p-4 border border-white/10 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-white">{achat.description}</p>
                      <div className="flex gap-3 mt-1">
                        <span className="text-xs text-muted">
                          {new Date(achat.date).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="text-xs text-indigo-400">{achat.category}</span>
                        {achat.reference && (
                          <span className="text-xs text-slate-400">Réf: {achat.reference}</span>
                        )}
                      </div>
                    </div>
                    <p className="text-lg font-bold text-yellow-400">{formatCurrency(achat.amount)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Charges List */}
          {reportData.charges.length > 0 && (
            <div className="glass-card p-6 mb-6">
              <h3 className="text-xl font-bold text-white mb-4">Charges ({reportData.charges.length})</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {reportData.charges.map((charge) => (
                  <div key={charge.id} className="bg-white/5 rounded-lg p-4 border border-white/10 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-white">{charge.description}</p>
                      <div className="flex gap-3 mt-1">
                        <span className="text-xs text-muted">
                          {new Date(charge.date).toLocaleDateString('fr-FR')}
                        </span>
                        <span className="text-xs text-purple-400">{charge.category}</span>
                        <span className={`text-xs ${charge.isPaid ? 'text-green-400' : 'text-red-400'}`}>
                          {charge.isPaid ? 'Payé' : 'Non payé'}
                        </span>
                      </div>
                    </div>
                    <p className="text-lg font-bold text-red-400">{formatCurrency(charge.amount)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Client Orders */}
          {reportData.clientOrders.length > 0 && (
            <div className="glass-card p-6 mb-6">
              <h3 className="text-xl font-bold text-white mb-4">Commandes Clients ({reportData.clientOrders.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">N° Commande</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Client</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Date</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Total</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Payé</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Restant</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.clientOrders.map((order) => (
                      <tr key={order.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4 text-sm text-white font-mono">{order.orderNumber}</td>
                        <td className="py-3 px-4 text-sm text-slate-300">{order.clientName}</td>
                        <td className="py-3 px-4 text-sm text-slate-400">
                          {new Date(order.orderDate).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-semibold text-white">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-semibold text-green-400">
                          {formatCurrency(order.paidAmount)}
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-semibold text-orange-400">
                          {formatCurrency(order.remainingAmount)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded ${
                            order.status === 'FULLY_PAID' ? 'bg-green-400/10 text-green-400' :
                            order.status === 'PARTIALLY_PAID' ? 'bg-orange-400/10 text-orange-400' :
                            order.status === 'CONFIRMED' ? 'bg-blue-400/10 text-blue-400' :
                            order.status === 'CANCELLED' ? 'bg-red-400/10 text-red-400' :
                            'bg-slate-400/10 text-slate-400'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Supplier Orders */}
          {reportData.supplierOrders.length > 0 && (
            <div className="glass-card p-6 mb-6">
              <h3 className="text-xl font-bold text-white mb-4">Commandes Fournisseurs ({reportData.supplierOrders.length})</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">N° Commande</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Fournisseur</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Date</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Total</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Payé</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-300">Restant</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-slate-300">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.supplierOrders.map((order) => (
                      <tr key={order.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4 text-sm text-white font-mono">{order.orderNumber}</td>
                        <td className="py-3 px-4 text-sm text-slate-300">{order.supplierName}</td>
                        <td className="py-3 px-4 text-sm text-slate-400">
                          {new Date(order.orderDate).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-semibold text-white">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-semibold text-green-400">
                          {formatCurrency(order.paidAmount)}
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-semibold text-orange-400">
                          {formatCurrency(order.remainingAmount)}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded ${
                            order.status === 'FULLY_PAID' ? 'bg-green-400/10 text-green-400' :
                            order.status === 'PARTIALLY_PAID' ? 'bg-orange-400/10 text-orange-400' :
                            order.status === 'CONFIRMED' ? 'bg-blue-400/10 text-blue-400' :
                            order.status === 'CANCELLED' ? 'bg-red-400/10 text-red-400' :
                            'bg-slate-400/10 text-slate-400'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}



