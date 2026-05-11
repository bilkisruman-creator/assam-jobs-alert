'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { PostForm } from '@/components/admin/post-form'
import { Card, CardContent } from '@/components/ui/card'

export default function EditPostPage() {
  const params = useParams()
  const postId = params.id as string
  const [postData, setPostData] = useState<ReturnType<typeof PostForm> extends React.FC<{ initialData: infer T }> ? T : never>(null as any)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (postId) {
      fetch(`/api/admin/posts/${postId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.post) {
            const p = data.post
            setPostData({
              title: p.title,
              slug: p.slug,
              excerpt: p.excerpt || '',
              content: p.content || '',
              featuredImage: p.featuredImage || '',
              categoryId: p.categoryId,
              templateType: p.templateType,
              status: p.status,
              isFeatured: p.isFeatured,
              isBreaking: p.isBreaking,
              isTrending: p.isTrending,
              seoTitle: p.seoTitle || '',
              seoDescription: p.seoDescription || '',
              seoKeywords: p.seoKeywords || '',
              importantDates: p.importantDates || [],
              importantLinks: p.importantLinks || [],
            })
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [postId])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 bg-muted rounded w-48 animate-pulse" />
          <div className="h-4 bg-muted rounded w-72 animate-pulse mt-2" />
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded animate-pulse" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edit Post</h1>
        <p className="text-muted-foreground">Update post details and content</p>
      </div>
      <PostForm postId={postId} initialData={postData} />
    </div>
  )
}
