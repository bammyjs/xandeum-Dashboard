import { useMemo } from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { PNode } from '../../types/PNode'

type Props = {
  nodes: PNode[]
}

export default function StatusPie({ nodes }: Props) {
  const data = useMemo(() => {
    const online = nodes.filter(n => n.status?.toLowerCase() === 'online').length
    const offline = nodes.filter(n => n.status?.toLowerCase() === 'offline').length
    const unknown = nodes.length - online - offline
    return [
      { name: 'Online', value: online },
      { name: 'Offline', value: offline },
      { name: 'Unknown', value: unknown }
    ]
  }, [nodes])

  const colors = ['#22c55e', '#ef4444', '#64748b']

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <div className="card-title">pNode Status</div>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {data.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

