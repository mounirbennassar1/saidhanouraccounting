'use client'

import { useState, useEffect } from 'react'
import { DollarSign, CreditCard } from 'lucide-react'

interface Order {
    id: string
    orderNumber: string
    totalAmount: number
    paidAmount: number
    remainingAmount: number
    client?: { name: string }
}

interface Caisse {
    id: string
    name: string
    balance: number
}

interface PaymentFormProps {
    order: Order
    onSuccess: () => void
}

export default function PaymentForm({ order, onSuccess }: PaymentFormProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [caisses, setCaisses] = useState<Caisse[]>([])
    const [paymentAmount, setPaymentAmount] = useState(order.remainingAmount)
    const [paymentType, setPaymentType] = useState<'full' | 'partial'>('full')

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
        }
    }

    const handlePaymentTypeChange = (type: 'full' | 'partial') => {
        setPaymentType(type)
        if (type === 'full') {
            setPaymentAmount(order.remainingAmount)
        } else {
            setPaymentAmount(0)
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const formData = new FormData(e.currentTarget)

        if (paymentAmount <= 0) {
            setError('Le montant doit être supérieur à 0')
            setLoading(false)
            return
        }

        if (paymentAmount > order.remainingAmount) {
            setError(`Le montant ne peut pas dépasser le solde restant (${order.remainingAmount.toLocaleString()} DH)`)
            setLoading(false)
            return
        }

        try {
            const response = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId: order.id,
                    amount: paymentAmount,
                    caisseId: formData.get('caisseId'),
                    paymentMethod: formData.get('paymentMethod'),
                    reference: formData.get('reference') || null,
                    notes: formData.get('notes') || null
                })
            })

            if (response.ok) {
                onSuccess()
            } else {
                const data = await response.json()
                setError(data.error || 'Erreur lors de l\'enregistrement du paiement')
            }
        } catch (error) {
            console.error('Error creating payment:', error)
            setError('Erreur de connexion au serveur')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-lg p-4 text-rose-400 text-sm">
                    {error}
                </div>
            )}

            {/* Order Summary */}
            <div className="card p-4 bg-white/5">
                <h4 className="text-sm font-medium text-slate-400 mb-3">Résumé de la Commande</h4>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-400">Commande N°</span>
                        <span className="text-white font-medium">{order.orderNumber}</span>
                    </div>
                    {order.client && (
                        <div className="flex justify-between">
                            <span className="text-slate-400">Client</span>
                            <span className="text-white font-medium">{order.client.name}</span>
                        </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-white/10">
                        <span className="text-slate-400">Montant Total</span>
                        <span className="text-white font-bold">{order.totalAmount.toLocaleString()} DH</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-emerald-400">Déjà Payé</span>
                        <span className="text-emerald-400 font-bold">{order.paidAmount.toLocaleString()} DH</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-amber-400">Reste à Payer</span>
                        <span className="text-amber-400 font-bold text-lg">{order.remainingAmount.toLocaleString()} DH</span>
                    </div>
                </div>
            </div>

            {/* Payment Type Selection */}
            <div>
                <label className="block text-sm font-medium mb-3 text-slate-300">Type de Paiement</label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => handlePaymentTypeChange('full')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                            paymentType === 'full'
                                ? 'border-emerald-500 bg-emerald-500/10'
                                : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                    >
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <DollarSign className={`w-5 h-5 ${paymentType === 'full' ? 'text-emerald-400' : 'text-slate-400'}`} />
                        </div>
                        <p className={`text-sm font-medium ${paymentType === 'full' ? 'text-emerald-400' : 'text-slate-400'}`}>
                            Paiement Complet
                        </p>
                        <p className={`text-xs mt-1 ${paymentType === 'full' ? 'text-emerald-400/70' : 'text-slate-500'}`}>
                            {order.remainingAmount.toLocaleString()} DH
                        </p>
                    </button>

                    <button
                        type="button"
                        onClick={() => handlePaymentTypeChange('partial')}
                        className={`p-4 rounded-xl border-2 transition-all ${
                            paymentType === 'partial'
                                ? 'border-amber-500 bg-amber-500/10'
                                : 'border-white/10 bg-white/5 hover:border-white/20'
                        }`}
                    >
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <CreditCard className={`w-5 h-5 ${paymentType === 'partial' ? 'text-amber-400' : 'text-slate-400'}`} />
                        </div>
                        <p className={`text-sm font-medium ${paymentType === 'partial' ? 'text-amber-400' : 'text-slate-400'}`}>
                            Acompte / Partiel
                        </p>
                        <p className={`text-xs mt-1 ${paymentType === 'partial' ? 'text-amber-400/70' : 'text-slate-500'}`}>
                            Montant personnalisé
                        </p>
                    </button>
                </div>
            </div>

            {/* Payment Amount */}
            <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">
                    Montant du Paiement (DH) <span className="text-rose-400">*</span>
                </label>
                <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                    className="input text-lg font-bold"
                    min="0.01"
                    max={order.remainingAmount}
                    step="0.01"
                    required
                    disabled={paymentType === 'full'}
                />
                {paymentType === 'partial' && (
                    <p className="text-xs text-slate-500 mt-1">
                        Maximum: {order.remainingAmount.toLocaleString()} DH
                    </p>
                )}
            </div>

            {/* Caisse Selection */}
            <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">
                    Caisse de Destination <span className="text-rose-400">*</span>
                </label>
                <select name="caisseId" required className="input">
                    <option value="">Sélectionner une caisse</option>
                    {caisses.map(caisse => (
                        <option key={caisse.id} value={caisse.id}>
                            {caisse.name} ({caisse.balance.toLocaleString()} DH)
                        </option>
                    ))}
                </select>
            </div>

            {/* Payment Method */}
            <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">
                    Méthode de Paiement <span className="text-rose-400">*</span>
                </label>
                <select name="paymentMethod" required className="input">
                    <option value="CASH">Espèces</option>
                    <option value="BANK_TRANSFER">Virement Bancaire</option>
                    <option value="CHECK">Chèque</option>
                    <option value="CREDIT_CARD">Carte de Crédit</option>
                    <option value="OTHER">Autre</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">
                    Référence
                </label>
                <input
                    type="text"
                    name="reference"
                    className="input"
                    placeholder="Numéro de référence du paiement"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">
                    Notes
                </label>
                <textarea
                    name="notes"
                    rows={2}
                    className="input"
                    placeholder="Notes sur le paiement..."
                ></textarea>
            </div>

            {/* Summary */}
            {paymentAmount > 0 && (
                <div className="card p-4 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/20">
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-slate-300">Montant du Paiement</span>
                            <span className="text-emerald-400 font-bold">{paymentAmount.toLocaleString()} DH</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-white/10">
                            <span className="text-slate-300">Nouveau Solde Restant</span>
                            <span className="text-white font-bold">
                                {(order.remainingAmount - paymentAmount).toLocaleString()} DH
                            </span>
                        </div>
                        {(order.remainingAmount - paymentAmount) === 0 && (
                            <div className="pt-2 border-t border-white/10">
                                <span className="text-emerald-400 text-sm font-medium flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" />
                                    Commande entièrement payée
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="flex gap-3 pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary bg-emerald-600 hover:bg-emerald-700 flex-1"
                >
                    {loading ? 'Enregistrement...' : `Enregistrer le Paiement (${paymentAmount.toLocaleString()} DH)`}
                </button>
            </div>
        </form>
    )
}

