import { useAppDispatch, useAppSelector } from '../hooks'
import { RefreshCcw } from 'lucide-react'
import { fetchPNodes } from '../features/pnodes/pnodesSlice'

export default function Navbar() {
  const dispatch = useAppDispatch()
  const { lastUpdated, loading } = useAppSelector(s => s.pnodes)
  return (
    <div className="navbar navbar-center justify-between bg-base-100 shadow mb-6 sticky top-0 z-50">
      <div className="flex-1  navbar-center justify-between ">
        <img src="https://static.wixstatic.com/media/ea731d_af14a4247e7f4b2c9ec3aaaccf5c6827~mv2.png/v1/fill/w_412,h_90,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/logo_edited.png" alt="" className='w-40 h-auto'/>
        <div className="flex items-center gap-2 lg:hidden">
          <div className="text-xs opacity-70">{lastUpdated ? `Last: ${new Date(lastUpdated).toLocaleTimeString()}` : ''}</div>
          <button className="btn btn-ghost" onClick={() => window.location.reload()}>
            <RefreshCcw size={20} />
          </button>
        </div>
      </div>
      <div className="navbar-end hidden lg:flex">
        <div className="flex items-center gap-3">
          <div className="text-xs opacity-70">{lastUpdated ? `Last: ${new Date(lastUpdated).toLocaleTimeString()}` : ''}</div>
          <button className="btn btn-primary" disabled={loading} onClick={() => dispatch(fetchPNodes())}>Refresh</button>
        </div>
      </div>
    </div>
  )
}
