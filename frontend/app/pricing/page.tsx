"use client"

import Link from "next/link"
import { Header } from "@/components/header"

const PLANS = [
  {
    name: "Starter Spotlight",
    price: "$149",
    cadence: "/month",
    description: "Best for local nonprofits and small businesses testing community outreach.",
    accent: "border-[#3f648c]",
    perks: [
      "Up to 2 promoted opportunities",
      "Local map boost in one city",
      "Basic analytics dashboard",
      "Email support",
    ],
  },
  {
    name: "Growth Reach",
    price: "$399",
    cadence: "/month",
    description: "Ideal for organizations running recurring campaigns across multiple causes.",
    accent: "border-[#4c9eff]",
    featured: true,
    perks: [
      "Up to 8 promoted opportunities",
      "Priority map placement",
      "Advanced targeting by cause and radius",
      "Performance insights + weekly report",
    ],
  },
  {
    name: "Enterprise Impact",
    price: "Custom",
    cadence: "pricing",
    description: "For city-wide or national campaigns that need custom placement and strategy.",
    accent: "border-[#4b6f95]",
    perks: [
      "Unlimited sponsored opportunities",
      "Multi-region campaign management",
      "Dedicated success partner",
      "Custom integrations and SLA",
    ],
  },
]

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_12%_8%,rgba(26,124,235,0.2),transparent_34%),radial-gradient(circle_at_88%_78%,rgba(0,205,178,0.14),transparent_32%),linear-gradient(180deg,#07162a_0%,#081b33_45%,#061120_100%)] text-[#d9ebff]">
      <Header />

      <section className="mx-auto w-full max-w-[1280px] px-4 pb-20 pt-28 md:px-6">
        <div className="rounded-2xl border border-[#315781] bg-[linear-gradient(145deg,rgba(13,42,72,0.98),rgba(9,29,53,0.95))] p-6 shadow-[0_16px_38px_rgba(0,0,0,0.3)] md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8eb8df]">Pricing</p>
              <h1 className="mt-1 text-3xl font-semibold text-[#e7f2ff] md:text-4xl">
                Plans for businesses that want to advertise impact
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-[#9ec4eb] md:text-base">
                Get your opportunities in front of volunteers who are actively searching by cause, skill, and location.
              </p>
            </div>
            <Link
              href="/contact?topic=partnerships"
              className="inline-flex rounded-full border border-[#4f78a3] bg-[#153d64] px-4 py-2 text-sm font-medium text-[#d9ecff] transition-colors hover:bg-[#1d4e7c]"
            >
              Talk to partnerships
            </Link>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <article
                key={plan.name}
                className={`rounded-2xl border ${plan.accent} bg-[#0f3154] p-5 shadow-[0_12px_28px_rgba(0,0,0,0.25)] ${plan.featured ? "ring-1 ring-[#5eb1ff]" : ""}`}
              >
                {plan.featured && (
                  <span className="inline-flex rounded-full bg-[#2c8fff]/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9fd0ff]">
                    Most popular
                  </span>
                )}

                <h2 className="mt-2 text-xl font-semibold text-[#eef7ff]">{plan.name}</h2>
                <p className="mt-1 text-sm text-[#9ec4eb]">{plan.description}</p>
                <p className="mt-4 text-3xl font-semibold text-[#f2f9ff]">
                  {plan.price}
                  <span className="ml-1 text-sm font-medium text-[#8eb8df]">{plan.cadence}</span>
                </p>

                <ul className="mt-4 space-y-2">
                  {plan.perks.map((perk) => (
                    <li key={perk} className="flex items-center gap-2 text-sm text-[#c0dbf5]">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#59b3ff]" />
                      {perk}
                    </li>
                  ))}
                </ul>

                <Link
                  href={`/contact?topic=pricing&plan=${encodeURIComponent(plan.name)}`}
                  className="mt-5 inline-flex rounded-full bg-[linear-gradient(135deg,#2ed3ff,#2f6fd1)] px-4 py-2 text-xs font-medium text-white transition-all hover:scale-[1.02]"
                >
                  Contact us
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
