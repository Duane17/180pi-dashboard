"use client"
import { useState, useEffect, useMemo } from "react"
import { AppShell } from "@/components/layout/AppShell"
import { EvidenceListToolbar, type SortOption } from "@/components/uploads/EvidenceListToolbar"
import { EvidenceList } from "@/components/uploads/EvidenceList"
import { EvidencePreviewModal } from "@/components/uploads/EvidencePreviewModal"
import { UploadStatusSummary } from "@/components/uploads/UploadStatusSummary"
import { RoleGuard } from "@/components/rbac/RoleGuard"
import type { EvidenceItem } from "@/components/uploads/EvidenceListItem"
import type { EvidenceType } from "@/components/uploads/TypeSelector"
import type { UploadStatus } from "@/components/uploads/StatusBadge"

// Mock data for demonstration
const mockEvidenceItems: EvidenceItem[] = [
  {
    id: "1",
    name: "Q4_2024_Utility_Bills.pdf",
    type: "Utility Bill",
    year: 2024,
    size: 2456789,
    status: "verified",
    uploadedAt: new Date("2024-01-15T10:30:00"),
    url: "/mock/files/utility-bills.pdf",
  },
  {
    id: "2",
    name: "Annual_HR_Report_2024.xlsx",
    type: "HR Report",
    year: 2024,
    size: 1234567,
    status: "verified",
    uploadedAt: new Date("2024-01-10T14:20:00"),
    url: "/mock/files/hr-report.xlsx",
  },
  {
    id: "3",
    name: "Sustainability_Audit_2023.pdf",
    type: "Audit Report",
    year: 2023,
    size: 5678901,
    status: "pending",
    uploadedAt: new Date("2024-01-08T09:15:00"),
    url: "/mock/files/audit-report.pdf",
  },
  {
    id: "4",
    name: "Energy_Consumption_Data.csv",
    type: "Utility Bill",
    year: 2024,
    size: 345678,
    status: "verified",
    uploadedAt: new Date("2024-01-05T16:45:00"),
    url: "/mock/files/energy-data.csv",
  },
  {
    id: "5",
    name: "Financial_Statement_2023.pdf",
    type: "Financial Statement",
    year: 2023,
    size: 3456789,
    status: "failed",
    uploadedAt: new Date("2024-01-03T11:30:00"),
    url: "/mock/files/financial-statement.pdf",
  },
]

const typeOptions: EvidenceType[] = [
  { label: "Utility Bill", value: "Utility Bill" },
  { label: "HR Report", value: "HR Report" },
  { label: "Audit Report", value: "Audit Report" },
  { label: "Financial Statement", value: "Financial Statement" },
  { label: "Sustainability Report", value: "Sustainability Report" },
  { label: "Environmental Certificate", value: "Environmental Certificate" },
  { label: "Training Record", value: "Training Record" },
  { label: "Other", value: "Other" },
]

export default function EvidenceLibraryPage() {
  const [items, setItems] = useState<EvidenceItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedYear, setSelectedYear] = useState<number | undefined>()
  const [selectedType, setSelectedType] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [previewItem, setPreviewItem] = useState<EvidenceItem | null>(null)
  const [announcement, setAnnouncement] = useState("")

  // Mock user for RBAC demonstration
  const mockUser = {
    id: "1",
    name: "Maha Chairi",
    email: "maha@180pi.com",
    role: "admin" as const,
    permissions: ["files.view", "files.download", "files.delete"],
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setIsError(false)

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setItems(mockEvidenceItems)
      } catch (error) {
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const filteredAndSortedItems = useMemo(() => {
    let filtered = items

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    // Apply year filter
    if (selectedYear) {
      filtered = filtered.filter((item) => item.year === selectedYear)
    }

    // Apply type filter
    if (selectedType) {
      filtered = filtered.filter((item) => item.type === selectedType)
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.uploadedAt.getTime() - a.uploadedAt.getTime()
        case "oldest":
          return a.uploadedAt.getTime() - b.uploadedAt.getTime()
        case "name-asc":
          return a.name.localeCompare(b.name)
        case "name-desc":
          return b.name.localeCompare(a.name)
        case "size-asc":
          return a.size - b.size
        case "size-desc":
          return b.size - a.size
        default:
          return 0
      }
    })

    return sorted
  }, [items, searchQuery, selectedYear, selectedType, sortBy])

  const statusCounts = useMemo(() => {
    const counts: Record<UploadStatus, number> = {
      queued: 0,
      uploading: 0,
      verifying: 0,
      completed: 0,
      verified: 0,
      pending: 0,
      failed: 0,
    }

    filteredAndSortedItems.forEach((item) => {
      counts[item.status] = (counts[item.status] || 0) + 1
    })

    return counts
  }, [filteredAndSortedItems])

  const handleRetry = () => {
    setIsError(false)
    setIsLoading(true)
    // Trigger data reload
    setTimeout(() => {
      setIsLoading(false)
      setItems(mockEvidenceItems)
    }, 1000)
  }

  const handlePreview = (item: EvidenceItem) => {
    setPreviewItem(item)
    setAnnouncement(`Opening preview for ${item.name}`)
  }

  const handleDownload = (item: EvidenceItem) => {
    setAnnouncement(`Downloading ${item.name}`)
    console.log("Download file:", item.name)
    // Simulate download
    const link = document.createElement("a")
    link.href = item.url || "#"
    link.download = item.name
    link.click()
  }

  const handleDelete = (item: EvidenceItem) => {
    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      setItems((prev) => prev.filter((i) => i.id !== item.id))
      setAnnouncement(`${item.name} has been deleted`)
      console.log("Delete file:", item.name)
    }
  }

  const handleProtectedDelete = (item: EvidenceItem) => {
    if (mockUser.permissions?.includes("files.delete")) {
      handleDelete(item)
    }
  }

  const handleClosePreview = () => {
    setPreviewItem(null)
    setAnnouncement("Preview closed")
  }

  return (
    <AppShell
      currentUser={mockUser}
      onProfile={() => console.log("Navigate to profile")}
      onSettings={() => console.log("Navigate to settings")}
      onSwitchCompany={() => console.log("Switch company")}
      onSignOut={() => console.log("Sign out")}
    >
      <div className="max-w-7xl mx-auto p-6">
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {announcement}
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] mb-2">
            Evidence Library
          </h1>
          <p className="text-gray-600">Manage and review your uploaded evidence documents</p>
        </div>

        <RoleGuard allowed={["admin"]} user={mockUser}>
          {!isLoading && !isError && items.length > 0 && (
            <div className="mb-6">
              <UploadStatusSummary statusCounts={statusCounts} totalFiles={items.length} />
            </div>
          )}
        </RoleGuard>

        <div className="mb-6">
          <EvidenceListToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            sortBy={sortBy}
            onSortChange={setSortBy}
            yearOptions={[2024, 2023, 2022, 2021, 2020]}
            typeOptions={typeOptions}
          />
        </div>

        <EvidenceList
          items={filteredAndSortedItems}
          isLoading={isLoading}
          isError={isError}
          onRetry={handleRetry}
          onPreview={handlePreview}
          onDownload={handleDownload}
          onDelete={handleProtectedDelete}
          userPermissions={mockUser.permissions}
        />

        <EvidencePreviewModal
          open={!!previewItem}
          item={previewItem}
          onClose={handleClosePreview}
          onDownload={handleDownload}
        />
      </div>
    </AppShell>
  )
}
