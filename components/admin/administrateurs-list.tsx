// components/admin/administrateurs-list.tsx
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
import { Eye, Edit, Trash2, User, Mail, Calendar, BookOpen, Shield, ChevronDown, Plus, Ban, UserCheck, LogOut } from "lucide-react"
import type { UserFormData } from "@/lib/validations/user"

import { UserDb } from "@/models";
import { adminService, userService, courseService } from "@/services";
import { FULL_API_URL } from "@/services/api.config";
import { PageLoader } from "@/components/ui/page-loader";
import { EmptyState } from "@/components/admin/empty-state";
import { useToast } from "@/hooks/use-toast";
import { UserSelectModal } from "./modals/user-select-modal";
import { UserCreationModal } from "./modals/user-creation-modal";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/language-context";


type AdministrateurDisplay = {
  id: number;
  name: string;
  email: string;
  status: "Actif" | "Inactif" | "Suspendu";
  joinedDate: string;
  courses: number;
  avatar?: string;
  role: "Admin";
};

const mapAdminToAdministrateurDisplay = (adminData: any, t: (key: string) => string): AdministrateurDisplay => {
  const activate = adminData.userActivate ?? adminData.activate ?? false;
  const status: AdministrateurDisplay['status'] = activate ? t('common.active') as "Actif" : t('common.inactive') as "Inactif";
  
  const joinedDate = adminData.createdAt 
    ? new Date(adminData.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) 
    : "";
  
  const fullName = (adminData.fullName && adminData.fullName.trim()) 
    || (adminData.user?.fullName && adminData.user.fullName.trim())
    || "";
  
  const email = adminData.email || adminData.user?.email || "";
  
  let name = fullName;
  if (!name && email) {
    name = email.split('@')[0];
  }
  if (!name) {
    name = t('users.admins.no_name');
    if (adminData.userId) {
      name = `${t('users.admins.no_name')} #${adminData.userId}`;
    }
  }

  return {
    id: adminData.id || 0,
    name: name,
    email: email,
    status: status,
    joinedDate: joinedDate,
    courses: 0,
    avatar: adminData.avatar || adminData.user?.avatar || undefined,
    role: "Admin",
  };
};

const mapAdministrateurDisplayToUserFormData = (administrateur: AdministrateurDisplay): UserFormData => {
  const nameParts = administrateur.name.split(' ');
  const prenom = nameParts[0] || "";
  const nom = nameParts.length > 1 ? nameParts.slice(1).join(' ') : "";

  return {
    nom: nom,
    prenom: prenom,
    email: administrateur.email,
    numero: "",
    profession: "",
    niveauEtude: "",
    filiere: "",
    role: "Admin",
    status: administrateur.status,
  };
};

const mapAdministrateurDisplayToUserDisplay = (administrateur: AdministrateurDisplay, userDb?: UserDb): UserDisplay => {
  return {
    id: administrateur.id,
    name: administrateur.name,
    email: administrateur.email,
    role: "Admin",
    status: administrateur.status,
    joinedDate: administrateur.joinedDate,
    courses: administrateur.courses,
    avatar: administrateur.avatar,
    phone: userDb?.phone || undefined,
  };
};


export function AdministrateursList() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const promoteUserModal = useModal<UserDb>();
  const userCreationModal = useModal<UserDb>();
  const editModal = useModal<AdministrateurDisplay>();
  const deleteModal = useModal<AdministrateurDisplay>();
  const viewModal = useModal<AdministrateurDisplay>();
  const blacklistModal = useModal<AdministrateurDisplay>();
  const unblacklistModal = useModal<AdministrateurDisplay>();
  const unenrollModal = useModal<AdministrateurDisplay>();

  const [administrateurs, setAdministrateurs] = useState<AdministrateurDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewModalUserData, setViewModalUserData] = useState<UserDb | null>(null);
  const [rawAdminsData, setRawAdminsData] = useState<any[]>([]);
  
  const { searchQuery, setSearchQuery, filteredData } = useSearch<AdministrateurDisplay>({
    data: administrateurs,
    searchKeys: ["name", "email"],
  });

  const fetchAdministrateurs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllAdmins();
      let adminsData: any[] = [];
      
      if (Array.isArray(response)) {
        adminsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        adminsData = response.data;
      } else if (response?.ok && response?.data && Array.isArray(response.data)) {
        adminsData = response.data;
      } else {
        toast({
          title: t('common.error'),
          description: t('users.admins.toasts.error_unexpected_response'),
          variant: "destructive",
        });
        setAdministrateurs([]);
        return;
      }
      
      setRawAdminsData(adminsData);
      setAdministrateurs(adminsData.map(admin => mapAdminToAdministrateurDisplay(admin, t)));
    } catch (err: any) {
      toast({
        title: t('common.error'),
        description: err.message || t('users.admins.toasts.error_fetch_list'),
        variant: "destructive",
      });
      console.error("Error fetching administrators:", err);
      setAdministrateurs([]);
    } finally {
      setLoading(false);
    }
  }, [t, toast]);

  useEffect(() => {
    fetchAdministrateurs();
  }, [fetchAdministrateurs]);

  const handlePromoteUserToAdmin = async (userId: number) => {
    try {
      await adminService.promoteUserToAdmin(userId);
      toast({
        title: t('common.success'),
        description: t('users.admins.toasts.success_promote'),
      });
      fetchAdministrateurs();
    } catch (err: any) {
      toast({
        title: t('common.error'),
        description: err.message || t('users.admins.toasts.error_promote'),
        variant: "destructive",
      });
      console.error("Error promoting user to admin:", err);
    } finally {
      promoteUserModal.close();
    }
  };

  const handleUpdateAdministrateur = async (data: UserFormData) => {
    if (editModal.selectedItem) {
      try {
        const adminId = editModal.selectedItem.id;
        const updatedAdminData: Partial<UserDb> = {
          fullName: `${data.prenom || ''} ${data.nom || ''}`.trim(),
          email: data.email,
          phone: data.numero || "",
          activate: data.status === "Actif",
        };

        await adminService.updateAdmin(adminId, updatedAdminData);
        toast({
          title: t('common.success'),
          description: t('users.admins.toasts.success_update'),
        });
        fetchAdministrateurs();
      } catch (err: any) {
        toast({
          title: t('common.error'),
          description: err.message || t('users.admins.toasts.error_update'),
          variant: "destructive",
        });
        console.error("Error updating administrator:", err);
      } finally {
        editModal.close();
      }
    }
  };

  const handleDeleteAdministrateur = async () => {
    if (deleteModal.selectedItem) {
      try {
        await adminService.deleteAdmin(deleteModal.selectedItem.id);
        toast({
          title: t('common.success'),
          description: t('users.admins.toasts.success_delete'),
        });
        fetchAdministrateurs();
      } catch (err: any) {
        toast({
          title: t('common.error'),
          description: err.message || t('users.admins.toasts.error_delete'),
          variant: "destructive",
        });
        console.error("Error deleting administrator:", err);
      } finally {
        deleteModal.close();
      }
    }
  };

  const handleUserCreated = (user: { id: number; fullName: string; email: string }) => {
    toast({
      title: t('users.learners.toasts.success_user_created', { name: user.fullName }), // Reusing learner toast
      description: t('users.admins.toasts.success_user_created', { name: user.fullName }),
    });
    userCreationModal.close();
    promoteUserModal.open();
  };

  const handleBlacklist = useCallback(async () => {
    if (blacklistModal.selectedItem) {
      try {
        // Récupérer le userId depuis les données brutes
        const adminData = rawAdminsData.find((admin: any) => admin.id === blacklistModal.selectedItem?.id);
        const userId = adminData?.userId || adminData?.user?.id;
        
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
        fetchAdministrateurs();
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
  }, [blacklistModal, rawAdminsData, toast, t, fetchAdministrateurs]);

  const handleUnblacklist = useCallback(async () => {
    if (unblacklistModal.selectedItem) {
      try {
        // Récupérer le userId depuis les données brutes
        const adminData = rawAdminsData.find((admin: any) => admin.id === unblacklistModal.selectedItem?.id);
        const userId = adminData?.userId || adminData?.user?.id;
        
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
        fetchAdministrateurs();
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
  }, [unblacklistModal, rawAdminsData, toast, t, fetchAdministrateurs]);

  const handleUnenroll = useCallback(async (courseId: number) => {
    if (unenrollModal.selectedItem) {
      try {
        // Récupérer le userId depuis les données brutes
        const adminData = rawAdminsData.find((admin: any) => admin.id === unenrollModal.selectedItem?.id);
        const userId = adminData?.userId || adminData?.user?.id;
        
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
        fetchAdministrateurs();
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
  }, [unenrollModal, rawAdminsData, toast, t, fetchAdministrateurs]);

  const columns: ColumnDef<AdministrateurDisplay>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: t('users.admins.list.header_admin'),
        cell: ({ row }) => {
          const administrateur = row.original
          return (
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage 
                  src={
                    administrateur.avatar 
                      ? (administrateur.avatar.startsWith("http") 
                          ? administrateur.avatar 
                          : `${FULL_API_URL}${administrateur.avatar.startsWith("/") ? "" : "/"}${administrateur.avatar}`)
                      : "/placeholder.svg"
                  } 
                  alt={administrateur.name} 
                />
                <AvatarFallback>{administrateur.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {administrateur.name}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Mail className="h-3.5 w-3.5" />
                  {administrateur.email}
                </div>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: "status",
        header: t('users.admins.list.header_status'),
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "joinedDate",
        header: t('users.admins.list.header_joined_date'),
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            {row.original.joinedDate}
          </div>
        ),
      },
      {
        accessorKey: "courses",
        header: t('users.admins.list.header_courses_managed'),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            {row.original.courses}
          </div>
        ),
      },
      {
        id: "actions",
        header: t('users.admins.list.header_actions'),
        cell: ({ row }) => {
          const administrateur = row.original
          return (
            <ActionMenu
              actions={[
                {
                  label: t('users.admins.list.action_view_details'),
                  icon: <Eye className="h-4 w-4" />,
                  onClick: async () => {
                    viewModal.open(administrateur);
                    try {
                      const adminDetails = await adminService.getAdminById(administrateur.id);
                      const admin = adminDetails?.data || adminDetails;
                      const userData = admin?.user || admin;
                      setViewModalUserData(userData || null);
                    } catch (err) {
                      console.error("Error fetching admin details:", err);
                      setViewModalUserData(null);
                    }
                  },
                },
                {
                  label: t('users.admins.list.action_edit'),
                  icon: <Edit className="h-4 w-4" />,
                  onClick: () => editModal.open(administrateur),
                },
                {
                  label: administrateur.status === "Actif" 
                    ? t('users.admins.list.action_blacklist')
                    : t('users.admins.list.action_unblacklist'),
                  icon: administrateur.status === "Actif" 
                    ? <Ban className="h-4 w-4" />
                    : <UserCheck className="h-4 w-4" />,
                  onClick: () => {
                    if (administrateur.status === "Actif") {
                      blacklistModal.open(administrateur);
                    } else {
                      unblacklistModal.open(administrateur);
                    }
                  },
                  variant: administrateur.status === "Actif" ? "destructive" : "default",
                },
                {
                  label: t('users.admins.list.action_unenroll'),
                  icon: <LogOut className="h-4 w-4" />,
                  onClick: () => unenrollModal.open(administrateur),
                },
                {
                  label: t('users.admins.list.action_delete'),
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: () => deleteModal.open(administrateur),
                  variant: "destructive",
                },
              ]}
            />
          )
        },
      },
    ],
    [viewModal, editModal, deleteModal, blacklistModal, unblacklistModal, unenrollModal, t]
  )

  const adminUserIds = useMemo(() => {
    return rawAdminsData
      .map((admin: any) => admin.userId)
      .filter((id: any): id is number => id != null && typeof id === 'number');
  }, [rawAdminsData]);

  return (
    <>
      <PageHeader
        title={t('users.admins.list.title')}
        action={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="default" size="default" className="bg-[rgb(255,102,0)] hover:bg-[rgb(255,102,0)]/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                {t('users.admins.list.add_button')}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{t('users.admins.list.add_options_title')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => userCreationModal.open()}>
                {t('users.admins.list.add_option_create')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => promoteUserModal.open()}>
                {t('users.admins.list.add_option_promote')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <Card className="mt-6">
        <CardContent>
          <div className="mb-4">
            <SearchBar
              placeholder={t('users.admins.list.search_placeholder')}
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
          {loading ? (
            <PageLoader />
          ) : filteredData.length === 0 ? (
            <EmptyState
              icon={Shield}
              title={t('users.admins.list.empty_title')}
              description={t('users.admins.list.empty_description')}
            />
          ) : (
            <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
          )}
        </CardContent>
      </Card>

      <UserSelectModal
        open={promoteUserModal.isOpen}
        onOpenChange={(open) => !open && promoteUserModal.close()}
        onSelectUser={handlePromoteUserToAdmin}
        title={t('users.admins.modals.promote_title')}
        description={t('users.admins.modals.promote_description')}
        excludeUserIds={adminUserIds}
      />

      <UserCreationModal
        open={userCreationModal.isOpen}
        onOpenChange={(open) => !open && userCreationModal.close()}
        onUserCreated={handleUserCreated}
        title={t('users.admins.modals.create_title')}
        description={t('users.admins.modals.create_description')}
        submitLabel={t('users.admins.modals.create_submit')}
      />

      {editModal.selectedItem && (
        <UserFormModal
          open={editModal.isOpen}
          onOpenChange={(open) => !open && editModal.close()}
          title={t('users.admins.modals.edit_title')}
          description={t('users.admins.modals.edit_description')}
          defaultValues={mapAdministrateurDisplayToUserFormData(editModal.selectedItem)}
          onSubmit={handleUpdateAdministrateur}
          submitLabel={t('users.admins.modals.edit_submit')}
        />
      )}

      {viewModal.selectedItem && (
        <ViewUserModal
          open={viewModal.isOpen}
          onOpenChange={(open) => {
            if (!open) {
              viewModal.close();
              setViewModalUserData(null);
            }
          }}
          user={mapAdministrateurDisplayToUserDisplay(viewModal.selectedItem, viewModalUserData || undefined)}
        />
      )}

      <ConfirmDialog
        open={deleteModal.isOpen}
        onOpenChange={(open) => !open && deleteModal.close()}
        onConfirm={handleDeleteAdministrateur}
        title={t('users.admins.modals.delete_title')}
        description={t('users.admins.modals.delete_description', { name: deleteModal.selectedItem?.name })}
        confirmText={t('common.delete')}
        variant="destructive"
      />

      <ConfirmDialog
        open={blacklistModal.isOpen}
        onOpenChange={(open) => !open && blacklistModal.close()}
        onConfirm={handleBlacklist}
        title={t('users.admins.modals.blacklist_title')}
        description={t('users.admins.modals.blacklist_description', { name: blacklistModal.selectedItem?.name })}
        confirmText={t('users.admins.list.action_blacklist')}
        variant="destructive"
      />

      <ConfirmDialog
        open={unblacklistModal.isOpen}
        onOpenChange={(open) => !open && unblacklistModal.close()}
        onConfirm={handleUnblacklist}
        title={t('users.admins.modals.unblacklist_title')}
        description={t('users.admins.modals.unblacklist_description', { name: unblacklistModal.selectedItem?.name })}
        confirmText={t('users.admins.list.action_unblacklist')}
        variant="default"
      />

      {unenrollModal.selectedItem && (() => {
        const adminData = rawAdminsData.find((admin: any) => admin.id === unenrollModal.selectedItem?.id);
        const userId = adminData?.userId || adminData?.user?.id;
        return userId ? (
          <CourseSelectModal
            open={unenrollModal.isOpen}
            onOpenChange={(open) => !open && unenrollModal.close()}
            onSelectCourse={handleUnenroll}
            userId={userId}
            title={t('users.admins.modals.unenroll_title')}
            description={t('users.admins.modals.unenroll_description', { name: unenrollModal.selectedItem?.name })}
          />
        ) : null;
      })()}
    </>
  )
}