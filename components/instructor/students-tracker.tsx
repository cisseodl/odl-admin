"use client"

import { useState, useMemo, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { PageHeader } from "@/components/ui/page-header"
import { SearchBar } from "@/components/ui/search-bar"
import { DataTable } from "@/components/ui/data-table"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSearch } from "@/hooks/use-search"
import type { ColumnDef } from "@tanstack/react-table"
import { User, Mail, BookOpen, TrendingUp, Calendar, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

import { useAuth } from "@/contexts/auth-context"; // Import useAuth
import { PageLoader } from "@/components/ui/page-loader"; // Import PageLoader
import { apprenantService, courseService, detailsCourseService } from "@/services"; // Import services
import { Apprenant } from "@/models/apprenant.model"; // Import Apprenant model
import { Course } from "@/models/course.model"; // Import Course model


type Student = {
  id: number
  name: string
  email: string
  course: string
  courseId: number // Ajout de courseId pour le filtrage
  progress: number
  score: number
  completedModules: number
  totalModules: number
  lastActivity: string
  avatar?: string
}



export function StudentsTracker() {
  const { t } = useLanguage()
  const { user, isLoading: authLoading } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]); // Stocker tous les étudiants pour le filtrage
  const [instructorCourses, setInstructorCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
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
        console.log("[StudentsTracker] Début de la récupération des données...");
        
        // Récupérer les cours de l'instructeur
        const courses = await courseService.getCoursesByInstructorId(Number(user.id));
        console.log("[StudentsTracker] Cours récupérés:", courses?.length || 0, courses);
        setInstructorCourses(courses || []);
        
        if (!courses || courses.length === 0) {
          console.log("[StudentsTracker] Aucun cours trouvé pour l'instructeur");
          setStudents([]);
          setAllStudents([]);
          setLoading(false);
          return;
        }

        // Récupérer les détails de cours (inscriptions) pour les cours de l'instructeur
        const courseIds = courses.map((c: any) => c.id);
        const allDetailsCourses: any[] = [];
        
        console.log("[StudentsTracker] Récupération des détails pour", courseIds.length, "cours...");
        // Récupérer les détails pour chaque cours
        for (const courseId of courseIds) {
          try {
            const details = await detailsCourseService.getDetailsByCourseId(courseId);
            if (Array.isArray(details)) {
              allDetailsCourses.push(...details);
            } else if (details?.data && Array.isArray(details.data)) {
              allDetailsCourses.push(...details.data);
            }
            console.log(`[StudentsTracker] Détails pour cours ${courseId}:`, Array.isArray(details) ? details.length : (details?.data?.length || 0));
          } catch (err) {
            console.warn(`[StudentsTracker] Failed to fetch details for course ${courseId}:`, err);
          }
        }

        console.log("[StudentsTracker] Total détails récupérés:", allDetailsCourses.length);

        // IDs utilisateur (User.id) des apprenants inscrits aux cours de l'instructeur
        const learnerUserIds = [...new Set(allDetailsCourses.map(dc => Number(dc.learnerId)).filter(id => id > 0))];
        console.log("[StudentsTracker] Learner User IDs uniques:", learnerUserIds);
        
        if (learnerUserIds.length === 0) {
          console.log("[StudentsTracker] Aucun learnerId trouvé dans les détails de cours");
          setStudents([]);
          setAllStudents([]);
          setLoading(false);
          return;
        }

        // Récupérer les apprenants via l'endpoint by-instructor (autorisé pour INSTRUCTOR)
        // Le backend retourne déjà les apprenants filtrés par instructeur
        let allApprenants: any[] = [];
        try {
          allApprenants = await apprenantService.getApprenantsByInstructor();
          console.log("[StudentsTracker] Apprenants récupérés depuis backend:", Array.isArray(allApprenants) ? allApprenants.length : 0);
          console.log("[StudentsTracker] Apprenants détaillés:", allApprenants);
        } catch (err: any) {
          console.error("[StudentsTracker] Erreur lors de la récupération des apprenants:", err);
          setError(err.message || "Erreur lors de la récupération des apprenants");
          setStudents([]);
          setAllStudents([]);
          setLoading(false);
          return;
        }
        
        if (!Array.isArray(allApprenants) || allApprenants.length === 0) {
          console.log("[StudentsTracker] Aucun apprenant retourné par le backend");
          setStudents([]);
          setAllStudents([]);
          setLoading(false);
          return;
        }

        // Mapper les apprenants avec leurs données de progression réelles
        // Pour chaque apprenant, trouver son cours et calculer sa progression
        const mappedStudents: Student[] = [];
        
        for (const apprenant of allApprenants) {
          // Essayer plusieurs façons d'accéder à userId
          const learnerUserId = apprenant.userId 
            ? Number(apprenant.userId) 
            : (apprenant.user?.id ? Number(apprenant.user.id) : null);
          
          console.log(`[StudentsTracker] Apprenant ${apprenant.id}: userId=${learnerUserId}, structure:`, {
            userId: apprenant.userId,
            user: apprenant.user,
            username: apprenant.username,
            fullName: apprenant.fullName,
            userEmail: apprenant.userEmail
          });
          
          if (!learnerUserId) {
            console.warn(`[StudentsTracker] Apprenant ${apprenant.id} n'a pas de userId accessible`);
            // Essayer quand même d'ajouter l'apprenant avec un userId par défaut si possible
            if (apprenant.id) {
              console.warn(`[StudentsTracker] Utilisation de apprenant.id (${apprenant.id}) comme fallback pour userId`);
            } else {
              continue;
            }
          }
          
          // Trouver les inscriptions de cet apprenant aux cours de l'instructeur
          const apprenantDetailsCourses = allDetailsCourses.filter(dc => 
            Number(dc.learnerId) === learnerUserId
          );
          
          console.log(`[StudentsTracker] Apprenant ${apprenant.id} (userId: ${learnerUserId}) a ${apprenantDetailsCourses.length} inscriptions`);
          
          // Si l'apprenant n'a aucune inscription trouvée, on l'ajoute quand même avec un cours par défaut
          if (apprenantDetailsCourses.length === 0) {
            console.warn(`[StudentsTracker] Apprenant ${apprenant.id} n'a pas d'inscription trouvée dans allDetailsCourses`);
            // Utiliser le premier cours de l'instructeur comme fallback
            if (courses.length > 0) {
              const course = courses[0];
              const student: Student = {
                id: apprenant.id || 0,
                name: apprenant.username || apprenant.fullName || `${apprenant.prenom || ''} ${apprenant.nom || ''}`.trim() || "N/A",
                email: apprenant.userEmail || apprenant.email || "",
                course: course.title || "N/A",
                courseId: course.id,
                progress: 0,
                score: 0,
                completedModules: 0,
                totalModules: 0,
                lastActivity: new Date(apprenant.updatedAt || apprenant.createdAt || Date.now()).toLocaleDateString("fr-FR", { year: 'numeric', month: 'short', day: 'numeric' }),
                avatar: apprenant.avatar || undefined,
              };
              mappedStudents.push(student);
            }
            continue;
          }
          
          // Pour chaque inscription de l'apprenant à un cours de l'instructeur
          for (const detail of apprenantDetailsCourses) {
            const courseId = Number(detail.courseId);
            const course = courses.find((c: any) => Number(c.id) === courseId);
            if (!course) {
              console.warn(`[StudentsTracker] Cours ${courseId} non trouvé dans la liste des cours de l'instructeur`);
              continue;
            }
            
            // Récupérer le cours complet avec modules pour calculer la progression
            try {
              const fullCourse = await courseService.getCourseById(courseId);
              const totalModules = (fullCourse as any).modules?.length || (fullCourse as any).curriculum?.length || 0;
              
              const student: Student = {
                id: apprenant.id || 0,
                name: apprenant.username || apprenant.fullName || `${apprenant.prenom || ''} ${apprenant.nom || ''}`.trim() || "N/A",
                email: apprenant.userEmail || apprenant.email || "",
                course: fullCourse.title || course.title || "N/A",
                courseId: courseId, // Ajout de courseId pour le filtrage
                progress: 0, // Progression réelle à calculer depuis l'API
                score: 0, // Score réel à récupérer depuis l'API
                completedModules: 0, // Modules complétés à récupérer depuis l'API
                totalModules: totalModules,
                lastActivity: new Date(apprenant.updatedAt || apprenant.createdAt || Date.now()).toLocaleDateString("fr-FR", { year: 'numeric', month: 'short', day: 'numeric' }),
                avatar: apprenant.avatar || undefined,
              };
              
              mappedStudents.push(student);
            } catch (err) {
              console.warn(`[StudentsTracker] Failed to fetch full course ${courseId} for student ${apprenant.id}:`, err);
              // Ajouter quand même l'étudiant avec des données partielles
              const student: Student = {
                id: apprenant.id || 0,
                name: apprenant.username || apprenant.fullName || `${apprenant.prenom || ''} ${apprenant.nom || ''}`.trim() || "N/A",
                email: apprenant.userEmail || apprenant.email || "",
                course: course.title || "N/A",
                courseId: courseId, // Ajout de courseId pour le filtrage
                progress: 0,
                score: 0,
                completedModules: 0,
                totalModules: 0,
                lastActivity: new Date(apprenant.updatedAt || apprenant.createdAt || Date.now()).toLocaleDateString("fr-FR", { year: 'numeric', month: 'short', day: 'numeric' }),
                avatar: apprenant.avatar || undefined,
              };
              mappedStudents.push(student);
            }
          }
        }
        
        console.log("[StudentsTracker] Total étudiants mappés:", mappedStudents.length);
        setAllStudents(mappedStudents); // Stocker tous les étudiants
        setStudents(mappedStudents); // Afficher tous par défaut

      } catch (err: any) {
        setError(err.message || "Failed to fetch students data.");
        console.error("[StudentsTracker] Error fetching students data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentsData();
  }, [user, authLoading]);

  // Filtrer les étudiants par cours sélectionné
  const filteredByCourse = useMemo(() => {
    if (selectedCourseId === "all") {
      return allStudents;
    }
    return allStudents.filter(student => student.courseId === Number(selectedCourseId));
  }, [allStudents, selectedCourseId]);

  const { searchQuery, setSearchQuery, filteredData } = useSearch<Student>({
    data: filteredByCourse,
    searchKeys: ["name", "email", "course"],
  })

  const columns: ColumnDef<Student>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: t('instructor.students.table.header_learner'),
        cell: ({ row }) => {
          const student = row.original
          return (
            <div className="flex items-center gap-3">
              <Avatar>
                {/* Utiliser uniquement AvatarFallback avec initiales, pas de photo */}
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
        header: t('instructor.students.table.header_course'),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            {row.original.course}
          </div>
        ),
      },
      {
        accessorKey: "progress",
        header: t('instructor.students.table.header_progress'),
        cell: ({ row }) => (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>{row.original.progress}%</span>
              <span className="text-muted-foreground">
                {t('instructor.students.table.modules_completed', { 
                  completed: row.original.completedModules, 
                  total: row.original.totalModules 
                })}
              </span>
            </div>
            <Progress value={row.original.progress} className="h-2" />
          </div>
        ),
      },
      {
        accessorKey: "score",
        header: t('instructor.students.table.header_score'),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            {row.original.score}%
          </div>
        ),
      },
      {
        accessorKey: "lastActivity",
        header: t('instructor.students.table.header_last_activity'),
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
        title={t('instructor.students.title')}
        description={t('instructor.students.description')}
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
                    placeholder={t('instructor.students.search_placeholder')}
                    value={searchQuery}
                    onChange={setSearchQuery}
                  />
                </div>
                {instructorCourses.length > 0 && (
                  <div className="flex items-center gap-2 sm:w-64">
                    <Label htmlFor="course-filter" className="flex items-center gap-2 whitespace-nowrap">
                      <Filter className="h-4 w-4" />
                      {t('instructor.students.filter_by_course') || "Filtrer par cours"}
                    </Label>
                    <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                      <SelectTrigger id="course-filter" className="w-full">
                        <SelectValue placeholder={t('instructor.students.filter_all_courses') || "Tous les cours"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          {t('instructor.students.filter_all_courses') || "Tous les cours"}
                        </SelectItem>
                        {instructorCourses
                          .filter((course: any) => {
                            // Filtrer les cours avec des IDs valides (non null, non undefined, non vide)
                            const courseId = course?.id;
                            return courseId != null && courseId !== undefined && courseId !== "" && String(courseId).trim() !== "";
                          })
                          .map((course: any) => {
                            const courseId = String(course.id).trim();
                            return (
                              <SelectItem key={course.id} value={courseId}>
                                {course.title || `Cours ${course.id}`}
                              </SelectItem>
                            );
                          })}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              {filteredByCourse.length === 0 ? (
                <div className="text-center text-muted-foreground p-4">
                  {selectedCourseId === "all" 
                    ? t('instructor.students.table.no_students')
                    : t('instructor.students.table.no_students_for_course') || "Aucun apprenant inscrit à ce cours"}
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
