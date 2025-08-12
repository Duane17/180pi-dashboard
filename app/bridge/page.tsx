"use client"
import { useState, useMemo } from "react"
import { BridgeShell } from "@/components/bridge/BridgeShell"
import { FiltersPanel } from "@/components/bridge/FiltersPanel"
import { InvestorToolbar } from "@/components/bridge/InvestorToolbar"
import { InvestorCard } from "@/components/bridge/InvestorCard"
import { InvestorListItem } from "@/components/bridge/InvestorListItem"
import { CompareDrawer } from "@/components/bridge/CompareDrawer"
import { SavedListsControl } from "@/components/bridge/SavedListsControl"
import { ContactInvestorModal } from "@/components/bridge/ContactInvestorModal"
import { EmptyState } from "@/components/bridge/EmptyState"
import { ErrorState } from "@/components/bridge/ErrorState"
import { LoadingSkeleton } from "@/components/bridge/LoadingSkeleton"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

// Mock data types
interface Investor {
  id: string
  name: string
  logoUrl?: string
  aum?: number
  stages: string[]
  ticket?: { min?: number; max?: number }
  geos: string[]
  themes: string[]
  blurb?: string
}

interface FilterValues {
  themes: string[]
  sectors: string[]
  stages: string[]
  geos: string[]
  esgPrefs: string[]
  targets: string[]
  ticketMin: number
  ticketMax: number
  sectorSearch: string
}

interface SavedList {
  id: string
  name: string
}

// Mock data
const mockFilterOptions = {
  themes: [
    "Climate Action",
    "Clean Energy",
    "Sustainable Agriculture",
    "Water Conservation",
    "Circular Economy",
    "Social Impact",
    "Gender Equality",
    "Education",
    "Healthcare Access",
    "Affordable Housing",
  ],
  sectors: [
    "Energy & Utilities",
    "Technology",
    "Healthcare",
    "Financial Services",
    "Manufacturing",
    "Agriculture & Food",
    "Transportation",
    "Real Estate",
    "Consumer Goods",
    "Education",
  ],
  stages: ["Pre-Seed", "Seed", "Series A", "Series B", "Series C", "Growth", "Late Stage"],
  geos: [
    "North America",
    "Europe",
    "Asia Pacific",
    "Latin America",
    "Africa",
    "Middle East",
    "United States",
    "United Kingdom",
    "Germany",
    "Singapore",
  ],
  esgPrefs: [
    "No Fossil Fuels",
    "No Tobacco",
    "No Weapons",
    "Active Engagement",
    "Stewardship Focus",
    "Impact Measurement",
    "B-Corp Certified",
    "UN PRI Signatory",
  ],
  targets: [
    "SBTi Committed",
    "Net Zero by 2030",
    "Net Zero by 2050",
    "Carbon Neutral",
    "RE100 Member",
    "1.5°C Aligned",
    "Paris Agreement",
  ],
}

const mockInvestors: Investor[] = [
  {
    id: "1",
    name: "GreenTech Ventures",
    logoUrl: "/placeholder.svg?height=40&width=40",
    aum: 500000000,
    stages: ["Seed", "Series A", "Series B"],
    ticket: { min: 500000, max: 10000000 },
    geos: ["North America", "Europe"],
    themes: ["Climate Action", "Clean Energy", "Circular Economy"],
    blurb:
      "Leading climate tech investor focused on scalable solutions for carbon reduction and renewable energy infrastructure.",
  },
  {
    id: "2",
    name: "Impact Capital Partners",
    logoUrl: "/placeholder.svg?height=40&width=40",
    aum: 1200000000,
    stages: ["Series A", "Series B", "Growth"],
    ticket: { min: 2000000, max: 25000000 },
    geos: ["Global"],
    themes: ["Social Impact", "Healthcare Access", "Education"],
    blurb:
      "Global impact investor committed to generating positive social and environmental outcomes alongside financial returns.",
  },
  {
    id: "3",
    name: "Sustainable Growth Fund",
    logoUrl: "/placeholder.svg?height=40&width=40",
    aum: 800000000,
    stages: ["Series B", "Series C", "Late Stage"],
    ticket: { min: 5000000, max: 50000000 },
    geos: ["Europe", "Asia Pacific"],
    themes: ["Sustainable Agriculture", "Water Conservation", "Clean Energy"],
    blurb:
      "European-based fund investing in mature sustainable businesses with proven impact metrics and scalable models.",
  },
  {
    id: "4",
    name: "Climate Innovation Labs",
    logoUrl: "/placeholder.svg?height=40&width=40",
    aum: 300000000,
    stages: ["Pre-Seed", "Seed", "Series A"],
    ticket: { min: 100000, max: 5000000 },
    geos: ["North America"],
    themes: ["Climate Action", "Clean Energy", "Circular Economy"],
    blurb:
      "Early-stage climate tech accelerator and fund supporting breakthrough innovations in carbon capture and renewable energy.",
  },
  {
    id: "5",
    name: "Social Ventures Asia",
    logoUrl: "/placeholder.svg?height=40&width=40",
    aum: 450000000,
    stages: ["Seed", "Series A", "Series B"],
    ticket: { min: 750000, max: 15000000 },
    geos: ["Asia Pacific"],
    themes: ["Social Impact", "Healthcare Access", "Education", "Gender Equality"],
    blurb:
      "Asia-focused impact investor supporting scalable solutions to social challenges across healthcare, education, and financial inclusion.",
  },
  {
    id: "6",
    name: "Blue Ocean Capital",
    logoUrl: "/placeholder.svg?height=40&width=40",
    aum: 2000000000,
    stages: ["Growth", "Late Stage"],
    ticket: { min: 10000000, max: 100000000 },
    geos: ["Global"],
    themes: ["Water Conservation", "Sustainable Agriculture", "Climate Action"],
    blurb:
      "Large-scale investor focused on water technology, sustainable food systems, and climate adaptation solutions worldwide.",
  },
]

const mockSavedLists: SavedList[] = [
  { id: "1", name: "Climate Focused Funds" },
  { id: "2", name: "Early Stage Investors" },
  { id: "3", name: "European Partners" },
]

// Mock match scores
const mockMatchScores: Record<string, number> = {
  "1": 92,
  "2": 78,
  "3": 85,
  "4": 88,
  "5": 72,
  "6": 81,
}

export default function BridgePage() {
  // State management
  const [filterValues, setFilterValues] = useState<FilterValues>({
    themes: [],
    sectors: [],
    stages: [],
    geos: [],
    esgPrefs: [],
    targets: [],
    ticketMin: 10000,
    ticketMax: 10000000,
    sectorSearch: "",
  })

  const [query, setQuery] = useState("")
  const [sort, setSort] = useState("match")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [savedView, setSavedView] = useState("all")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Comparison state
  const [selectedInvestors, setSelectedInvestors] = useState<string[]>([])
  const [isCompareOpen, setIsCompareOpen] = useState(false)

  // Contact modal state
  const [contactInvestor, setContactInvestor] = useState<Investor | null>(null)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Generate filter chips from current filter values
  const filterChips = useMemo(() => {
    const chips: Array<{ key: string; label: string }> = []

    filterValues.themes.forEach((theme) => chips.push({ key: `theme-${theme}`, label: theme }))
    filterValues.sectors.forEach((sector) => chips.push({ key: `sector-${sector}`, label: sector }))
    filterValues.stages.forEach((stage) => chips.push({ key: `stage-${stage}`, label: stage }))
    filterValues.geos.forEach((geo) => chips.push({ key: `geo-${geo}`, label: geo }))
    filterValues.esgPrefs.forEach((pref) => chips.push({ key: `esg-${pref}`, label: pref }))
    filterValues.targets.forEach((target) => chips.push({ key: `target-${target}`, label: target }))

    return chips
  }, [filterValues])

  // Filter and sort investors
  const filteredInvestors = useMemo(() => {
    let filtered = mockInvestors

    // Apply text search
    if (query) {
      filtered = filtered.filter(
        (investor) =>
          investor.name.toLowerCase().includes(query.toLowerCase()) ||
          investor.themes.some((theme) => theme.toLowerCase().includes(query.toLowerCase())) ||
          investor.blurb?.toLowerCase().includes(query.toLowerCase()),
      )
    }

    // Apply filters
    if (filterValues.themes.length > 0) {
      filtered = filtered.filter((investor) => filterValues.themes.some((theme) => investor.themes.includes(theme)))
    }

    if (filterValues.stages.length > 0) {
      filtered = filtered.filter((investor) => filterValues.stages.some((stage) => investor.stages.includes(stage)))
    }

    if (filterValues.geos.length > 0) {
      filtered = filtered.filter((investor) => filterValues.geos.some((geo) => investor.geos.includes(geo)))
    }

    // Apply sorting
    switch (sort) {
      case "match":
        filtered.sort((a, b) => (mockMatchScores[b.id] || 0) - (mockMatchScores[a.id] || 0))
        break
      case "newest":
        // Mock: reverse order for "newest"
        filtered.reverse()
        break
      case "aum":
        filtered.sort((a, b) => (b.aum || 0) - (a.aum || 0))
        break
      case "alpha":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    return filtered
  }, [query, filterValues, sort])

  // Paginated results
  const paginatedInvestors = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredInvestors.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredInvestors, currentPage])

  const totalPages = Math.ceil(filteredInvestors.length / itemsPerPage)

  // Event handlers
  const handleApplyFilters = () => {
    setCurrentPage(1)
    // In a real app, this would trigger an API call
  }

  const handleClearFilters = () => {
    setFilterValues({
      themes: [],
      sectors: [],
      stages: [],
      geos: [],
      esgPrefs: [],
      targets: [],
      ticketMin: 10000,
      ticketMax: 10000000,
      sectorSearch: "",
    })
    setCurrentPage(1)
  }

  const handleRemoveChip = (key: string) => {
    const [type, value] = key.split("-", 2)
    const newValues = { ...filterValues }

    switch (type) {
      case "theme":
        newValues.themes = newValues.themes.filter((t) => t !== value)
        break
      case "sector":
        newValues.sectors = newValues.sectors.filter((s) => s !== value)
        break
      case "stage":
        newValues.stages = newValues.stages.filter((s) => s !== value)
        break
      case "geo":
        newValues.geos = newValues.geos.filter((g) => g !== value)
        break
      case "esg":
        newValues.esgPrefs = newValues.esgPrefs.filter((e) => e !== value)
        break
      case "target":
        newValues.targets = newValues.targets.filter((t) => t !== value)
        break
    }

    setFilterValues(newValues)
  }

  const handleClearAllChips = () => {
    handleClearFilters()
  }

  const handleSelectInvestor = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedInvestors((prev) => [...prev, id])
    } else {
      setSelectedInvestors((prev) => prev.filter((investorId) => investorId !== id))
    }
  }

  const handleRemoveFromComparison = (id: string) => {
    setSelectedInvestors((prev) => prev.filter((investorId) => investorId !== id))
  }

  const handleContactInvestor = (investor: Investor) => {
    setContactInvestor(investor)
    setIsContactModalOpen(true)
  }

  const handleSendContact = async (payload: { subject: string; message: string; includeAttachments: boolean }) => {
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    console.log("Contact sent:", payload)
  }

  const handleCreateList = async (name: string) => {
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    console.log("Created list:", name)
  }

  const handleSaveToList = (listId: string) => {
    console.log("Saved to list:", listId)
  }

  // Get selected investor objects for comparison
  const selectedInvestorObjects = selectedInvestors
    .map((id) => mockInvestors.find((inv) => inv.id === id)!)
    .filter(Boolean)

  // Show comparison drawer when investors are selected
  const showCompareDrawer = selectedInvestors.length > 0

  return (
    <>
     {/* Back to Dashboard */}
    <div className="flex items-center mb-6 mt-6 pl-4">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 group"
      >
        <ArrowLeft
          className="w-5 h-5 bg-gradient-to-r from-[#8dcddb] to-[#7e509c] bg-clip-text text-transparent transition-transform duration-200 group-hover:-translate-x-1"
        />
        <span className="text-base font-medium bg-gradient-to-r from-[#8dcddb] to-[#7e509c] bg-clip-text text-transparent group-hover:from-[#7e509c] group-hover:to-[#8dcddb] transition-colors duration-200">
          Back to Dashboard
        </span>
      </Link>
    </div>

    <BridgeShell
      filtersSlot={
        <FiltersPanel
          values={filterValues}
          onChange={setFilterValues}
          options={mockFilterOptions}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
          chips={filterChips}
          onRemoveChip={handleRemoveChip}
          onClearAllChips={handleClearAllChips}
        />
      }
      resultsSlot={
        <div className="space-y-6">
          {/* Toolbar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <InvestorToolbar
              query={query}
              onQueryChange={setQuery}
              sort={sort}
              onSortChange={setSort}
              view={view}
              onViewChange={setView}
              savedView={savedView}
              onSavedViewChange={setSavedView}
              resultsCount={filteredInvestors.length}
            />

            <div className="flex items-center gap-3">
              <SavedListsControl lists={mockSavedLists} onCreate={handleCreateList} onSaveTo={handleSaveToList} />
              {selectedInvestors.length > 0 && (
                <Button
                  onClick={() => setIsCompareOpen(true)}
                  variant="outline"
                  className="bg-gradient-to-r from-[#8dcddb]/10 to-[#7e509c]/10 border-[#3270a1]/20 text-[#3270a1] hover:bg-gradient-to-r hover:from-[#8dcddb]/20 hover:to-[#7e509c]/20"
                >
                  Compare ({selectedInvestors.length})
                </Button>
              )}
            </div>
          </div>

          {/* Results */}
          {isLoading ? (
            <LoadingSkeleton count={itemsPerPage} view={view} />
          ) : error ? (
            <ErrorState onRetry={() => setError(null)} />
          ) : filteredInvestors.length === 0 ? (
            <EmptyState
              hasActiveFilters={filterChips.length > 0}
              onAdjustFilters={() => {}}
              onClearFilters={handleClearFilters}
            />
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedInvestors.map((investor) => (
                <InvestorCard
                  key={investor.id}
                  investor={investor}
                  matchScore={mockMatchScores[investor.id]}
                  onView={() => console.log("View investor:", investor.id)}
                  onSave={() => console.log("Save investor:", investor.id)}
                  onContact={() => handleContactInvestor(investor)}
                  isSelected={selectedInvestors.includes(investor.id)}
                  onSelect={(selected) => handleSelectInvestor(investor.id, selected)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedInvestors.map((investor) => (
                <InvestorListItem
                  key={investor.id}
                  investor={investor}
                  matchScore={mockMatchScores[investor.id]}
                  onView={() => console.log("View investor:", investor.id)}
                  onSave={() => console.log("Save investor:", investor.id)}
                  onContact={() => handleContactInvestor(investor)}
                  isSelected={selectedInvestors.includes(investor.id)}
                  onSelect={(selected) => handleSelectInvestor(investor.id, selected)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8">
              <Button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                variant="outline"
                className="bg-white/60 backdrop-blur-sm"
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                variant="outline"
                className="bg-white/60 backdrop-blur-sm"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      }
    >
      {/* Compare Drawer */}
      <CompareDrawer
        open={showCompareDrawer}
        items={selectedInvestorObjects}
        matchScores={mockMatchScores}
        onClose={() => setSelectedInvestors([])}
        onRemoveItem={handleRemoveFromComparison}
      />

      {/* Contact Modal */}
      <ContactInvestorModal
        open={isContactModalOpen}
        investor={contactInvestor}
        onClose={() => {
          setIsContactModalOpen(false)
          setContactInvestor(null)
        }}
        onSend={handleSendContact}
      />
    </BridgeShell>
    </>
  )
}
