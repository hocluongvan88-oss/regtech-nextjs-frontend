"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { defaultLanguage, type Language } from "./config"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, replacements?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage)
  const [mounted, setMounted] = useState(false)

  // Load language from localStorage on mount
  useEffect(() => {
    const stored = (localStorage.getItem("language") as Language) || defaultLanguage
    setLanguageState(stored)
    setMounted(true)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    const translations: Record<Language, Record<string, any>> = {
      en: require("./translations").translations.en,
      vi: require("./translations").translations.vi,
    }

    const keys = key.split(".")
    let value: any = translations[language]

    for (const k of keys) {
      value = value?.[k]
    }

    let result = (value as string) || key

    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        result = result.replace(`{${k}}`, String(v))
      })
    }

    return result
  }

  const contextValue: LanguageContextType = { language, setLanguage, t }

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>
}

export function useLanguageContext() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguageContext must be used within LanguageProvider")
  }
  return context
}
