import { useAppDispatch } from '../hooks'
import { fetchPNodes } from '../features/pnodes/pnodesSlice'

export default function Navbar() {
  const dispatch = useAppDispatch()
  return (
    <div className="navbar bg-base-100 shadow mb-6">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">Xandeum pNode Dashboard</a>
      </div>
      <div className="flex-none">
        <button className="btn btn-primary" onClick={() => dispatch(fetchPNodes())}>Refresh</button>
      </div>
    </div>
  )
}
