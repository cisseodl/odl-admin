import { useState } from "react"
import type { SortingState, ColumnFiltersState } from "@tanstack/react-table"

type UseDataTableOptions = {
  initialSorting?: SortingState
  initialColumnFilters?: ColumnFiltersState
}

export function useDataTable(options: UseDataTableOptions = {}) {
  const [sorting, setSorting] = useState<SortingState>(options.initialSorting || [])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    options.initialColumnFilters || []
  )

  return {
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
  }
}

