'use client';
import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import { useUpdateBusiness } from '@/api/inventory';
import { toast } from 'sonner';

interface BusinessModalProps {
    isOpen: boolean;
    onClose: () => void;
    business: any;
}

export default function BusinessModal({ isOpen, onClose, business }: BusinessModalProps) {
    const [formData, setFormData] = useState({
        company_name: '',
        email: '',
        phone_number: '',
        address: '',
        website: '',
        tax_number: '',
        registration_number: '',
        status: '1'
    });

    const updateMutation = useUpdateBusiness();

    useEffect(() => {
        if (business) {
            setFormData({
                company_name: business.name || '',
                email: business.email || '',
                phone_number: business.phone || '',
                address: business.address || '',
                website: business.website || '',
                tax_number: business.taxNumber || '',
                registration_number: business.registrationNumber || '',
                status: business.status === 'Active' ? '1' : '0'
            });
        }
    }, [business]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateMutation.mutateAsync({
                id: business.id,
                data: formData
            });
            toast.success('Business profile updated successfully');
            onClose();
        } catch (error) {
            toast.error('Failed to update business profile');
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '10px 14px',
        borderRadius: 10,
        border: '1px solid #e5e7eb',
        fontSize: 14,
        marginBottom: 12,
        outline: 'none',
    };

    const labelStyle = {
        display: 'block',
        fontSize: 12,
        fontWeight: 600,
        color: '#6b7280',
        marginBottom: 4,
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Business Profile" maxWidth={600}>
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={labelStyle}>Business Name</label>
                        <input
                            style={inputStyle}
                            value={formData.company_name}
                            onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Email Address</label>
                        <input
                            style={inputStyle}
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Phone Number</label>
                        <input
                            style={inputStyle}
                            value={formData.phone_number}
                            onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                        />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={labelStyle}>Address</label>
                        <input
                            style={inputStyle}
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Website</label>
                        <input
                            style={inputStyle}
                            value={formData.website}
                            onChange={e => setFormData({ ...formData, website: e.target.value })}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Status</label>
                        <select
                            style={inputStyle}
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="1">Active</option>
                            <option value="0">Suspended / Inactive</option>
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Tax Number</label>
                        <input
                            style={inputStyle}
                            value={formData.tax_number}
                            onChange={e => setFormData({ ...formData, tax_number: e.target.value })}
                        />
                    </div>
                    <div>
                        <label style={labelStyle}>Reg Number</label>
                        <input
                            style={inputStyle}
                            value={formData.registration_number}
                            onChange={e => setFormData({ ...formData, registration_number: e.target.value })}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 12 }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #e5e7eb', background: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={updateMutation.isPending}
                        style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: '#6c9e4e', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: updateMutation.isPending ? 0.7 : 1 }}
                    >
                        {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
