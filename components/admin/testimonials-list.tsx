"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { testimonialService, type Testimonial as ApiTestimonial } from "@/services/testimonial.service"
import { useToast } from "@/hooks/use-toast"
import { ActionResultDialog } from "@/components/shared/action-result-dialog"
import { useActionResultDialog } from "@/hooks/use-action-result-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, MoreHorizontal, MessageSquare, Calendar, Trash2, Eye } from "lucide-react"
import { EmptyState } from "./empty-state"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"


interface Testimonial {
  id: number
  user: string
  content: string
  date: string
  avatar?: string
}

export function TestimonialsList() {
  const { t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const dialog = useActionResultDialog()

  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    setIsLoading(true)
    try {
      const apiTestimonials = await testimonialService.getAllTestimonials()
      const formattedTestimonials: Testimonial[] = apiTestimonials.map((apiTestimonial: ApiTestimonial) => ({
        id: apiTestimonial.id,
        user: apiTestimonial.user?.fullName || apiTestimonial.user?.email || t('common.unknown_user'),
        content: apiTestimonial.content || "",
        date: apiTestimonial.createdAt ? new Date(apiTestimonial.createdAt).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
          year: "numeric"
        }) : "Date inconnue",
        avatar: apiTestimonial.user?.avatar,
      }))
      setTestimonials(formattedTestimonials)
    } catch (error: any) {
      console.error("Error fetching testimonials:", error)
      toast({
        title: t('common.error'),
        description: error.message || "Erreur lors du chargement des témoignages",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTestimonials = testimonials.filter(
    (testimonial) =>
      testimonial.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testimonial.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDelete = async () => {
    if (selectedTestimonial) {
      try {
        await testimonialService.deleteTestimonial(selectedTestimonial.id);
        setTestimonials(testimonials.filter((t) => t.id !== selectedTestimonial.id));
        dialog.showSuccess("Le témoignage a été supprimé avec succès");
      } catch (error: any) {
        console.error("Error deleting testimonial:", error);
        dialog.showError(error.message || "Erreur lors de la suppression du témoignage");
      } finally {
        setShowDeleteModal(false);
        setSelectedTestimonial(null);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Liste des témoignages</CardTitle>
            <CardDescription>Gérez tous les témoignages des apprenants</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un témoignage..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Témoignage</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    Chargement des témoignages...
                  </TableCell>
                </TableRow>
              ) : filteredTestimonials.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <EmptyState icon={MessageSquare} title="Aucun témoignage" description="Aucun témoignage ne correspond à votre recherche" />
                  </TableCell>
                </TableRow>
              ) : (
                filteredTestimonials.map((testimonial) => (
                  <TableRow key={testimonial.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={testimonial.avatar} alt={testimonial.user} />
                          <AvatarFallback>
                            {testimonial.user
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-medium">
                          <p>{testimonial.user}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[300px] md:max-w-md">
                      <p className="text-sm truncate flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                        {testimonial.content}
                      </p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {testimonial.date}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedTestimonial(testimonial)
                              setShowDetailModal(true)
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSelectedTestimonial(testimonial)
                              setShowDeleteModal(true)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Modal Détail (View Testimonial) */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Détails du témoignage</DialogTitle>
            <DialogDescription>
              Consultez les détails complets de ce témoignage
            </DialogDescription>
          </DialogHeader>
          {selectedTestimonial && (
            <div className="py-4 space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedTestimonial.avatar} alt={selectedTestimonial.user} />
                  <AvatarFallback className="text-xl">
                    {selectedTestimonial.user
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-lg">{selectedTestimonial.user}</p>
                  <p className="text-sm text-muted-foreground">{selectedTestimonial.date}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <MessageSquare className="h-4 w-4" />
                  Témoignage :
                </p>
                <div>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{selectedTestimonial.content}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>


      {/* Modal Supprimer (Delete Testimonial) */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le témoignage</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le témoignage de {selectedTestimonial?.user || 'cet utilisateur'} ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>{t('common.cancel')}</Button>
            <Button variant="destructive" onClick={handleDelete}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de résultat */}
      <ActionResultDialog
        isOpen={dialog.isOpen}
        onOpenChange={dialog.setIsOpen}
        isSuccess={dialog.isSuccess}
        message={dialog.message}
        title={dialog.title}
      />
    </Card>
  )
}
