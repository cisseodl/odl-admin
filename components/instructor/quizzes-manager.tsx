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
import { QuizFormModal, QuizFormData } from "./quiz-form-modal";
import { useAuth } from "@/contexts/auth-context";
import { courseService, quizService } from "@/services";
import { Course, Quiz as QuizModel } from "@/models";
import { PageLoader } from "@/components/ui/page-loader";
import { useToast } from "@/hooks/use-toast";


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
  const { user, isLoading: authLoading } = useAuth();
  const addQuizModal = useModal();
  const { toast } = useToast();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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


  const handleAddQuiz = async (data: QuizFormData) => {
    try {
      console.log("[QuizzesManager] handleAddQuiz appelé avec:", data);
      
      // Mapper les types de questions du frontend vers le backend
      // SINGLE_CHOICE ou MULTIPLE_CHOICE -> QCM
      // TEXTE reste TEXTE (mais le frontend n'utilise pas TEXTE actuellement)
      const mapQuestionType = (type: string): "QCM" | "TEXTE" => {
        if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
          return "QCM";
        }
        return "TEXTE";
      };
      
      const payload = {
        title: data.title,
        description: "", // Le backend attend un champ description même s'il est vide
        courseId: data.courseId,
        durationMinutes: data.durationMinutes,
        scoreMinimum: 80, // Fixé à 80% selon la règle métier du backend
        questions: data.questions.map(q => ({
          content: q.content,
          type: mapQuestionType(q.type), // Mapper le type du frontend vers le backend
          points: q.points,
          reponses: q.reponses.map(r => ({
            text: r.text,
            isCorrect: r.isCorrect
          }))
        }))
      };
      
      console.log("[QuizzesManager] Payload préparé:", JSON.stringify(payload, null, 2));
      
      const response = await quizService.createQuiz(payload);
      
      console.log("[QuizzesManager] Réponse reçue:", response);
      
      addQuizModal.close();
      toast({
        title: "Succès",
        description: response?.message || "Le quiz a été créé avec succès.",
      });
      // Re-fetch data after adding
      // This is a simplified approach; for optimization, we could just add the new quiz to the state
      window.location.reload(); 
    } catch (err: any) {
      console.error("[QuizzesManager] Erreur lors de la création du quiz:", err);
      console.error("[QuizzesManager] Message d'erreur:", err.message);
      console.error("[QuizzesManager] Stack:", err.stack);
      
      toast({
        title: "Erreur",
        description: err.message || "Impossible de créer le quiz.",
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
          onClick: addQuizModal.open,
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
        title="Créer un nouveau quiz"
        description="Remplissez les informations pour créer un nouveau quiz."
        onSubmit={handleAddQuiz}
        submitLabel="Créer le quiz"
        courses={courses}
      />
    </>
  )
}
