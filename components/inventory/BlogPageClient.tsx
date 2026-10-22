'use client';
import React, { useState } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FileText, Plus, Edit2, Trash2, Search, X, ChevronUp, ChevronDown, Check, Layers } from 'lucide-react';
import Topbar from '../Topbar';
import Modal from '../Modal';
import Pagination from '../Pagination';
import dynamic from 'next/dynamic';
const RichTextEditor = dynamic(() => import('../RichTextEditor'), { ssr: false });
import { inventoryClient } from '@/api/api-client';
import { useDebouncedValue } from '@/app/lib/useDebouncedValue';

const BASE = '/admin/api/inventory/blog';
type Section = { name: string; articles: number };
type Post = {
    id: string; title: string; slug: string; section: string; tags: string[]; excerpt: string | null; content: string;
    coverImageUrl: string | null; authorName: string | null; status: 'draft' | 'published'; publishedAt: string | null;
    readMinutes: number; updatedAt: string | null;
};
const th: React.CSSProperties = { padding: '10px 14px', fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', textAlign: 'left', borderBottom: '1px solid #f0f0f0', background: '#f9fafb', whiteSpace: 'nowrap' };
const td: React.CSSProperties = { padding: '12px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #f5f5f5', verticalAlign: 'middle' };
const input: React.CSSProperties = { height: 40, width: '100%', border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '0 12px', fontSize: 14, outline: 'none', background: '#f9fafb', color: '#1a1a2e' };
const label: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 };
const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const blank = (section = '') => ({ title: '', section, tags: [] as string[], excerpt: '', content: '', coverImageUrl: '', authorName: '', slug: '' });

// Articles for the website blog: write, publish and tag them here
export default function BlogPageClient() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [search, setSearch] = useState('');
    const [section, setSection] = useState('');
    const [status, setStatus] = useState('');
    const debounced = useDebouncedValue(search);
    const [editing, setEditing] = useState<Post | null>(null);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(blank());
    const [tagDraft, setTagDraft] = useState('');
    const [saving, setSaving] = useState(false);
    const [sectionsOpen, setSectionsOpen] = useState(false);
    const [newSection, setNewSection] = useState('');
    const [renaming, setRenaming] = useState<{ from: string; to: string } | null>(null);

    // Add, rename, reorder or delete sections; every change refreshes the list
    const sectionCall = async (fn: () => Promise<any>, ok: string) => {
        try { await fn(); toast.success(ok); refresh(); return true; }
        catch (err: any) { toast.error(err?.message || 'Could not change the section'); return false; }
    };
    const addSection = async () => {
        const name = newSection.trim();
        if (!name) return;
        if (await sectionCall(() => inventoryClient.post(`${BASE}/sections`, { name }), `Section "${name}" added`)) setNewSection('');
    };

    const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize), ...(debounced && { search: debounced }), ...(section && { section }), ...(status && { status }) });
    const { data, isLoading } = useQuery({
        queryKey: ['inventory', 'blog', page, pageSize, debounced, section, status],
        queryFn: () => inventoryClient.get<{ posts: Post[]; meta: { total: number }; sections: Section[] }>(`${BASE}?${qs}`),
        placeholderData: keepPreviousData,
    });
    const posts = data?.posts || [];
    const sectionRows: Section[] = data?.sections || [];
    const sections = sectionRows.map(x => x.name);
    const total = data?.meta?.total || 0;
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['inventory', 'blog'] });
    const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

    const openNew = () => { setEditing(null); setForm(blank(sections[0] || '')); setTagDraft(''); setOpen(true); };
    const openEdit = (p: Post) => {
        setEditing(p);
        setForm({ title: p.title, section: p.section, tags: p.tags, excerpt: p.excerpt || '', content: p.content, coverImageUrl: p.coverImageUrl || '', authorName: p.authorName || '', slug: p.slug });
        setTagDraft(''); setOpen(true);
    };
    const addTag = () => {
        const t = tagDraft.trim().toLowerCase().replace(/,$/, '');
        if (t && !form.tags.includes(t)) set('tags', [...form.tags, t]);
        setTagDraft('');
    };

    const save = async (nextStatus: 'draft' | 'published') => {
        if (!form.title.trim()) return toast.error('Add a title');
        if (!form.content.replace(/<[^>]*>/g, '').trim()) return toast.error('Write the article');
        setSaving(true);
        const dto = { ...form, tags: tagDraft.trim() ? [...form.tags, tagDraft.trim().toLowerCase()] : form.tags, status: nextStatus };
        try {
            if (editing) await inventoryClient.put(`${BASE}/${editing.id}`, dto);
            else await inventoryClient.post(BASE, dto);
            toast.success(nextStatus === 'published' ? 'Published on the website blog' : 'Saved as draft');
            setOpen(false);
            refresh();
        } catch (err: any) {
            toast.error(err?.message || 'Could not save');
        } finally {
            setSaving(false);
        }
    };

    const remove = async (p: Post) => {
        if (!confirm(`Delete "${p.title}"? It will disappear from the website blog.`)) return;
        try {
            await inventoryClient.delete(`${BASE}/${p.id}`);
            toast.success('Article deleted');
            refresh();
        } catch (err: any) { toast.error(err?.message || 'Could not delete it'); }
    };

    const selectStyle: React.CSSProperties = { height: 40, borderRadius: 10, border: '1px solid #e5e7eb', padding: '0 10px', fontSize: 13, background: '#fff', color: '#374151', outline: 'none' };

    return (
        <div>
            <Topbar title="Blog" subtitle="Articles shown on the website blog." product="inventory" />
            <div style={{ padding: 'var(--content-padding)', display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: '#eaf4e3', color: '#6c9e4e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={24} /></div>
                        <div>
                            <h2 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: 0 }}>Blog articles</h2>
                            <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>{total} article{total === 1 ? '' : 's'}. Only published ones show on the website.</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setSectionsOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: '#fff', color: '#3f7d2c', border: '1.5px solid #6c9e4e', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                        <Layers size={15} /> Sections
                    </button>
                    <button onClick={openNew} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: '#6c9e4e', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                        <Plus size={15} /> New article
                    </button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
                        <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by title or tag" style={{ ...input, background: '#fff', paddingLeft: 36 }} />
                    </div>
                    <select value={section} onChange={e => { setSection(e.target.value); setPage(1); }} style={selectStyle}>
                        <option value="">All sections</option>
                        {sections.map(s => <option key={s}>{s}</option>)}
                    </select>
                    <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} style={selectStyle}>
                        <option value="">Published and drafts</option>
                        <option value="published">Published</option>
                        <option value="draft">Drafts</option>
                    </select>
                </div>

                <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
                        <thead><tr>{['Title', 'Section', 'Tags', 'Status', 'Published', 'Updated', ''].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
                        <tbody>
                            {isLoading ? <tr><td colSpan={7} style={{ ...td, color: '#9ca3af' }}>Loading...</td></tr>
                                : posts.length === 0 ? <tr><td colSpan={7} style={{ ...td, textAlign: 'center', padding: 40, color: '#9ca3af' }}>No articles yet. Click New article to write the first one.</td></tr>
                                    : posts.map(p => (
                                        <tr key={p.id}>
                                            <td style={{ ...td, maxWidth: 340 }}>
                                                <b style={{ color: '#1a1a2e', cursor: 'pointer' }} onClick={() => openEdit(p)}>{p.title}</b>
                                                <div style={{ fontSize: 11, color: '#9ca3af' }}>/blog/{p.slug} · {p.readMinutes} min read</div>
                                            </td>
                                            <td style={td}><span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: '#f0f7eb', color: '#3f7d2c', whiteSpace: 'nowrap' }}>{p.section}</span></td>
                                            <td style={td}>
                                                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', maxWidth: 220 }}>
                                                    {p.tags.length ? p.tags.map(t => <span key={t} style={{ padding: '2px 7px', borderRadius: 6, fontSize: 11, background: '#f3f4f6', color: '#4b5563' }}>#{t}</span>) : <span style={{ color: '#d1d5db' }}>—</span>}
                                                </div>
                                            </td>
                                            <td style={td}><span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 11, fontWeight: 700, background: p.status === 'published' ? '#dcfce7' : '#fef3c7', color: p.status === 'published' ? '#15803d' : '#b45309' }}>{p.status === 'published' ? 'Published' : 'Draft'}</span></td>
                                            <td style={{ ...td, fontSize: 12, whiteSpace: 'nowrap' }}>{fmtDate(p.publishedAt)}</td>
                                            <td style={{ ...td, fontSize: 12, whiteSpace: 'nowrap', color: '#6b7280' }}>{fmtDate(p.updatedAt)}</td>
                                            <td style={td}>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <button title="Edit" onClick={() => openEdit(p)} style={{ background: '#f0f9ff', border: 'none', color: '#0284c7', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }}><Edit2 size={14} /></button>
                                                    <button title="Delete" onClick={() => remove(p)} style={{ background: '#fee2e2', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }}><Trash2 size={14} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                        </tbody>
                    </table>
                    <div style={{ padding: '12px 20px' }}>
                        <Pagination currentPage={page} totalPages={Math.ceil(total / pageSize) || 1} onPageChange={setPage} totalItems={total} pageSize={pageSize} onPageSizeChange={n => { setPageSize(n); setPage(1); }} />
                    </div>
                </div>
            </div>

            {open && (
                <Modal isOpen onClose={() => setOpen(false)} title={editing ? 'Edit article' : 'New article'} maxWidth={820}
                    footer={<>
                        <button onClick={() => setOpen(false)} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: '#f3f4f6', color: '#6b7280', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                        <button onClick={() => save('draft')} disabled={saving} style={{ padding: '10px 18px', borderRadius: 8, border: '1.5px solid #6c9e4e', background: '#fff', color: '#3f7d2c', fontWeight: 700, cursor: 'pointer' }}>{editing?.status === 'published' ? 'Unpublish (save as draft)' : 'Save draft'}</button>
                        <button onClick={() => save('published')} disabled={saving} style={{ padding: '10px 22px', borderRadius: 8, border: 'none', background: '#6c9e4e', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>{saving ? 'Saving...' : editing?.status === 'published' ? 'Update' : 'Publish'}</button>
                    </>}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <div>
                            <span style={label}>Title</span>
                            <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. 5 ways to stop running out of stock" style={input} maxLength={255} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={label}>Section</span>
                                    <button type="button" onClick={() => setSectionsOpen(true)} style={{ border: 'none', background: 'none', color: '#6c9e4e', fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: 0, marginBottom: 6 }}>+ Add a section</button>
                                </div>
                                <select value={form.section} onChange={e => set('section', e.target.value)} style={input}>
                                    {(!form.section || sections.includes(form.section) ? sections : [form.section, ...sections]).map(s => <option key={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <span style={label}>Author (optional)</span>
                                <input value={form.authorName} onChange={e => set('authorName', e.target.value)} placeholder="e.g. HelferAI team" style={input} />
                            </div>
                        </div>
                        <div>
                            <span style={label}>Tags</span>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', minHeight: 40, border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '6px 8px', background: '#f9fafb' }}>
                                {form.tags.map(t => (
                                    <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, fontSize: 12, background: '#eaf4e3', color: '#3f7d2c', fontWeight: 600 }}>
                                        #{t}<X size={12} style={{ cursor: 'pointer' }} onClick={() => set('tags', form.tags.filter(x => x !== t))} />
                                    </span>
                                ))}
                                <input value={tagDraft} onChange={e => setTagDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }} onBlur={addTag}
                                    placeholder={form.tags.length ? '' : 'Type a tag and press Enter, e.g. stock'} style={{ flex: 1, minWidth: 140, border: 'none', outline: 'none', background: 'transparent', fontSize: 13 }} />
                            </div>
                        </div>
                        <div>
                            <span style={label}>Short summary (shown on the article card)</span>
                            <textarea value={form.excerpt} onChange={e => set('excerpt', e.target.value)} placeholder="One or two sentences" style={{ ...input, height: 60, padding: '10px 12px', resize: 'none', fontFamily: 'inherit' }} maxLength={400} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
                            <div>
                                <span style={label}>Cover image link (optional)</span>
                                <input value={form.coverImageUrl} onChange={e => set('coverImageUrl', e.target.value)} placeholder="https://..." style={input} />
                            </div>
                            <div>
                                <span style={label}>Web address</span>
                                <input value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="made from the title" style={input} />
                            </div>
                        </div>
                        <div>
                            <span style={label}>Article</span>
                            <RichTextEditor value={form.content} onChange={html => set('content', html)} placeholder="Write the article. Use the toolbar for headings, bold, lists and links." minHeight={300} hideEmailTools />
                        </div>
                    </div>
                </Modal>
            )}

            {sectionsOpen && (
                <Modal isOpen onClose={() => { setSectionsOpen(false); setRenaming(null); }} title="Blog sections" maxWidth={520}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ fontSize: 13, color: '#6b7280' }}>These are the filters on the website blog, in this order.</div>
                        <div style={{ border: '1px solid #f0f0f0', borderRadius: 12 }}>
                            {sectionRows.map((sec, i) => (
                                <div key={sec.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderTop: i ? '1px solid #f5f5f5' : 'none' }}>
                                    {renaming?.from === sec.name ? (
                                        <>
                                            <input autoFocus value={renaming.to} onChange={e => setRenaming({ ...renaming, to: e.target.value })} style={{ ...input, height: 34, flex: 1 }}
                                                onKeyDown={async e => { if (e.key === 'Enter' && await sectionCall(() => inventoryClient.put(`${BASE}/sections/${encodeURIComponent(sec.name)}`, { name: renaming.to }), 'Section renamed')) setRenaming(null); }} />
                                            <button title="Save" onClick={async () => { if (await sectionCall(() => inventoryClient.put(`${BASE}/sections/${encodeURIComponent(sec.name)}`, { name: renaming.to }), 'Section renamed')) setRenaming(null); }} style={{ background: '#dcfce7', border: 'none', color: '#15803d', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }}><Check size={14} /></button>
                                            <button title="Cancel" onClick={() => setRenaming(null)} style={{ background: '#f3f4f6', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 6, borderRadius: 6, display: 'flex' }}><X size={14} /></button>
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ flex: 1 }}>
                                                <b style={{ fontSize: 14, color: '#1a1a2e' }}>{sec.name}</b>
                                                <div style={{ fontSize: 11, color: '#9ca3af' }}>{sec.articles} article{sec.articles === 1 ? '' : 's'}</div>
                                            </div>
                                            <button title="Move up" disabled={i === 0} onClick={() => sectionCall(() => inventoryClient.put(`${BASE}/sections/${encodeURIComponent(sec.name)}`, { move: 'up' }), 'Order updated')} style={{ background: '#f3f4f6', border: 'none', color: i === 0 ? '#d1d5db' : '#6b7280', cursor: i === 0 ? 'default' : 'pointer', padding: 5, borderRadius: 6, display: 'flex' }}><ChevronUp size={14} /></button>
                                            <button title="Move down" disabled={i === sectionRows.length - 1} onClick={() => sectionCall(() => inventoryClient.put(`${BASE}/sections/${encodeURIComponent(sec.name)}`, { move: 'down' }), 'Order updated')} style={{ background: '#f3f4f6', border: 'none', color: i === sectionRows.length - 1 ? '#d1d5db' : '#6b7280', cursor: i === sectionRows.length - 1 ? 'default' : 'pointer', padding: 5, borderRadius: 6, display: 'flex' }}><ChevronDown size={14} /></button>
                                            <button title="Rename" onClick={() => setRenaming({ from: sec.name, to: sec.name })} style={{ background: '#f0f9ff', border: 'none', color: '#0284c7', cursor: 'pointer', padding: 5, borderRadius: 6, display: 'flex' }}><Edit2 size={14} /></button>
                                            <button title={sec.articles ? 'Move its articles to another section first' : 'Delete'} onClick={() => { if (confirm(`Delete the "${sec.name}" section?`)) sectionCall(() => inventoryClient.delete(`${BASE}/sections/${encodeURIComponent(sec.name)}`), 'Section deleted'); }} style={{ background: '#fee2e2', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 5, borderRadius: 6, display: 'flex' }}><Trash2 size={14} /></button>
                                        </>
                                    )}
                                </div>
                            ))}
                            {sectionRows.length === 0 && <div style={{ padding: 16, fontSize: 13, color: '#9ca3af' }}>No sections yet.</div>}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <input value={newSection} onChange={e => setNewSection(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addSection(); }} placeholder="New section name, e.g. Customer stories" style={{ ...input, flex: 1 }} maxLength={100} />
                            <button onClick={addSection} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 16px', background: '#6c9e4e', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}><Plus size={14} /> Add</button>
                        </div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>Renaming a section moves its articles with it. A section can only be deleted when no article uses it.</div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
