'use client';
import React from 'react';
import Sidebar from '../../components/Sidebar';
import { LayoutProvider } from '../lib/LayoutContext';

export default function StudioLayout({ children }: { children: React.ReactNode }) {
    return (
        <LayoutProvider>
            <div style={{ minHeight: '100vh', background: '#f8f6ff' }}>
                <Sidebar product="studio" />
                <main className="main-content">
                    {children}
                </main>
            </div>
        </LayoutProvider>
    );
}
