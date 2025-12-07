import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import OverviewStatsGrid from '../OverviewStatsGrid'
import type { PNode } from '../../types/PNode'

const nodes: PNode[] = [
  { id: '1', gossipAddress: 'http://a', status: 'online', storageGb: 10, cpuPercent: 50 },
  { id: '2', gossipAddress: 'http://b', status: 'offline', storageGb: 20, cpuPercent: 30 }
]

describe('OverviewStatsGrid', () => {
  it('renders skeletons when loading', () => {
    const { container } = render(<OverviewStatsGrid nodes={nodes} loading />)
    const skels = container.querySelectorAll('.skeleton')
    expect(skels.length).toBeGreaterThan(0)
  })

  it('renders computed stats when not loading', () => {
    render(<OverviewStatsGrid nodes={nodes} />)
    expect(screen.getByText('Total Nodes')).toBeInTheDocument()
    expect(screen.getByText('Active Nodes')).toBeInTheDocument()
    expect(screen.getByText('Total Storage (GB)')).toBeInTheDocument()
    expect(screen.getByText('Avg Performance (CPU %)')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('30.0')).toBeInTheDocument()
    expect(screen.getByText('40.00')).toBeInTheDocument()
  })
})
