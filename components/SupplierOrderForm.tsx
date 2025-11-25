'use client'

import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'

interface SupplierOrderFormProps {
  supplier: { id: string; name: string }
  onSubmit: () => void
  onClose: () => void
}

interface OrderItem {
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export default function SupplierOrderForm({ supplier, onSubmit, onClose }: SupplierOrderFormProps) {
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [items, setItems] = useState<OrderItem[]>([
    { description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.totalPrice, 0)
  }

  const handleItemChange = (index: number, field: keyof OrderItem, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }

    // Auto-calculate totalPrice when quantity or unitPrice changes
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice
    }

    setItems(newItems)
  }

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }])
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate items
    if (items.length === 0 || items.some(item => !item.description || item.totalPrice <= 0)) {
      setError('Veuillez remplir tous les articles correctement')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/supplier-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: supplier.id,
          totalAmount: calculateTotal(),
          description,
          notes,
          dueDate: dueDate || null,
          items,
          status: 'CONFIRMED'
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la création de la commande')
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
      <div className="mb-4">
        <p className="text-slate-400">Fournisseur: <span className="text-white font-medium">{supplier.name}</span></p>
      </div>

      {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Description de la commande
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input"
                placeholder="Ex: Achat de matériel"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Date d'échéance
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="input"
                />
              </div>
            </div>

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
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-slate-300">
                Articles de la commande *
              </label>
              <button
                type="button"
                onClick={addItem}
                className="btn-primary text-sm py-2"
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter un article
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="p-4 bg-slate-900/50 rounded-lg border border-white/10">
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="input"
                        placeholder="Description de l'article"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="input"
                        placeholder="Qté"
                        min="0.01"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="input"
                        placeholder="Prix unit."
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={item.totalPrice}
                        className="input bg-slate-900/80"
                        placeholder="Total"
                        readOnly
                      />
                    </div>
                    <div className="col-span-1 flex items-center">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={items.length === 1}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-white">Montant Total</span>
              <span className="text-2xl font-bold text-blue-400">
                {calculateTotal().toLocaleString()} DH
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 sticky bottom-0 bg-slate-800/95 backdrop-blur-sm pt-4">
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
              className="flex-1 relative overflow-hidden group bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={loading}
            >
              <span>{loading ? 'Création...' : 'Créer la commande'}</span>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>
        </form>
    </div>
  )
}

