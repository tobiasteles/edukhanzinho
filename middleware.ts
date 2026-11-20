import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isStripeWebhook = createRouteMatcher(['/api/webhooks/stripe(.*)'])
// telas do app que exigem login (sem isso, deslogado vê a tela e toma erro 500 ao clicar)
const isLoggedArea = createRouteMatcher([
  '/courses(.*)',
  '/learn(.*)',
  '/shop(.*)',
  '/quests(.*)',
  '/leaderboard(.*)',
  '/lesson(.*)',
])
const isAdminArea = createRouteMatcher([
  '/admin(.*)',
  '/api/courses(.*)',
  '/api/units(.*)',
  '/api/lessons(.*)',
  '/api/challenges(.*)',
  '/api/challengeOptions(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  // Stripe não tem sessão Clerk; a segurança aqui é a assinatura validada na rota
  if (isStripeWebhook(req)) return
  if (isAdminArea(req)) await auth.protect()
  if (isLoggedArea(req)) await auth.protect({ unauthenticatedUrl: new URL('/', req.url).toString() })
  // a checagem de admin de verdade continua em lib/admin.ts (defesa em profundidade)
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}