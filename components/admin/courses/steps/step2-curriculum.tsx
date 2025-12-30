"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UseFormReturn } from "react-hook-form"
import type { Step2CurriculumData } from "@/lib/validations/course-builder"
import { Plus, BookOpen, AlertCircle } from "lucide-react"
import { CurriculumBuilder } from "../curriculum-builder"

type Step2CurriculumProps = {
  form: UseFormReturn<Step2CurriculumData>
}

export function Step2Curriculum({ form }: Step2CurriculumProps) {
  const structure = form.watch("structure")

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Structure du curriculum</h3>
        <p className="text-sm text-muted-foreground">
          Organisez votre formation en modules et chapitres. Vous pourrez ajouter le contenu dans l'étape suivante.
        </p>
      </div>

      {structure.modules.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="text-lg font-semibold mb-2">Commencez par créer un module</h4>
            <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">
              Les modules organisent votre contenu en sections logiques. Ajoutez votre premier module pour commencer.
            </p>
            <Button onClick={() => {
              // Le CurriculumBuilder gérera l'ajout
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un module
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="bg-primary/10 dark:bg-primary/20 border-primary/20 dark:border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Structure du curriculum
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {structure.modules.length} module{structure.modules.length > 1 ? "s" : ""} •{" "}
                    {structure.totalChapters} chapitre{structure.totalChapters > 1 ? "s" : ""} •{" "}
                    Durée estimée: {structure.totalDuration}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <CurriculumBuilder
            structure={structure}
            onStructureChange={(newStructure) => {
              form.setValue("structure", newStructure, { shouldValidate: true })
            }}
          />
        </>
      )}
    </div>
  )
}

