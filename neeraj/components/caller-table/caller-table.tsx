"use client"

import * as React from "react"
import { DataTable } from "./data-table"
import { createColumns } from "./columns"
import { EmailEditor } from "./email-editor"
import { TranscriptViewer } from "./transcript-viewer"
import { toast } from "sonner"
import { CheckCircle2 } from "lucide-react"
import type { Caller } from "@/types/conversation"

export function CallerTable() {
  const [data, setData] = React.useState<Caller[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [selectedCaller, setSelectedCaller] = React.useState<Caller | null>(null)
  const [emailEditorOpen, setEmailEditorOpen] = React.useState(false)
  const [transcriptViewerOpen, setTranscriptViewerOpen] = React.useState(false)

  React.useEffect(() => {
    fetchCallers()
  }, [])

  const fetchCallers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/callers")
      
      if (!response.ok) {
        throw new Error("Failed to fetch callers")
      }

      const result = await response.json()
      setData(result.allCallers || [])
    } catch (error) {
      toast.error("Failed to load caller data")
      console.error("Error fetching callers:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelegateClick = React.useCallback((caller: Caller) => {
    setSelectedCaller(caller)
    setEmailEditorOpen(true)
  }, [])

  const handleSendEmail = () => {
    // Show success toast with custom styling
    toast.success(
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-5 w-5" />
        <div>
          <p className="font-semibold">Message sent successfully!</p>
          <p className="text-sm text-muted-foreground">Meeting has been scheduled.</p>
        </div>
      </div>,
      {
        duration: 5000,
      }
    )
  }

  const handleRowClick = (caller: Caller) => {
    setSelectedCaller(caller)
    setTranscriptViewerOpen(true)
  }


  const columns = React.useMemo(
    () => createColumns(handleDelegateClick),
    [handleDelegateClick]
  )

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 bg-background rounded-lg p-6 border">
        <h2 className="text-3xl font-bold tracking-tight">Caller Management</h2>
        <p className="text-muted-foreground">
          View and manage all incoming calls and issues
        </p>
      </div>
      <DataTable 
        columns={columns} 
        data={data} 
        isLoading={isLoading} 
        onRowClick={handleRowClick}
      />
      
      {selectedCaller && (
        <>
          <EmailEditor
            open={emailEditorOpen}
            onOpenChange={setEmailEditorOpen}
            caller={selectedCaller}
            onSend={handleSendEmail}
          />
          <TranscriptViewer
            caller={selectedCaller}
            open={transcriptViewerOpen}
            onOpenChange={setTranscriptViewerOpen}
          />
        </>
      )}
    </div>
  )
}