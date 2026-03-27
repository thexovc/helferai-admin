'use client';
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    maxWidth?: number;
}

export default function Modal({ isOpen, onClose, title, children, footer, maxWidth = 500 }: ModalProps) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 20, backdropFilter: 'blur(4px)',
        }} onClick={onClose}>
            <div style={{
                background: '#fff', borderRadius: 20, width: '100%', maxWidth,
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
                animation: 'modalSlideUp 0.3s ease-out',
            }} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e', margin: 0 }}>{title}</h2>
                    <button onClick={onClose} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#6b7280', display: 'flex' }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: 24, overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div style={{ padding: '16px 24px', background: '#f9fafb', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                        {footer}
                    </div>
                )}
            </div>
            <style jsx global>{`
                @keyframes modalSlideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
