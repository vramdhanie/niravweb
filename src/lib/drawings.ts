import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const DRAWINGS_DIR = path.join(process.cwd(), 'src/content/drawings')

export interface DrawingFrontmatter {
  title: string
  slug: string
  image: string
  thumb: string
  date: string
  author: string
  level: string
  tags: string
}

export interface Drawing extends DrawingFrontmatter {
  /** Raw MDX body (without frontmatter). */
  content: string
}

/** YAML parses an unquoted `2019-09-23` into a Date; normalize back to `YYYY-MM-DD`. */
function toDateString(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value ?? '')
}

function parseFile(fileName: string): Drawing {
  const filePath = path.join(DRAWINGS_DIR, fileName)
  const raw = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(raw)
  const fm = data as DrawingFrontmatter
  return {
    ...fm,
    slug: fm.slug || fileName.replace(/\.mdx$/, ''),
    date: toDateString(fm.date),
    content,
  }
}

/** All drawings, newest first. */
export function getAllDrawings(): Drawing[] {
  return fs
    .readdirSync(DRAWINGS_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map(parseFile)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
}

export function getDrawing(slug: string): Drawing | undefined {
  return getAllDrawings().find((d) => d.slug === slug)
}
