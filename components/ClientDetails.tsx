'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { 
    X, 
    DollarSign, 
    AlertCircle, 
    CheckCircle, 
    Clock, 
    Plus,
    CreditCard,
    Receipt
} from 'lucide-react'

interface Client {
    id: string
    name: string
    email: string | null
    phone: string | null
    address: string | null
    orders: Order[]
    totalOrders: number
    totalRevenue: number
    totalOutstanding: number
}

interface Order {
    id: string
    orderNumber: string
    totalAmount: number
    paidAmount: number
    remainingAmount: number
    status: string
    orderDate: string
    dueDate: string | null
    description: string | null
    items: OrderItem[]
    payments: Payment[]
    client?: { name: string }
}

interface OrderItem {
    description: string
    quantity: number
    unitPrice: number
    totalPrice: number
}

interface Payment {
    amount: number
    paymentMethod: string
    paymentDate: string
    caisse: { name: string }
}

interface ClientDetailsProps {
    client: Client
    onClose: () => void
    onPayment: (order: Order) => void
}

export default function ClientDetails({ client, onClose, onPayment }: ClientDetailsProps) {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

    const getStatusBadge = (status: string) => {
        const config: Record<string, { color: string; label: string; icon: any }> = {
            'DRAFT': { color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', label: 'Brouillon', icon: Clock },
            'CONFIRMED': { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'Confirmé', icon: AlertCircle },
            'PARTIALLY_PAID': { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Partiellement Payé', icon: Clock },
            'FULLY_PAID': { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Payé', icon: CheckCircle },
            'CANCELLED': { color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', label: 'Annulé', icon: AlertCircle }
        }
        const cfg = config[status] || config['DRAFT']
        const Icon = cfg.icon
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
                <Icon className="w-3 h-3" />
                {cfg.label}
            </span>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-slate-900 border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">{client.name}</h2>
                            <div className="space-y-1 text-sm">
                                {client.email && <p className="text-slate-400">📧 {client.email}</p>}
                                {client.phone && <p className="text-slate-400">📞 {client.phone}</p>}
                                {client.address && <p className="text-slate-400">📍 {client.address}</p>}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="card p-4 bg-indigo-500/10 border-indigo-500/20">
                            <p className="text-xs text-indigo-400 mb-1">Commandes</p>
                            <p className="text-2xl font-bold text-white">{client.totalOrders}</p>
                        </div>
                        <div className="card p-4 bg-emerald-500/10 border-emerald-500/20">
                            <p className="text-xs text-emerald-400 mb-1">Payé</p>
                            <p className="text-2xl font-bold text-emerald-400">{client.totalRevenue.toLocaleString()} DH</p>
                        </div>
                        <div className="card p-4 bg-amber-500/10 border-amber-500/20">
                            <p className="text-xs text-amber-400 mb-1">Dette Restante</p>
                            <p className="text-2xl font-bold text-amber-400">{client.totalOutstanding.toLocaleString()} DH</p>
                        </div>
                    </div>
                </div>

                {/* Orders List */}
                <div className="flex-1 overflow-y-auto p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Receipt className="w-5 h-5 text-indigo-400" />
                        Commandes ({client.orders.length})
                    </h3>

                    {client.orders.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <p>Aucune commande pour ce client</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {client.orders.map((order) => (
                                <div key={order.id} className="card p-5 hover:border-indigo-500/30 transition-all">
                                    {/* Order Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="font-bold text-white text-lg">{order.orderNumber}</h4>
                                                {getStatusBadge(order.status)}
                                            </div>
                                            {order.description && (
                                                <p className="text-sm text-slate-400">{order.description}</p>
                                            )}
                                            <p className="text-xs text-slate-500 mt-1">
                                                {format(new Date(order.orderDate), 'dd MMM yyyy')}
                                                {order.dueDate && ` • Échéance: ${format(new Date(order.dueDate), 'dd MMM yyyy')}`}
                                            </p>
                                        </div>
                                        {order.remainingAmount > 0 && (
                                            <button
                                                onClick={() => onPayment({
                                                    ...order,
                                                    client: { name: client.name }
                                                })}
                                                className="btn btn-primary text-xs bg-emerald-600 hover:bg-emerald-700"
                                            >
                                                <Plus className="w-3 h-3" />
                                                Paiement
                                            </button>
                                        )}
                                    </div>

                                    {/* Order Items */}
                                    {order.items && order.items.length > 0 && (
                                        <div className="mb-4 p-3 bg-white/5 rounded-lg">
                                            <p className="text-xs text-slate-400 mb-2 font-medium">Articles:</p>
                                            <div className="space-y-1">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between text-sm">
                                                        <span className="text-slate-300">
                                                            {item.description} ({item.quantity}x {item.unitPrice.toLocaleString()} DH)
                                                        </span>
                                                        <span className="text-white font-medium">{item.totalPrice.toLocaleString()} DH</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Payment Summary */}
                                    <div className="grid grid-cols-3 gap-3 p-3 bg-white/5 rounded-lg">
                                        <div>
                                            <p className="text-xs text-slate-400 mb-1">Montant Total</p>
                                            <p className="text-lg font-bold text-white">{order.totalAmount.toLocaleString()} DH</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-emerald-400 mb-1">Payé</p>
                                            <p className="text-lg font-bold text-emerald-400">{order.paidAmount.toLocaleString()} DH</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-amber-400 mb-1">Reste</p>
                                            <p className="text-lg font-bold text-amber-400">{order.remainingAmount.toLocaleString()} DH</p>
                                        </div>
                                    </div>

                                    {/* Payment History */}
                                    {order.payments && order.payments.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-white/10">
                                            <p className="text-xs text-slate-400 mb-2 font-medium flex items-center gap-2">
                                                <CreditCard className="w-3 h-3" />
                                                Historique des Paiements ({order.payments.length})
                                            </p>
                                            <div className="space-y-2">
                                                {order.payments.map((payment, idx) => (
                                                    <div key={idx} className="flex items-center justify-between text-sm p-2 bg-emerald-500/5 rounded border border-emerald-500/10">
                                                        <div className="flex items-center gap-2">
                                                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                                                            <span className="text-slate-300">
                                                                {format(new Date(payment.paymentDate), 'dd MMM yyyy')}
                                                            </span>
                                                            {payment.caisse && (
                                                                <span className="text-xs text-slate-500">
                                                                    via {payment.caisse.name}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="font-bold text-emerald-400">
                                                            +{payment.amount.toLocaleString()} DH
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Full Payment Indicator */}
                                    {order.status === 'FULLY_PAID' && (
                                        <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 text-emerald-400">
                                            <CheckCircle className="w-5 h-5" />
                                            <span className="text-sm font-medium">✓ Commande entièrement payée</span>
                                        </div>
                                    )}

                                    {/* Debt Warning */}
                                    {order.remainingAmount > 0 && order.dueDate && new Date(order.dueDate) < new Date() && (
                                        <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center gap-2 text-rose-400">
                                            <AlertCircle className="w-5 h-5" />
                                            <span className="text-sm font-medium">⚠️ Échéance dépassée - {order.remainingAmount.toLocaleString()} DH impayé</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-white/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-400">Bilan Total</p>
                            <p className="text-xs text-slate-500 mt-1">
                                {client.totalOrders} commande(s) • {client.totalRevenue.toLocaleString()} DH payé
                                {client.totalOutstanding > 0 && (
                                    <span className="text-amber-400"> • {client.totalOutstanding.toLocaleString()} DH restant</span>
                                )}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="btn btn-secondary"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

