"use client"

import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { AIWriter } from '@/components/AIWriter'

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

export default function EditorPage() {
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [currentPost, setCurrentPost] = useState<Post | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    
    const [createPost] = useMutation<CreatePostResponse>(CREATE_POST)
    const [updatePost] = useMutation<UpdatePostResponse>(UPDATE_POST)

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

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold">Post Editor</h1>
            
            {/* Title Input */}
            <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded"
                    placeholder="Enter post title..."
                />
            </div>

            {/* Content Editor */}
            <div>
                <label className="block text-sm font-medium mb-2">Content</label>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded min-h-[300px]"
                    placeholder="Start writing your post..."
                />
            </div>

            {/* AI Writer Component */}
            <div>
                <h3 className="text-lg font-medium mb-2">AI Assistant</h3>
                <AIWriter onComplete={(text) => setContent(content + '\n\n' + text)} />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
                <button
                    onClick={handleSave}
                    disabled={isSaving || !title.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {isSaving ? 'Saving...' : 'Save Draft'}
                </button>
                
                <button
                    onClick={handlePreview}
                    disabled={!currentPost}
                    className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                    Preview
                </button>
            </div>

            {/* Status Display */}
            {currentPost && (
                <div className="p-4 bg-gray-100 rounded">
                    <p><strong>Status:</strong> {currentPost.status}</p>
                    <p><strong>Slug:</strong> {currentPost.slug}</p>
                    <p><strong>Preview URL:</strong> <code>/preview/{currentPost.slug}?draft=true</code></p>
                </div>
            )}
        </div>
    )
}