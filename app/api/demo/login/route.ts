import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { email, name } = await request.json()

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 })
  }

  const displayName = name || email.split("@")[0]
    .replace(/[._-]/g, " ")
    .replace(/\b\w/g, (c: string) => c.toUpperCase())

  const session = JSON.stringify({ email, name: displayName })

  const response = NextResponse.json({ ok: true })
  response.cookies.set("demo_session", session, {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: "lax",
  })
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete("demo_session")
  return response
}
