"use client"

import { useState, useMemo, useEffect } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { SearchBar } from "@/components/ui/search-bar"
import { DataTable } from "@/components/ui/data-table"
import { ActionMenu } from "@/components/ui/action-menu"
import { Card, CardContent } from "@/components/ui/card"
import { useModal } from "@/hooks/use-modal"
import { useSearch } from "@/hooks/use-search"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Edit, Trash2, BookOpen, FileText, Link as LinkIcon, Image as ImageIcon, Target, Users as UsersIcon, Clock } from "lucide-react"
import { RubriqueFormModal } from "@/components/shared/rubrique-form-modal"
import { ApiRubrique, rubriqueService } from "@/services/rubrique.service"
import { PageLoader } from "@/components/ui/page-loader"
import type { RubriqueFormData } from "@/lib/validations/rubrique"

type RubriqueDisplay = {
  id: number
  rubrique: string
  image: string | null
  description: string | null
  objectifs: string | null
  publicCible: string | null // Updated casing
  dureeFormat: string | null // Updated casing
  lien_ressources: string | null
  formationsProposees: string | null // Added field
}

const mapApiRubriqueToRubriqueDisplay = (rubrique: ApiRubrique): RubriqueDisplay => {
  return {
    id: rubrique.id,
    rubrique: rubrique.rubrique,
    image: rubrique.image,
    description: rubrique.description,
    objectifs: rubrique.objectifs,
    publicCible: rubrique.public_cible, // Map snake_case to camelCase
    dureeFormat: rubrique.duree_format, // Map snake_case to camelCase
    lien_ressources: rubrique.lien_ressources,
    formationsProposees: rubrique.formations_proposees || null, // Map snake_case to camelCase
  };
};

export function RubriquesList() {
  const addModal = useModal<RubriqueDisplay>();
  const editModal = useModal<RubriqueDisplay>();
  const deleteModal = useModal<RubriqueDisplay>();
  const viewModal = useModal<RubriqueDisplay>(); // Assuming a ViewRubriqueModal would be similar

  const [rubriques, setRubriques] = useState<RubriqueDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRubriques = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await rubriqueService.getAllRubriques();
      setRubriques(response.map(mapApiRubriqueToRubriqueDisplay));
    } catch (err: any) {
      setError(err.message || "Failed to fetch rubriques.");
      console.error("Error fetching rubriques:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRubriques();
  }, []);

  const { searchQuery, setSearchQuery, filteredData } = useSearch<RubriqueDisplay>({
    data: rubriques,
    searchKeys: ["rubrique", "description", "objectifs", "public_cible"],
  });

  const handleAddRubrique = async (data: RubriqueFormData & { imageFile?: File | undefined }) => { // Mise à jour du type de `data`
    setError(null);
    try {
      const { imageFile, ...rubriqueData } = data; // Separate imageFile from other data
      const createdRubrique = await rubriqueService.createRubrique(rubriqueData, imageFile); // imageFile est déjà un File | undefined
      setRubriques((prev) => [...prev, mapApiRubriqueToRubriqueDisplay(createdRubrique)]);
      addModal.close();
    } catch (err: any) {
      setError(err.message || "Failed to add rubrique.");
      console.error("Error adding rubrique:", err);
    }
  };

  const handleUpdateRubrique = async (data: RubriqueFormData & { imageFile?: File | undefined }) => { // Mise à jour du type de `data`
    setError(null);
    if (editModal.selectedItem) {
      try {
        const { imageFile, ...rubriqueData } = data; // Separate imageFile from other data

        // Construct the payload for the PUT request (JSON body, image path string)
        const payload: Partial<ApiRubrique> = {
            rubrique: rubriqueData.rubrique,
            description: rubriqueData.description,
            objectifs: rubriqueData.objectifs,
            public_cible: rubriqueData.publicCible, // Map camelCase to snake_case for API
            duree_format: rubriqueData.dureeFormat, // Map camelCase to snake_case for API
            lien_ressources: rubriqueData.lienRessources,
            formations_proposees: rubriqueData.formationsProposees, // Map camelCase to snake_case for API
            image: rubriqueData.image, // Image path as string
        };

        const updatedRubrique = await rubriqueService.updateRubrique(
          editModal.selectedItem.id, 
          payload, // Send JSON payload
          imageFile // Passer imageFile
        );
        setRubriques((prev) =>
          prev.map((rubrique) =>
            rubrique.id === editModal.selectedItem!.id ? { ...rubrique, ...mapApiRubriqueToRubriqueDisplay(updatedRubrique) } : rubrique
          )
        );
        editModal.close();
      } catch (err: any) {
        setError(err.message || "Failed to update rubrique.");
        console.error("Error updating rubrique:", err);
      }
    }
  };

  const handleDeleteRubrique = async () => {
    setError(null);
    if (deleteModal.selectedItem) {
      try {
        await rubriqueService.deleteRubrique(deleteModal.selectedItem.id);
        setRubriques((prev) => prev.filter((rubrique) => rubrique.id !== deleteModal.selectedItem!.id));
        deleteModal.close();
      } catch (err: any) {
        setError(err.message || "Failed to delete rubrique.");
        console.error("Error deleting rubrique:", err);
      }
    }
  };

  const columns: ColumnDef<RubriqueDisplay>[] = useMemo(
    () => [
      {
        accessorKey: "rubrique",
        header: "Rubrique",
        cell: ({ row }) => (
          <div className="font-medium">{row.original.rubrique}</div>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground line-clamp-2">{row.original.description}</div>
        ),
      },
      {
        accessorKey: "objectifs",
        header: "Objectifs",
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground line-clamp-2">{row.original.objectifs}</div>
        ),
      },
      {
        accessorKey: "publicCible", // Updated accessorKey
        header: "Public Cible", // Updated header
        cell: ({ row }) => (
          <div className="text-sm text-muted-foreground line-clamp-2">{row.original.publicCible}</div>
        ),
      },
      {
        accessorKey: "dureeFormat", // Updated accessorKey
        header: "Durée / Format",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            {row.original.dureeFormat}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const rubrique = row.original;
          return (
            <ActionMenu
              actions={[
                {
                  label: "Voir détails",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => viewModal.open(rubrique),
                },
                {
                  label: "Modifier",
                  icon: <Edit className="h-4 w-4" />,
                  onClick: () => editModal.open(rubrique),
                },
                {
                  label: "Supprimer",
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: () => deleteModal.open(rubrique),
                  variant: "destructive",
                },
              ]}
            />
          );
        },
      },
    ],
    [viewModal, editModal, deleteModal]
  );

  return (
    <>
      <PageHeader
        title="Rubriques"
        action={{
          label: "Ajouter une rubrique",
          onClick: () => addModal.open(),
        }}
      />

      <Card className="mt-6">
        <CardContent>
          <div className="mb-4">
            <SearchBar
              placeholder="Rechercher une rubrique..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
          {loading ? (
            <PageLoader />
          ) : error ? (
            <div className="text-center text-destructive p-4">{error}</div>
          ) : filteredData.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              Aucune rubrique trouvée.
            </div>
          ) : (
            <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
          )}
        </CardContent>
      </Card>

      <RubriqueFormModal
        open={addModal.isOpen}
        onOpenChange={(open) => !open && addModal.close()}
        title="Ajouter une rubrique"
        description="Créez une nouvelle rubrique pour organiser le contenu"
        onSubmit={handleAddRubrique}
        submitLabel="Créer la rubrique"
      />

      {editModal.selectedItem && (
        <RubriqueFormModal
          open={editModal.isOpen}
          onOpenChange={(open) => !open && editModal.close()}
          title="Modifier la rubrique"
          description="Modifiez les informations de la rubrique"
          defaultValues={editModal.selectedItem}
          onSubmit={handleUpdateRubrique}
          submitLabel="Enregistrer les modifications"
        />
      )}
      
      {viewModal.selectedItem && (
        <ViewRubriqueModal
          open={viewModal.isOpen}
          onOpenChange={(open) => !open && viewModal.close()}
          rubrique={viewModal.selectedItem}
        />
      )}

      <ConfirmDialog
        open={deleteModal.isOpen}
        onOpenChange={(open) => !open && deleteModal.close()}
        onConfirm={handleDeleteRubrique}
        title="Supprimer la rubrique"
        description={`Êtes-vous sûr de vouloir supprimer ${deleteModal.selectedItem?.rubrique} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="destructive"
      />
    </>
  );
}
