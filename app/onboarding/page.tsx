"use client"
import { useState } from "react"
import { CompanyWizardShell } from "@/components/onboarding/CompanyWizardShell"
import { StepIndicator } from "@/components/onboarding/StepIndicator"
import { StepBasics } from "@/components/onboarding/StepBasics"
import { StepLocation } from "@/components/onboarding/StepLocation"
import { StepSizeFinances } from "@/components/onboarding/StepSizeFinances"
import { StepReview } from "@/components/onboarding/StepReview"
import { NavigationButtons } from "@/components/onboarding/NavigationButtons"

interface BasicsData {
  companyName: string
  legalForm: string
  sector: string
}

interface SiteLocation {
  id: string
  country: string
  city: string
  description: string
}

interface LocationData {
  headquartersCountry: string
  siteLocations: SiteLocation[]
}

interface SizeFinancesData {
  employeeCount: string
  annualTurnover: string
  currency: string
}

interface FormData {
  basics: BasicsData
  location: LocationData
  sizeFinances: SizeFinancesData
}

interface FormErrors {
  basics?: Partial<Record<keyof BasicsData, string>>
  location?: Partial<Record<keyof LocationData, string>>
  sizeFinances?: Partial<Record<keyof SizeFinancesData, string>>
}

const steps = [
  {
    id: 1,
    title: "Company Basics",
    description: "Name, legal form, and sector",
  },
  {
    id: 2,
    title: "Locations",
    description: "Headquarters and site locations",
  },
  {
    id: 3,
    title: "Size & Finances",
    description: "Employee count and turnover",
  },
  {
    id: 4,
    title: "Review",
    description: "Confirm your information",
  },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    basics: {
      companyName: "",
      legalForm: "",
      sector: "",
    },
    location: {
      headquartersCountry: "",
      siteLocations: [],
    },
    sizeFinances: {
      employeeCount: "",
      annualTurnover: "",
      currency: "",
    },
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = { ...errors }

    switch (step) {
      case 1:
        newErrors.basics = {}
        if (!formData.basics.companyName.trim()) {
          newErrors.basics.companyName = "Company name is required"
        }
        if (!formData.basics.legalForm) {
          newErrors.basics.legalForm = "Legal form is required"
        }
        if (!formData.basics.sector) {
          newErrors.basics.sector = "Primary sector is required"
        }
        break

      case 2:
        newErrors.location = {}
        if (!formData.location.headquartersCountry) {
          newErrors.location.headquartersCountry = "Headquarters country is required"
        }
        break

      case 3:
        newErrors.sizeFinances = {}
        if (!formData.sizeFinances.employeeCount) {
          newErrors.sizeFinances.employeeCount = "Employee count is required"
        }
        if (!formData.sizeFinances.currency) {
          newErrors.sizeFinances.currency = "Currency is required"
        }
        if (!formData.sizeFinances.annualTurnover.trim()) {
          newErrors.sizeFinances.annualTurnover = "Annual turnover is required"
        }
        break
    }

    setErrors(newErrors)

    // Check if current step has any errors
    const stepKey = step === 1 ? "basics" : step === 2 ? "location" : "sizeFinances"
    const stepErrors = newErrors[stepKey]
    return !stepErrors || Object.keys(stepErrors).length === 0
  }

  const canProceed = (): boolean => {
    if (currentStep === 4) return true // Review step

    // Check validation without updating state
    switch (currentStep) {
      case 1:
        return !!(formData.basics.companyName.trim() && formData.basics.legalForm && formData.basics.sector)
      case 2:
        return !!formData.location.headquartersCountry
      case 3:
        return !!(
          formData.sizeFinances.employeeCount &&
          formData.sizeFinances.currency &&
          formData.sizeFinances.annualTurnover.trim()
        )
      default:
        return false
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length))
    }
  }

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleStepClick = (step: number) => {
    // Allow navigation to completed steps or current step
    if (step <= currentStep) {
      setCurrentStep(step)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return // Validate all required fields

    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Here you would typically send the data to your backend
      console.log("Submitting form data:", formData)

      // Redirect to dashboard or success page
      // router.push('/dashboard')
      alert("Onboarding completed successfully! Welcome to 180Pi.")
    } catch (error) {
      console.error("Submission error:", error)
      alert("There was an error submitting your information. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateBasics = (data: BasicsData) => {
    setFormData((prev) => ({ ...prev, basics: data }))
    // Clear errors for this step
    setErrors((prev) => ({ ...prev, basics: {} }))
  }

  const updateLocation = (data: LocationData) => {
    setFormData((prev) => ({ ...prev, location: data }))
    // Clear errors for this step
    setErrors((prev) => ({ ...prev, location: {} }))
  }

  const updateSizeFinances = (data: SizeFinancesData) => {
    setFormData((prev) => ({ ...prev, sizeFinances: data }))
    // Clear errors for this step
    setErrors((prev) => ({ ...prev, sizeFinances: {} }))
  }

  const getStepTitle = () => {
    const step = steps.find((s) => s.id === currentStep)
    return step?.title || "Company Onboarding"
  }

  const getStepSubtitle = () => {
    const step = steps.find((s) => s.id === currentStep)
    return step?.description
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <StepBasics data={formData.basics} onChange={updateBasics} errors={errors.basics} />
      case 2:
        return <StepLocation data={formData.location} onChange={updateLocation} errors={errors.location} />
      case 3:
        return (
          <StepSizeFinances data={formData.sizeFinances} onChange={updateSizeFinances} errors={errors.sizeFinances} />
        )
      case 4:
        return <StepReview data={formData} onEdit={setCurrentStep} isSubmitting={isSubmitting} />
      default:
        return null
    }
  }

  return (
    <CompanyWizardShell
      currentStep={currentStep}
      totalSteps={steps.length}
      title={getStepTitle()}
      subtitle={getStepSubtitle()}
    >
      <StepIndicator steps={steps} currentStep={currentStep} onStepClick={handleStepClick} />

      {renderCurrentStep()}

      <NavigationButtons
        onBack={handleBack}
        onNext={handleNext}
        onSubmit={handleSubmit}
        isFirstStep={currentStep === 1}
        isLastStep={currentStep === steps.length}
        isLoading={isSubmitting}
        canProceed={canProceed()}
      />
    </CompanyWizardShell>
  )
}
