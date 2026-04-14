"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface EngagementChartProps {
  data: {
    date: string
    instagram?: number
    facebook?: number
    linkedin?: number
    twitter?: number
  }[]
}

const COLORS = {
  instagram: "#E1306C",
  facebook: "#1877F2",
  linkedin: "#0A66C2",
  twitter: "#1DA1F2",
}

export function EngagementChart({ data }: EngagementChartProps) {
  const platforms = ["instagram", "facebook", "linkedin", "twitter"].filter(p =>
    data.some(d => (d as Record<string, unknown>)[p] && (d as Record<string, unknown>)[p] !== 0)
  )

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={v => `${v}%`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            fontSize: "12px",
          }}
          formatter={(value) => [`${value ?? 0}%`, ""]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
        />
        {platforms.map(platform => (
          <Line
            key={platform}
            type="monotone"
            dataKey={platform}
            stroke={COLORS[platform as keyof typeof COLORS]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
