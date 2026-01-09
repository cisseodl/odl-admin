"use client"

import { useState, useMemo, useEffect } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { SearchBar } from "@/components/ui/search-bar"
import { DataTable } from "@/components/ui/data-table"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSearch } from "@/hooks/use-search"
import type { ColumnDef } from "@tanstack/react-table"
import { User, Mail, BookOpen, TrendingUp, Calendar } from "lucide-react"

import { useAuth } from "@/contexts/auth-context"; // Import useAuth
import { PageLoader } from "@/components/ui/page-loader"; // Import PageLoader
import { apprenantService, courseService } from "@/services"; // Import services
import { Apprenant } from "@/models/apprenant.model"; // Import Apprenant model
import { Course } from "@/models/course.model"; // Import Course model


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

// Helper function to map Apprenant and Course data to StudentDisplay
const mapApprenantToStudent = (apprenant: Apprenant, courses: Course[]): Student => {
  // This is a simplified mapping. In a real app, you'd have specific API endpoints
  // for learner progress on courses by a specific instructor.
  const course = courses[Math.floor(Math.random() * courses.length)]; // Simulate assigning a random course from instructor's courses
  
  return {
    id: apprenant.id || 0,
    name: `${apprenant.prenom || ''} ${apprenant.nom || ''}`.trim(),
    email: apprenant.email || "",
    course: course?.title || "N/A", // Use course title if available
    progress: Math.floor(Math.random() * 100), // Placeholder
    score: Math.floor(Math.random() * (100 - 60 + 1) + 60), // Placeholder
    completedModules: Math.floor(Math.random() * 5), // Placeholder
    totalModules: 5, // Placeholder
    lastActivity: new Date(apprenant.updatedAt || apprenant.createdAt || Date.now()).toLocaleDateString("fr-FR", { year: 'numeric', month: 'short', day: 'numeric' }),
    avatar: undefined, // Apprenant model does not have avatar directly
  };
};


export function StudentsTracker() {
  const { user, isLoading: authLoading } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) {
      setLoading(false);
      return;
    }

    const fetchStudentsData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all apprenants (temporarily, as no instructor-specific endpoint)
        const allApprenants = await apprenantService.getAllApprenants();
        // Fetch courses for the current instructor
        const instructorCourses = await courseService.getCoursesByInstructorId(Number(user.id));

        // Filter apprenants who are somehow linked to instructorCourses (simplified for now)
        // In a real scenario, this would involve backend logic or a more complex filtering/matching
        const relevantStudents = allApprenants.map(apprenant => mapApprenantToStudent(apprenant, instructorCourses));
        
        setStudents(relevantStudents);

      } catch (err: any) {
        setError(err.message || "Failed to fetch students data.");
        console.error("Error fetching students data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentsData();
  }, [user, authLoading]);

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
          {loading ? (
            <PageLoader />
          ) : error ? (
            <div className="text-center text-destructive p-4">{error}</div>
          ) : (
            <>
              <div className="mb-4">
                <SearchBar
                  placeholder="Rechercher un apprenant..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
              </div>
              {students.length === 0 ? (
                <div className="text-center text-muted-foreground p-4">Aucun apprenant trouvé.</div>
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
