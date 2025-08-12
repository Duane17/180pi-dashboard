"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"
import { Users2, Gauge } from "lucide-react"

interface HeroProps {
  onPrimary?: () => void
  onUploadDataHref?: string
  onUploadEvidenceHref?: string
}

export function Hero({
  onPrimary,
  onUploadDataHref = "/upload/data",
  onUploadEvidenceHref = "/upload/evidence",
}: HeroProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/15 via-white/10 to-white/5 p-8 backdrop-blur-sm border border-white/20 mb-12">
      <div className="relative z-10 text-center">
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <Image
            src="/logo.svg"
            alt="180Pi Logo"
            width={160}
            height={48}
            priority
            className="h-auto w-auto max-w-[200px]"
          />
        </div>

        {/* Heading — slightly smaller to give logo priority */}
        <h1 className="mb-6 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] bg-clip-text text-transparent">
          Your sustainability performance at a glance
        </h1>

        {/* Two value cards */}
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 text-left">
          {/* Card 1 */}
          <div
            className="rounded-xl border border-white/30 bg-white/15 backdrop-blur-md p-5 shadow-[0_6px_28px_rgba(50,112,161,0.12)] transition-transform duration-200 hover:scale-[1.01] focus-within:ring-2 focus-within:ring-[#3270a1]/30"
            role="group"
            aria-label="Platform value: SMEs and investors"
          >
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#8dcddb] via-[#3270a1] to-[#7e509c]">
              <Users2 className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <p className="text-base leading-relaxed text-[#4a4a4a]">
              180Pi makes sustainability reporting simple enough for small businesses, powerful enough for investors,
              and intelligent enough to uncover opportunities.
            </p>
          </div>

          {/* Card 2 */}
          <div
            className="rounded-xl border border-white/30 bg-white/15 backdrop-blur-md p-5 shadow-[0_6px_28px_rgba(126,80,156,0.10)] transition-transform duration-200 hover:scale-[1.01] focus-within:ring-2 focus-within:ring-[#3270a1]/30"
            role="group"
            aria-label="Platform value: Data to action"
          >
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#8dcddb] via-[#3270a1] to-[#7e509c]">
              <Gauge className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <p className="text-base leading-relaxed text-[#4a4a4a]">
              From automated ESG data collection to real-time performance insights, we help you see your true impact,
              improve it, and connect with investors who value both returns and responsibility.
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
          {onPrimary ? (
            <Button
              onClick={onPrimary}
              className="bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] text-white hover:opacity-90 transition-opacity duration-200 px-8 py-3 text-lg font-medium rounded-md"
            >
              Go to Dashboard
            </Button>
          ) : (
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] text-white hover:opacity-90 transition-opacity duration-200 px-8 py-3 text-lg font-medium rounded-md">
                Go to Dashboard
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Decorative subtle blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[radial-gradient(closest-side,#8dcddb_0%,transparent_70%)] opacity-50"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-[radial-gradient(closest-side,#7e509c_0%,transparent_70%)] opacity-40"
      />
    </section>
  )
}
