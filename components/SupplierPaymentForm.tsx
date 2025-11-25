'use client'

import { useState, useEffect } from 'react'
import { X, DollarSign, AlertCircle, ArrowDownCircle } from 'lucide-react'

interface Order {
  id: string
  orderNumber: string
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  supplier: {
    name: string
  }
}

interface Caisse {
  id: string
  name: string
  balance: number
  type: string
}

interface SupplierPaymentFormProps {
  order: Order
  onSubmit: () => void
  onClose: () => void
}

export default function SupplierPaymentForm({ order, onSubmit, onClose }: SupplierPaymentFormProps) {
  const [amount, setAmount] = useState(order.remainingAmount)
  const [caisseId, setCaisseId] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('CASH')
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [caisses, setCaisses] = useState<Caisse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isPartialPayment, setIsPartialPayment] = useState(false)

  useEffect(() => {
    fetchCaisses()
  }, [])

  const fetchCaisses = async () => {
    try {
      const response = await fetch('/api/caisses')
      if (response.ok) {
        const data = await response.json()
        setCaisses(data)
        if (data.length > 0) {
          setCaisseId(data[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching caisses:', error)
    }
  }

  const selectedCaisse = caisses.find(c => c.id === caisseId)
  const hasInsufficientBalance = selectedCaisse && selectedCaisse.balance < amount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (hasInsufficientBalance) {
      setError('Solde insuffisant dans la caisse sélectionnée')
      setLoading(false)
      return
    }

    if (amount <= 0 || amount > order.remainingAmount) {
      setError('Montant de paiement invalide')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/supplier-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          amount,
          caisseId,
          paymentMethod,
          reference,
          notes
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors du paiement')
      }

      onSubmit()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Order Info */}
        <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-white/10 space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-400">Fournisseur</span>
            <span className="text-white font-medium">{order.supplier.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Commande</span>
            <span className="text-white font-medium">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-white/10">
            <span className="text-slate-400">Montant Total</span>
            <span className="text-white font-medium">{order.totalAmount.toLocaleString()} DH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Déjà payé</span>
            <span className="text-green-400 font-medium">{order.paidAmount.toLocaleString()} DH</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-white/10">
            <span className="text-slate-400 font-semibold">Reste à payer</span>
            <span className="text-red-400 font-bold text-lg">{order.remainingAmount.toLocaleString()} DH</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Payment Type Toggle */}
          <div className="flex gap-2 p-1 bg-slate-900/50 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setIsPartialPayment(false)
                setAmount(order.remainingAmount)
              }}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                !isPartialPayment
                  ? 'bg-red-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Paiement complet
            </button>
            <button
              type="button"
              onClick={() => {
                setIsPartialPayment(true)
                setAmount(0)
              }}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                isPartialPayment
                  ? 'bg-yellow-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Paiement partiel
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Montant à payer *
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="input"
              min="0.01"
              max={order.remainingAmount}
              step="0.01"
              required
              disabled={!isPartialPayment}
            />
          </div>

          {/* Caisse */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Caisse de paiement *
            </label>
            <select
              value={caisseId}
              onChange={(e) => setCaisseId(e.target.value)}
              className="input"
              required
            >
              <option value="">Sélectionner une caisse</option>
              {caisses.map((caisse) => (
                <option key={caisse.id} value={caisse.id}>
                  {caisse.name} - Solde: {caisse.balance.toLocaleString()} DH
                </option>
              ))}
            </select>
            {hasInsufficientBalance && (
              <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Solde insuffisant dans cette caisse
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Mode de paiement
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="input"
            >
              <option value="CASH">Espèces</option>
              <option value="BANK_TRANSFER">Virement bancaire</option>
              <option value="CHECK">Chèque</option>
              <option value="CREDIT_CARD">Carte bancaire</option>
              <option value="OTHER">Autre</option>
            </select>
          </div>

          {/* Reference */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Référence
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="input"
              placeholder="Ex: CHQ-12345"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input"
              rows={2}
              placeholder="Notes supplémentaires..."
            />
          </div>

          {/* Summary */}
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-slate-300">Montant à déduire de la caisse</span>
              <span className="text-2xl font-bold text-red-400">
                - {amount.toLocaleString()} DH
              </span>
            </div>
            {amount < order.remainingAmount && (
              <div className="text-sm text-yellow-400 flex items-center gap-1 mt-2">
                <AlertCircle className="w-4 h-4" />
                Reste à payer après ce paiement: {(order.remainingAmount - amount).toLocaleString()} DH
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={loading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 relative overflow-hidden group bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2"
              disabled={loading || hasInsufficientBalance}
            >
              <ArrowDownCircle className="w-5 h-5" />
              <span>{loading ? 'Traitement...' : 'Effectuer le paiement'}</span>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </form>
    </div>
  )
}

