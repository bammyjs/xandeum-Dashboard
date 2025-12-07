import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PNodeCard from '../PNodeCard'
import type { PNode } from '@src/types/PNode'

const baseNode: PNode = {
  id: 'n1',
  gossipAddress: 'http://127.0.0.1:6000',
  status: 'online'
}

describe('PNodeCard', () => {
  it('renders compact variant by default', () => {
    render(<PNodeCard node={baseNode} />)
    expect(screen.getByText('pNode-n1')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /open/i })).toBeNull()
  })

  it('renders skeletons when loading', () => {
    const { container } = render(<PNodeCard node={baseNode} loading />)
    const skels = container.querySelectorAll('.skeleton')
    expect(skels.length).toBeGreaterThan(0)
    expect(screen.queryByText('pNode-n1')).toBeNull()
  })

  it('shows actions only in detailed and not loading', () => {
    render(<PNodeCard node={baseNode} variant="detailed" />)
    expect(screen.getByRole('link', { name: /open/i })).toBeInTheDocument()
  })
})
