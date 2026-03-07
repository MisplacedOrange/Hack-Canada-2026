import Link from "next/link"

import FooterSection from "@/components/footer-section"
import { Header } from "@/components/header"

const highlights = [
  "AI-powered opportunity matching",
  "Automated volunteer discovery",
  "Local impact map and distance-aware search",
  "Fast filtering for meaningful opportunities",
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f5f3] text-[#37322f]">
      <Header />

      {/* MNTN-style Hero Section */}
      <section
        className="relative min-h-screen bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=80')",
        }}
      >
        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Content positioned bottom-left */}
        <div className="relative z-10 flex min-h-screen flex-col justify-end px-8 pb-24 md:px-16 lg:px-24">
          {/* Subtitle with decorative line */}
          <div className="flex items-center gap-4">
            <span className="h-[2px] w-12 bg-[#D4A853]" />
            <p
              className="text-sm uppercase tracking-widest"
              style={{ color: "#D4A853" }}
            >
              Summit Volunteer Platform
            </p>
          </div>

          {/* Main headline */}
          <h1
            className="mt-6 max-w-3xl text-4xl leading-tight text-white md:text-5xl lg:text-6xl"
            style={{
              fontFamily: "'Times New Roman', Times, serif",
              fontStyle: "italic",
            }}
          >
            Find Meaningful Volunteer
            <br />
            Opportunities Near You
          </h1>
        </div>
      </section>

      <section className="border-y border-[#e0dedb] bg-white/70">
        <div className="mx-auto grid max-w-[1060px] gap-4 px-4 py-10 md:grid-cols-2">
          <div className="rounded-lg border border-[#e0dedb] bg-white p-6">
            <h2 className="text-xl font-semibold">Problem</h2>
            <p className="mt-3 text-sm leading-6 text-[#605a57]">
              Students need volunteer hours but struggle to find opportunities that are relevant and interesting.
              At the same time, local organizations need volunteer support but are hard to discover.
            </p>
          </div>
          <div className="rounded-lg border border-[#e0dedb] bg-white p-6">
            <h2 className="text-xl font-semibold">Solution</h2>
            <p className="mt-3 text-sm leading-6 text-[#605a57]">
              Summit centralizes opportunity discovery with AI recommendations, automated scraping, and map-based local
              search so students can complete impactful hours faster.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1060px] px-4 py-14">
        <h2 className="text-3xl font-semibold tracking-tight">Core Highlights</h2>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {highlights.map((item) => (
            <div key={item} className="rounded-lg border border-[#e0dedb] bg-white p-5">
              <p className="text-sm font-medium text-[#605a57]">{item}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-md bg-[#37322f] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#2d2825]"
          >
            Open Dashboard
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-[#d1ceca] bg-white px-5 py-2 text-sm font-medium text-[#37322f] transition hover:bg-[#f4f2ef]"
          >
            Go to Login
          </Link>
        </div>
      </section>

      <section className="border-t border-[#e0dedb] bg-white/70">
        <div className="mx-auto grid max-w-[1060px] gap-4 px-4 py-10 md:grid-cols-2">
          <div className="rounded-lg border border-[#e0dedb] bg-white p-6">
            <h2 className="text-xl font-semibold">Potential Tracks</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#605a57]">
              <li>Vultr (Deployment)</li>
              <li>Auth0 (Log-in)</li>
              <li>Gemini API (scraping + extraction accuracy)</li>
              <li>Google Antigravity (optional build tooling)</li>
            </ul>
          </div>
          <div className="rounded-lg border border-[#e0dedb] bg-white p-6">
            <h2 className="text-xl font-semibold">Tech Stack</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#605a57]">
              <li>Frontend: React + TypeScript (template-based Next.js site)</li>
              <li>Backend: Python (FastAPI / Django / Flask)</li>
              <li>Database: MongoDB</li>
              <li>Scraping: BeautifulSoup + AI extraction pipeline</li>
              <li>Deployment: Vultr</li>
            </ul>
          </div>
        </div>
      </section>

      <FooterSection />
    </main>
  )
}
