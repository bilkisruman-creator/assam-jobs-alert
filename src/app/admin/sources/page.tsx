'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, RefreshCw, Play, Globe, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  slug: string
}

interface FetchLog {
  id: string
  status: string
  itemsFound: number
  itemsCreated: number
  error: string | null
  createdAt: string
}

interface Source {
  id: string
  name: string
  url: string
  sourceType: string
  categoryId: string
  isActive: boolean
  fetchInterval: number
  selectors: string | null
  mappingRules: string | null
  autoPublish: boolean
  lastFetchedAt: string | null
  lastStatus: string | null
  category: Category
  fetchLogs: FetchLog[]
}

const emptyForm = {
  name: '',
  url: '',
  sourceType: 'rss',
  categoryId: '',
  isActive: true,
  fetchInterval: 60,
  selectors: '',
  mappingRules: '',
  autoPublish: false,
}

export default function AdminSourcesPage() {
  const [sources, setSources] = useState<Source[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [fetching, setFetching] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [logsSource, setLogsSource] = useState<Source | null>(null)

  const fetchSources = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/sources')
      if (res.ok) {
        const data = await res.json()
        setSources(data.sources)
      }
    } catch (error) {
      console.error('Fetch sources error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSources()
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories)
      })
      .catch(console.error)
  }, [fetchSources])

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (source: Source) => {
    setEditingId(source.id)
    setForm({
      name: source.name,
      url: source.url,
      sourceType: source.sourceType,
      categoryId: source.categoryId,
      isActive: source.isActive,
      fetchInterval: source.fetchInterval,
      selectors: source.selectors || '',
      mappingRules: source.mappingRules || '',
      autoPublish: source.autoPublish,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.url.trim()) {
      toast.error('Name and URL are required')
      return
    }

    setSaving(true)
    try {
      const url = editingId ? `/api/admin/sources/${editingId}` : '/api/admin/sources'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        toast.success(editingId ? 'Source updated' : 'Source created')
        setDialogOpen(false)
        fetchSources()
      } else {
        toast.error(data.error || 'Failed to save source')
      }
    } catch {
      toast.error('Failed to save source')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch(`/api/admin/sources/${deleteId}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Source deleted')
        fetchSources()
      } else {
        toast.error('Failed to delete')
      }
    } catch {
      toast.error('Failed to delete source')
    } finally {
      setDeleteId(null)
    }
  }

  const handleFetch = async (sourceId: string) => {
    setFetching(sourceId)
    try {
      const res = await fetch(`/api/admin/sources/${sourceId}/fetch`, { method: 'POST' })
      if (res.ok) {
        toast.success('Fetch triggered successfully')
        fetchSources()
      } else {
        toast.error('Failed to trigger fetch')
      }
    } catch {
      toast.error('Failed to trigger fetch')
    } finally {
      setFetching(null)
    }
  }

  const getSourceTypeBadge = (type: string) => {
    switch (type) {
      case 'rss':
        return <Badge className="bg-blue-100 text-blue-700 border-0">RSS</Badge>
      case 'api':
        return <Badge className="bg-purple-100 text-purple-700 border-0">API</Badge>
      case 'scrape':
        return <Badge className="bg-orange-100 text-orange-700 border-0">Scrape</Badge>
      default:
        return <Badge variant="secondary">{type}</Badge>
    }
  }

  const getHealthIndicator = (source: Source) => {
    if (!source.lastFetchedAt) {
      return <WifiOff className="w-4 h-4 text-gray-400" />
    }
    if (source.lastStatus === 'success') {
      return <Wifi className="w-4 h-4 text-green-500" />
    }
    return <WifiOff className="w-4 h-4 text-red-500" />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Sources</h1>
          <p className="text-muted-foreground">Manage content sources and auto-fetching</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={fetchSources}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={openCreate} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Source
          </Button>
        </div>
      </div>

      {/* Sources Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Health</TableHead>
                <TableHead className="text-center">Interval</TableHead>
                <TableHead className="text-center">Auto</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 bg-muted rounded animate-pulse" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : sources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    No sources found
                  </TableCell>
                </TableRow>
              ) : (
                sources.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-sm">{source.name}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">{source.url}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getSourceTypeBadge(source.sourceType)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{source.category.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getHealthIndicator(source)}
                        {source.lastFetchedAt && (
                          <span className="text-xs text-muted-foreground">
                            {new Date(source.lastFetchedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-sm">{source.fetchInterval}m</TableCell>
                    <TableCell className="text-center">
                      {source.autoPublish ? (
                        <Badge className="bg-green-100 text-green-700 border-0">Yes</Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={source.isActive ? 'bg-green-100 text-green-700 border-0' : 'bg-gray-100 text-gray-500 border-0'}>
                        {source.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleFetch(source.id)}
                          disabled={fetching === source.id}
                        >
                          <Play className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(source)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500"
                          onClick={() => setDeleteId(source.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Fetch Logs Dialog */}
      <Dialog open={!!logsSource} onOpenChange={() => setLogsSource(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Fetch Logs - {logsSource?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {logsSource?.fetchLogs && logsSource.fetchLogs.length > 0 ? (
              logsSource.fetchLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Badge
                      className={
                        log.status === 'success'
                          ? 'bg-green-100 text-green-700 border-0'
                          : 'bg-red-100 text-red-700 border-0'
                      }
                    >
                      {log.status}
                    </Badge>
                    <div className="flex flex-col">
                      <span className="text-sm">
                        {log.itemsFound} found / {log.itemsCreated} created
                      </span>
                      {log.error && <span className="text-xs text-red-500">{log.error}</span>}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">No fetch logs available</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Source' : 'Add Source'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                placeholder="Source name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>URL *</Label>
              <Input
                placeholder="https://example.com/feed"
                value={form.url}
                onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.sourceType} onValueChange={(v) => setForm((p) => ({ ...p, sourceType: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rss">RSS Feed</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="scrape">Web Scrape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={form.categoryId} onValueChange={(v) => setForm((p) => ({ ...p, categoryId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Fetch Interval (minutes)</Label>
              <Input
                type="number"
                value={form.fetchInterval}
                onChange={(e) => setForm((p) => ({ ...p, fetchInterval: parseInt(e.target.value) || 60 }))}
              />
            </div>
            {form.sourceType === 'scrape' && (
              <div className="space-y-2">
                <Label>CSS Selectors (JSON)</Label>
                <Textarea
                  placeholder='{"title": "h1.post-title", "content": ".post-body"}'
                  value={form.selectors}
                  onChange={(e) => setForm((p) => ({ ...p, selectors: e.target.value }))}
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Mapping Rules (JSON)</Label>
              <Textarea
                placeholder='Optional field mapping rules'
                value={form.mappingRules}
                onChange={(e) => setForm((p) => ({ ...p, mappingRules: e.target.value }))}
                rows={3}
                className="font-mono text-sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Auto Publish</Label>
              <Switch
                checked={form.autoPublish}
                onCheckedChange={(v) => setForm((p) => ({ ...p, autoPublish: v }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm((p) => ({ ...p, isActive: v }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
              {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Source</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this source? This will also delete all fetch logs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
