"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { ActionMenu } from "@/components/ui/action-menu"
import { StatusBadge } from "@/components/ui/status-badge"
import { SearchBar } from "@/components/ui/search-bar"
import { useSearch } from "@/hooks/use-search"
import { Eye, CheckCircle2, XCircle, BookOpen, MessageSquare, AlertCircle, Edit } from "lucide-react"
import type { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { auditService, courseService, categorieService } from "@/services"; // Import services
import { Course, Categorie } from "@/models"; // Import Course and Categorie models
import { PageLoader } from "@/components/ui/page-loader"; // Import PageLoader
import { CourseFormModal } from "@/components/shared/course-form-modal"; // Import CourseFormModal
import { CourseFormData } from "@/lib/validations/course";
import { convertDurationToSeconds, convertSecondsToDurationString } from "@/lib/utils";


// Type pour les éléments de cours dans la file de modération
type CourseItem = {
  id: number
  title: string
  instructor: string
  category: string
  submittedAt: string // Formaté
  status: "En attente" | "Approuvé" | "Rejeté" | "Modifications demandées"
  priority?: "high" | "medium" | "low"
  modules: number
  duration: string // Formaté
  rejectionReason?: string
  // Champs supplémentaires pour l'édition via CourseFormModal
  subtitle?: string;
  description?: string;
  imagePath?: string;
  level?: string;
  language?: string;
  bestseller?: boolean;
  objectives?: string[];
  features?: string[];
  price?: number;
  categoryId?: number;
  instructorId?: number;
  activate?: boolean;
}

// Helper function to map CourseModel to CourseItem
const mapCourseModelToCourseItem = (course: Course): CourseItem => {
  return {
    id: course.id || 0,
    title: course.title || "",
    instructor: course.instructor?.fullName || course.instructor?.email || "N/A",
    category: course.categorie?.title || "N/A",
    submittedAt: course.createdAt ? new Date(course.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "N/A",
    status: course.status === "PENDING" ? "En attente" :
            (course.status === "APPROVED" ? "Approuvé" :
            (course.status === "REJECTED" ? "Rejeté" : "Modifications demandées")), // Assumer ces statuts
    modules: course.modules?.length || 0,
    duration: course.duration ? convertSecondsToDurationString(course.duration) : "N/A",
    // Pour l'édition:
    subtitle: course.subtitle || "",
    description: course.description || "",
    imagePath: course.imagePath || undefined,
    level: course.level || "N/A",
    language: course.language || "N/A",
    bestseller: course.bestseller || false,
    objectives: course.objectives || [],
    features: course.features || [],
    price: course.price || 0,
    categoryId: course.categorie?.id || 0,
    instructorId: course.instructor?.id || 0,
    activate: course.activate || false,
  };
};

// Helper to map CourseItem to CourseFormData for CourseFormModal defaultValues
const mapCourseItemToCourseFormData = (item: CourseItem): CourseFormData => {
  return {
    title: item.title,
    subtitle: item.subtitle,
    description: item.description,
    duration: item.duration, // Already formatted string
    level: item.level as "Beginner" | "Intermediate" | "Advanced",
    language: item.language as "Français" | "Anglais" | "Espagnol" | "Allemand",
    bestseller: item.bestseller,
    objectives: Array.isArray(item.objectives) ? item.objectives.join('\n') : "",
    features: Array.isArray(item.features) ? item.features.join('\n') : "",
    status: item.activate ? "Publié" : "Brouillon", // Map activate to Publié/Brouillon for form
    price: item.price,
    categoryId: item.categoryId || 0,
    instructorId: item.instructorId || 0,
  };
};


export function CourseModerationQueue() {
  const [courses, setCourses] = useState<CourseItem[]>([])
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showRequestChangesModal, setShowRequestChangesModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [requestChangesComment, setRequestChangesComment] = useState("")

  useEffect(() => {
    const fetchPendingCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        // Récupérer les catégories
        const categoriesResponse = await categorieService.getAllCategories();
        if (categoriesResponse && Array.isArray(categoriesResponse.data)) {
          setCategories(categoriesResponse.data);
        } else {
          setCategories([]);
        }

        const pendingCourses = await auditService.getPendingCoursesForModeration();
        setCourses(pendingCourses.map(mapCourseModelToCourseItem));
      } catch (err: any) {
        setError(err.message || "Failed to fetch pending courses.");
        console.error("Error fetching pending courses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPendingCourses();
  }, []);


  const { searchQuery, setSearchQuery, filteredData } = useSearch<CourseItem>({
    data: courses,
    searchKeys: ["title", "instructor", "category"],
  })

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/20 text-destructive dark:bg-destructive/30 dark:text-destructive"
      case "medium":
        return "bg-[hsl(var(--warning))]/20 text-[hsl(var(--warning))] dark:bg-[hsl(var(--warning))]/30 dark:text-[hsl(var(--warning))]"
      case "low":
        return "bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary"
      default:
        return ""
    }
  }

  const handleApproveCourse = async () => {
    setError(null);
    if (selectedCourse) {
      try {
        await auditService.approveCourse(selectedCourse.id);
        setCourses(courses.filter(item => item.id !== selectedCourse.id)); // Remove from list
        setShowApproveModal(false);
        setSelectedCourse(null);
      } catch (err: any) {
        setError(err.message || "Failed to approve course.");
        console.error("Error approving course:", err);
      }
    }
  };

  const handleRejectCourse = async () => {
    setError(null);
    if (selectedCourse && rejectionReason.trim()) {
      try {
        await auditService.rejectCourse(selectedCourse.id, rejectionReason);
        setCourses(courses.filter(item => item.id !== selectedCourse.id)); // Remove from list
        setShowRejectModal(false);
        setRejectionReason("");
        setSelectedCourse(null);
      } catch (err: any) {
        setError(err.message || "Failed to reject course.");
        console.error("Error rejecting course:", err);
      }
    }
  };

  const handleRequestChangesCourse = async () => {
    setError(null);
    if (selectedCourse && requestChangesComment.trim()) {
      try {
        await auditService.requestChangesCourse(selectedCourse.id, requestChangesComment);
        setCourses(courses.filter(item => item.id !== selectedCourse.id)); // Remove from list
        setShowRequestChangesModal(false);
        setRequestChangesComment("");
        setSelectedCourse(null);
      } catch (err: any) {
        setError(err.message || "Failed to request changes for course.");
        console.error("Error requesting changes for course:", err);
      }
    }
  };

  const handleSaveEdit = async (data: CourseFormData & { imageFile?: File | null }) => {
    setError(null);
    if (selectedCourse) {
      try {
        const updatedCourseData: Partial<Course> = {
          title: data.title,
          subtitle: data.subtitle,
          description: data.description,
          duration: convertDurationToSeconds(data.duration),
          level: data.level,
          language: data.language,
          bestseller: data.bestseller,
          objectives: Array.isArray(data.objectives) ? data.objectives : (data.objectives ? data.objectives.split('\n').filter(s => s.trim() !== '') : []),
          features: Array.isArray(data.features) ? data.features : (data.features ? data.features.split('\n').filter(s => s.trim() !== '') : []),
          price: data.price,
          status: data.status === "Publié" ? "PUBLISHED" : (data.status === "Brouillon" ? "DRAFT" : "IN_REVIEW"),
          activate: data.status === "Publié" ? true : false,
          categorie: data.categoryId ? { id: data.categoryId } : undefined,
          instructor: data.instructorId ? { id: data.instructorId } : undefined,
        };
        const updatedCourse = await courseService.updateCourse(selectedCourse.id, updatedCourseData, data.imageFile);
        // Après modification, la remettre en attente ou rafraîchir la liste
        setCourses((prev) => 
          prev.map((item) => item.id === selectedCourse.id ? mapCourseModelToCourseItem(updatedCourse as Course) : item)
        );
        setShowEditModal(false);
        setSelectedCourse(null);
      } catch (err: any) {
        setError(err.message || "Failed to update course.");
        console.error("Error updating course:", err);
      }
    }
  };

  const columns: ColumnDef<CourseItem>[] = [
    {
      accessorKey: "title",
      header: "Formation",
      cell: ({ row }) => {
        const item = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium flex items-center gap-2">
                {item.title}
                {item.priority && (
                  <Badge className={`text-xs ${getPriorityColor(item.priority)}`}>
                    {item.priority === "high" ? "Haute" : item.priority === "medium" ? "Moyenne" : "Basse"}
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">{item.category}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "instructor",
      header: "Instructeur",
    },
    {
      accessorKey: "modules",
      header: "Modules",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          {row.original.modules}
        </div>
      ),
    },
    {
      accessorKey: "duration",
      header: "Durée",
    },
    {
      accessorKey: "submittedAt",
      header: "Soumis le",
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
        const item = row.original
        if (item.status !== "En attente") return null

        return (
          <ActionMenu
            actions={[
              {
                label: "Modifier",
                icon: <Edit className="h-4 w-4" />,
                onClick: () => { setSelectedCourse(item); setShowEditModal(true); },
              },
              {
                label: "Valider",
                icon: <CheckCircle2 className="h-4 w-4" />,
                onClick: () => { setSelectedCourse(item); setShowApproveModal(true); },
              },
              {
                label: "Demander modifications",
                icon: <MessageSquare className="h-4 w-4" />,
                onClick: () => { setSelectedCourse(item); setShowRequestChangesModal(true); },
              },
              {
                label: "Rejeter",
                icon: <XCircle className="h-4 w-4" />,
                onClick: () => { setSelectedCourse(item); setShowRejectModal(true); },
                variant: "destructive",
              },
            ]}
          />
        )
      },
    },
  ]

  return (
    <>
      {loading ? (
        <PageLoader />
      ) : error ? (
        <div className="text-center text-destructive p-4">{error}</div>
      ) : filteredData.length === 0 ? (
        <div className="text-center text-muted-foreground p-4">Aucun cours en attente de modération.</div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4">
              <SearchBar placeholder="Rechercher un cours..." value={searchQuery} onChange={setSearchQuery} />
            </div>
            <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
          </CardContent>
        </Card>
      )}

      {/* Modal Modifier (Edit Course) */}
      {selectedCourse && (
        <CourseFormModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          title="Modifier la formation"
          description={`Modifiez les détails de la formation "${selectedCourse.title}"`}
          defaultValues={mapCourseItemToCourseFormData(selectedCourse)}
          onSubmit={handleSaveEdit}
          submitLabel="Enregistrer les modifications"
          categories={categories || []}
        />
      )}

      {/* Modal Valider (Approve Course) */}
      <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Valider la formation</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir valider la formation "{selectedCourse?.title}" ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveModal(false)}>Annuler</Button>
            <Button onClick={handleApproveCourse}>Valider</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Rejeter (Reject Course) */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la formation</DialogTitle>
            <DialogDescription>
              Veuillez indiquer la raison pour laquelle vous rejetez la formation "{selectedCourse?.title}".
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Raison du rejet..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>Annuler</Button>
            <Button variant="destructive" onClick={handleRejectCourse} disabled={!rejectionReason.trim()}>
              Rejeter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Demander modifications (Request Changes) */}
      <Dialog open={showRequestChangesModal} onOpenChange={setShowRequestChangesModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demander des modifications</DialogTitle>
            <DialogDescription>
              Indiquez les modifications nécessaires pour la formation "{selectedCourse?.title}"
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Décrivez les modifications à apporter..."
            value={requestChangesComment}
            onChange={(e) => setRequestChangesComment(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestChangesModal(false)}>
              Annuler
            </Button>
            <Button onClick={handleRequestChangesCourse} disabled={!requestChangesComment.trim()}>
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}