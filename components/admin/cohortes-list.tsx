// components/admin/cohortes-list.tsx
"use client"

import { useState, useMemo, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { PageHeader } from "@/components/ui/page-header"
import { SearchBar } from "@/components/ui/search-bar"
import { DataTable } from "@/components/ui/data-table"
import { ActionMenu } from "@/components/ui/action-menu"
import { StatusBadge } from "@/components/ui/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { useModal } from "@/hooks/use-modal"
import { useSearch } from "@/hooks/use-search"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Edit, Trash2, Users, Calendar, Clock } from "lucide-react"

import { Cohorte } from "@/models";
import { cohorteService } from "@/services";
import { PageLoader } from "@/components/ui/page-loader";
import { EmptyState } from "./empty-state";
// Assume CohorteFormModal and ViewCohorteModal exist or need to be created
import { CohorteFormModal } from "@/components/shared/cohorte-form-modal"; // Placeholder
import { ViewCohorteModal } from "./cohortes/modals/view-cohorte-modal"; // Corrected path
type CohorteDisplay = {
  id: number
  nom: string
  description?: string
  dateDebut: string
  dateFin: string
  status: "Active" | "Terminée" | "À venir"
}

// Helper function to map Cohorte to CohorteDisplay
const mapCohorteToCohorteDisplay = (cohorte: Cohorte): CohorteDisplay => {
  const startDate = cohorte.dateDebut ? new Date(cohorte.dateDebut) : null;
  const endDate = cohorte.dateFin ? new Date(cohorte.dateFin) : null;
  const now = new Date();

  let status: CohorteDisplay['status'];
  if (startDate && startDate > now) {
    status = "À venir";
  } else if (endDate && endDate < now) {
    status = "Terminée";
  } else {
    status = "Active";
  }

  return {
    id: cohorte.id || 0,
    nom: cohorte.nom || "N/A",
    description: cohorte.description || "N/A",
    dateDebut: startDate ? startDate.toLocaleDateString("fr-FR") : "N/A",
    dateFin: endDate ? endDate.toLocaleDateString("fr-FR") : "N/A",
    status: status,
  };
};

export function CohortesList() {
  const { t } = useLanguage()
  const addModal = useModal<CohorteDisplay>()
  const editModal = useModal<CohorteDisplay>()
  const deleteModal = useModal<CohorteDisplay>()
  const viewModal = useModal<CohorteDisplay>()

  const [cohortes, setCohortes] = useState<CohorteDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCohortes = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await cohorteService.getAllCohortes();
        setCohortes(response.map(mapCohorteToCohorteDisplay));
      } catch (err: any) {
        setError(err.message || "Failed to fetch cohortes.");
        console.error("Error fetching cohortes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCohortes();
  }, []);

  const { searchQuery, setSearchQuery, filteredData } = useSearch<CohorteDisplay>({
    data: cohortes,
    searchKeys: ["nom", "description"],
  });

  const handleAddCohorte = async (data: CohorteFormData) => {
    setError(null);
    try {
      const newCohorteData = {
        nom: data.nom,
        description: data.description,
        dateDebut: data.dateDebut, // Already ISO string from form
        dateFin: data.dateFin,     // Already ISO string from form
      };
      const createdCohorte = await cohorteService.createCohorte(newCohorteData);
      setCohortes((prev) => [...prev, mapCohorteToCohorteDisplay(createdCohorte)]);
      addModal.close();
    } catch (err: any) {
      setError(err.message || "Failed to add cohorte.");
      console.error("Error adding cohorte:", err);
    }
  };

  const handleUpdateCohorte = async (data: CohorteFormData) => {
    setError(null);
    if (editModal.selectedItem) {
      try {
        const updatedCohorteData: Cohorte = {
          id: editModal.selectedItem.id,
          nom: data.nom,
          description: data.description,
          dateDebut: data.dateDebut,
          dateFin: data.dateFin,
          activate: editModal.selectedItem.status !== "Terminée",
        };
        await cohorteService.updateCohorte(updatedCohorteData);
        setCohortes((prev) =>
          prev.map((cohorte) =>
            cohorte.id === editModal.selectedItem!.id ? { ...cohorte, ...mapCohorteToCohorteDisplay(updatedCohorteData) } : cohorte
          )
        );
        editModal.close();
      } catch (err: any) {
        setError(err.message || "Failed to update cohorte.");
        console.error("Error updating cohorte:", err);
      }
    }
  };

  const handleDeleteCohorte = async () => {
    setError(null);
    if (deleteModal.selectedItem) {
      try {
        await cohorteService.deleteCohorte(deleteModal.selectedItem.id);
        setCohortes((prev) => prev.filter((cohorte) => cohorte.id !== deleteModal.selectedItem!.id));
        deleteModal.close();
      } catch (err: any) {
        setError(err.message || "Failed to delete cohorte.");
        console.error("Error deleting cohorte:", err);
      }
    }
  };

  const columns: ColumnDef<CohorteDisplay>[] = useMemo(
    () => [
      {
        accessorKey: "nom",
        header: t('cohortes.list.header_cohorte'),
        cell: ({ row }) => (
          <div className="font-medium flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            {row.original.nom}
          </div>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
      },
      {
        accessorKey: "dateDebut",
        header: "Date de début",
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            {row.original.dateDebut}
          </div>
        ),
      },
      {
        accessorKey: "dateFin",
        header: t('cohortes.list.header_end_date'),
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            {row.original.dateFin}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Statut",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const cohorte = row.original;
          return (
            <ActionMenu
              actions={[
                {
                  label: "Voir détails",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => viewModal.open(cohorte),
                },
                {
                  label: "Modifier",
                  icon: <Edit className="h-4 w-4" />,
                  onClick: () => editModal.open(cohorte),
                },
                {
                  label: "Supprimer",
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: () => deleteModal.open(cohorte),
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
        title={t('cohortes.list.title')}
        action={{
          label: t('cohortes.list.add_button'),
          onClick: () => addModal.open(),
        }}
      />

      <Card className="mt-6">
        <CardContent>
          <div className="mb-4">
            <SearchBar
              placeholder={t('cohortes.list.search_placeholder')}
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
          {loading ? (
            <PageLoader />
          ) : error ? (
            <div className="text-center text-destructive p-4">{error}</div>
          ) : filteredData.length === 0 ? (
            <EmptyState
              icon={Users}
              title={t('cohortes.list.empty_title')}
              description={t('cohortes.list.empty_description')}
            />
          ) : (
            <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
          )}
        </CardContent>
      </Card>

      {/* Modals for Add, Edit, View, Delete */}
      <CohorteFormModal
        open={addModal.isOpen}
        onOpenChange={(open) => !open && addModal.close()}
        title={t('cohortes.modals.add_title')}
        description={t('cohortes.modals.add_description')}
        onSubmit={handleAddCohorte}
        submitLabel={t('cohortes.modals.add_submit')}
      />

      {editModal.selectedItem && (
        <CohorteFormModal
          open={editModal.isOpen}
          onOpenChange={(open) => !open && editModal.close()}
          title={t('cohortes.modals.edit_title')}
          description={t('cohortes.modals.edit_description')}
          defaultValues={editModal.selectedItem}
          onSubmit={handleUpdateCohorte}
          submitLabel={t('cohortes.modals.edit_submit')}
        />
      )}

      {viewModal.selectedItem && (
        <ViewCohorteModal
          open={viewModal.isOpen}
          onOpenChange={(open) => !open && viewModal.close()}
          cohorte={viewModal.selectedItem}
        />
      )}

      <ConfirmDialog
        open={deleteModal.isOpen}
        onOpenChange={(open) => !open && deleteModal.close()}
        onConfirm={handleDeleteCohorte}
        title={t('cohortes.modals.delete_title')}
        description={t('cohortes.modals.delete_description').replace('{{name}}', deleteModal.selectedItem?.nom || '')}
        confirmText={t('cohortes.modals.delete_confirm')}
        variant="destructive"
      />
    </>
  )
}
