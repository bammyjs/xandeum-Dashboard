import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { PNode } from '../../types/PNode'
import { fetchPNodesFromGossip } from '../../services/prpc'

type State = {
  items: PNode[]
  loading: boolean
  error: string | null
  lastUpdated: string | null
  onlineStats: Record<string, { obs: number; up: number }>
  uptimeHistory: { ts: string; avgPct: number; byId: Record<string, number> }[]
  historyWindow: number
}

const initialState: State = {
  items: [],
  loading: false,
  error: null,
  lastUpdated: null,
  onlineStats: {},
  uptimeHistory: [],
  historyWindow: 30
}

export const fetchPNodes = createAsyncThunk('pnodes/fetch', async () => {
  const nodes = await fetchPNodesFromGossip()
  return nodes as PNode[]
})

const slice = createSlice({
  name: 'pnodes',
  initialState,
  reducers: {
    setPNodes(state, action: PayloadAction<PNode[]>) {
      state.items = action.payload
      state.lastUpdated = new Date().toISOString()
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload
    },
    setHistoryWindow(state, action: PayloadAction<number>) {
      const v = action.payload
      state.historyWindow = v
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPNodes.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchPNodes.fulfilled, (state, action) => {
        state.items = action.payload
        state.loading = false
        state.lastUpdated = new Date().toISOString()
        const stats = { ...state.onlineStats }
        for (const n of action.payload) {
          const id = n.id
          const cur = stats[id] ?? { obs: 0, up: 0 }
          const isOnline = n.status?.toLowerCase() === 'online'
          stats[id] = { obs: cur.obs + 1, up: cur.up + (isOnline ? 1 : 0) }
        }
        state.onlineStats = stats
        const ts = state.lastUpdated
        const byId: Record<string, number> = {}
        const vals: number[] = []
        for (const [id, s] of Object.entries(stats)) {
          if (s.obs > 0) {
            const pct = Math.round(((s.up / s.obs) * 100) * 10) / 10
            byId[id] = pct
            vals.push(pct)
          }
        }
        const avgPct = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : 0
        state.uptimeHistory.push({ ts, avgPct, byId })
        if (state.uptimeHistory.length > 200) state.uptimeHistory.shift()
      })
      .addCase(fetchPNodes.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch pNodes'
      })
  }
})

export const { setPNodes, setError, setLoading, setHistoryWindow } = slice.actions
export default slice.reducer
