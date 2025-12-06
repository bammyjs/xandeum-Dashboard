import { useEffect, useMemo, useState } from 'react'
import PNodeCard from '../components/PNodeCard'
import { useAppDispatch, useAppSelector } from '../hooks'
import { fetchPNodes } from '../features/pnodes/pnodesSlice'
import PNodeTable from '../components/PNodeTable'
import OverviewStatsGrid from '../components/OverviewStatsGrid'
import MobileFiltersModal from '../components/MobileFiltersModal'
import { Filter } from 'lucide-react'

export default function Dashboard() {
  const dispatch = useAppDispatch()
  const nodes = useAppSelector(s => s.pnodes.items)
  const lastUpdated = useAppSelector(s => s.pnodes.lastUpdated)
  const onlineStats = useAppSelector(s => s.pnodes.onlineStats)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [sortKey, setSortKey] = useState<'stake' | 'perf' | 'uptime' | ''>('stake')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')
  const [cardVariant, setCardVariant] = useState<'compact' | 'detailed'>('detailed')
  const [geo, setGeo] = useState<Record<string, string>>({})
  const [filtersOpen, setFiltersOpen] = useState(false)
  type IpApiResp = { city?: string; country_code?: string }
  function ipFromAddr(addr?: string) {
    if (!addr) return undefined
    try {
      const u = new URL(addr)
      return u.hostname
    } catch {
      const m = addr.match(/(\d{1,3}(?:\.\d{1,3}){3})/)
      return m?.[1]
    }
  }
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    return nodes.filter(n => {
      const matchTerm = term
        ? (
            (n.id?.toLowerCase().includes(term)) ||
            (n.gossipAddress?.toLowerCase().includes(term)) ||
            (n.version?.toLowerCase().includes(term)) ||
            (n.region?.toLowerCase().includes(term))
          )
        : true
      const matchStatus = status ? n.status?.toLowerCase() === status.toLowerCase() : true
      return matchTerm && matchStatus
    })
  }, [nodes, q, status])
  const sorted = useMemo(() => {
    const list = filtered.slice()
    if (!sortKey) return list
    return list.sort((a, b) => {
      const au = onlineStats[a.id]
      const bu = onlineStats[b.id]
      const aUptime = au && au.obs > 0 ? Math.round(((au.up / au.obs) * 100) * 10) / 10 : -1
      const bUptime = bu && bu.obs > 0 ? Math.round(((bu.up / bu.obs) * 100) * 10) / 10 : -1
      const aPerf = typeof a.cpuPercent === 'number' ? a.cpuPercent : -1
      const bPerf = typeof b.cpuPercent === 'number' ? b.cpuPercent : -1
      const aStake = typeof a.storageGb === 'number' ? a.storageGb : -1
      const bStake = typeof b.storageGb === 'number' ? b.storageGb : -1
      const ax = sortKey === 'stake' ? aStake : sortKey === 'perf' ? aPerf : aUptime
      const bx = sortKey === 'stake' ? bStake : sortKey === 'perf' ? bPerf : bUptime
      if (ax < 0 && bx < 0) return 0
      if (ax < 0) return sortOrder === 'asc' ? 1 : -1
      if (bx < 0) return sortOrder === 'asc' ? -1 : 1
      return sortOrder === 'asc' ? ax - bx : bx - ax
    })
  }, [filtered, sortKey, sortOrder, onlineStats])
  useEffect(() => {
    const run = async () => {
      const tasks = sorted.slice(0, 20).map(async n => {
        if (geo[n.id]) return
        const ip = ipFromAddr(n.gossipAddress)
        if (!ip) return
        try {
          const res = await fetch(`https://ipwho.is/${ip}`, { headers: { Accept: 'application/json' } })
          if (!res.ok) return
          const d = await res.json() as IpApiResp
          const s = [d.city, d.country_code].filter(Boolean).join(', ')
          if (!s) return
          setGeo(g => ({ ...g, [n.id]: s }))
        } catch { void 0 }
      })
      await Promise.all(tasks)
    }
    run()
  }, [sorted, geo])
  useEffect(() => {
    dispatch(fetchPNodes())
  }, [dispatch])

  return (
    <div className="container mx-auto px-6 max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Overview</h1>
          <div className="text-sm opacity-70">{lastUpdated ? `Last updated ${new Date(lastUpdated).toLocaleString()}` : ''}</div>
        </div>
      </div>
              <OverviewStatsGrid nodes={nodes} />
              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-4 justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <input type="text" placeholder="Search by name or node ID..." className="input input-bordered w-full" value={q} onChange={e => setQ(e.target.value)} />
                </div>
                <div className="flex items-center justify-between lg:hidden">
                  <button className="btn btn-outline  p-2" onClick={() => setFiltersOpen(true)}><Filter size={24} /></button>
                </div>
                </div>
                <div className="hidden lg:flex lg:flex-wrap items-center gap-2 my-6">
                  <div className="flex items-center gap-2">
                    <span className="opacity-70">Status</span>
                    <select className="select select-bordered w-36" value={status} onChange={e => setStatus(e.target.value)}>
                      <option value="">All</option>
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="opacity-70 whitespace-nowrap">Sort by</span>
                    <select className="select select-bordered w-40" value={sortKey} onChange={e => setSortKey(e.target.value as typeof sortKey)}>
                      <option value="stake">Stake</option>
                      <option value="perf">Performance</option>
                      <option value="uptime">Uptime</option>
                    </select>
                    <select className="select select-bordered w-28" value={sortOrder} onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}>
                      <option value="asc">Asc</option>
                      <option value="desc">Desc</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 ml-auto">
                    <label className="label cursor-pointer w-auto justify-start gap-3">
                      <span className="label-text">Table view</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-sm"
                        checked={viewMode === 'list'}
                        onChange={e => setViewMode(e.target.checked ? 'list' : 'cards')}
                      />
                    </label>
                    {viewMode === 'cards' && (
                      <select className="select select-bordered select-sm" value={cardVariant} onChange={e => setCardVariant(e.target.value as 'compact' | 'detailed')}>
                        <option value="compact">Compact</option>
                        <option value="detailed">Detailed</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
          
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 ">
            {sorted.map(n => {
              const s = onlineStats[n.id]
              const uptimePct = s && s.obs > 0 ? Math.round(((s.up / s.obs) * 100) * 10) / 10 : undefined
              const locationText = geo[n.id] ?? n.region ?? undefined
              return (
                <PNodeCard key={`${n.id}-${n.gossipAddress}`} node={n} uptimePct={uptimePct} locationText={locationText} variant={cardVariant} />
              )
            })}
          </div>
        ) : (
          <PNodeTable locations={geo} nodes={sorted} />
        )}
        {/* Mobile Filters Modal */}
          <MobileFiltersModal
            open={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            q={q}
            setQ={setQ}
            status={status}
            setStatus={setStatus}
            sortKey={sortKey}
            setSortKey={setSortKey}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            viewMode={viewMode}
            setViewMode={setViewMode}
            cardVariant={cardVariant}
            setCardVariant={setCardVariant}
          />
      </div>
    )
  }
