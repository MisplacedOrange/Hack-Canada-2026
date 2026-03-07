import Link from "next/link"

import FooterSection from "@/components/footer-section"
import { Header } from "@/components/header"

const highlights = [
  {
    title: "AI-Powered Opportunity Matching",
    description:
      "Personalized recommendations based on student interests, skills, availability, and location.",
    href: "/features/ai-matching",
  },
  {
    title: "Automated Volunteer Discovery",
    description: "Scraping and extraction pipeline discovers opportunities without requiring organizations to sign up.",
    href: "/features/automated-discovery",
  },
  {
    title: "Geographic Opportunity Locator",
    description: "Interactive local map with cause indicators, distance context, and urgency signals.",
    href: "/features/local-impact-map",
  },
  {
    title: "Smart Search & Filters",
    description: "Search by cause, distance, skills, and availability with relevance-aware ranking.",
    href: "/features/smart-search",
  },
]

const expandedFeatures = [
  "Volunteer opportunity details page with clear event and organization context",
  "Student dashboard for completed and upcoming volunteer activity",
  "Organization posting workflow for businesses and nonprofits",
  "Real-time opportunity updates from backend + scheduled discovery",
  "Location-aware recommendations with distance prioritization",
]

const futureIdeas = [
  "Volunteer grouping for friends and school clubs",
  "Community need heatmap for urgent local volunteer shortages",
  "AI volunteer personality test for better cause alignment",
  "Resume builder for turning volunteer work into impact-ready bullet points",
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f7f5f3] text-[#37322f]">
      <Header />

      <section className="relative overflow-hidden border-b border-[#e0dedb] bg-[radial-gradient(1000px_420px_at_50%_-50%,#d4a85355,transparent),linear-gradient(180deg,#1f1915_0%,#2b2420_55%,#3a312d_100%)] text-[#f7f5f3]">
        <div className="mx-auto max-w-[1060px] px-4 pb-20 pt-28 md:pb-24 md:pt-32">
          <p className="text-xs uppercase tracking-[0.24em] text-[#d7c2a2]">Hack Canada 2026 Project</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight md:text-5xl">Summit - Volunteer Opportunity Platform</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[#eadfd2] md:text-base">
            Summit connects students with meaningful local volunteer opportunities through AI matching, automated
            opportunity discovery, and map-based exploration.
          </p>

          <div className="mt-8 grid gap-3 md:grid-cols-2">
            <a
              href="https://github.com/nix-life/Hack-Canada-2026"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-[#d7c2a255] bg-[#f7f5f31a] p-4 text-sm transition hover:bg-[#f7f5f333]"
            >
              <p className="font-semibold">GitHub Repository</p>
              <p className="mt-1 break-all text-[#eadfd2]">https://github.com/nix-life/Hack-Canada-2026</p>
            </a>
            <a
              href="https://github.com/nix-life/Hack-Canada-2026"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-[#d7c2a255] bg-[#f7f5f31a] p-4 text-sm transition hover:bg-[#f7f5f333]"
            >
              <p className="font-semibold">Devpost Invite Link</p>
              <p className="mt-1 break-all text-[#eadfd2]">https://github.com/nix-life/Hack-Canada-2026</p>
            </a>
          </div>
        </div>
      </section>

      <section className="border-y border-[#e0dedb] bg-white/70">
        <div className="mx-auto grid max-w-[1060px] gap-4 px-4 py-10 md:grid-cols-3">
          <div className="rounded-lg border border-[#e0dedb] bg-white p-6">
            <h2 className="text-xl font-semibold">Problem</h2>
            <p className="mt-3 text-sm leading-6 text-[#605a57]">
              Students need volunteer hours but struggle to find opportunities that are engaging and relevant.
              Meanwhile, many organizations with real volunteer needs are difficult to discover.
            </p>
          </div>
          <div className="rounded-lg border border-[#e0dedb] bg-white p-6">
            <h2 className="text-xl font-semibold">Solution</h2>
            <p className="mt-3 text-sm leading-6 text-[#605a57]">
              Summit makes volunteer search fast and meaningful using recommendation logic, automated discovery, and
              location-aware browsing.
            </p>
          </div>
          <div className="rounded-lg border border-[#e0dedb] bg-white p-6">
            <h2 className="text-xl font-semibold">Main Idea</h2>
            <p className="mt-3 text-sm leading-6 text-[#605a57]">
              A platform where students can find high-impact local opportunities aligned with their interests while
              organizations receive reliable volunteer support.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1060px] px-4 py-14">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-3xl font-semibold tracking-tight">Core Features</h2>
          <Link href="/features" className="text-sm font-medium text-[#605a57] hover:text-[#37322f]">
            View all feature pages
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {highlights.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-lg border border-[#e0dedb] bg-white p-5 transition hover:shadow-sm">
              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-[#605a57]">{item.description}</p>
            </Link>
          ))}
        </div>

        <div className="mt-4 rounded-lg border border-[#e0dedb] bg-white p-6">
          <h3 className="text-lg font-semibold">Additional Platform Features</h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#605a57]">
            {expandedFeatures.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-[#e0dedb] bg-white/70">
        <div className="mx-auto grid max-w-[1060px] gap-4 px-4 py-10 md:grid-cols-2">
          <div className="rounded-lg border border-[#e0dedb] bg-white p-6">
            <h2 className="text-xl font-semibold">Potential Tracks</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#605a57]">
              <li>Vultr (Deployment)</li>
              <li>Auth0 (Log-in)</li>
              <li>Gemini API (improved extraction and classification)</li>
              <li>Google Antigravity (optional for development workflow)</li>
            </ul>
          </div>
          <div className="rounded-lg border border-[#e0dedb] bg-white p-6">
            <h2 className="text-xl font-semibold">Tech Stack</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#605a57]">
              <li>Frontend: Next.js + React + TypeScript</li>
              <li>Backend: Python FastAPI</li>
              <li>Data Layer: Local JSON/CSV now, MongoDB planned</li>
              <li>Scraping: BeautifulSoup + httpx (+ Playwright tooling in pipeline)</li>
              <li>Deployment: Vultr</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1060px] px-4 py-14">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-[#e0dedb] bg-white p-6">
            <h2 className="text-xl font-semibold">Ways to Improve</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#605a57]">
              <li>Upgrade semantic matching with stronger ranking and vector-based scoring</li>
              <li>Expand automatic opportunity discovery sources</li>
              <li>Improve real-time data freshness and classification quality</li>
              <li>Add full Auth0-based role-aware login flows</li>
              <li>Complete production database integration</li>
            </ul>
          </div>

          <div className="rounded-lg border border-[#e0dedb] bg-white p-6">
            <h2 className="text-xl font-semibold">Future Feature Ideas</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#605a57]">
              {futureIdeas.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-[#e0dedb] bg-white p-6">
          <h2 className="text-xl font-semibold">Technical Details</h2>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[#7b736d]">Current Backend APIs</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#605a57]">
                <li>GET /api/volunteer-organizations for opportunity discovery</li>
                <li>POST /api/recommendations for profile-based matching</li>
                <li>Heuristic scoring for cause, skills, location, urgency, and query relevance</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[#7b736d]">Opportunity Data Fields</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[#605a57]">
                <li>Title, description, organization, and opportunity URL</li>
                <li>Cause category and inferred skills</li>
                <li>Location, schedule, volunteers needed, urgency, and map coordinates</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <FooterSection />
    </main>
  )
}
