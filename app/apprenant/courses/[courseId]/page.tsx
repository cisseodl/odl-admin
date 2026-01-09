// app/apprenant/courses/[courseId]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { courseService, moduleService, learnerService, reviewService } from "@/services"
import { Course, Module, Lesson } from "@/models"
import { PageLoader } from "@/components/ui/page-loader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal, BookOpen, Clock, CheckCircle, PlayCircle, FileText, FileQuestion } from "lucide-react"
import { useModal } from "@/hooks/use-modal"
import { CourseReviewModal, ReviewFormData } from "@/components/apprenant/course-review-modal"

interface LearnerLesson extends Lesson {
  isCompleted: boolean;
}

interface LearnerModule extends Module {
  lessons: LearnerLesson[];
}

export default function LearnerCourseDetailPage() {
  const params = useParams();
  const courseId = Number(params.courseId);

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<LearnerModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reviewModal = useModal();

  const fetchCourseData = async () => {
    setLoading(true);
    setError(null);
    try {
      const courseData = await courseService.getCourseById(courseId);
      setCourse(courseData);

      const modulesData = await moduleService.getModulesByCourseId(courseId);
      const progressionData = await learnerService.getCourseProgression(courseId);

      // Map lessons with progression status
      const learnerModules: LearnerModule[] = modulesData.map(module => ({
        ...module,
        lessons: module.lessons?.map(lesson => ({
          ...lesson,
          isCompleted: progressionData.some(p => p.lesson?.id === lesson.id && p.isCompleted)
        })) || []
      }));
      setModules(learnerModules);

    } catch (err: any) {
      setError(err.message || "Failed to fetch course data.");
      console.error("Error fetching course data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const handleLessonCompletion = async (lessonId: number, isCompleted: boolean) => {
    try {
      // Toggle completion status
      await learnerService.markLessonAsCompleted(courseId, lessonId);
      // Refresh data to reflect changes
      fetchCourseData();
    } catch (err: any) {
      setError(err.message || "Failed to update lesson completion status.");
      console.error("Error updating lesson completion:", err);
    }
  };

  const handleAddReview = async (data: ReviewFormData) => {
    if (!courseId) return;
    try {
      await reviewService.addCourseReview(courseId, data.rating, data.comment);
      reviewModal.close();
      // Optionally, show a success toast or re-fetch reviews
    } catch (err: any) {
      setError(err.message || "Failed to submit review.");
      console.error("Error submitting review:", err);
    }
  };


  if (loading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto py-8 text-center text-muted-foreground">
        Cours non trouvé.
      </div>
    );
  }

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
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
      <p className="text-xl text-muted-foreground mb-6">{course.subtitle}</p>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Description du cours
            <Button variant="outline" onClick={reviewModal.open}>Laisser un avis</Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{course.description}</p>
        </CardContent>
      </Card>

      <h2 className="text-3xl font-bold mb-6">Contenu du cours</h2>
      <Accordion type="multiple" className="w-full">
        {modules.map((moduleItem) => (
          <AccordionItem key={moduleItem.id} value={`module-${moduleItem.id}`}>
            <AccordionTrigger>
              <h3 className="text-lg font-semibold flex items-center gap-2">
                Module {moduleItem.moduleOrder}: {moduleItem.title}
              </h3>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 p-4">
                {moduleItem.lessons.length === 0 ? (
                  <p className="text-muted-foreground">Aucune leçon dans ce module.</p>
                ) : (
                  moduleItem.lessons.map(lesson => (
                    <Card key={lesson.id} className="flex items-center justify-between p-4">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id={`lesson-${lesson.id}`}
                          checked={lesson.isCompleted}
                          onCheckedChange={() => handleLessonCompletion(lesson.id, !lesson.isCompleted)}
                        />
                        <label
                          htmlFor={`lesson-${lesson.id}`}
                          className="flex items-center space-x-2 text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {getLessonIcon(lesson.type)}
                          <span>{lesson.lessonOrder}. {lesson.title}</span>
                        </label>
                      </div>
                      {lesson.type === "VIDEO" && lesson.duration && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-4 w-4" /> {(lesson.duration / 60).toFixed(0)} min
                        </div>
                      )}
                      {/* TODO: Add link to lesson content */}
                      <Button variant="outline" size="sm">Accéder</Button>
                    </Card>
                  ))
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <CourseReviewModal
        open={reviewModal.isOpen}
        onOpenChange={reviewModal.close}
        onSubmit={handleAddReview}
      />
    </div>
  );
}
