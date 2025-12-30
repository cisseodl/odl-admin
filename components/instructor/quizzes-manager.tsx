"use client"

import { useState, useMemo } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { SearchBar } from "@/components/ui/search-bar"
import { DataTable } from "@/components/ui/data-table"
import { ActionMenu } from "@/components/ui/action-menu"
import { StatusBadge } from "@/components/ui/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { useSearch } from "@/hooks/use-search"
import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Edit, Trash2, FileQuestion, BookOpen, FileText, Users, TrendingUp, Calendar } from "lucide-react"

type Quiz = {
  id: number
  title: string
  course: string
  module: string
  questions: number
  type: "Quiz" | "Exercice"
  attempts: number
  averageScore: number
  status: "Actif" | "Brouillon"
  createdAt: string
}

export function QuizzesManager() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([
    {
      id: 1,
      title: "Quiz React Hooks",
      course: "Formation React Avancé",
      module: "Module 2",
      questions: 15,
      type: "Quiz",
      attempts: 45,
      averageScore: 82,
      status: "Actif",
      createdAt: "10 Jan 2024",
    },
    {
      id: 2,
      title: "Exercice Node.js Async",
      course: "Formation Node.js Complet",
      module: "Module 3",
      questions: 10,
      type: "Exercice",
      attempts: 32,
      averageScore: 75,
      status: "Actif",
      createdAt: "15 Fév 2024",
    },
    {
      id: 3,
      title: "Quiz TypeScript Types",
      course: "TypeScript Fondamentaux",
      module: "Module 1",
      questions: 20,
      type: "Quiz",
      attempts: 28,
      averageScore: 88,
      status: "Brouillon",
      createdAt: "20 Mar 2024",
    },
  ])

  const { searchQuery, setSearchQuery, filteredData } = useSearch<Quiz>({
    data: quizzes,
    searchKeys: ["title", "course", "module"],
  })

  const columns: ColumnDef<Quiz>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Quiz/Exercice",
        cell: ({ row }) => (
          <div className="font-medium flex items-center gap-2">
            <FileQuestion className="h-4 w-4 text-muted-foreground" />
            {row.original.title}
          </div>
        ),
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
        accessorKey: "module",
        header: "Module",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            {row.original.module}
          </div>
        ),
      },
      {
        accessorKey: "questions",
        header: "Questions",
      },
      {
        accessorKey: "type",
        header: "Type",
      },
      {
        accessorKey: "attempts",
        header: "Tentatives",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            {row.original.attempts}
          </div>
        ),
      },
      {
        accessorKey: "averageScore",
        header: "Score moyen",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            {row.original.averageScore}%
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Statut",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "createdAt",
        header: "Créé le",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {row.original.createdAt}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const quiz = row.original
          return (
            <ActionMenu
              actions={[
                {
                  label: "Voir",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => console.log("View", quiz),
                },
                {
                  label: "Modifier",
                  icon: <Edit className="h-4 w-4" />,
                  onClick: () => console.log("Edit", quiz),
                },
                {
                  label: "Supprimer",
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: () => console.log("Delete", quiz),
                  variant: "destructive",
                },
              ]}
            />
          )
        },
      },
    ],
    []
  )

  return (
    <>
      <PageHeader
        title="Quiz & Exercices"
        action={{
          label: "Créer un quiz",
          onClick: () => console.log("Create quiz"),
        }}
      />

      <Card className="mt-6">
        <CardContent>
          <div className="mb-4">
            <SearchBar
              placeholder="Rechercher un quiz..."
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
