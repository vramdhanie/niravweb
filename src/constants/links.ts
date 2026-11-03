export interface NavLink {
  path: string
  text: string
}

const links: NavLink[] = [
  { path: '/', text: 'home' },
  { path: '/games', text: 'games' },
  { path: '/draws', text: 'drawings' },
]

export default links
