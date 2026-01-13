// components/admin/modals/course-select-modal.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Check } from "lucide-react";
import { userService } from "@/services";
import { PageLoader } from "@/components/ui/page-loader";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";

type CourseEnrollment = {
  courseId: number;
  courseTitle: string;
};

type CourseSelectModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectCourse: (courseId: number) => void;
  userId: number;
  title: string;
  description: string;
};

export function CourseSelectModal({
  open,
  onOpenChange,
  onSelectCourse,
  userId,
  title,
  description,
}: CourseSelectModalProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  const fetchEnrollments = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const enrollmentsData = await userService.getUserEnrollments(userId);
      setEnrollments(enrollmentsData);
    } catch (error) {
      console.error("Error fetching user enrollments:", error);
      toast({
        title: t('common.error'),
        description: "Impossible de charger les cours de l'utilisateur.",
        variant: "destructive",
      });
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  }, [userId, toast, t]);

  useEffect(() => {
    if (open && userId) {
      fetchEnrollments();
      setSearchTerm("");
      setSelectedCourseId(null);
    }
  }, [open, userId, fetchEnrollments]);

  const filteredCourses = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return enrollments.filter(
      (enrollment) =>
        !searchTerm ||
        enrollment.courseTitle?.toLowerCase().includes(lowercasedSearchTerm)
    );
  }, [searchTerm, enrollments]);

  const handleSelect = () => {
    if (selectedCourseId !== null) {
      onSelectCourse(selectedCourseId);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-[600px] h-[90vh] sm:h-[85vh] flex flex-col p-0 gap-0 overflow-hidden">
        <div className="flex-none px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">{title}</DialogTitle>
            <DialogDescription className="text-sm">{description}</DialogDescription>
          </DialogHeader>
        </div>
        <div className="flex-none px-4 sm:px-6 pb-3 sm:pb-4">
          <Input
            placeholder={t('courses.search_placeholder') || "Rechercher un cours par titre..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex-1 min-h-0 px-4 sm:px-6 overflow-hidden">
          <ScrollArea className="h-full w-full">
            {loading ? (
              <div className="py-8">
                <PageLoader />
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                {enrollments.length === 0
                  ? t('users.enrollments.no_courses') || "Cet utilisateur n'est inscrit à aucun cours."
                  : t('users.enrollments.no_results') || "Aucun cours trouvé."}
              </div>
            ) : (
              <div className="space-y-2 pr-2 sm:pr-4 pb-4">
                {filteredCourses.map((enrollment) => (
                  <Button
                    key={enrollment.courseId}
                    variant="outline"
                    className={`w-full justify-start text-left h-auto py-2 px-3 ${
                      selectedCourseId === enrollment.courseId ? "ring-2 ring-primary ring-offset-2" : ""
                    }`}
                    onClick={() => setSelectedCourseId(enrollment.courseId)}
                  >
                    <BookOpen className="h-5 w-5 text-muted-foreground mr-3 shrink-0" />
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="font-medium truncate text-sm sm:text-base">{enrollment.courseTitle}</div>
                    </div>
                    {selectedCourseId === enrollment.courseId && (
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-primary ml-2 shrink-0" />
                    )}
                  </Button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        <DialogFooter className="flex-none px-4 sm:px-6 pt-3 sm:pt-4 pb-4 sm:pb-6 border-t gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1 sm:flex-initial">
            {t('common.cancel') || "Annuler"}
          </Button>
          <Button
            type="button"
            onClick={handleSelect}
            disabled={selectedCourseId === null || enrollments.length === 0}
            className="flex-1 sm:flex-initial"
          >
            {t('users.enrollments.unenroll') || "Désinscrire"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
