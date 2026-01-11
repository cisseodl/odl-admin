// components/admin/moderation/moderation-list.tsx
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/language-context"
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
  const { t } = useLanguage()
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
          title: t('common.error'),
          description: t('moderation.admin.toasts.error_data'),
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Failed to fetch courses for moderation:", error);
      toast({
        title: t('common.error'),
        description: error.message || t('moderation.admin.toasts.error_load'),
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
        title: t('common.success'),
        description: t('moderation.admin.toasts.success_update'),
      });
      fetchModerationCourses(); // Refresh list
    } catch (error) {
      toast({
        title: t('common.error'),
        description: t('moderation.admin.toasts.error_update'),
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
        description: action === "APPROVE" ? t('moderation.admin.toasts.success_approve') : t('moderation.admin.toasts.success_reject'),
      });
      await fetchModerationCourses();
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message || t('moderation.admin.toasts.error_moderation'),
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
        header: t('moderation.admin.list.header_course'),
        cell: ({ row }) => (
          <div className="font-medium flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            {row.original.title}
          </div>
        ),
      },
      {
        accessorKey: "instructor.fullName",
        header: t('moderation.admin.list.header_instructor'),
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                {row.original.instructor?.fullName || t('common.notAvailable')}
            </div>
        ),
      },
      {
        accessorKey: "categorie.title",
        header: t('moderation.admin.list.header_category'),
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {row.original.categorie?.title || t('common.notAvailable')}
            </div>
        ),
      },
      {
        accessorKey: "status",
        header: t('moderation.admin.list.header_status'),
        cell: ({ row }) => <StatusBadge status={t('moderation.admin.list.status_review')} />,
      },
      {
        id: "actions",
        header: t('moderation.admin.list.header_actions'),
        cell: ({ row }) => {
          const course = row.original;
          return (
            <ActionMenu
              actions={[
                {
                  label: t('moderation.admin.list.action_approve'),
                  icon: <Check className="h-4 w-4" />,
                  onClick: () => setValidateDialog({ isOpen: true, courseId: course.id }),
                },
                {
                  label: t('moderation.admin.list.action_edit'),
                  icon: <Edit className="h-4 w-4" />,
                  onClick: () => editModal.open(course),
                },
                {
                  label: t('moderation.admin.list.action_reject'),
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
        title={t('moderation.admin.title')}
        description={t('moderation.admin.description')}
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
          title={t('moderation.admin.modals.edit_title')}
          description={t('moderation.admin.modals.edit_description')}
          defaultValues={editModal.selectedItem}
          onSubmit={handleUpdateCourse}
          submitLabel={t('moderation.admin.modals.edit_submit')}
          categories={categories || []}
        />
      )}

      <ConfirmDialog
        open={validateDialog.isOpen}
        onOpenChange={(isOpen) => setValidateDialog({ isOpen, courseId: validateDialog.courseId })}
        onConfirm={() => handleValidation(validateDialog.courseId!, "APPROVE")}
        title={t('moderation.admin.modals.approve_title')}
        description={t('moderation.admin.modals.approve_description')}
        confirmText={t('moderation.admin.modals.approve_confirm')}
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
            <DialogTitle>{t('moderation.admin.modals.reject_title')}</DialogTitle>
            <DialogDescription>
              {t('moderation.admin.modals.reject_description')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">{t('moderation.admin.modals.reject_reason_label')}</Label>
              <Textarea
                id="rejection-reason"
                placeholder={t('moderation.admin.modals.reject_reason_placeholder')}
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
              {t('moderation.admin.modals.reject_cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (rejectionReason.trim()) {
                  handleValidation(rejectDialog.courseId!, "REJECT", rejectionReason.trim());
                } else {
                  toast({
                    title: t('common.error'),
                    description: t('moderation.admin.modals.reject_error'),
                    variant: "destructive",
                  });
                }
              }}
              disabled={!rejectionReason.trim()}
            >
              {t('moderation.admin.modals.reject_confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
