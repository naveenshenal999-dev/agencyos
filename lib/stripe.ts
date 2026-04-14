import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
  typescript: true,
})

export const PLANS = {
  starter: {
    name: 'Starter',
    price: 29,
    priceId: process.env.STRIPE_STARTER_PRICE_ID!,
    features: [
      '1 team member',
      'Up to 5 clients',
      'AI caption generator',
      'Basic analytics',
      'Monthly reports',
      'Email support',
    ],
  },
  pro: {
    name: 'Pro',
    price: 79,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: [
      '5 team members',
      'Up to 25 clients',
      'All AI features',
      'Advanced analytics',
      'SEO advisor',
      'Post designer',
      'Client portal',
      'Priority support',
    ],
  },
  agency: {
    name: 'Agency',
    price: 199,
    priceId: process.env.STRIPE_AGENCY_PRICE_ID!,
    features: [
      'Unlimited team members',
      'Unlimited clients',
      'All AI features',
      'White-label reports',
      'Custom branding',
      'API access',
      'Dedicated account manager',
      '24/7 support',
    ],
  },
}
