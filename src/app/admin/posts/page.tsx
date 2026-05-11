'use client'

import { PostsTable } from '@/components/admin/posts-table'

export default function AdminPostsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Posts</h1>
        <p className="text-muted-foreground">Manage your job posts, results, and notifications</p>
      </div>
      <PostsTable />
    </div>
  )
}
