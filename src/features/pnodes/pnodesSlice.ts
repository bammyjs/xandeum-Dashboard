import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { PNode } from '../../types/PNode'
import { fetchPNodesFromGossip } from '../../services/prpc'

type State = {
  items: PNode[]
  loading: boolean
  error: string | null
  lastUpdated: string | null
}

const initialState: State = {
  items: [],
  loading: false,
  error: null,
  lastUpdated: null
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
      })
      .addCase(fetchPNodes.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch pNodes'
      })
  }
})

export const { setPNodes, setError, setLoading } = slice.actions
export default slice.reducer
