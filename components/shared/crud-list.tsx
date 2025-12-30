"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { SearchBar } from "@/components/ui/search-bar"
import { DataTable } from "@/components/ui/data-table"
import { useModal } from "@/hooks/use-modal"
import { useSearch } from "@/hooks/use-search"
import type { ColumnDef } from "@tanstack/react-table"
import type { ReactNode } from "react"

type CrudListProps<TData> = {
  title: string
  description?: string
  data: TData[]
  columns: ColumnDef<TData>[]
  searchKeys?: (keyof TData)[]
  onAdd?: () => void
  addLabel?: string
  renderModals?: (modals: ReturnType<typeof useModal<TData>>) => ReactNode
  emptyState?: ReactNode
  className?: string
}

export function CrudList<TData extends Record<string, any>>({
  title,
  description,
  data,
  columns,
  searchKeys,
  onAdd,
  addLabel = "Ajouter",
  renderModals,
  emptyState,
  className,
}: CrudListProps<TData>) {
  const addModal = useModal<TData>()
  const editModal = useModal<TData>()
  const deleteModal = useModal<TData>()
  const viewModal = useModal<TData>()

  const { searchQuery, setSearchQuery, filteredData } = useSearch<TData>({
    data,
    searchKeys,
  })

  return (
    <div className={className}>
      <PageHeader
        title={title}
        description={description}
        action={
          onAdd
            ? {
                label: addLabel,
                onClick: () => {
                  if (onAdd) {
                    onAdd()
                  } else {
                    addModal.open()
                  }
                },
              }
            : undefined
        }
      />

      <Card className="mt-6">
        <CardContent>
          <div className="mb-4">
            <SearchBar
              placeholder={`Rechercher dans ${title.toLowerCase()}...`}
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>

          {filteredData.length === 0 && emptyState ? (
            emptyState
          ) : (
            <DataTable columns={columns} data={filteredData} searchValue={searchQuery} />
          )}
        </CardContent>
      </Card>

      {renderModals && (
        <>
          {renderModals({
            isOpen: addModal.isOpen,
            selectedItem: addModal.selectedItem,
            open: addModal.open,
            close: addModal.close,
            toggle: addModal.toggle,
          })}
        </>
      )}
    </div>
  )
}

