'use client';
import React from 'react';
import Modal from './Modal';
import { AlertTriangle, CheckCircle, Info, Trash2, XCircle, RefreshCw } from 'lucide-react';

interface ConfirmDetail {
    label: string;
    value: string | React.ReactNode;
}

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void | Promise<void>;
    title: string;
    description: string | React.ReactNode;
    details?: ConfirmDetail[];
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'primary' | 'success';
    isLoading?: boolean;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    details = [],
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'primary',
    isLoading = false,
}: ConfirmModalProps) {
    const config = {
        danger: {
            bg: '#fee2e2',
            color: '#dc2626',
            btnBg: '#dc2626',
            btnHover: '#b91c1c',
            icon: Trash2,
        },
        warning: {
            bg: '#fef3c7',
            color: '#d97706',
            btnBg: '#d97706',
            btnHover: '#b45309',
            icon: AlertTriangle,
        },
        success: {
            bg: '#dcfce7',
            color: '#16a34a',
            btnBg: '#6c9e4e',
            btnHover: '#5b8441',
            icon: CheckCircle,
        },
        primary: {
            bg: '#eaf4e3',
            color: '#6c9e4e',
            btnBg: '#6c9e4e',
            btnHover: '#5b8441',
            icon: Info,
        },
    }[variant];

    const Icon = config.icon;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            maxWidth={460}
            footer={
                <div style={{ display: 'flex', gap: 10, width: '100%', justifyContent: 'flex-end' }}>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        style={{
                            padding: '10px 18px',
                            borderRadius: 10,
                            border: '1px solid #e5e7eb',
                            background: '#fff',
                            color: '#4b5563',
                            fontWeight: 600,
                            fontSize: 13,
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        style={{
                            padding: '10px 20px',
                            borderRadius: 10,
                            border: 'none',
                            background: config.btnBg,
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: 13,
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }}
                    >
                        {isLoading && <RefreshCw size={14} className="animate-spin" />}
                        {confirmText}
                    </button>
                </div>
            }
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Header Icon + Description */}
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div
                        style={{
                            width: 44,
                            height: 44,
                            borderRadius: 12,
                            background: config.bg,
                            color: config.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        <Icon size={22} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.5, fontWeight: 500 }}>
                            {description}
                        </p>
                    </div>
                </div>

                {/* Structured Details Box */}
                {details.length > 0 && (
                    <div
                        style={{
                            background: '#f9fafb',
                            borderRadius: 12,
                            border: '1px solid #f3f4f6',
                            padding: '12px 16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                        }}
                    >
                        {details.map((item, idx) => (
                            <div
                                key={idx}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontSize: 13,
                                    paddingBottom: idx === details.length - 1 ? 0 : 8,
                                    borderBottom: idx === details.length - 1 ? 'none' : '1px solid #f0f0f0',
                                }}
                            >
                                <span style={{ color: '#6b7280', fontWeight: 500 }}>{item.label}</span>
                                <span style={{ color: '#1a1a2e', fontWeight: 700 }}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
}
