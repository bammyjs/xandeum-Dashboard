import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Navbar from '../Navbar'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import pnodesReducer from '@src/features/pnodes/pnodesSlice'

function renderWithStore(lastUpdated?: string) {
  const store = configureStore({
    reducer: { pnodes: pnodesReducer },
    preloadedState: {
      pnodes: {
        items: [],
        loading: false,
        error: null,
        lastUpdated: lastUpdated ?? new Date().toISOString(),
        onlineStats: {},
        uptimeHistory: [],
        historyWindow: 30
      }
    }
  })
  return render(
    <Provider store={store}>
      <Navbar />
    </Provider>
  )
}

describe('Navbar', () => {
  it('shows last fetch time and refresh button', () => {
    renderWithStore('2025-12-07T12:34:56.000Z')
    expect(screen.getAllByText(/Last:/i).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
  })
})
