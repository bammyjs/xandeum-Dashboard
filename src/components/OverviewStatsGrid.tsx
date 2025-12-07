import type { PNode } from '../types/PNode'

type Props = { nodes: PNode[]; loading?: boolean }

export default function OverviewStatsGrid({ nodes, loading }: Props) {
  const total = nodes.length
  const active = nodes.filter(n => n.status?.toLowerCase() === 'online').length
  const totalStorage = nodes.reduce((a, n) => a + (typeof n.storageGb === 'number' ? n.storageGb : 0), 0)
  const cpuVals = nodes.map(n => n.cpuPercent).filter((v): v is number => typeof v === 'number')
  const avgCpu = cpuVals.length ? (cpuVals.reduce((a, b) => a + b, 0) / cpuVals.length) : null

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="p-4 md:stat bg-base-100 rounded-xl ">
        {loading ? (
          <>
            <div className="skeleton h-4 w-24"></div>
            <div className="skeleton h-8 w-24 mt-2"></div>
          </>
        ) : (
          <>
            <p className="stat-title">Total Nodes</p>
            <h3 className="stat-value">{total}</h3>
          </>
        )}
      </div>
      <div className="p-4 md:stat bg-base-100 rounded-xl ">
        {loading ? (
          <>
            <div className="skeleton h-4 w-24"></div>
            <div className="skeleton h-8 w-24 mt-2"></div>
          </>
        ) : (
          <>
            <p className="stat-title">Active Nodes</p>
            <h3 className="stat-value text-success">{active}</h3>
          </>
        )}
      </div>
      <div className="p-4 md:stat bg-base-100 rounded-xl ">
        {loading ? (
          <>
            <div className="skeleton h-4 w-32"></div>
            <div className="skeleton h-8 w-28 mt-2"></div>
          </>
        ) : (
          <>
            <p className="stat-title">Total Storage (GB)</p>
            <h3 className="stat-value">{totalStorage.toFixed(1)}</h3>
          </>
        )}
      </div>
      <div className="p-4 md:stat bg-base-100 rounded-xl ">
        {loading ? (
          <>
            <div className="skeleton h-4 w-40"></div>
            <div className="skeleton h-8 w-24 mt-2"></div>
          </>
        ) : (
          <>
            <p className="stat-title">Avg Performance (CPU %)</p>
            <h3 className="stat-value">{avgCpu != null ? avgCpu.toFixed(2) : '-'}</h3>
          </>
        )}
      </div>
    </div>
  )
}
