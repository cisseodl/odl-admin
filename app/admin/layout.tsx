import type React from "react"
import { Sidebar } from "@/components/admin/sidebar"
import { Header } from "@/components/admin/header"
import { Breadcrumbs } from "@/components/admin/breadcrumbs"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col lg:pl-64">
          <Header />
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <Breadcrumbs />
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
