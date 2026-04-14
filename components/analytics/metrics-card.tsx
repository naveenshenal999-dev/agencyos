import { Card, CardContent } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface MetricsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color: string
  bg: string
  change?: string
  changeType?: "positive" | "negative" | "neutral"
}

export function MetricsCard({ title, value, icon: Icon, color, bg, change, changeType = "neutral" }: MetricsCardProps) {
  const changeColors = {
    positive: "text-green-400",
    negative: "text-red-400",
    neutral: "text-muted-foreground",
  }

  return (
    <Card className="border-border/60 bg-card/50">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          {change && (
            <span className={`text-xs font-medium ${changeColors[changeType]}`}>{change}</span>
          )}
        </div>
        <div className="text-2xl font-bold mb-0.5">{value}</div>
        <div className="text-sm text-muted-foreground">{title}</div>
      </CardContent>
    </Card>
  )
}
