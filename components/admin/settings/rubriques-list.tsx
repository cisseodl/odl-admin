// components/admin/settings/rubriques-list.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
          title: "Erreur de données",
          description: "La réponse de l'API pour les rubriques est inattendue.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to fetch rubriques:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les rubriques.",
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
      };
      await rubriqueService.createRubrique(newRubrique, data.imageFile);
      toast({
        title: "Succès",
        description: "La rubrique a été ajoutée avec succès.",
      });
      fetchRubriques();
    } catch (error) {
      console.error("Failed to add rubrique:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la rubrique.",
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
      };
      await rubriqueService.updateRubrique(editModal.selectedItem.id, updatedRubrique, data.imageFile);
      toast({
        title: "Succès",
        description: "La rubrique a été mise à jour.",
      });
      fetchRubriques();
    } catch (error) {
      console.error("Failed to update rubrique:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la rubrique.",
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
        title: "Succès",
        description: "La rubrique a été supprimée.",
      });
      fetchRubriques();
    } catch (error) {
      console.error("Failed to delete rubrique:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la rubrique.",
        variant: "destructive",
      });
    } finally {
      deleteModal.close();
    }
  };

  const columns = useMemo(() => [
    {
      accessorKey: "rubrique",
      header: "Rubrique",
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
      header: "Objectifs",
      cell: ({ row }) => <div className="text-sm line-clamp-2">{row.original.objectifs}</div>,
    },
    {
      accessorKey: "publicCible",
      header: "Public Cible",
      cell: ({ row }) => <div className="text-sm">{row.original.publicCible}</div>,
    },
    {
      accessorKey: "dureeFormat",
      header: "Durée",
      cell: ({ row }) => <div className="text-sm">{row.original.dureeFormat}</div>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ActionMenu
          actions={[
            {
              label: "Modifier",
              icon: <Edit className="h-4 w-4" />,
              onClick: () => editModal.open(row.original),
            },
            {
              label: "Supprimer",
              icon: <Trash2 className="h-4 w-4" />,
              onClick: () => deleteModal.open(row.original),
              variant: "destructive",
            },
          ]}
        />
      ),
    },
  ], [editModal, deleteModal]);


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-2xl font-bold">Rubriques de Contenu</CardTitle>
        <Button size="sm" onClick={() => addModal.open()}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter une rubrique
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
        title="Ajouter une nouvelle rubrique"
        description="Créez une nouvelle rubrique de contenu pour organiser les formations."
        submitLabel="Ajouter la rubrique"
        onSubmit={handleAddRubrique}
      />

      {editModal.selectedItem && (
        <RubriqueFormModal
          open={editModal.isOpen}
          onOpenChange={(open) => !open && editModal.close()}
          title="Modifier la rubrique"
          description="Modifiez les informations de la rubrique sélectionnée."
          submitLabel="Enregistrer les modifications"
          onSubmit={handleUpdateRubrique}
          defaultValues={editModal.selectedItem}
        />
      )}

      <ConfirmDialog
        open={deleteModal.isOpen}
        onOpenChange={(isOpen) => deleteModal.close()}
        onConfirm={handleDeleteRubrique}
        title="Supprimer la Rubrique"
        description={`Êtes-vous sûr de vouloir supprimer la rubrique "${deleteModal.selectedItem?.rubrique}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="destructive"
      />
    </Card>
  );
}