export interface NavLink {
  path: string
  text: string
}

const links: NavLink[] = [
  { path: '/', text: 'home' },
  { path: '/draws', text: 'drawings' },
]

export default links
