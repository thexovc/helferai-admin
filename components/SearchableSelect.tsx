'use client';
import React, { useState, useRef, useEffect, useTransition } from 'react';
import { Search, ChevronDown, Check, Loader2 } from 'lucide-react';

export interface SearchableOption {
    value: string;
    label: string;
    subLabel?: string;
}

interface SearchableSelectProps {
    options: SearchableOption[];
    value: string;
    onChange: (value: string) => void;
    onSearch?: (searchTerm: string) => void;
    isLoading?: boolean;
    placeholder?: string;
    searchPlaceholder?: string;
    disabled?: boolean;
    style?: React.CSSProperties;
}

export default function SearchableSelect({
    options,
    value,
    onChange,
    onSearch,
    isLoading = false,
    placeholder = 'Select option...',
    searchPlaceholder = 'Search...',
    disabled = false,
    style
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [cachedSelectedOption, setCachedSelectedOption] = useState<SearchableOption | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Keep cached selected option updated
    useEffect(() => {
        const found = options.find(o => o.value === value);
        if (found) {
            setCachedSelectedOption(found);
        }
    }, [options, value]);

    const selectedOption = options.find(o => o.value === value) || cachedSelectedOption;

    // Debounced onSearch callback to backend
    useEffect(() => {
        if (!isOpen) return;
        if (!onSearch) return;

        const timer = setTimeout(() => {
            onSearch(searchTerm);
        }, 250);

        return () => clearTimeout(timer);
    }, [searchTerm, isOpen, onSearch]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 50);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    // If onSearch is provided, the backend supplies the filtered options directly.
    // If onSearch is not provided, we filter locally in the browser.
    const filteredOptions = onSearch
        ? options
        : options.filter(option => {
              const q = searchTerm.toLowerCase().trim();
              if (!q) return true;
              return (
                  option.label.toLowerCase().includes(q) ||
                  (option.subLabel && option.subLabel.toLowerCase().includes(q)) ||
                  option.value.toLowerCase().includes(q)
              );
          });

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%', ...style }}>
            {/* Trigger Button */}
            <div
                onClick={() => {
                    if (!disabled) {
                        setIsOpen(prev => !prev);
                        setSearchTerm('');
                    }
                }}
                style={{
                    height: 42,
                    width: '100%',
                    border: '1.5px solid',
                    borderColor: isOpen ? '#6c9e4e' : '#e5e7eb',
                    borderRadius: 10,
                    padding: '0 14px',
                    fontSize: 14,
                    background: disabled ? '#f3f4f6' : '#f9fafb',
                    color: selectedOption ? '#1a1a2e' : '#9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    userSelect: 'none',
                    transition: 'border-color 0.15s, box-shadow 0.15s',
                    boxShadow: isOpen ? '0 0 0 3px rgba(108,158,78,0.12)' : 'none'
                }}
            >
                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {selectedOption ? (
                        <>
                            <span style={{ fontWeight: 600, color: '#1a1a2e' }}>{selectedOption.label}</span>
                            {selectedOption.subLabel && (
                                <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 400 }}>({selectedOption.subLabel})</span>
                            )}
                        </>
                    ) : (
                        <span style={{ color: '#9ca3af', fontWeight: 400 }}>{placeholder}</span>
                    )}
                </div>
                <ChevronDown size={16} color="#6b7280" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0, marginLeft: 8 }} />
            </div>

            {/* Dropdown Popover */}
            {isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 6px)',
                        left: 0,
                        right: 0,
                        background: '#fff',
                        borderRadius: 12,
                        boxShadow: '0 12px 24px -4px rgba(0,0,0,0.12), 0 4px 12px -2px rgba(0,0,0,0.06)',
                        border: '1px solid #e5e7eb',
                        zIndex: 1100,
                        padding: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                        animation: 'selectDropdownFade 0.15s ease-out'
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Search Input */}
                    <div style={{ position: 'relative', width: '100%' }}>
                        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input
                            ref={searchInputRef}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder={searchPlaceholder}
                            style={{
                                width: '100%',
                                height: 36,
                                paddingLeft: 32,
                                paddingRight: isLoading ? 34 : 10,
                                borderRadius: 8,
                                border: '1px solid #e5e7eb',
                                background: '#f9fafb',
                                fontSize: 13,
                                color: '#1a1a2e',
                                outline: 'none',
                                boxSizing: 'border-box'
                            }}
                        />
                        {isLoading && (
                            <Loader2
                                size={14}
                                className="animate-spin"
                                style={{
                                    position: 'absolute',
                                    right: 10,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#6c9e4e'
                                }}
                            />
                        )}
                    </div>

                    {/* Options List */}
                    <div style={{ maxHeight: 200, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {isLoading && filteredOptions.length === 0 ? (
                            <div style={{ padding: '14px', textAlign: 'center', fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                                <Loader2 size={14} className="animate-spin" color="#6c9e4e" />
                                <span>Searching backend...</span>
                            </div>
                        ) : filteredOptions.length === 0 ? (
                            <div style={{ padding: '12px 14px', textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>
                                No results found
                            </div>
                        ) : (
                            filteredOptions.map(option => {
                                const isSelected = option.value === value;
                                return (
                                    <div
                                        key={option.value}
                                        onClick={() => handleSelect(option.value)}
                                        style={{
                                            padding: '8px 12px',
                                            borderRadius: 8,
                                            fontSize: 13,
                                            fontWeight: isSelected ? 600 : 400,
                                            color: isSelected ? '#5b8441' : '#374151',
                                            background: isSelected ? '#eaf4e3' : 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            cursor: 'pointer',
                                            transition: 'background 0.12s'
                                        }}
                                        onMouseEnter={e => {
                                            if (!isSelected) e.currentTarget.style.background = '#f3f4f6';
                                        }}
                                        onMouseLeave={e => {
                                            if (!isSelected) e.currentTarget.style.background = 'transparent';
                                        }}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span>{option.label}</span>
                                            {option.subLabel && <span style={{ fontSize: 11, color: '#9ca3af' }}>{option.subLabel}</span>}
                                        </div>
                                        {isSelected && <Check size={14} color="#6c9e4e" />}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
            <style jsx global>{`
                @keyframes selectDropdownFade {
                    from { opacity: 0; transform: translateY(-4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
