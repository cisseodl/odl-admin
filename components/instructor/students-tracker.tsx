"use client"

import { useState, useMemo, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { PageHeader } from "@/components/ui/page-header"
import { SearchBar } from "@/components/ui/search-bar"
import { DataTable } from "@/components/ui/data-table"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useSearch } from "@/hooks/use-search"
import type { ColumnDef } from "@tanstack/react-table"
import { User, Mail, BookOpen, TrendingUp, Calendar, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { PageLoader } from "@/components/ui/page-loader"
import { courseService, detailsCourseService } from "@/services"

type Student = {
  id: number
  name: string
  email: string
  course: string
  courseId: number
  progress: number
  score: number
  completedModules: number
  totalModules: number
  lastActivity: string
}

function formatDate(value: unknown): string {
  if (!value) return "—"
  try {
    return new Date(String(value)).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  } catch {
    return "—"
  }
}

function resolveScore(detail: Record<string, unknown>): number {
  const exam = detail.bestExamScore ?? detail.examScore
  const quiz = detail.bestQuizScore ?? detail.quizScore
  const raw = exam ?? quiz ?? 0
  const num = Number(raw)
  return Number.isFinite(num) ? Math.round(num) : 0
}

export function StudentsTracker() {
  const { t } = useLanguage()
  const { user, isLoading: authLoading } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [allStudents, setAllStudents] = useState<Student[]>([])
  const [instructorCourses, setInstructorCourses] = useState<any[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading || !user) {
      setLoading(false)
      return
    }

    const fetchStudentsData = async () => {
      setLoading(true)
      setError(null)
      try {
        const courses = await courseService.getCoursesByInstructorId(Number(user.id))
        setInstructorCourses(courses || [])

        if (!courses?.length) {
          setStudents([])
          setAllStudents([])
          return
        }

        const mappedStudents: Student[] = []

        for (const course of courses) {
          const courseId = Number(course.id)
          if (Number.isNaN(courseId)) continue

          const details = await detailsCourseService.getDetailsByCourseId(courseId)
          const detailsList = Array.isArray(details) ? details : []

          for (const detail of detailsList) {
            const learnerId = Number(detail.learnerId)
            if (!learnerId || Number.isNaN(learnerId)) continue

            mappedStudents.push({
              id: learnerId,
              name: detail.learnerName || "Sans nom",
              email: detail.learnerEmail || "",
              course: course.title || `Cours ${courseId}`,
              courseId,
              progress: Number(detail.progress) || 0,
              score: resolveScore(detail),
              completedModules: Number(detail.completedModules) || 0,
              totalModules: Number(detail.totalModules) || 0,
              lastActivity: formatDate(detail.lastModifiedAt ?? detail.createdAt),
            })
          }
        }

        setAllStudents(mappedStudents)
        setStudents(mappedStudents)
      } catch (err: any) {
        setError(err.message || "Impossible de charger les apprenants.")
        console.error("[StudentsTracker] Error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchStudentsData()
  }, [user, authLoading])

  const filteredByCourse = useMemo(() => {
    if (selectedCourseId === "all") return allStudents
    return allStudents.filter((s) => s.courseId === Number(selectedCourseId))
  }, [allStudents, selectedCourseId])

  const { searchQuery, setSearchQuery, filteredData } = useSearch<Student>({
    data: filteredByCourse,
    searchKeys: ["name", "email", "course"],
  })

  const columns: ColumnDef<Student>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: t("instructor.students.table.header_learner"),
        cell: ({ row }) => {
          const student = row.original
          return (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {student.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
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
        header: t("instructor.students.table.header_course"),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            {row.original.course}
          </div>
        ),
      },
      {
        accessorKey: "progress",
        header: t("instructor.students.table.header_progress"),
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>{row.original.progress}%</span>
              <span className="text-muted-foreground">
                {t("instructor.students.table.modules_completed", {
                  completed: row.original.completedModules,
                  total: row.original.totalModules,
                })}
              </span>
            </div>
            <Progress value={row.original.progress} className="h-2" />
          </div>
        ),
      },
      {
        accessorKey: "score",
        header: t("instructor.students.table.header_score"),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            {row.original.score}%
          </div>
        ),
      },
      {
        accessorKey: "lastActivity",
        header: t("instructor.students.table.header_last_activity"),
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            {row.original.lastActivity}
          </div>
        ),
      },
    ],
    [t]
  )

  return (
    <>
      <PageHeader
        title={t("instructor.students.title")}
        description={t("instructor.students.description")}
      />

      <Card className="mt-6">
        <CardContent>
          {loading ? (
            <PageLoader />
          ) : error ? (
            <div className="text-center text-destructive p-4">{error}</div>
          ) : (
            <>
              <div className="mb-4 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <SearchBar
                    placeholder={t("instructor.students.search_placeholder")}
                    value={searchQuery}
                    onChange={setSearchQuery}
                  />
                </div>
                {instructorCourses.length > 0 && (
                  <div className="flex items-center gap-2 sm:w-64">
                    <Label htmlFor="course-filter" className="flex items-center gap-2 whitespace-nowrap">
                      <Filter className="h-4 w-4" />
                      {t("instructor.students.filter_by_course") || "Filtrer par cours"}
                    </Label>
                    <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                      <SelectTrigger id="course-filter" className="w-full">
                        <SelectValue placeholder={t("instructor.students.filter_all_courses") || "Tous les cours"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          {t("instructor.students.filter_all_courses") || "Tous les cours"}
                        </SelectItem>
                        {instructorCourses
                          .filter((course: any) => course?.id != null)
                          .map((course: any) => (
                            <SelectItem key={course.id} value={String(course.id)}>
                              {course.title || `Cours ${course.id}`}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              {filteredByCourse.length === 0 ? (
                <div className="text-center text-muted-foreground p-4">
                  {selectedCourseId === "all"
                    ? t("instructor.students.table.no_students")
                    : t("instructor.students.table.no_students_for_course") || "Aucun apprenant inscrit à ce cours"}
                </div>
              ) : (
                <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </>
  )
}
