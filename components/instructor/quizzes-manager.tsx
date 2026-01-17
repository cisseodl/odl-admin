"use client"

import { useState, useMemo, useEffect } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { SearchBar } from "@/components/ui/search-bar"
import { DataTable } from "@/components/ui/data-table"
import { ActionMenu } from "@/components/ui/action-menu"
import { StatusBadge } from "@/components/ui/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { useSearch } from "@/hooks/use-search"
import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Edit, Trash2, FileQuestion, BookOpen, FileText, Users, TrendingUp, Calendar } from "lucide-react"

import { useModal } from "@/hooks/use-modal";
import { QuizFormModal, QuizFormData, QuestionType } from "./quiz-form-modal";
import { useAuth } from "@/contexts/auth-context";
import { courseService, quizService } from "@/services";
import { Course, Quiz as QuizModel } from "@/models";
import { PageLoader } from "@/components/ui/page-loader";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useLanguage } from "@/contexts/language-context";


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
  const { t } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const addQuizModal = useModal();
  const editQuizModal = useModal<Quiz>();
  const deleteQuizModal = useModal<Quiz>();
  const { toast } = useToast();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizDetails, setQuizDetails] = useState<Map<number, any>>(new Map());
  const [editQuizFormData, setEditQuizFormData] = useState<Partial<QuizFormData> | null>(null);
  const [loadingQuizDetails, setLoadingQuizDetails] = useState(false);

  useEffect(() => {
    if (authLoading || !user) {
      setLoading(false);
      return;
    }

    const fetchInitialData = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Fetch courses
        const instructorCourses = await courseService.getCoursesByInstructorId(Number(user.id));
        // Le service retourne déjà un tableau Course[]
        if (Array.isArray(instructorCourses)) {
          setCourses(instructorCourses);
        } else {
          console.error("Unexpected courses response structure:", instructorCourses);
          setCourses([]);
        }

        // 2. Fetch quizzes for all courses in parallel
        if (instructorCourses.length > 0) {
          const quizPromises = instructorCourses.map(course => 
            quizService.getQuizzesByCourseId(course.id)
          );
          const quizzesByCourse = await Promise.all(quizPromises);
          
          // 3. Flatten the results and map to display format
          const allQuizzes = quizzesByCourse.flat().map((q: QuizModel, index) => {
            const courseTitle = instructorCourses.find(c => c.id === q.courseId)?.title || "N/A";
            return {
              id: q.id,
              title: q.title || "Quiz sans titre",
              course: courseTitle,
              module: "N/A", // Module info not available in QuizModel
              questions: Array.isArray(q.questions) ? q.questions.length : 0,
              type: "Quiz", // Assuming all are Quizzes for now
              attempts: 0, // Placeholder
              averageScore: 0, // Placeholder
              status: "Actif", // Placeholder, status not in model
              createdAt: q.createdAt ? new Date(q.createdAt).toLocaleDateString("fr-FR") : "",
            };
          });
          setQuizzes(allQuizzes);
        }
      } catch (err: any) {
        console.error("Failed to load initial data:", err);
        setError(err.message || "Failed to load data.");
        toast({
          title: "Erreur",
          description: "Impossible de charger les données.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [user, authLoading, toast]);


  // Mapper les types de questions du frontend vers le backend
  const mapQuestionType = (type: string): "QCM" | "TEXTE" => {
    if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
      return "QCM";
    }
    return "TEXTE";
  };

  // Mapper les types du backend vers le frontend
  const mapQuestionTypeFromBackend = (type: string): QuestionType => {
    if (type === "QCM") {
      // Par défaut, on considère QCM comme SINGLE_CHOICE
      // On pourrait améliorer cela en vérifiant le nombre de réponses correctes
      return QuestionType.SINGLE_CHOICE;
    }
    return QuestionType.SINGLE_CHOICE;
  };

  const fetchQuizDetails = async (quizId: number) => {
    if (quizDetails.has(quizId)) {
      return quizDetails.get(quizId);
    }
    try {
      const response = await quizService.getQuizById(quizId);
      const details = response.data || response;
      setQuizDetails(prev => new Map(prev).set(quizId, details));
      return details;
    } catch (err) {
      console.error("Error fetching quiz details:", err);
      return null;
    }
  };

  useEffect(() => {
    const loadQuizForEdit = async () => {
      if (editQuizModal.isOpen && editQuizModal.selectedItem) {
        setLoadingQuizDetails(true);
        try {
          const quiz = editQuizModal.selectedItem;
          const details = await fetchQuizDetails(quiz.id);
          if (details) {
            const formData: Partial<QuizFormData> = {
              title: details.title || quiz.title,
              courseId: details.courseId || courses.find(c => c.title === quiz.course)?.id,
              durationMinutes: details.durationMinutes || 30,
              scoreMinimum: 80,
              questions: details.questions?.map((q: any) => ({
                content: q.content || "",
                type: mapQuestionTypeFromBackend(q.type || "QCM"),
                points: q.points || 1,
                reponses: q.reponses?.map((r: any) => ({
                  text: r.text || "",
                  isCorrect: r.isCorrect || false,
                })) || [{ text: "", isCorrect: false }, { text: "", isCorrect: false }],
              })) || [],
            };
            setEditQuizFormData(formData);
          }
        } catch (err) {
          console.error("Error loading quiz for edit:", err);
          toast({
            title: "Erreur",
            description: "Impossible de charger les détails du quiz.",
            variant: "destructive",
          });
        } finally {
          setLoadingQuizDetails(false);
        }
      } else {
        setEditQuizFormData(null);
      }
    };
    loadQuizForEdit();
  }, [editQuizModal.isOpen, editQuizModal.selectedItem, courses, toast]);

  const handleAddQuiz = async (data: QuizFormData) => {
    try {
      const payload = {
        title: data.title,
        description: "",
        courseId: data.courseId,
        durationMinutes: data.durationMinutes,
        scoreMinimum: 80,
        questions: data.questions.map(q => ({
          content: q.content,
          type: mapQuestionType(q.type),
          points: q.points,
          reponses: q.reponses.map(r => ({
            text: r.text,
            isCorrect: r.isCorrect
          }))
        }))
      };
      
      const response = await quizService.createQuiz(payload);
      
      addQuizModal.close();
      toast({
        title: "Succès",
        description: response?.message || "Le quiz a été créé avec succès.",
      });
      window.location.reload(); 
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Impossible de créer le quiz.",
        variant: "destructive",
      });
    }
  };

  const handleEditQuiz = async (data: QuizFormData) => {
    if (!editQuizModal.selectedItem) return;
    
    try {
      const quizId = editQuizModal.selectedItem.id;
      const payload = {
        title: data.title,
        description: "",
        courseId: data.courseId,
        durationMinutes: data.durationMinutes,
        scoreMinimum: 80,
        questions: data.questions.map(q => ({
          content: q.content,
          type: mapQuestionType(q.type),
          points: q.points,
          reponses: q.reponses.map(r => ({
            text: r.text,
            isCorrect: r.isCorrect
          }))
        }))
      };
      
      const response = await quizService.updateQuiz(quizId, payload);
      
      editQuizModal.close();
      toast({
        title: "Succès",
        description: response?.message || "Le quiz a été modifié avec succès.",
      });
      window.location.reload();
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Impossible de modifier le quiz.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuiz = async () => {
    if (!deleteQuizModal.selectedItem) return;
    
    try {
      const quizId = deleteQuizModal.selectedItem.id;
      await quizService.deleteQuiz(quizId);
      
      deleteQuizModal.close();
      toast({
        title: "Succès",
        description: "Le quiz a été supprimé avec succès.",
      });
      setQuizzes(prev => prev.filter(q => q.id !== quizId));
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Impossible de supprimer le quiz.",
        variant: "destructive",
      });
    }
  };


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
                  label: "Modifier",
                  icon: <Edit className="h-4 w-4" />,
                  onClick: async () => {
                    const details = await fetchQuizDetails(quiz.id);
                    if (details) {
                      editQuizModal.open(quiz);
                    } else {
                      toast({
                        title: "Erreur",
                        description: "Impossible de charger les détails du quiz.",
                        variant: "destructive",
                      });
                    }
                  },
                },
                {
                  label: "Supprimer",
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: () => deleteQuizModal.open(quiz),
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
          onClick: addQuizModal.open,
        }}
      />

      <Card className="mt-6">
        <CardContent>
          <div className="mb-4">
            <SearchBar
              placeholder={t('instructor.quizzes.list.search_placeholder') || "Rechercher un quiz..."}
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
          {loading ? ( // Use loading for overall loading state here
            <PageLoader />
          ) : error ? (
            <div className="text-center text-destructive p-4">{error}</div>
          ) : (
            <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
          )}
        </CardContent>
      </Card>
      <QuizFormModal
        open={addQuizModal.isOpen}
        onOpenChange={addQuizModal.close}
        title={t('instructor.quizzes.modals.create_title') || "Créer un nouveau quiz"}
        description={t('instructor.quizzes.modals.create_description') || "Remplissez les informations pour créer un nouveau quiz."}
        onSubmit={handleAddQuiz}
        submitLabel={t('instructor.quizzes.modals.create_submit') || "Créer le quiz"}
        courses={courses}
      />

      {editQuizModal.isOpen && editQuizFormData && !loadingQuizDetails && (
        <QuizFormModal
          open={editQuizModal.isOpen}
          onOpenChange={editQuizModal.close}
          title={t('instructor.quizzes.modals.edit_title') || "Modifier le quiz"}
          description={t('instructor.quizzes.modals.edit_description') || "Modifiez les informations du quiz."}
          onSubmit={handleEditQuiz}
          submitLabel={t('instructor.quizzes.modals.edit_submit') || "Modifier le quiz"}
          courses={courses}
          defaultValues={editQuizFormData}
        />
      )}

      <ConfirmDialog
        open={deleteQuizModal.isOpen}
        onOpenChange={deleteQuizModal.close}
        title={t('instructor.quizzes.modals.delete_title') || "Supprimer le quiz"}
        description={t('instructor.quizzes.modals.delete_description', { title: deleteQuizModal.selectedItem?.title }) || `Êtes-vous sûr de vouloir supprimer le quiz "${deleteQuizModal.selectedItem?.title}" ? Cette action est irréversible.`}
        confirmLabel={t('common.delete') || "Supprimer"}
        cancelLabel={t('common.cancel') || "Annuler"}
        onConfirm={handleDeleteQuiz}
        variant="destructive"
      />
    </>
  )
}
