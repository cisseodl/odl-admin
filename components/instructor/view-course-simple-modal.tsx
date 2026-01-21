"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { StatusBadge } from "@/components/ui/status-badge"
import { FileText } from "lucide-react"
import { Course, Module } from "@/models"
import { moduleService } from "@/services"
import { PageLoader } from "@/components/ui/page-loader"

type ViewCourseSimpleModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  course: Course
}

export function ViewCourseSimpleModal({ open, onOpenChange, course }: ViewCourseSimpleModalProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);

  useEffect(() => {
    if (open && course?.id) {
      const fetchModules = async () => {
        setLoadingModules(true);
        try {
          const fetchedModules = await moduleService.getModulesByCourse(course.id);
          const modulesData = Array.isArray(fetchedModules) ? fetchedModules : (fetchedModules?.data || []);
          setModules(modulesData);
        } catch (err: any) {
          console.error("Error fetching modules:", err);
          setModules([]);
        } finally {
          setLoadingModules(false);
        }
      };
      fetchModules();
    }
  }, [open, course?.id]);

  const courseStatus = course.status === "PUBLISHED" || course.status === "Publié" 
    ? "Publié" 
    : course.status === "DRAFT" || course.status === "Brouillon" 
    ? "Brouillon" 
    : "En révision";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{course.title || "Sans titre"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Statut</p>
            <StatusBadge status={courseStatus} />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Modules</p>
            {loadingModules ? (
              <PageLoader />
            ) : modules.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun module pour ce cours.</p>
            ) : (
              <div className="space-y-2">
                {modules.map((module) => (
                  <div key={module.id} className="flex items-center gap-2 p-2 border rounded-md">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {module.moduleOrder}. {module.title || "Sans titre"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

