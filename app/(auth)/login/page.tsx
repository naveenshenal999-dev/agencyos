"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Zap, Mail, Lock, Eye, EyeOff, Loader2, FlaskConical } from "lucide-react"

const IS_DEMO = !process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("http")

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [mode, setMode] = useState<"login" | "signup">("login")
  const [fullName, setFullName] = useState("")
  const router = useRouter()

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (IS_DEMO) {
        // Demo mode: set cookie via API route then redirect
        const res = await fetch("/api/demo/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name: fullName || undefined }),
        })
        if (!res.ok) throw new Error("Login failed")
        toast.success(`Welcome, ${email}!`)
        router.push("/dashboard")
        router.refresh()
        return
      }

      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        })
        if (error) throw error
        toast.success("Account created! Check your email to confirm.")
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push("/dashboard")
        router.refresh()
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Authentication failed"
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleGoogleLogin() {
    if (IS_DEMO) {
      toast.info("Google login requires Supabase. Using email login in demo mode.")
      return
    }
    setIsGoogleLoading(true)
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      })
      if (error) throw error
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Google sign in failed"
      toast.error(message)
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-950 via-purple-900 to-indigo-950 flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-2 mb-16">
            <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">AgencyOS</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            Manage every client.<br />
            Create AI content.<br />
            Grow faster.
          </h2>
          <p className="text-violet-200 text-lg leading-relaxed">
            The complete operating system for digital agencies managing social media at scale.
          </p>
        </div>

        <div className="space-y-4">
          {[
            { stat: "500+", label: "Agencies using AgencyOS" },
            { stat: "10K+", label: "Posts published monthly" },
            { stat: "80%", label: "Time saved on reporting" },
          ].map((item) => (
            <div key={item.stat} className="flex items-center gap-4">
              <div className="text-2xl font-bold text-white">{item.stat}</div>
              <div className="text-violet-300 text-sm">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              AgencyOS
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-muted-foreground">
              {mode === "login"
                ? "Sign in to your AgencyOS dashboard"
                : "Start your 14-day free trial"}
            </p>
          </div>

          {/* Google OAuth */}
          <Button
            variant="outline"
            className="w-full h-11 mb-6 border-border/60"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 w-4 h-4 animate-spin" />
            ) : (
              <svg className="mr-2 w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
            )}
            Continue with Google
          </Button>

          <div className="flex items-center gap-4 mb-6">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground">or continue with email</span>
            <Separator className="flex-1" />
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Jane Smith"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={mode === "signup"}
                  className="h-11 border-border/60"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@agency.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 pl-9 border-border/60"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {mode === "login" && (
                  <button type="button" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-11 pl-9 pr-9 border-border/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Please wait...</>
              ) : (
                mode === "login" ? "Sign in" : "Create account"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === "login" ? (
              <>Don&apos;t have an account?{" "}
                <button onClick={() => setMode("signup")} className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
                  Sign up free
                </button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => setMode("login")} className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
                  Sign in
                </button>
              </>
            )}
          </p>

          <p className="text-center text-xs text-muted-foreground mt-6">
            By continuing, you agree to our{" "}
            <Link href="#" className="underline hover:text-foreground">Terms</Link>
            {" "}and{" "}
            <Link href="#" className="underline hover:text-foreground">Privacy Policy</Link>
          </p>

          {IS_DEMO && (
            <div className="mt-6 rounded-lg bg-violet-500/10 border border-violet-500/20 p-3 flex items-start gap-2">
              <FlaskConical className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-violet-300 leading-relaxed">
                <span className="font-semibold">Demo mode</span> — enter any email and password to explore the app with sample data. No Supabase needed.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
