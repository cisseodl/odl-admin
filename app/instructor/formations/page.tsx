"use client"

import dynamic from "next/dynamic"

const InstructorFormationsManager = dynamic(
  () => import("@/components/instructor/instructor-formations-manager"),
  {
    ssr: false,
    loading: () => <div>Chargement...</div>,
  }
)

export default function InstructorFormationsPage() {
  return <InstructorFormationsManager />
}
