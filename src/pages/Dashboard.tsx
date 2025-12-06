import { useEffect } from 'react'
import { useAppDispatch } from '../hooks'
import { fetchPNodes } from '../features/pnodes/pnodesSlice'
import PNodeStats from '../components/PNodeStats'
import PNodeTable from '../components/PNodeTable'
import { useAppSelector } from '../hooks'
import StatusPie from '../components/charts/StatusPie'
import ResourceArea from '../components/charts/ResourceArea'

export default function Dashboard() {
  const dispatch = useAppDispatch()
  const nodes = useAppSelector(s => s.pnodes.items)
  useEffect(() => {
    dispatch(fetchPNodes())
  }, [dispatch])

  return (
    <div className="container mx-auto px-4 max-w-7xl">
      <div className="mb-6">
        <PNodeStats />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <StatusPie nodes={nodes} />
        <ResourceArea nodes={nodes} />
      </div>
      <PNodeTable />
    </div>
  )
}
