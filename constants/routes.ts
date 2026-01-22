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
  ClipboardList, // For TD (Travaux Dirigés)
  HelpCircle, // For Quiz
} from "lucide-react"
import type { Route } from "@/types"

// Admin navigation routes
export const adminRoutes: Route[] = [
  {
    label: "routes.dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    label: "routes.analytics",
    icon: BarChart3,
    href: "/admin/analytics",
  },
  {
    label: "routes.users",
    icon: Users,
    href: "/admin/users", // Parent route can still point to a general users list
    children: [
      {
        label: "routes.users_learners",
        icon: Users, // Or another icon
        href: "/admin/users/apprenants",
      },
      {
        label: "routes.users_instructors",
        icon: GraduationCap,
        href: "/admin/users/instructeurs",
      },
      {
        label: "routes.users_admins",
        icon: Users, // Or another icon
        href: "/admin/users/administrateurs",
      },
    ],
  },
  {
    label: "routes.courses",
    icon: BookOpen,
    href: "/admin/courses",
    children: [ // Add children for sub-menu
      {
        label: "routes.courses_all", // Add a child for all courses
        icon: BookOpen, // Use BookOpen icon again or a different one
        href: "/admin/courses",
      },
      {
        label: "routes.courses_categories",
        icon: Tag,
        href: "/admin/categories",
      },
    ],
  },
  // Remove top-level Instructeurs as it's now a sub-item
  {
    label: "routes.certifications",
    icon: Award,
    href: "/admin/certifications",
  },
  {
    label: "routes.reviews",
    icon: MessageSquare,
    href: "/admin/reviews",
  },
  {
    label: "routes.content",
    icon: Upload,
    href: "/admin/content",
  },
  {
    label: "routes.formations",
    icon: GraduationCap,
    href: "/admin/formations",
  },
  {
    label: "routes.cohorts", // Replaced Modération
    icon: Users, // Icon for Cohortes (can be changed if needed)
    href: "/admin/cohortes", // New href for Cohortes
  },
  {
    label: "routes.notifications",
    icon: Bell,
    href: "/admin/notifications",
  },
  {
    label: "routes.leaderboard",
    icon: Award,
    href: "/admin/leaderboard",
  },
  {
    label: "routes.settings",
    icon: Settings,
    href: "/admin/settings",
  },
]

export const instructorRoutes: Route[] = [
  {
    label: "routes.dashboard",
    icon: LayoutDashboard,
    href: "/instructor",
  },
  {
    label: "routes.analytics",
    icon: BarChart3,
    href: "/instructor/analytics",
  },
  {
    label: "routes.instructor_categories",
    icon: Tag,
    href: "/instructor/categories",
  },
  {
    label: "routes.instructor_courses",
    icon: BookOpen,
    href: "/instructor/courses",
  },
  {
    label: "routes.instructor_lessons",
    icon: FileText,
    href: "/instructor/lessons",
  },
  {
    label: "routes.labs",
    icon: HardDrive,
    href: "/instructor/labs",
  },
  {
    label: "routes.tds",
    icon: ClipboardList,
    href: "/instructor/tds",
  },
  {
    label: "routes.quizzes",
    icon: HelpCircle,
    href: "/instructor/quizzes",
  },
  {
    label: "routes.evaluations",
    icon: FileQuestion,
    href: "/instructor/evaluations",
  },
  {
    label: "routes.instructor_certificates",
    icon: Award,
    href: "/instructor/certificates",
  },
  {
    label: "routes.instructor_students",
    icon: Users,
    href: "/instructor/students",
  },
]

