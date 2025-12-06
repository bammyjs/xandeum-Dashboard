import { useMemo, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { PNode } from '../../types/PNode'

type Props = {
  nodes: PNode[]
  uptimeHistory?: { ts: string; avgPct: number; byId: Record<string, number> }[]
  historyWindow?: number
}

export default function ResourceArea({ nodes, uptimeHistory, historyWindow }: Props) {
  const [mode, setMode] = useState<'cpu-ram' | 'ram-stack' | 'storage' | 'ram-percent' | 'uptime-trend'>('cpu-ram')
  const [selectedId, setSelectedId] = useState<string>('all')

  const data = useMemo(() => {
    if (mode === 'cpu-ram') {
      return nodes.map(n => ({
        name: n.id,
        cpu: typeof n.cpuPercent === 'number' ? Number(n.cpuPercent.toFixed(2)) : 0,
        ram: typeof n.ramUsedGb === 'number' ? Number(n.ramUsedGb.toFixed(2)) : 0
      }))
    }
    if (mode === 'ram-stack') {
      return nodes.map(n => {
        const used = typeof n.ramUsedGb === 'number' ? Number(n.ramUsedGb.toFixed(2)) : 0
        const total = typeof n.ramTotalGb === 'number' ? Number(n.ramTotalGb.toFixed(2)) : 0
        const free = total > used ? Number((total - used).toFixed(2)) : 0
        return { name: n.id, ramUsed: used, ramFree: free }
      })
    }
    if (mode === 'ram-percent') {
      return nodes.map(n => ({
        name: n.id,
        ramPct: typeof n.ramUsedPercent === 'number' ? Number(n.ramUsedPercent.toFixed(1)) : 0
      }))
    }
    if (mode === 'uptime-trend') {
      const histAll = uptimeHistory ?? []
      const hw = historyWindow ?? 30
      const hist = histAll.slice(Math.max(0, histAll.length - hw))
      return hist.map(s => ({
        name: new Date(s.ts).toLocaleTimeString(),
        uptime: selectedId === 'all' ? s.avgPct : (s.byId[selectedId] ?? 0)
      }))
    }
    return nodes.map(n => ({
      name: n.id,
      storage: typeof n.storageGb === 'number' ? Number(n.storageGb.toFixed(2)) : 0
    }))
  }, [nodes, mode, uptimeHistory, selectedId, historyWindow])

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <div className="card-title">
            {mode === 'cpu-ram' && 'CPU and RAM by Node'}
            {mode === 'ram-stack' && 'RAM Used vs Free'}
            {mode === 'ram-percent' && 'RAM Used % by Node'}
            {mode === 'uptime-trend' && (selectedId === 'all' ? 'Avg Uptime % Trend' : `Uptime % Trend: ${selectedId}`)}
            {mode === 'storage' && 'Storage by Node'}
          </div>
          <select
            className="select select-bordered w-48"
            value={mode}
            onChange={e => setMode(e.target.value as typeof mode)}
          >
            <option value="cpu-ram">CPU & RAM</option>
            <option value="ram-stack">RAM Used vs Free</option>
            <option value="ram-percent">RAM Used %</option>
            <option value="uptime-trend">Uptime % Trend</option>
            <option value="storage">Storage</option>
          </select>
          {mode === 'uptime-trend' && (
            <select className="select select-bordered w-56 ml-2" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
              <option value="all">All (Average)</option>
              {nodes.slice(0, 30).map(n => (
                <option key={n.id} value={n.id}>{n.id}</option>
              ))}
            </select>
          )}
        </div>
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="cpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="ram" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="storage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="ramPct" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="uptime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={mode === 'ram-percent' || mode === 'uptime-trend' ? [0, 100] : undefined} />
              <Tooltip />
              <Legend />
              {mode === 'cpu-ram' && (
                <>
                  <Area type="monotone" dataKey="cpu" stroke="#22c55e" fillOpacity={1} fill="url(#cpu)" name="CPU %" />
                  <Area type="monotone" dataKey="ram" stroke="#3b82f6" fillOpacity={1} fill="url(#ram)" name="RAM GB" />
                </>
              )}
              {mode === 'ram-stack' && (
                <>
                  <Area type="monotone" dataKey="ramUsed" stroke="#3b82f6" fillOpacity={1} fill="url(#ram)" name="RAM Used" stackId="ram" />
                  <Area type="monotone" dataKey="ramFree" stroke="#60a5fa" fillOpacity={0.9} fill="url(#ram)" name="RAM Free" stackId="ram" />
                </>
              )}
              {mode === 'ram-percent' && (
                <Area type="monotone" dataKey="ramPct" stroke="#f59e0b" fillOpacity={1} fill="url(#ramPct)" name="RAM Used %" />
              )}
              {mode === 'uptime-trend' && (
                <Area type="monotone" dataKey="uptime" stroke="#14b8a6" fillOpacity={1} fill="url(#uptime)" name={selectedId === 'all' ? 'Avg Uptime %' : 'Uptime %'} />
              )}
              {mode === 'storage' && (
                <Area type="monotone" dataKey="storage" stroke="#a855f7" fillOpacity={1} fill="url(#storage)" name="Storage GB" />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
