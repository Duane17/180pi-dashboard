"use client"
import { useState } from "react"
import { AppShell } from "@/components/layout/AppShell"
import { EvidenceUploader } from "@/components/uploads/EvidenceUploader"
import type { EvidenceType } from "@/components/uploads/TypeSelector"

// Mock handlers for demonstration
const mockTypeOptions: EvidenceType[] = [
  { label: "Utility Bill", value: "utility-bill" },
  { label: "HR Report", value: "hr-report" },
  { label: "Audit Report", value: "audit-report" },
  { label: "Financial Statement", value: "financial-statement" },
  { label: "Sustainability Report", value: "sustainability-report" },
  { label: "Environmental Certificate", value: "environmental-certificate" },
  { label: "Training Record", value: "training-record" },
  { label: "Other", value: "other" },
]

export default function EvidenceUploaderPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [pageTitle] = useState("Upload Evidence - 180Pi")

  if (typeof document !== "undefined") {
    document.title = pageTitle
  }

  // Mock upload handlers - in a real app these would connect to your backend
  const handleRequestPresign = async (file: File): Promise<{ uploadUrl: string; fileId: string }> => {
    // Simulate API call to get presigned URL
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      uploadUrl: `https://mock-storage.example.com/upload/${file.name}`,
      fileId: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    }
  }

  const handleUploadToStorage = async (
    file: File,
    uploadUrl: string,
    onProgress: (progress: number) => void,
  ): Promise<void> => {
    // Simulate file upload with progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      onProgress(progress)
    }
  }

  const handleNotifyBackendComplete = async (fileId: string, metadata: any): Promise<void> => {
    // Simulate notifying backend that upload is complete
    await new Promise((resolve) => setTimeout(resolve, 800))
    console.log("Upload completed:", { fileId, metadata })
  }

  const handleYearChange = (year: number) => {
    console.log("Year changed:", year)
  }

  const handleTypeChange = (type: string) => {
    console.log("Type changed:", type)
  }

  const handleSelectFiles = (files: File[]) => {
    console.log(
      "Files selected:",
      files.map((f) => f.name),
    )
  }

  return (
    <AppShell>
      <main className="max-w-4xl mx-auto p-6" role="main" aria-label="Evidence upload page">
        <EvidenceUploader
          yearOptions={[2024, 2023, 2022, 2021, 2020]}
          defaultYear={2024}
          typeOptions={mockTypeOptions}
          onYearChange={handleYearChange}
          onTypeChange={handleTypeChange}
          onSelectFiles={handleSelectFiles}
          onRequestPresign={handleRequestPresign}
          onUploadToStorage={handleUploadToStorage}
          onNotifyBackendComplete={handleNotifyBackendComplete}
          isUploading={isUploading}
          isVerifying={isVerifying}
          acceptedTypes={[".pdf", ".png", ".jpg", ".jpeg", ".csv", ".xlsx"]}
          maxFileSize={25 * 1024 * 1024} // 25MB
          maxFiles={10}
        />
      </main>
    </AppShell>
  )
}
