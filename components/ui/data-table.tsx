"use client"

import * as React from "react"
import { useLanguage } from "@/contexts/language-context"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  SortingState,
  ColumnFiltersState,
  useReactTable,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { cn } from "@/lib/utils"

type DataTableProps<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  className?: string
  enablePagination?: boolean
  pageSize?: number
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchValue,
  onSearchChange,
  className,
  enablePagination = true,
  pageSize = 10,
}: DataTableProps<TData, TValue>) {
  const { t } = useLanguage()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  // S'assurer que data est toujours un tableau pour éviter les erreurs
  const safeData = React.useMemo(() => {
    if (!data) return []
    if (!Array.isArray(data)) {
      console.warn("[DataTable] data is not an array, converting to empty array:", typeof data, data)
      return []
    }
    return data
  }, [data])

  // S'assurer que columns est toujours un tableau
  const safeColumns = React.useMemo(() => {
    if (!columns) return []
    if (!Array.isArray(columns)) {
      console.warn("[DataTable] columns is not an array, converting to empty array:", typeof columns, columns)
      return []
    }
    return columns
  }, [columns])

  // S'assurer que safeData et safeColumns sont valides avant de créer la table
  const isValidData = React.useMemo(() => {
    return Array.isArray(safeData) && safeData.length >= 0 && Array.isArray(safeColumns) && safeColumns.length > 0
  }, [safeData, safeColumns])

  const table = useReactTable({
    data: isValidData ? safeData : [],
    columns: isValidData ? safeColumns : [],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: isValidData ? getFilteredRowModel() : undefined,
    state: {
      sorting,
      columnFilters,
      ...(searchKey && searchValue
        ? {
            globalFilter: searchValue,
          }
        : {}),
    },
    ...(searchKey
      ? {
          globalFilterFn: (row, columnId, filterValue) => {
            try {
              if (!row || !row.original) return true
              const value = row.getValue(columnId) as string
              if (!value || !filterValue) return true
              return value?.toLowerCase().includes(filterValue.toLowerCase())
            } catch (error) {
              console.error("[DataTable] Error in globalFilterFn:", error)
              return true // Inclure la ligne en cas d'erreur
            }
          },
        }
      : {}),
    initialState: {
      pagination: {
        pageSize,
      },
    },
    // Protection supplémentaire : s'assurer que les modèles de données sont toujours valides
    manualFiltering: false,
    manualSorting: false,
    manualPagination: false,
  })

  // Protection supplémentaire : s'assurer que getRowModel() retourne toujours un objet valide
  const rowModel = React.useMemo(() => {
    try {
      const model = table.getRowModel()
      if (!model || !model.rows) {
        return { rows: [] }
      }
      if (!Array.isArray(model.rows)) {
        console.warn("[DataTable] getRowModel().rows is not an array:", typeof model.rows)
        return { rows: [] }
      }
      return model
    } catch (error) {
      console.error("[DataTable] Error getting row model:", error)
      return { rows: [] }
    }
  }, [table])

  // Protection supplémentaire : s'assurer que getFilteredRowModel() retourne toujours un objet valide
  const filteredRowModel = React.useMemo(() => {
    try {
      const model = table.getFilteredRowModel()
      if (!model || !model.rows) {
        return { rows: [] }
      }
      if (!Array.isArray(model.rows)) {
        console.warn("[DataTable] getFilteredRowModel().rows is not an array:", typeof model.rows)
        return { rows: [] }
      }
      return model
    } catch (error) {
      console.error("[DataTable] Error getting filtered row model:", error)
      return { rows: [] }
    }
  }, [table])

  return (
    <div className={cn("space-y-4", className)}>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rowModel.rows && Array.isArray(rowModel.rows) && rowModel.rows.length > 0 ? (
              rowModel.rows.map((row) => {
                if (!row || !row.original) {
                  return null
                }
                const visibleCells = row.getVisibleCells()
                if (!visibleCells || !Array.isArray(visibleCells)) {
                  return null
                }
                return (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {visibleCells.map((cell) => {
                      if (!cell) {
                        return null
                      }
                      try {
                        const rendered = flexRender(cell.column.columnDef.cell, cell.getContext())
                        return (
                          <TableCell key={cell.id}>
                            {rendered ?? null}
                          </TableCell>
                        )
                      } catch (error) {
                        console.error("[DataTable] Error rendering cell:", error)
                        return (
                          <TableCell key={cell.id}>
                            -
                          </TableCell>
                        )
                      }
                    })}
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={safeColumns.length || columns.length} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <p className="text-sm font-medium text-muted-foreground">{t('table.no_results') || 'Aucun résultat'}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t('table.no_results_description') || 'Aucune donnée disponible'}</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {enablePagination && (
        <div className="flex items-center justify-between px-2">
          <div className="flex-1 text-sm text-muted-foreground">
            {t('table.total_results', { count: filteredRowModel.rows?.length || safeData.length || 0 })}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              aria-label={t('table.first_page')}
              className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label={t('table.previous_page')}
              className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {t('table.page_info', { current: table.getState().pagination.pageIndex + 1, total: table.getPageCount() })}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label={t('table.next_page')}
              className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              aria-label={t('table.last_page')}
              className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

