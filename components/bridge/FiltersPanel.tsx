"use client"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Filter, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { FilterGroup } from "./FilterGroup"
import { FilterChips } from "./FilterChips"

interface FilterOptions {
  themes: string[]
  sectors: string[]
  stages: string[]
  geos: string[]
  esgPrefs: string[]
  targets: string[]
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

interface FilterChip {
  key: string
  label: string
}

interface FiltersPanelProps {
  values: FilterValues
  onChange: (values: FilterValues) => void
  options: FilterOptions
  onApply: () => void
  onClear: () => void
  chips: FilterChip[]
  onRemoveChip: (key: string) => void
  onClearAllChips: () => void
  className?: string
}

export function FiltersPanel({
  values,
  onChange,
  options,
  onApply,
  onClear,
  chips,
  onRemoveChip,
  onClearAllChips,
  className,
}: FiltersPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleMultiSelectChange = (field: keyof FilterValues, value: string, checked: boolean) => {
    const currentValues = values[field] as string[]
    const newValues = checked ? [...currentValues, value] : currentValues.filter((v) => v !== value)

    onChange({ ...values, [field]: newValues })
  }

  const handleTicketRangeChange = (newValues: number[]) => {
    onChange({
      ...values,
      ticketMin: newValues[0],
      ticketMax: newValues[1],
    })
  }

  const filteredSectors = options.sectors.filter((sector) =>
    sector.toLowerCase().includes(values.sectorSearch.toLowerCase()),
  )

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Active Filters */}
      <FilterChips chips={chips} onRemove={onRemoveChip} onClearAll={onClearAllChips} />

      {/* Impact Themes / SDGs */}
      <FilterGroup
        title="Impact Themes / SDGs"
        helper="Select the sustainability themes that align with your business goals"
      >
        <div className="grid grid-cols-1 gap-2">
          {options.themes.map((theme) => (
            <div key={theme} className="flex items-center space-x-2">
              <Checkbox
                id={`theme-${theme}`}
                checked={values.themes.includes(theme)}
                onCheckedChange={(checked) => handleMultiSelectChange("themes", theme, checked as boolean)}
              />
              <Label htmlFor={`theme-${theme}`} className="text-sm text-gray-700">
                {theme}
              </Label>
            </div>
          ))}
        </div>
      </FilterGroup>

      {/* Sectors / NACE */}
      <FilterGroup title="Sectors / NACE" helper="Filter by industry sectors using NACE classification">
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search sectors..."
              value={values.sectorSearch}
              onChange={(e) => onChange({ ...values, sectorSearch: e.target.value })}
              className="pl-10"
            />
          </div>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {filteredSectors.map((sector) => (
              <div key={sector} className="flex items-center space-x-2">
                <Checkbox
                  id={`sector-${sector}`}
                  checked={values.sectors.includes(sector)}
                  onCheckedChange={(checked) => handleMultiSelectChange("sectors", sector, checked as boolean)}
                />
                <Label htmlFor={`sector-${sector}`} className="text-sm text-gray-700">
                  {sector}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </FilterGroup>

      {/* Investment Stages */}
      <FilterGroup title="Investment Stages" helper="Select the funding stages you're interested in">
        <div className="grid grid-cols-1 gap-2">
          {options.stages.map((stage) => (
            <div key={stage} className="flex items-center space-x-2">
              <Checkbox
                id={`stage-${stage}`}
                checked={values.stages.includes(stage)}
                onCheckedChange={(checked) => handleMultiSelectChange("stages", stage, checked as boolean)}
              />
              <Label htmlFor={`stage-${stage}`} className="text-sm text-gray-700">
                {stage}
              </Label>
            </div>
          ))}
        </div>
      </FilterGroup>

      {/* Ticket Size Range */}
      <FilterGroup title="Ticket Size Range" helper="Set your preferred investment amount range">
        <div className="space-y-4">
          <Slider
            value={[values.ticketMin, values.ticketMax]}
            onValueChange={handleTicketRangeChange}
            max={10000000}
            min={10000}
            step={10000}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>${values.ticketMin.toLocaleString()}</span>
            <span>${values.ticketMax.toLocaleString()}</span>
          </div>
        </div>
      </FilterGroup>

      {/* Geography */}
      <FilterGroup title="Geography" helper="Select regions or countries of interest">
        <div className="grid grid-cols-1 gap-2">
          {options.geos.map((geo) => (
            <div key={geo} className="flex items-center space-x-2">
              <Checkbox
                id={`geo-${geo}`}
                checked={values.geos.includes(geo)}
                onCheckedChange={(checked) => handleMultiSelectChange("geos", geo, checked as boolean)}
              />
              <Label htmlFor={`geo-${geo}`} className="text-sm text-gray-700">
                {geo}
              </Label>
            </div>
          ))}
        </div>
      </FilterGroup>

      {/* Climate Targets */}
      <FilterGroup title="Climate Targets" helper="Filter by specific climate commitments and targets">
        <div className="grid grid-cols-1 gap-2">
          {options.targets.map((target) => (
            <div key={target} className="flex items-center space-x-2">
              <Checkbox
                id={`target-${target}`}
                checked={values.targets.includes(target)}
                onCheckedChange={(checked) => handleMultiSelectChange("targets", target, checked as boolean)}
              />
              <Label htmlFor={`target-${target}`} className="text-sm text-gray-700">
                {target}
              </Label>
            </div>
          ))}
        </div>
      </FilterGroup>

      {/* ESG Preferences */}
      <FilterGroup title="ESG Preferences" helper="Specify your ESG investment preferences and exclusions">
        <div className="grid grid-cols-1 gap-2">
          {options.esgPrefs.map((pref) => (
            <div key={pref} className="flex items-center space-x-2">
              <Checkbox
                id={`esg-${pref}`}
                checked={values.esgPrefs.includes(pref)}
                onCheckedChange={(checked) => handleMultiSelectChange("esgPrefs", pref, checked as boolean)}
              />
              <Label htmlFor={`esg-${pref}`} className="text-sm text-gray-700">
                {pref}
              </Label>
            </div>
          ))}
        </div>
      </FilterGroup>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-100">
        <Button onClick={onClear} variant="outline" className="flex-1 bg-transparent">
          Clear All
        </Button>
        <Button
          onClick={onApply}
          className="flex-1 bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] text-white hover:shadow-lg hover:shadow-[#3270a1]/25 transition-all duration-200"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Filters Panel */}
      <div className={cn("hidden lg:block", className)}>
        <div className="sticky top-8 rounded-2xl border border-gray-100 bg-white/60 backdrop-blur-sm p-6 shadow-lg shadow-[#3270a1]/5">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          <FiltersContent />
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <div className="lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full bg-white/60 backdrop-blur-sm border-gray-200">
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {chips.length > 0 && (
                <span className="ml-2 rounded-full bg-gradient-to-r from-[#8dcddb] to-[#7e509c] px-2 py-0.5 text-xs text-white">
                  {chips.length}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 overflow-y-auto">
              <FiltersContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
