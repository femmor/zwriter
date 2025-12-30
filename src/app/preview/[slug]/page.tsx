"use client"

import { useQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface DraftPost {
  id: string
  title: string
  content: string
  status: string
  seo: {
    title: string
    description: string
  }
  createdAt: string
  updatedAt: string
}

interface GetDraftPostData {
  draftPostBySlug: DraftPost | null
}

const GET_DRAFT_POST = gql`
  query GetDraftPost($slug: String!) {
    draftPostBySlug(slug: $slug) {
      id
      title
      content
      status
      seo {
        title
        description
      }
      createdAt
      updatedAt
    }
  }
`

export default function PreviewPage({ params }: { params: { slug: string } }) {
  const searchParams = useSearchParams()
  const isDraft = searchParams.get('draft') === 'true'
  const { data: session, status } = useSession()
  
  const { data, loading, error } = useQuery<GetDraftPostData>(GET_DRAFT_POST, {
    variables: { slug: params.slug },
    skip: !isDraft || status === 'loading'
  })

  // Show loading state
  if (loading || status === 'loading') return <div>Loading preview...</div>

  // Check authentication for draft previews
  if (isDraft && !session) {
    return <div>Please log in to view draft previews</div>
  }

  // Check if user has permission
  if (isDraft && session?.user?.role === 'VIEWER') {
    return <div>You don&apos;t have permission to view drafts</div>
  }

  if (error) return <div>Error loading preview: {error.message}</div>

  const post = data?.draftPostBySlug

  if (!post) return <div>Draft not found</div>

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Preview Banner */}
      <div className="bg-orange-100 border border-orange-300 text-orange-800 px-4 py-2 rounded mb-6">
        🔍 Preview Mode - This is a draft and not publicly visible
      </div>

      {/* Post Content */}
      <article>
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="text-gray-600 text-sm">
            Status: {post.status} • Created: {new Date(post.createdAt).toLocaleDateString()}
          </div>
        </header>
        
        <div className="prose max-w-none">
          {post.content.split('\n').map((paragraph: string, index: number) => (
            <p key={index} className="mb-4">{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  )
}