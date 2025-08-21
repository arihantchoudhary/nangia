"use client"

import * as React from "react"
import { FileText, Loader2, Trash2, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { TranscriptViewer } from "@/components/caller-table/transcript-viewer"
import type { Caller, ConversationItem, DashboardData } from "@/types/conversation"


export function ConversationDashboard() {
  const [isLoading, setIsLoading] = React.useState(true)
  const [selectedCaller, setSelectedCaller] = React.useState<Caller | null>(null)
  const [transcriptOpen, setTranscriptOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [conversationToDelete, setConversationToDelete] = React.useState<ConversationItem | null>(null)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [deletedIds, setDeletedIds] = React.useState<Set<string>>(new Set())
  const [isSyncing, setIsSyncing] = React.useState(false)
  const [data, setData] = React.useState<DashboardData>({
    conversationsByDate: {},
    allCallers: [],
    total: 0
  })

  React.useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/callers")
      
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data")
      }

      const result = await response.json()
      setData(result)
    } catch (error) {
      toast.error("Failed to load dashboard data")
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleConversationClick = (conversation: ConversationItem) => {
    if (conversation.fullData) {
      setSelectedCaller(conversation.fullData)
      setTranscriptOpen(true)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent, conversation: ConversationItem) => {
    e.stopPropagation() // Prevent triggering conversation click
    setConversationToDelete(conversation)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!conversationToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/conversations/${conversationToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete conversation')
      }

      toast.success('Conversation deleted successfully')
      setDeleteDialogOpen(false)
      
      // Add to deleted IDs and update local state
      const newDeletedIds = new Set(deletedIds)
      newDeletedIds.add(conversationToDelete.id)
      setDeletedIds(newDeletedIds)
      
      // Filter out the deleted conversation from the current data
      const updatedData = { ...data }
      
      // Update conversationsByDate
      if (updatedData.conversationsByDate) {
        Object.keys(updatedData.conversationsByDate).forEach(date => {
          updatedData.conversationsByDate[date] = updatedData.conversationsByDate[date].filter(
            conv => conv.id !== conversationToDelete.id
          )
          
          // Remove empty date groups
          if (updatedData.conversationsByDate[date].length === 0) {
            delete updatedData.conversationsByDate[date]
          }
        })
      }
      
      // Update allCallers
      updatedData.allCallers = updatedData.allCallers.filter(
        caller => caller.id.toString() !== conversationToDelete.id
      )
      updatedData.total = updatedData.allCallers.length
      
      setData(updatedData)
      setConversationToDelete(null)
    } catch (error) {
      toast.error('Failed to delete conversation')
      console.error('Error deleting conversation:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to sync')
      }

      const result = await response.json()
      toast.success(`Synced ${result.processed || 0} conversations`)
      
      // Clear deleted IDs since we synced
      setDeletedIds(new Set())
      
      // Refresh the data
      fetchDashboardData()
    } catch (error) {
      toast.error('Failed to sync with ElevenLabs')
      console.error('Error syncing:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  const getMeetingDurationColor = (duration?: number) => {
    switch (duration) {
      case 15: return "secondary"
      case 30: return "default"
      case 45: return "outline"
      case 60: return "destructive"
      default: return "outline"
    }
  }

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case "Critical": return "text-red-600"
      case "High": return "text-orange-600"
      case "Medium": return "text-yellow-600"
      case "Low": return "text-green-600"
      default: return "text-gray-600"
    }
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="flex justify-end mb-4">
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            size="sm"
            variant="outline"
          >
            {isSyncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync with ElevenLabs
              </>
            )}
          </Button>
        </div>
        <div className="space-y-8">
        {Object.entries(data.conversationsByDate).map(([date, conversations]) => (
          <div key={date}>
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              {date}
            </h3>
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => handleConversationClick(conversation)}
                >
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium line-clamp-1">
                          {conversation.title}
                        </h4>
                        {conversation.subtitle && (
                          <p className="text-sm text-muted-foreground">
                            {conversation.subtitle}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {conversation.meetingDuration && (
                          <Badge 
                            variant={getMeetingDurationColor(conversation.meetingDuration) as "default" | "secondary" | "destructive" | "outline"}
                            className="text-xs"
                          >
                            {conversation.meetingDuration} min
                          </Badge>
                        )}
                        {conversation.urgency && (
                          <span className={`text-xs font-medium ${getUrgencyColor(conversation.urgency)}`}>
                            {conversation.urgency}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {conversation.time}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleDeleteClick(e, conversation)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Delete conversation</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        </div>
      </div>
      
      <TranscriptViewer
        caller={selectedCaller}
        open={transcriptOpen}
        onOpenChange={setTranscriptOpen}
      />
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation with{" "}
              <span className="font-semibold">
                {conversationToDelete?.fullData?.callerName || conversationToDelete?.title}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}