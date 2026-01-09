"use client"

import { useState, useMemo, useEffect } from "react" // Added useEffect
import { PageHeader } from "@/components/ui/page-header"
import { SearchBar } from "@/components/ui/search-bar"
import { DataTable } from "@/components/ui/data-table"
import { ActionMenu } from "@/components/ui/action-menu"
import { StatusBadge } from "@/components/ui/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { useModal } from "@/hooks/use-modal"
import { useSearch } from "@/hooks/use-search"
import { CertificationFormModal } from "@/components/shared/certification-form-modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ViewCertificationModal } from "./modals/view-certification-modal"
import type { ColumnDef } from "@tanstack/react-table"
import { Eye, Edit, Trash2, Award, BookOpen, Users, Calendar } from "lucide-react"
import type { CertificationFormData } from "@/lib/validations/certification"

import { certificationService, Certification } from "@/services/certification.service"; // Import service and type
import { PageLoader } from "@/components/ui/page-loader"; // Import PageLoader


export function CertificationsList() {
  const addModal = useModal<Certification>()
  const editModal = useModal<Certification>()
  const deleteModal = useModal<Certification>()
  const viewModal = useModal<Certification>()

  const [certifications, setCertifications] = useState<Certification[]>([]); // Initialiser vide
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await certificationService.getAllCertifications();
        setCertifications(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch certifications.");
        console.error("Error fetching certifications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCertifications();
  }, []); // Exécuter une fois au montage

  const { searchQuery, setSearchQuery, filteredData } = useSearch<Certification>({
    data: certifications,
    searchKeys: ["name", "course"],
  })

  const handleAddCertification = async (data: CertificationFormData) => {
    setError(null);
    try {
      const newCertificationData: Omit<Certification, 'id' | 'issued'> = {
        name: data.name,
        course: data.course,
        validUntil: data.validUntil,
        status: data.status,
        requirements: data.requirements,
      };
      const createdCertification = await certificationService.createCertification(newCertificationData);
      setCertifications((prev) => [...prev, createdCertification]);
      addModal.close();
    } catch (err: any) {
      setError(err.message || "Failed to add certification.");
      console.error("Error adding certification:", err);
    }
  }

  const handleUpdateCertification = async (data: CertificationFormData) => {
    setError(null);
    if (editModal.selectedItem) {
      try {
        const updatedCertificationData: Partial<Certification> = {
          name: data.name,
          course: data.course,
          validUntil: data.validUntil,
          status: data.status,
          requirements: data.requirements,
        };
        const updatedCertification = await certificationService.updateCertification(editModal.selectedItem.id, updatedCertificationData);
        setCertifications((prev) =>
          prev.map((cert) =>
            cert.id === editModal.selectedItem!.id
              ? updatedCertification
              : cert
          )
        );
        editModal.close();
      } catch (err: any) {
        setError(err.message || "Failed to update certification.");
        console.error("Error updating certification:", err);
      }
    }
  }

  const handleDeleteCertification = async () => {
    setError(null);
    if (deleteModal.selectedItem) {
      try {
        await certificationService.deleteCertification(deleteModal.selectedItem.id);
        setCertifications((prev) => prev.filter((cert) => cert.id !== deleteModal.selectedItem!.id));
        deleteModal.close();
      } catch (err: any) {
        setError(err.message || "Failed to delete certification.");
        console.error("Error deleting certification:", err);
      }
    }
  }

  const columns: ColumnDef<Certification>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Certification",
        cell: ({ row }) => (
          <div className="font-medium flex items-center gap-2">
            <Award className="h-4 w-4 text-muted-foreground" />
            {row.original.name}
          </div>
        ),
      },
      {
        accessorKey: "course",
        header: "Formation associée",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            {row.original.course}
          </div>
        ),
      },
      {
        accessorKey: "issued",
        header: "Délivrés",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-muted-foreground" />
            {row.original.issued}
          </div>
        ),
      },
      {
        accessorKey: "validUntil",
        header: "Validité",
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {row.original.validUntil}
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
          const certification = row.original
          return (
            <ActionMenu
              actions={[
                {
                  label: "Voir détails",
                  icon: <Eye className="h-4 w-4" />,
                  onClick: () => viewModal.open(certification),
                },
                {
                  label: "Modifier",
                  icon: <Edit className="h-4 w-4" />,
                  onClick: () => editModal.open(certification),
                },
                {
                  label: "Supprimer",
                  icon: <Trash2 className="h-4 w-4" />,
                  onClick: () => deleteModal.open(certification),
                  variant: "destructive",
                },
              ]}
            />
          )
        },
      },
    ],
    [viewModal, editModal, deleteModal]
  )

  return (
    <>
      <PageHeader
        title="Certifications"
        action={{
          label: "Créer une certification",
          onClick: () => addModal.open(),
        }}
      />

      <Card className="mt-6">
        <CardContent>
          {loading ? (
            <PageLoader />
          ) : error ? (
            <div className="text-center text-destructive p-4">{error}</div>
          ) : (
            <>
              <div className="mb-4">
                <SearchBar
                  placeholder="Rechercher une certification..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
              </div>
              {certifications.length === 0 ? (
                <div className="text-center text-muted-foreground p-4">Aucune certification trouvée.</div>
              ) : (
                <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
              )}
            </>
          )}
        </CardContent>
      </Card>

      <CertificationFormModal
        open={addModal.isOpen}
        onOpenChange={(open) => !open && addModal.close()}
        title="Créer une certification"
        description="Créez une nouvelle certification pour la plateforme"
        onSubmit={handleAddCertification}
        submitLabel="Créer la certification"
      />

      {editModal.selectedItem && (
        <CertificationFormModal
          open={editModal.isOpen}
          onOpenChange={(open) => !open && editModal.close()}
          title="Modifier la certification"
          description="Modifiez les informations de la certification"
          defaultValues={editModal.selectedItem}
          onSubmit={handleUpdateCertification}
          submitLabel="Enregistrer les modifications"
        />
      )}

      {viewModal.selectedItem && (
        <ViewCertificationModal
          open={viewModal.isOpen}
          onOpenChange={(open) => !open && viewModal.close()}
          certification={viewModal.selectedItem}
        />
      )}

      <ConfirmDialog
        open={deleteModal.isOpen}
        onOpenChange={(open) => !open && deleteModal.close()}
        onConfirm={handleDeleteCertification}
        title="Supprimer la certification"
        description={`Êtes-vous sûr de vouloir supprimer ${deleteModal.selectedItem?.name} ? Cette action est irréversible.`}
        confirmText="Supprimer"
        variant="destructive"
      />
    </>
  )
}
