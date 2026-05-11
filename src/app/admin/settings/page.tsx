'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Save, Settings, Globe, Palette, Code, Smartphone, Share2, Upload, Image as ImageIcon, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingFavicon, setUploadingFavicon] = useState(false)
  const [dragOver, setDragOver] = useState<'logo' | 'favicon' | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })

      if (res.ok) {
        toast.success('Settings saved successfully')
      } else {
        toast.error('Failed to save settings')
      }
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = useCallback(async (
    file: File,
    type: 'logo' | 'favicon'
  ) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    const maxSizes: Record<string, number> = { logo: 5 * 1024 * 1024, favicon: 2 * 1024 * 1024 }
    const maxSize = maxSizes[type]

    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only PNG, JPG, SVG, and WEBP are allowed.')
      return
    }

    if (file.size > maxSize) {
      toast.error(`File too large. Maximum size is ${type === 'logo' ? '5MB' : '2MB'}.`)
      return
    }

    if (type === 'logo') setUploadingLogo(true)
    else setUploadingFavicon(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        const settingKey = type === 'logo' ? 'logo_url' : 'favicon_url'
        updateSetting(settingKey, data.url)
        toast.success(`${type === 'logo' ? 'Logo' : 'Favicon'} uploaded successfully! Save settings to apply.`)
      } else {
        const data = await res.json()
        toast.error(data.error || 'Upload failed')
      }
    } catch {
      toast.error('Upload failed. Please try again.')
    } finally {
      if (type === 'logo') setUploadingLogo(false)
      else setUploadingFavicon(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, type: 'logo' | 'favicon') => {
    e.preventDefault()
    setDragOver(null)
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file, type)
  }, [handleFileUpload])

  const handleDragOver = useCallback((e: React.DragEvent, type: 'logo' | 'favicon') => {
    e.preventDefault()
    setDragOver(type)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(null)
  }, [])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = e.target.files?.[0]
    if (file) handleFileUpload(file, type)
    // Reset input so the same file can be re-selected
    e.target.value = ''
  }, [handleFileUpload])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure your site settings</p>
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 bg-muted rounded animate-pulse" />
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure your site settings</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save All Settings'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2">
            <Share2 className="w-4 h-4" />
            Social
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2">
            <Globe className="w-4 h-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="w-4 h-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="advanced" className="gap-2">
            <Code className="w-4 h-4" />
            Advanced
          </TabsTrigger>
          <TabsTrigger value="android" className="gap-2">
            <Smartphone className="w-4 h-4" />
            Android
          </TabsTrigger>
        </TabsList>

        {/* General */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Site Name</Label>
                <Input
                  value={settings.site_name || ''}
                  onChange={(e) => updateSetting('site_name', e.target.value)}
                  placeholder="Assam Jobs Alert"
                />
              </div>
              <div className="space-y-2">
                <Label>Tagline</Label>
                <Input
                  value={settings.site_tagline || ''}
                  onChange={(e) => updateSetting('site_tagline', e.target.value)}
                  placeholder="Latest Government Jobs in Assam"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={settings.site_description || ''}
                  onChange={(e) => updateSetting('site_description', e.target.value)}
                  placeholder="Website description..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Site URL</Label>
                <Input
                  value={settings.site_url || ''}
                  onChange={(e) => updateSetting('site_url', e.target.value)}
                  placeholder="https://assamjobsalert.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Admin Email</Label>
                <Input
                  type="email"
                  value={settings.admin_email || ''}
                  onChange={(e) => updateSetting('admin_email', e.target.value)}
                  placeholder="admin@assamjobsalert.com"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Social Media Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Telegram Channel</Label>
                <Input
                  value={settings.telegram_url || ''}
                  onChange={(e) => updateSetting('telegram_url', e.target.value)}
                  placeholder="https://t.me/assamjobsalert"
                />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp Group</Label>
                <Input
                  value={settings.whatsapp_url || ''}
                  onChange={(e) => updateSetting('whatsapp_url', e.target.value)}
                  placeholder="https://chat.whatsapp.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label>YouTube Channel</Label>
                <Input
                  value={settings.youtube_url || ''}
                  onChange={(e) => updateSetting('youtube_url', e.target.value)}
                  placeholder="https://youtube.com/@assamjobsalert"
                />
              </div>
              <div className="space-y-2">
                <Label>Facebook Page</Label>
                <Input
                  value={settings.facebook_url || ''}
                  onChange={(e) => updateSetting('facebook_url', e.target.value)}
                  placeholder="https://facebook.com/assamjobsalert"
                />
              </div>
              <div className="space-y-2">
                <Label>Twitter / X</Label>
                <Input
                  value={settings.twitter_url || ''}
                  onChange={(e) => updateSetting('twitter_url', e.target.value)}
                  placeholder="https://twitter.com/assamjobsalert"
                />
              </div>
              <div className="space-y-2">
                <Label>Instagram</Label>
                <Input
                  value={settings.instagram_url || ''}
                  onChange={(e) => updateSetting('instagram_url', e.target.value)}
                  placeholder="https://instagram.com/assamjobsalert"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Robots.txt Content</Label>
                <Textarea
                  value={settings.robots_txt || ''}
                  onChange={(e) => updateSetting('robots_txt', e.target.value)}
                  placeholder="User-agent: *&#10;Allow: /"
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label>Google Analytics ID</Label>
                <Input
                  value={settings.analytics_id || ''}
                  onChange={(e) => updateSetting('analytics_id', e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
              <div className="space-y-2">
                <Label>Custom Header HTML</Label>
                <Textarea
                  value={settings.custom_header_html || ''}
                  onChange={(e) => updateSetting('custom_header_html', e.target.value)}
                  placeholder="<!-- Custom HTML for <head> -->"
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label>Custom Footer HTML</Label>
                <Textarea
                  value={settings.custom_footer_html || ''}
                  onChange={(e) => updateSetting('custom_footer_html', e.target.value)}
                  placeholder="<!-- Custom HTML before </body> -->"
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance">
          <div className="space-y-6">
            {/* Logo Upload Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Website Logo
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload your website logo. This will appear in the desktop and mobile header. Supports PNG, JPG, SVG, and WEBP.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Logo Preview */}
                {settings.logo_url ? (
                  <div className="space-y-3">
                    <Label>Current Logo</Label>
                    <div className="relative inline-block">
                      <div className="border rounded-xl p-4 bg-muted/30 max-w-xs">
                        <img
                          src={settings.logo_url}
                          alt="Website Logo"
                          className="max-h-20 max-w-full object-contain"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => {
                          updateSetting('logo_url', '')
                          toast.success('Logo removed. Save settings to apply.')
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Path: {settings.logo_url}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg border border-dashed border-border bg-muted/20">
                    <p className="text-sm text-muted-foreground">No logo uploaded yet. The default text logo will be displayed.</p>
                  </div>
                )}

                <Separator />

                {/* Upload Area */}
                <div
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer ${
                    dragOver === 'logo'
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/20 scale-[1.01]'
                      : 'border-border hover:border-green-400 hover:bg-muted/30'
                  }`}
                  onDragOver={(e) => handleDragOver(e, 'logo')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'logo')}
                  onClick={() => logoInputRef.current?.click()}
                >
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.svg,.webp"
                    className="hidden"
                    onChange={(e) => handleFileInput(e, 'logo')}
                  />
                  {uploadingLogo ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
                      <p className="text-sm text-muted-foreground">Uploading logo...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Upload className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {settings.logo_url ? 'Replace Logo' : 'Upload Logo'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Drag & drop or click to browse. PNG, JPG, SVG, WEBP (max 5MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Favicon Upload Card - Separate */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Favicon
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload a favicon for browser tabs. Recommended: 32×32 or 64×64 ICO, PNG, or SVG.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Favicon Preview */}
                {settings.favicon_url ? (
                  <div className="space-y-3">
                    <Label>Current Favicon</Label>
                    <div className="relative inline-block">
                      <div className="border rounded-xl p-4 bg-muted/30">
                        <img
                          src={settings.favicon_url}
                          alt="Favicon"
                          className="h-8 w-8 object-contain"
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => {
                          updateSetting('favicon_url', '')
                          toast.success('Favicon removed. Save settings to apply.')
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Path: {settings.favicon_url}
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg border border-dashed border-border bg-muted/20">
                    <p className="text-sm text-muted-foreground">No favicon uploaded. The default favicon will be used.</p>
                  </div>
                )}

                <Separator />

                {/* Favicon Upload Area */}
                <div
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer ${
                    dragOver === 'favicon'
                      ? 'border-green-500 bg-green-50 dark:bg-green-950/20 scale-[1.01]'
                      : 'border-border hover:border-green-400 hover:bg-muted/30'
                  }`}
                  onDragOver={(e) => handleDragOver(e, 'favicon')}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, 'favicon')}
                  onClick={() => faviconInputRef.current?.click()}
                >
                  <input
                    ref={faviconInputRef}
                    type="file"
                    accept=".png,.jpg,.jpeg,.svg,.webp,.ico"
                    className="hidden"
                    onChange={(e) => handleFileInput(e, 'favicon')}
                  />
                  {uploadingFavicon ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
                      <p className="text-sm text-muted-foreground">Uploading favicon...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <Upload className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {settings.favicon_url ? 'Replace Favicon' : 'Upload Favicon'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Drag & drop or click to browse. PNG, ICO, SVG (max 2MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Colors Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Theme Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={settings.primary_color || '#16a34a'}
                      onChange={(e) => updateSetting('primary_color', e.target.value)}
                      className="w-12 h-9 p-1 cursor-pointer"
                    />
                    <Input
                      value={settings.primary_color || '#16a34a'}
                      onChange={(e) => updateSetting('primary_color', e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={settings.accent_color || '#ea580c'}
                      onChange={(e) => updateSetting('accent_color', e.target.value)}
                      className="w-12 h-9 p-1 cursor-pointer"
                    />
                    <Input
                      value={settings.accent_color || '#ea580c'}
                      onChange={(e) => updateSetting('accent_color', e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Advanced */}
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-xs text-muted-foreground">Temporarily disable the public site</p>
                </div>
                <Switch
                  checked={settings.maintenance_mode === 'true'}
                  onCheckedChange={(v) => updateSetting('maintenance_mode', v ? 'true' : 'false')}
                />
              </div>
              <div className="space-y-2">
                <Label>Posts Per Page</Label>
                <Input
                  type="number"
                  value={settings.posts_per_page || '12'}
                  onChange={(e) => updateSetting('posts_per_page', e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">Enable browser push notifications</p>
                </div>
                <Switch
                  checked={settings.push_notifications !== 'false'}
                  onCheckedChange={(v) => updateSetting('push_notifications', v ? 'true' : 'false')}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div className="space-y-0.5">
                  <Label>Newsletter</Label>
                  <p className="text-xs text-muted-foreground">Enable newsletter subscription</p>
                </div>
                <Switch
                  checked={settings.newsletter_enabled !== 'false'}
                  onCheckedChange={(v) => updateSetting('newsletter_enabled', v ? 'true' : 'false')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Android */}
        <TabsContent value="android">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Android App Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Android App Link</Label>
                <Input
                  value={settings.android_app_link || ''}
                  onChange={(e) => updateSetting('android_app_link', e.target.value)}
                  placeholder="https://play.google.com/store/apps/details?id=..."
                />
              </div>
              <div className="p-4 rounded-lg border bg-muted/30">
                <p className="text-sm text-muted-foreground">
                  Configure your Android app link to show download prompts to mobile users.
                  The app link will be displayed as a banner on the mobile version of the site.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
