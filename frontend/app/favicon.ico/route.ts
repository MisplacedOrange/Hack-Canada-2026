import { NextResponse } from "next/server"

export async function GET(request: Request): Promise<Response> {
  return NextResponse.redirect(new URL("/assets/images/summit.svg", request.url), { status: 308 })
}
