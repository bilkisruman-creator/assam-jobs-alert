'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Globe,
  Settings,
  Megaphone,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Clock,
  Activity,
  Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAdminAuth } from '@/hooks/use-admin-auth'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/posts', label: 'Posts', icon: FileText },
  { href: '/admin/pending', label: 'Pending Approval', icon: Clock },
  { href: '/admin/categories', label: 'Categories', icon: FolderOpen },
  { href: '/admin/sources', label: 'Sources', icon: Globe },
  { href: '/admin/analytics', label: 'Analytics', icon: Activity },
  { href: '/admin/ads', label: 'Ads', icon: Megaphone },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

interface AdminSidebarProps {
  collapsed: boolean
  onToggle: () => void
  onClose?: () => void
}

export function AdminSidebar({ collapsed, onToggle, onClose }: AdminSidebarProps) {
  const pathname = usePathname()
  const { admin } = useAdminAuth()

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <div className="flex flex-col h-full bg-[#1a472a] text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-green-600 text-white font-bold text-lg shrink-0">
          A
        </div>
        {!collapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="font-bold text-sm leading-tight truncate">Assam Jobs Alert</span>
            <span className="text-[11px] text-green-300 leading-tight">Admin Panel</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                  : 'text-green-100/80 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Admin Info */}
      {!collapsed && admin && (
        <div className="px-4 py-3 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-sm font-bold shrink-0">
              {admin.name.charAt(0)}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{admin.name}</span>
              <span className="text-[11px] text-green-300 truncate">{admin.email}</span>
            </div>
          </div>
        </div>
      )}

      {/* Visit Site Link */}
      <div className="px-2 py-3 border-t border-white/10">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-green-300 hover:bg-white/10 hover:text-white transition-colors"
        >
          <ExternalLink className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Visit Site</span>}
        </Link>
      </div>

      {/* Collapse Toggle */}
      <div className="px-2 py-2 border-t border-white/10">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-full justify-center text-green-300 hover:text-white hover:bg-white/10"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  )
}
