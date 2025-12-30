"use client"

import { PageHeader } from "@/components/ui/page-header"
import { SearchBar } from "@/components/ui/search-bar"
import { Card, CardContent } from "@/components/ui/card"
import type { ReactNode } from "react"

type ListPageProps = {
  title: string
  description?: string
  searchPlaceholder?: string
  searchValue: string
  onSearchChange: (value: string) => void
  action?: {
    label: string
    onClick: () => void
    icon?: ReactNode
  }
  children: ReactNode
  className?: string
}

export function ListPage({
  title,
  description,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  action,
  children,
  className,
}: ListPageProps) {
  return (
    <div className={`space-y-6 ${className || ""}`}>
      <PageHeader title={title} description={description} action={action} />

      <Card>
        <CardContent>
          {searchPlaceholder && (
            <div className="mb-4">
              <SearchBar
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={onSearchChange}
              />
            </div>
          )}
          {children}
        </CardContent>
      </Card>
    </div>
  )
}

