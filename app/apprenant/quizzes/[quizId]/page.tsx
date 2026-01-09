// app/apprenant/quizzes/[quizId]/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { quizService, certificateService } from "@/services"
import { Quiz, QuizQuestion, QuizReponse } from "@/models"
import { PageLoader } from "@/components/ui/page-loader"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal, Clock, CheckCircle, FileQuestion, Radio, Download } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox" // Correct import for Checkbox

export default function LearnerQuizDetailPage() {
  const params = useParams();
  const quizId = Number(params.quizId);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number[]>>({}); // questionId -> array of selected reponseIds
  const [quizSubmitted, setQuizSubmitted] = useState(false); // New state to track quiz submission

  const fetchQuizData = async () => {
    setLoading(true);
    setError(null);
    try {
      const quizData = await quizService.getQuizById(quizId);
      setQuiz(quizData);
    } catch (err: any) {
      setError(err.message || "Failed to fetch quiz data.");
      console.error("Error fetching quiz data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quizId) {
      fetchQuizData();
    }
  }, [quizId]);

  const handleAnswerChange = (questionId: number, responseId: number, isMultipleChoice: boolean) => {
    setSelectedAnswers(prev => {
      const currentAnswers = prev[questionId] || [];
      if (isMultipleChoice) {
        if (currentAnswers.includes(responseId)) {
          return { ...prev, [questionId]: currentAnswers.filter(id => id !== responseId) };
        } else {
          return { ...prev, [questionId]: [...currentAnswers, responseId] };
        }
      } else { // Single choice
        return { ...prev, [questionId]: [responseId] };
      }
    });
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || !quiz.questions) return;

    const answersPayload = quiz.questions.map(question => ({
      questionId: question.id,
      reponseIds: selectedAnswers[question.id] || []
    }));

    try {
      setLoading(true);
      const result = await quizService.submitQuiz({ quizId, answers: answersPayload });
      alert(`Quiz submitted! Your score: ${result.score}`); // Replace with better UI feedback
      setQuizSubmitted(true); // Mark quiz as submitted
      // Optionally, redirect to a results page or show score on this page
    } catch (err: any) {
      setError(err.message || "Failed to submit quiz.");
      console.error("Error submitting quiz:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = async () => {
    if (!quizId) return;
    try {
      setLoading(true);
      // The service will handle the redirect, so we don't need to process the response
      await certificateService.downloadCertificate(quizId);
      // alert("Téléchargement du certificat lancé !"); // Provide feedback
    } catch (err: any) {
      setError(err.message || "Failed to download certificate.");
      console.error("Error downloading certificate:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="container mx-auto py-8 text-center text-muted-foreground">
        Quiz non trouvé.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-4">{quiz.title}</h1>
      <div className="flex items-center space-x-4 text-muted-foreground mb-6">
        {quiz.durationMinutes && (
          <span className="flex items-center">
            <Clock className="h-4 w-4 mr-1" /> {quiz.durationMinutes} minutes
          </span>
        )}
        {quiz.scoreMinimum && (
          <span className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-1" /> Minimum: {quiz.scoreMinimum}%
          </span>
        )}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSubmitQuiz(); }} className="space-y-8">
        {quiz.questions && quiz.questions.map((question, qIndex) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileQuestion className="h-5 w-5" /> Question {qIndex + 1}: {question.content}
              </CardTitle>
              <span className="text-sm text-muted-foreground ml-7">{question.points} points</span>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {question.reponses && question.reponses.map(response => (
                  <div key={response.id} className="flex items-center space-x-2">
                    {question.type === "SINGLE_CHOICE" ? (
                      <Radio
                        id={`q${question.id}-r${response.id}`}
                        name={`question-${question.id}`}
                        checked={selectedAnswers[question.id]?.includes(response.id)}
                        onCheckedChange={() => handleAnswerChange(question.id, response.id, false)}
                      />
                    ) : (
                      <Checkbox
                        id={`q${question.id}-r${response.id}`}
                        checked={selectedAnswers[question.id]?.includes(response.id)}
                        onCheckedChange={() => handleAnswerChange(question.id, response.id, true)}
                      />
                    )}
                    <label htmlFor={`q${question.id}-r${response.id}`} className="text-base">
                      {response.text}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        <Button type="submit" className="w-full">Soumettre le Quiz</Button>
        {quizSubmitted && ( // Show download button only after quiz is submitted
          <Button
            type="button"
            className="w-full mt-4"
            onClick={handleDownloadCertificate}
            variant="secondary"
          >
            <Download className="h-4 w-4 mr-2" /> Télécharger le certificat
          </Button>
        )}
      </form>
    </div>
  );
}
