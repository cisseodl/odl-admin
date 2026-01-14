// components/admin/instructeurs-list.tsx
"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { SearchBar } from "@/components/ui/search-bar"
import { DataTable } from "@/components/ui/data-table"
import { ActionMenu } from "@/components/ui/action-menu"
import { StatusBadge } from "@/components/ui/status-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { useModal } from "@/hooks/use-modal"
import { useSearch } from "@/hooks/use-search"
import { UserFormModal } from "@/components/shared/user-form-modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ViewUserModal, type UserDisplay } from "./modals/view-user-modal"
import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Edit, Trash2, User, Mail, Calendar, BookOpen, GraduationCap, ChevronDown, Plus, Ban, UserCheck, LogOut } from "lucide-react"
import type { UserFormData } from "@/lib/validations/user"
import { instructorService, userService, courseService } from "@/services";
import type { ApiInstructor } from "@/services/instructor.service";
import { UserDb } from "@/models";
import { PageLoader } from "@/components/ui/page-loader";
import { EmptyState } from "@/components/admin/empty-state";
import { useToast } from "@/hooks/use-toast";
import { UserSelectModal } from "./modals/user-select-modal";
import { InstructorPromotionFormModal, InstructorProfileFormData } from "./modals/instructor-promotion-form-modal";
import { UserCreationModal } from "./modals/user-creation-modal";
import { CourseSelectModal } from "./modals/course-select-modal";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";

type InstructorDisplay = {
  id: number;
  name: string;
  email: string;
  status: "Actif" | "Inactif" | "Suspendu";
  joinedDate: string;
  courses: number;
  avatar?: string;
  role: "Formateur";
  biography?: string;
  specialization?: string;
}

const mapUserDbToInstructorDisplay = (userDb: UserDb, t: (key: string) => string): InstructorDisplay => {
  const status: InstructorDisplay['status'] = userDb.activate ? t('common.active') as "Actif" : t('common.inactive') as "Inactif";
  const joinedDate = userDb.createdAt ? new Date(userDb.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "";

  return {
    id: userDb.id || 0,
    name: userDb.fullName || "",
    email: userDb.email || "",
    status: status,
    joinedDate: joinedDate,
    courses: 0,
    avatar: userDb.avatar || undefined,
    role: "Formateur",
  };
};

const mapApiInstructorToInstructorDisplay = (apiInstructor: ApiInstructor, t: (key: string) => string): InstructorDisplay => {
  const activate = apiInstructor.userActivate ?? apiInstructor.activate ?? false;
  const status: InstructorDisplay['status'] = activate ? t('common.active') as "Actif" : t('common.inactive') as "Inactif";
  
  const joinedDate = apiInstructor.createdAt 
    ? new Date(apiInstructor.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) 
    : "";

  const name = apiInstructor.fullName?.trim() 
    || apiInstructor.email?.split('@')[0]
    || t('users.instructors.no_name');

  return {
    id: apiInstructor.id || 0,
    name: name,
    email: apiInstructor.email || "",
    status: status,
    joinedDate: joinedDate,
    courses: 0,
    avatar: apiInstructor.avatar || undefined,
    role: "Formateur",
    biography: apiInstructor.biography,
    specialization: apiInstructor.specialization,
  };
};

const mapInstructorDisplayToUserFormData = (instructor: InstructorDisplay): UserFormData => {
  const nameParts = instructor.name.split(' ');
  const firstName = nameParts[0] || "";
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : "";

  return {
    nom: lastName,
    prenom: firstName,
    email: instructor.email,
    numero: "",
    profession: "",
    niveauEtude: "",
    filiere: "",
    role: "Formateur",
    status: instructor.status,
  };
};

const mapInstructorDisplayToUserDisplay = (instructor: InstructorDisplay): UserDisplay => {
  return {
    id: instructor.id,
    name: instructor.name,
    email: instructor.email,
    role: "Formateur",
    status: instructor.status,
    joinedDate: instructor.joinedDate,
    courses: instructor.courses,
    avatar: instructor.avatar,
    biography: instructor.biography,
    specialization: instructor.specialization,
  };
};

export function InstructeursList() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const promoteUserSelectModal = useModal<{ userId: number }>();
  const userCreationModal = useModal<UserDb>();
  const promoteProfileFormModal = useModal<{ userId: number, defaultValues: Partial<InstructorProfileFormData> }>();
  const editUserFormModal = useModal<InstructorDisplay>();
  const deleteModal = useModal<InstructorDisplay>();
  const viewModal = useModal<InstructorDisplay>();
  const blacklistModal = useModal<InstructorDisplay>();
  const unblacklistModal = useModal<InstructorDisplay>();
  const unenrollModal = useModal<InstructorDisplay>();

  const [instructors, setInstructors] = useState<InstructorDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [rawInstructorsData, setRawInstructorsData] = useState<any[]>([]);
  
  const { searchQuery, setSearchQuery, filteredData } = useSearch<InstructorDisplay>({
    data: instructors,
    searchKeys: ["name", "email", "specialization"],
  });

  const fetchInstructors = useCallback(async () => {
    setLoading(true);
    try {
      const response = await instructorService.getAllInstructors();
      const instructorsData = Array.isArray(response) ? response : (response?.data || []);
      
      if (Array.isArray(instructorsData)) {
        setRawInstructorsData(instructorsData);
        setInstructors(instructorsData.map(inst => mapApiInstructorToInstructorDisplay(inst, t)));
      } else {
        console.error("Unexpected response structure:", response);
        setRawInstructorsData([]);
        setInstructors([]);
        toast({
          title: t('common.error'),
          description: t('users.instructors.toasts.error_unexpected_response'),
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: t('common.error'),
        description: err.message || t('users.instructors.toasts.error_fetch_list'),
        variant: "destructive",
      });
      console.error("Error fetching instructors:", err);
      setRawInstructorsData([]);
      setInstructors([]);
    } finally {
      setLoading(false);
    }
  }, [t, toast]);

  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]);

  const handleUserSelectedForPromotion = (userId: number) => {
    promoteProfileFormModal.open({ userId, defaultValues: {} });
    promoteUserSelectModal.close();
  };

  const handlePromoteUserAndCreateProfile = async (promotionData: InstructorProfileFormData & { userId: number }) => {
    try {
      await instructorService.promoteUserAndCreateInstructorProfile(
        promotionData.userId,
        {
          biography: promotionData.biography,
          specialization: promotionData.specialization,
        }
      );
      toast({
        title: t('common.success'),
        description: t('users.instructors.toasts.success_promote'),
      });
      fetchInstructors();
    } catch (err: any) {
      toast({
        title: t('common.error'),
        description: err.message || t('users.instructors.toasts.error_promote'),
        variant: "destructive",
      });
      console.error("Error promoting user to instructor:", err);
    } finally {
      promoteProfileFormModal.close();
    }
  };

  const handleUpdateInstructor = async (data: UserFormData) => {
    if (editUserFormModal.selectedItem) {
      try {
        const instructorId = editUserFormModal.selectedItem.id;
        const updatedUserData: Partial<ApiInstructor & UserDb> = {
          fullName: `${data.prenom || ''} ${data.nom || ''}`.trim(),
          email: data.email,
          phone: data.numero,
          activate: data.status === "Actif",
        };

        await instructorService.updateInstructor(instructorId, updatedUserData);
        toast({
          title: t('common.success'),
          description: t('users.instructors.toasts.success_update'),
        });
        fetchInstructors();
      } catch (err: any) {
        toast({
          title: t('common.error'),
          description: err.message || t('users.instructors.toasts.error_update'),
          variant: "destructive",
        });
        console.error("Error updating instructor:", err);
      } finally {
        editUserFormModal.close();
      }
    }
  };

  const handleDeleteInstructor = async () => {
    if (deleteModal.selectedItem) {
      try {
        await instructorService.deleteInstructor(deleteModal.selectedItem.id!);
        toast({
          title: t('common.success'),
          description: t('users.instructors.toasts.success_delete'),
        });
        fetchInstructors();
      } catch (err: any) {
        toast({
          title: t('common.error'),
          description: err.message || t('users.instructors.toasts.error_delete'),
          variant: "destructive",
        });
        console.error("Error deleting instructor:", err);
      } finally {
        deleteModal.close();
      }
    }
  };

  const handleUserCreated = (user: { id: number; fullName: string; email: string }) => {
    toast({
      title: t('users.learners.toasts.success_user_created', { name: user.fullName }),
      description: t('users.instructors.toasts.success_user_created', { name: user.fullName }),
    });
    userCreationModal.close();
    promoteProfileFormModal.open({
      userId: user.id,
      defaultValues: {
        email: user.email,
        nom: user.fullName?.split(' ').slice(1).join(' ') || '',
        prenom: user.fullName?.split(' ')[0] || '',
      }
    });
  };

  const handleBlacklist = useCallback(async () => {
    if (blacklistModal.selectedItem) {
      try {
        // Récupérer le userId depuis les données brutes
        const instructorData = rawInstructorsData.find((inst: any) => inst.id === blacklistModal.selectedItem?.id);
        const userId = instructorData?.userId || instructorData?.user?.id || instructorData?.id;
        
        if (!userId) {
          toast({
            title: t('common.error'),
            description: "Impossible de trouver l'ID utilisateur.",
            variant: "destructive",
          });
          return;
        }

        await userService.blacklistUser(userId);
        toast({
          title: t('common.success'),
          description: t('users.enrollments.success_blacklist'),
        });
        fetchInstructors();
      } catch (err: any) {
        toast({
          title: t('common.error'),
          description: err.message || t('users.enrollments.error_blacklist'),
          variant: "destructive",
        });
        console.error("Error blacklisting user:", err);
      } finally {
        blacklistModal.close();
      }
    }
  }, [blacklistModal, rawInstructorsData, toast, t, fetchInstructors]);

  const handleUnblacklist = useCallback(async () => {
    if (unblacklistModal.selectedItem) {
      try {
        // Récupérer le userId depuis les données brutes
        const instructorData = rawInstructorsData.find((inst: any) => inst.id === unblacklistModal.selectedItem?.id);
        const userId = instructorData?.userId || instructorData?.user?.id || instructorData?.id;
        
        if (!userId) {
          toast({
            title: t('common.error'),
            description: "Impossible de trouver l'ID utilisateur.",
            variant: "destructive",
          });
          return;
        }

        await userService.unblacklistUser(userId);
        toast({
          title: t('common.success'),
          description: t('users.enrollments.success_unblacklist'),
        });
        fetchInstructors();
      } catch (err: any) {
        toast({
          title: t('common.error'),
          description: err.message || t('users.enrollments.error_unblacklist'),
          variant: "destructive",
        });
        console.error("Error unblacklisting user:", err);
      } finally {
        unblacklistModal.close();
      }
    }
  }, [unblacklistModal, rawInstructorsData, toast, t, fetchInstructors]);

  const handleUnenroll = useCallback(async (courseId: number) => {
    if (unenrollModal.selectedItem) {
      try {
        // Récupérer le userId depuis les données brutes
        const instructorData = rawInstructorsData.find((inst: any) => inst.id === unenrollModal.selectedItem?.id);
        const userId = instructorData?.userId || instructorData?.user?.id || instructorData?.id;
        
        if (!userId) {
          toast({
            title: t('common.error'),
            description: "Impossible de trouver l'ID utilisateur.",
            variant: "destructive",
          });
          return;
        }

        await courseService.unenrollUserFromCourse(courseId, userId);
        toast({
          title: t('common.success'),
          description: t('users.enrollments.success_unenroll'),
        });
        fetchInstructors();
      } catch (err: any) {
        toast({
          title: t('common.error'),
          description: err.message || t('users.enrollments.error_unenroll'),
          variant: "destructive",
        });
        console.error("Error unenrolling user:", err);
      } finally {
        unenrollModal.close();
      }
    }
  }, [unenrollModal, rawInstructorsData, toast, t, fetchInstructors]);

  const columns: ColumnDef<InstructorDisplay>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: t('users.instructors.list.header_instructor'),
        cell: ({ row }) => {
          const instructor = row.original
          return (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={instructor.avatar || "/placeholder.svg"} alt={instructor.name} />
                <AvatarFallback>{instructor.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {instructor.name}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Mail className="h-3.5 w-3.5" />
                  {instructor.email}
                </div>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "specialization",
        header: t('users.instructors.list.header_specialization'),
        cell: ({ row }) => row.original.specialization || t('common.notAvailable'),
      },
      {
        accessorKey: "status",
        header: t('users.instructors.list.header_status'),
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "joinedDate",
        header: t('users.instructors.list.header_joined_date'),
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            {row.original.joinedDate}
          </div>
        ),
      },
      {
        accessorKey: "courses",
        header: t('users.instructors.list.header_courses_managed'),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            {row.original.courses}
          </div>
        ),
      },
      {
        id: "actions",
        header: t('users.instructors.list.header_actions'),
        cell: ({ row }) => {
          const instructor = row.original
          return (
            <ActionMenu
              actions={[
                {
                  label: t('users.instructors.list.action_view_details'),
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => {
                    viewModal.open(instructor);
                  },
                },
                {
                  label: t('users.instructors.list.action_edit_user'),
                  icon: <Edit className="h-4 w-4" />,
                  onClick: () => editUserFormModal.open(instructor),
                },
                {
                  label: t('users.instructors.list.action_edit_profile'),
                  icon: <GraduationCap className="h-4 w-4" />,
                  onClick: () => promoteProfileFormModal.open({
                    userId: instructor.id,
                    defaultValues: {
                      biography: instructor.biography,
                      specialization: instructor.specialization,
                    },
                  }),
                },
                {
                  label: instructor.status === "Actif" 
                    ? t('users.instructors.list.action_blacklist') || t('users.admins.list.action_blacklist')
                    : t('users.instructors.list.action_unblacklist') || t('users.admins.list.action_unblacklist'),
                  icon: instructor.status === "Actif" 
                    ? <Ban className="h-4 w-4" />
                    : <UserCheck className="h-4 w-4" />,
                  onClick: () => {
                    if (instructor.status === "Actif") {
                      blacklistModal.open(instructor);
                    } else {
                      unblacklistModal.open(instructor);
                    }
                  },
                  variant: instructor.status === "Actif" ? "destructive" : "default",
                },
                {
                  label: t('users.instructors.list.action_unenroll') || t('users.admins.list.action_unenroll'),
                  icon: <LogOut className="h-4 w-4" />,
                  onClick: () => unenrollModal.open(instructor),
                },
                {
                  label: t('users.instructors.list.action_delete'),
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: () => deleteModal.open(instructor),
                  variant: "destructive",
                },
              ]}
            />
          )
        },
      },
    ],
    [viewModal, editUserFormModal, promoteProfileFormModal, deleteModal, blacklistModal, unblacklistModal, unenrollModal, t]
  )

  const instructorIds = useMemo(() => instructors.map(inst => inst.id), [instructors]);

  return (
    <>
      <PageHeader
        title={t('users.instructors.list.title')}
        action={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="default" className="bg-[rgb(255,102,0)] hover:bg-[rgb(255,102,0)]/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                {t('users.instructors.list.add_button')}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('users.instructors.list.add_options_title')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => userCreationModal.open()}>
                {t('users.instructors.list.add_option_create')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => promoteUserSelectModal.open()}>
                {t('users.instructors.list.add_option_promote')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <Card className="mt-6">
        <CardContent>
          <div className="mb-4">
            <SearchBar
              placeholder={t('users.instructors.list.search_placeholder')}
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
          {loading ? (
            <PageLoader />
          ) : filteredData.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title={t('users.instructors.list.empty_title')}
              description={t('users.instructors.list.empty_description')}
            />
          ) : (
            <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
          )}
        </CardContent>
      </Card>

      <UserSelectModal
        open={promoteUserSelectModal.isOpen}
        onOpenChange={(open) => !open && promoteUserSelectModal.close()}
        onSelectUser={handleUserSelectedForPromotion}
        title={t('users.instructors.modals.promote_select_title')}
        description={t('users.instructors.modals.promote_select_description')}
        excludeUserIds={instructorIds}
      />

      {userCreationModal.isOpen && (
        <UserCreationModal
          open={userCreationModal.isOpen}
          onOpenChange={(open) => !open && userCreationModal.close()}
          onUserCreated={handleUserCreated}
          title={t('users.learners.modals.create_user_title')}
          description={t('users.instructors.toasts.success_user_created', { name: '' })}
          submitLabel={t('users.learners.modals.create_user_submit')}
        />
      )}

      {promoteProfileFormModal.selectedItem && (
        <InstructorPromotionFormModal
          open={promoteProfileFormModal.isOpen}
          onOpenChange={(open) => !open && promoteProfileFormModal.close()}
          onSubmit={handlePromoteUserAndCreateProfile}
          title={t('users.instructors.modals.promote_form_title')}
          description={t('users.instructors.modals.promote_form_description')}
          submitLabel={t('users.instructors.modals.promote_form_submit')}
          userId={promoteProfileFormModal.selectedItem.userId}
          defaultValues={promoteProfileFormModal.selectedItem.defaultValues}
        />
      )}

      {editUserFormModal.selectedItem && (
        <UserFormModal
          open={editUserFormModal.isOpen}
          onOpenChange={(open) => !open && editUserFormModal.close()}
          title={t('users.instructors.modals.edit_user_title')}
          description={t('users.instructors.modals.edit_user_description')}
          defaultValues={mapInstructorDisplayToUserFormData(editUserFormModal.selectedItem)}
          onSubmit={handleUpdateInstructor}
          submitLabel={t('users.instructors.modals.edit_user_submit')}
        />
      )}

      {viewModal.selectedItem && (
        <ViewUserModal
          open={viewModal.isOpen}
          onOpenChange={(open) => !open && viewModal.close()}
          user={mapInstructorDisplayToUserDisplay(viewModal.selectedItem)}
        />
      )}

      <ConfirmDialog
        open={deleteModal.isOpen}
        onOpenChange={(open) => !open && deleteModal.close()}
        onConfirm={handleDeleteInstructor}
        title={t('users.instructors.modals.delete_title')}
        description={t('users.instructors.modals.delete_description', { name: deleteModal.selectedItem?.name })}
        confirmText={t('common.delete')}
        variant="destructive"
      />

      <ConfirmDialog
        open={blacklistModal.isOpen}
        onOpenChange={(open) => !open && blacklistModal.close()}
        onConfirm={handleBlacklist}
        title={t('users.instructors.modals.blacklist_title')}
        description={t('users.instructors.modals.blacklist_description', { name: blacklistModal.selectedItem?.name })}
        confirmText={t('users.instructors.list.action_blacklist')}
        variant="destructive"
      />

      <ConfirmDialog
        open={unblacklistModal.isOpen}
        onOpenChange={(open) => !open && unblacklistModal.close()}
        onConfirm={handleUnblacklist}
        title={t('users.instructors.modals.unblacklist_title')}
        description={t('users.instructors.modals.unblacklist_description', { name: unblacklistModal.selectedItem?.name })}
        confirmText={t('users.instructors.list.action_unblacklist')}
        variant="default"
      />

      {unenrollModal.selectedItem && (() => {
        const instructorData = rawInstructorsData.find((inst: any) => inst.id === unenrollModal.selectedItem?.id);
        const userId = instructorData?.userId || instructorData?.user?.id || instructorData?.id;
        return userId ? (
          <CourseSelectModal
            open={unenrollModal.isOpen}
            onOpenChange={(open) => !open && unenrollModal.close()}
            onSelectCourse={handleUnenroll}
            userId={userId}
            title={t('users.instructors.modals.unenroll_title')}
            description={t('users.instructors.modals.unenroll_description', { name: unenrollModal.selectedItem?.name })}
          />
        ) : null;
      })()}
    </>
  )
}