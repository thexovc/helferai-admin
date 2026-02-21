'use client';
import React from 'react';
import Sidebar from '../../components/Sidebar';
import { LayoutProvider } from '../lib/LayoutContext';

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
    return (
        <LayoutProvider>
            <div style={{ minHeight: '100vh', background: '#f4f7f4' }}>
                <Sidebar product="inventory" />
                <main className="main-content">
                    {children}
                </main>
            </div>
        </LayoutProvider>
    );
}
