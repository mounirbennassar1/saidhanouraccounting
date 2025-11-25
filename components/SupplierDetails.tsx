'use client'

import { X, Package, CreditCard, Calendar, Banknote } from 'lucide-react'

interface Supplier {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  notes?: string
  stats: {
    totalOrders: number
    totalAmount: number
    totalPaid: number
    totalOwed: number
  }
  orders: Order[]
}

interface Order {
  id: string
  orderNumber: string
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  status: string
  orderDate: string
  dueDate?: string
  description?: string
  items: OrderItem[]
  payments: Payment[]
}

interface OrderItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface Payment {
  id: string
  amount: number
  paymentMethod: string
  paymentDate: string
  reference?: string
  caisse?: { name: string }
}

interface SupplierDetailsProps {
  supplier: Supplier
  onClose: () => void
  onPayment: (order: Order) => void
}

export default function SupplierDetails({ supplier, onClose, onPayment }: SupplierDetailsProps) {
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      CONFIRMED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      PARTIALLY_PAID: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      FULLY_PAID: 'bg-green-500/20 text-green-400 border-green-500/30',
      CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
      DRAFT: 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }

    const labels: Record<string, string> = {
      CONFIRMED: 'Confirmé',
      PARTIALLY_PAID: 'Partiellement payé',
      FULLY_PAID: 'Payé',
      CANCELLED: 'Annulé',
      DRAFT: 'Brouillon'
    }

    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full border ${styles[status] || styles.DRAFT}`}>
        {labels[status] || status}
      </span>
    )
  }

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      CASH: 'Espèces',
      BANK_TRANSFER: 'Virement',
      CHECK: 'Chèque',
      CREDIT_CARD: 'Carte',
      OTHER: 'Autre'
    }
    return labels[method] || method
  }

  return (
    <div>
      {/* Supplier Info */}
      <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-white/10">
        <h3 className="text-lg font-bold text-white mb-3">{supplier.name}</h3>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          {supplier.email && (
            <div>
              <span className="text-slate-400">Email:</span>
              <span className="text-white ml-2">{supplier.email}</span>
            </div>
          )}
          {supplier.phone && (
            <div>
              <span className="text-slate-400">Tél:</span>
              <span className="text-white ml-2">{supplier.phone}</span>
            </div>
          )}
          {supplier.address && (
            <div className="col-span-2">
              <span className="text-slate-400">Adresse:</span>
              <span className="text-white ml-2">{supplier.address}</span>
            </div>
          )}
        </div>
      </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="card p-4">
            <p className="text-slate-400 text-sm mb-1">Total Commandes</p>
            <p className="text-2xl font-bold text-white">{supplier.stats.totalOrders}</p>
          </div>
          <div className="card p-4">
            <p className="text-slate-400 text-sm mb-1">Montant Total</p>
            <p className="text-2xl font-bold text-white">{supplier.stats.totalAmount.toLocaleString()} DH</p>
          </div>
          <div className="card p-4">
            <p className="text-slate-400 text-sm mb-1">Payé</p>
            <p className="text-2xl font-bold text-green-400">{supplier.stats.totalPaid.toLocaleString()} DH</p>
          </div>
          <div className="card p-4">
            <p className="text-slate-400 text-sm mb-1">À Payer</p>
            <p className="text-2xl font-bold text-red-400">{supplier.stats.totalOwed.toLocaleString()} DH</p>
          </div>
        </div>

        {/* Orders */}
        <div>
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-400" />
            Commandes ({supplier.orders.length})
          </h3>

          {supplier.orders.length === 0 ? (
            <div className="card p-8 text-center">
              <Package className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Aucune commande pour ce fournisseur</p>
            </div>
          ) : (
            <div className="space-y-4">
              {supplier.orders.map((order) => (
                <div key={order.id} className="card p-6">
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-bold text-white">{order.orderNumber}</h4>
                        {getStatusBadge(order.status)}
                      </div>
                      {order.description && (
                        <p className="text-slate-400 text-sm">{order.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.orderDate).toLocaleDateString('fr-FR')}
                        </span>
                        {order.dueDate && (
                          <span className="flex items-center gap-1">
                            Échéance: {new Date(order.dueDate).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-400 mb-1">Montant total</p>
                      <p className="text-2xl font-bold text-white">{order.totalAmount.toLocaleString()} DH</p>
                      {order.remainingAmount > 0 && (
                        <button
                          onClick={() => onPayment({ ...order, supplier: { name: supplier.name } })}
                          className="mt-3 w-full relative overflow-hidden group bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 flex items-center justify-center gap-2"
                        >
                          <CreditCard className="w-4 h-4" />
                          <span>Effectuer un Paiement</span>
                          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mb-4 p-4 bg-slate-900/50 rounded-lg border border-white/10">
                    <h5 className="text-sm font-semibold text-slate-300 mb-3">Articles</h5>
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-slate-400">
                            {item.description} (x{item.quantity} @ {item.unitPrice.toLocaleString()} DH)
                          </span>
                          <span className="text-white font-medium">{item.totalPrice.toLocaleString()} DH</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Status */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">Payé</p>
                      <p className="text-lg font-bold text-green-400">{order.paidAmount.toLocaleString()} DH</p>
                    </div>
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">Reste à payer</p>
                      <p className="text-lg font-bold text-red-400">{order.remainingAmount.toLocaleString()} DH</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">Paiements</p>
                      <p className="text-lg font-bold text-blue-400">{order.payments.length}</p>
                    </div>
                  </div>

                  {/* Payment History */}
                  {order.payments.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                        <Banknote className="w-4 h-4" />
                        Historique des paiements
                      </h5>
                      <div className="space-y-2">
                        {order.payments.map((payment) => (
                          <div
                            key={payment.id}
                            className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-white/10 text-sm"
                          >
                            <div className="flex items-center gap-3">
                              <CreditCard className="w-4 h-4 text-slate-400" />
                              <div>
                                <p className="text-white font-medium">{payment.amount.toLocaleString()} DH</p>
                                <p className="text-slate-400 text-xs">
                                  {new Date(payment.paymentDate).toLocaleDateString('fr-FR')} • {getPaymentMethodLabel(payment.paymentMethod)}
                                  {payment.caisse && ` • ${payment.caisse.name}`}
                                </p>
                              </div>
                            </div>
                            {payment.reference && (
                              <span className="text-xs text-slate-400">{payment.reference}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

    </div>
  )
}

