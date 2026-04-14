import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Demo mode: Supabase not configured — use cookie-based demo session
  if (!supabaseUrl || !supabaseUrl.startsWith('http') || !supabaseKey) {
    const pathname = request.nextUrl.pathname
    const demoSession = request.cookies.get("demo_session")?.value
    const isDashboardPage = pathname.startsWith('/dashboard') ||
      pathname.startsWith('/clients') ||
      pathname.startsWith('/calendar') ||
      pathname.startsWith('/design') ||
      pathname.startsWith('/team') ||
      pathname.startsWith('/settings')

    // Not logged in → redirect dashboard routes to login
    if (!demoSession && isDashboardPage) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    // Already logged in → skip login page
    if (demoSession && pathname === '/login') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isAuthPage = pathname.startsWith('/login') || pathname === '/'
  const isDashboardPage = pathname.startsWith('/dashboard') ||
    pathname.startsWith('/clients') ||
    pathname.startsWith('/calendar') ||
    pathname.startsWith('/design') ||
    pathname.startsWith('/team') ||
    pathname.startsWith('/settings')

  if (!user && isDashboardPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
