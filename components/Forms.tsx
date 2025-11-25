'use client'

import { useState, useEffect } from 'react'
import Modal from './Modal'
import CategoryManager from './CategoryManager'
import { Plus, Wallet, ShoppingCart, Receipt, TrendingUp } from 'lucide-react'

interface FormsProps {
    onSuccess: () => void
}

interface Caisse {
    id: string
    name: string
    balance: number
}

interface ChargeCategory {
    id: string
    name: string
    description: string | null
    color: string | null
}

export default function Forms({ onSuccess }: FormsProps) {
    const [showCaisseModal, setShowCaisseModal] = useState(false)
    const [showAchatModal, setShowAchatModal] = useState(false)
    const [showChargeModal, setShowChargeModal] = useState(false)
    const [showRevenueModal, setShowRevenueModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [caisses, setCaisses] = useState<Caisse[]>([])
    const [chargeCategories, setChargeCategories] = useState<ChargeCategory[]>([])

    useEffect(() => {
        fetchCaisses()
        fetchChargeCategories()
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
        }
    }

    const fetchChargeCategories = async () => {
        try {
            const response = await fetch('/api/charge-categories')
            if (response.ok) {
                const data = await response.json()
                setChargeCategories(data)
            }
        } catch (error) {
            console.error('Error fetching charge categories:', error)
        }
    }

    const handleCaisseSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)

        try {
            const response = await fetch('/api/caisses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.get('name'),
                    type: formData.get('type'),
                    balance: parseFloat(formData.get('balance') as string) || 0,
                    fixedAmount: formData.get('fixedAmount') ? parseFloat(formData.get('fixedAmount') as string) : null,
                    description: formData.get('description')
                })
            })

            if (response.ok) {
                setShowCaisseModal(false)
                onSuccess()
                fetchCaisses() // Refresh caisses list
                e.currentTarget.reset()
            }
        } catch (error) {
            console.error('Error creating caisse:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAchatSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        const formData = new FormData(e.currentTarget)

        try {
            const response = await fetch('/api/achats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: formData.get('description'),
                    amount: parseFloat(formData.get('amount') as string),
                    category: formData.get('category'),
                    reference: formData.get('reference'),
                    notes: formData.get('notes'),
                    caisseId: formData.get('caisseId') || null
                })
            })

            if (response.ok) {
                setShowAchatModal(false)
                onSuccess()
                fetchCaisses() // Refresh caisses
                e.currentTarget.reset()
            } else {
                const data = await response.json()
                setError(data.error || 'Erreur lors de la création de l\'achat')
            }
        } catch (error) {
            console.error('Error creating achat:', error)
            setError('Erreur de connexion au serveur')
        } finally {
            setLoading(false)
        }
    }

    const handleChargeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        const formData = new FormData(e.currentTarget)

        try {
            const response = await fetch('/api/charges', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: formData.get('description'),
                    amount: parseFloat(formData.get('amount') as string),
                    category: formData.get('category'),
                    reference: formData.get('reference'),
                    notes: formData.get('notes'),
                    isPaid: formData.get('isPaid') === 'on',
                    caisseId: formData.get('caisseId') || null
                })
            })

            if (response.ok) {
                setShowChargeModal(false)
                onSuccess()
                fetchCaisses() // Refresh caisses
                fetchChargeCategories() // Refresh categories
                e.currentTarget.reset()
            } else {
                const data = await response.json()
                setError(data.error || 'Erreur lors de la création de la charge')
            }
        } catch (error) {
            console.error('Error creating charge:', error)
            setError('Erreur de connexion au serveur')
        } finally {
            setLoading(false)
        }
    }

    const handleRevenueSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        const formData = new FormData(e.currentTarget)

        try {
            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'REVENUE',
                    description: formData.get('description'),
                    amount: parseFloat(formData.get('amount') as string),
                    caisseId: formData.get('caisseId'),
                    date: new Date().toISOString()
                })
            })

            if (response.ok) {
                setShowRevenueModal(false)
                onSuccess()
                fetchCaisses() // Refresh caisses
                e.currentTarget.reset()
            } else {
                const data = await response.json()
                setError(data.error || 'Erreur lors de l\'ajout du revenu')
            }
        } catch (error) {
            console.error('Error creating revenue:', error)
            setError('Erreur de connexion au serveur')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
                <button onClick={() => setShowCaisseModal(true)} className="btn btn-primary bg-indigo-600 hover:bg-indigo-700">
                    <Wallet className="w-4 h-4" />
                    Nouvelle Caisse
                </button>
                <button onClick={() => setShowRevenueModal(true)} className="btn btn-primary bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25">
                    <TrendingUp className="w-4 h-4" />
                    Nouveau Revenu
                </button>
                <button onClick={() => setShowAchatModal(true)} className="btn btn-primary bg-pink-600 hover:bg-pink-700 shadow-pink-500/25">
                    <ShoppingCart className="w-4 h-4" />
                    Nouvel Achat
                </button>
                <button onClick={() => setShowChargeModal(true)} className="btn btn-primary bg-cyan-600 hover:bg-cyan-700 shadow-cyan-500/25">
                    <Receipt className="w-4 h-4" />
                    Nouvelle Charge
                </button>
                <CategoryManager onUpdate={fetchChargeCategories} />
            </div>

            {/* Caisse Modal */}
            <Modal isOpen={showCaisseModal} onClose={() => setShowCaisseModal(false)} title="Nouvelle Caisse">
                <form onSubmit={handleCaisseSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">Nom de la Caisse</label>
                        <input type="text" name="name" required className="input" placeholder="Ex: Caisse Magasin" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">Type</label>
                        <select name="type" required className="input">
                            <option value="MAGASIN">Magasin</option>
                            <option value="EVENEMENTS">Événements</option>
                            <option value="DEPOT">Dépôt</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">Solde Initial (DH)</label>
                        <input type="number" name="balance" step="0.01" className="input" placeholder="0.00" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">Montant Fixe (optionnel)</label>
                        <input type="number" name="fixedAmount" step="0.01" className="input" placeholder="0.00" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">Description</label>
                        <textarea name="description" rows={3} className="input" placeholder="Description..."></textarea>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="submit" disabled={loading} className="btn btn-primary flex-1">
                            {loading ? 'Création...' : 'Créer la Caisse'}
                        </button>
                        <button type="button" onClick={() => setShowCaisseModal(false)} className="btn btn-secondary">
                            Annuler
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Revenue Modal */}
            <Modal isOpen={showRevenueModal} onClose={() => { setShowRevenueModal(false); setError(null); }} title="Nouveau Revenu">
                <form onSubmit={handleRevenueSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4 text-rose-400 text-sm">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">Description</label>
                        <input type="text" name="description" required className="input" placeholder="Ex: Ventes du jour" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">Montant (DH)</label>
                        <input type="number" name="amount" step="0.01" required className="input" placeholder="0.00" />
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

                    <div className="flex gap-3 pt-4">
                        <button type="submit" disabled={loading} className="btn btn-primary bg-emerald-600 hover:bg-emerald-700 flex-1">
                            {loading ? 'Ajout...' : 'Ajouter le Revenu'}
                        </button>
                        <button type="button" onClick={() => setShowRevenueModal(false)} className="btn btn-secondary">
                            Annuler
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Achat Modal */}
            <Modal isOpen={showAchatModal} onClose={() => { setShowAchatModal(false); setError(null); }} title="Nouvel Achat">
                <form onSubmit={handleAchatSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4 text-rose-400 text-sm">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">Description</label>
                        <input type="text" name="description" required className="input" placeholder="Description de l'achat" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">Montant (DH)</label>
                        <input type="number" name="amount" step="0.01" required className="input" placeholder="0.00" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">Caisse à débiter</label>
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
                        <label className="block text-sm font-medium mb-2 text-slate-300">Catégorie</label>
                        <select name="category" required className="input">
                            <option value="MAGASIN">Magasin</option>
                            <option value="SOCIETE">Société</option>
                            <option value="EVENEMENT">Événement</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">Référence</label>
                        <input type="text" name="reference" className="input" placeholder="Référence..." />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">Notes</label>
                        <textarea name="notes" rows={3} className="input" placeholder="Notes additionnelles..."></textarea>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="submit" disabled={loading} className="btn btn-primary bg-pink-600 hover:bg-pink-700 flex-1">
                            {loading ? 'Création...' : 'Créer l\'Achat'}
                        </button>
                        <button type="button" onClick={() => setShowAchatModal(false)} className="btn btn-secondary">
                            Annuler
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Charge Modal */}
            <Modal isOpen={showChargeModal} onClose={() => { setShowChargeModal(false); setError(null); }} title="Nouvelle Charge">
                <form onSubmit={handleChargeSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4 text-rose-400 text-sm">
                            {error}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">Description</label>
                        <input type="text" name="description" required className="input" placeholder="Description de la charge" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">Montant (DH)</label>
                        <input type="number" name="amount" step="0.01" required className="input" placeholder="0.00" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">
                            Catégorie <span className="text-rose-400">*</span>
                        </label>
                        <select name="category" required className="input">
                            <option value="">Sélectionner une catégorie</option>
                            {chargeCategories.map(category => (
                                <option key={category.id} value={category.name}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        {chargeCategories.length === 0 && (
                            <p className="text-xs text-amber-400 mt-1">
                                ⚠️ Aucune catégorie disponible. Veuillez créer une catégorie d'abord.
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">Référence</label>
                        <input type="text" name="reference" className="input" placeholder="Référence..." />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" name="isPaid" className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-600 focus:ring-indigo-500" />
                            <span className="text-sm font-medium text-slate-300">Déjà Payée ?</span>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">Caisse à débiter (si payée)</label>
                        <select name="caisseId" className="input">
                            <option value="">Sélectionner une caisse</option>
                            {caisses.map(caisse => (
                                <option key={caisse.id} value={caisse.id}>
                                    {caisse.name} ({caisse.balance.toLocaleString()} DH)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">Notes</label>
                        <textarea name="notes" rows={3} className="input" placeholder="Notes additionnelles..."></textarea>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="submit" disabled={loading} className="btn btn-primary bg-cyan-600 hover:bg-cyan-700 flex-1">
                            {loading ? 'Création...' : 'Créer la Charge'}
                        </button>
                        <button type="button" onClick={() => setShowChargeModal(false)} className="btn btn-secondary">
                            Annuler
                        </button>
                    </div>
                </form>
            </Modal>
        </>
    )
}
