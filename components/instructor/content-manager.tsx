"use client"

import { useState, useMemo, useEffect } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useModal } from "@/hooks/use-modal"
import { EmptyState } from "@/components/admin/empty-state"
import { FileText, Upload, ChevronRight, BookOpen, PlayCircle, File, Code, HelpCircle, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { courseService, moduleService } from "@/services"
import { PageLoader } from "@/components/ui/page-loader"
import { ModuleLessonFormModal, ModuleFormData } from "@/components/instructor/module-lesson-form-modal"
import { Course } from "@/models"
import { Module } from "@/models/module.model"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function ContentManager() {
  const { user, isLoading: authLoading } = useAuth();
  const addModuleModal = useModal();
  const { toast } = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [modulesByCourse, setModulesByCourse] = useState<Record<number, Module[]>>({});
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set());
  const [loadingContent, setLoadingContent] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) {
      setLoading(false);
      return;
    }

    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await courseService.getCoursesByInstructorId(Number(user.id));
        setCourses(data || []);
      } catch (err: any) {
        console.error("Failed to load courses:", err);
        setError(err.message || "Failed to load courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [user, authLoading]);

  const loadCourseModules = async (courseId: number) => {
    if (loadingContent.has(courseId)) return;

    setLoadingContent(prev => new Set(prev).add(courseId));

    try {
      const modulesResponse = await moduleService.getModulesByCourse(courseId);
      let modules: Module[] = [];
      
      if (modulesResponse?.data) {
        modules = Array.isArray(modulesResponse.data) ? modulesResponse.data : [];
      } else if (Array.isArray(modulesResponse)) {
        modules = modulesResponse;
      }

      // S'assurer que les leçons sont bien présentes dans chaque module
      modules = modules.map((module: any) => ({
        ...module,
        lessons: module.lessons || []
      }));

      setModulesByCourse(prev => ({
        ...prev,
        [courseId]: modules
      }));

      // Ajouter le cours à la liste des cours expansés
      setExpandedCourses(prev => new Set(prev).add(courseId));
    } catch (err: any) {
      console.error(`Error loading modules for course ${courseId}:`, err);
      toast({
        title: "Erreur",
        description: "Impossible de charger les modules du cours.",
        variant: "destructive",
      });
    } finally {
      setLoadingContent(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
    }
  };

  const toggleCourse = (courseId: number) => {
    if (expandedCourses.has(courseId)) {
      // Fermer
      setExpandedCourses(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseId);
        return newSet;
      });
    } else {
      // Ouvrir et charger les modules si nécessaire
      if (!modulesByCourse[courseId]) {
        loadCourseModules(courseId);
      } else {
        setExpandedCourses(prev => new Set(prev).add(courseId));
      }
    }
  };

  const handleAddModule = async (data: ModuleFormData) => {
    try {
      console.log("[ContentManager] handleAddModule appelé avec:", data);
      
      // Récupérer le cours pour obtenir son niveau
      const selectedCourse = courses.find(c => c.id === data.courseId);
      const courseLevel = selectedCourse?.level || "DEBUTANT";
      
      const payload = {
        courseId: data.courseId,
        courseType: courseLevel.toUpperCase() as "DEBUTANT" | "INTERMEDIAIRE" | "AVANCE",
        modules: [
          {
            title: data.title,
            description: data.description || "",
            moduleOrder: data.moduleOrder,
            lessons: data.lessons.map(lesson => {
              const { contentFile, quizId, ...lessonPayload } = lesson;
              return {
                title: lessonPayload.title,
                lessonOrder: lessonPayload.lessonOrder,
                type: lessonPayload.type,
                ...(lessonPayload.contentUrl && lessonPayload.contentUrl.trim() && { contentUrl: lessonPayload.contentUrl }),
                ...(lessonPayload.duration && lessonPayload.duration > 0 && { duration: lessonPayload.duration }),
              };
            }),
          },
        ],
      };
      
      console.log("[ContentManager] Payload préparé:", JSON.stringify(payload, null, 2));
      console.log("[ContentManager] Appel de moduleService.saveModules...");
      
      const response = await moduleService.saveModules(payload);
      
      console.log("[ContentManager] Réponse reçue:", response);
      
      // Afficher le message de succès
      toast({
        title: "Succès",
        description: response.message || "Le module a été créé avec succès.",
      });
      
      // Recharger les modules du cours
      await loadCourseModules(data.courseId);
      
      addModuleModal.close();
      setError(null);
    } catch (err: any) {
      console.error("[ContentManager] Erreur lors de l'ajout du module:", err);
      console.error("[ContentManager] Stack trace:", err.stack);
      
      toast({
        title: "Erreur",
        description: err.message || "Impossible de créer le module.",
        variant: "destructive",
      });
      
      setError(err.message || "Failed to add module.");
    }
  };

  return (
    <>
      <PageHeader
        title="Gestion des Modules et Leçons"
        description="Créez et organisez les modules et leçons de vos formations"
        action={{
          label: "Ajouter un module",
          icon: <Upload className="h-4 w-4" />,
          onClick: addModuleModal.open,
        }}
      />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Mes Formations</CardTitle>
          <CardDescription>
            {courses.length === 1 
              ? `${courses.length} formation disponible`
              : `${courses.length} formations disponibles`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <PageLoader />
          ) : error ? (
            <div className="text-center text-destructive p-4">{error}</div>
          ) : courses.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="Aucune formation disponible"
              description="Veuillez d'abord créer une formation pour pouvoir y ajouter des modules."
            />
          ) : (
            <div className="space-y-4">
              {courses.map((course) => {
                const isExpanded = expandedCourses.has(course.id);
                const isLoading = loadingContent.has(course.id);
                const modules = modulesByCourse[course.id] || [];

                return (
                  <Card key={course.id} className="overflow-hidden">
                    <CardHeader 
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => toggleCourse(course.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <ChevronRight 
                            className={`h-5 w-5 text-muted-foreground transition-transform ${
                              isExpanded ? "rotate-90" : ""
                            }`}
                          />
                          <BookOpen className="h-5 w-5 text-primary" />
                          <div className="flex-1">
                            <CardTitle className="text-lg">{course.title}</CardTitle>
                            <CardDescription className="mt-1">
                              {course.subtitle || course.description?.substring(0, 100)}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {isLoading && (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                          {modules.length > 0 && (
                            <Badge variant="secondary">
                              {modules.length === 1
                                ? `${modules.length} module`
                                : `${modules.length} modules`}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    {isExpanded && (
                      <CardContent className="pt-0">
                        {isLoading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          </div>
                        ) : modules.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            Aucun module dans ce cours.
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {modules.map((module) => (
                              <Card key={module.id} className="border-l-4 border-l-primary">
                                <CardHeader className="pb-3">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <CardTitle className="text-base">{module.title}</CardTitle>
                                      {module.description && (
                                        <CardDescription className="mt-1">
                                          {module.description}
                                        </CardDescription>
                                      )}
                                    </div>
                                    <Badge variant="outline">
                                      Ordre: {module.moduleOrder}
                                    </Badge>
                                  </div>
                                </CardHeader>
                                {module.lessons && module.lessons.length > 0 && (
                                  <CardContent className="pt-0">
                                    <div className="space-y-2">
                                      <p className="text-sm font-medium text-muted-foreground mb-2">
                                        Leçons ({module.lessons.length})
                                      </p>
                                      {module.lessons.map((lesson: any, idx: number) => {
                                        const lessonIcon = {
                                          VIDEO: PlayCircle,
                                          DOCUMENT: File,
                                          QUIZ: HelpCircle,
                                          LAB: Code,
                                        }[lesson.type] || FileText;

                                        const Icon = lessonIcon || FileText;

                                        return (
                                          <div
                                            key={lesson.id || idx}
                                            className="flex items-center gap-3 p-2 rounded-md bg-muted/50"
                                          >
                                            <Icon className="h-4 w-4 text-muted-foreground" />
                                            <div className="flex-1">
                                              <p className="text-sm font-medium">{lesson.title}</p>
                                              {lesson.duration && (
                                                <p className="text-xs text-muted-foreground">
                                                  Durée: {lesson.duration} min
                                                </p>
                                              )}
                                            </div>
                                            <Badge variant="secondary" className="text-xs">
                                              {lesson.type}
                                            </Badge>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </CardContent>
                                )}
                              </Card>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <ModuleLessonFormModal
        open={addModuleModal.isOpen}
        onOpenChange={addModuleModal.close}
        title="Ajouter un nouveau module"
        description="Remplissez les informations pour créer un nouveau module dans votre formation."
        onSubmit={handleAddModule}
        submitLabel="Ajouter le module"
        courses={courses}
      />
    </>
  )
}
