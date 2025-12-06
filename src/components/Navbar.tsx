import { useAppDispatch, useAppSelector } from '../hooks'
import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
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
    <div className="navbar navbar-center justify-between bg-base-100 shadow mb-6 sticky top-0 z-50">
      <div className="flex-1  navbar-center justify-between ">
        <img src="https://static.wixstatic.com/media/ea731d_af14a4247e7f4b2c9ec3aaaccf5c6827~mv2.png/v1/fill/w_412,h_90,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/logo_edited.png" alt="" className='w-40 h-auto'/>
        <div className="dropdown dropdown-end ">
          <button tabIndex={0} className="btn btn-ghost lg:hidden">
            <Menu size={20} />
          </button>
          <div tabIndex={0} className="dropdown-content menu p-4 shadow bg-base-100 rounded-box w-64">
            <div className="flex flex-col gap-3">
              <div className="text-xs opacity-70">{lastUpdated ? `Last: ${new Date(lastUpdated).toLocaleTimeString()}` : ''}</div>
              <button className="btn btn-primary" disabled={loading} onClick={() => dispatch(fetchPNodes())}>Refresh</button>
              <select className="select select-bordered" value={String(intervalMs)} onChange={e => setIntervalMs(Number(e.target.value))}>
                <option value="15000">15s</option>
                <option value="30000">30s</option>
                <option value="60000">60s</option>
              </select>
              <label className="label cursor-pointer gap-2">
                <span className="label-text">Auto</span>
                <input type="checkbox" className="toggle" checked={auto} onChange={e => setAuto(e.target.checked)} />
              </label>
              <select className="select select-bordered" value={String(historyWindow)} onChange={e => dispatch(setHistoryWindow(Number(e.target.value)))}>
                <option value="15">Hist 15</option>
                <option value="30">Hist 30</option>
                <option value="60">Hist 60</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="navbar-end hidden lg:flex">
        <div className="flex items-center gap-3">
          <div className="text-xs opacity-70">{lastUpdated ? `Last: ${new Date(lastUpdated).toLocaleTimeString()}` : ''}</div>
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
