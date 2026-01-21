"use client"

import InstructorFormationsManager from "@/components/instructor/instructor-formations-manager"

export default function InstructorFormationsPage() {
  if (!InstructorFormationsManager) {
    console.error("InstructorFormationsManager is undefined!")
    return <div>Error: Component not found</div>
  }
  return <InstructorFormationsManager />
}
