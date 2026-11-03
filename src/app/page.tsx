import type { Metadata } from 'next'
import PhysicsEngineHome from '@/components/home/PhysicsEngineHome'

export const metadata: Metadata = {
  title: { absolute: 'Custom Physics Engine* | Snap, Crackle and Pop' },
  description:
    'A finite-element physics engine built for robot combat — custom FEA solver, elastic collisions and heat simulation — by Nirav Ramdhanie.',
}

export default function HomePage() {
  return <PhysicsEngineHome />
}
