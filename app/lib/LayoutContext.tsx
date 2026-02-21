'use client';
import React, { createContext, useContext, useState } from 'react';

interface LayoutContextType {
    mobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    return (
        <LayoutContext.Provider value={{ mobileOpen, setMobileOpen }}>
            {children}
        </LayoutContext.Provider>
    );
}

export function useLayout() {
    const context = useContext(LayoutContext);
    if (context === undefined) {
        throw new Error('useLayout must be used within a LayoutProvider');
    }
    return context;
}
