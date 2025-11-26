'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Trash2, Edit, X, Eye } from 'lucide-react'
import Modal from './Modal'

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
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingCaisse, setEditingCaisse] = useState<Caisse | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [showDetailsModal, setShowDetailsModal] = useState(false)
    const [selectedCaisse, setSelectedCaisse] = useState<Caisse | null>(null)

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

    const handleDetails = (caisse: Caisse) => {
        setSelectedCaisse(caisse)
        setShowDetailsModal(true)
    }

    const handleEdit = (caisse: Caisse) => {
        setEditingCaisse(caisse)
        setShowEditModal(true)
    }

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!editingCaisse) return

        setSubmitting(true)
        const formData = new FormData(e.currentTarget)

        try {
            const response = await fetch('/api/caisses', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingCaisse.id,
                    name: formData.get('name'),
                    type: formData.get('type'),
                    fixedAmount: formData.get('fixedAmount') ? parseFloat(formData.get('fixedAmount') as string) : null,
                    description: formData.get('description')
                })
            })

            if (response.ok) {
                setShowEditModal(false)
                setEditingCaisse(null)
                fetchCaisses()
            }
        } catch (error) {
            console.error('Error updating caisse:', error)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette caisse?')) return

        try {
            const response = await fetch(`/api/caisses?id=${id}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                fetchCaisses()
            }
        } catch (error) {
            console.error('Error deleting caisse:', error)
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
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => handleDetails(caisse)}
                                                className="p-2 hover:bg-indigo-500/10 text-slate-400 hover:text-indigo-400 rounded-lg transition-colors"
                                                title="Détails"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleEdit(caisse)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                                                title="Modifier"
                                            >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                            <button 
                                                onClick={() => handleDelete(caisse.id)}
                                                className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                                                title="Supprimer"
                                            >
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

            {/* Edit Modal */}
            <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Modifier la Caisse">
                {editingCaisse && (
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Nom de la Caisse</label>
                            <input
                                type="text"
                                name="name"
                                defaultValue={editingCaisse.name}
                                required
                                className="input"
                                placeholder="Ex: Caisse Principale"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Type</label>
                            <select name="type" defaultValue={editingCaisse.type} required className="input">
                                <option value="MAGASIN">Magasin</option>
                                <option value="EVENEMENTS">Événements</option>
                                <option value="DEPOT">Dépôt</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Montant Fixe (optionnel)</label>
                            <input
                                type="number"
                                name="fixedAmount"
                                defaultValue={editingCaisse.fixedAmount || ''}
                                step="0.01"
                                className="input"
                                placeholder="Ex: 5000"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                                name="description"
                                defaultValue={editingCaisse.description || ''}
                                className="input min-h-[80px]"
                                placeholder="Description de la caisse..."
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowEditModal(false)}
                                className="btn-secondary flex-1"
                                disabled={submitting}
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="btn-primary flex-1"
                                disabled={submitting}
                            >
                                {submitting ? 'Modification...' : 'Modifier'}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>

            {/* Details Modal */}
            <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title={`Détails: ${selectedCaisse?.name || ''}`}>
                {selectedCaisse && (
                    <div className="space-y-6">
                        {/* Caisse Info */}
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-slate-400 mb-1">Type</p>
                                    <p className="text-white font-medium">{selectedCaisse.type}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 mb-1">Solde Actuel</p>
                                    <p className="text-2xl font-bold text-emerald-400">{selectedCaisse.balance.toLocaleString()} DH</p>
                                </div>
                                {selectedCaisse.fixedAmount && (
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1">Montant Fixe</p>
                                        <p className="text-white font-medium">{selectedCaisse.fixedAmount.toLocaleString()} DH</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs text-slate-400 mb-1">Nombre de Transactions</p>
                                    <p className="text-white font-medium">{selectedCaisse.transactions?.length || 0}</p>
                                </div>
                            </div>
                            {selectedCaisse.description && (
                                <div className="mt-4 pt-4 border-t border-white/10">
                                    <p className="text-xs text-slate-400 mb-1">Description</p>
                                    <p className="text-white">{selectedCaisse.description}</p>
                                </div>
                            )}
                        </div>

                        {/* Transactions List */}
                        <div>
                            <h3 className="text-lg font-bold text-white mb-4">Historique des Transactions</h3>
                            {selectedCaisse.transactions && selectedCaisse.transactions.length > 0 ? (
                                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                    {selectedCaisse.transactions.map((transaction) => (
                                        <div key={transaction.id} className="bg-white/5 p-4 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1">
                                                    <p className="text-white font-medium">{transaction.description}</p>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        {format(new Date(transaction.date), 'dd/MM/yyyy HH:mm')}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`badge ${
                                                        transaction.type === 'REVENUE' ? 'badge-success' :
                                                        transaction.type === 'ACHAT' ? 'badge-error' :
                                                        transaction.type === 'CHARGE' ? 'badge-warning' :
                                                        'badge-info'
                                                    }`}>
                                                        {transaction.type}
                                                    </span>
                                                    <p className={`text-lg font-bold mt-1 ${
                                                        transaction.type === 'REVENUE' ? 'text-emerald-400' : 'text-rose-400'
                                                    }`}>
                                                        {transaction.type === 'REVENUE' ? '+' : '-'}{transaction.amount.toLocaleString()} DH
                                                    </p>
                                                </div>
                                            </div>
                                            {transaction.user && (
                                                <p className="text-xs text-slate-500">
                                                    Par: {transaction.user.name}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-slate-400">
                                    <p>Aucune transaction trouvée</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </>
    )
}

export function AchatsTable() {
    const [achats, setAchats] = useState<Achat[]>([])
    const [loading, setLoading] = useState(true)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingAchat, setEditingAchat] = useState<Achat | null>(null)
    const [submitting, setSubmitting] = useState(false)

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

    const handleEdit = (achat: Achat) => {
        setEditingAchat(achat)
        setShowEditModal(true)
    }

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!editingAchat) return

        setSubmitting(true)
        const formData = new FormData(e.currentTarget)

        try {
            const response = await fetch('/api/achats', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingAchat.id,
                    description: formData.get('description'),
                    amount: parseFloat(formData.get('amount') as string),
                    category: formData.get('category'),
                    reference: formData.get('reference'),
                    notes: formData.get('notes')
                })
            })

            if (response.ok) {
                setShowEditModal(false)
                setEditingAchat(null)
                fetchAchats()
            }
        } catch (error) {
            console.error('Error updating achat:', error)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet achat?')) return

        try {
            const response = await fetch(`/api/achats?id=${id}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                fetchAchats()
            }
        } catch (error) {
            console.error('Error deleting achat:', error)
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
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => handleEdit(achat)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                                                title="Modifier"
                                            >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                            <button 
                                                onClick={() => handleDelete(achat.id)}
                                                className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                                                title="Supprimer"
                                            >
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

            {/* Edit Modal */}
            <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Modifier l'Achat">
                {editingAchat && (
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <input
                                type="text"
                                name="description"
                                defaultValue={editingAchat.description}
                                required
                                className="input"
                                placeholder="Description de l'achat"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Montant (DH)</label>
                            <input
                                type="number"
                                name="amount"
                                defaultValue={editingAchat.amount}
                                required
                                step="0.01"
                                min="0"
                                className="input"
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Catégorie</label>
                            <select name="category" defaultValue={editingAchat.category} required className="input">
                                <option value="MAGASIN">Magasin</option>
                                <option value="SOCIETE">Société</option>
                                <option value="EVENEMENT">Événement</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Référence</label>
                            <input
                                type="text"
                                name="reference"
                                defaultValue={editingAchat.reference || ''}
                                className="input"
                                placeholder="Référence de l'achat"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Notes</label>
                            <textarea
                                name="notes"
                                defaultValue={editingAchat.notes || ''}
                                className="input min-h-[80px]"
                                placeholder="Notes additionnelles..."
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowEditModal(false)}
                                className="btn-secondary flex-1"
                                disabled={submitting}
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="btn-primary flex-1"
                                disabled={submitting}
                            >
                                {submitting ? 'Modification...' : 'Modifier'}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </>
    )
}

export function ChargesTable() {
    const [charges, setCharges] = useState<Charge[]>([])
    const [loading, setLoading] = useState(true)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingCharge, setEditingCharge] = useState<Charge | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [categories, setCategories] = useState<string[]>([])

    useEffect(() => {
        fetchCharges()
        fetchCategories()
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

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/charge-categories')
            if (response.ok) {
                const data = await response.json()
                setCategories(data.map((cat: any) => cat.name))
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    const handleEdit = (charge: Charge) => {
        setEditingCharge(charge)
        setShowEditModal(true)
    }

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!editingCharge) return

        setSubmitting(true)
        const formData = new FormData(e.currentTarget)

        try {
            const response = await fetch('/api/charges', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingCharge.id,
                    description: formData.get('description'),
                    amount: parseFloat(formData.get('amount') as string),
                    category: formData.get('category'),
                    reference: formData.get('reference'),
                    notes: formData.get('notes'),
                    isPaid: formData.get('isPaid') === 'on'
                })
            })

            if (response.ok) {
                setShowEditModal(false)
                setEditingCharge(null)
                fetchCharges()
            }
        } catch (error) {
            console.error('Error updating charge:', error)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette charge?')) return

        try {
            const response = await fetch(`/api/charges?id=${id}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                fetchCharges()
            }
        } catch (error) {
            console.error('Error deleting charge:', error)
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
                                        <span className="badge badge-warning">{charge.category}</span>
                                    </td>
                                    <td className="table-cell text-right font-bold text-orange-400 tracking-tight">
                                        -{charge.amount.toLocaleString()} <span className="text-orange-400/50 text-xs font-normal">DH</span>
                                    </td>
                                    <td className="table-cell text-center">
                                        <span className={`badge ${charge.isPaid ? 'badge-success' : 'badge-error'}`}>
                                            {charge.isPaid ? 'Payée' : 'Non payée'}
                                        </span>
                                    </td>
                                    <td className="table-cell text-slate-400 font-mono text-xs">{charge.reference || '-'}</td>
                                    <td className="table-cell">
                                        <div className="flex items-center justify-center gap-2">
                                                <button 
                                                onClick={() => handleEdit(charge)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                                                title="Modifier"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(charge.id)}
                                                className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                                                title="Supprimer"
                                            >
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

            {/* Edit Modal */}
            <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Modifier la Charge">
                {editingCharge && (
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <input
                                type="text"
                                name="description"
                                defaultValue={editingCharge.description}
                                required
                                className="input"
                                placeholder="Description de la charge"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-2">Montant (DH)</label>
                            <input
                                type="number"
                                name="amount"
                                defaultValue={editingCharge.amount}
                                required
                                step="0.01"
                                min="0"
                                className="input"
                                placeholder="0.00"
                            />
                                </div>
                            
                            <div>
                            <label className="block text-sm font-medium mb-2">Catégorie</label>
                            <select name="category" defaultValue={editingCharge.category} required className="input">
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Référence</label>
                            <input
                                type="text"
                                name="reference"
                                defaultValue={editingCharge.reference || ''}
                                className="input"
                                placeholder="Référence de la charge"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Notes</label>
                            <textarea
                                name="notes"
                                defaultValue={editingCharge.notes || ''}
                                className="input min-h-[80px]"
                                placeholder="Notes additionnelles..."
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="isPaid"
                                id="isPaid"
                                defaultChecked={editingCharge.isPaid}
                                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor="isPaid" className="text-sm font-medium">
                                Charge déjà payée
                            </label>
                        </div>

                            <div className="flex gap-3 pt-4">
                                <button 
                                    type="button" 
                                onClick={() => setShowEditModal(false)}
                                className="btn-secondary flex-1"
                                disabled={submitting}
                                >
                                    Annuler
                                </button>
                            <button
                                type="submit"
                                className="btn-primary flex-1"
                                disabled={submitting}
                            >
                                {submitting ? 'Modification...' : 'Modifier'}
                            </button>
                            </div>
                        </form>
            )}
            </Modal>
        </>
    )
}
