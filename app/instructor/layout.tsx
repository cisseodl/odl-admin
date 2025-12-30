import type React from "react"
import { InstructorSidebar } from "@/components/instructor/sidebar"
import { InstructorHeader } from "@/components/instructor/header"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute requiredRole="instructor">
      <div className="flex min-h-screen bg-background">
        <InstructorSidebar />
        <div className="flex-1 flex flex-col lg:pl-64">
          <InstructorHeader />
          <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

