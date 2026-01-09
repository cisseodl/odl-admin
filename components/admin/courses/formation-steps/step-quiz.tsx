"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, X, Check, HelpCircle } from "lucide-react"
import type { QuizFormData } from "../formation-builder-wizard"

type StepQuizProps = {
  onSubmit: (quiz: QuizFormData) => void
  defaultQuiz?: QuizFormData
  onSkip: () => void
}

export function StepQuiz({ onSubmit, defaultQuiz, onSkip }: StepQuizProps) {
  const [title, setTitle] = useState(defaultQuiz?.title || "")
  const [description, setDescription] = useState(defaultQuiz?.description || "")
  const [durationMinutes] = useState(defaultQuiz?.durationMinutes || 30)
  const [scoreMinimum] = useState(defaultQuiz?.scoreMinimum || 80)
  const [questions, setQuestions] = useState(
    defaultQuiz?.questions || [
      {
        id: `question-${Date.now()}`,
        content: "",
        type: "QCM" as const,
        points: 1,
        reponses: [
          { id: `reponse-${Date.now()}-1`, text: "", isCorrect: false },
          { id: `reponse-${Date.now()}-2`, text: "", isCorrect: false },
        ],
      },
    ]
  )

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `question-${Date.now()}-${questions.length}`,
        content: "",
        type: "QCM" as const,
        points: 1,
        reponses: [
          { id: `reponse-${Date.now()}-${questions.length}-1`, text: "", isCorrect: false },
          { id: `reponse-${Date.now()}-${questions.length}-2`, text: "", isCorrect: false },
        ],
      },
    ])
  }

  const removeQuestion = (questionId: string) => {
    setQuestions(questions.filter((q) => q.id !== questionId))
  }

  const updateQuestion = (questionId: string, field: string, value: any) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, [field]: value } : q
      )
    )
  }

  const addReponse = (questionId: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              reponses: [
                ...q.reponses,
                {
                  id: `reponse-${Date.now()}-${q.reponses.length}`,
                  text: "",
                  isCorrect: false,
                },
              ],
            }
          : q
      )
    )
  }

  const removeReponse = (questionId: string, reponseId: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              reponses: q.reponses.filter((r) => r.id !== reponseId),
            }
          : q
      )
    )
  }

  const updateReponse = (
    questionId: string,
    reponseId: string,
    field: string,
    value: any
  ) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              reponses: q.reponses.map((r) =>
                r.id === reponseId ? { ...r, [field]: value } : r
              ),
            }
          : q
      )
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) {
      return
    }

    // Valider que toutes les questions ont du contenu et au moins une réponse correcte
    const validQuestions = questions.filter((q) => {
      if (!q.content.trim()) return false
      if (q.type === "QCM") {
        const hasCorrectAnswer = q.reponses.some((r) => r.isCorrect && r.text.trim())
        const hasEnoughReponses = q.reponses.filter((r) => r.text.trim()).length >= 2
        return hasCorrectAnswer && hasEnoughReponses
      }
      return true
    })

    if (validQuestions.length === 0) {
      return
    }

    onSubmit({
      title: title.trim(),
      description: description.trim() || "",
      durationMinutes,
      scoreMinimum,
      questions: validQuestions,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Quiz de la formation</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Créez un quiz pour évaluer les connaissances des apprenants. Vous pouvez passer cette étape si vous ne souhaitez pas ajouter de quiz.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="quiz-title">Titre du quiz *</Label>
          <Input
            id="quiz-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Quiz d'évaluation finale"
            required
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold">Questions</h4>
          <Button type="button" variant="outline" onClick={addQuestion}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une question
          </Button>
        </div>

        {questions.map((question, qIndex) => (
          <Card key={question.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Question {qIndex + 1}
                </CardTitle>
                {questions.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeQuestion(question.id || "")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`question-content-${question.id}`}>
                  Contenu de la question *
                </Label>
                <Textarea
                  id={`question-content-${question.id}`}
                  value={question.content}
                  onChange={(e) =>
                    updateQuestion(question.id || "", "content", e.target.value)
                  }
                  placeholder="Ex: Qu'est-ce qu'EC2 ?"
                  rows={2}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`question-type-${question.id}`}>Type *</Label>
                  <select
                    id={`question-type-${question.id}`}
                    value={question.type}
                    onChange={(e) =>
                      updateQuestion(question.id || "", "type", e.target.value)
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    required
                  >
                    <option value="QCM">QCM (Choix multiples)</option>
                    <option value="TEXTE">Texte libre</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`question-points-${question.id}`}>Points *</Label>
                  <Input
                    id={`question-points-${question.id}`}
                    type="number"
                    min="1"
                    value={question.points}
                    onChange={(e) =>
                      updateQuestion(question.id || "", "points", Number(e.target.value))
                    }
                    required
                  />
                </div>
              </div>

              {question.type === "QCM" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Réponses</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addReponse(question.id || "")}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter une réponse
                    </Button>
                  </div>

                  {question.reponses.map((reponse, rIndex) => (
                    <div key={reponse.id} className="flex items-center gap-2">
                      <Input
                        value={reponse.text}
                        onChange={(e) =>
                          updateReponse(
                            question.id || "",
                            reponse.id || "",
                            "text",
                            e.target.value
                          )
                        }
                        placeholder={`Réponse ${rIndex + 1}`}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant={reponse.isCorrect ? "default" : "outline"}
                        size="sm"
                        onClick={() =>
                          updateReponse(
                            question.id || "",
                            reponse.id || "",
                            "isCorrect",
                            !reponse.isCorrect
                          )
                        }
                      >
                        {reponse.isCorrect ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                      {question.reponses.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            removeReponse(question.id || "", reponse.id || "")
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onSkip}>
          Passer cette étape
        </Button>
        <Button type="submit" disabled={!title.trim() || questions.length === 0}>
          <Check className="h-4 w-4 mr-2" />
          Finaliser la création
        </Button>
      </div>
    </form>
  )
}
