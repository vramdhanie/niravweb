import type { MetadataRoute } from 'next'
import { getAllDrawings } from '@/lib/drawings'

export const dynamic = 'force-static'

const BASE = 'https://niravramdhanie.com'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { path: '/', priority: 1 },
    { path: '/about/', priority: 0.6 },
    { path: '/draws/', priority: 0.9 },
    { path: '/draws/drawings/', priority: 0.8 },
    ...getAllDrawings().map((d) => ({ path: `/draws/drawings/${d.slug}/`, priority: 0.7 })),
    { path: '/projects/restricted-n-body-basins/', priority: 0.8 },
    { path: '/articles/custom-physics-engine/', priority: 0.8 },
    { path: '/articles/restricted-n-body-basins/', priority: 0.8 },
  ].map(({ path, priority }) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority,
  }))
}
