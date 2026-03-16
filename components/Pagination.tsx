'use client';
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    pageSize: number;
}

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    totalItems,
    pageSize
}: PaginationProps) {
    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    return (
        <div style={{
            padding: '16px 20px',
            borderTop: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#fafafa',
            borderBottomLeftRadius: 16,
            borderBottomRightRadius: 16
        }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>
                Showing <b style={{ color: '#1a1a2e' }}>{startItem}</b> to <b style={{ color: '#1a1a2e' }}>{endItem}</b> of <b style={{ color: '#1a1a2e' }}>{totalItems}</b> entries
            </span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                        padding: '6px 10px',
                        border: '1px solid #e5e7eb',
                        background: currentPage === 1 ? '#f9fafb' : '#fff',
                        borderRadius: 8,
                        fontSize: 13,
                        color: currentPage === 1 ? '#9ca3af' : '#1a1a2e',
                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        transition: 'all 0.2s'
                    }}
                >
                    <ChevronLeft size={14} />
                    Prev
                </button>

                <div style={{ display: 'flex', gap: 4 }}>
                    {[...Array(totalPages)].map((_, i) => {
                        const page = i + 1;
                        // Simple logic to show current, first, last and 1 around current
                        if (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                        ) {
                            return (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    style={{
                                        minWidth: 32,
                                        height: 32,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: 8,
                                        fontSize: 13,
                                        fontWeight: page === currentPage ? 700 : 500,
                                        background: page === currentPage ? '#6c9e4e' : 'transparent',
                                        color: page === currentPage ? '#fff' : '#4b5563',
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {page}
                                </button>
                            );
                        }
                        if (
                            (page === 2 && currentPage > 3) ||
                            (page === totalPages - 1 && currentPage < totalPages - 2)
                        ) {
                            return <span key={page} style={{ color: '#9ca3af', padding: '0 4px' }}>...</span>;
                        }
                        return null;
                    })}
                </div>

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                        padding: '6px 10px',
                        border: '1px solid #e5e7eb',
                        background: currentPage === totalPages ? '#f9fafb' : '#fff',
                        borderRadius: 8,
                        fontSize: 13,
                        color: currentPage === totalPages ? '#9ca3af' : '#1a1a2e',
                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        transition: 'all 0.2s'
                    }}
                >
                    Next
                    <ChevronRight size={14} />
                </button>
            </div>
        </div>
    );
}
