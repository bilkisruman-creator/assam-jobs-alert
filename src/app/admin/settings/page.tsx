'use client'

import { useState, useEffect } from 'react'
import { Save, Settings, Globe, Palette, Code, Smartphone, Share2 } from 'lucide-react'
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
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Appearance Settings</CardTitle>
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
              <Separator />
              <div className="space-y-2">
                <Label>Logo URL</Label>
                <Input
                  value={settings.logo_url || ''}
                  onChange={(e) => updateSetting('logo_url', e.target.value)}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div className="space-y-2">
                <Label>Favicon URL</Label>
                <Input
                  value={settings.favicon_url || ''}
                  onChange={(e) => updateSetting('favicon_url', e.target.value)}
                  placeholder="https://example.com/favicon.ico"
                />
              </div>
            </CardContent>
          </Card>
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
