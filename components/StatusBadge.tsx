'use client';
import React from 'react';
import { getStatusColor } from '@/app/lib/utils';

interface Props {
    status: string;
    size?: 'sm' | 'md';
}

export default function StatusBadge({ status, size = 'md' }: Props) {
    const { bg, text } = getStatusColor(status);
    const padding = size === 'sm' ? '2px 8px' : '3px 10px';
    const fontSize = size === 'sm' ? '11px' : '12px';
    return (
        <span style={{
            background: bg, color: text, padding, fontSize, fontWeight: 600,
            borderRadius: 99, display: 'inline-block', whiteSpace: 'nowrap',
        }}>
            {status}
        </span>
    );
}
