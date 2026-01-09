// app/courses/page.tsx
"use client"

import { useState, useEffect, useMemo } from "react"
import { PageHeader } from "@/components/ui/page-header"
import { Card, CardContent } from "@/components/ui/card" // Card et CardContent restent pour un éventuel conteneur ou pour des éléments futurs
import { Button } from "@/components/ui/button"
import { courseService } from "@/services"
import { Course } from "@/models"
import { PageLoader } from "@/components/ui/page-loader"
import { EmptyState } from "@/components/admin/empty-state"
import {
  BookOpen,
  UserPlus,
  ArrowRight, // Ajouté pour le bouton d'inscription
  CalendarDays, // Pour la date de soumission
  Users, // Pour le nombre d'étudiants
  Clock, // Pour la durée
} from "lucide-react"

import { DataTable } from "@/components/ui/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { SearchBar } from "@/components/ui/search-bar"
import { useSearch } from "@/hooks/use-search" // Pour la barre de recherche
import { convertSecondsToDurationString } from "@/lib/utils" // Pour la conversion de durée
import Image from "next/image"
import Link from "next/link"

type CourseDisplay = {
  id: number
  title: string
  subtitle: string
  description: string
  imagePath?: string // Chemin de l'image pour l'affichage
  level: string
  language: string
  instructorName: string // Nom complet de l'instructeur
  categoryTitle: string // Nom de la catégorie
  modulesCount: number // Nombre de modules
  durationFormatted: string // Durée formatée (ex: "2h 30min")
  studentsCount: number // Nombre d'étudiants
  createdAtFormatted: string // Date de création formatée
  status: string // Statut du cours (ex: "PUBLISHED", "DRAFT")
}



const mapCourseToCourseDisplay = (course: Course): CourseDisplay => {
  const studentsCount = course.studentsCount ?? 0; // Utiliser la propriété studentsCount si elle existe, sinon 0
  const durationInSeconds = course.duration ?? 0;
  const createdAtDate = course.createdAt ? new Date(course.createdAt) : null;
  
  return {
    id: course.id || 0,
    title: course.title || "Titre inconnu",
    subtitle: course.subtitle || "",
    description: course.description || "",
    imagePath: course.imagePath || undefined,
    level: course.level || "Niveau inconnu",
    language: course.language || "Langue inconnue",
    instructorName: course.instructor?.fullName || "Formateur inconnu",
    categoryTitle: course.categorie?.title || "Catégorie inconnue",
    modulesCount: course.modules?.length || 0,
    durationFormatted: convertSecondsToDurationString(durationInSeconds),
    studentsCount: studentsCount,
    createdAtFormatted: createdAtDate ? createdAtDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "Date inconnue",
    status: course.status || "Statut inconnu",
  }
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<CourseDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { searchQuery, setSearchQuery, filteredData } = useSearch<CourseDisplay>({
    data: courses,
    searchKeys: ["title", "instructorName", "categoryTitle", "level", "language"],
  });

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await courseService.getAllCourses();
        setCourses(data.map(mapCourseToCourseDisplay));
      } catch (err: any) {
        setError(err.message || "Failed to fetch courses.");
        console.error("Error fetching courses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleEnroll = async (courseId: number) => {
    try {
      await courseService.enrollInCourse(courseId);
      alert("Inscription réussie !"); // Replace with a more sophisticated notification
      // Optionally, update UI to show enrollment status
    } catch (err: any) {
      alert(`Erreur d'inscription: ${err.message || "Une erreur est survenue"}`);
      console.error("Error enrolling in course:", err);
    }
  };

  const columns: ColumnDef<CourseDisplay>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: "Formation",
        cell: ({ row }) => {
          const course = row.original;
          return (
            <Link href={`/courses/${course.id}`} className="flex items-center gap-3 hover:underline">
              {course.imagePath && (
                <Image
                  src={course.imagePath}
                  alt={course.title}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-md object-cover"
                />
              )}
              <div>
                <div className="font-medium">{course.title}</div>
                <div className="text-sm text-muted-foreground">
                  {course.categoryTitle}
                </div>
              </div>
            </Link>
          );
        },
      },
      {
        accessorKey: "instructorName",
        header: "Formateur",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-muted-foreground" />
            {row.original.instructorName}
          </div>
        ),
      },
      {
        accessorKey: "modulesCount",
        header: "Modules",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            {row.original.modulesCount}
          </div>
        ),
      },
      {
        accessorKey: "durationFormatted",
        header: "Durée",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            {row.original.durationFormatted}
          </div>
        ),
      },
      {
        accessorKey: "studentsCount",
        header: "Étudiants",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            {row.original.studentsCount}
          </div>
        ),
      },
      {
        accessorKey: "createdAtFormatted",
        header: "Créé le",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            {row.original.createdAtFormatted}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Button
            size="sm"
            onClick={() => handleEnroll(row.original.id)}
            className="flex items-center gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            S'inscrire
          </Button>
        ),
      },
    ],
    [handleEnroll]
  );

  return (
    <>
      <PageHeader
        title="Toutes les formations"
        description="Parcourez toutes les formations disponibles sur la plateforme."
      />

      <div className="container mx-auto py-8">
        {loading ? (
          <PageLoader />
        ) : error ? (
          <div className="text-center text-destructive p-4">{error}</div>
        ) : courses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Aucune formation disponible"
            description="Il n'y a pas encore de formations sur la plateforme."
          />
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4">
                <SearchBar
                  placeholder="Rechercher par titre, formateur, catégorie..."
                  value={searchQuery}
                  onChange={setSearchQuery}
                />
              </div>
              <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
