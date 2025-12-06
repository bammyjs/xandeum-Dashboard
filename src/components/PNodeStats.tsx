import { useAppSelector } from '../hooks'

function avgStorage(nodes: { storageGb?: number }[]) {
  const vals = nodes.map(n => n.storageGb).filter((v): v is number => typeof v === 'number')
  if (!vals.length) return 0
  const sum = vals.reduce((a, b) => a + b, 0)
  return Math.round((sum / vals.length) * 10) / 10
}

export default function PNodeStats() {
  const { items, loading } = useAppSelector(s => s.pnodes)
  const total = items.length
  const online = items.filter(n => n.status?.toLowerCase() === 'online').length
  const avg = avgStorage(items)
  const topCpu = items.reduce<{ id: string; v: number } | null>((best, n) => {
    const v = typeof n.cpuPercent === 'number' ? n.cpuPercent : -1
    if (v < 0) return best
    if (!best || v > best.v) return { id: n.id, v }
    return best
  }, null)
  const topRamPct = items.reduce<{ id: string; v: number } | null>((best, n) => {
    const v = typeof n.ramUsedPercent === 'number' ? n.ramUsedPercent : -1
    if (v < 0) return best
    if (!best || v > best.v) return { id: n.id, v }
    return best
  }, null)
  const topStorage = items.reduce<{ id: string; v: number } | null>((best, n) => {
    const v = typeof n.storageGb === 'number' ? n.storageGb : -1
    if (v < 0) return best
    if (!best || v > best.v) return { id: n.id, v }
    return best
  }, null)

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="skeleton h-24"></div>
        <div className="skeleton h-24"></div>
        <div className="skeleton h-24"></div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <div className="stats shadow">
        <div className="stat">
          <div className="stat-title">Total pNodes</div>
          <div className="stat-value">{total}</div>
        </div>
      </div>
      <div className="stats shadow">
        <div className="stat">
          <div className="stat-title">Online pNodes</div>
          <div className="stat-value text-success">{online}</div>
        </div>
      </div>
      <div className="stats shadow">
        <div className="stat">
          <div className="stat-title">Avg Storage (GB)</div>
          <div className="stat-value">{avg}</div>
        </div>
      </div>
      <div className="stats shadow">
        <div className="stat">
          <div className="stat-title">Top CPU (%)</div>
          <div className="stat-value">{topCpu ? topCpu.v.toFixed(2) : '-'}</div>
          <div className="stat-desc">{topCpu ? `ID ${topCpu.id}` : ''}</div>
        </div>
      </div>
      <div className="stats shadow">
        <div className="stat">
          <div className="stat-title">Top RAM Used (%)</div>
          <div className="stat-value">{topRamPct ? topRamPct.v.toFixed(1) : '-'}</div>
          <div className="stat-desc">{topRamPct ? `ID ${topRamPct.id}` : ''}</div>
        </div>
      </div>
      <div className="stats shadow">
        <div className="stat">
          <div className="stat-title">Top Storage (GB)</div>
          <div className="stat-value">{topStorage ? topStorage.v : '-'}</div>
          <div className="stat-desc">{topStorage ? `ID ${topStorage.id}` : ''}</div>
        </div>
      </div>
    </div>
  )
}
