export interface NavLink {
  path: string
  text: string
}

const links: NavLink[] = [
  { path: '/', text: 'home' },
  { path: '/drawings', text: 'drawings' },
]

export default links
