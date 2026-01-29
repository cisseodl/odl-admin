// components/admin/settings/odc-formations-list.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useLanguage } from "@/contexts/language-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PageLoader } from "@/components/ui/page-loader";
import { ActionMenu } from "@/components/ui/action-menu";
import { useToast } from "@/hooks/use-toast";
import { odcFormationService, OdcFormation, OdcFormationRequest } from "@/services/odc-formation.service";
import { Plus, Edit, Trash2, ExternalLink, Eye, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useModal } from "@/hooks/use-modal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export function OdcFormationsList() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [formations, setFormations] = useState<OdcFormation[]>([]);
  const [loading, setLoading] = useState(true);

  const addModal = useModal<OdcFormation>();
  const editModal = useModal<OdcFormation>();
  const deleteModal = useModal<OdcFormation>();
  const viewModal = useModal<OdcFormation>();

  const [formData, setFormData] = useState<OdcFormationRequest>({
    titre: "",
    description: "",
    lien: "",
  });

  const fetchFormations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await odcFormationService.getAllFormations();
      
      // Le service retourne toujours { data: OdcFormation[] }
      if (response && response.data && Array.isArray(response.data)) {
        setFormations(response.data);
      } else if (Array.isArray(response)) {
        // Fallback si la réponse est directement un tableau
        setFormations(response);
      } else {
        console.error("Unexpected response structure:", response);
        setFormations([]); // Toujours définir un tableau vide pour éviter les erreurs
      }
    } catch (error) {
      console.error("Failed to fetch formations:", error);
      setFormations([]); // Toujours définir un tableau vide en cas d'erreur
      toast({
        title: t('common.error'),
        description: "Erreur lors du chargement des formations ODC",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, t]);

  useEffect(() => {
    fetchFormations();
  }, [fetchFormations]);

  const handleAddFormation = async () => {
    try {
      await odcFormationService.createFormation(formData);
      toast({
        title: t('common.success'),
        description: "Formation ODC créée avec succès",
      });
      setFormData({ titre: "", description: "", lien: "" });
      fetchFormations();
      addModal.close();
    } catch (error: any) {
      console.error("Failed to add formation:", error);
      toast({
        title: t('common.error'),
        description: error?.message || "Erreur lors de la création de la formation ODC",
        variant: "destructive",
      });
    }
  };

  const handleUpdateFormation = async () => {
    if (!editModal.selectedItem?.id) return;
    try {
      await odcFormationService.updateFormation(editModal.selectedItem.id, formData);
      toast({
        title: t('common.success'),
        description: "Formation ODC mise à jour avec succès",
      });
      setFormData({ titre: "", description: "", lien: "" });
      fetchFormations();
      editModal.close();
    } catch (error: any) {
      console.error("Failed to update formation:", error);
      toast({
        title: t('common.error'),
        description: error?.message || "Erreur lors de la mise à jour de la formation ODC",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFormation = async () => {
    if (!deleteModal.selectedItem?.id) return;
    try {
      await odcFormationService.deleteFormation(deleteModal.selectedItem.id);
      toast({
        title: t('common.success'),
        description: "Formation ODC supprimée avec succès",
      });
      fetchFormations();
      deleteModal.close();
    } catch (error: any) {
      console.error("Failed to delete formation:", error);
      toast({
        title: t('common.error'),
        description: error?.message || "Erreur lors de la suppression de la formation ODC",
        variant: "destructive",
      });
    }
  };

  const openAddModal = () => {
    setFormData({ titre: "", description: "", lien: "" });
    addModal.open({} as OdcFormation);
  };

  const openEditModal = (formation: OdcFormation) => {
    setFormData({
      titre: formation.titre || "",
      description: formation.description || "",
      lien: formation.lien || "",
    });
    editModal.open(formation);
  };

  const columns = useMemo(() => {
    // S'assurer que les colonnes sont toujours un tableau valide
    const cols = [
      {
        accessorKey: "titre",
        header: "Titre",
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }: any) => {
          try {
            return (
              <div className="max-w-md truncate">{row?.original?.description || "-"}</div>
            )
          } catch (error) {
            console.error("[ODC Formations] Error rendering description cell:", error)
            return <div>-</div>
          }
        },
      },
      {
        accessorKey: "lien",
        header: "Lien",
        cell: ({ row }: any) => {
          try {
            return (
              <a
                href={row?.original?.lien || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-primary hover:underline"
              >
                Ouvrir
                <ExternalLink className="h-3 w-3" />
              </a>
            )
          } catch (error) {
            console.error("[ODC Formations] Error rendering lien cell:", error)
            return <span>-</span>
          }
        },
      },
      {
        accessorKey: "adminName",
        header: "Créé par",
        cell: ({ row }: any) => {
          try {
            return row?.original?.adminName || row?.original?.adminEmail || "-"
          } catch (error) {
            console.error("[ODC Formations] Error rendering adminName cell:", error)
            return "-"
          }
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }: any) => {
          try {
            if (!row?.original) return null
            const formation = row.original
            return (
              <ActionMenu
                actions={[
                  {
                    label: "Voir",
                    icon: <Eye className="h-4 w-4" />,
                    onClick: () => viewModal.open(formation),
                  },
                  {
                    label: "Modifier",
                    icon: <Edit className="h-4 w-4" />,
                    onClick: () => openEditModal(formation),
                  },
                  {
                    label: "Supprimer",
                    icon: <Trash2 className="h-4 w-4" />,
                    onClick: () => deleteModal.open(formation),
                    variant: "destructive",
                  },
                ]}
              />
            )
          } catch (error) {
            console.error("[ODC Formations] Error rendering actions cell:", error)
            return null
          }
        },
      },
    ]
    // Vérifier que toutes les colonnes sont valides
    if (!Array.isArray(cols) || cols.length === 0) {
      console.error("[ODC Formations] Invalid columns structure")
      return []
    }
    return cols
  }, [editModal, deleteModal, viewModal, toast]);

  // S'assurer que formations est toujours un tableau, même pendant le chargement
  const safeFormations = useMemo(() => {
    if (!formations) return []
    if (!Array.isArray(formations)) {
      console.warn("[ODC Formations] formations is not an array:", typeof formations, formations)
      return []
    }
    // S'assurer que chaque élément est un objet valide
    return formations.filter((f) => f && typeof f === 'object')
  }, [formations])

  // Vérifier que les colonnes sont valides avant de rendre
  const safeColumns = useMemo(() => {
    if (!columns || !Array.isArray(columns) || columns.length === 0) {
      console.error("[ODC Formations] Invalid columns, using empty array")
      return []
    }
    return columns
  }, [columns])

  if (loading) {
    return <PageLoader />;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Formations ODC</CardTitle>
            <Button onClick={openAddModal}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une formation
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {safeFormations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune formation ODC trouvée
            </div>
          ) : (
            <DataTable columns={safeColumns} data={safeFormations} />
          )}
        </CardContent>
      </Card>

      {/* Dialog pour ajouter/modifier */}
      <Dialog
        open={addModal.isOpen || editModal.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            addModal.close();
            editModal.close();
            setFormData({ titre: "", description: "", lien: "" });
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editModal.isOpen ? "Modifier la formation ODC" : "Nouvelle formation ODC"}
            </DialogTitle>
            <DialogDescription>
              {editModal.isOpen ? "Modifiez les informations de la formation ODC" : "Remplissez les informations pour créer une nouvelle formation ODC"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="titre">Titre *</Label>
              <Input
                id="titre"
                value={formData.titre}
                onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                placeholder="Titre de la formation"
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de la formation"
                rows={4}
              />
            </div>
            <div>
              <Label htmlFor="lien">Lien *</Label>
              <Input
                id="lien"
                type="url"
                value={formData.lien}
                onChange={(e) => setFormData({ ...formData, lien: e.target.value })}
                placeholder="https://..."
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                addModal.close();
                editModal.close();
                setFormData({ titre: "", description: "", lien: "" });
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={() => {
                if (editModal.isOpen) {
                  handleUpdateFormation();
                } else {
                  handleAddFormation();
                }
              }}
            >
              {editModal.isOpen ? "Modifier" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de visualisation */}
      {viewModal.selectedItem && (
        <Dialog
          open={viewModal.isOpen}
          onOpenChange={(open) => !open && viewModal.close()}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <ExternalLink className="h-6 w-6 text-primary" />
                {viewModal.selectedItem.titre || "Formation ODC"}
              </DialogTitle>
              <DialogDescription>
                Détails de la formation ODC
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Informations principales */}
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold text-muted-foreground">Titre</Label>
                  <p className="text-base font-medium mt-1">{viewModal.selectedItem.titre || "-"}</p>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-sm font-semibold text-muted-foreground">Description</Label>
                  <p className="text-sm mt-1 whitespace-pre-wrap text-muted-foreground">
                    {viewModal.selectedItem.description || "Aucune description disponible"}
                  </p>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-sm font-semibold text-muted-foreground">Lien</Label>
                  <div className="mt-2 flex items-center gap-2">
                    {viewModal.selectedItem.lien ? (
                      <>
                        <a
                          href={viewModal.selectedItem.lien}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-2 break-all"
                        >
                          <ExternalLink className="h-4 w-4 flex-shrink-0" />
                          <span className="break-all">{viewModal.selectedItem.lien}</span>
                        </a>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(viewModal.selectedItem.lien, '_blank', 'noopener,noreferrer')}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ouvrir
                        </Button>
                      </>
                    ) : (
                      <span className="text-muted-foreground">Aucun lien disponible</span>
                    )}
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Informations supplémentaires */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {viewModal.selectedItem.adminName && (
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Créé par
                    </Label>
                    <p className="text-sm mt-1">{viewModal.selectedItem.adminName}</p>
                    {viewModal.selectedItem.adminEmail && (
                      <p className="text-xs text-muted-foreground mt-1">{viewModal.selectedItem.adminEmail}</p>
                    )}
                  </div>
                )}
                
                {viewModal.selectedItem.createdAt && (
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Date de création
                    </Label>
                    <p className="text-sm mt-1">
                      {new Date(viewModal.selectedItem.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>
              
              {viewModal.selectedItem.activate !== undefined && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-sm font-semibold text-muted-foreground">Statut</Label>
                    <div className="mt-2">
                      <Badge variant={viewModal.selectedItem.activate ? "default" : "secondary"}>
                        {viewModal.selectedItem.activate ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => viewModal.close()}>
                Fermer
              </Button>
              {viewModal.selectedItem.lien && (
                <Button
                  onClick={() => window.open(viewModal.selectedItem.lien, '_blank', 'noopener,noreferrer')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ouvrir le lien
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog de confirmation de suppression */}
      <ConfirmDialog
        open={deleteModal.isOpen}
        onOpenChange={deleteModal.close}
        onConfirm={handleDeleteFormation}
        title="Supprimer la formation ODC"
        description={`Êtes-vous sûr de vouloir supprimer la formation "${deleteModal.selectedItem?.titre}" ?`}
      />
    </>
  );
}
