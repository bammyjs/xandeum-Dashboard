import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PNodeTable from '../PNodeTable'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import pnodesReducer from '@src/features/pnodes/pnodesSlice'
import type { PNode } from '@src/types/PNode'

function renderWithStore(state: Partial<ReturnType<typeof pnodesReducer>> & { items?: PNode[]; loading?: boolean; error?: string | null }) {
  const store = configureStore({
    reducer: { pnodes: pnodesReducer },
    preloadedState: {
      pnodes: {
        items: state.items ?? [],
        loading: state.loading ?? false,
        error: state.error ?? null,
        lastUpdated: null,
        onlineStats: {},
        uptimeHistory: [],
        historyWindow: 30
      }
    }
  })
  return render(
    <Provider store={store}>
      <PNodeTable />
    </Provider>
  )
}

describe('PNodeTable', () => {
  it('renders skeletons when loading', () => {
    const { container } = renderWithStore({ loading: true })
    const skels = container.querySelectorAll('.skeleton')
    expect(skels.length).toBeGreaterThan(0)
  })

  it('renders empty state when no data', () => {
    renderWithStore({ loading: false, items: [] })
    expect(screen.getByText(/No pNodes found/i)).toBeInTheDocument()
  })

  it('renders table headers and rows when data present', () => {
    const nodes: PNode[] = [
      { id: 'n1', gossipAddress: 'http://a', status: 'online', storageGb: 12.3, cpuPercent: 55.12 },
      { id: 'n2', gossipAddress: 'http://b', status: 'offline' }
    ]
    renderWithStore({ loading: false, items: nodes })
    expect(screen.getByText('ID')).toBeInTheDocument()
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByText('Storage (GB)')).toBeInTheDocument()
    expect(screen.getByText('CPU (%)')).toBeInTheDocument()
    expect(screen.getByText('RAM Used (GB)')).toBeInTheDocument()
    expect(screen.getByText('Version')).toBeInTheDocument()
    expect(screen.getByText('Last Seen')).toBeInTheDocument()
    expect(screen.queryByText('pNode-n1')).toBeNull()
    expect(screen.getByText('online')).toBeInTheDocument()
    expect(screen.getByText('offline')).toBeInTheDocument()
  })
})
