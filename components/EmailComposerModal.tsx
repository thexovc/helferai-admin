'use client';
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import RichTextEditor from './RichTextEditor';
import SearchableSelect from './SearchableSelect';
import {
    Mail, Send, Eye, Edit3, Smartphone, Monitor, Sparkles,
    AlertCircle, CheckCircle2, User, Building, Users,
    FileText, Check, HelpCircle
} from 'lucide-react';
import { useSendBroadcast, useSendTestEmail, useSendDirectEmail } from '@/api/inventory/inventory.mutations';
import { useInventoryBusinesses, usePlatformUsers } from '@/api/inventory/inventory.queries';
import { toast } from 'sonner';

export interface EmailComposerTarget {
    mode: 'broadcast' | 'direct';
    recipientUser?: { id: string; name?: string; email: string; businessName?: string };
    recipientBusiness?: { id: string; name: string; email?: string };
}

interface EmailComposerModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTarget?: EmailComposerTarget;
    onSuccess?: () => void;
}

const TEMPLATES = [
    {
        id: 'announcement',
        name: '📢 General Announcement',
        subject: 'Important Announcement from HelferAI',
        preheader: 'Important updates regarding your HelferAI account and services.',
        content: `<h2>Important Announcement</h2>
<p>Hello <strong>{{name}}</strong>,</p>
<p>We are reaching out with an important update regarding your account with <strong>{{businessName}}</strong>. As part of our ongoing commitment to providing the best business management platform, we have introduced key improvements designed to enhance your day-to-day operations.</p>
<h3>What's Changing?</h3>
<ul>
  <li>Enhanced system performance and faster report generation.</li>
  <li>Streamlined inventory alerts and automated threshold tracking.</li>
  <li>Improved multi-channel communication tools.</li>
</ul>
<p>No downtime is expected during these updates. You can review all details directly from your dashboard.</p>
<div style="text-align: center; margin: 24px 0;"><a href="https://app.helferai.com" class="email-btn" style="display: inline-block; background-color: #6c9e4e; color: #ffffff !important; font-weight: 700; font-size: 15px; padding: 12px 28px; border-radius: 8px; text-decoration: none;">Go to Dashboard</a></div>
<p>Thank you for choosing HelferAI to power your business growth.</p>
<p>Best regards,<br/><strong>The HelferAI Team</strong></p>`,
    },
    {
        id: 'feature_release',
        name: '🚀 New Feature Release',
        subject: 'Exciting New Features Are Now Live on HelferAI!',
        preheader: 'Discover powerful new capabilities built to accelerate your business operations.',
        content: `<h2>New Capabilities Are Now Live!</h2>
<p>Hi <strong>{{name}}</strong>,</p>
<p>We're thrilled to announce the rollout of our latest feature suite tailored specifically for businesses like <strong>{{businessName}}</strong>.</p>
<blockquote>"Empowering your team to work faster, manage inventory smarter, and delight customers."</blockquote>
<h3>Key Highlights in this Release:</h3>
<ul>
  <li><strong>Real-time Analytics:</strong> Track profit margins, sales velocity, and inventory turns in one unified view.</li>
  <li><strong>Enhanced Customer Engagement:</strong> Connect with your customers via personalized messages and announcements.</li>
  <li><strong>Automated Reorders:</strong> Prevent stockouts before they impact your sales.</li>
</ul>
<div style="text-align: center; margin: 24px 0;"><a href="https://app.helferai.com" class="email-btn" style="display: inline-block; background-color: #6c9e4e; color: #ffffff !important; font-weight: 700; font-size: 15px; padding: 12px 28px; border-radius: 8px; text-decoration: none;">Explore New Features</a></div>
<p>Have questions or feedback? Simply reply to this email, and our dedicated support team will be glad to assist you.</p>`,
    },
    {
        id: 'maintenance',
        name: '🛠️ Scheduled System Maintenance',
        subject: 'Notice: Scheduled System Maintenance Window',
        preheader: 'Please be aware of brief scheduled maintenance on HelferAI.',
        content: `<h2>Scheduled System Maintenance</h2>
<p>Dear <strong>{{name}}</strong>,</p>
<p>In order to upgrade our database infrastructure and ensure maximum reliability, our technical team will be conducting scheduled system maintenance.</p>
<div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
  <strong>Maintenance Window:</strong> Sunday, 2:00 AM – 4:00 AM UTC<br/>
  <strong>Expected Impact:</strong> The platform may experience brief intermittent connectivity during this 2-hour period.
</div>
<p>All data and pending transactions are safe and will resume processing immediately once maintenance is complete.</p>
<p>We appreciate your patience as we continue to invest in platform security and speed.</p>`,
    },
    {
        id: 'action_required',
        name: '⚠️ Action Required: Account Notice',
        subject: 'Action Required: Important Account Notice for {{businessName}}',
        preheader: 'Please take a moment to review and update your account details.',
        content: `<h2>Action Required on Your Account</h2>
<p>Hello <strong>{{name}}</strong>,</p>
<p>We noticed that some important details on your account for <strong>{{businessName}}</strong> require your attention.</p>
<p>To ensure uninterrupted service and keep your business metrics functioning without interruption, please log in and confirm your account information.</p>
<div style="text-align: center; margin: 24px 0;"><a href="https://app.helferai.com/settings" class="email-btn" style="display: inline-block; background-color: #1a1a2e; color: #ffffff !important; font-weight: 700; font-size: 15px; padding: 12px 28px; border-radius: 8px; text-decoration: none;">Review Account Settings</a></div>
<p>If you have already resolved this, you may disregard this notice.</p>`,
    },
    {
        id: 'blank',
        name: '📝 Blank Canvas',
        subject: '',
        preheader: '',
        content: `<p>Hello <strong>{{name}}</strong>,</p><p></p><p>Best regards,<br/><strong>HelferAI Team</strong></p>`,
    },
];

export default function EmailComposerModal({
    isOpen,
    onClose,
    initialTarget,
    onSuccess,
}: EmailComposerModalProps) {
    const isDirect = initialTarget?.mode === 'direct';

    // State
    const [activeTab, setActiveTab] = useState<'compose' | 'preview'>('compose');
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
    const [channel, setChannel] = useState<'Email' | 'WhatsApp'>('Email');

    // Fields
    const [title, setTitle] = useState('');
    const [preheader, setPreheader] = useState('');
    const [message, setMessage] = useState('');
    const [segment, setSegment] = useState('All Customers');
    const [businessId, setBusinessId] = useState('');
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [businessSearch, setBusinessSearch] = useState('');
    const [userSearch, setUserSearch] = useState('');

    // Test email sub-modal
    const [isTestEmailOpen, setIsTestEmailOpen] = useState(false);
    const [testEmailAddress, setTestEmailAddress] = useState('');

    // Queries & Mutations
    const { data: businessesData, isFetching: isBizLoading } = useInventoryBusinesses(1, 50, businessSearch);
    const { data: usersData, isFetching: isUsersLoading } = usePlatformUsers({ page: 1, pageSize: 50, search: userSearch });

    const sendBroadcastMutation = useSendBroadcast();
    const sendDirectEmailMutation = useSendDirectEmail();
    const sendTestEmailMutation = useSendTestEmail();

    // Reset or populate on open
    useEffect(() => {
        if (isOpen) {
            setActiveTab('compose');
            setPreviewDevice('desktop');

            if (isDirect && initialTarget?.recipientUser) {
                setTitle('');
                setPreheader('');
                setMessage(`<p>Hello <strong>${initialTarget.recipientUser.name || 'Valued Partner'}</strong>,</p><p></p><p>Best regards,<br/><strong>HelferAI Team</strong></p>`);
                setSelectedUserIds([initialTarget.recipientUser.id]);
                setSegment('Specific Users');
            } else if (isDirect && initialTarget?.recipientBusiness) {
                setTitle('');
                setPreheader('');
                setMessage(`<p>Hello <strong>${initialTarget.recipientBusiness.name}</strong> Team,</p><p></p><p>Best regards,<br/><strong>HelferAI Team</strong></p>`);
                setBusinessId(initialTarget.recipientBusiness.id);
                setSegment('Specific Business');
            } else {
                // Default broadcast
                setChannel('Email');
                setSegment('All Customers');
                setBusinessId('');
                setSelectedUserIds([]);
                // Pre-fill with general announcement template
                const t = TEMPLATES[0];
                setTitle(t.subject);
                setPreheader(t.preheader);
                setMessage(t.content);
            }
        }
    }, [isOpen, isDirect, initialTarget]);

    const handleApplyTemplate = (templateId: string) => {
        const found = TEMPLATES.find(t => t.id === templateId);
        if (!found) return;
        setTitle(found.subject);
        setPreheader(found.preheader);
        setMessage(found.content);
        toast.info(`Applied "${found.name}" template`);
    };

    const handleSendTestEmail = async () => {
        if (!testEmailAddress || !testEmailAddress.includes('@')) {
            toast.error('Please enter a valid email address for testing');
            return;
        }
        if (!title || !message) {
            toast.error('Subject and message content are required to send a test');
            return;
        }

        try {
            await sendTestEmailMutation.mutateAsync({
                testEmail: testEmailAddress,
                title,
                message,
                preheader: preheader || undefined,
            });
            setIsTestEmailOpen(false);
        } catch (err) { }
    };

    const handleFinalSend = async () => {
        if (!title.trim()) {
            toast.error('Please enter an email subject');
            return;
        }
        if (!message.trim() || message === '<p></p>') {
            toast.error('Please enter the email body content');
            return;
        }

        try {
            if (isDirect && initialTarget?.recipientUser) {
                await sendDirectEmailMutation.mutateAsync({
                    userId: initialTarget.recipientUser.id,
                    email: initialTarget.recipientUser.email,
                    title,
                    message,
                    preheader: preheader || undefined,
                });
            } else {
                await sendBroadcastMutation.mutateAsync({
                    title,
                    message,
                    channel,
                    segment,
                    businessId: businessId || undefined,
                    businessIds: businessId ? [businessId] : undefined,
                    userIds: selectedUserIds.length > 0 ? selectedUserIds : undefined,
                    preheader: preheader || undefined,
                    isHtml: channel === 'Email',
                });
            }

            onSuccess?.();
            onClose();
        } catch (err) { }
    };

    // Interpolate sample variables for live preview
    const sampleRecipientName = isDirect
        ? initialTarget?.recipientUser?.name || 'Valued Partner'
        : 'Alex Morgan';
    const sampleEmail = isDirect
        ? initialTarget?.recipientUser?.email || 'user@example.com'
        : 'alex.morgan@store.com';
    const sampleBizName = isDirect
        ? initialTarget?.recipientBusiness?.name || initialTarget?.recipientUser?.businessName || 'Morgan General Stores'
        : 'Apex Retail Group';

    const getResolvedPreviewHtml = () => {
        let content = message || '<p style="color: #9ca3af; font-style: italic;">No message content composed yet...</p>';
        content = content
            .replace(/{{\s*name\s*}}/gi, sampleRecipientName)
            .replace(/{{\s*email\s*}}/gi, sampleEmail)
            .replace(/{{\s*businessName\s*}}/gi, sampleBizName)
            .replace(/{{\s*date\s*}}/gi, new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))
            .replace(/{{\s*year\s*}}/gi, new Date().getFullYear().toString());

        return content;
    };

    const isSending = sendBroadcastMutation.isPending || sendDirectEmailMutation.isPending;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: '#eaf4e3', color: '#6c9e4e',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Mail size={20} />
                    </div>
                    <div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>
                            {isDirect
                                ? `Send Formatted Email to ${initialTarget?.recipientUser?.name || initialTarget?.recipientUser?.email || 'User'}`
                                : 'Compose Formatted Broadcast & Announcement'}
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>
                            Rich text formatting &bull; Dynamic variables &bull; Cross-client email template
                        </div>
                    </div>
                </div>
            }
            maxWidth="960px"
            footer={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    {/* Left Actions */}
                    <div style={{ display: 'flex', gap: 8 }}>
                        {channel === 'Email' && (
                            <button
                                type="button"
                                onClick={() => {
                                    setTestEmailAddress(initialTarget?.recipientUser?.email || '');
                                    setIsTestEmailOpen(true);
                                }}
                                style={{
                                    background: '#f3f4f6',
                                    color: '#374151',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: 8,
                                    padding: '8px 14px',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                }}
                            >
                                <Send size={13} /> Send Test Email
                            </button>
                        )}
                    </div>

                    {/* Right Actions */}
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '10px 18px',
                                borderRadius: 8,
                                border: 'none',
                                background: '#f3f4f6',
                                color: '#6b7280',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleFinalSend}
                            disabled={isSending}
                            style={{
                                padding: '10px 24px',
                                borderRadius: 8,
                                border: 'none',
                                background: '#6c9e4e',
                                color: '#ffffff',
                                fontWeight: 700,
                                fontSize: 14,
                                cursor: isSending ? 'not-allowed' : 'pointer',
                                boxShadow: '0 2px 8px rgba(108,158,78,0.25)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                            }}
                        >
                            <Send size={15} />
                            {isSending
                                ? 'Dispatching...'
                                : isDirect
                                    ? 'Send Formatted Email'
                                    : 'Send Broadcast Campaign'}
                        </button>
                    </div>
                </div>
            }
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {/* Mode Selector & Tab Header Bar */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#f9fafb',
                    padding: '8px 14px',
                    borderRadius: 10,
                    border: '1px solid #e5e7eb',
                    flexWrap: 'wrap',
                    gap: 10,
                }}>
                    {/* Channel Selector (If broadcast) */}
                    {!isDirect ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase' }}>Channel:</span>
                            <div style={{ display: 'flex', background: '#e5e7eb', borderRadius: 8, padding: 2 }}>
                                <button
                                    type="button"
                                    onClick={() => setChannel('Email')}
                                    style={{
                                        padding: '4px 12px',
                                        borderRadius: 6,
                                        border: 'none',
                                        fontSize: 12,
                                        fontWeight: 600,
                                        background: channel === 'Email' ? '#ffffff' : 'transparent',
                                        color: channel === 'Email' ? '#1a1a2e' : '#6b7280',
                                        boxShadow: channel === 'Email' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Formatted Email
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setChannel('WhatsApp')}
                                    style={{
                                        padding: '4px 12px',
                                        borderRadius: 6,
                                        border: 'none',
                                        fontSize: 12,
                                        fontWeight: 600,
                                        background: channel === 'WhatsApp' ? '#ffffff' : 'transparent',
                                        color: channel === 'WhatsApp' ? '#1a1a2e' : '#6b7280',
                                        boxShadow: channel === 'WhatsApp' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    WhatsApp
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#4b5563' }}>
                            <User size={15} color="#6c9e4e" />
                            <span>Recipient: <strong>{initialTarget.recipientUser?.name}</strong> ({initialTarget.recipientUser?.email})</span>
                        </div>
                    )}

                    {/* Pre-made Templates Dropdown */}
                    {channel === 'Email' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Sparkles size={14} color="#6c9e4e" />
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#4b5563' }}>Template:</span>
                            <select
                                onChange={e => handleApplyTemplate(e.target.value)}
                                defaultValue=""
                                style={{
                                    height: 32,
                                    borderRadius: 6,
                                    border: '1px solid #d1d5db',
                                    background: '#ffffff',
                                    fontSize: 12,
                                    padding: '0 8px',
                                    color: '#1a1a2e',
                                    outline: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                <option value="" disabled>Select a Template...</option>
                                {TEMPLATES.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Editor / Live Preview Tab Switcher */}
                    <div style={{ display: 'flex', background: '#e5e7eb', borderRadius: 8, padding: 2 }}>
                        <button
                            type="button"
                            onClick={() => setActiveTab('compose')}
                            style={{
                                padding: '5px 12px',
                                borderRadius: 6,
                                border: 'none',
                                fontSize: 12,
                                fontWeight: 600,
                                background: activeTab === 'compose' ? '#ffffff' : 'transparent',
                                color: activeTab === 'compose' ? '#1a1a2e' : '#6b7280',
                                boxShadow: activeTab === 'compose' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                            }}
                        >
                            <Edit3 size={13} /> Edit
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('preview')}
                            style={{
                                padding: '5px 12px',
                                borderRadius: 6,
                                border: 'none',
                                fontSize: 12,
                                fontWeight: 600,
                                background: activeTab === 'preview' ? '#ffffff' : 'transparent',
                                color: activeTab === 'preview' ? '#1a1a2e' : '#6b7280',
                                boxShadow: activeTab === 'preview' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                            }}
                        >
                            <Eye size={13} /> Live Preview
                        </button>
                    </div>
                </div>

                {/* Tab: Compose View */}
                {activeTab === 'compose' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Target Segment Selection (Only for broadcast) */}
                        {!isDirect && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                                        Target Audience Segment
                                    </label>
                                    <SearchableSelect
                                        value={segment}
                                        onChange={val => {
                                            setSegment(val);
                                            if (val !== 'Specific Business') setBusinessId('');
                                            if (val !== 'Specific Users') setSelectedUserIds([]);
                                        }}
                                        options={[
                                            { value: 'All Customers', label: 'All Platform Users' },
                                            { value: 'Active Subscribers', label: 'Active Subscribers (Paid Plans)' },
                                            { value: 'Trial Users', label: 'Trial Users' },
                                            { value: 'Expired Businesses', label: 'Expired Subscription Users' },
                                            { value: 'Specific Business', label: 'Specific Business Customers' },
                                            { value: 'Specific Users', label: 'Specific Users Multi-Select' },
                                        ]}
                                    />
                                </div>

                                {segment === 'Specific Business' && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                                            Select Business
                                        </label>
                                        <SearchableSelect
                                            value={businessId}
                                            onChange={val => setBusinessId(val)}
                                            onSearch={setBusinessSearch}
                                            isLoading={isBizLoading}
                                            placeholder="Search by business name or email..."
                                            options={businessesData?.data?.map(b => ({
                                                value: b.id,
                                                label: b.name,
                                                subLabel: b.email,
                                            })) || []}
                                        />
                                    </div>
                                )}

                                {segment === 'Specific Users' && (
                                    <div>
                                        <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                                            Select User(s)
                                        </label>
                                        <SearchableSelect
                                            value={selectedUserIds[0] || ''}
                                            onChange={val => setSelectedUserIds(prev => prev.includes(val) ? prev : [...prev, val])}
                                            onSearch={setUserSearch}
                                            isLoading={isUsersLoading}
                                            placeholder="Search and add platform users..."
                                            options={usersData?.data?.map(u => ({
                                                value: u.id,
                                                label: u.name || 'Anonymous User',
                                                subLabel: u.email,
                                            })) || []}
                                        />
                                        {selectedUserIds.length > 0 && (
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                                                {selectedUserIds.map(uid => {
                                                    const u = usersData?.data?.find(x => x.id === uid);
                                                    return (
                                                        <span key={uid} style={{
                                                            background: '#eaf4e3',
                                                            color: '#166534',
                                                            padding: '2px 8px',
                                                            borderRadius: 6,
                                                            fontSize: 11,
                                                            fontWeight: 600,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 4
                                                        }}>
                                                            {u?.name || u?.email || uid}
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedUserIds(prev => prev.filter(x => x !== uid))}
                                                                style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer', padding: 0 }}
                                                            >
                                                                &times;
                                                            </button>
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Subject Line & Preheader */}
                        <div style={{ display: 'grid', gridTemplateColumns: channel === 'Email' ? '2fr 1fr' : '1fr', gap: 14 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                                    {channel === 'Email' ? 'Email Subject Line' : 'Broadcast Title / Subject'}
                                </label>
                                <input
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="e.g. Important Service Update for {{businessName}}"
                                    style={{
                                        width: '100%', height: 42, borderRadius: 10,
                                        border: '1.5px solid #e5e7eb', padding: '0 14px',
                                        fontSize: 14, outline: 'none', color: '#1a1a2e',
                                        background: '#f9fafb',
                                    }}
                                />
                            </div>

                            {channel === 'Email' && (
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                                        Preheader Snippet <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 400 }}>(Inbox preview)</span>
                                    </label>
                                    <input
                                        value={preheader}
                                        onChange={e => setPreheader(e.target.value)}
                                        placeholder="Quick summary shown in inbox preview..."
                                        style={{
                                            width: '100%', height: 42, borderRadius: 10,
                                            border: '1.5px solid #e5e7eb', padding: '0 14px',
                                            fontSize: 13, outline: 'none', color: '#1a1a2e',
                                            background: '#f9fafb',
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Message Content Area */}
                        <div>
                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                                <span>Message Body {channel === 'Email' ? '(Rich Text Formatted)' : '(Plain text)'}</span>
                                {channel === 'Email' && (
                                    <span style={{ fontSize: 11, color: '#6c9e4e', fontWeight: 600 }}>
                                        Tip: Use "Insert Variable" to personalize for every customer!
                                    </span>
                                )}
                            </label>

                            {channel === 'Email' ? (
                                <RichTextEditor
                                    value={message}
                                    onChange={setMessage}
                                    minHeight={280}
                                />
                            ) : (
                                <textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder="Type your WhatsApp message here..."
                                    style={{
                                        width: '100%', height: 220, borderRadius: 10,
                                        border: '1.5px solid #e5e7eb', padding: '14px',
                                        fontSize: 14, outline: 'none', color: '#1a1a2e',
                                        background: '#f9fafb', resize: 'none',
                                    }}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* Tab: Live Preview View */}
                {activeTab === 'preview' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {/* Device Toggle */}
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            marginBottom: 16, background: '#f3f4f6', padding: '4px 8px', borderRadius: 8
                        }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>Preview as:</span>
                            <button
                                type="button"
                                onClick={() => setPreviewDevice('desktop')}
                                style={{
                                    border: 'none', padding: '4px 10px', borderRadius: 6,
                                    background: previewDevice === 'desktop' ? '#ffffff' : 'transparent',
                                    color: previewDevice === 'desktop' ? '#1a1a2e' : '#6b7280',
                                    fontWeight: 600, fontSize: 12, cursor: 'pointer',
                                    boxShadow: previewDevice === 'desktop' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                                    display: 'flex', alignItems: 'center', gap: 6,
                                }}
                            >
                                <Monitor size={14} /> Desktop (600px)
                            </button>
                            <button
                                type="button"
                                onClick={() => setPreviewDevice('mobile')}
                                style={{
                                    border: 'none', padding: '4px 10px', borderRadius: 6,
                                    background: previewDevice === 'mobile' ? '#ffffff' : 'transparent',
                                    color: previewDevice === 'mobile' ? '#1a1a2e' : '#6b7280',
                                    fontWeight: 600, fontSize: 12, cursor: 'pointer',
                                    boxShadow: previewDevice === 'mobile' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                                    display: 'flex', alignItems: 'center', gap: 6,
                                }}
                            >
                                <Smartphone size={14} /> Mobile (375px)
                            </button>
                        </div>

                        {/* Email Client Simulation Frame */}
                        <div style={{
                            width: previewDevice === 'mobile' ? 385 : '100%',
                            maxWidth: previewDevice === 'mobile' ? 385 : 620,
                            background: '#f4f6f8',
                            borderRadius: previewDevice === 'mobile' ? 24 : 12,
                            border: previewDevice === 'mobile' ? '8px solid #1f2937' : '1px solid #e5e7eb',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                            overflow: 'hidden',
                            transition: 'all 0.25s ease',
                        }}>
                            {/* Email Client Header Bar */}
                            <div style={{ background: '#ffffff', padding: '12px 18px', borderBottom: '1px solid #e5e7eb' }}>
                                <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>
                                    {title ? title.replace(/{{\s*businessName\s*}}/gi, sampleBizName) : '(No Subject)'}
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280' }}>
                                    <div>
                                        <strong>From:</strong> HelferAI &lt;support@helferai.com&gt;
                                    </div>
                                    <div>
                                        <strong>To:</strong> {sampleRecipientName} &lt;{sampleEmail}&gt;
                                    </div>
                                </div>
                                {preheader && (
                                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                                        <strong>Snippet:</strong> {preheader}
                                    </div>
                                )}
                            </div>

                            {/* Email Body Shell */}
                            <div style={{ padding: previewDevice === 'mobile' ? '12px 6px' : '20px 12px' }}>
                                <div style={{
                                    background: '#ffffff',
                                    borderRadius: 10,
                                    overflow: 'hidden',
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                                }}>
                                    {/* Brand Header */}
                                    <div style={{
                                        background: '#1a1a2e',
                                        padding: '20px 24px',
                                        borderBottom: '3px solid #6c9e4e',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}>
                                        <div style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                                            Helfer<span style={{ color: '#6c9e4e' }}>AI</span>
                                        </div>
                                        <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                            Official Notification
                                        </span>
                                    </div>

                                    {/* Formatted Content */}
                                    <div
                                        style={{
                                            padding: previewDevice === 'mobile' ? 20 : 28,
                                            fontSize: 14,
                                            lineHeight: 1.65,
                                            color: '#374151',
                                        }}
                                        dangerouslySetInnerHTML={{ __html: getResolvedPreviewHtml() }}
                                    />

                                    {/* Brand Footer */}
                                    <div style={{
                                        background: '#f9fafb',
                                        padding: '18px 24px',
                                        borderTop: '1px solid #f3f4f6',
                                        textAlign: 'center',
                                        fontSize: 11,
                                        color: '#9ca3af',
                                        lineHeight: 1.5,
                                    }}>
                                        <p style={{ margin: '0 0 6px', fontWeight: 600, color: '#6b7280', fontSize: 12 }}>
                                            Sent by HelferAI &bull; Smarter Business Management
                                        </p>
                                        <p style={{ margin: 0 }}>
                                            This email was intended for {sampleRecipientName} ({sampleEmail}).<br />
                                            &copy; {new Date().getFullYear()} HelferAI. All rights reserved.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Sub-Modal: Send Test Email */}
            {isTestEmailOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', zIndex: 10000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(3px)',
                }}>
                    <div style={{
                        background: '#ffffff', borderRadius: 12, padding: 24,
                        width: 420, maxWidth: '90vw', boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                    }}>
                        <h4 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>
                            Send Test Email
                        </h4>
                        <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6b7280' }}>
                            Dispatch an immediate test copy to your inbox to verify rendering and styling.
                        </p>
                        <div style={{ marginBottom: 18 }}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                                Destination Email Address
                            </label>
                            <input
                                value={testEmailAddress}
                                onChange={e => setTestEmailAddress(e.target.value)}
                                placeholder="yourname@domain.com"
                                autoFocus
                                style={{
                                    width: '100%', height: 40, borderRadius: 8,
                                    border: '1.5px solid #e5e7eb', padding: '0 12px',
                                    fontSize: 14, outline: 'none', color: '#1a1a2e',
                                }}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button
                                type="button"
                                onClick={() => setIsTestEmailOpen(false)}
                                style={{
                                    background: '#f3f4f6', color: '#4b5563', border: 'none',
                                    borderRadius: 8, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSendTestEmail}
                                disabled={sendTestEmailMutation.isPending}
                                style={{
                                    background: '#6c9e4e', color: '#ffffff', border: 'none',
                                    borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 700,
                                    cursor: sendTestEmailMutation.isPending ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', gap: 6,
                                }}
                            >
                                <Send size={13} />
                                {sendTestEmailMutation.isPending ? 'Sending...' : 'Send Test'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
}
