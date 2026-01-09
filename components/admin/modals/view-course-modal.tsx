"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Users, Clock, Star, BookOpen, PlayCircle, FileText, FileQuestion, Info } from "lucide-react"
import { Course, Module, Lesson } from "@/models" // Import Course, Module, Lesson models
import { moduleService } from "@/services" // Import moduleService
import { convertSecondsToDurationString } from "@/lib/utils" // Import utility for duration conversion
import { PageLoader } from "@/components/ui/page-loader"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

type ViewCourseModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: Course // Use the Course model directly
}

export function ViewCourseModal({ open, onOpenChange, course }: ViewCourseModalProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);
  const [errorModules, setErrorModules] = useState<string | null>(null);

  useEffect(() => {
    if (open && course?.id) {
      const fetchModules = async () => {
        setLoadingModules(true);
        setErrorModules(null);
        try {
          const fetchedModules = await moduleService.getModulesByCourseId(course.id);
          setModules(fetchedModules);
        } catch (err: any) {
          setErrorModules(err.message || "Failed to fetch modules.");
          console.error("Error fetching modules:", err);
        } finally {
          setLoadingModules(false);
        }
      };
      fetchModules();
    }
  }, [open, course?.id]);

  const getLessonIcon = (type: string | null | undefined) => {
    switch (type) {
      case "VIDEO":
        return <PlayCircle className="h-4 w-4 text-primary" />;
      case "DOCUMENT":
        return <FileText className="h-4 w-4 text-blue-500" />;
      case "QUIZ":
        return <FileQuestion className="h-4 w-4 text-green-500" />;
      default:
        return <BookOpen className="h-4 w-4 text-muted-foreground" />;
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{course.title}</DialogTitle>
          <p className="text-muted-foreground text-sm">{course.subtitle}</p>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={course.status === "PUBLISHED" ? "default" : course.status === "DRAFT" ? "secondary" : "outline"}
            >
              {course.status === "PUBLISHED" ? "Publié" : course.status === "DRAFT" ? "Brouillon" : "En révision"}
            </Badge>
            <Badge variant="outline">{course.categorie?.title || "N/A"}</Badge>
            <Badge variant="outline">{course.level}</Badge>
            <Badge variant="outline">{course.language}</Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Formateur</p>
              <p className="font-medium">{course.instructor?.fullName || "N/A"}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Catégorie</p>
              <p className="font-medium">{course.categorie?.title || "N/A"}</p>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Étudiants</p>
                <p className="font-bold">{course.students || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-[hsl(var(--warning))]" />
              <div>
                <p className="text-sm text-muted-foreground">Durée</p>
                <p className="font-bold">{convertSecondsToDurationString(course.duration || 0)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Note moyenne</p>
                <p className="font-bold">{course.rating && course.rating > 0 ? `${course.rating}/5` : "Pas encore noté"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Prix</p>
                <p className="font-bold">{course.price} €</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Description</p>
            <p className="text-sm">{course.description}</p>
          </div>
          
          {course.objectives && course.objectives.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Objectifs</p>
                <ul className="list-disc list-inside text-sm">
                  {course.objectives.map((obj, index) => (
                    <li key={index}>{obj}</li>
                  ))}
                </ul>
              </div>
            </>
          )}

          {course.features && course.features.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Fonctionnalités clés</p>
                <ul className="list-disc list-inside text-sm">
                  {course.features.map((feat, index) => (
                    <li key={index}>{feat}</li>
                  ))}
                </ul>
              </div>
            </>
          )}

          <Separator />

          <h3 className="text-xl font-semibold">Modules et Leçons</h3>
          {loadingModules ? (
            <PageLoader />
          ) : errorModules ? (
            <Alert variant="destructive">
              <Info className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{errorModules}</AlertDescription>
            </Alert>
          ) : modules.length === 0 ? (
            <p className="text-muted-foreground">Aucun module pour cette formation.</p>
          ) : (
            <Accordion type="multiple" className="w-full">
              {modules.map((moduleItem) => (
                <AccordionItem key={moduleItem.id} value={`module-${moduleItem.id}`}>
                  <AccordionTrigger>
                    <h4 className="text-lg font-semibold flex items-center gap-2">
                      Module {moduleItem.moduleOrder}: {moduleItem.title}
                    </h4>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 p-3 border-l-2 ml-2">
                      {moduleItem.lessons && moduleItem.lessons.length > 0 ? (
                        moduleItem.lessons.map(lesson => (
                          <div key={lesson.id} className="flex items-center space-x-2 text-sm">
                            {getLessonIcon(lesson.type)}
                            <span>{lesson.lessonOrder}. {lesson.title}</span>
                            {lesson.type === "VIDEO" && lesson.duration && (
                              <span className="text-muted-foreground">
                                ({convertSecondsToDurationString(lesson.duration)})
                              </span>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">Aucune leçon dans ce module.</p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
