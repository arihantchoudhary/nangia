"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, UserPlus, Bot } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Caller } from "@/types/conversation"

// Remove the local type definition since we're using the centralized one

export const createColumns = (
  onDelegateClick: (caller: Caller) => void
): ColumnDef<Caller>[] => [
  {
    accessorKey: "callerName",
    header: () => <div className="text-center">Caller Name</div>,
    cell: ({ row }) => {
      return <div className="text-center font-medium px-4 py-2">{row.getValue("callerName")}</div>
    },
  },
  {
    accessorKey: "title",
    header: () => <div className="text-center">Title</div>,
    cell: ({ row }) => {
      return <div className="text-center text-muted-foreground px-4 py-2">{row.getValue("title")}</div>
    },
  },
  {
    accessorKey: "subtitle",
    header: () => <div className="text-center">Issue Type</div>,
    cell: ({ row }) => {
      const issueType = row.getValue("subtitle") as string
      return (
        <div className="text-center px-4 py-2">
          <Badge variant="outline" className="capitalize">
            {issueType}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "meetingDuration",
    header: () => <div className="text-center">Meeting Duration</div>,
    cell: ({ row }) => {
      const duration = row.getValue("meetingDuration") as number
      
      return (
        <div className="text-center px-2">
          <Badge variant="secondary" className="font-normal">
            {duration} min
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "urgency",
    header: () => <div className="text-center">Urgency</div>,
    cell: ({ row }) => {
      const urgency = row.getValue("urgency") as string
      const variant = 
        urgency === "Critical" ? "destructive" : 
        urgency === "High" ? "secondary" : 
        urgency === "Medium" ? "outline" :
        "default"
      
      return (
        <div className="text-center px-4 py-2">
          <Badge variant={variant} className="capitalize">
            {urgency}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "timeRequested",
    header: () => <div className="text-center">Time Requested</div>,
    cell: ({ row }) => {
      const timeRequested = row.getValue("timeRequested") as string
      const date = new Date(timeRequested)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      
      let timeAgo = ""
      if (diffHours > 0) {
        timeAgo = `${diffHours}h ${diffMinutes}m ago`
      } else {
        timeAgo = `${diffMinutes}m ago`
      }
      
      return (
        <div className="text-center text-muted-foreground px-4 py-2">
          {timeAgo}
        </div>
      )
    },
  },
  {
    id: "respondToAgent",
    header: () => <div className="text-center">Respond to Agent</div>,
    cell: ({ row }) => {
      const caller = row.original
      
      return (
        <div className="flex items-center justify-center px-4 py-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-primary/10"
            onClick={(e) => {
              e.stopPropagation()
              // Handle respond to agent action
              console.log("Respond to agent for:", caller.callerName)
            }}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src="/api/placeholder/32/32" alt="Agent" />
              <AvatarFallback className="bg-primary/10">
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </Button>
        </div>
      )
    },
  },
  {
    id: "delegate",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const caller = row.original

      return (
        <div className="flex items-center justify-center gap-2 px-4 py-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onDelegateClick(caller)
            }}
            className="h-8"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Delegate
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View details</DropdownMenuItem>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    },
  },
]