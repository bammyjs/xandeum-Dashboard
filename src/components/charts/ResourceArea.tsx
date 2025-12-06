import { useMemo, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { PNode } from '../../types/PNode'

type Props = {
  nodes: PNode[]
}

export default function ResourceArea({ nodes }: Props) {
  const [mode, setMode] = useState<'cpu-ram' | 'ram-stack' | 'storage'>('cpu-ram')

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
    return nodes.map(n => ({
      name: n.id,
      storage: typeof n.storageGb === 'number' ? Number(n.storageGb.toFixed(2)) : 0
    }))
  }, [nodes, mode])

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <div className="card-title">
            {mode === 'cpu-ram' && 'CPU and RAM by Node'}
            {mode === 'ram-stack' && 'RAM Used vs Free'}
            {mode === 'storage' && 'Storage by Node'}
          </div>
          <select
            className="select select-bordered w-48"
            value={mode}
            onChange={e => setMode(e.target.value as typeof mode)}
          >
            <option value="cpu-ram">CPU & RAM</option>
            <option value="ram-stack">RAM Used vs Free</option>
            <option value="storage">Storage</option>
          </select>
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
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
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
