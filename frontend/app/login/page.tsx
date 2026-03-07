import Link from "next/link"

import FooterSection from "@/components/footer-section"
import { Header } from "@/components/header"

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#f7f5f3] text-[#37322f]">
      <Header />

      <section className="mx-auto flex max-w-[1060px] px-4 pb-16 pt-24">
        <div className="mx-auto w-full max-w-md rounded-lg border border-[#e0dedb] bg-white p-6">
          <h1 className="text-3xl font-semibold tracking-tight">Log in</h1>
          <p className="mt-2 text-sm text-[#605a57]">Access your Summit dashboard and volunteer opportunities.</p>

          <form className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-md border border-[#d7d3ce] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#37322f]"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                className="w-full rounded-md border border-[#d7d3ce] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#37322f]"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-md bg-[#37322f] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#2d2825]"
            >
              Continue
            </button>
          </form>

          <p className="mt-4 text-sm text-[#605a57]">
            New here?{" "}
            <Link href="/" className="font-medium text-[#37322f] underline underline-offset-2">
              Return to landing page
            </Link>
          </p>
        </div>
      </section>

      <FooterSection />
    </main>
  )
}
