// components/instructor/instructor-moderation-list.tsx
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/language-context";
import { DataTable } from "@/components/ui/data-table";
import { ActionMenu } from "@/components/ui/action-menu";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { PageLoader } from "@/components/ui/page-loader";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CourseFormModal, CourseFormData } from "@/components/shared/course-form-modal";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, X, Edit, BookOpen, Tag } from "lucide-react";
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
import { useAuth } from "@/contexts/auth-context";

type CourseForModeration = CourseModel;

export function InstructorModerationList() {
  const { t } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState<CourseForModeration[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Categorie[]>([]);

  const editModal = useModal<CourseForModeration>();
  const [validateDialog, setValidateDialog] = useState<{ isOpen: boolean; courseId?: number }>({ isOpen: false });
  const [rejectDialog, setRejectDialog] = useState<{ isOpen: boolean; courseId?: number; reason?: string }>({ isOpen: false });
  const [rejectionReason, setRejectionReason] = useState("");

  const fetchModerationCourses = useCallback(async () => {
    if (authLoading || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Récupérer les catégories
      const categoriesResponse = await categorieService.getAllCategories();
      if (Array.isArray(categoriesResponse)) {
        setCategories(categoriesResponse);
      } else if (categoriesResponse && Array.isArray(categoriesResponse.data)) {
        setCategories(categoriesResponse.data);
      } else {
        setCategories([]);
      }

      // Récupérer tous les cours de l'instructeur, puis filtrer ceux en attente
      const allCourses = await courseService.getCoursesByInstructorId(Number(user.id));
      const coursesInReview = Array.isArray(allCourses) 
        ? allCourses.filter((c: any) => c.status === 'IN_REVIEW' || c.status === 'BROUILLON')
        : [];
      setCourses(coursesInReview);
    } catch (error: any) {
      console.error("Failed to fetch courses for moderation:", error);
      toast({
        title: t('common.error'),
        description: error.message || t('instructor.moderation.toasts.error_load'),
        variant: "destructive",
      });
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [toast, user, authLoading, t]);

  useEffect(() => {
    fetchModerationCourses();
  }, [fetchModerationCourses]);

  const handleUpdateCourse = async (data: CourseFormData) => {
    if (!editModal.selectedItem) return;
    try {
      await courseService.updateCourse(editModal.selectedItem.id, data, data.imageFile);
      toast({
        title: t('common.success'),
        description: t('instructor.moderation.toasts.success_update'),
      });
      fetchModerationCourses();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('instructor.moderation.toasts.error_update'),
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
        title: t('common.success'),
        description: action === "APPROVE" 
          ? t('instructor.moderation.toasts.success_approve') 
          : t('instructor.moderation.toasts.success_reject'),
      });
      await fetchModerationCourses();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('instructor.moderation.toasts.error_moderation'),
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
        header: t('instructor.moderation.list.header_course'),
        cell: ({ row }) => (
          <div className="font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            {row.original.title}
          </div>
        ),
      },
      {
        accessorKey: "categorie.title",
        header: t('instructor.moderation.list.header_category'),
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {row.original.categorie?.title || t('common.notAvailable')}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: t('instructor.moderation.list.header_status'),
        cell: ({ row }) => {
          const status = row.original.status;
          const statusText = status === 'IN_REVIEW' 
            ? t('instructor.moderation.list.status_review') 
            : status === 'BROUILLON' 
            ? t('instructor.moderation.list.status_draft') 
            : status || t('common.notAvailable');
          return <StatusBadge status={statusText} />;
        },
      },
      {
        id: "actions",
        header: t('instructor.moderation.list.header_actions'),
        cell: ({ row }) => {
          const course = row.original;
          return (
            <ActionMenu
              actions={[
                {
                  label: t('instructor.moderation.list.action_approve'),
                  icon: <Check className="h-4 w-4" />,
                  onClick: () => setValidateDialog({ isOpen: true, courseId: course.id }),
                },
                {
                  label: t('instructor.moderation.list.action_edit'),
                  icon: <Edit className="h-4 w-4" />,
                  onClick: () => editModal.open(course),
                },
                {
                  label: t('instructor.moderation.list.action_reject'),
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
    [editModal, t]
  );

  return (
    <>
      <PageHeader
        title={t('instructor.moderation.title')}
        description={t('instructor.moderation.description')}
      />

      <Card className="mt-6">
        <CardContent>
          {loading ? (
            <PageLoader />
          ) : courses.length === 0 ? (
            <div className="text-center text-muted-foreground p-8">
              {t('instructor.moderation.list.empty_message')}
            </div>
          ) : (
            <DataTable columns={columns} data={courses} />
          )}
        </CardContent>
      </Card>

      {editModal.selectedItem && (
        <CourseFormModal
          open={editModal.isOpen}
          onOpenChange={(open) => !open && editModal.close()}
          title={t('instructor.moderation.modals.edit_title')}
          description={t('instructor.moderation.modals.edit_description')}
          defaultValues={editModal.selectedItem}
          onSubmit={handleUpdateCourse}
          submitLabel={t('instructor.moderation.modals.edit_submit')}
          categories={categories || []}
        />
      )}

      <ConfirmDialog
        open={validateDialog.isOpen}
        onOpenChange={(isOpen) => setValidateDialog({ isOpen, courseId: validateDialog.courseId })}
        onConfirm={() => handleValidation(validateDialog.courseId!, "APPROVE")}
        title={t('instructor.moderation.modals.approve_title')}
        description={t('instructor.moderation.modals.approve_description')}
        confirmText={t('instructor.moderation.modals.approve_confirm')}
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
            <DialogTitle>{t('instructor.moderation.modals.reject_title')}</DialogTitle>
            <DialogDescription>
              {t('instructor.moderation.modals.reject_description')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">{t('instructor.moderation.modals.reject_reason_label')}</Label>
              <Textarea
                id="rejection-reason"
                placeholder={t('instructor.moderation.modals.reject_reason_placeholder')}
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
              {t('instructor.moderation.modals.reject_cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (rejectionReason.trim()) {
                  handleValidation(rejectDialog.courseId!, "REJECT", rejectionReason.trim());
                } else {
                  toast({
                    title: t('common.error'),
                    description: t('instructor.moderation.modals.reject_error'),
                    variant: "destructive",
                  });
                }
              }}
              disabled={!rejectionReason.trim()}
            >
              {t('instructor.moderation.modals.reject_confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
