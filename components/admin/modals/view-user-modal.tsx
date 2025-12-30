"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Calendar, BookOpen, Shield, GraduationCap, CheckCircle2, XCircle, Ban } from "lucide-react"

type UserDisplay = {
  id: number;
  name: string;
  email: string;
  role: "Apprenant" | "Instructeur" | "Admin";
  status: "Actif" | "Inactif" | "Suspendu";
  joinedDate: string;
  courses: number;
  avatar?: string;
};

type ViewUserModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserDisplay
}

export function ViewUserModal({ open, onOpenChange, user }: ViewUserModalProps) {
  const getRoleIcon = () => {
    switch (user.role) {
      case "Admin":
        return <Shield className="h-5 w-5 text-primary" />
      case "Instructeur":
        return <GraduationCap className="h-5 w-5 text-primary" />
      default:
        return <User className="h-5 w-5 text-[hsl(var(--success))]" />
    }
  }

  const getStatusIcon = () => {
    switch (user.status) {
      case "Actif":
        return <CheckCircle2 className="h-5 w-5 text-[hsl(var(--success))]" />
      case "Inactif":
        return <XCircle className="h-5 w-5 text-muted-foreground" />
      default:
        return <Ban className="h-5 w-5 text-destructive" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            {user.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Badge
              variant={user.role === "Admin" ? "default" : user.role === "Instructeur" ? "secondary" : "outline"}
              className="flex items-center gap-1"
            >
              {getRoleIcon()}
              {user.role}
            </Badge>
            <Badge
              variant={
                user.status === "Actif" ? "default" : user.status === "Suspendu" ? "destructive" : "secondary"
              }
              className="flex items-center gap-1"
            >
              {getStatusIcon()}
              {user.status}
            </Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Date d'inscription</p>
                <p className="font-medium">{user.joinedDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Formations suivies</p>
                <p className="font-bold text-lg">{user.courses}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">ID Utilisateur</p>
                <p className="font-medium">#{user.id}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium">Informations complémentaires</p>
            <p className="text-sm text-muted-foreground">
              {user.role === "Admin"
                ? "Cet utilisateur a les droits d'administration complets sur la plateforme."
                : user.role === "Instructeur"
                  ? "Cet instructeur peut créer et gérer des formations sur la plateforme."
                  : "Cet apprenant peut suivre des formations et obtenir des certifications."}
            </p>
          </div>

          {user.role === "Apprenant" && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  Progression des cours
                </p>
                <div className="text-sm text-muted-foreground">
                  {/* Placeholder for course progress */}
                  <p>API pour la progression des cours non implémentée.</p>
                  <p>Exemple : "Introduction à React" : 75% complété</p>
                  <p>Exemple : "Node.js Avancé" : En cours (50%)</p>
                </div>
              </div>

              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium">Actions pour l'apprenant</p>
                <Button variant="destructive" size="sm" onClick={() => console.log(`Stop course for learner ${user.name}`)}>
                  <Ban className="h-4 w-4 mr-2" />
                  Arrêter le cours
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  (Cette fonctionnalité est un placeholder. L'API pour arrêter un cours n'est pas implémentée.)
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

