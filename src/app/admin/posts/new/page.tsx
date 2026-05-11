'use client'

import { PostForm } from '@/components/admin/post-form'

export default function NewPostPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create New Post</h1>
        <p className="text-muted-foreground">Add a new job post, result, or notification</p>
      </div>
      <PostForm />
    </div>
  )
}
