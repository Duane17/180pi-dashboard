"use client"

import { useState, useMemo } from "react"
import { BridgeShell } from "@/components/bridge/BridgeShell"
import { FiltersPanel } from "@/components/bridge/FiltersPanel"
import { InvestorToolbar } from "@/components/bridge/InvestorToolbar"
import { InvestorCard } from "@/components/bridge/InvestorCard"
import { InvestorListItem } from "@/components/bridge/InvestorListItem"
import { CompareDrawer } from "@/components/bridge/CompareDrawer"
import { ContactInvestorModal } from "@/components/bridge/ContactInvestorModal"
import { EmptyState } from "@/components/bridge/EmptyState"
import { ErrorState } from "@/components/bridge/ErrorState"
import { LoadingSkeleton } from "@/components/bridge/LoadingSkeleton"

// Mock data
const mockInvestors = [
  {
    id: "1",
    name: "GreenTech Ventures",
    logo: "/placeholder.svg?height=48&width=48",
    aum: "$500M",
    stages: ["Series A", "Series B"],
    ticketSize: "$5M - $25M",
    geoFocus: ["North America", "Europe"],
    themes: ["Clean Energy", "Climate Tech", "Circular Economy"],
    description: "Leading climate tech investor focused on scalable solutions for decarbonization and sustainability.",
    matchScore: 92,
    matchBreakdown: {
      themes: 95,
      sector: 90,
      stage: 85,
      geography: 95,
      climateTargets: 90,
    },
    website: "https://greentechventures.com",
    contact: "partners@greentechventures.com",
  },
  {
    id: "2",
    name: "Impact Capital Partners",
    logo: "/placeholder.svg?height=48&width=48",
    aum: "$1.2B",
    stages: ["Growth", "Late Stage"],
    ticketSize: "$10M - $50M",
    geoFocus: ["Global"],
    themes: ["Social Impact", "ESG", "Sustainable Agriculture"],
    description: "Global impact investor committed to generating positive social and environmental outcomes.",
    matchScore: 87,
    matchBreakdown: {
      themes: 85,
      sector: 90,
      stage: 80,
      geography: 95,
      climateTargets: 85,
    },
    website: "https://impactcapital.com",
    contact: "deals@impactcapital.com",
  },
  {
    id: "3",
    name: "Blue Ocean Fund",
    logo: "/placeholder.svg?height=48&width=48",
    aum: "$300M",
    stages: ["Seed", "Series A"],
    ticketSize: "$1M - $10M",
    geoFocus: ["Europe", "Asia"],
    themes: ["Ocean Tech", "Blue Economy", "Marine Conservation"],
    description: "Specialized fund investing in ocean-positive technologies and sustainable marine solutions.",
    matchScore: 78,
    matchBreakdown: {
      themes: 75,
      sector: 80,
      stage: 85,
      geography: 75,
      climateTargets: 80,
    },
    website: "https://blueoceanfund.com",
    contact: "investments@blueoceanfund.com",
  },
  {
    id: "4",
    name: "Carbon Neutral Ventures",
    logo: "/placeholder.svg?height=48&width=48",
    aum: "$800M",
    stages: ["Series B", "Growth"],
    ticketSize: "$15M - $40M",
    geoFocus: ["North America"],
    themes: ["Carbon Removal", "Net Zero", "Climate Solutions"],
    description: "Dedicated to funding breakthrough technologies that accelerate the path to net-zero emissions.",
    matchScore: 85,
    matchBreakdown: {
      themes: 90,
      sector: 85,
      stage: 80,
      geography: 85,
      climateTargets: 95,
    },
    website: "https://carbonneutralvc.com",
    contact: "team@carbonneutralvc.com",
  },
  {
    id: "5",
    name: "Sustainable Future Fund",
    logo: "/placeholder.svg?height=48&width=48",
    aum: "$2.1B",
    stages: ["Growth", "Late Stage", "Public"],
    ticketSize: "$25M - $100M",
    geoFocus: ["Global"],
    themes: ["Renewable Energy", "Energy Storage", "Smart Grid"],
    description: "Large-scale investor in renewable energy infrastructure and next-generation energy technologies.",
    matchScore: 91,
    matchBreakdown: {
      themes: 95,
      sector: 90,
      stage: 85,
      geography: 90,
      climateTargets: 95,
    },
    website: "https://sustainablefuture.fund",
    contact: "partnerships@sustainablefuture.fund",
  },
  {
    id: "6",
    name: "Circular Economy Partners",
    logo: "/placeholder.svg?height=48&width=48",
    aum: "$450M",
    stages: ["Series A", "Series B", "Growth"],
    ticketSize: "$5M - $30M",
    geoFocus: ["Europe", "North America"],
    themes: ["Circular Economy", "Waste Reduction", "Resource Efficiency"],
    description:
      "Focused on companies that are transforming linear business models into circular, regenerative systems.",
    matchScore: 83,
    matchBreakdown: {
      themes: 85,
      sector: 85,
      stage: 80,
      geography: 85,
      climateTargets: 80,
    },
    website: "https://circularpartners.com",
    contact: "hello@circularpartners.com",
  },
]

const mockFilterOptions = {
  themes: [
    "Clean Energy",
    "Climate Tech",
    "Circular Economy",
    "Social Impact",
    "ESG",
    "Sustainable Agriculture",
    "Ocean Tech",
    "Blue Economy",
    "Marine Conservation",
    "Carbon Removal",
    "Net Zero",
    "Climate Solutions",
    "Renewable Energy",
    "Energy Storage",
    "Smart Grid",
    "Waste Reduction",
    "Resource Efficiency",
  ],
  sectors: [
    "Energy",
    "Technology",
    "Healthcare",
    "Agriculture",
    "Manufacturing",
    "Transportation",
    "Real Estate",
    "Financial Services",
    "Consumer Goods",
  ],
  stages: ["Pre-Seed", "Seed", "Series A", "Series B", "Series C", "Growth", "Late Stage", "Public"],
  regions: ["North America", "Europe", "Asia", "Latin America", "Africa", "Oceania", "Global"],
}

const mockSavedLists = [
  { id: "1", name: "Climate Tech Investors", count: 12 },
  { id: "2", name: "Series A Prospects", count: 8 },
  { id: "3", name: "European Funds", count: 15 },
]

export default function InvestorsPage() {
  // State management
  const [filters, setFilters] = useState({
    themes: [] as string[],
    sectors: [] as string[],
    stages: [] as string[],
    ticketSizeMin: 0,
    ticketSizeMax: 100,
    regions: [] as string[],
    climateTargets: [] as string[],
    esgPreferences: [] as string[],
  })

  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("match-score")
  const [viewMode, setViewMode] = useState<"card" | "list">("card")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Comparison state
  const [compareList, setCompareList] = useState<string[]>([])
  const [isCompareOpen, setIsCompareOpen] = useState(false)

  // Contact modal state
  const [contactModal, setContactModal] = useState<{
    isOpen: boolean
    investor: (typeof mockInvestors)[0] | null
  }>({ isOpen: false, investor: null })

  // Filter and search logic
  const filteredInvestors = useMemo(() => {
    let result = mockInvestors

    // Apply search
    if (searchQuery) {
      result = result.filter(
        (investor) =>
          investor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          investor.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          investor.themes.some((theme) => theme.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // Apply filters
    if (filters.themes.length > 0) {
      result = result.filter((investor) => investor.themes.some((theme) => filters.themes.includes(theme)))
    }

    if (filters.stages.length > 0) {
      result = result.filter((investor) => investor.stages.some((stage) => filters.stages.includes(stage)))
    }

    if (filters.regions.length > 0) {
      result = result.filter((investor) => investor.geoFocus.some((region) => filters.regions.includes(region)))
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "match-score":
          return b.matchScore - a.matchScore
        case "name":
          return a.name.localeCompare(b.name)
        case "aum":
          return b.aum.localeCompare(a.aum)
        default:
          return 0
      }
    })

    return result
  }, [mockInvestors, searchQuery, filters, sortBy])

  // Pagination
  const itemsPerPage = 12
  const totalPages = Math.ceil(filteredInvestors.length / itemsPerPage)
  const paginatedInvestors = filteredInvestors.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Handlers
  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setFilters({
      themes: [],
      sectors: [],
      stages: [],
      ticketSizeMin: 0,
      ticketSizeMax: 100,
      regions: [],
      climateTargets: [],
      esgPreferences: [],
    })
    setSearchQuery("")
    setCurrentPage(1)
  }

  const handleCompareToggle = (investorId: string) => {
    setCompareList((prev) => {
      if (prev.includes(investorId)) {
        return prev.filter((id) => id !== investorId)
      } else if (prev.length < 3) {
        return [...prev, investorId]
      }
      return prev
    })
  }

  const handleContactInvestor = (investor: (typeof mockInvestors)[0]) => {
    setContactModal({ isOpen: true, investor })
  }

  const handleSaveToList = (investorId: string, listId: string) => {
    console.log("Save investor", investorId, "to list", listId)
  }

  const handleCreateList = (name: string, investorIds: string[]) => {
    console.log("Create new list", name, "with investors", investorIds)
  }

  const handleSendContact = (data: any) => {
    console.log("Send contact:", data)
    setContactModal({ isOpen: false, investor: null })
  }

  // Render content based on state
  const renderContent = () => {
    if (isLoading) {
      return <LoadingSkeleton />
    }

    if (error) {
      return (
        <ErrorState
          message={error}
          onRetry={() => {
            setError(null)
            setIsLoading(true)
            // Simulate retry
            setTimeout(() => setIsLoading(false), 1000)
          }}
        />
      )
    }

    if (filteredInvestors.length === 0) {
      return (
        <EmptyState
          onClearFilters={handleClearFilters}
          hasActiveFilters={
            filters.themes.length > 0 ||
            filters.sectors.length > 0 ||
            filters.stages.length > 0 ||
            filters.regions.length > 0 ||
            searchQuery.length > 0
          }
        />
      )
    }

    return (
      <div className="space-y-6">
        {/* Results grid/list */}
        {viewMode === "card" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedInvestors.map((investor) => (
              <InvestorCard
                key={investor.id}
                investor={investor}
                isComparing={compareList.includes(investor.id)}
                onCompareToggle={() => handleCompareToggle(investor.id)}
                onContact={() => handleContactInvestor(investor)}
                onSaveToList={(listId) => handleSaveToList(investor.id, listId)}
                savedLists={mockSavedLists}
                onCreateList={(name) => handleCreateList(name, [investor.id])}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedInvestors.map((investor) => (
              <InvestorListItem
                key={investor.id}
                investor={investor}
                isComparing={compareList.includes(investor.id)}
                onCompareToggle={() => handleCompareToggle(investor.id)}
                onContact={() => handleContactInvestor(investor)}
                onSaveToList={(listId) => handleSaveToList(investor.id, listId)}
                savedLists={mockSavedLists}
                onCreateList={(name) => handleCreateList(name, [investor.id])}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 pt-8">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <BridgeShell
        title="Bridge – Investor Matching"
        subtitle="Connect with ESG-focused investors aligned with your impact goals and growth stage"
        filtersSlot={
          <FiltersPanel
            filters={filters}
            onFiltersChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            filterOptions={mockFilterOptions}
          />
        }
        resultsSlot={
          <div className="space-y-6">
            <InvestorToolbar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              resultsCount={filteredInvestors.length}
              compareCount={compareList.length}
              onCompareOpen={() => setIsCompareOpen(true)}
            />
            {renderContent()}
          </div>
        }
      />

      {/* Compare Drawer */}
      <CompareDrawer
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        investors={mockInvestors.filter((inv) => compareList.includes(inv.id))}
        onRemoveFromCompare={handleCompareToggle}
        onContact={handleContactInvestor}
      />

      {/* Contact Modal */}
      <ContactInvestorModal
        isOpen={contactModal.isOpen}
        onClose={() => setContactModal({ isOpen: false, investor: null })}
        investor={contactModal.investor}
        onSend={handleSendContact}
      />
    </>
  )
}
