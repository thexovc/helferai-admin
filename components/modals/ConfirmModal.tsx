'use client';
import React from 'react';
import Modal from '../Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    isLoading?: boolean;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger',
    isLoading = false
}: ConfirmModalProps) {
    const accentColor = type === 'danger' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#6c9e4e';
    const bgColor = type === 'danger' ? '#fef2f2' : type === 'warning' ? '#fffbeb' : '#f0fdf4';

    const footer = (
        <>
            <button
                onClick={onClose}
                style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            >
                {cancelText}
            </button>
            <button
                onClick={onConfirm}
                disabled={isLoading}
                style={{ 
                    padding: '10px 24px', borderRadius: 10, border: 'none', 
                    background: accentColor, color: '#fff', fontSize: 14, 
                    fontWeight: 700, cursor: 'pointer', 
                    opacity: isLoading ? 0.7 : 1 
                }}
            >
                {isLoading ? 'Processing...' : confirmText}
            </button>
        </>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer} maxWidth={400}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <AlertTriangle size={22} color={accentColor} />
                </div>
                <div>
                    <p style={{ margin: 0, fontSize: 14, color: '#4b5563', lineHeight: 1.5 }}>{message}</p>
                </div>
            </div>
        </Modal>
    );
}
