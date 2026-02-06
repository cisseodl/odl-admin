// components/admin/apprenants-list.tsx
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
import { Eye, Edit, Trash2, User, Mail, Calendar, GraduationCap, Ban, UserCheck, LogOut } from "lucide-react"
import type { UserFormData } from "@/lib/validations/user"
import { Apprenant, Cohorte } from "@/models";
import { apprenantService, cohorteService, userService, courseService } from "@/services";
import { PageLoader } from "@/components/ui/page-loader";
import { EmptyState } from "@/components/admin/empty-state";
import { useToast } from "@/hooks/use-toast";
import { UserSelectModal } from "./modals/user-select-modal";
import { UserCreationModal } from "./modals/user-creation-modal";
import { ApprenantFormModal, ApprenantProfileFormData } from "./modals/apprenant-form-modal";
import { CourseSelectModal } from "./modals/course-select-modal";
import { UserDb } from "@/models";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/language-context"
import { ActionResultDialog } from "@/components/shared/action-result-dialog";
import { useActionResultDialog } from "@/hooks/use-action-result-dialog";

type ApprenantDisplay = {
  id: number;
  name: string;
  email: string;
  numero?: string;
  status: "Actif" | "Inactif" | "Suspendu";
  joinedDate: string;
  filiere: string;
  niveauEtude: string;
  profession: string;
  cohorte?: Cohorte | null;
  avatar?: string;
  coursesEnrolled: number;
  completedCourses: number;
  totalCertificates: number;
}

const mapApprenantToApprenantDisplay = (apprenant: Apprenant): ApprenantDisplay => {
  const status: ApprenantDisplay['status'] = apprenant.activate ? "Actif" : "Inactif";
  const joinedDate = apprenant.createdAt 
    ? new Date(apprenant.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) 
    : "";

  // Construire le nom : utiliser username ou fullName en priorité, sinon construire depuis prenom + nom
  let name = "";
  if (apprenant.username && apprenant.username.trim()) {
    name = apprenant.username.trim();
  } else if (apprenant.fullName && apprenant.fullName.trim()) {
    name = apprenant.fullName.trim();
  } else {
    name = `${apprenant.prenom || ''} ${apprenant.nom || ''}`.trim();
  }
  
  // Si le nom est toujours vide, utiliser l'email comme fallback
  if (!name) {
    name = apprenant.userEmail || apprenant.email || "Sans nom";
  }

  // Utiliser userEmail en priorité, sinon email
  const email = apprenant.userEmail || apprenant.email || "";

  return {
    id: apprenant.id || 0,
    name: name,
    email: email,
    numero: apprenant.numero || "",
    status: status,
    joinedDate: joinedDate,
    filiere: apprenant.filiere || "",
    niveauEtude: apprenant.niveauEtude || "",
    profession: apprenant.profession || "",
    cohorte: apprenant.cohorte || null,
    avatar: apprenant.avatar || undefined,
    coursesEnrolled: 0,
    completedCourses: 0,
    totalCertificates: 0,
  };
};

const mapApprenantDisplayToUserFormData = (apprenant: ApprenantDisplay): UserFormData => {
  return {
    nom: apprenant.name.split(' ').length > 1 ? apprenant.name.split(' ')[1] : apprenant.name,
    prenom: apprenant.name.split(' ')[0] || "",
    email: apprenant.email,
    numero: apprenant.numero,
    profession: apprenant.profession,
    niveauEtude: apprenant.niveauEtude,
    filiere: apprenant.filiere,
    role: "Apprenant",
    status: apprenant.status,
    cohorteId: apprenant.cohorte?.id,
  };
};

const mapApprenantDisplayToUserDisplay = (apprenant: ApprenantDisplay): UserDisplay => {
  return {
    id: apprenant.id,
    name: apprenant.name,
    email: apprenant.email,
    role: "Apprenant",
    status: apprenant.status,
    joinedDate: apprenant.joinedDate,
    courses: apprenant.coursesEnrolled, // Pour "Formations suivies"
    avatar: apprenant.avatar,
    phone: apprenant.numero,
    numero: apprenant.numero,
    profession: apprenant.profession,
    niveauEtude: apprenant.niveauEtude,
    filiere: apprenant.filiere,
    cohorte: apprenant.cohorte,
    coursesEnrolled: apprenant.coursesEnrolled,
    completedCourses: apprenant.completedCourses,
    totalCertificates: apprenant.totalCertificates,
  };
};


export function ApprenantsList() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const dialog = useActionResultDialog();
  const userCreationModal = useModal<UserDb>();
  const promoteUserModal = useModal<{ userId: number }>();
  const promoteProfileFormModal = useModal<{ userId: number, defaultValues: Partial<ApprenantProfileFormData> }>();
  const editModal = useModal<ApprenantDisplay>()
  const deleteModal = useModal<ApprenantDisplay>()
  const viewModal = useModal<ApprenantDisplay>()
  const blacklistModal = useModal<ApprenantDisplay>()
  const unblacklistModal = useModal<ApprenantDisplay>()
  const unenrollModal = useModal<ApprenantDisplay>()

  const [apprenants, setApprenants] = useState<ApprenantDisplay[]>([]);
  const [rawApprenantsData, setRawApprenantsData] = useState<Apprenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cohortes, setCohortes] = useState<Cohorte[]>([]);
  
  const { searchQuery, setSearchQuery, filteredData } = useSearch<ApprenantDisplay>({
    data: Array.isArray(apprenants) ? apprenants : [],
    searchKeys: ["name", "email", "filiere", "niveauEtude"],
  });

  useEffect(() => {
    const fetchCohortes = async () => {
      try {
        const response = await cohorteService.getAllCohortes();
        setCohortes(Array.isArray(response) ? response : (response?.data || []));
      } catch (err) {
        console.error("Error fetching cohortes:", err);
      }
    };
    fetchCohortes();
  }, []);

  const handleUserSelectedForPromotion = (userId: number) => {
    promoteProfileFormModal.open({ userId, defaultValues: {} });
    promoteUserModal.close();
  };

  const fetchApprenants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apprenantService.getAllApprenants();
      const apprenantsData = Array.isArray(response) ? response : (response?.data || []);
      
      if (Array.isArray(apprenantsData) && apprenantsData.length > 0) {
        setRawApprenantsData(apprenantsData);
        const apprenantsWithSummary = await Promise.all(
          apprenantsData.map(async (apprenant: Apprenant) => {
            const mapped = mapApprenantToApprenantDisplay(apprenant);
            try {
              const summary = apprenant.id ? await apprenantService.getApprenantDashboardSummary(apprenant.id) : null;
              return {
                ...mapped,
                coursesEnrolled: summary?.coursesEnrolled ?? 0,
                completedCourses: summary?.completedCourses ?? 0,
                totalCertificates: summary?.totalCertificates ?? 0,
              };
            } catch {
              return mapped;
            }
          })
        );
        setApprenants(apprenantsWithSummary);
      } else {
        setRawApprenantsData([]);
        setApprenants([]);
      }
    } catch (err: any) {
      setError(err.message || t('users.learners.toasts.error_fetch'));
      console.error("Error fetching apprenants:", err);
      setApprenants([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchApprenants();
  }, [fetchApprenants]);

  const handlePromoteUserAndCreateProfile = async (promotionData: ApprenantProfileFormData & { userId: number }) => {
    try {
      const apprenantData = {
        userId: promotionData.userId,
        username: promotionData.username,
        numero: promotionData.numero,
        profession: promotionData.profession,
        niveauEtude: promotionData.niveauEtude,
        filiere: promotionData.filiere,
        attentes: promotionData.attentes,
        satisfaction: promotionData.satisfaction,
        cohorteId: promotionData.cohorteId, // Optionnel maintenant
        activate: true,
      };

      await apprenantService.createApprenant(apprenantData as any);
      toast({
        title: t('common.success'),
        description: t('users.learners.toasts.success_promote'),
      });
      fetchApprenants();
    } catch (err: any) {
      toast({
        title: t('common.error'),
        description: err.message || t('users.learners.toasts.error_promote'),
        variant: "destructive",
      });
      console.error("Error promoting user to apprenant:", err);
    } finally {
      promoteProfileFormModal.close();
    }
  };

  const handleUserCreated = (user: { id: number; fullName: string; email: string }) => {
    toast({
      title: t('users.learners.toasts.success_user_created', {name: user.fullName}),
      description: `L'utilisateur ${user.fullName} a été créé. Vous pouvez maintenant créer son profil apprenant.`,
    });
    userCreationModal.close();
    promoteProfileFormModal.open({ 
      userId: user.id, 
      defaultValues: {
        username: user.fullName, // Utiliser le fullName comme username par défaut
      }
    });
  };

  const handleUpdateApprenant = async (data: ApprenantProfileFormData) => {
    setError(null);
    if (editModal.selectedItem) {
      try {
        // Récupérer l'apprenant actuel pour obtenir le userId
        const currentApprenant = rawApprenantsData.find((app: Apprenant) => app.id === editModal.selectedItem?.id);
        const userId = currentApprenant?.user?.id;
        
        const updatedApprenantData = {
          username: data.username,
          numero: data.numero,
          profession: data.profession,
          niveauEtude: data.niveauEtude,
          filiere: data.filiere,
          attentes: data.attentes,
          satisfaction: data.satisfaction,
          cohorteId: data.cohorteId,
          userDetails: userId ? {
            // Les champs User peuvent être mis à jour séparément si nécessaire
          } : undefined,
        };

        const updatedApprenant = await apprenantService.updateApprenant(editModal.selectedItem.id, updatedApprenantData);
        const apprenant = updatedApprenant?.data || updatedApprenant;
        
        // Recharger la liste complète pour avoir les données à jour
        await fetchApprenants();
        
        toast({
          title: t('common.success'),
          description: t('users.learners.toasts.success_update'),
        });
        editModal.close();
      } catch (err: any) {
        setError(err.message || t('users.learners.toasts.error_update'));
        toast({
          title: t('common.error'),
          description: err.message || t('users.learners.toasts.error_update'),
          variant: "destructive",
        });
        console.error("Error updating apprenant:", err);
      }
    }
  };

  const handleDeleteApprenant = async (id: number) => {
    setError(null);
    try {
      await apprenantService.deleteApprenant(id);
      toast({
        title: t('common.success'),
        description: t('users.learners.toasts.success_delete'),
      });
      dialog.showSuccess(t('users.learners.toasts.success_delete'));
      setApprenants((prev) => prev.filter((apprenant) => apprenant.id !== id));
      deleteModal.close();
    } catch (err: any) {
      setError(err.message || t('users.learners.toasts.error_delete'));
      toast({
        title: t('common.error'),
        description: err.message || t('users.learners.toasts.error_delete'),
        variant: "destructive",
      });
      dialog.showError(err.message || t('users.learners.toasts.error_delete'));
      console.error("Error deleting apprenant:", err);
    }
  };

  const handleBlacklist = useCallback(async () => {
    if (blacklistModal.selectedItem) {
      try {
        // Récupérer le userId depuis les données brutes
        const apprenantData = rawApprenantsData.find((app: Apprenant) => app.id === blacklistModal.selectedItem?.id);
        const userId = apprenantData?.user?.id || apprenantData?.id;
        
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
        fetchApprenants();
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
  }, [blacklistModal, rawApprenantsData, toast, t, fetchApprenants]);

  const handleUnblacklist = useCallback(async () => {
    if (unblacklistModal.selectedItem) {
      try {
        // Récupérer le userId depuis les données brutes
        const apprenantData = rawApprenantsData.find((app: Apprenant) => app.id === unblacklistModal.selectedItem?.id);
        const userId = apprenantData?.user?.id || apprenantData?.id;
        
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
        fetchApprenants();
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
  }, [unblacklistModal, rawApprenantsData, toast, t, fetchApprenants]);

  const handleUnenroll = useCallback(async (courseId: number) => {
    if (unenrollModal.selectedItem) {
      try {
        // Récupérer le userId depuis les données brutes
        const apprenantData = rawApprenantsData.find((app: Apprenant) => app.id === unenrollModal.selectedItem?.id);
        const userId = apprenantData?.user?.id || apprenantData?.id;
        
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
        fetchApprenants();
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
  }, [unenrollModal, rawApprenantsData, toast, t, fetchApprenants]);

  const columns: ColumnDef<ApprenantDisplay>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: t('users.learners.list.header_learner'),
        cell: ({ row }) => {
          const apprenant = row.original
          return (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={apprenant.avatar || "/placeholder.svg"} alt={apprenant.name} />
                <AvatarFallback>{apprenant.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {apprenant.name}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Mail className="h-3.5 w-3.5" />
                  {apprenant.email}
                </div>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "numero",
        header: t('users.learners.list.header_phone'),
        cell: ({ row }) => row.original.numero || t('common.notAvailable'),
      },
      {
        accessorKey: "filiere",
        header: t('users.learners.list.header_field'),
      },
      {
        accessorKey: "niveauEtude",
        header: t('users.learners.list.header_level'),
      },
      {
        accessorKey: "profession",
        header: t('users.learners.list.header_profession'),
      },
      {
        accessorKey: "cohorte",
        header: t('users.learners.list.header_cohort'),
        cell: ({ row }) => row.original.cohorte?.nom || t('common.none'),
      },
      {
        accessorKey: "status",
        header: t('users.learners.list.header_status'),
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "joinedDate",
        header: t('users.learners.list.header_joined_date'),
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            {row.original.joinedDate}
          </div>
        ),
      },
      {
        id: "actions",
        header: t('users.learners.list.header_actions'),
        cell: ({ row }) => {
          const apprenant = row.original
          return (
            <ActionMenu
              actions={[
                {
                  label: t('users.learners.list.action_view_details'),
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => viewModal.open(apprenant),
                },
                {
                  label: t('users.learners.list.action_edit'),
                  icon: <Edit className="h-4 w-4" />,
                  onClick: () => editModal.open(apprenant),
                },
                {
                  label: apprenant.status === "Actif" 
                    ? t('users.learners.list.action_blacklist')
                    : t('users.learners.list.action_unblacklist'),
                  icon: apprenant.status === "Actif" 
                    ? <Ban className="h-4 w-4" />
                    : <UserCheck className="h-4 w-4" />,
                  onClick: () => {
                    if (apprenant.status === "Actif") {
                      blacklistModal.open(apprenant);
                    } else {
                      unblacklistModal.open(apprenant);
                    }
                  },
                  variant: apprenant.status === "Actif" ? "destructive" : "default",
                },
                {
                  label: t('users.learners.list.action_unenroll'),
                  icon: <LogOut className="h-4 w-4" />,
                  onClick: () => unenrollModal.open(apprenant),
                },
                {
                  label: t('users.learners.list.action_delete'),
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: () => deleteModal.open(apprenant),
                  variant: "destructive",
                },
              ]}
            />
          )
        },
      },
    ],
    [viewModal, editModal, deleteModal, t]
  )

  return (
    <>
      <PageHeader
        title={t('users.learners.list.title')}
        action={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="default" className="bg-[rgb(255,102,0)] hover:bg-[rgb(255,102,0)]/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                {t('users.learners.list.add_button')}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('users.learners.list.add_options_title')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => userCreationModal.open()}>
                {t('users.learners.list.add_option_create')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => promoteUserModal.open()}>
                {t('users.learners.list.add_option_promote')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <Card className="mt-6">
        <CardContent>
          <div className="mb-4">
            <SearchBar
              placeholder={t('users.learners.list.search_placeholder')}
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
          {loading ? (
            <PageLoader />
          ) : error ? (
            <div className="text-center text-destructive p-4">{error}</div>
          ) : !filteredData || filteredData.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title={t('users.learners.list.empty_title')}
              description={t('users.learners.list.empty_description')}
            />
          ) : (
            <DataTable columns={columns} data={filteredData || []} searchValue={searchQuery} />
          )}
        </CardContent>
      </Card>

      <UserSelectModal
        open={promoteUserModal.isOpen}
        onOpenChange={(open) => !open && promoteUserModal.close()}
        onSelectUser={handleUserSelectedForPromotion}
        title={t('users.learners.modals.promote_title')}
        description={t('users.learners.modals.promote_description')}
        excludeUserIds={rawApprenantsData.map((a: Apprenant & { user?: { id: number }; userId?: number }) => a.user?.id ?? a.userId).filter((id): id is number => id != null)}
      />

      {userCreationModal.isOpen && (
        <UserCreationModal
          open={userCreationModal.isOpen}
          onOpenChange={(open) => !open && userCreationModal.close()}
          onUserCreated={handleUserCreated}
          title={t('users.learners.modals.create_user_title')}
          description={t('users.learners.modals.create_user_description')}
          submitLabel={t('users.learners.modals.create_user_submit')}
        />
      )}

      {promoteProfileFormModal.selectedItem && (
        <ApprenantFormModal
          open={promoteProfileFormModal.isOpen}
          onOpenChange={(open) => !open && promoteProfileFormModal.close()}
          onSubmit={handlePromoteUserAndCreateProfile}
          title={t('users.learners.modals.create_profile_title')}
          description={t('users.learners.modals.create_profile_description')}
          submitLabel={t('users.learners.modals.create_profile_submit')}
          userId={promoteProfileFormModal.selectedItem.userId}
          defaultValues={promoteProfileFormModal.selectedItem.defaultValues}
          cohortes={cohortes}
        />
      )}

      {editModal.selectedItem && (() => {
        const currentApprenant = rawApprenantsData.find((app: Apprenant) => app.id === editModal.selectedItem?.id);
        return (
          <ApprenantFormModal
            open={editModal.isOpen}
            onOpenChange={(open) => !open && editModal.close()}
            onSubmit={handleUpdateApprenant}
            title={t('users.learners.modals.edit_title')}
            description={t('users.learners.modals.edit_description')}
            submitLabel={t('users.learners.modals.edit_submit')}
            defaultValues={{
              username: editModal.selectedItem.name,
              numero: editModal.selectedItem.numero,
              profession: editModal.selectedItem.profession,
              niveauEtude: editModal.selectedItem.niveauEtude,
              filiere: editModal.selectedItem.filiere,
              cohorteId: editModal.selectedItem.cohorte?.id,
            }}
            cohortes={cohortes}
          />
        );
      })()}

      {viewModal.selectedItem && (
        <ViewUserModal
          open={viewModal.isOpen}
          onOpenChange={(open) => !open && viewModal.close()}
          user={mapApprenantDisplayToUserDisplay(viewModal.selectedItem)}
        />
      )}

      <ConfirmDialog
        open={deleteModal.isOpen}
        onOpenChange={(open) => !open && deleteModal.close()}
        onConfirm={() => handleDeleteApprenant(deleteModal.selectedItem?.id || 0)}
        title={t('users.learners.modals.delete_title')}
        description={t('users.learners.modals.delete_description', { name: deleteModal.selectedItem?.name })}
        confirmText={t('common.delete')}
        variant="destructive"
      />

      <ConfirmDialog
        open={blacklistModal.isOpen}
        onOpenChange={(open) => !open && blacklistModal.close()}
        onConfirm={handleBlacklist}
        title={t('users.learners.modals.blacklist_title')}
        description={t('users.learners.modals.blacklist_description', { name: blacklistModal.selectedItem?.name })}
        confirmText={t('users.learners.list.action_blacklist')}
        variant="destructive"
      />

      <ConfirmDialog
        open={unblacklistModal.isOpen}
        onOpenChange={(open) => !open && unblacklistModal.close()}
        onConfirm={handleUnblacklist}
        title={t('users.learners.modals.unblacklist_title')}
        description={t('users.learners.modals.unblacklist_description', { name: unblacklistModal.selectedItem?.name })}
        confirmText={t('users.learners.list.action_unblacklist')}
        variant="default"
      />

      {/* Dialogue de résultat */}
      <ActionResultDialog
        isOpen={dialog.isOpen}
        onOpenChange={dialog.setIsOpen}
        isSuccess={dialog.isSuccess}
        message={dialog.message}
        title={dialog.title}
      />

      {unenrollModal.selectedItem && (() => {
        const apprenantData = rawApprenantsData.find((app: Apprenant) => app.id === unenrollModal.selectedItem?.id);
        const userId = apprenantData?.user?.id || apprenantData?.id;
        return userId ? (
          <CourseSelectModal
            open={unenrollModal.isOpen}
            onOpenChange={(open) => !open && unenrollModal.close()}
            onSelectCourse={handleUnenroll}
            userId={userId}
            title={t('users.learners.modals.unenroll_title')}
            description={t('users.learners.modals.unenroll_description', { name: unenrollModal.selectedItem?.name })}
          />
        ) : null;
      })()}
    </>
  )
}
