'use client';
import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Modal from '../Modal';
import { useSubscriptionPlans } from '@/api/inventory/inventory.queries';
import { useCreateSubscription } from '@/api/inventory/inventory.mutations';
import { inventoryKeys } from '@/api/inventory/inventory.queries';
import { fullNaira } from './formatNumbers';

const toYMD = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const isYearly = (frequency?: string) => ['yearly', 'annual'].includes((frequency || '').toLowerCase());

// End date one billing period after the start
const periodEnd = (start: string, frequency?: string) => {
    const d = new Date(`${start}T00:00:00`);
    if (isYearly(frequency)) d.setFullYear(d.getFullYear() + 1);
    else d.setMonth(d.getMonth() + 1);
    return toYMD(d);
};

const inputStyle: React.CSSProperties = { height: 42, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 14px', fontSize: 14, outline: 'none', background: '#f9fafb' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };

export default function AssignSubscriptionModal({ isOpen, onClose, businessId, businessName }: {
    isOpen: boolean; onClose: () => void; businessId: string; businessName?: string;
}) {
    const queryClient = useQueryClient();
    const { data: plans } = useSubscriptionPlans();
    const createSub = useCreateSubscription();

    const today = toYMD(new Date());
    const [planId, setPlanId] = React.useState('');
    const [startsAt, setStartsAt] = React.useState(today);
    const [endsAt, setEndsAt] = React.useState(periodEnd(today));
    const [paymentMethod, setPaymentMethod] = React.useState('Manual Admin Assignment');

    const plan = (plans || []).find((p: any) => String(p.id) === String(planId));

    // Start fresh each time it opens
    React.useEffect(() => {
        if (!isOpen) return;
        setPlanId('');
        setStartsAt(today);
        setEndsAt(periodEnd(today));
        setPaymentMethod('Manual Admin Assignment');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const choosePlan = (id: string) => {
        setPlanId(id);
        const p = (plans || []).find((x: any) => String(x.id) === id);
        setEndsAt(periodEnd(startsAt, p?.frequency));
    };
    const chooseStart = (v: string) => {
        setStartsAt(v);
        if (v) setEndsAt(periodEnd(v, plan?.frequency));
    };

    const valid = !!planId && !!startsAt && !!endsAt && startsAt < endsAt;

    const save = async () => {
        if (!valid) return;
        try {
            await createSub.mutateAsync({
                businessId,
                planId,
                startsAt,
                endsAt,
                billingCycle: isYearly(plan?.frequency) ? 'Annual' : 'Monthly',
                paymentMethod,
            });
            // Refresh this merchant's profile, subscriptions tab and lists
            queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
            onClose();
        } catch {
            // The mutation shows the error
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Assign Subscription${businessName ? ` · ${businessName}` : ''}`}
            footer={
                <>
                    <button onClick={onClose} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                    <button onClick={save} disabled={!valid || createSub.isPending}
                        style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: valid ? 'pointer' : 'not-allowed', opacity: valid ? 1 : 0.5 }}>
                        {createSub.isPending ? 'Saving...' : 'Assign Subscription'}
                    </button>
                </>
            }
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                    <label style={labelStyle}>Plan</label>
                    <select value={planId} onChange={e => choosePlan(e.target.value)} style={inputStyle}>
                        <option value="">Choose a plan…</option>
                        {(plans || []).map((p: any) => (
                            <option key={p.id} value={p.id}>{p.name} · {fullNaira(Number(p.price || 0))} / {isYearly(p.frequency) ? 'year' : 'month'}</option>
                        ))}
                    </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                        <label style={labelStyle}>Start date</label>
                        <input type="date" value={startsAt} onChange={e => chooseStart(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>End date</label>
                        <input type="date" value={endsAt} min={startsAt} onChange={e => setEndsAt(e.target.value)} style={inputStyle} />
                    </div>
                </div>
                <div>
                    <label style={labelStyle}>Payment method</label>
                    <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} style={inputStyle}>
                        <option>Manual Admin Assignment</option>
                        <option>Bank Transfer</option>
                        <option>Paystack</option>
                        <option>Cash</option>
                    </select>
                </div>
                <div style={{ fontSize: 12, color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 12px', lineHeight: 1.5 }}>
                    This switches off the merchant&apos;s current subscription and starts this one, marked as paid.
                </div>
            </div>
        </Modal>
    );
}
