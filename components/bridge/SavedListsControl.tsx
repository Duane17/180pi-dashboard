"use client"
import { useState } from "react"
import type React from "react"

import { Heart, Plus, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface SavedList {
  id: string
  name: string
}

interface SavedListsControlProps {
  lists: SavedList[]
  onCreate: (name: string) => void
  onSaveTo: (listId: string) => void
  className?: string
}

export function SavedListsControl({ lists, onCreate, onSaveTo, className }: SavedListsControlProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newListName, setNewListName] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateList = async () => {
    if (!newListName.trim()) return

    setIsCreating(true)
    try {
      await onCreate(newListName.trim())
      setNewListName("")
      setIsCreateDialogOpen(false)
    } finally {
      setIsCreating(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleCreateList()
    }
  }

  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-white/60 backdrop-blur-sm border-gray-200">
            <Heart className="mr-2 h-4 w-4" />
            Save to List
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {lists.length > 0 && (
            <>
              {lists.map((list) => (
                <DropdownMenuItem key={list.id} onClick={() => onSaveTo(list.id)}>
                  <Heart className="mr-2 h-4 w-4" />
                  {list.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </>
          )}

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Plus className="mr-2 h-4 w-4" />
                Create New List
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-white/90 backdrop-blur-lg border border-gray-100">
              <DialogHeader>
                <DialogTitle className="bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] bg-clip-text text-transparent">
                  Create New List
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="list-name">List Name</Label>
                  <Input
                    id="list-name"
                    placeholder="e.g., Climate Funds — Africa"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="bg-white/60 backdrop-blur-sm border-gray-200 focus:border-[#3270a1] focus:ring-[#3270a1]/20"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setIsCreateDialogOpen(false)}
                    variant="outline"
                    className="flex-1 bg-transparent"
                    disabled={isCreating}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateList}
                    disabled={!newListName.trim() || isCreating}
                    className="flex-1 bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] text-white hover:shadow-lg hover:shadow-[#3270a1]/25 transition-all duration-200"
                  >
                    {isCreating ? "Creating..." : "Create List"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
