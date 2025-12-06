import { configureStore } from '@reduxjs/toolkit'
import pnodesReducer from './features/pnodes/pnodesSlice'

export const store = configureStore({
  reducer: {
    pnodes: pnodesReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
