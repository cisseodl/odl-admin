import { useState, useEffect, useMemo } from "react"

type UseSearchOptions<T> = {
  data: T[]
  searchKeys?: (keyof T)[]
  debounceMs?: number
}

export function useSearch<T extends Record<string, any>>({
  data,
  searchKeys,
  debounceMs = 300,
}: UseSearchOptions<T>) {
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [searchQuery, debounceMs])

  const filteredData = useMemo(() => {
    // S'assurer que data est toujours un tableau
    const safeData = Array.isArray(data) ? data : []
    
    if (!debouncedQuery) return safeData

    const query = debouncedQuery.toLowerCase()
    const keys = searchKeys || (safeData.length > 0 ? Object.keys(safeData[0] || {}) as (keyof T)[] : [])

    return safeData.filter((item) =>
      keys.some((key) => {
        const value = item[key]
        return value?.toString().toLowerCase().includes(query)
      })
    )
  }, [data, debouncedQuery, searchKeys])

  return {
    searchQuery,
    setSearchQuery,
    filteredData,
  }
}

