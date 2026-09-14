'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TipTapImage from '@tiptap/extension-image';
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    List, ListOrdered, Quote, Code, Heading1, Heading2, Heading3,
    Link as LinkIcon, Unlink, Undo, Redo, Minus, Eraser,
    Sparkles, MousePointerClick, ChevronDown, Check,
    Image as ImageIcon, Upload, X, FileImage
} from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    minHeight?: number;
}

const TEXT_COLORS = [
    { label: 'Default', value: '#1a1a2e' },
    { label: 'Brand Green', value: '#6c9e4e' },
    { label: 'Slate Gray', value: '#4b5563' },
    { label: 'Royal Blue', value: '#2563eb' },
    { label: 'Amber', value: '#d97706' },
    { label: 'Crimson', value: '#dc2626' },
    { label: 'Purple', value: '#7c3aed' },
];

const HIGHLIGHT_COLORS = [
    { label: 'None', value: '' },
    { label: 'Yellow', value: '#fef08a' },
    { label: 'Mint', value: '#dcfce7' },
    { label: 'Sky', value: '#dbeafe' },
    { label: 'Lavender', value: '#f3e8ff' },
];

const VARIABLES = [
    { label: 'Recipient Name', tag: '{{name}}', desc: "Recipient's full name" },
    { label: 'Recipient Email', tag: '{{email}}', desc: "Recipient's email address" },
    { label: 'Business Name', tag: '{{businessName}}', desc: "Associated business name" },
    { label: 'Today\'s Date', tag: '{{date}}', desc: "Formatted current date" },
    { label: 'Current Year', tag: '{{year}}', desc: "Current calendar year" },
];

export default function RichTextEditor({
    value,
    onChange,
    placeholder = 'Compose your formatted email message here...',
    minHeight = 280,
}: RichTextEditorProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [linkText, setLinkText] = useState('');

    const [isButtonModalOpen, setIsButtonModalOpen] = useState(false);
    const [buttonText, setButtonText] = useState('View Dashboard');
    const [buttonUrl, setButtonUrl] = useState('https://app.helferai.com');
    const [buttonColor, setButtonColor] = useState('#6c9e4e');

    // Image Insertion State
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');
    const [imageUrl, setImageUrl] = useState('');
    const [imageAlt, setImageAlt] = useState('');
    const [imageWidth, setImageWidth] = useState<'100%' | '480px' | '280px'>('100%');
    const [imageAlign, setImageAlign] = useState<'center' | 'left' | 'right'>('center');
    const [imagePreview, setImagePreview] = useState('');
    const [imageError, setImageError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
    const [isVarMenuOpen, setIsVarMenuOpen] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
                bulletList: { keepMarks: true, keepAttributes: false },
                orderedList: { keepMarks: true, keepAttributes: false },
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    style: 'color: #6c9e4e; text-decoration: underline; font-weight: 500;',
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            TextStyle,
            Color,
            Highlight.configure({ multicolor: true }),
            TipTapImage.configure({
                allowBase64: true,
                HTMLAttributes: {
                    style: 'max-width: 100%; height: auto; border-radius: 8px; margin: 16px auto; display: block;',
                },
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // Synchronize content if controlled value changes externally (e.g. template selection)
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    if (!isMounted || !editor) {
        return (
            <div style={{
                minHeight,
                border: '1.5px solid #e5e7eb',
                borderRadius: 12,
                background: '#f9fafb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9ca3af',
                fontSize: 14,
            }}>
                Loading rich text editor...
            </div>
        );
    }

    const openLinkModal = () => {
        const previousUrl = editor.getAttributes('link').href || '';
        const { from, to } = editor.state.selection;
        const selectedText = editor.state.doc.textBetween(from, to, ' ');
        setLinkUrl(previousUrl);
        setLinkText(selectedText || '');
        setIsLinkModalOpen(true);
    };

    const handleSaveLink = () => {
        if (!linkUrl) {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
        } else {
            const finalUrl = linkUrl.startsWith('http://') || linkUrl.startsWith('https://') || linkUrl.startsWith('mailto:')
                ? linkUrl
                : `https://${linkUrl}`;

            if (linkText && editor.state.selection.empty) {
                editor.chain().focus().insertContent(`<a href="${finalUrl}">${linkText}</a>`).run();
            } else {
                editor.chain().focus().extendMarkRange('link').setLink({ href: finalUrl }).run();
            }
        }
        setIsLinkModalOpen(false);
    };

    const handleInsertButton = () => {
        if (!buttonText || !buttonUrl) return;
        const finalUrl = buttonUrl.startsWith('http://') || buttonUrl.startsWith('https://')
            ? buttonUrl
            : `https://${buttonUrl}`;

        const buttonHtml = `<div style="text-align: center; margin: 20px 0;"><a href="${finalUrl}" class="email-btn" style="display: inline-block; background-color: ${buttonColor}; color: #ffffff !important; font-weight: 700; font-size: 15px; padding: 12px 28px; border-radius: 8px; text-decoration: none; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">${buttonText}</a></div><p></p>`;
        editor.chain().focus().insertContent(buttonHtml).run();
        setIsButtonModalOpen(false);
    };

    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setImageError('Please select a valid image file (PNG, JPG, WebP, GIF)');
            return;
        }
        if (file.size > 8 * 1024 * 1024) {
            setImageError('Image exceeds 8MB limit. Please select a smaller image.');
            return;
        }
        setImageError('');
        const reader = new FileReader();
        reader.onload = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleInsertImage = () => {
        const srcToUse = imageTab === 'upload' ? imagePreview : imageUrl.trim();
        if (!srcToUse) {
            setImageError('Please provide an image URL or upload a file');
            return;
        }

        const widthStyle = imageWidth === '100%'
            ? 'width: 100%; max-width: 100%;'
            : `width: ${imageWidth}; max-width: 100%;`;

        const imageHtml = `<div style="text-align: ${imageAlign}; margin: 18px 0;"><img src="${srcToUse}" alt="${imageAlt || 'HelferAI Image'}" style="${widthStyle} height: auto; border-radius: 8px; display: inline-block;" /></div><p></p>`;
        editor.chain().focus().insertContent(imageHtml).run();

        // Reset and close
        setImagePreview('');
        setImageUrl('');
        setImageAlt('');
        setImageError('');
        setIsImageModalOpen(false);
    };

    const handleInsertVariable = (tag: string) => {
        editor.chain().focus().insertContent(` ${tag} `).run();
        setIsVarMenuOpen(false);
    };

    // Calculate word and character count
    const textContent = editor.getText();
    const charCount = textContent.length;
    const wordCount = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;

    return (
        <div style={{
            border: '1.5px solid #e5e7eb',
            borderRadius: 12,
            background: '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
        }}>
            {/* Toolbar */}
            <div style={{
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                padding: '8px 10px',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
                alignItems: 'center',
                userSelect: 'none',
            }}>
                {/* Group 1: Undo / Redo */}
                <div style={toolGroupStyle}>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        style={toolbarIconBtn(false, !editor.can().undo())}
                        title="Undo (Ctrl+Z)"
                    >
                        <Undo size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        style={toolbarIconBtn(false, !editor.can().redo())}
                        title="Redo (Ctrl+Y)"
                    >
                        <Redo size={15} />
                    </button>
                </div>

                {/* Group 2: Headings */}
                <div style={toolGroupStyle}>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().setParagraph().run()}
                        style={toolbarIconBtn(editor.isActive('paragraph') && !editor.isActive('heading'))}
                        title="Normal Paragraph"
                    >
                        <span style={{ fontSize: 13, fontWeight: 700 }}>P</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        style={toolbarIconBtn(editor.isActive('heading', { level: 1 }))}
                        title="Heading 1"
                    >
                        <Heading1 size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        style={toolbarIconBtn(editor.isActive('heading', { level: 2 }))}
                        title="Heading 2"
                    >
                        <Heading2 size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        style={toolbarIconBtn(editor.isActive('heading', { level: 3 }))}
                        title="Heading 3"
                    >
                        <Heading3 size={16} />
                    </button>
                </div>

                {/* Group 3: Basic Formatting */}
                <div style={toolGroupStyle}>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        style={toolbarIconBtn(editor.isActive('bold'))}
                        title="Bold (Ctrl+B)"
                    >
                        <Bold size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        style={toolbarIconBtn(editor.isActive('italic'))}
                        title="Italic (Ctrl+I)"
                    >
                        <Italic size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        style={toolbarIconBtn(editor.isActive('underline'))}
                        title="Underline (Ctrl+U)"
                    >
                        <UnderlineIcon size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        style={toolbarIconBtn(editor.isActive('strike'))}
                        title="Strikethrough"
                    >
                        <Strikethrough size={15} />
                    </button>
                </div>

                {/* Group 4: Alignment */}
                <div style={toolGroupStyle}>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                        style={toolbarIconBtn(editor.isActive({ textAlign: 'left' }))}
                        title="Align Left"
                    >
                        <AlignLeft size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                        style={toolbarIconBtn(editor.isActive({ textAlign: 'center' }))}
                        title="Align Center"
                    >
                        <AlignCenter size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                        style={toolbarIconBtn(editor.isActive({ textAlign: 'right' }))}
                        title="Align Right"
                    >
                        <AlignRight size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                        style={toolbarIconBtn(editor.isActive({ textAlign: 'justify' }))}
                        title="Justify"
                    >
                        <AlignJustify size={15} />
                    </button>
                </div>

                {/* Group 5: Lists & Quotes */}
                <div style={toolGroupStyle}>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        style={toolbarIconBtn(editor.isActive('bulletList'))}
                        title="Bullet List"
                    >
                        <List size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        style={toolbarIconBtn(editor.isActive('orderedList'))}
                        title="Numbered List"
                    >
                        <ListOrdered size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        style={toolbarIconBtn(editor.isActive('blockquote'))}
                        title="Quote / Callout"
                    >
                        <Quote size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        style={toolbarIconBtn(editor.isActive('codeBlock'))}
                        title="Code Block"
                    >
                        <Code size={15} />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        style={toolbarIconBtn(false)}
                        title="Horizontal Line"
                    >
                        <Minus size={15} />
                    </button>
                </div>

                {/* Group 6: Links */}
                <div style={toolGroupStyle}>
                    <button
                        type="button"
                        onClick={openLinkModal}
                        style={toolbarIconBtn(editor.isActive('link'))}
                        title="Insert / Edit Link"
                    >
                        <LinkIcon size={15} />
                    </button>
                    {editor.isActive('link') && (
                        <button
                            type="button"
                            onClick={() => editor.chain().focus().unsetLink().run()}
                            style={toolbarIconBtn(false)}
                            title="Remove Link"
                        >
                            <Unlink size={15} />
                        </button>
                    )}
                </div>

                {/* Group 7: Interactive Pills (CTA Button, Media/Image, Colors, Variables, Clear) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    {/* CTA Button Generator */}
                    <button
                        type="button"
                        onClick={() => setIsButtonModalOpen(true)}
                        style={toolbarPillBtn('cta')}
                        title="Insert Styled Email Button (CTA)"
                    >
                        <MousePointerClick size={14} />
                        <span>+ CTA Button</span>
                    </button>

                    {/* Image / Media Inserter */}
                    <button
                        type="button"
                        onClick={() => {
                            setImagePreview('');
                            setImageUrl('');
                            setImageAlt('');
                            setImageError('');
                            setIsImageModalOpen(true);
                        }}
                        style={toolbarPillBtn('media')}
                        title="Insert Image, Banner, or Visual Media"
                    >
                        <ImageIcon size={14} />
                        <span>+ Media / Image</span>
                    </button>

                    {/* Color & Highlight Menu */}
                    <div style={{ position: 'relative' }}>
                        <button
                            type="button"
                            onClick={() => setIsColorMenuOpen(prev => !prev)}
                            style={toolbarPillBtn('color', isColorMenuOpen)}
                            title="Text Color & Highlights"
                        >
                            <span style={{
                                width: 13, height: 13, borderRadius: '50%',
                                background: 'linear-gradient(135deg, #6c9e4e, #2563eb, #dc2626)',
                                display: 'inline-block',
                                flexShrink: 0,
                            }} />
                            <span>Colors</span>
                            <ChevronDown size={12} />
                        </button>

                        {isColorMenuOpen && (
                            <div style={{
                                position: 'absolute',
                                top: 'calc(100% + 4px)',
                                left: 0,
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: 10,
                                boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                                padding: 12,
                                zIndex: 100,
                                minWidth: 200,
                            }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }}>
                                    Text Color
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                                    {TEXT_COLORS.map(c => (
                                        <button
                                            key={c.value}
                                            type="button"
                                            onClick={() => {
                                                editor.chain().focus().setColor(c.value).run();
                                                setIsColorMenuOpen(false);
                                            }}
                                            style={{
                                                width: 24,
                                                height: 24,
                                                borderRadius: '50%',
                                                background: c.value,
                                                border: '2px solid #ffffff',
                                                boxShadow: '0 0 0 1px #cbd5e1',
                                                cursor: 'pointer',
                                            }}
                                            title={c.label}
                                        />
                                    ))}
                                </div>

                                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.04em' }}>
                                    Background Highlight
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {HIGHLIGHT_COLORS.map(h => (
                                        <button
                                            key={h.label}
                                            type="button"
                                            onClick={() => {
                                                if (h.value) {
                                                    editor.chain().focus().setHighlight({ color: h.value }).run();
                                                } else {
                                                    editor.chain().focus().unsetHighlight().run();
                                                }
                                                setIsColorMenuOpen(false);
                                            }}
                                            style={{
                                                padding: '4px 8px',
                                                fontSize: 11,
                                                borderRadius: 6,
                                                border: '1px solid #e2e8f0',
                                                background: h.value || '#ffffff',
                                                color: '#0f172a',
                                                cursor: 'pointer',
                                                fontWeight: 500,
                                            }}
                                        >
                                            {h.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Personalization Variables Menu */}
                    <div style={{ position: 'relative' }}>
                        <button
                            type="button"
                            onClick={() => setIsVarMenuOpen(prev => !prev)}
                            style={toolbarPillBtn('variable', isVarMenuOpen)}
                            title="Insert Personalized Variable (e.g. {{name}})"
                        >
                            <Sparkles size={13} />
                            <span>Insert Variable</span>
                            <ChevronDown size={12} />
                        </button>

                        {isVarMenuOpen && (
                            <div style={{
                                position: 'absolute',
                                top: 'calc(100% + 4px)',
                                right: 0,
                                background: '#ffffff',
                                border: '1px solid #e2e8f0',
                                borderRadius: 10,
                                boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                                padding: 6,
                                zIndex: 100,
                                minWidth: 240,
                            }}>
                                <div style={{ padding: '6px 8px 4px', fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                    Dynamic Variables
                                </div>
                                {VARIABLES.map(v => (
                                    <button
                                        key={v.tag}
                                        type="button"
                                        onClick={() => handleInsertVariable(v.tag)}
                                        style={{
                                            width: '100%',
                                            textAlign: 'left',
                                            padding: '8px 10px',
                                            borderRadius: 6,
                                            border: 'none',
                                            background: 'transparent',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 2,
                                            transition: 'background 0.1s',
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                                            {v.label} <code style={{ fontSize: 11, color: '#0284c7', background: '#e0f2fe', padding: '1px 5px', borderRadius: 4 }}>{v.tag}</code>
                                        </span>
                                        <span style={{ fontSize: 11, color: '#64748b' }}>{v.desc}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Clear Formatting */}
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
                        style={toolbarIconBtn(false)}
                        title="Clear Formatting"
                    >
                        <Eraser size={14} />
                    </button>
                </div>
            </div>

            {/* Editor Area */}
            <div
                style={{
                    padding: '18px 22px',
                    minHeight,
                    cursor: 'text',
                    fontSize: 15,
                    lineHeight: 1.65,
                    color: '#1a1a2e',
                }}
                onClick={() => editor.commands.focus()}
            >
                <style dangerouslySetInnerHTML={{ __html: editorStyles }} />
                <EditorContent editor={editor} />
            </div>

            {/* Status Footer */}
            <div style={{
                background: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                padding: '8px 18px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: 12,
                color: '#64748b',
            }}>
                <div style={{ display: 'flex', gap: 14 }}>
                    <span><strong>{wordCount}</strong> words</span>
                    <span><strong>{charCount}</strong> characters</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e' }} />
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#475569' }}>Rich HTML Email Output</span>
                </div>
            </div>

            {/* Link Modal */}
            {isLinkModalOpen && (
                <div style={modalOverlayStyle}>
                    <div style={modalBoxStyle}>
                        <h4 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>Insert Hyperlink</h4>
                        <div style={{ marginBottom: 12 }}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4b5563', marginBottom: 4 }}>
                                Display Text (Optional)
                            </label>
                            <input
                                value={linkText}
                                onChange={e => setLinkText(e.target.value)}
                                placeholder="Click here..."
                                style={inputStyle}
                            />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4b5563', marginBottom: 4 }}>
                                Web Link URL
                            </label>
                            <input
                                value={linkUrl}
                                onChange={e => setLinkUrl(e.target.value)}
                                placeholder="https://example.com"
                                autoFocus
                                style={inputStyle}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button
                                type="button"
                                onClick={() => setIsLinkModalOpen(false)}
                                style={secondaryBtnStyle}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveLink}
                                style={primaryBtnStyle}
                            >
                                Apply Link
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Button / CTA Generator Modal */}
            {isButtonModalOpen && (
                <div style={modalOverlayStyle}>
                    <div style={modalBoxStyle}>
                        <h4 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>Insert Call-To-Action Button</h4>
                        <div style={{ marginBottom: 12 }}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4b5563', marginBottom: 4 }}>
                                Button Text
                            </label>
                            <input
                                value={buttonText}
                                onChange={e => setButtonText(e.target.value)}
                                placeholder="e.g. Access Your Account"
                                style={inputStyle}
                            />
                        </div>
                        <div style={{ marginBottom: 12 }}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4b5563', marginBottom: 4 }}>
                                Target Destination URL
                            </label>
                            <input
                                value={buttonUrl}
                                onChange={e => setButtonUrl(e.target.value)}
                                placeholder="https://app.helferai.com"
                                style={inputStyle}
                            />
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4b5563', marginBottom: 4 }}>
                                Button Accent Color
                            </label>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                {['#6c9e4e', '#1a1a2e', '#2563eb', '#dc2626', '#7c3aed'].map(col => (
                                    <button
                                        key={col}
                                        type="button"
                                        onClick={() => setButtonColor(col)}
                                        style={{
                                            width: 28,
                                            height: 28,
                                            borderRadius: 6,
                                            background: col,
                                            border: buttonColor === col ? '2px solid #000' : '1px solid #e5e7eb',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#fff',
                                        }}
                                    >
                                        {buttonColor === col && <Check size={14} />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Preview */}
                        <div style={{ padding: 12, background: '#f9fafb', borderRadius: 8, textAlign: 'center', marginBottom: 16 }}>
                            <span style={{ fontSize: 11, color: '#9ca3af', display: 'block', marginBottom: 6 }}>Live Preview:</span>
                            <span style={{ display: 'inline-block', background: buttonColor, color: '#ffffff', fontWeight: 700, fontSize: 14, padding: '10px 22px', borderRadius: 8 }}>
                                {buttonText || 'Button Text'}
                            </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button
                                type="button"
                                onClick={() => setIsButtonModalOpen(false)}
                                style={secondaryBtnStyle}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleInsertButton}
                                style={primaryBtnStyle}
                            >
                                Insert Button
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image / Media Inserter Modal */}
            {isImageModalOpen && (
                <div style={modalOverlayStyle}>
                    <div style={{ ...modalBoxStyle, width: 480 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                            <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <ImageIcon size={18} color="#7c3aed" />
                                <span>Insert Image or Media Banner</span>
                            </h4>
                            <button
                                type="button"
                                onClick={() => setIsImageModalOpen(false)}
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8', padding: 4 }}
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Tabs: Upload vs URL */}
                        <div style={{ display: 'flex', gap: 6, marginBottom: 14, background: '#f1f5f9', padding: 4, borderRadius: 8 }}>
                            <button
                                type="button"
                                onClick={() => { setImageTab('upload'); setImageError(''); }}
                                style={{
                                    flex: 1, padding: '7px 12px', borderRadius: 6, border: 'none',
                                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                    background: imageTab === 'upload' ? '#ffffff' : 'transparent',
                                    color: imageTab === 'upload' ? '#0f172a' : '#64748b',
                                    boxShadow: imageTab === 'upload' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                                }}
                            >
                                <Upload size={13} />
                                <span>Upload from Device</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => { setImageTab('url'); setImageError(''); }}
                                style={{
                                    flex: 1, padding: '7px 12px', borderRadius: 6, border: 'none',
                                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                    background: imageTab === 'url' ? '#ffffff' : 'transparent',
                                    color: imageTab === 'url' ? '#0f172a' : '#64748b',
                                    boxShadow: imageTab === 'url' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                                }}
                            >
                                <LinkIcon size={13} />
                                <span>Web Image Link (URL)</span>
                            </button>
                        </div>

                        {/* Upload Tab Body */}
                        {imageTab === 'upload' && (
                            <div style={{ marginBottom: 14 }}>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
                                    onChange={handleImageFileChange}
                                    style={{ display: 'none' }}
                                />
                                {imagePreview ? (
                                    <div style={{ position: 'relative', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: 8, background: '#f8fafc', textAlign: 'center' }}>
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            style={{ maxHeight: 180, maxWidth: '100%', borderRadius: 6, objectFit: 'contain', margin: '0 auto', display: 'block' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setImagePreview('');
                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                            }}
                                            style={{
                                                position: 'absolute', top: 12, right: 12,
                                                background: '#ef4444', color: '#fff', border: 'none',
                                                borderRadius: '50%', width: 24, height: 24,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                            }}
                                            title="Remove Image"
                                        >
                                            <X size={13} />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{
                                            border: '2px dashed #cbd5e1', borderRadius: 10, padding: '24px 16px',
                                            textAlign: 'center', background: '#f8fafc', cursor: 'pointer',
                                            transition: 'border-color 0.15s'
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.borderColor = '#7c3aed')}
                                        onMouseLeave={e => (e.currentTarget.style.borderColor = '#cbd5e1')}
                                    >
                                        <Upload size={28} color="#7c3aed" style={{ margin: '0 auto 8px' }} />
                                        <div style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                                            Click to browse or drop an image here
                                        </div>
                                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                                            Supports PNG, JPG, GIF, WebP (Max 8MB)
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* URL Tab Body */}
                        {imageTab === 'url' && (
                            <div style={{ marginBottom: 14 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4b5563', marginBottom: 4 }}>
                                    Image URL
                                </label>
                                <input
                                    value={imageUrl}
                                    onChange={e => setImageUrl(e.target.value)}
                                    placeholder="https://example.com/banner.jpg"
                                    style={inputStyle}
                                    autoFocus
                                />
                                {imageUrl && (
                                    <div style={{ marginTop: 8, border: '1px solid #e2e8f0', borderRadius: 8, padding: 6, background: '#f8fafc', textAlign: 'center' }}>
                                        <img
                                            src={imageUrl}
                                            alt="Preview"
                                            onError={() => setImageError('Could not load image from this URL')}
                                            style={{ maxHeight: 120, maxWidth: '100%', borderRadius: 4, objectFit: 'contain', margin: '0 auto', display: 'block' }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {imageError && (
                            <div style={{ fontSize: 12, color: '#dc2626', background: '#fef2f2', padding: '6px 10px', borderRadius: 6, marginBottom: 12 }}>
                                {imageError}
                            </div>
                        )}

                        {/* Display Controls: Width & Alignment */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4b5563', marginBottom: 4 }}>
                                    Display Width
                                </label>
                                <select
                                    value={imageWidth}
                                    onChange={e => setImageWidth(e.target.value as any)}
                                    style={{ ...inputStyle, padding: '0 8px' }}
                                >
                                    <option value="100%">Full Width (100% Banner)</option>
                                    <option value="480px">Medium (480px)</option>
                                    <option value="280px">Compact (280px)</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4b5563', marginBottom: 4 }}>
                                    Alignment
                                </label>
                                <select
                                    value={imageAlign}
                                    onChange={e => setImageAlign(e.target.value as any)}
                                    style={{ ...inputStyle, padding: '0 8px' }}
                                >
                                    <option value="center">Center</option>
                                    <option value="left">Left</option>
                                    <option value="right">Right</option>
                                </select>
                            </div>
                        </div>

                        {/* Optional Alt Text */}
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4b5563', marginBottom: 4 }}>
                                Alt / Caption Text (Optional)
                            </label>
                            <input
                                value={imageAlt}
                                onChange={e => setImageAlt(e.target.value)}
                                placeholder="e.g. HelferAI New Product Flyer"
                                style={inputStyle}
                            />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                            <button
                                type="button"
                                onClick={() => setIsImageModalOpen(false)}
                                style={secondaryBtnStyle}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleInsertImage}
                                style={{ ...primaryBtnStyle, background: '#7c3aed' }}
                            >
                                Insert into Email
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const toolGroupStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    padding: '2px',
    flexShrink: 0,
};

const toolbarIconBtn = (active: boolean, disabled?: boolean): React.CSSProperties => ({
    width: 30,
    height: 30,
    borderRadius: 6,
    border: 'none',
    background: active ? '#e2e8f0' : 'transparent',
    color: active ? '#0f172a' : disabled ? '#cbd5e1' : '#475569',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 600,
    transition: 'all 0.15s ease',
    flexShrink: 0,
});

const toolbarPillBtn = (
    variant: 'cta' | 'color' | 'variable' | 'media' | 'default',
    active?: boolean
): React.CSSProperties => {
    const base: React.CSSProperties = {
        height: 30,
        padding: '0 10px',
        borderRadius: 7,
        border: '1px solid transparent',
        fontSize: 12,
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        transition: 'all 0.15s ease',
    };

    if (variant === 'cta') {
        return {
            ...base,
            background: '#eaf4e3',
            color: '#166534',
            borderColor: '#bbf7d0',
            boxShadow: '0 1px 2px rgba(22, 101, 52, 0.05)',
        };
    }
    if (variant === 'media') {
        return {
            ...base,
            background: '#f5f3ff',
            color: '#6d28d9',
            borderColor: '#ddd6fe',
            boxShadow: '0 1px 2px rgba(109, 40, 217, 0.05)',
        };
    }
    if (variant === 'variable') {
        return {
            ...base,
            background: '#f0f9ff',
            color: '#0369a1',
            borderColor: '#bae6fd',
            boxShadow: '0 1px 2px rgba(3, 105, 161, 0.05)',
        };
    }
    if (variant === 'color') {
        return {
            ...base,
            background: active ? '#f1f5f9' : '#ffffff',
            color: '#334155',
            borderColor: '#e2e8f0',
        };
    }
    return {
        ...base,
        background: active ? '#f1f5f9' : 'transparent',
        color: '#475569',
    };
};

const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.4)',
    zIndex: 9999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(3px)',
};

const modalBoxStyle: React.CSSProperties = {
    background: '#ffffff',
    borderRadius: 14,
    width: 400,
    maxWidth: '90vw',
    padding: 24,
    boxShadow: '0 20px 40px rgba(0,0,0,0.18)',
    border: '1px solid #e5e7eb',
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    height: 38,
    borderRadius: 8,
    border: '1.5px solid #e5e7eb',
    padding: '0 12px',
    fontSize: 14,
    outline: 'none',
    color: '#1a1a2e',
};

const primaryBtnStyle: React.CSSProperties = {
    background: '#6c9e4e',
    color: '#ffffff',
    border: 'none',
    borderRadius: 8,
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
};

const secondaryBtnStyle: React.CSSProperties = {
    background: '#f3f4f6',
    color: '#4b5563',
    border: 'none',
    borderRadius: 8,
    padding: '8px 14px',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
};

const editorStyles = `
  .tiptap {
    outline: none;
    min-height: 220px;
  }
  .tiptap p {
    margin: 0 0 12px 0;
  }
  .tiptap h1 {
    font-size: 24px;
    font-weight: 800;
    color: #1a1a2e;
    margin: 18px 0 10px 0;
    letter-spacing: -0.02em;
  }
  .tiptap h2 {
    font-size: 20px;
    font-weight: 700;
    color: #1a1a2e;
    margin: 16px 0 8px 0;
    letter-spacing: -0.01em;
  }
  .tiptap h3 {
    font-size: 16px;
    font-weight: 700;
    color: #1a1a2e;
    margin: 14px 0 6px 0;
  }
  .tiptap ul, .tiptap ol {
    margin: 0 0 14px 0;
    padding-left: 24px;
  }
  .tiptap li {
    margin-bottom: 4px;
  }
  .tiptap blockquote {
    margin: 14px 0;
    padding: 10px 16px;
    background: #f9fafb;
    border-left: 4px solid #6c9e4e;
    color: #4b5563;
    font-style: italic;
    border-radius: 0 8px 8px 0;
  }
  .tiptap pre {
    background: #1e1e2e;
    color: #e2e8f0;
    padding: 12px 16px;
    border-radius: 8px;
    font-family: monospace;
    font-size: 13px;
    overflow-x: auto;
    margin: 14px 0;
  }
  .tiptap code {
    background: #f3f4f6;
    color: #dc2626;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
    font-family: monospace;
  }
  .tiptap hr {
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 20px 0;
  }
  .tiptap a {
    color: #6c9e4e;
    text-decoration: underline;
    font-weight: 500;
  }
  .tiptap img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 14px 0;
    display: inline-block;
  }
`;
