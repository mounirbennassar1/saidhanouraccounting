'use client'

import { useState, useEffect } from 'react'
import { Truck, Plus, DollarSign, Clock, CheckCircle, AlertCircle, Eye, ShoppingCart, Edit, Trash2 } from 'lucide-react'
import Modal from './Modal'
import SupplierForm from './SupplierForm'
import SupplierOrderForm from './SupplierOrderForm'
import SupplierPaymentForm from './SupplierPaymentForm'
import SupplierDetails from './SupplierDetails'

interface Supplier {
    id: string
    name: string
    email?: string
    phone?: string
    address?: string
    notes?: string
    isActive: boolean
    stats: {
        totalOrders: number
        totalAmount: number
        totalPaid: number
        totalOwed: number
    }
    orders: SupplierOrder[]
}

interface SupplierOrder {
    id: string
    orderNumber: string
    totalAmount: number
    paidAmount: number
    remainingAmount: number
    status: string
    orderDate: string
    supplier: { name: string }
    items: SupplierOrderItem[]
    payments: SupplierPayment[]
}

interface SupplierOrderItem {
    id: string
    description: string
    quantity: number
    unitPrice: number
    totalPrice: number
}

interface SupplierPayment {
    id: string
    amount: number
    paymentMethod: string
    paymentDate: string
    caisse?: { name: string }
}

export default function SupplierManagement() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
    const [selectedOrder, setSelectedOrder] = useState<SupplierOrder | null>(null)
    const [showSupplierModal, setShowSupplierModal] = useState(false)
    const [showOrderModal, setShowOrderModal] = useState(false)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [showSupplierDetails, setShowSupplierDetails] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSuppliers()
    }, [])

    const fetchSuppliers = async () => {
        try {
            const response = await fetch('/api/suppliers')
            if (response.ok) {
                const data = await response.json()
                setSuppliers(data)
            }
        } catch (error) {
            console.error('Error fetching suppliers:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSupplierSuccess = () => {
        fetchSuppliers()
        setShowSupplierModal(false)
        setEditingSupplier(null)
    }

    const handleEdit = (supplier: Supplier) => {
        setEditingSupplier(supplier)
        setShowSupplierModal(true)
    }

    const handleDelete = async (supplierId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) return

        try {
            const response = await fetch(`/api/suppliers?id=${supplierId}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                fetchSuppliers()
            } else {
                const data = await response.json()
                alert(data.error || 'Erreur lors de la suppression')
            }
        } catch (error) {
            console.error('Error deleting supplier:', error)
            alert('Erreur de connexion au serveur')
        }
    }

    const handleOrderSuccess = () => {
        fetchSuppliers()
        setShowOrderModal(false)
        setSelectedSupplier(null)
    }

    const handlePaymentSuccess = () => {
        fetchSuppliers()
        setShowPaymentModal(false)
        setSelectedOrder(null)
        setShowSupplierDetails(false)
    }

    const handlePaymentFromDetails = (order: SupplierOrder) => {
        setSelectedOrder(order)
        setShowSupplierDetails(false)
        setShowPaymentModal(true)
    }

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { color: string; label: string; icon: any }> = {
            'DRAFT': { color: 'bg-slate-500/10 text-slate-400 border-slate-500/20', label: 'Brouillon', icon: Clock },
            'CONFIRMED': { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', label: 'Confirmé', icon: AlertCircle },
            'PARTIALLY_PAID': { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Partiellement Payé', icon: Clock },
            'FULLY_PAID': { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'Payé', icon: CheckCircle },
            'CANCELLED': { color: 'bg-rose-500/10 text-rose-400 border-rose-500/20', label: 'Annulé', icon: AlertCircle }
        }

        const config = statusConfig[status] || statusConfig['DRAFT']
        const Icon = config.icon

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
                <Icon className="w-3 h-3" />
                {config.label}
            </span>
        )
    }

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-rose-500/30 border-t-rose-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400 animate-pulse">Chargement des fournisseurs...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Gestion des Fournisseurs</h2>
                    <p className="text-slate-400">Gérez vos fournisseurs, commandes et paiements</p>
                </div>
                <button
                    onClick={() => setShowSupplierModal(true)}
                    className="btn btn-primary bg-rose-600 hover:bg-rose-700"
                >
                    <Plus className="w-4 h-4" />
                    Nouveau Fournisseur
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card p-5 hover:border-rose-500/30 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-xs font-medium mb-1">Total Fournisseurs</p>
                            <h3 className="text-2xl font-bold text-white">{suppliers.length}</h3>
                        </div>
                        <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <Truck className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="card p-5 hover:border-amber-500/30 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-xs font-medium mb-1">Total Dépenses</p>
                            <h3 className="text-2xl font-bold text-amber-400">
                                {suppliers.reduce((sum, s) => sum + s.stats.totalAmount, 0).toLocaleString()} DH
                            </h3>
                        </div>
                        <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="card p-5 hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-xs font-medium mb-1">Montant Payé</p>
                            <h3 className="text-2xl font-bold text-emerald-400">
                                {suppliers.reduce((sum, s) => sum + s.stats.totalPaid, 0).toLocaleString()} DH
                            </h3>
                        </div>
                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="card p-5 hover:border-red-500/30 transition-all">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-400 text-xs font-medium mb-1">Reste à Payer</p>
                            <h3 className="text-2xl font-bold text-red-400">
                                {suppliers.reduce((sum, s) => sum + s.stats.totalOwed, 0).toLocaleString()} DH
                            </h3>
                        </div>
                        <div className="p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
                            <AlertCircle className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Suppliers Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className="table-header text-left">Fournisseur</th>
                                <th className="table-header text-left">Contact</th>
                                <th className="table-header text-center">Commandes</th>
                                <th className="table-header text-right">Total Dépenses</th>
                                <th className="table-header text-right">Reste à Payer</th>
                                <th className="table-header text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="p-4 rounded-full bg-slate-800/50">
                                                <Truck className="w-12 h-12 text-slate-600" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-white mb-1">
                                                    Aucun fournisseur
                                                </h3>
                                                <p className="text-slate-400 text-sm mb-4">
                                                    Commencez par ajouter votre premier fournisseur
                                                </p>
                                                <button 
                                                    onClick={() => setShowSupplierModal(true)}
                                                    className="btn btn-primary bg-rose-600 hover:bg-rose-700"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Ajouter un fournisseur
                                                </button>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                suppliers.map((supplier) => (
                                    <tr key={supplier.id} className="table-row group">
                                        <td className="table-cell">
                                            <div>
                                                <p className="font-medium text-white">{supplier.name}</p>
                                                {supplier.address && (
                                                    <p className="text-xs text-slate-500 mt-1">{supplier.address}</p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="table-cell">
                                            <div className="text-sm">
                                                {supplier.email && <p className="text-slate-400">{supplier.email}</p>}
                                                {supplier.phone && <p className="text-slate-500 text-xs mt-1">{supplier.phone}</p>}
                                            </div>
                                        </td>
                                        <td className="table-cell text-center">
                                            <span className="badge badge-info">{supplier.stats.totalOrders}</span>
                                        </td>
                                        <td className="table-cell text-right font-bold text-amber-400">
                                            {supplier.stats.totalAmount.toLocaleString()} DH
                                        </td>
                                        <td className="table-cell text-right">
                                            {supplier.stats.totalOwed > 0 ? (
                                                <span className="font-bold text-red-400">
                                                    {supplier.stats.totalOwed.toLocaleString()} DH
                                                </span>
                                            ) : (
                                                <span className="text-slate-500">-</span>
                                            )}
                                        </td>
                                        <td className="table-cell">
                                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => {
                                                        setSelectedSupplier(supplier)
                                                        setShowSupplierDetails(true)
                                                    }}
                                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                                                    title="Voir détails"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(supplier)}
                                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                                                    title="Modifier"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(supplier.id)}
                                                    className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedSupplier(supplier)
                                                        setShowOrderModal(true)
                                                    }}
                                                    className="btn btn-primary text-xs bg-rose-600 hover:bg-rose-700 ml-2"
                                                    title="Nouvelle commande"
                                                >
                                                    <ShoppingCart className="w-3 h-3" />
                                                    Commande
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            <Modal 
                isOpen={showSupplierModal}
                onClose={() => {
                    setShowSupplierModal(false)
                    setEditingSupplier(null)
                }}
                title={editingSupplier ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
            >
                <SupplierForm
                    supplier={editingSupplier}
                    onSubmit={handleSupplierSuccess}
                    onClose={() => {
                        setShowSupplierModal(false)
                        setEditingSupplier(null)
                    }}
                />
            </Modal>

            <Modal 
                isOpen={showOrderModal}
                onClose={() => {
                    setShowOrderModal(false)
                    setSelectedSupplier(null)
                }}
                title="Nouvelle Commande Fournisseur"
            >
                {selectedSupplier && (
                    <SupplierOrderForm
                        supplier={selectedSupplier}
                        onSubmit={handleOrderSuccess}
                        onClose={() => {
                            setShowOrderModal(false)
                            setSelectedSupplier(null)
                        }}
                    />
                )}
            </Modal>

            <Modal 
                isOpen={showPaymentModal}
                onClose={() => {
                    setShowPaymentModal(false)
                    setSelectedOrder(null)
                }}
                title="Paiement Fournisseur"
            >
                {selectedOrder && (
                    <SupplierPaymentForm
                        order={selectedOrder}
                        onSubmit={handlePaymentSuccess}
                        onClose={() => {
                            setShowPaymentModal(false)
                            setSelectedOrder(null)
                        }}
                    />
                )}
            </Modal>

            <Modal 
                isOpen={showSupplierDetails}
                onClose={() => {
                    setShowSupplierDetails(false)
                    setSelectedSupplier(null)
                }}
                title="Détails du Fournisseur"
            >
                {selectedSupplier && (
                    <SupplierDetails
                        supplier={selectedSupplier}
                        onClose={() => {
                            setShowSupplierDetails(false)
                            setSelectedSupplier(null)
                        }}
                        onPayment={handlePaymentFromDetails}
                    />
                )}
            </Modal>
        </div>
    )
}
