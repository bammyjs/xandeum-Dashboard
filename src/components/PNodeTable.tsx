import { useMemo, useState } from 'react'
import { useAppSelector } from '../hooks'
import { LineChart, Line, YAxis, XAxis } from 'recharts'

export default function PNodeTable() {
  const { items, loading, error } = useAppSelector(s => s.pnodes)
  const onlineStats = useAppSelector(s => s.pnodes.onlineStats)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [sortKey, setSortKey] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [onlineOnly, setOnlineOnly] = useState(false)
  const uptimeHistory = useAppSelector(s => s.pnodes.uptimeHistory)
  const historyWindow = useAppSelector(s => s.pnodes.historyWindow)

  const sparkData = useMemo(() => {
    const m: Record<string, { u: number }[]> = {}
    const last = uptimeHistory.slice(Math.max(0, uptimeHistory.length - historyWindow))
    for (const s of last) {
      for (const [id, v] of Object.entries(s.byId)) {
        if (!m[id]) m[id] = []
        m[id].push({ u: v })
      }
    }
    return m
  }, [uptimeHistory, historyWindow])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return items.filter(n => {
      const matchTerm = term
        ? (
            (n.id?.toLowerCase().includes(term)) ||
            (n.gossipAddress?.toLowerCase().includes(term)) ||
            (n.version?.toLowerCase().includes(term)) ||
            (n.region?.toLowerCase().includes(term))
          )
        : true
      const matchStatus = status ? n.status?.toLowerCase() === status.toLowerCase() : true
      const matchOnline = onlineOnly ? n.status?.toLowerCase() === 'online' : true
      return matchTerm && matchStatus && matchOnline
    })
  }, [items, q, status, onlineOnly])

  const sorted = useMemo(() => {
    const list = filtered.slice()
    if (!sortKey) return list
    const cmp = (a: typeof items[number], b: typeof items[number]) => {
      if (sortKey === 'observedUptimePercent') {
        const as = onlineStats[a.id]
        const bs = onlineStats[b.id]
        const av = as && as.obs > 0 ? Math.round(((as.up / as.obs) * 100) * 10) / 10 : undefined
        const bv = bs && bs.obs > 0 ? Math.round(((bs.up / bs.obs) * 100) * 10) / 10 : undefined
        if (av == null && bv == null) return 0
        if (av == null) return sortOrder === 'asc' ? 1 : -1
        if (bv == null) return sortOrder === 'asc' ? -1 : 1
        return sortOrder === 'asc' ? av - bv : bv - av
      }
      const av = (a as unknown as Record<string, unknown>)[sortKey] as unknown
      const bv = (b as unknown as Record<string, unknown>)[sortKey] as unknown
      if (av == null && bv == null) return 0
      if (av == null) return sortOrder === 'asc' ? 1 : -1
      if (bv == null) return sortOrder === 'asc' ? -1 : 1
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortOrder === 'asc' ? av - bv : bv - av
      }
      const as = String(av as string)
      const bs = String(bv as string)
      return sortOrder === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as)
    }
    return list.sort(cmp)
  }, [filtered, sortKey, sortOrder, onlineStats])

  if (error) {
    return <div className="alert alert-error">{error}</div>
  }

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
          <input
            type="text"
            placeholder="Search by ID, address, version, region"
            className="input input-bordered w-full md:w-1/2"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <select
            className="select select-bordered w-full md:w-48"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="unknown">Unknown</option>
          </select>
          <select
            className="select select-bordered w-full md:w-56"
            value={sortKey}
            onChange={e => setSortKey(e.target.value)}
          >
            <option value="">No sort</option>
            <option value="storageGb">Sort by Storage</option>
            <option value="cpuPercent">Sort by CPU</option>
            <option value="ramUsedGb">Sort by RAM Used</option>
            <option value="ramTotalGb">Sort by RAM Total</option>
            <option value="ramUsedPercent">Sort by RAM Used %</option>
            <option value="observedUptimePercent">Sort by Observed Uptime %</option>
            <option value="uptimeSeconds">Sort by Uptime</option>
            <option value="version">Sort by Version</option>
            <option value="id">Sort by ID</option>
          </select>
          <select
            className="select select-bordered w-full md:w-40"
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}
          >
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
          <label className="label cursor-pointer w-full md:w-auto justify-start gap-3">
            <span className="label-text">Online only</span>
            <input
              type="checkbox"
              className="checkbox"
              checked={onlineOnly}
              onChange={e => setOnlineOnly(e.target.checked)}
            />
          </label>
        </div>

        {loading ? (
          <div className="space-y-2">
            <div className="skeleton h-12"></div>
            <div className="skeleton h-12"></div>
            <div className="skeleton h-12"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-sm opacity-70">No pNodes found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Gossip Address</th>
                  <th>Status</th>
                  <th>Storage (GB)</th>
                  <th>CPU (%)</th>
                  <th>RAM Used (GB)</th>
                  <th>RAM Total (GB)</th>
                  <th>RAM Used (%)</th>
                  <th>Observed Uptime (%)</th>
                  <th>Uptime Trend</th>
                  <th>Uptime (h)</th>
                  <th>Version</th>
                  <th>Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(n => (
                  <tr key={n.id}>
                    <td className="font-mono text-sm">{n.id}</td>
                    <td className="font-mono text-sm">{n.gossipAddress}</td>
                    <td>
                      <span
                        className={
                          n.status?.toLowerCase() === 'online'
                            ? 'badge badge-success'
                            : n.status?.toLowerCase() === 'offline'
                            ? 'badge badge-error'
                            : 'badge'
                        }
                      >
                        {n.status}
                      </span>
                    </td>
                    <td>{n.storageGb ?? '-'}</td>
                    <td>{typeof n.cpuPercent === 'number' ? n.cpuPercent.toFixed(2) : '-'}</td>
                    <td>{typeof n.ramUsedGb === 'number' ? n.ramUsedGb.toFixed(1) : '-'}</td>
                    <td>{typeof n.ramTotalGb === 'number' ? n.ramTotalGb.toFixed(1) : '-'}</td>
                    <td>{typeof n.ramUsedPercent === 'number' ? n.ramUsedPercent.toFixed(1) : '-'}</td>
                    <td>
                      {(() => {
                        const s = onlineStats[n.id]
                        const pct = s && s.obs > 0 ? Math.round(((s.up / s.obs) * 100) * 10) / 10 : undefined
                        const cls = pct == null
                          ? 'badge'
                          : pct >= 95
                          ? 'badge badge-success'
                          : pct >= 80
                          ? 'badge badge-warning'
                          : 'badge badge-error'
                        return <span className={cls}>{pct != null ? pct.toFixed(1) : '-'}</span>
                      })()}
                    </td>
                    <td>
                      <LineChart width={120} height={28} data={sparkData[n.id] ?? []} margin={{ top: 2, right: 6, left: 6, bottom: 2 }}>
                        <XAxis hide />
                        <YAxis domain={[0, 100]} hide />
                        <Line type="monotone" dataKey="u" stroke="#14b8a6" dot={false} strokeWidth={2} />
                      </LineChart>
                    </td>
                    <td>{typeof n.uptimeSeconds === 'number' ? (Math.round((n.uptimeSeconds / 3600) * 10) / 10) : '-'}</td>
                    <td>{n.version ?? '-'}</td>
                    <td>{n.lastSeen ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
