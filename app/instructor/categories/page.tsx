"use client"

import { useEffect, useState } from "react"
import { useLanguage } from "@/contexts/language-context"
import { PageLoader } from "@/components/ui/page-loader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tag, BookOpen } from "lucide-react"
import { categorieService } from "@/services"
import { Categorie } from "@/models"

export default function InstructorCategoriesPage() {
  const { t } = useLanguage()
  const [categories, setCategories] = useState<Categorie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await categorieService.getAllCategories()
        // Le service retourne maintenant toujours un tableau (vide en cas d'erreur)
        if (Array.isArray(response)) {
          setCategories(response)
        } else if (response && Array.isArray(response.data)) {
          setCategories(response.data)
        } else {
          setCategories([])
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch categories.")
        console.error("Error fetching categories:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  if (loading) {
    return <PageLoader />
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('instructor.categories.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('instructor.categories.description')}</p>
        </div>
        <div className="text-center text-destructive p-4">{error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('instructor.categories.title')}</h1>
        <p className="text-muted-foreground mt-2">{t('instructor.categories.description')}</p>
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tag className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{t('instructor.categories.no_categories')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{category.title}</CardTitle>
                </div>
                {category.description && (
                  <CardDescription className="mt-2">{category.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>{t('instructor.categories.courses_count', { count: 0 })}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
