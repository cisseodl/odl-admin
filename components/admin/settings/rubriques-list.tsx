// components/admin/settings/rubriques-list.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useLanguage } from "@/contexts/language-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageLoader } from "@/components/ui/page-loader";
import { ActionMenu } from "@/components/ui/action-menu";
import { useToast } from "@/hooks/use-toast";
import { rubriqueService } from "@/services/rubrique.service";
import { Rubrique } from "@/models/rubrique.model";
import { Plus, Edit, Trash2, Image, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useModal } from "@/hooks/use-modal";
import { RubriqueFormModal, RubriqueFormData } from "@/components/shared/rubrique-form-modal";


type RubriqueDisplay = Rubrique;

export function RubriquesList() {
  const { t } = useLanguage()
  const { toast } = useToast();
  const [rubriques, setRubriques] = useState<RubriqueDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  const addModal = useModal<RubriqueDisplay>();
  const editModal = useModal<RubriqueDisplay>();
  const deleteModal = useModal<RubriqueDisplay>();

  const fetchRubriques = useCallback(async () => {
    setLoading(true);
    try {
      const response = await rubriqueService.getAllRubriques();
      if (response && Array.isArray(response.data)) {
        setRubriques(response.data);
      } else {
        console.error("Unexpected response structure:", response);
        setRubriques([]);
        toast({
          title: t('rubriques.toasts.error_data'),
          description: t('rubriques.toasts.error_unexpected_response'),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to fetch rubriques:", error);
      toast({
        title: t('common.error'),
        description: t('rubriques.toasts.error_fetch'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRubriques();
  }, [fetchRubriques]);

  const handleAddRubrique = async (data: RubriqueFormData) => {
    try {
      const newRubrique: Omit<Rubrique, 'id'> = {
        rubrique: data.rubrique,
        description: data.description,
        objectifs: data.objectifs,
        publicCible: data.publicCible,
        dureeFormat: data.dureeFormat,
        lienRessources: data.lienRessources,
        formationsProposees: data.formationsProposees,
      };
      await rubriqueService.createRubrique(newRubrique, data.imageFile);
      toast({
        title: t('common.success'),
        description: t('rubriques.toasts.success_add'),
      });
      fetchRubriques();
    } catch (error) {
      console.error("Failed to add rubrique:", error);
      toast({
        title: t('common.error'),
        description: t('rubriques.toasts.error_add'),
        variant: "destructive",
      });
    } finally {
      addModal.close();
    }
  };

  const handleUpdateRubrique = async (data: RubriqueFormData) => {
    if (!editModal.selectedItem?.id) return;
    try {
      const updatedRubrique: Partial<Omit<Rubrique, 'id'>> = {
        rubrique: data.rubrique,
        description: data.description,
        objectifs: data.objectifs,
        publicCible: data.publicCible,
        dureeFormat: data.dureeFormat,
        lienRessources: data.lienRessources,
        formationsProposees: data.formationsProposees,
      };
      await rubriqueService.updateRubrique(editModal.selectedItem.id, updatedRubrique, data.imageFile);
      toast({
        title: t('common.success'),
        description: t('rubriques.toasts.success_update'),
      });
      fetchRubriques();
    } catch (error) {
      console.error("Failed to update rubrique:", error);
      toast({
        title: t('common.error'),
        description: t('rubriques.toasts.error_update'),
        variant: "destructive",
      });
    } finally {
      editModal.close();
    }
  };


  const handleDeleteRubrique = async () => {
    if (!deleteModal.selectedItem) return;
    try {
      await rubriqueService.deleteRubrique(deleteModal.selectedItem.id!);
      toast({
        title: t('common.success'),
        description: t('rubriques.toasts.success_delete'),
      });
      fetchRubriques();
    } catch (error) {
      console.error("Failed to delete rubrique:", error);
      toast({
        title: t('common.error'),
        description: t('rubriques.toasts.error_delete'),
        variant: "destructive",
      });
    } finally {
      deleteModal.close();
    }
  };

  const columns = useMemo(() => [
    {
      accessorKey: "rubrique",
      header: t('rubriques.table.header_rubrique'),
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={row.original.image} alt={row.original.rubrique} className="h-10 w-10 rounded-md object-cover" />
          )}
          <div>
            <div className="font-medium">{row.original.rubrique}</div>
            {row.original.description && (
              <div className="text-sm text-muted-foreground line-clamp-1">{row.original.description}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "objectifs",
      header: t('rubriques.table.header_objectifs'),
      cell: ({ row }) => <div className="text-sm line-clamp-2">{row.original.objectifs}</div>,
    },
    {
      accessorKey: "publicCible",
      header: t('rubriques.table.header_public_cible'),
      cell: ({ row }) => <div className="text-sm">{row.original.publicCible}</div>,
    },
    {
      accessorKey: "dureeFormat",
      header: t('rubriques.table.header_duree'),
      cell: ({ row }) => <div className="text-sm">{row.original.dureeFormat}</div>,
    },
    {
      id: "actions",
      header: t('common.actions'),
      cell: ({ row }) => (
        <ActionMenu
          actions={[
            {
              label: t('common.edit'),
              icon: <Edit className="h-4 w-4" />,
              onClick: () => editModal.open(row.original),
            },
            {
              label: t('common.delete'),
              icon: <Trash2 className="h-4 w-4" />,
              onClick: () => deleteModal.open(row.original),
              variant: "destructive",
            },
          ]}
        />
      ),
    },
  ], [editModal, deleteModal, t]);


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-2xl font-bold">{t('rubriques.title')}</CardTitle>
        <Button size="sm" onClick={() => addModal.open()}>
          <Plus className="h-4 w-4 mr-2" />
          {t('rubriques.actions.add')}
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <PageLoader />
        ) : (
          <DataTable columns={columns} data={rubriques} />
        )}
      </CardContent>

      <RubriqueFormModal
        open={addModal.isOpen}
        onOpenChange={(open) => !open && addModal.close()}
        title={t('rubriques.modals.add_title')}
        description={t('rubriques.modals.add_description')}
        submitLabel={t('rubriques.modals.add_submit')}
        onSubmit={handleAddRubrique}
      />

      {editModal.selectedItem && (
        <RubriqueFormModal
          open={editModal.isOpen}
          onOpenChange={(open) => !open && editModal.close()}
          title={t('rubriques.modals.edit_title')}
          description={t('rubriques.modals.edit_description')}
          submitLabel={t('rubriques.modals.edit_submit')}
          onSubmit={handleUpdateRubrique}
          defaultValues={editModal.selectedItem}
        />
      )}

      <ConfirmDialog
        open={deleteModal.isOpen}
        onOpenChange={(isOpen) => deleteModal.close()}
        onConfirm={handleDeleteRubrique}
        title={t('rubriques.modals.delete_title')}
        description={t('rubriques.modals.delete_description').replace('{{name}}', deleteModal.selectedItem?.rubrique || '')}
        confirmText={t('rubriques.modals.delete_confirm')}
        variant="destructive"
      />
    </Card>
  );
}