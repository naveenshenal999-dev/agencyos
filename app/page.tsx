import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  BarChart3,
  Brain,
  Calendar,
  CheckCircle,
  Globe,
  LayoutDashboard,
  MessageSquare,
  Paintbrush,
  Shield,
  Star,
  TrendingUp,
  Users,
  Zap,
  ArrowRight,
} from "lucide-react"

const features = [
  {
    icon: LayoutDashboard,
    title: "Unified Dashboard",
    description: "Manage all your clients from one powerful command center. See health scores, recent activity, and key metrics at a glance.",
  },
  {
    icon: Brain,
    title: "AI-Powered Content",
    description: "Generate captions, post ideas, and full monthly reports using Groq's ultra-fast LLaMA 3 model tailored to each client's brand voice.",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    description: "Track followers, engagement rates, reach, and platform performance with beautiful interactive charts powered by Recharts.",
  },
  {
    icon: Calendar,
    title: "Content Calendar",
    description: "Schedule and visualize content across all platforms and clients in a drag-and-drop calendar view.",
  },
  {
    icon: Paintbrush,
    title: "Post Designer",
    description: "Create stunning social media graphics right in the browser with a full Fabric.js canvas editor and brand templates.",
  },
  {
    icon: Globe,
    title: "Client Portal",
    description: "Give clients their own branded portal to approve posts, view analytics, and download monthly PDF reports.",
  },
]

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Founder, Bright Social Agency",
    avatar: "SM",
    rating: 5,
    text: "AgencyOS cut our reporting time by 80%. The AI report generator alone paid for the subscription in the first week.",
  },
  {
    name: "James Torres",
    role: "Head of Social Media, PixelCraft",
    avatar: "JT",
    rating: 5,
    text: "Managing 30+ clients used to be chaos. Now everything is organized, and our clients love the portal to approve posts.",
  },
  {
    name: "Priya Nair",
    role: "CEO, Growth Labs Digital",
    avatar: "PN",
    rating: 5,
    text: "The AI caption generator and weakness detector have completely transformed how we create content strategies for clients.",
  },
]

const plans = [
  {
    name: "Starter",
    price: 29,
    description: "Perfect for solo freelancers just starting out",
    features: [
      "1 team member",
      "Up to 5 clients",
      "AI caption generator",
      "Basic analytics",
      "Monthly reports",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: false,
    priceId: "starter",
  },
  {
    name: "Pro",
    price: 79,
    description: "For growing agencies with multiple clients",
    features: [
      "5 team members",
      "Up to 25 clients",
      "All AI features",
      "Advanced analytics",
      "SEO advisor",
      "Post designer",
      "Client portal",
      "Priority support",
    ],
    cta: "Start Free Trial",
    popular: true,
    priceId: "pro",
  },
  {
    name: "Agency",
    price: 199,
    description: "For large agencies with enterprise needs",
    features: [
      "Unlimited team members",
      "Unlimited clients",
      "All AI features",
      "White-label reports",
      "Custom branding",
      "API access",
      "Dedicated account manager",
      "24/7 priority support",
    ],
    cta: "Contact Sales",
    popular: false,
    priceId: "agency",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                AgencyOS
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Reviews</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/login">
                <Button size="sm" className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0">
                  Get started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <Badge className="mb-6 bg-violet-500/10 text-violet-400 border-violet-500/20 hover:bg-violet-500/20">
              <Zap className="w-3 h-3 mr-1" /> Powered by Groq LLaMA 3 AI
            </Badge>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
              The OS for{" "}
              <span className="bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                Social Media
              </span>
              <br />
              Agencies
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
              Manage every client, platform, and campaign from one intelligent dashboard.
              Generate AI content, track analytics, design posts, and impress clients — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link href="/login">
                <Button size="lg" className="h-12 px-8 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 text-base">
                  Start free trial <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline" className="h-12 px-8 text-base border-border/60">
                  See all features
                </Button>
              </Link>
            </div>

            {/* Social proof badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                14-day free trial
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Cancel anytime
              </div>
            </div>
          </div>

          {/* Hero Dashboard Preview */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 pointer-events-none" style={{ top: '60%' }} />
            <div className="rounded-2xl border border-border/60 bg-card shadow-2xl shadow-violet-500/10 overflow-hidden">
              <div className="p-4 border-b border-border/40 bg-muted/30 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-muted-foreground bg-background/50 px-4 py-1 rounded-full">app.agencyos.com/dashboard</span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4 p-6 bg-gradient-to-br from-background to-muted/20">
                {[
                  { label: "Total Clients", value: "48", change: "+12%", icon: Users, color: "text-blue-400" },
                  { label: "Posts This Month", value: "324", change: "+28%", icon: MessageSquare, color: "text-green-400" },
                  { label: "Avg Engagement", value: "4.8%", change: "+0.6%", icon: TrendingUp, color: "text-purple-400" },
                  { label: "Team Members", value: "12", change: "Active", icon: Shield, color: "text-orange-400" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl bg-card border border-border/40 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">{stat.label}</span>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-xs text-green-500 mt-1">{stat.change}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Platforms */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-y border-border/40 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sm text-muted-foreground mb-8">Manage all your social platforms in one place</p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[
              { name: "Instagram", color: "text-pink-500", dot: "bg-pink-500" },
              { name: "Facebook", color: "text-blue-500", dot: "bg-blue-500" },
              { name: "LinkedIn", color: "text-blue-600", dot: "bg-blue-600" },
              { name: "Twitter / X", color: "text-sky-400", dot: "bg-sky-400" },
            ].map((platform) => (
              <div key={platform.name} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <span className={`w-2.5 h-2.5 rounded-full ${platform.dot}`} />
                <span className={`font-semibold text-sm ${platform.color}`}>{platform.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20">Features</Badge>
            <h2 className="text-4xl font-bold mb-4">Everything your agency needs</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From AI content creation to white-label client reports, AgencyOS has every tool your team needs to scale.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border/60 bg-card/50 hover:bg-card transition-colors group">
                <CardHeader>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/20 flex items-center justify-center mb-3 group-hover:from-violet-600/30 group-hover:to-indigo-600/30 transition-colors">
                    <feature.icon className="w-5 h-5 text-violet-400" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm leading-relaxed">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features Highlight */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-violet-950/30 via-background to-indigo-950/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-violet-500/10 text-violet-400 border-violet-500/20">AI Features</Badge>
              <h2 className="text-4xl font-bold mb-6">Your AI social media strategist, always on</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Powered by Groq's lightning-fast inference and LLaMA 3, our AI tools understand your clients' brands and generate content that converts.
              </p>
              <div className="space-y-4">
                {[
                  { title: "Caption Generator", desc: "5 platform-optimized caption variations per post topic" },
                  { title: "Weakness Detector", desc: "Identify top 5 account weaknesses with specific action plans" },
                  { title: "Report Generator", desc: "Full professional monthly reports in seconds" },
                  { title: "SEO Advisor", desc: "Keyword gaps, competitor insights, and recommendations" },
                  { title: "Idea Generator", desc: "10 fresh post ideas tailored to each client's audience" },
                ].map((ai) => (
                  <div key={ai.title} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center mt-0.5 flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-violet-400" />
                    </div>
                    <div>
                      <span className="font-medium">{ai.title}</span>
                      <span className="text-muted-foreground"> — {ai.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl border border-violet-500/20 bg-card p-6 shadow-2xl shadow-violet-500/10">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-5 h-5 text-violet-400" />
                  <span className="font-semibold">AI Caption Generator</span>
                  <Badge className="ml-auto bg-green-500/10 text-green-400 border-green-500/20 text-xs">Live</Badge>
                </div>
                <div className="space-y-3">
                  <div className="rounded-lg bg-muted/50 p-3 border border-border/40">
                    <p className="text-xs text-muted-foreground mb-1">Platform: Instagram | Brand Voice: Friendly</p>
                    <p className="text-sm">✨ Summer vibes are calling! Our new collection drops Friday — are you ready? Shop the link in bio before it sells out! 🌊 #Summer #NewArrivals</p>
                  </div>
                  <div className="rounded-lg bg-muted/50 p-3 border border-border/40">
                    <p className="text-xs text-muted-foreground mb-1">Platform: LinkedIn | Brand Voice: Professional</p>
                    <p className="text-sm">Excited to announce our Summer 2025 collection, designed with sustainability at the forefront. Each piece crafted from 100% recycled materials.</p>
                  </div>
                  <div className="rounded-lg bg-violet-500/10 p-3 border border-violet-500/20">
                    <p className="text-xs text-violet-400 mb-1">Platform: Twitter | Brand Voice: Bold</p>
                    <p className="text-sm">Summer just got an upgrade. 🔥 New collection. Limited stock. Friday only. Don't say we didn't warn you.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-yellow-500/10 text-yellow-400 border-yellow-500/20">Testimonials</Badge>
            <h2 className="text-4xl font-bold mb-4">Loved by agencies worldwide</h2>
            <p className="text-xl text-muted-foreground">Join hundreds of agencies already scaling with AgencyOS</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="border-border/60 bg-card/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                      {t.avatar}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-500/10 text-green-400 border-green-500/20">Pricing</Badge>
            <h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-xl text-muted-foreground">Start free, scale as you grow. No hidden fees.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <Card key={plan.name} className={`relative border-border/60 ${plan.popular ? 'border-violet-500/50 shadow-lg shadow-violet-500/10 bg-gradient-to-b from-violet-950/20 to-card' : 'bg-card/50'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 px-4">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="pt-2">
                    <span className="text-5xl font-extrabold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Link href="/login">
                    <Button
                      className={`w-full mb-6 ${plan.popular ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0' : ''}`}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                  <Separator className="mb-6" />
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-3xl bg-gradient-to-br from-violet-900/40 via-purple-900/40 to-indigo-900/40 border border-violet-500/20 p-12">
            <h2 className="text-4xl font-bold mb-4">Ready to scale your agency?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join 500+ agencies using AgencyOS to manage clients, create AI content, and grow faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="h-12 px-8 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0 text-base">
                  Start your free trial <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-4">No credit card required · 14-day free trial · Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-lg">AgencyOS</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">The all-in-one social media management platform for digital agencies.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><Link href="/login" className="hover:text-foreground transition-colors">Sign up</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <Separator className="mb-8" />
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>© 2025 AgencyOS. All rights reserved.</p>
            <p>Built with Next.js, Supabase & Groq AI</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
