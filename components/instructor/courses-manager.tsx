"use client"

import { useState, useMemo } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { SearchBar } from "@/components/ui/search-bar"
import { DataTable } from "@/components/ui/data-table"
import { ActionMenu } from "@/components/ui/action-menu"
import { StatusBadge } from "@/components/ui/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSearch } from "@/hooks/use-search"
import type { ColumnDef } from "@tanstack/react-table"
import { Eye, BookOpen, Users, Clock, Star, FileText, Video, Play } from "lucide-react"

type Course = {
  id: number
  title: string
  modules: number
  chapters: number
  videos: number
  students: number
  status: "Publié" | "Brouillon" | "En révision"
  rating: number
  createdAt: string
}

export function CoursesManager() {
  const [courses, setCourses] = useState<Course[]>([
    {
      id: 1,
      title: "Formation React Avancé",
      modules: 5,
      chapters: 24,
      videos: 45,
      students: 450,
      status: "Publié",
      rating: 4.8,
      createdAt: "15 Jan 2024",
    },
    {
      id: 2,
      title: "Formation Node.js Complet",
      modules: 6,
      chapters: 30,
      videos: 52,
      students: 380,
      status: "Publié",
      rating: 4.6,
      createdAt: "20 Fév 2024",
    },
    {
      id: 3,
      title: "TypeScript Fondamentaux",
      modules: 4,
      chapters: 18,
      videos: 32,
      students: 340,
      status: "En révision",
      rating: 4.7,
      createdAt: "10 Mar 2024",
    },
  ])

  const { searchQuery, setSearchQuery, filteredData } = useSearch<Course>({
    data: courses,
    searchKeys: ["title"],
  })

  const columns: ColumnDef<Course>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Formation",
        cell: ({ row }) => (
          <div className="font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            {row.original.title}
          </div>
        ),
      },
      {
        accessorKey: "modules",
        header: "Modules",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <FileText className="h-4 w-4 text-muted-foreground" />
            {row.original.modules}
          </div>
        ),
      },
      {
        accessorKey: "chapters",
        header: "Chapitres",
      },
      {
        accessorKey: "videos",
        header: "Vidéos",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Video className="h-4 w-4 text-muted-foreground" />
            {row.original.videos}
          </div>
        ),
      },
      {
        accessorKey: "students",
        header: "Apprenants",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            {row.original.students}
          </div>
        ),
      },
      {
        accessorKey: "rating",
        header: "Note",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-primary text-primary" />
            {row.original.rating}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Statut",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const course = row.original
          return (
            <ActionMenu
              actions={[
                {
                  label: "Voir",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => console.log("View", course),
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
        title="Mes Formations"
        description="Gérez vos formations, modules, chapitres et vidéos"
        action={{
          label: "Créer une formation",
          onClick: () => console.log("Create course"),
        }}
      />

      <Card className="mt-6">
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
              <TabsTrigger value="all">Toutes ({courses.length})</TabsTrigger>
              <TabsTrigger value="published">
                Publiées ({courses.filter((c) => c.status === "Publié").length})
              </TabsTrigger>
              <TabsTrigger value="draft">
                Brouillons ({courses.filter((c) => c.status === "Brouillon").length})
              </TabsTrigger>
              <TabsTrigger value="review">
                En révision ({courses.filter((c) => c.status === "En révision").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="mb-4">
                <SearchBar
                  placeholder="Rechercher une formation..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
              </div>
              <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
            </TabsContent>

            <TabsContent value="published" className="space-y-4">
              <div className="mb-4">
                <SearchBar
                  placeholder="Rechercher une formation..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
              </div>
              <DataTable
                columns={columns}
                data={filteredData.filter((c) => c.status === "Publié")}
                searchValue={searchQuery}
              />
            </TabsContent>

            <TabsContent value="draft" className="space-y-4">
              <div className="mb-4">
                <SearchBar
                  placeholder="Rechercher une formation..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
              </div>
              <DataTable
                columns={columns}
                data={filteredData.filter((c) => c.status === "Brouillon")}
                searchValue={searchQuery}
              />
            </TabsContent>

            <TabsContent value="review" className="space-y-4">
              <div className="mb-4">
                <SearchBar
                  placeholder="Rechercher une formation..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
              </div>
              <DataTable
                columns={columns}
                data={filteredData.filter((c) => c.status === "En révision")}
                searchValue={searchQuery}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  )
}
