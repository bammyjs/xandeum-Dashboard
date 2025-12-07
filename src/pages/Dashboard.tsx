import { useEffect, useMemo, useState } from 'react'
import type { PNode } from '@src/types/PNode'
import PNodeCard from '@components/PNodeCard'
import { useAppDispatch, useAppSelector } from '../hooks'
import { fetchPNodes } from '@src/features/pnodes/pnodesSlice'
import PNodeTable from '@components/PNodeTable'
import MobileFiltersModal from '@components/MobileFiltersModal'
import DashboardFiltersBar from '@components/DashboardFiltersBar'

export default function Dashboard() {
  const dispatch = useAppDispatch()
  const nodes = useAppSelector(s => s.pnodes.items)
  const lastUpdated = useAppSelector(s => s.pnodes.lastUpdated)
  const onlineStats = useAppSelector(s => s.pnodes.onlineStats)
  const loading = useAppSelector(s => s.pnodes.loading)
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('')
  const [sortKey, setSortKey] = useState<'storage' | 'perf' | 'uptime' | ''>('storage')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards')
  const [cardVariant, setCardVariant] = useState<'compact' | 'detailed'>('compact')
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
      const aStorage = typeof a.storageGb === 'number' ? a.storageGb : -1
      const bStorage = typeof b.storageGb === 'number' ? b.storageGb : -1
      const ax = sortKey === 'storage' ? aStorage : sortKey === 'perf' ? aPerf : aUptime
      const bx = sortKey === 'storage' ? bStorage : sortKey === 'perf' ? bPerf : bUptime
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
    <div className="container mx-auto p-4 max-w-6xl">
          <div className="text-sm opacity-70">{lastUpdated ? `Last updated ${new Date(lastUpdated).toLocaleString()}` : ''}</div>
              {/* <OverviewStatsGrid nodes={nodes} loading={loading} /> */}
              <DashboardFiltersBar
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
                onOpenMobileFilters={() => setFiltersOpen(true)}
              />
          
        {viewMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 ">
            {(loading ? Array.from({ length: 9 }) : sorted).map((n, i) => {
              if (loading) {
                const sk: PNode = { id: `sk-${i}`, gossipAddress: '#', status: 'unknown' }
                return (
                  <PNodeCard key={`sk-${i}`} node={sk} variant={cardVariant} loading />
                )
              }
              const s = onlineStats[(n as typeof sorted[number]).id]
              const uptimePct = s && s.obs > 0 ? Math.round(((s.up / s.obs) * 100) * 10) / 10 : undefined
              const locationText = geo[(n as typeof sorted[number]).id] ?? (n as typeof sorted[number]).region ?? undefined
              return (
                <PNodeCard key={`${(n as typeof sorted[number]).id}-${(n as typeof sorted[number]).gossipAddress}`} node={n as typeof sorted[number]} uptimePct={uptimePct} locationText={locationText} variant={cardVariant} />
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
