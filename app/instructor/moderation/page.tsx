"use client"

import { InstructorModerationList } from "@/components/instructor/instructor-moderation-list"
import { Suspense } from "react"
import { PageLoader } from "@/components/ui/page-loader"

export default function InstructorModerationPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <InstructorModerationList />
    </Suspense>
  )
}
