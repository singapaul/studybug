import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://studybug.co.uk'
  const routes = [
    '',
    '/features',
    '/pricing',
    '/how-it-works',
    '/schools',
    '/blog',
    '/help',
    '/contact',
  ]
  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }))
}
