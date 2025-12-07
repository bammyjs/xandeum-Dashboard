import { describe, it, expect } from 'vitest'
import reducer, { setPNodes, fetchPNodes } from '../pnodesSlice'
import type { SerializedError } from '@reduxjs/toolkit'
import type { PNode } from '@src/types/PNode'

describe('pnodes slice', () => {
  it('has initial state', () => {
    const s = reducer(undefined, { type: '@@INIT' })
    expect(s.items.length).toBe(0)
    expect(s.loading).toBe(false)
    expect(s.historyWindow).toBe(30)
  })

  it('setPNodes updates items and lastUpdated', () => {
    const node: PNode = { id: 'a', gossipAddress: 'http://x', status: 'online' }
    const s = reducer(undefined, setPNodes([node]))
    expect(s.items.length).toBe(1)
    expect(typeof s.lastUpdated).toBe('string')
    expect(Date.parse(s.lastUpdated!)).toBeGreaterThan(0)
  })

  it('handles pending and fulfilled of fetchPNodes', () => {
    const start = reducer(undefined, { type: '@@INIT' })
    const pending = reducer(start, { type: fetchPNodes.pending.type })
    expect(pending.loading).toBe(true)
    expect(pending.error).toBeNull()

    const nodes: PNode[] = [
      { id: '1', gossipAddress: 'http://x', status: 'online' },
      { id: '2', gossipAddress: 'http://y', status: 'offline' },
      { id: '3', gossipAddress: 'http://z', status: 'online' }
    ]
    const fulfilled = reducer(pending, { type: fetchPNodes.fulfilled.type, payload: nodes })
    expect(fulfilled.loading).toBe(false)
    expect(fulfilled.items.length).toBe(3)
    expect(fulfilled.uptimeHistory.length).toBeGreaterThan(0)
    const last = fulfilled.uptimeHistory[fulfilled.uptimeHistory.length - 1]
    expect(last.avgPct).toBeGreaterThan(0)
  })

  it('handles rejected of fetchPNodes', () => {
    const start = reducer(undefined, { type: '@@INIT' })
    const pending = reducer(start, { type: fetchPNodes.pending.type })
    const err: SerializedError = { message: 'boom' }
    const rejected = reducer(pending, { type: fetchPNodes.rejected.type, error: err })
    expect(rejected.loading).toBe(false)
    expect(rejected.error).toBe('boom')
  })
})
