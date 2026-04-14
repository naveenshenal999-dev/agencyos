import { Resend } from "resend"

export const resend = new Resend(process.env.RESEND_API_KEY!)

export const FROM_EMAIL = process.env.EMAIL_FROM || "info@markorastudio.com"
export const FROM_NAME = process.env.EMAIL_FROM_NAME || "Marko Ra Studio"

export const DAILY_SEND_LIMIT = 30
