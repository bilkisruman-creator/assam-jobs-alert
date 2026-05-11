'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Eye, X, Plus, GripVertical, Trash2, Upload, ImageIcon, Link } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  slug: string
  color: string | null
}

interface ImportantDate {
  id?: string
  label: string
  date: string
}

interface ImportantLink {
  id?: string
  label: string
  url: string
  linkType: string
}

interface ContentSection {
  id: string
  title: string
  content: string
}

interface PostFormProps {
  postId?: string
  initialData?: {
    title: string
    slug: string
    excerpt: string
    content: string
    featuredImage: string
    categoryId: string
    templateType: string
    status: string
    isFeatured: boolean
    isBreaking: boolean
    isTrending: boolean
    seoTitle: string
    seoDescription: string
    seoKeywords: string
    importantDates: ImportantDate[]
    importantLinks: ImportantLink[]
  }
}

export function PostForm({ postId, initialData }: PostFormProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  const [title, setTitle] = useState(initialData?.title || '')
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '')
  const [content, setContent] = useState(initialData?.content || '')
  const [featuredImage, setFeaturedImage] = useState(initialData?.featuredImage || '')
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload')
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '')
  const [templateType, setTemplateType] = useState(initialData?.templateType || 'job')
  const [status, setStatus] = useState(initialData?.status || 'draft')
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false)
  const [isBreaking, setIsBreaking] = useState(initialData?.isBreaking || false)
  const [isTrending, setIsTrending] = useState(initialData?.isTrending || false)
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || '')
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || '')
  const [seoKeywords, setSeoKeywords] = useState(initialData?.seoKeywords || '')
  const [importantDates, setImportantDates] = useState<ImportantDate[]>(initialData?.importantDates || [])
  const [importantLinks, setImportantLinks] = useState<ImportantLink[]>(initialData?.importantLinks || [])
  const [sections, setSections] = useState<ContentSection[]>([])

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories)
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    if (!initialData && title) {
      const generated = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 80)
      setSlug(generated)
    }
  }, [title, initialData])

  useEffect(() => {
    if (initialData && content) {
      try {
        const parsed = JSON.parse(content)
        if (Array.isArray(parsed)) {
          setSections(parsed)
        }
      } catch {
        setSections([{ id: '1', title: 'Main Content', content: content }])
      }
    }
  }, [])

  const handleImageUpload = async (file: File) => {
    if (!file) return

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!allowed.includes(file.type)) {
      toast.error('Invalid file type. Only JPG, PNG, WEBP, SVG are allowed.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 5MB.')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setFeaturedImage(data.url)
        toast.success('Image uploaded successfully')
      } else {
        toast.error(data.error || 'Failed to upload image')
      }
    } catch {
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const addSection = () => {
    setSections([...sections, { id: Date.now().toString(), title: '', content: '' }])
  }

  const removeSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id))
  }

  const updateSection = (id: string, field: 'title' | 'content', value: string) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  const addImportantDate = () => {
    setImportantDates([...importantDates, { label: '', date: '' }])
  }

  const removeImportantDate = (index: number) => {
    setImportantDates(importantDates.filter((_, i) => i !== index))
  }

  const updateImportantDate = (index: number, field: 'label' | 'date', value: string) => {
    setImportantDates(
      importantDates.map((d, i) => (i === index ? { ...d, [field]: value } : d))
    )
  }

  const addImportantLink = () => {
    setImportantLinks([...importantLinks, { label: '', url: '', linkType: 'general' }])
  }

  const removeImportantLink = (index: number) => {
    setImportantLinks(importantLinks.filter((_, i) => i !== index))
  }

  const updateImportantLink = (index: number, field: 'label' | 'url' | 'linkType', value: string) => {
    setImportantLinks(
      importantLinks.map((l, i) => (i === index ? { ...l, [field]: value } : l))
    )
  }

  const handleSave = async (publishStatus: string) => {
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!slug.trim()) {
      toast.error('Slug is required')
      return
    }
    if (!categoryId) {
      toast.error('Category is required')
      return
    }

    setSaving(true)
    try {
      const contentData = sections.length > 0 ? JSON.stringify(sections) : content

      const payload = {
        title,
        slug,
        excerpt,
        content: contentData,
        featuredImage,
        categoryId,
        templateType,
        status: publishStatus,
        isFeatured,
        isBreaking,
        isTrending,
        seoTitle,
        seoDescription,
        seoKeywords,
        importantDates,
        importantLinks,
      }

      const url = postId ? `/api/admin/posts/${postId}` : '/api/admin/posts'
      const method = postId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        toast.success(postId ? 'Post updated successfully' : 'Post created successfully')
        router.push('/admin/posts')
        router.refresh()
      } else {
        toast.error(data.error || 'Failed to save post')
      }
    } catch {
      toast.error('Failed to save post')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardContent className="p-6 space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold">Title *</Label>
              <Input
                id="title"
                placeholder="Enter post title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg"
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-sm font-semibold">Slug *</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="slug"
                  placeholder="post-url-slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="font-mono text-sm"
                />
              </div>
            </div>

            {/* Category & Template */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Category *</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Template Type</Label>
                <Select value={templateType} onValueChange={setTemplateType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="job">Job</SelectItem>
                    <SelectItem value="result">Result</SelectItem>
                    <SelectItem value="admit-card">Admit Card</SelectItem>
                    <SelectItem value="admission">Admission</SelectItem>
                    <SelectItem value="scholarship">Scholarship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt" className="text-sm font-semibold">Excerpt</Label>
              <Textarea
                id="excerpt"
                placeholder="Brief description of the post..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
              />
            </div>

            {/* Featured Image */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Featured Image</Label>
                <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setImageInputMode('upload')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      imageInputMode === 'upload' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Upload className="h-3 w-3" />
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputMode('url')}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      imageInputMode === 'url' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Link className="h-3 w-3" />
                    URL
                  </button>
                </div>
              </div>

              {imageInputMode === 'upload' ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragOver(false)
                    const file = e.dataTransfer.files[0]
                    if (file) handleImageUpload(file)
                  }}
                  className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ${
                    dragOver
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/20 scale-[1.01]'
                      : 'border-border/60 bg-muted/20 hover:border-border hover:bg-muted/30'
                  }`}
                >
                  {featuredImage ? (
                    <div className="relative group">
                      <div className="w-full h-48 rounded-xl overflow-hidden">
                        <img src={featuredImage} alt="Featured image preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/svg+xml"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleImageUpload(file)
                            }}
                          />
                          <span className="bg-white text-black px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-100 transition-colors">
                            Replace Image
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setFeaturedImage('')}
                          className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-600 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center py-8 px-4 cursor-pointer">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/svg+xml"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(file)
                        }}
                      />
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${
                        dragOver ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted'
                      }`}>
                        <ImageIcon className={`h-6 w-6 ${dragOver ? 'text-green-600' : 'text-muted-foreground'}`} />
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">
                        {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        JPG, PNG, WEBP, SVG (max 5MB)
                      </p>
                    </label>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-xl">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-medium">Uploading...</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                  />
                  {featuredImage && (
                    <div className="relative w-full max-w-sm h-40 rounded-lg overflow-hidden border bg-muted">
                      <img src={featuredImage} alt="Featured image preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content Sections */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Content Sections</CardTitle>
              <Button variant="outline" size="sm" onClick={addSection}>
                <Plus className="w-4 h-4 mr-1" />
                Add Section
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {sections.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No content sections yet.</p>
                <p className="text-sm">Click &quot;Add Section&quot; to create content blocks.</p>
              </div>
            ) : (
              sections.map((section, index) => (
                <div key={section.id} className="border rounded-lg p-4 space-y-3 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                      <Badge variant="outline" className="text-xs">Section {index + 1}</Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeSection(section.id)}>
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Section title..."
                    value={section.title}
                    onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                  />
                  <Textarea
                    placeholder="Section content... (supports HTML)"
                    value={section.content}
                    onChange={(e) => updateSection(section.id, 'content', e.target.value)}
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Important Dates */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Important Dates</CardTitle>
              <Button variant="outline" size="sm" onClick={addImportantDate}>
                <Plus className="w-4 h-4 mr-1" />
                Add Date
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {importantDates.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No important dates added</p>
            ) : (
              importantDates.map((date, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Input
                    placeholder="Label (e.g., Start Date)"
                    value={date.label}
                    onChange={(e) => updateImportantDate(index, 'label', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="date"
                    value={date.date}
                    onChange={(e) => updateImportantDate(index, 'date', e.target.value)}
                    className="w-44"
                  />
                  <Button variant="ghost" size="icon" className="shrink-0" onClick={() => removeImportantDate(index)}>
                    <X className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Important Links */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Important Links</CardTitle>
              <Button variant="outline" size="sm" onClick={addImportantLink}>
                <Plus className="w-4 h-4 mr-1" />
                Add Link
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {importantLinks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No important links added</p>
            ) : (
              importantLinks.map((link, index) => (
                <div key={index} className="flex items-center gap-3 flex-wrap">
                  <Input
                    placeholder="Label (e.g., Apply Online)"
                    value={link.label}
                    onChange={(e) => updateImportantLink(index, 'label', e.target.value)}
                    className="flex-1 min-w-[140px]"
                  />
                  <Input
                    placeholder="https://..."
                    value={link.url}
                    onChange={(e) => updateImportantLink(index, 'url', e.target.value)}
                    className="flex-1 min-w-[180px]"
                  />
                  <Select value={link.linkType} onValueChange={(v) => updateImportantLink(index, 'linkType', v)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="apply">Apply</SelectItem>
                      <SelectItem value="download">Download</SelectItem>
                      <SelectItem value="result">Result</SelectItem>
                      <SelectItem value="notification">Notification</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" className="shrink-0" onClick={() => removeImportantLink(index)}>
                    <X className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Publish Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Publish</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <Label htmlFor="featured" className="text-sm">Featured</Label>
              <Switch id="featured" checked={isFeatured} onCheckedChange={setIsFeatured} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="breaking" className="text-sm">Mark as New</Label>
              <Switch id="breaking" checked={isBreaking} onCheckedChange={setIsBreaking} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="trending" className="text-sm">Trending</Label>
              <Switch id="trending" checked={isTrending} onCheckedChange={setIsTrending} />
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <Button
                onClick={() => handleSave('published')}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700 w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Publish'}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Save as Draft
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* SEO */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">SEO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">SEO Title</Label>
              <Input
                placeholder="SEO title..."
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">{seoTitle.length}/60 characters</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Meta Description</Label>
              <Textarea
                placeholder="Meta description..."
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">{seoDescription.length}/160 characters</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Keywords</Label>
              <Input
                placeholder="keyword1, keyword2, ..."
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardContent className="p-4">
            <Button variant="outline" className="w-full" onClick={() => {
              toast.info('Preview will open in a new tab when the post is saved')
            }}>
              <Eye className="w-4 h-4 mr-2" />
              Preview Post
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
