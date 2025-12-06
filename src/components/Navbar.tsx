import { useAppDispatch, useAppSelector } from '../hooks'
import { useEffect, useState } from 'react'
import { fetchPNodes, setHistoryWindow } from '../features/pnodes/pnodesSlice'

export default function Navbar() {
  const dispatch = useAppDispatch()
  const { lastUpdated, loading, historyWindow } = useAppSelector(s => s.pnodes)
  const [auto, setAuto] = useState(false)
  const [intervalMs, setIntervalMs] = useState(30000)
  useEffect(() => {
    if (!auto) return
    const id = setInterval(() => dispatch(fetchPNodes()), intervalMs)
    return () => clearInterval(id)
  }, [auto, intervalMs, dispatch])
  return (
    <div className="navbar bg-base-100 shadow mb-6">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">Xandeum pNode Dashboard</a>
      </div>
      <div className="flex-none">
        <div className="flex items-center gap-3">
          <div className="text-xs opacity-70 hidden md:block">{lastUpdated ? `Last: ${new Date(lastUpdated).toLocaleTimeString()}` : ''}</div>
          <button className="btn btn-primary" disabled={loading} onClick={() => dispatch(fetchPNodes())}>Refresh</button>
          <select className="select select-bordered w-28" value={String(intervalMs)} onChange={e => setIntervalMs(Number(e.target.value))}>
            <option value="15000">15s</option>
            <option value="30000">30s</option>
            <option value="60000">60s</option>
          </select>
        <label className="label cursor-pointer gap-2">
          <span className="label-text">Auto</span>
          <input type="checkbox" className="toggle" checked={auto} onChange={e => setAuto(e.target.checked)} />
        </label>
        <select className="select select-bordered w-32" value={String(historyWindow)} onChange={e => dispatch(setHistoryWindow(Number(e.target.value)))}>
          <option value="15">Hist 15</option>
          <option value="30">Hist 30</option>
          <option value="60">Hist 60</option>
        </select>
        </div>
      </div>
    </div>
  )
}
