"use client"

import { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/AppShell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  FileText,
  Download,
  Eye,
  Plus,
  Calendar,
  Building2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Database,
  Upload,
} from "lucide-react"

interface ReportTemplate {
  id: string
  name: string
  description: string
  type: "sustainability" | "investor"
  sections: string[]
  requiredData: string[]
}

const mockTemplates: ReportTemplate[] = [
  {
    id: "1",
    name: "Annual Sustainability Report",
    description: "Comprehensive ESG performance report with KPIs and narrative",
    type: "sustainability",
    sections: ["Executive Summary", "Environmental KPIs", "Social Impact", "Governance", "Future Targets"],
    requiredData: [
      "ghgScope1",
      "ghgScope2",
      "energyConsumption",
      "waterUse",
      "wasteGenerated",
      "workforceSize",
      "genderDiversityOverall",
    ],
  },
  {
    id: "2",
    name: "Investor ESG Brief",
    description: "Concise ESG overview for investor communications",
    type: "investor",
    sections: ["Key Metrics", "Material Topics", "Risk Assessment", "Performance Highlights"],
    requiredData: ["ghgScope1", "ghgScope2", "workforceSize", "genderDiversityOverall"],
  },
  {
    id: "3",
    name: "Climate Disclosure Report",
    description: "TCFD-aligned climate risk and opportunity reporting",
    type: "sustainability",
    sections: ["Governance", "Strategy", "Risk Management", "Metrics & Targets"],
    requiredData: ["ghgScope1", "ghgScope2", "energyConsumption"],
  },
]

interface UploadedData {
  year: number
  data: {
    ghgScope1?: number
    ghgScope2?: number
    energyConsumption?: number
    waterUse?: number
    wasteGenerated?: number
    workforceSize?: number
    genderDiversityOverall?: number
    genderDiversityManagement?: number
  }
  lastUpdated: string
  status: "complete" | "partial" | "missing"
}

const mockUploadedData: UploadedData[] = [
  {
    year: 2024,
    data: {
      ghgScope1: 1245.5,
      ghgScope2: 2890.2,
      energyConsumption: 4567.8,
      waterUse: 12340,
      wasteGenerated: 89.5,
      workforceSize: 1247,
      genderDiversityOverall: 42.3,
      genderDiversityManagement: 38.5,
    },
    lastUpdated: "2024-01-15",
    status: "complete",
  },
  {
    year: 2023,
    data: {
      ghgScope1: 1356.2,
      ghgScope2: 3100.5,
      energyConsumption: 4500.0,
      workforceSize: 1147,
      genderDiversityOverall: 41.2,
    },
    lastUpdated: "2024-01-10",
    status: "partial",
  },
  {
    year: 2022,
    data: {},
    lastUpdated: "",
    status: "missing",
  },
]

interface EvidenceFile {
  id: string
  name: string
  type: string
  year: number
  uploadedAt: string
  size: string
}

const mockEvidenceFiles: EvidenceFile[] = [
  {
    id: "1",
    name: "Energy_Audit_2024.pdf",
    type: "Energy Report",
    year: 2024,
    uploadedAt: "2024-01-15",
    size: "2.4 MB",
  },
  {
    id: "2",
    name: "GHG_Verification_2024.pdf",
    type: "Verification Report",
    year: 2024,
    uploadedAt: "2024-01-12",
    size: "1.8 MB",
  },
  {
    id: "3",
    name: "Diversity_Report_2024.pdf",
    type: "HR Report",
    year: 2024,
    uploadedAt: "2024-01-10",
    size: "1.2 MB",
  },
  {
    id: "4",
    name: "Water_Usage_2023.xlsx",
    type: "Utility Report",
    year: 2023,
    uploadedAt: "2023-12-20",
    size: "456 KB",
  },
]

export default function ReportsPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [reportYear, setReportYear] = useState<string>("2024")
  const [reportTitle, setReportTitle] = useState<string>("")
  const [reportDescription, setReportDescription] = useState<string>("")
  const [dataAvailability, setDataAvailability] = useState<UploadedData[]>([])
  const [evidenceFiles, setEvidenceFiles] = useState<EvidenceFile[]>([])

  useEffect(() => {
    setDataAvailability(mockUploadedData)
    setEvidenceFiles(mockEvidenceFiles)
  }, [])

  const handleCreateReport = () => {
    const selectedData = dataAvailability.find((d) => d.year === Number.parseInt(reportYear))
    console.log("Creating report:", {
      template: selectedTemplate,
      year: reportYear,
      title: reportTitle,
      description: reportDescription,
      availableData: selectedData,
      evidenceFiles: evidenceFiles.filter((f) => f.year === Number.parseInt(reportYear)),
    })
  }

  const selectedTemplateData = mockTemplates.find((t) => t.id === selectedTemplate)
  const selectedYearData = dataAvailability.find((d) => d.year === Number.parseInt(reportYear))
  const yearEvidenceFiles = evidenceFiles.filter((f) => f.year === Number.parseInt(reportYear))

  const checkDataAvailability = () => {
    if (!selectedTemplateData || !selectedYearData) return { available: 0, total: 0, missing: [] }

    const available = selectedTemplateData.requiredData.filter(
      (field) => selectedYearData.data[field as keyof typeof selectedYearData.data] !== undefined,
    ).length

    const missing = selectedTemplateData.requiredData.filter(
      (field) => selectedYearData.data[field as keyof typeof selectedYearData.data] === undefined,
    )

    return { available, total: selectedTemplateData.requiredData.length, missing }
  }

  const dataCheck = checkDataAvailability()
  const canCreateReport =
    selectedTemplate && reportTitle && selectedYearData?.status !== "missing" && dataCheck.available > 0

  return (
    <AppShell>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Narrator — Report Builder
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              Create professional ESG reports using your uploaded data and evidence
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Template Selection */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="glass-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Data Availability
                  </CardTitle>
                  <CardDescription>Review your uploaded data before creating reports</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {dataAvailability.map((yearData) => (
                      <div key={yearData.year} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{yearData.year}</span>
                          {yearData.status === "complete" && <CheckCircle className="h-5 w-5 text-green-500" />}
                          {yearData.status === "partial" && <AlertCircle className="h-5 w-5 text-yellow-500" />}
                          {yearData.status === "missing" && <XCircle className="h-5 w-5 text-red-500" />}
                        </div>
                        <Badge
                          variant={
                            yearData.status === "complete"
                              ? "default"
                              : yearData.status === "partial"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {yearData.status}
                        </Badge>
                        {yearData.lastUpdated && (
                          <p className="text-xs text-gray-500 mt-1">Updated: {yearData.lastUpdated}</p>
                        )}
                        <div className="mt-2 text-sm text-gray-600">
                          {Object.keys(yearData.data).length} metrics available
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Create New Report
                  </CardTitle>
                  <CardDescription>Choose a template and customize your report settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Template Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="template">Report Template</Label>
                    <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a report template" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            <div className="flex items-center gap-2">
                              <Badge variant={template.type === "sustainability" ? "default" : "secondary"}>
                                {template.type}
                              </Badge>
                              {template.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Report Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="year">Reporting Year</Label>
                      <Select value={reportYear} onValueChange={setReportYear}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2023">2023</SelectItem>
                          <SelectItem value="2022">2022</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="title">Report Title</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Annual Sustainability Report 2024"
                        value={reportTitle}
                        onChange={(e) => setReportTitle(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of this report..."
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {selectedTemplateData && selectedYearData && (
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                      <h4 className="font-semibold text-gray-900 mb-2">Data Requirements Check</h4>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="text-sm text-gray-600">
                          {dataCheck.available} of {dataCheck.total} required metrics available
                        </div>
                        {dataCheck.available === dataCheck.total ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>

                      {dataCheck.missing.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">Missing Data:</p>
                          <div className="flex flex-wrap gap-2">
                            {dataCheck.missing.map((field) => (
                              <Badge key={field} variant="outline" className="text-xs text-red-600 border-red-200">
                                {field}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            <Upload className="h-3 w-3 inline mr-1" />
                            Upload missing data in{" "}
                            <a href="/upload/data" className="text-blue-600 hover:underline">
                              Essentials Data
                            </a>
                          </p>
                        </div>
                      )}

                      <div className="space-y-2 mt-4">
                        <p className="text-sm font-medium text-gray-700">Template Sections:</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedTemplateData.sections.map((section, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {section}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleCreateReport}
                    disabled={!canCreateReport}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50"
                  >
                    {!canCreateReport && selectedYearData?.status === "missing"
                      ? "No Data Available for Selected Year"
                      : !canCreateReport
                        ? "Complete Required Fields"
                        : "Create Report"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              <Card className="glass-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Evidence Files ({reportYear})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {yearEvidenceFiles.length > 0 ? (
                    yearEvidenceFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900 truncate">{file.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {file.type}
                            </Badge>
                            <span className="text-xs text-gray-500">{file.size}</span>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">No evidence files for {reportYear}</p>
                      <Button variant="link" size="sm" className="text-blue-600">
                        <Upload className="h-4 w-4 mr-1" />
                        Upload Evidence
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Reports */}
              <Card className="glass-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Recent Reports</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: "Sustainability Report 2023", status: "Published", date: "2024-01-15" },
                    { name: "Q4 ESG Brief", status: "Draft", date: "2024-01-10" },
                    { name: "Climate Disclosure", status: "In Review", date: "2024-01-05" },
                  ].map((report, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900">{report.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={report.status === "Published" ? "default" : "secondary"} className="text-xs">
                            {report.status}
                          </Badge>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {report.date}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="glass-card border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Data Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {dataAvailability.filter((d) => d.status === "complete").length}
                      </div>
                      <div className="text-xs text-blue-700">Years Complete</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{evidenceFiles.length}</div>
                      <div className="text-xs text-purple-700">Evidence Files</div>
                    </div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {Object.keys(selectedYearData?.data || {}).length}
                    </div>
                    <div className="text-xs text-green-700">Metrics Available ({reportYear})</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
