'use client';
import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import { useCreateBusinessUser, useUpdateBusinessUser, useBusinessRoles } from '@/api/inventory';
import { toast } from 'sonner';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    businessId: string;
    user?: any; // If provided, we are in edit mode
}

export default function UserModal({ isOpen, onClose, businessId, user }: UserModalProps) {
    const isEdit = !!user;
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        roleId: 0, 
        status: 'active'
    });

    const { data: roles, isLoading: rolesLoading } = useBusinessRoles(businessId);

    const createMutation = useCreateBusinessUser();
    const updateMutation = useUpdateBusinessUser();

    // Handle initial form population when editing
    useEffect(() => {
        if (isOpen) {
            if (user) {
                setFormData(prev => ({
                    ...prev,
                    name: user.name || '',
                    email: user.email || '',
                    status: user.status || 'active',
                    roleId: user.roleId || prev.roleId || 0
                }));
            } else {
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    roleId: roles?.[0]?.id || 0,
                    status: 'active'
                });
            }
        }
    }, [user, isOpen]);

    // Handle role synchronization once roles are loaded
    useEffect(() => {
        if (isOpen && roles && roles.length > 0) {
            if (user) {
                if (!formData.roleId || formData.roleId === 0) {
                    setFormData(prev => ({ ...prev, roleId: user.roleId || roles[0].id }));
                }
            } else if (formData.roleId === 0) {
                setFormData(prev => ({ ...prev, roleId: roles[0].id }));
            }
        }
    }, [roles, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await updateMutation.mutateAsync({
                    id: businessId,
                    userId: user.id,
                    data: {
                        name: formData.name,
                        email: formData.email,
                        status: formData.status,
                        roleId: formData.roleId,
                        ...(formData.password ? { password: formData.password } : {})
                    }
                });
                toast.success('User updated successfully');
            } else {
                await createMutation.mutateAsync({
                    id: businessId,
                    data: formData
                });
                toast.success('User added successfully');
            }
            onClose();
        } catch (error) {
            toast.error(isEdit ? 'Failed to update user' : 'Failed to add user');
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
        <Modal isOpen={isOpen} onClose={onClose} title={isEdit ? 'Edit User' : 'Add New User'} maxWidth={450}>
            <form onSubmit={handleSubmit}>
                <label style={labelStyle}>Full Name</label>
                <input
                    style={inputStyle}
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Enter full name"
                />

                <label style={labelStyle}>Email Address</label>
                <input
                    style={inputStyle}
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="Enter email address"
                />

                <label style={labelStyle}>Password {isEdit && '(Leave blank to keep current)'}</label>
                <input
                    style={inputStyle}
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    required={!isEdit}
                    placeholder={isEdit ? '••••••••' : 'Enter password'}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div>
                        <label style={labelStyle}>Role</label>
                        <select
                            style={inputStyle}
                            value={formData.roleId}
                            onChange={e => setFormData({ ...formData, roleId: Number(e.target.value) })}
                            disabled={rolesLoading}
                        >
                            {rolesLoading ? (
                                <option>Loading roles...</option>
                            ) : (
                                roles?.map((role: any) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>
                    <div>
                        <label style={labelStyle}>Status</label>
                        <select
                            style={inputStyle}
                            value={formData.status}
                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
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
                        disabled={createMutation.isPending || updateMutation.isPending}
                        style={{ padding: '10px 24px', borderRadius: 10, border: 'none', background: '#6c9e4e', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: (createMutation.isPending || updateMutation.isPending) ? 0.7 : 1 }}
                    >
                        {(createMutation.isPending || updateMutation.isPending) ? 'Saving...' : (isEdit ? 'Save Changes' : 'Add User')}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
