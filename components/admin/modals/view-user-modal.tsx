"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Calendar, BookOpen, Shield, GraduationCap, CheckCircle2, XCircle, Ban, Briefcase, School, Users, Award, Phone, FileText } from "lucide-react"
import { Cohorte } from "@/models" // Import Cohorte model

type UserDisplay = {
  id: number;
  name: string;
  email: string;
  role: "Apprenant" | "Formateur" | "Admin";
  status: "Actif" | "Inactif" | "Suspendu";
  joinedDate: string;
  courses: number; // For general users
  avatar?: string;
  phone?: string; // Phone number
  // Learner-specific fields
  filiere?: string;
  niveauEtude?: string;
  profession?: string;
  numero?: string; // Phone for apprenant
  cohorte?: Cohorte | null;
  coursesEnrolled?: number;
  completedCourses?: number;
  totalCertificates?: number;
  // Instructor-specific fields
  biography?: string;
  specialization?: string;
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
      case "Formateur":
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
              variant={user.role === "Admin" ? "default" : user.role === "Formateur" ? "secondary" : "outline"}
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
            {(user.phone || user.numero) && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-medium">{user.phone || user.numero}</p>
                </div>
              </div>
            )}
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
                <p className="text-sm text-muted-foreground">
                  {user.role === "Formateur" ? "Formations gérées" : user.role === "Admin" ? "Cours gérés" : "Formations suivies"}
                </p>
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

          {user.role === "Formateur" && (
            <>
              <Separator />
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Informations formateur
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {user.specialization && (
                      <div className="flex items-start gap-3">
                        <BookOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Spécialisation</p>
                          <p className="font-medium">{user.specialization}</p>
                        </div>
                      </div>
                    )}
                    {user.biography && (
                      <div className="flex items-start gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground mb-1">Biographie</p>
                          <p className="text-sm">{user.biography}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {user.role === "Admin" && (
            <>
              <Separator />
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Informations administrateur
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Rôle</p>
                        <p className="font-medium">Administrateur</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Cours gérés</p>
                        <p className="font-bold text-lg">{user.courses}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {user.role === "Apprenant" && (
            <>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Profession</p>
                    <p className="font-medium">{user.profession || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <School className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Niveau d'étude</p>
                    <p className="font-medium">{user.niveauEtude || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Filière</p>
                    <p className="font-medium">{user.filiere || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Cohorte</p>
                    <p className="font-medium">{user.cohorte?.nom || "N/A"}</p>
                  </div>
                </div>
              </div>

              <Separator />
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <BookOpen className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                  <p className="text-sm text-muted-foreground">Cours inscrits</p>
                  <p className="font-bold text-lg">{user.coursesEnrolled ?? 0}</p>
                </div>
                <div>
                  <CheckCircle2 className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                  <p className="text-sm text-muted-foreground">Cours complétés</p>
                  <p className="font-bold text-lg">{user.completedCourses ?? 0}</p>
                </div>
                <div>
                  <Award className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                  <p className="text-sm text-muted-foreground">Certificats</p>
                  <p className="font-bold text-lg">{user.totalCertificates ?? 0}</p>
                </div>
              </div>

            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

