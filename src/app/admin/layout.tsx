'use client'

import { AdminAuthProvider } from '@/hooks/use-admin-auth'
import { AdminLayout } from '@/components/admin/admin-layout'
import { ThemeProvider } from 'next-themes'

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <AdminAuthProvider>
        <AdminLayout>
          {children}
        </AdminLayout>
      </AdminAuthProvider>
    </ThemeProvider>
  )
}
