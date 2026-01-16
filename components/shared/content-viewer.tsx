"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, FileText, ExternalLink } from "lucide-react"
import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"

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
    if (open && contentUrl) {
      console.log("[ContentViewer] Ouverture du viewer avec:", { contentUrl, title, type })
      setLoading(true)
      setError(false)
      setIframeError(false)
      
      // Vérifier que l'URL est valide
      if (!contentUrl || contentUrl.trim() === "") {
        console.error("[ContentViewer] URL vide ou invalide")
        setError(true)
        setLoading(false)
      }
    }
  }, [open, contentUrl, title, type])

  const handleDownload = () => {
    // Forcer le téléchargement en créant un lien temporaire
    const link = document.createElement('a')
    link.href = contentUrl
    link.download = title || 'document'
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
  
  // Pour les fichiers Word et PDF, utiliser Google Docs Viewer pour forcer l'affichage
  const getViewerUrl = () => {
    if (isWord) {
      // Utiliser Google Docs Viewer comme alternative (plus fiable)
      return `https://docs.google.com/viewer?url=${encodeURIComponent(contentUrl)}&embedded=true`
    }
    if (isPDF) {
      // Utiliser Google Docs Viewer pour les PDFs aussi, pour éviter les téléchargements automatiques
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
                {t('common.open')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {t('common.download')}
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
                        <p className="text-sm text-muted-foreground">{t('content.viewer.loading_video') || "Chargement de la vidéo..."}</p>
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
                      src={getViewerUrl()}
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
                      type="application/pdf"
                    />
                  ) : isWord ? (
                    // Pour les fichiers Word, afficher un message et proposer d'ouvrir/télécharger
                    <div className="w-full h-full min-h-[600px] flex flex-col items-center justify-center bg-muted rounded-lg p-8">
                      <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">{t('content.viewer.word_detected') || "Fichier Word détecté"}</h3>
                      <p className="text-sm text-muted-foreground text-center mb-6 max-w-md">
                        {t('content.viewer.word_message') || "Les fichiers Word (.doc, .docx) ne peuvent pas être affichés directement dans le navigateur. Veuillez utiliser l'un des boutons ci-dessous pour ouvrir ou télécharger le fichier."}
                      </p>
                      <div className="flex gap-3">
                        <Button onClick={handleOpenInNewTab} variant="default" size="lg">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          {t('content.viewer.word_open') || "Ouvrir dans un nouvel onglet"}
                        </Button>
                        <Button onClick={handleDownload} variant="outline" size="lg">
                          <Download className="h-4 w-4 mr-2" />
                          {t('content.viewer.word_download') || "Télécharger le fichier"}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-4 text-center">
                        {t('content.viewer.word_info') || "Le fichier s'ouvrira dans Microsoft Word ou votre application par défaut pour les fichiers Word."}
                      </p>
                    </div>
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
                          {isWord ? t('content.viewer.loading_word') || "Chargement via Google Docs Viewer..." : t('content.viewer.loading_document') || "Chargement du document..."}
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
                            ? (t('content.viewer.error_word') || "Impossible d'afficher le fichier Word dans le navigateur.")
                            : (t('content.viewer.error_document') || "Impossible d'afficher le document dans le navigateur.")}
                        </p>
                        {isWord && (
                          <p className="text-xs text-muted-foreground mb-4">
                            {t('content.viewer.word_requires') || "Les fichiers Word (.doc, .docx) nécessitent Microsoft Word ou un lecteur compatible pour être ouverts."}
                          </p>
                        )}
                        <div className="flex gap-2 justify-center">
                          <Button onClick={handleOpenInNewTab} variant="default">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            {t('content.viewer.open_new_tab') || "Ouvrir dans un nouvel onglet"}
                          </Button>
                          <Button onClick={handleDownload} variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            {t('common.download')}
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
                {t('content.viewer.no_preview') || "Ce type de contenu ne peut pas être prévisualisé."}
              </p>
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                {t('content.viewer.download_file') || "Télécharger le fichier"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

