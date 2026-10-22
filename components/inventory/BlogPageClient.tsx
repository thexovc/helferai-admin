'use client';
import React, { useState } from 'react';
import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { toast } from 'sonner';
import { FileText, Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import Topbar from '../Topbar';
import Modal from '../Modal';
import Pagination from '../Pagination';
import { inventoryClient } from '@/api/api-client';
import { useDebouncedValue } from '@/app/lib/useDebouncedValue';

const BASE = '/admin/api/inventory/blog';
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
const blank = () => ({ title: '', section: 'Inventory tips', tags: [] as string[], excerpt: '', content: '', coverImageUrl: '', authorName: '', slug: '' });

// Small Markdown preview: headings, bold, italic, links, lists and paragraphs
function mdToHtml(md: string) {
    const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const inline = (s: string) => esc(s)
        .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\*(.+?)\*/g, '<i>$1</i>')
        .replace(/\[(.+?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
    return md.split(/\n{2,}/).map(block => {
        const lines = block.split('\n');
        const h = block.match(/^(#{1,3})\s+(.*)/);
        if (h) return `<h${h[1].length + 1}>${inline(h[2])}</h${h[1].length + 1}>`;
        if (lines.every(l => /^\s*[-*]\s+/.test(l))) return `<ul>${lines.map(l => `<li>${inline(l.replace(/^\s*[-*]\s+/, ''))}</li>`).join('')}</ul>`;
        if (lines.every(l => /^\s*\d+\.\s+/.test(l))) return `<ol>${lines.map(l => `<li>${inline(l.replace(/^\s*\d+\.\s+/, ''))}</li>`).join('')}</ol>`;
        return `<p>${lines.map(inline).join('<br/>')}</p>`;
    }).join('');
}

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
    const [preview, setPreview] = useState(false);
    const [saving, setSaving] = useState(false);

    const qs = new URLSearchParams({ page: String(page), pageSize: String(pageSize), ...(debounced && { search: debounced }), ...(section && { section }), ...(status && { status }) });
    const { data, isLoading } = useQuery({
        queryKey: ['inventory', 'blog', page, pageSize, debounced, section, status],
        queryFn: () => inventoryClient.get<{ posts: Post[]; meta: { total: number }; sections: string[] }>(`${BASE}?${qs}`),
        placeholderData: keepPreviousData,
    });
    const posts = data?.posts || [];
    const sections = data?.sections || ['Inventory tips', 'Selling', 'Business copilot', 'Product updates', 'Our story'];
    const total = data?.meta?.total || 0;
    const refresh = () => queryClient.invalidateQueries({ queryKey: ['inventory', 'blog'] });
    const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

    const openNew = () => { setEditing(null); setForm(blank()); setTagDraft(''); setPreview(false); setOpen(true); };
    const openEdit = (p: Post) => {
        setEditing(p);
        setForm({ title: p.title, section: p.section, tags: p.tags, excerpt: p.excerpt || '', content: p.content, coverImageUrl: p.coverImageUrl || '', authorName: p.authorName || '', slug: p.slug });
        setTagDraft(''); setPreview(false); setOpen(true);
    };
    const addTag = () => {
        const t = tagDraft.trim().toLowerCase().replace(/,$/, '');
        if (t && !form.tags.includes(t)) set('tags', [...form.tags, t]);
        setTagDraft('');
    };

    const save = async (nextStatus: 'draft' | 'published') => {
        if (!form.title.trim()) return toast.error('Add a title');
        if (!form.content.trim()) return toast.error('Write the article');
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
                    <button onClick={openNew} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: '#6c9e4e', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                        <Plus size={15} /> New article
                    </button>
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
                                <span style={label}>Section</span>
                                <select value={form.section} onChange={e => set('section', e.target.value)} style={input}>
                                    {(sections.includes(form.section) ? sections : [form.section, ...sections]).map(s => <option key={s}>{s}</option>)}
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <span style={{ ...label, marginBottom: 0 }}>Article</span>
                                <div style={{ display: 'inline-flex', gap: 2, background: '#f3f4f6', borderRadius: 8, padding: 3 }}>
                                    {[['Write', false], ['Preview', true]].map(([l, v]) => (
                                        <button key={String(l)} onClick={() => setPreview(v as boolean)} style={{ padding: '4px 12px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: preview === v ? '#fff' : 'transparent', color: preview === v ? '#1a1a2e' : '#6b7280' }}>{l as string}</button>
                                    ))}
                                </div>
                            </div>
                            {preview
                                ? <div className="blog-preview" style={{ minHeight: 260, border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '6px 16px', fontSize: 14, color: '#374151', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: mdToHtml(form.content) || '<p style="color:#9ca3af">Nothing written yet</p>' }} />
                                : <textarea value={form.content} onChange={e => set('content', e.target.value)} placeholder={'Write the article. Formatting:\n## Heading\n**bold**, *italic*, [link](https://...)\n- list item'} style={{ ...input, height: 260, padding: '10px 12px', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }} />}
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
