// components/admin/moderation/moderation-list.tsx
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ActionMenu } from "@/components/ui/action-menu";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PageLoader } from "@/components/ui/page-loader";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CourseFormModal, CourseFormData } from "@/components/shared/course-form-modal";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, X, Edit, Eye, BookOpen, User, Tag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { courseService, categorieService } from "@/services";
import { Course as CourseModel, Categorie } from "@/models";
import { StatusBadge } from "@/components/ui/status-badge";
import { useModal } from "@/hooks/use-modal";

type CourseForModeration = CourseModel;

export function ModerationList() {
  const { toast } = useToast();
  const [courses, setCourses] = useState<CourseForModeration[]>([]);
  const [categories, setCategories] = useState<Categorie[]>([]);
  const [loading, setLoading] = useState(true);

  const editModal = useModal<CourseForModeration>();
  const [validateDialog, setValidateDialog] = useState<{ isOpen: boolean; courseId?: number }>({ isOpen: false });
  const [rejectDialog, setRejectDialog] = useState<{ isOpen: boolean; courseId?: number; reason?: string }>({ isOpen: false });
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchModerationCourses = useCallback(async () => {
    setLoading(true);
    try {
      // Récupérer les catégories
      const categoriesResponse = await categorieService.getAllCategories();
      if (categoriesResponse && Array.isArray(categoriesResponse.data)) {
        setCategories(categoriesResponse.data);
      } else {
        setCategories([]);
      }

      const response = await courseService.getAllCourses({ status: 'IN_REVIEW' });
      // Le backend retourne CResponse avec structure { ok, data, message }
      // ou directement un tableau si getAllCourses retourne data
      const coursesData = Array.isArray(response) ? response : (response?.data || []);
      if (Array.isArray(coursesData)) {
        setCourses(coursesData);
      } else {
        console.error("Unexpected response structure:", response);
        setCourses([]);
        toast({
          title: "Erreur de données",
          description: "La réponse de l'API pour les cours en attente est inattendue.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Failed to fetch courses for moderation:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger les cours à modérer.",
        variant: "destructive",
      });
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchModerationCourses();
  }, [fetchModerationCourses]);

  const handleUpdateCourse = async (data: CourseFormData) => {
    if (!editModal.selectedItem) return;
    try {
      await courseService.updateCourse(editModal.selectedItem.id, data, data.imageFile);
      toast({
        title: "Succès",
        description: "La formation a été mise à jour.",
      });
      fetchModerationCourses(); // Refresh list
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la formation.",
        variant: "destructive",
      });
    } finally {
      editModal.close();
    }
  };

  const handleValidation = async (courseId: number, action: "APPROVE" | "REJECT", reason?: string) => {
    try {
      await courseService.validateCourse(courseId, action, reason);
      toast({
        title: "Succès",
        description: `La formation a été ${action === "APPROVE" ? "approuvée" : "rejetée"} avec succès.`,
      });
      await fetchModerationCourses();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue lors de la modération.",
        variant: "destructive",
      });
    } finally {
      setValidateDialog({ isOpen: false });
      setRejectDialog({ isOpen: false, reason: undefined });
      setRejectionReason("");
    }
  };

  const columns: ColumnDef<CourseForModeration>[] = useMemo(
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
        accessorKey: "instructor.fullName",
        header: "Instructeur",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                {row.original.instructor?.fullName || "N/A"}
            </div>
        ),
      },
      {
        accessorKey: "categorie.title",
        header: "Catégorie",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {row.original.categorie?.title || "N/A"}
            </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Statut Actuel",
        cell: ({ row }) => <StatusBadge status={"En révision"} />,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const course = row.original;
          return (
            <ActionMenu
              actions={[
                {
                  label: "Approuver",
                  icon: <Check className="h-4 w-4" />,
                  onClick: () => setValidateDialog({ isOpen: true, courseId: course.id }),
                },
                {
                  label: "Modifier",
                  icon: <Edit className="h-4 w-4" />,
                  onClick: () => editModal.open(course),
                },
                {
                  label: "Rejeter",
                  icon: <X className="h-4 w-4" />,
                  onClick: () => setRejectDialog({ isOpen: true, courseId: course.id }),
                  variant: "destructive",
                },
              ]}
            />
          );
        },
      },
    ],
    [editModal]
  );

  return (
    <>
      <PageHeader
        title="Modération des Formations"
        description="Approuvez ou rejetez les formations en attente de validation."
      />

      <Card className="mt-6">
        <CardContent>
          {loading ? (
            <PageLoader />
          ) : (
            <DataTable columns={columns} data={courses} />
          )}
        </CardContent>
      </Card>

      {editModal.selectedItem && (
        <CourseFormModal
          open={editModal.isOpen}
          onOpenChange={(open) => !open && editModal.close()}
          title="Modifier la formation"
          description="Modifiez les informations de la formation avant validation"
          defaultValues={editModal.selectedItem}
          onSubmit={handleUpdateCourse}
          submitLabel="Enregistrer les modifications"
          categories={categories || []}
        />
      )}

      <ConfirmDialog
        open={validateDialog.isOpen}
        onOpenChange={(isOpen) => setValidateDialog({ isOpen, courseId: validateDialog.courseId })}
        onConfirm={() => handleValidation(validateDialog.courseId!, "APPROVE")}
        title="Approuver la formation"
        description="Êtes-vous sûr de vouloir approuver cette formation ? Elle deviendra visible pour les utilisateurs."
        confirmText="Approuver"
      />

      {/* Dialog de rejet avec champ de raison */}
      <Dialog
        open={rejectDialog.isOpen}
        onOpenChange={(isOpen) => {
          setRejectDialog({ isOpen, courseId: rejectDialog.courseId });
          if (!isOpen) {
            setRejectionReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la formation</DialogTitle>
            <DialogDescription>
              Veuillez indiquer la raison du rejet. L'instructeur en sera notifié.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Raison du rejet *</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Ex: Contenu incomplet, qualité insuffisante, non conforme aux standards..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialog({ isOpen: false });
                setRejectionReason("");
              }}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (rejectionReason.trim()) {
                  handleValidation(rejectDialog.courseId!, "REJECT", rejectionReason.trim());
                } else {
                  toast({
                    title: "Erreur",
                    description: "Veuillez indiquer une raison pour le rejet.",
                    variant: "destructive",
                  });
                }
              }}
              disabled={!rejectionReason.trim()}
            >
              Rejeter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
