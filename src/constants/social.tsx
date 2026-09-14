import type { ReactNode } from 'react'
import { GithubIcon } from '@/components/icons'

export interface SocialLink {
  label: string
  url: string
  icon: ReactNode
}

const social: SocialLink[] = [
  {
    label: 'GitHub',
    url: 'https://github.com/KnobNA',
    icon: <GithubIcon />,
  },
]

export default social
