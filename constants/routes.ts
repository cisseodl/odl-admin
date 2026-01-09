import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  BarChart3,
  Settings,
  FileText,
  Award,
  Tag,
  MessageSquare,
  Upload,
  FileQuestion,
  Shield,
  Bell,
  HardDrive, // Added HardDrive for Labs
} from "lucide-react"
import type { Route } from "@/types"

// Admin navigation routes
export const adminRoutes: Route[] = [
  {
    label: "Tableau de bord",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    label: "Statistiques",
    icon: BarChart3,
    href: "/admin/analytics",
  },
  {
    label: "Utilisateurs",
    icon: Users,
    href: "/admin/users", // Parent route can still point to a general users list
    children: [
      {
        label: "Apprenants",
        icon: Users, // Or another icon
        href: "/admin/users/apprenants",
      },
      {
        label: "Formateurs",
        icon: GraduationCap,
        href: "/admin/users/instructeurs",
      },
      {
        label: "Administrateurs",
        icon: Users, // Or another icon
        href: "/admin/users/administrateurs",
      },
    ],
  },
  {
    label: "Formations",
    icon: BookOpen,
    href: "/admin/courses",
    children: [ // Add children for sub-menu
      {
        label: "Toutes les formations", // Add a child for all courses
        icon: BookOpen, // Use BookOpen icon again or a different one
        href: "/admin/courses",
      },
      {
        label: "Catégories",
        icon: Tag,
        href: "/admin/categories",
      },
    ],
  },
  // Remove top-level Instructeurs as it's now a sub-item
  {
    label: "Certifications",
    icon: Award,
    href: "/admin/certifications",
  },
  {
    label: "Commentaires",
    icon: MessageSquare,
    href: "/admin/reviews",
  },
  {
    label: "Labs", // Renamed from Contenus
    icon: HardDrive, // Changed icon
    href: "/admin/labs", // Changed href
  },
  {
    label: "Cohortes", // Replaced Modération
    icon: Users, // Icon for Cohortes (can be changed if needed)
    href: "/admin/cohortes", // New href for Cohortes
  },
  {
    label: "Validation", // Nouvelle entrée pour la modération
    icon: Shield,
    href: "/admin/moderation",
  },
  {
    label: "Notifications",
    icon: Bell,
    href: "/admin/notifications",
  },
  {
    label: "Évaluations", // Replaced Badges
    icon: FileText, // Changed icon from Award
    href: "/admin/evaluations", // Changed href from /admin/badges
  },
  {
    label: "Classements",
    icon: Award,
    href: "/admin/leaderboard",
  },
  {
    label: "Paramètres",
    icon: Settings,
    href: "/admin/settings",
  },
]

export const instructorRoutes: Route[] = [
  {
    label: "Tableau de bord",
    icon: LayoutDashboard,
    href: "/instructor",
  },
  {
    label: "Statistiques",
    icon: BarChart3,
    href: "/instructor/analytics",
  },
  {
    label: "Mes Formations",
    icon: BookOpen,
    href: "/instructor/courses",
  },
  {
    label: "Contenus",
    icon: Upload,
    href: "/instructor/content",
  },
  {
    label: "Validation", // Nouvelle entrée pour la modération
    icon: Shield,
    href: "/instructor/moderation",
  },
  {
    label: "Quiz & Exercices",
    icon: FileQuestion,
    href: "/instructor/quizzes",
  },
  {
    label: "Mes Apprenants",
    icon: Users,
    href: "/instructor/students",
  },
  {
    label: "Certificats",
    icon: Award,
    href: "/instructor/certificates",
  },
  {
    label: "Paramètres",
    icon: Settings,
    href: "/instructor/settings",
  },
]

