import type { ReactNode } from 'react'
import { GithubIcon, StackOverflowIcon, TwitterIcon } from '@/components/icons'

export interface SocialLink {
  label: string
  url: string
  icon: ReactNode
}

const social: SocialLink[] = [
  {
    label: 'Stack Overflow',
    url: 'https://stackoverflow.com/users/27439/vincent-ramdhanie?tab=profile',
    icon: <StackOverflowIcon />,
  },
  {
    label: 'Twitter',
    url: 'https://twitter.com/vramdhanie',
    icon: <TwitterIcon />,
  },
  {
    label: 'GitHub',
    url: 'https://github.com/vramdhanie',
    icon: <GithubIcon />,
  },
]

export default social
