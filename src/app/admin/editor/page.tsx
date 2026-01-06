"use client"

import { useState, useRef } from 'react'
import { useMutation } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { RichTextEditor } from '@/components/RichTextEditor'
import { AIWritingAssistant } from '@/components/AIWritingAssistant'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Save, Eye, FileText, Clock, Users, Wand2 } from 'lucide-react'
import { Editor } from '@tiptap/react'

interface Post {
    id: string
    title: string
    slug: string
    content: string
    status: string
}

interface CreatePostResponse {
    createPost: Post
}

interface UpdatePostResponse {
    updatePost: Post
}

const CREATE_POST = gql`
  mutation CreatePost($title: String!) {
    createPost(title: $title) {
      id
      title
      slug
      status
    }
  }
`

const UPDATE_POST = gql`
  mutation UpdatePost($id: ID!, $title: String, $content: String) {
    updatePost(id: $id, title: $title, content: $content) {
      id
      title
      slug
      content
      status
    }
  }
`

const GENERATE_POST_WITH_AI = gql`
  mutation GeneratePostWithAI($topic: String!) {
    generatePostWithAI(topic: $topic) {
      id
      title
      slug
      content
      status
    }
  }
`

interface GeneratePostWithAIResponse {
    generatePostWithAI: Post
}

export default function EditorPage() {
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [currentPost, setCurrentPost] = useState<Post | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [selectedText, setSelectedText] = useState('')
    const [collaborationEnabled, setCollaborationEnabled] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const editorRef = useRef<{ getHTML: () => string; setContent: (content: string) => void; focus: () => void; editor: Editor | null } | null>(null)
    
    const [createPost] = useMutation<CreatePostResponse>(CREATE_POST)
    const [updatePost] = useMutation<UpdatePostResponse>(UPDATE_POST)
    const [generatePostWithAI] = useMutation<GeneratePostWithAIResponse>(GENERATE_POST_WITH_AI)

    const handleSave = async () => {
        setIsSaving(true)
        try {
            if (currentPost) {
                // Update existing post
                await updatePost({
                    variables: {
                        id: currentPost.id,
                        title,
                        content
                    }
                })
            } else {
                // Create new post
                const result = await createPost({
                    variables: { title }
                })
                
                if (result.data) {
                    setCurrentPost(result.data.createPost)
                    
                    // Update with content
                    if (content) {
                        await updatePost({
                            variables: {
                                id: result.data.createPost.id,
                                content
                            }
                        })
                    }
                }
            }
        } catch (error) {
            console.error('Error saving post:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const handlePreview = () => {
        if (currentPost?.slug) {
            // Open preview in new tab
            window.open(`/preview/${currentPost.slug}?draft=true`, '_blank')
        } else {
            alert('Please save your post first to preview it')
        }
    }

    const handleContentChange = (newContent: string) => {
        setContent(newContent)
    }

    const handleAIInsert = (text: string) => {
        // Insert AI-generated text at the current cursor position
        setContent(content + '\n\n' + text)
    }

    const handleAIReplace = (text: string) => {
        // Replace selected text with AI-generated text
        if (selectedText) {
            setContent(content.replace(selectedText, text))
            setSelectedText('')
        }
    }

    const handleAIAssist = (selection: string) => {
        setSelectedText(selection)
    }

    const handleGenerateWithAI = async () => {
        if (!title.trim()) {
            alert('Please enter a title/topic for AI generation')
            return
        }

        setIsGenerating(true)
        try {
            const result = await generatePostWithAI({
                variables: { topic: title }
            })
            
            if (result.data) {
                const generatedPost = result.data.generatePostWithAI
                setCurrentPost(generatedPost)
                setContent(generatedPost.content)
                setTitle(generatedPost.title)
                // Also update the editor content directly
                if (editorRef.current) {
                    editorRef.current.setContent(generatedPost.content)
                }
            }
        } catch (error) {
            console.error('Error generating post with AI:', error)
            alert('Failed to generate post with AI. Please try again.')
        } finally {
            setIsGenerating(false)
        }
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Content Editor</h1>
                    <p className="text-gray-600 mt-1">Create and edit your blog posts with AI assistance</p>
                </div>
                {currentPost && (
                    <Badge variant="outline" className={currentPost.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                        {currentPost.status}
                    </Badge>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Editor Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Title Input */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText size={20} />
                                Post Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Title</label>
                                    <Input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Enter your post title..."
                                        className="text-lg"
                                    />
                                </div>
                                {currentPost && (
                                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                        <div>
                                            <strong>Slug:</strong> {currentPost.slug}
                                        </div>
                                        <div>
                                            <strong>Status:</strong> <span className={`px-2 py-1 rounded ${currentPost.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{currentPost.status}</span>
                                        </div>
                                        <div className="col-span-2 flex items-center justify-between">
                                            <span><strong>Collaboration:</strong></span>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={collaborationEnabled}
                                                    onCheckedChange={setCollaborationEnabled}
                                                />
                                                <Users size={16} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Rich Text Editor */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Content</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <RichTextEditor
                                ref={editorRef}
                                content={content}
                                onChange={handleContentChange}
                                onAIAssist={handleAIAssist}
                                placeholder="Start writing your amazing content..."
                                className="border-0 rounded-none"
                                collaborationId={collaborationEnabled && currentPost?.id ? `post-${currentPost.id}` : undefined}
                                userName="Current User" // Replace with actual user name from session
                            />
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <Button
                            onClick={handleSave}
                            disabled={isSaving || !title.trim()}
                            size="lg"
                            className="flex items-center gap-2"
                        >
                            <Save size={18} />
                            {isSaving ? 'Saving...' : 'Save Draft'}
                        </Button>
                        
                        <Button
                            onClick={handleGenerateWithAI}
                            disabled={isGenerating || !title.trim()}
                            variant="secondary"
                            size="lg"
                            className="flex items-center gap-2"
                        >
                            <Wand2 size={18} />
                            {isGenerating ? 'Generating...' : 'Generate with AI'}
                        </Button>
                        
                        <Button
                            onClick={handlePreview}
                            disabled={!currentPost}
                            variant="outline"
                            size="lg"
                            className="flex items-center gap-2"
                        >
                            <Eye size={18} />
                            Preview
                        </Button>
                    </div>
                </div>

                {/* AI Assistant Sidebar */}
                <div className="space-y-6">
                    <AIWritingAssistant
                        selectedText={selectedText}
                        onInsert={handleAIInsert}
                        onReplace={handleAIReplace}
                    />

                    {/* Writing Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock size={18} />
                                Writing Stats
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span>Words:</span>
                                    <span className="font-medium">
                                        {content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(word => word.length > 0).length}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Characters:</span>
                                    <span className="font-medium">
                                        {content.replace(/<[^>]*>/g, '').length}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Reading time:</span>
                                    <span className="font-medium">
                                        {Math.ceil(content.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(word => word.length > 0).length / 200)} min
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Post Status */}
                    {currentPost && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Post Status</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <strong>Status:</strong> {currentPost.status}
                                    </div>
                                    <div>
                                        <strong>Slug:</strong> 
                                        <code className="text-xs bg-gray-100 px-1 rounded ml-1">
                                            {currentPost.slug}
                                        </code>
                                    </div>
                                    <div className="pt-2">
                                        <strong>Preview URL:</strong>
                                        <div className="text-xs text-blue-600 break-all">
                                            /preview/{currentPost.slug}?draft=true
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}