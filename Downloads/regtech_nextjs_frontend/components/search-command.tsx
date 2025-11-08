"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface SearchResult {
  id: string
  title: string
  description?: string
  type: "client" | "facility" | "product" | "submission" | "document"
  link: string
}

export function SearchCommand() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "/" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(true)
      }
      if (e.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
        if (!response.ok) throw new Error("Search failed")

        const data = await response.json()
        setResults(data.results || [])
        setSelectedIndex(0)
      } catch (error) {
        console.error("[v0] Search error:", error)
        toast({
          title: "Search error",
          description: "Failed to perform search",
        })
      } finally {
        setLoading(false)
      }
    },
    [toast],
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (results[selectedIndex]) {
        router.push(results[selectedIndex].link)
        setOpen(false)
      }
    }
  }

  return (
    <>
      {/* Search Input */}
      <div className="flex items-center gap-2 flex-1 max-w-md relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3" />
        <input
          type="text"
          placeholder="Search... (Ctrl + /)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            handleSearch(e.target.value)
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {loading && <Loader2 className="w-4 h-4 text-slate-400 animate-spin absolute right-3" />}
      </div>

      {/* Search Results Dropdown */}
      {open && query && (
        <div className="absolute top-full left-0 mt-2 w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {results.length === 0 && !loading ? (
            <div className="p-4 text-center text-slate-500 text-sm">No results found for "{query}"</div>
          ) : (
            results.map((result, index) => (
              <button
                key={result.id}
                onClick={() => {
                  router.push(result.link)
                  setOpen(false)
                }}
                className={`w-full text-left p-3 border-b border-slate-100 last:border-b-0 transition-colors ${
                  index === selectedIndex ? "bg-blue-50" : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{result.title}</p>
                    {result.description && <p className="text-xs text-slate-600 truncate">{result.description}</p>}
                  </div>
                  <span className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded ml-2 flex-shrink-0">
                    {result.type}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </>
  )
}
