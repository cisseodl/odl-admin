"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type Language = "fr" | "en"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const STORAGE_KEY = "odl-language"

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("fr")
  const [translations, setTranslations] = useState<Record<string, any>>({})

  useEffect(() => {
    // Charger la langue depuis localStorage
    const savedLanguage = localStorage.getItem(STORAGE_KEY) as Language
    if (savedLanguage && (savedLanguage === "fr" || savedLanguage === "en")) {
      setLanguageState(savedLanguage)
    }
  }, [])

  useEffect(() => {
    // Charger les traductions
    const loadTranslations = async () => {
      try {
        const translationsModule = await import(`@/locales/${language}.json`)
        setTranslations(translationsModule.default || translationsModule)
      } catch (error) {
        console.error(`Failed to load translations for ${language}:`, error)
        // Fallback vers français si erreur
        if (language !== "fr") {
          try {
            const frTranslations = await import(`@/locales/fr.json`)
            setTranslations(frTranslations.default || frTranslations)
          } catch (e) {
            console.error("Failed to load fallback translations:", e)
          }
        }
      }
    }
    loadTranslations()
  }, [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem(STORAGE_KEY, lang)
    // Mettre à jour l'attribut lang du HTML
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", lang)
    }
  }

  useEffect(() => {
    // Mettre à jour l'attribut lang du HTML au chargement
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("lang", language)
    }
  }, [language])

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split(".")
    let value: any = translations
    
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k]
      } else {
        // Si la clé n'existe pas, retourner la clé elle-même
        return key
      }
    }
    
    let result = typeof value === "string" ? value : key
    
    // Gérer les pluriels automatiquement
    if (params && typeof result === "string") {
      // Vérifier si on a un paramètre count et si une clé _plural existe
      if (params.count !== undefined) {
        const pluralKey = key + "_plural"
        const pluralKeys = pluralKey.split(".")
        let pluralValue: any = translations
        let pluralExists = true
        
        for (const k of pluralKeys) {
          if (pluralValue && typeof pluralValue === "object" && k in pluralValue) {
            pluralValue = pluralValue[k]
          } else {
            pluralExists = false
            break
          }
        }
        
        // Utiliser la version plurielle si count > 1 et que la clé existe
        if (pluralExists && typeof pluralValue === "string" && Number(params.count) > 1) {
          result = pluralValue
        }
      }
      
      // Remplacer les paramètres dans la chaîne
      Object.keys(params).forEach((paramKey) => {
        result = result.replace(new RegExp(`{{${paramKey}}}`, "g"), String(params[paramKey]))
      })
    }
    
    return result
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
