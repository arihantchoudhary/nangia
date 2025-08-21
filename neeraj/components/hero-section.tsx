"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Users } from "lucide-react"

interface StatsData {
  callsLastWeek: number
  peopleSpokenTo: number
}

export function HeroSection() {
  const [stats, setStats] = React.useState<StatsData>({
    callsLastWeek: 0,
    peopleSpokenTo: 0
  })

  React.useEffect(() => {
    // Fetch stats from API
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
      // Use mock data as fallback
      setStats({
        callsLastWeek: 47,
        peopleSpokenTo: 23
      })
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Hello Neeraj</h1>
        <p className="text-muted-foreground text-lg">
          Here&apos;s your assistant&apos;s activity summary
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Calls This Week
            </CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.callsLastWeek}</div>
            <p className="text-xs text-muted-foreground">
              Total calls handled by your assistant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              People Contacted
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.peopleSpokenTo}</div>
            <p className="text-xs text-muted-foreground">
              Unique employees spoken to
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}