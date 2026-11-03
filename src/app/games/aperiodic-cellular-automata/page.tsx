import type { Metadata } from 'next'
import AperiodicGame from '@/components/games/AperiodicGame'

export const metadata: Metadata = {
  title: 'Aperiodic Cellular Automata',
  description: 'Conway’s Game of Life on a Penrose tiling.',
}

export default function AperiodicCellularAutomataPage() {
  return <AperiodicGame />
}
