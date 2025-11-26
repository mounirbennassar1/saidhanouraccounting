'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ShoppingBag, Plus, Edit, Trash2, TrendingUp } from 'lucide-react'
import Modal from './Modal'

interface Caisse {
    id: string
    name: string
    balance: number
}

interface Vente {
    id: string
    description: string
    amount: number
    quantity: number
    unitPrice: number
    category: string | null
    date: string
    reference: string | null
    notes: string | null
    clientOrderId: string | null
    transactions: Array<{
        caisse: { name: string } | null
    }>
}

export default function VentesManagement() {
    const [ventes, setVentes] = useState<Vente[]>([])
    const [caisses, setCaisses] = useState<Caisse[]>([])
    const [loading, setLoading] = useState(true)
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingVente, setEditingVente] = useState<Vente | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchVentes()
        fetchCaisses()
    }, [])

    const fetchVentes = async () => {
        try {
            const response = await fetch('/api/ventes')
            if (response.ok) {
                const data = await response.json()
                setVentes(data)
            }
        } catch (error) {
            console.error('Error fetching ventes:', error)
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

    const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSubmitting(true)
        setError(null)
        const formData = new FormData(e.currentTarget)

        try {
            const response = await fetch('/api/ventes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: formData.get('description'),
                    quantity: parseFloat(formData.get('quantity') as string),
                    unitPrice: parseFloat(formData.get('unitPrice') as string),
                    category: formData.get('category'),
                    reference: formData.get('reference'),
                    notes: formData.get('notes'),
                    caisseId: formData.get('caisseId') || null
                })
            })

            if (response.ok) {
                setShowAddModal(false)
                fetchVentes()
                fetchCaisses()
                e.currentTarget.reset()
            } else {
                const data = await response.json()
                setError(data.error || 'Erreur lors de la création de la vente')
            }
        } catch (error) {
            console.error('Error creating vente:', error)
            setError('Erreur de connexion au serveur')
        } finally {
            setSubmitting(false)
        }
    }

    const handleEdit = (vente: Vente) => {
        setEditingVente(vente)
        setShowEditModal(true)
    }

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!editingVente) return

        setSubmitting(true)
        setError(null)
        const formData = new FormData(e.currentTarget)

        try {
            const response = await fetch('/api/ventes', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editingVente.id,
                    description: formData.get('description'),
                    quantity: parseFloat(formData.get('quantity') as string),
                    unitPrice: parseFloat(formData.get('unitPrice') as string),
                    category: formData.get('category'),
                    reference: formData.get('reference'),
                    notes: formData.get('notes')
                })
            })

            if (response.ok) {
                setShowEditModal(false)
                setEditingVente(null)
                fetchVentes()
            } else {
                const data = await response.json()
                setError(data.error || 'Erreur lors de la modification')
            }
        } catch (error) {
            console.error('Error updating vente:', error)
            setError('Erreur de connexion au serveur')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette vente? Le solde de la caisse sera ajusté.')) return

        try {
            const response = await fetch(`/api/ventes?id=${id}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                fetchVentes()
                fetchCaisses()
            }
        } catch (error) {
            console.error('Error deleting vente:', error)
        }
    }

    const totalRevenue = ventes.reduce((sum, vente) => sum + vente.amount, 0)
    const totalQuantity = ventes.reduce((sum, vente) => sum + vente.quantity, 0)

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400 animate-pulse">Chargement des ventes...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="animate-fade-in space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold gradient-text mb-2">Gestion des Ventes</h2>
                    <p className="text-muted">Gérez toutes les ventes et revenus</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="btn btn-primary bg-emerald-600 hover:bg-emerald-700"
                >
                    <Plus className="w-4 h-4" />
                    Nouvelle Vente
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="card p-6 hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-xs font-medium mb-1">Total Ventes</p>
                            <h4 className="text-2xl font-bold text-white">{ventes.length}</h4>
                            <p className="text-xs text-slate-500 mt-1">Transactions enregistrées</p>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="card p-6 hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-xs font-medium mb-1">Revenu Total</p>
                            <h4 className="text-2xl font-bold text-emerald-400">{totalRevenue.toLocaleString()} DH</h4>
                            <p className="text-xs text-slate-500 mt-1">Toutes les ventes</p>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="card p-6 hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-xs font-medium mb-1">Quantité Totale</p>
                            <h4 className="text-2xl font-bold text-white">{totalQuantity.toLocaleString()}</h4>
                            <p className="text-xs text-slate-500 mt-1">Articles vendus</p>
                        </div>
                        <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Ventes Table */}
            <div className="card overflow-hidden border-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className="table-header text-left">Date</th>
                                <th className="table-header text-left">Description</th>
                                <th className="table-header text-right">Quantité</th>
                                <th className="table-header text-right">Prix Unitaire</th>
                                <th className="table-header text-right">Montant Total</th>
                                <th className="table-header text-left">Caisse</th>
                                <th className="table-header text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ventes.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="table-cell text-center py-12 text-slate-400">
                                        Aucune vente enregistrée
                                    </td>
                                </tr>
                            ) : (
                                ventes.map((vente) => (
                                    <tr key={vente.id} className="table-row group">
                                        <td className="table-cell text-slate-400">
                                            {format(new Date(vente.date), 'dd/MM/yyyy')}
                                        </td>
                                        <td className="table-cell font-medium text-white">
                                            <div>
                                                <p>{vente.description}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {vente.category && (
                                                        <span className="text-xs text-slate-500">{vente.category}</span>
                                                    )}
                                                    {vente.clientOrderId && (
                                                        <span className="badge badge-info text-xs">
                                                            Client Order
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="table-cell text-right text-white">{vente.quantity}</td>
                                        <td className="table-cell text-right text-slate-400">
                                            {vente.unitPrice.toLocaleString()} DH
                                        </td>
                                        <td className="table-cell text-right font-bold text-emerald-400">
                                            {vente.amount.toLocaleString()} DH
                                        </td>
                                        <td className="table-cell">
                                            {vente.transactions[0]?.caisse ? (
                                                <span className="badge badge-success">
                                                    {vente.transactions[0].caisse.name}
                                                </span>
                                            ) : (
                                                <span className="text-slate-500 text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="table-cell">
                                            <div className="flex items-center justify-center gap-2">
                                                {vente.clientOrderId ? (
                                                    <span className="text-xs text-slate-500 italic">
                                                        Lié à commande
                                                    </span>
                                                ) : (
                                                    <>
                                                        <button 
                                                            onClick={() => handleEdit(vente)}
                                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                                                            title="Modifier"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDelete(vente.id)}
                                                            className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                                                            title="Supprimer"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Vente Modal */}
            <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setError(null); }} title="Nouvelle Vente">
                <form onSubmit={handleAdd} className="space-y-4">
                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4 text-rose-400 text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">Description</label>
                        <input type="text" name="description" required className="input" placeholder="Ex: Vente produit X" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 text-slate-300">Quantité</label>
                            <input type="number" name="quantity" step="0.01" required className="input" placeholder="1" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 text-slate-300">Prix Unitaire (DH)</label>
                            <input type="number" name="unitPrice" step="0.01" required className="input" placeholder="0.00" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">Catégorie (optionnel)</label>
                        <input type="text" name="category" className="input" placeholder="Ex: Électronique" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">Caisse de destination</label>
                        <select name="caisseId" required className="input">
                            <option value="">Sélectionner une caisse</option>
                            {caisses.map(caisse => (
                                <option key={caisse.id} value={caisse.id}>
                                    {caisse.name} ({caisse.balance.toLocaleString()} DH)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">Référence (optionnel)</label>
                        <input type="text" name="reference" className="input" placeholder="Référence..." />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">Notes (optionnel)</label>
                        <textarea name="notes" rows={3} className="input" placeholder="Notes additionnelles..."></textarea>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="submit" disabled={submitting} className="btn btn-primary bg-emerald-600 hover:bg-emerald-700 flex-1">
                            {submitting ? 'Création...' : 'Créer la Vente'}
                        </button>
                        <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                            Annuler
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Edit Vente Modal */}
            <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setError(null); }} title="Modifier la Vente">
                {editingVente && (
                    <form onSubmit={handleUpdate} className="space-y-4">
                        {error && (
                            <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4 text-rose-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <input
                                type="text"
                                name="description"
                                defaultValue={editingVente.description}
                                required
                                className="input"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Quantité</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    step="0.01"
                                    defaultValue={editingVente.quantity}
                                    required
                                    className="input"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Prix Unitaire (DH)</label>
                                <input
                                    type="number"
                                    name="unitPrice"
                                    step="0.01"
                                    defaultValue={editingVente.unitPrice}
                                    required
                                    className="input"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Catégorie</label>
                            <input
                                type="text"
                                name="category"
                                defaultValue={editingVente.category || ''}
                                className="input"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Référence</label>
                            <input
                                type="text"
                                name="reference"
                                defaultValue={editingVente.reference || ''}
                                className="input"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Notes</label>
                            <textarea
                                name="notes"
                                rows={3}
                                defaultValue={editingVente.notes || ''}
                                className="input"
                            ></textarea>
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
        </div>
    )
}

