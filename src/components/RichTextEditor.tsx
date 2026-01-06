"use client";

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Image from '@tiptap/extension-image'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Typography from '@tiptap/extension-typography'
import CharacterCount from '@tiptap/extension-character-count'
import Focus from '@tiptap/extension-focus'
import { common, createLowlight } from 'lowlight'
import { useCallback, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { useCollaboration } from '@/hooks/useCollaboration'
import { CollaborationStatus } from '@/components/CollaborationStatus'
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Link2,
    Image as ImageIcon,
    Table as TableIcon,
    Highlighter as HighlightIcon,
    Sparkles
} from 'lucide-react'

interface RichTextEditorProps {
    content: string
    onChange: (content: string) => void
    onAIAssist?: (selection: string) => void
    placeholder?: string
    className?: string
    collaborationId?: string
    userName?: string
    userColor?: string
}

const MenuButton = ({
    onClick,
    isActive,
    disabled,
    children,
    title
}: {
    onClick: () => void
    isActive?: boolean
    disabled?: boolean
    children: React.ReactNode
    title: string
}) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`
      p-2 rounded-md border transition-all duration-200 hover:bg-gray-100
      ${isActive ? 'bg-blue-100 border-blue-300 text-blue-700' : 'border-gray-200'}
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-300'}
    `}
    >
        {children}
    </button>
)

import { Editor } from '@tiptap/react'

export const RichTextEditor = forwardRef<
    { getHTML: () => string; setContent: (content: string) => void; focus: () => void; editor: Editor | null },
    RichTextEditorProps
>(({
    content,
    onChange,
    onAIAssist,
    placeholder = "Start writing...",
    className = "",
    collaborationId,
    userName = "Anonymous",
    userColor
}, ref) => {
    const [wordCount, setWordCount] = useState(0)
    const [readingTime, setReadingTime] = useState(0)

    // Collaboration setup
    const collaboration = useCollaboration(
        collaborationId
            ? { documentId: collaborationId, userName, userColor: userColor || '#4f46e5' }
            : null
    )

    const editor = useEditor({
        immediatelyRender: false, // Fix SSR hydration issues
        extensions: [
            StarterKit.configure({
                codeBlock: false, // We'll use CodeBlockLowlight instead
            }),
            Placeholder.configure({
                placeholder,
            }),
            TextStyle,
            Color.configure({
                types: ['textStyle'],
            }),
            Highlight.configure({
                multicolor: true,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-600 underline',
                },
            }),
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'border-collapse border border-gray-300',
                },
            }),
            TableRow,
            TableHeader.configure({
                HTMLAttributes: {
                    class: 'border border-gray-300 bg-gray-100 p-2 font-semibold',
                },
            }),
            TableCell.configure({
                HTMLAttributes: {
                    class: 'border border-gray-300 p-2',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'max-w-full h-auto rounded-lg',
                },
            }),
            CodeBlockLowlight.configure({
                lowlight: createLowlight(common),
                HTMLAttributes: {
                    class: 'bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto',
                },
            }),
            Typography,
            CharacterCount,
            Focus.configure({
                className: 'has-focus',
                mode: 'all',
            }),
            // Add collaboration extensions if collaboration is enabled
            ...(collaboration.collaborationExtension ? [collaboration.collaborationExtension] : []),
            ...(collaboration.collaborationCursorExtension ? [collaboration.collaborationCursorExtension] : []),
        ].filter(Boolean),
        content: collaborationId ? undefined : content, // Don't set initial content if using collaboration
        onUpdate: ({ editor }) => {
            if (!collaborationId) {
                // Only call onChange if not using collaboration (collaboration handles sync automatically)
                const html = editor.getHTML()
                onChange(html)
            }

            // Update word count and reading time
            const words = editor.state.doc.textContent.trim().split(/\s+/).filter(word => word.length > 0)
            setWordCount(words.length)
            setReadingTime(Math.ceil(words.length / 200)) // Average reading speed: 200 words per minute
        },
        editorProps: {
            attributes: {
                class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] p-4',
            },
        },
    }, [collaboration.collaborationExtension, collaboration.collaborationCursorExtension])

    // Expose editor methods through ref
    useImperativeHandle(ref, () => ({
        getHTML: () => editor?.getHTML() || '',
        setContent: (content: string) => editor?.commands.setContent(content),
        focus: () => editor?.commands.focus(),
        editor
    }), [editor])

    // Update editor content when prop changes (only for non-collaborative mode)
    useEffect(() => {
        if (editor && !collaborationId && content !== editor.getHTML()) {
            editor.commands.setContent(content)
        }
    }, [content, editor, collaborationId])

    const addImage = useCallback(() => {
        const url = window.prompt('Enter image URL:')
        if (url) {
            editor?.chain().focus().setImage({ src: url }).run()
        }
    }, [editor])

    const addLink = useCallback(() => {
        const previousUrl = editor?.getAttributes('link').href
        const url = window.prompt('Enter URL:', previousUrl)

        if (url === null) return

        if (url === '') {
            editor?.chain().focus().extendMarkRange('link').unsetLink().run()
            return
        }

        editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    }, [editor])

    const addTable = useCallback(() => {
        editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
    }, [editor])

    const handleAIAssist = useCallback(() => {
        if (!editor) return

        const { from, to } = editor.state.selection
        const selectedText = editor.state.doc.textBetween(from, to)

        if (onAIAssist) {
            onAIAssist(selectedText)
        }
    }, [editor, onAIAssist])

    if (!editor) return null

    return (
        <div className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}>
            {/* Toolbar */}
            <div className="border-b border-gray-300 p-3 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex flex-wrap gap-2">
                        {/* Text Formatting */}
                        <div className="flex gap-1 border-r border-gray-300 pr-2">
                            <MenuButton
                                onClick={() => editor.chain().focus().toggleBold().run()}
                                isActive={editor.isActive('bold')}
                                title="Bold"
                            >
                                <Bold size={16} />
                            </MenuButton>
                            <MenuButton
                                onClick={() => editor.chain().focus().toggleItalic().run()}
                                isActive={editor.isActive('italic')}
                                title="Italic"
                            >
                                <Italic size={16} />
                            </MenuButton>
                            <MenuButton
                                onClick={() => editor.chain().focus().toggleStrike().run()}
                                isActive={editor.isActive('strike')}
                                title="Strikethrough"
                            >
                                <Strikethrough size={16} />
                            </MenuButton>
                            <MenuButton
                                onClick={() => editor.chain().focus().toggleCode().run()}
                                isActive={editor.isActive('code')}
                                title="Inline Code"
                            >
                                <Code size={16} />
                            </MenuButton>
                        </div>

                        {/* Headings */}
                        <div className="flex gap-1 border-r border-gray-300 pr-2">
                            <MenuButton
                                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                                isActive={editor.isActive('heading', { level: 1 })}
                                title="Heading 1"
                            >
                                <Heading1 size={16} />
                            </MenuButton>
                            <MenuButton
                                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                                isActive={editor.isActive('heading', { level: 2 })}
                                title="Heading 2"
                            >
                                <Heading2 size={16} />
                            </MenuButton>
                            <MenuButton
                                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                                isActive={editor.isActive('heading', { level: 3 })}
                                title="Heading 3"
                            >
                                <Heading3 size={16} />
                            </MenuButton>
                        </div>

                        {/* Lists */}
                        <div className="flex gap-1 border-r border-gray-300 pr-2">
                            <MenuButton
                                onClick={() => editor.chain().focus().toggleBulletList().run()}
                                isActive={editor.isActive('bulletList')}
                                title="Bullet List"
                            >
                                <List size={16} />
                            </MenuButton>
                            <MenuButton
                                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                                isActive={editor.isActive('orderedList')}
                                title="Numbered List"
                            >
                                <ListOrdered size={16} />
                            </MenuButton>
                            <MenuButton
                                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                                isActive={editor.isActive('blockquote')}
                                title="Quote"
                            >
                                <Quote size={16} />
                            </MenuButton>
                        </div>

                        {/* Text Color & Highlight */}
                        <div className="flex gap-1 border-r border-gray-300 pr-2">
                            <input
                                type="color"
                                onChange={e => editor.chain().focus().setColor(e.target.value).run()}
                                value={editor.getAttributes('textStyle').color || '#000000'}
                                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                                title="Text Color"
                            />
                            <MenuButton
                                onClick={() => editor.chain().focus().toggleHighlight().run()}
                                isActive={editor.isActive('highlight')}
                                title="Highlight"
                            >
                                <HighlightIcon size={16} />
                            </MenuButton>
                        </div>

                        {/* Insert Elements */}
                        <div className="flex gap-1 border-r border-gray-300 pr-2">
                            <MenuButton
                                onClick={addLink}
                                isActive={editor.isActive('link')}
                                title="Add Link"
                            >
                                <Link2 size={16} />
                            </MenuButton>
                            <MenuButton
                                onClick={addImage}
                                title="Add Image"
                            >
                                <ImageIcon size={16} />
                            </MenuButton>
                            <MenuButton
                                onClick={addTable}
                                title="Add Table"
                            >
                                <TableIcon size={16} />
                            </MenuButton>
                        </div>

                        {/* AI Assistant */}
                        {onAIAssist && (
                            <div className="flex gap-1 border-r border-gray-300 pr-2">
                                <MenuButton
                                    onClick={handleAIAssist}
                                    title="AI Assist"
                                    isActive={false}
                                >
                                    <Sparkles size={16} />
                                </MenuButton>
                            </div>
                        )}

                        {/* Undo/Redo */}
                        <div className="flex gap-1">
                            <MenuButton
                                onClick={() => editor.chain().focus().undo().run()}
                                disabled={!editor.can().undo()}
                                title="Undo"
                            >
                                <Undo size={16} />
                            </MenuButton>
                            <MenuButton
                                onClick={() => editor.chain().focus().redo().run()}
                                disabled={!editor.can().redo()}
                                title="Redo"
                            >
                                <Redo size={16} />
                            </MenuButton>
                        </div>
                    </div>
                </div>

                {/* Collaboration Status */}
                {collaborationId && (
                    <CollaborationStatus
                        isConnected={collaboration.isConnected}
                        connectedUsers={collaboration.connectedUsers}
                    />
                )}
            </div>
            <div className="bg-white">
                <EditorContent editor={editor} />
            </div>

            {/* Status Bar */}
            <div className="border-t border-gray-300 px-4 py-2 bg-gray-50 text-sm text-gray-600 flex justify-between items-center">
                <div className="flex gap-4">
                    <span>{wordCount} words</span>
                    <span>{readingTime} min read</span>
                    <span>{editor.storage.characterCount.characters()} characters</span>
                </div>
                <div className="text-xs text-gray-500">
                    {collaborationId ? 'Real-time collaborative editing enabled' : 'Select text and click the ✨ button for AI assistance'}
                </div>
            </div>
        </div>
    )
})

RichTextEditor.displayName = 'RichTextEditor'

export default RichTextEditor