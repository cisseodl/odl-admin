"use client"

import { useState, useMemo } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { SearchBar } from "@/components/ui/search-bar"
import { DataTable } from "@/components/ui/data-table"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSearch } from "@/hooks/use-search"
import type { ColumnDef } from "@tanstack/react-table"
import { User, Mail, BookOpen, TrendingUp, Calendar } from "lucide-react"

type Student = {
  id: number
  name: string
  email: string
  course: string
  progress: number
  score: number
  completedModules: number
  totalModules: number
  lastActivity: string
  avatar?: string
}

export function StudentsTracker() {
  const [students, setStudents] = useState<Student[]>([
    {
      id: 1,
      name: "Marie Dupont",
      email: "marie.dupont@email.com",
      course: "Formation React Avancé",
      progress: 75,
      score: 85,
      completedModules: 3,
      totalModules: 4,
      lastActivity: "Il y a 2 heures",
      avatar: "/diverse-woman-portrait.png",
    },
    {
      id: 2,
      name: "Thomas Martin",
      email: "thomas.martin@email.com",
      course: "Formation Node.js Complet",
      progress: 90,
      score: 92,
      completedModules: 5,
      totalModules: 6,
      lastActivity: "Il y a 5 heures",
      avatar: "/man.jpg",
    },
    {
      id: 3,
      name: "Sophie Bernard",
      email: "sophie.bernard@email.com",
      course: "Formation React Avancé",
      progress: 50,
      score: 78,
      completedModules: 2,
      totalModules: 4,
      lastActivity: "Il y a 1 jour",
    },
  ])

  const { searchQuery, setSearchQuery, filteredData } = useSearch<Student>({
    data: students,
    searchKeys: ["name", "email", "course"],
  })

  const columns: ColumnDef<Student>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Apprenant",
        cell: ({ row }) => {
          const student = row.original
          return (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
                <AvatarFallback>{student.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {student.name}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Mail className="h-3.5 w-3.5" />
                  {student.email}
                </div>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "course",
        header: "Formation",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            {row.original.course}
          </div>
        ),
      },
      {
        accessorKey: "progress",
        header: "Progression",
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>{row.original.progress}%</span>
              <span className="text-muted-foreground">
                {row.original.completedModules}/{row.original.totalModules} modules
              </span>
            </div>
            <Progress value={row.original.progress} className="h-2" />
          </div>
        ),
      },
      {
        accessorKey: "score",
        header: "Score",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            {row.original.score}%
          </div>
        ),
      },
      {
        accessorKey: "lastActivity",
        header: "Dernière activité",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            {row.original.lastActivity}
          </div>
        ),
      },
    ],
    []
  )

  return (
    <>
      <PageHeader
        title="Mes Apprenants"
      />

      <Card className="mt-6">
        <CardContent>
          <div className="mb-4">
            <SearchBar
              placeholder="Rechercher un apprenant..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
          <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
        </CardContent>
      </Card>
    </>
  )
}
