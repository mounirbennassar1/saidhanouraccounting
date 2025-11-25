'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Trash2, Edit, MoreHorizontal, ArrowRight } from 'lucide-react'

interface Transaction {
    id: string
    type: string
    amount: number
    description: string
    date: string
    caisse?: { name: string }
    user?: { name: string; email: string }
}

interface Caisse {
    id: string
    name: string
    type: string
    balance: number
    fixedAmount: number | null
    description: string | null
    createdAt: string
    transactions: Transaction[]
}

interface Achat {
    id: string
    description: string
    amount: number
    category: string
    date: string
    reference: string | null
    notes: string | null
}

interface Charge {
    id: string
    description: string
    amount: number
    category: string
    date: string
    reference: string | null
    notes: string | null
    isPaid: boolean
}

export function CaissesTable() {
    const [caisses, setCaisses] = useState<Caisse[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchCaisses()
    }, [])

    const fetchCaisses = async () => {
        try {
            const response = await fetch('/api/caisses')
            if (response.ok) {
                const data = await response.json()
                setCaisses(data)
            }
        } catch (error) {
            console.error('Error fetching caisses:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="skeleton h-64 w-full rounded-2xl"></div>
    }

    return (
        <div className="card overflow-hidden border-0">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="table-header text-left">Nom de la Caisse</th>
                            <th className="table-header text-left">Type</th>
                            <th className="table-header text-right">Solde Actuel</th>
                            <th className="table-header text-right">Montant Fixe</th>
                            <th className="table-header text-left">Description</th>
                            <th className="table-header text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {caisses.map((caisse) => (
                            <tr key={caisse.id} className="table-row group">
                                <td className="table-cell font-medium text-white">{caisse.name}</td>
                                <td className="table-cell">
                                    <span className={`badge ${caisse.type === 'MAGASIN' ? 'badge-success' :
                                            caisse.type === 'EVENEMENTS' ? 'badge-info' :
                                                'badge-warning'
                                        }`}>
                                        {caisse.type}
                                    </span>
                                </td>
                                <td className="table-cell text-right font-bold text-white tracking-tight">
                                    {caisse.balance.toLocaleString()} <span className="text-slate-500 text-xs font-normal">DH</span>
                                </td>
                                <td className="table-cell text-right text-slate-400">
                                    {caisse.fixedAmount ? `${caisse.fixedAmount.toLocaleString()} DH` : '-'}
                                </td>
                                <td className="table-cell text-slate-400 max-w-xs truncate">{caisse.description || '-'}</td>
                                <td className="table-cell">
                                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export function AchatsTable() {
    const [achats, setAchats] = useState<Achat[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAchats()
    }, [])

    const fetchAchats = async () => {
        try {
            const response = await fetch('/api/achats')
            if (response.ok) {
                const data = await response.json()
                setAchats(data)
            }
        } catch (error) {
            console.error('Error fetching achats:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <div className="skeleton h-64 w-full rounded-2xl"></div>
    }

    return (
        <div className="card overflow-hidden border-0">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="table-header text-left">Date</th>
                            <th className="table-header text-left">Description</th>
                            <th className="table-header text-left">Catégorie</th>
                            <th className="table-header text-right">Montant</th>
                            <th className="table-header text-left">Référence</th>
                            <th className="table-header text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {achats.map((achat) => (
                            <tr key={achat.id} className="table-row group">
                                <td className="table-cell text-slate-400 text-sm">
                                    {format(new Date(achat.date), 'dd MMM yyyy')}
                                </td>
                                <td className="table-cell font-medium text-white">{achat.description}</td>
                                <td className="table-cell">
                                    <span className="badge badge-info">{achat.category}</span>
                                </td>
                                <td className="table-cell text-right font-bold text-rose-400 tracking-tight">
                                    -{achat.amount.toLocaleString()} <span className="text-rose-400/50 text-xs font-normal">DH</span>
                                </td>
                                <td className="table-cell text-slate-400 font-mono text-xs">{achat.reference || '-'}</td>
                                <td className="table-cell">
                                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export function ChargesTable() {
    const [charges, setCharges] = useState<Charge[]>([])
    const [loading, setLoading] = useState(true)
    const [showPayModal, setShowPayModal] = useState(false)
    const [selectedCharge, setSelectedCharge] = useState<Charge | null>(null)
    const [caisses, setCaisses] = useState<Caisse[]>([])
    const [paying, setPaying] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchCharges()
        fetchCaisses()
    }, [])

    const fetchCharges = async () => {
        try {
            const response = await fetch('/api/charges')
            if (response.ok) {
                const data = await response.json()
                setCharges(data)
            }
        } catch (error) {
            console.error('Error fetching charges:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchCaisses = async () => {
        try {
            const response = await fetch('/api/caisses')
            if (response.ok) {
                const data = await response.json()
                setCaisses(data)
            }
        } catch (error) {
            console.error('Error fetching caisses:', error)
        }
    }

    const handlePayCharge = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!selectedCharge) return

        setPaying(true)
        setError(null)
        const formData = new FormData(e.currentTarget)
        const caisseId = formData.get('caisseId') as string

        try {
            const response = await fetch('/api/charges', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chargeId: selectedCharge.id,
                    isPaid: true,
                    caisseId
                })
            })

            if (response.ok) {
                setShowPayModal(false)
                setSelectedCharge(null)
                fetchCharges()
                fetchCaisses()
            } else {
                const data = await response.json()
                setError(data.error || 'Erreur lors du paiement de la charge')
            }
        } catch (error) {
            console.error('Error paying charge:', error)
            setError('Erreur de connexion au serveur')
        } finally {
            setPaying(false)
        }
    }

    const handleUnpayCharge = async (chargeId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir marquer cette charge comme impayée ?')) return

        try {
            const response = await fetch('/api/charges', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chargeId,
                    isPaid: false
                })
            })

            if (response.ok) {
                fetchCharges()
                fetchCaisses()
            }
        } catch (error) {
            console.error('Error unpaying charge:', error)
        }
    }

    if (loading) {
        return <div className="skeleton h-64 w-full rounded-2xl"></div>
    }

    return (
        <>
            <div className="card overflow-hidden border-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className="table-header text-left">Date</th>
                                <th className="table-header text-left">Description</th>
                                <th className="table-header text-left">Catégorie</th>
                                <th className="table-header text-right">Montant</th>
                                <th className="table-header text-center">Statut</th>
                                <th className="table-header text-left">Référence</th>
                                <th className="table-header text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {charges.map((charge) => (
                                <tr key={charge.id} className="table-row group">
                                    <td className="table-cell text-slate-400 text-sm">
                                        {format(new Date(charge.date), 'dd MMM yyyy')}
                                    </td>
                                    <td className="table-cell font-medium text-white">{charge.description}</td>
                                    <td className="table-cell">
                                        <span className="badge badge-info text-xs">
                                            {charge.category.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="table-cell text-right font-bold text-cyan-400 tracking-tight">
                                        {charge.amount.toLocaleString()} <span className="text-cyan-400/50 text-xs font-normal">DH</span>
                                    </td>
                                    <td className="table-cell text-center">
                                        {charge.isPaid ? (
                                            <span className="badge badge-success">Payé</span>
                                        ) : (
                                            <span className="badge badge-warning">Impayé</span>
                                        )}
                                    </td>
                                    <td className="table-cell text-slate-400 font-mono text-xs">{charge.reference || '-'}</td>
                                    <td className="table-cell">
                                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {!charge.isPaid ? (
                                                <button 
                                                    onClick={() => {
                                                        setSelectedCharge(charge)
                                                        setShowPayModal(true)
                                                        setError(null)
                                                    }}
                                                    className="p-2 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 rounded-lg transition-colors flex items-center gap-1 text-xs"
                                                    title="Marquer comme payé"
                                                >
                                                    <ArrowRight className="w-4 h-4" />
                                                    Payer
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => handleUnpayCharge(charge.id)}
                                                    className="p-2 hover:bg-amber-500/10 text-slate-400 hover:text-amber-400 rounded-lg transition-colors flex items-center gap-1 text-xs"
                                                    title="Marquer comme impayé"
                                                >
                                                    Annuler
                                                </button>
                                            )}
                                            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pay Charge Modal */}
            {showPayModal && selectedCharge && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-white mb-4">Payer la Charge</h3>
                        <div className="mb-4 p-4 bg-white/5 rounded-lg">
                            <p className="text-sm text-slate-400">Description</p>
                            <p className="text-white font-medium">{selectedCharge.description}</p>
                            <p className="text-sm text-slate-400 mt-2">Montant</p>
                            <p className="text-2xl font-bold text-cyan-400">{selectedCharge.amount.toLocaleString()} DH</p>
                        </div>
                        
                        <form onSubmit={handlePayCharge} className="space-y-4">
                            {error && (
                                <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4 text-rose-400 text-sm">
                                    {error}
                                </div>
                            )}
                            
                            <div>
                                <label className="block text-sm font-medium mb-2 text-slate-300">
                                    Caisse à débiter <span className="text-rose-400">*</span>
                                </label>
                                <select name="caisseId" required className="input">
                                    <option value="">Sélectionner une caisse</option>
                                    {caisses.map(caisse => (
                                        <option 
                                            key={caisse.id} 
                                            value={caisse.id}
                                            disabled={caisse.balance < selectedCharge.amount}
                                        >
                                            {caisse.name} ({caisse.balance.toLocaleString()} DH)
                                            {caisse.balance < selectedCharge.amount && ' - Solde insuffisant'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button 
                                    type="submit" 
                                    disabled={paying}
                                    className="btn btn-primary bg-emerald-600 hover:bg-emerald-700 flex-1"
                                >
                                    {paying ? 'Paiement...' : 'Confirmer le Paiement'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setShowPayModal(false)
                                        setSelectedCharge(null)
                                        setError(null)
                                    }}
                                    className="btn btn-secondary"
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
