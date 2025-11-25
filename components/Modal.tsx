'use client'

import { ReactNode, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!isOpen || !mounted) return null

    const modalContent = (
        <div className="fixed inset-0 z-[9999] overflow-y-auto animate-fade-in">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/80 backdrop-blur-sm" 
                onClick={onClose}
                style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
            ></div>
            
            {/* Modal Container - Centers the modal */}
            <div className="flex min-h-screen items-center justify-center p-4" style={{ position: 'relative' }}>
                {/* Modal Content */}
                <div className="relative w-full max-w-2xl bg-[#0B0F19] border border-white/10 rounded-2xl p-6 shadow-2xl ring-1 ring-white/5 my-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold gradient-text">{title}</h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    )

    return createPortal(modalContent, document.body)
}
