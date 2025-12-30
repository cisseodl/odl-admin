"use client"

import { Card, CardContent } from "@/components/ui/card"

type BadgePreviewProps = {
  name: string
  description: string
  icon: string
  color: string
}

export function BadgePreview({ name, description, icon, color }: BadgePreviewProps) {
  return (
    <Card className="w-fit">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full ${color} text-white text-3xl shadow-lg`}
          >
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-lg leading-tight">{name}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mt-1">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

