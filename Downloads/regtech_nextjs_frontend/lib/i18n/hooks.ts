"use client"

type LanguageContextType = {
  language: string
  setLanguage: (lang: string) => void
  t: (key: string, replacements?: Record<string, string | number>) => string
}

// Note: This will be used with a Context provider
export const useLanguage = (): LanguageContextType => {
  // Get from localStorage or default
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("language") || "en"
    return {
      language: stored,
      setLanguage: (lang: string) => {
        localStorage.setItem("language", lang)
        window.location.reload()
      },
      t: (key: string, replacements?: Record<string, string | number>) => {
        const { translations } = require("./translations")
        const keys = key.split(".")
        let value: any = translations[stored]

        for (const k of keys) {
          value = value?.[k]
        }

        let result = value || key

        if (replacements) {
          Object.entries(replacements).forEach(([k, v]) => {
            result = result.replace(`{${k}}`, String(v))
          })
        }

        return result
      },
    }
  }

  return {
    language: "en",
    setLanguage: () => {},
    t: (key: string) => key,
  }
}
