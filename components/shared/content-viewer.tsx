"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, FileText } from "lucide-react"
import { useState, useEffect } from "react"

interface ContentViewerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contentUrl: string
  title: string
  type: "VIDEO" | "DOCUMENT" | "QUIZ" | "LAB"
}

export function ContentViewer({ open, onOpenChange, contentUrl, title, type }: ContentViewerProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (open) {
      setLoading(true)
      setError(false)
    }
  }, [open, contentUrl])

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = contentUrl
    link.download = title
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const isVideo = type === "VIDEO"
  const isDocument = type === "DOCUMENT"
  const canPreview = isVideo || isDocument

  // Détecter si c'est un PDF
  const isPDF = contentUrl.toLowerCase().endsWith('.pdf') || contentUrl.toLowerCase().includes('.pdf')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">{title}</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Télécharger
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-auto p-6">
          {canPreview ? (
            <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-muted rounded-lg relative">
              {isVideo ? (
                <>
                  <video
                    src={contentUrl}
                    controls
                    className="w-full h-auto max-h-[75vh] rounded-lg"
                    onLoadStart={() => setLoading(true)}
                    onLoadedData={() => setLoading(false)}
                    onError={() => {
                      setLoading(false)
                      setError(true)
                    }}
                  >
                    Votre navigateur ne supporte pas la lecture de vidéos.
                  </video>
                  {loading && !error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/80 rounded-lg">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">Chargement de la vidéo...</p>
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/80 rounded-lg">
                      <div className="text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground mb-4">
                          Impossible de charger la vidéo.
                        </p>
                        <Button onClick={handleDownload}>
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger la vidéo
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : isDocument ? (
                <>
                  {isPDF ? (
                    <iframe
                      src={`${contentUrl}#toolbar=1`}
                      className="w-full h-full min-h-[600px] border-0 rounded-lg"
                      onLoad={() => setLoading(false)}
                      onError={() => {
                        setLoading(false)
                        setError(true)
                      }}
                    />
                  ) : (
                    <iframe
                      src={contentUrl}
                      className="w-full h-full min-h-[600px] border-0 rounded-lg"
                      onLoad={() => setLoading(false)}
                      onError={() => {
                        setLoading(false)
                        setError(true)
                      }}
                    />
                  )}
                  {loading && !error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/80 rounded-lg">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">Chargement du document...</p>
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/80 rounded-lg">
                      <div className="text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground mb-4">
                          Impossible d'afficher le document dans le navigateur.
                        </p>
                        <Button onClick={handleDownload}>
                          <Download className="h-4 w-4 mr-2" />
                          Télécharger le document
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Ce type de contenu ne peut pas être prévisualisé.
              </p>
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Télécharger le fichier
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

