"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, FileText, ExternalLink } from "lucide-react"
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
  const [iframeError, setIframeError] = useState(false)

  useEffect(() => {
    if (open) {
      setLoading(true)
      setError(false)
      setIframeError(false)
    }
  }, [open, contentUrl])

  const handleDownload = () => {
    window.open(contentUrl, "_blank")
  }

  const handleOpenInNewTab = () => {
    window.open(contentUrl, "_blank")
  }

  const isVideo = type === "VIDEO"
  const isDocument = type === "DOCUMENT"
  const canPreview = isVideo || isDocument

  // Détecter le type de fichier
  const lowerUrl = contentUrl.toLowerCase()
  const isPDF = lowerUrl.endsWith('.pdf') || lowerUrl.includes('.pdf')
  const isWord = lowerUrl.endsWith('.doc') || lowerUrl.endsWith('.docx') || 
                lowerUrl.includes('.doc') || lowerUrl.includes('.docx')
  const isImage = lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg') || 
                  lowerUrl.endsWith('.png') || lowerUrl.endsWith('.gif') ||
                  lowerUrl.endsWith('.webp')
  
  // Pour les fichiers Word, utiliser Microsoft Office Online Viewer ou Google Docs Viewer
  const getViewerUrl = () => {
    if (isWord) {
      // Utiliser Google Docs Viewer comme alternative (plus fiable)
      return `https://docs.google.com/viewer?url=${encodeURIComponent(contentUrl)}&embedded=true`
    }
    return contentUrl
  }

  // Vérifier si le fichier peut être affiché dans un iframe
  const canDisplayInIframe = isPDF || isWord || isImage

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg">{title}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleOpenInNewTab}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Ouvrir
              </Button>
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
                  {isImage ? (
                    <img
                      src={contentUrl}
                      alt={title}
                      className="w-full h-auto max-h-[75vh] rounded-lg object-contain"
                      onLoad={() => {
                        setLoading(false)
                        setError(false)
                      }}
                      onError={() => {
                        setLoading(false)
                        setError(true)
                      }}
                    />
                  ) : isPDF ? (
                    <iframe
                      src={`${contentUrl}#toolbar=1`}
                      className="w-full h-full min-h-[600px] border-0 rounded-lg"
                      onLoad={() => {
                        setLoading(false)
                        setError(false)
                      }}
                      onError={() => {
                        setLoading(false)
                        setError(true)
                        setIframeError(true)
                      }}
                      allow="fullscreen"
                    />
                  ) : isWord ? (
                    // Pour les fichiers Word, essayer Google Docs Viewer
                    <iframe
                      src={getViewerUrl()}
                      className="w-full h-full min-h-[600px] border-0 rounded-lg"
                      onLoad={() => {
                        setLoading(false)
                        // Vérifier après un délai si l'iframe a chargé correctement
                        setTimeout(() => {
                          setError(false)
                        }, 3000)
                      }}
                      onError={() => {
                        setLoading(false)
                        setError(true)
                        setIframeError(true)
                      }}
                      allow="fullscreen"
                      sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    />
                  ) : (
                    // Pour les autres types de documents, essayer directement
                    <iframe
                      src={contentUrl}
                      className="w-full h-full min-h-[600px] border-0 rounded-lg"
                      onLoad={() => {
                        setLoading(false)
                        setError(false)
                      }}
                      onError={() => {
                        setLoading(false)
                        setError(true)
                        setIframeError(true)
                      }}
                      allow="fullscreen"
                    />
                  )}
                  {loading && !error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/80 rounded-lg z-10">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                        <p className="text-sm text-muted-foreground">
                          {isWord ? "Chargement via Google Docs Viewer..." : "Chargement du document..."}
                        </p>
                        {isWord && (
                          <p className="text-xs text-muted-foreground mt-2 max-w-md">
                            Si le document ne s'affiche pas, utilisez le bouton "Ouvrir" pour l'ouvrir dans un nouvel onglet ou téléchargez-le.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted/80 rounded-lg z-10">
                      <div className="text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground mb-2">
                          {isWord 
                            ? "Impossible d'afficher le fichier Word dans le navigateur."
                            : "Impossible d'afficher le document dans le navigateur."}
                        </p>
                        {isWord && (
                          <p className="text-xs text-muted-foreground mb-4">
                            Les fichiers Word (.doc, .docx) nécessitent Microsoft Word ou un lecteur compatible pour être ouverts.
                          </p>
                        )}
                        <div className="flex gap-2 justify-center">
                          <Button onClick={handleOpenInNewTab} variant="default">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Ouvrir dans un nouvel onglet
                          </Button>
                          <Button onClick={handleDownload} variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger
                          </Button>
                        </div>
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

