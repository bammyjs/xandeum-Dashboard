import { useMemo } from 'react'
import { useAppSelector } from '../hooks'
import type { PNode } from '../types/PNode'

type Props = { locations?: Record<string, string>; nodes?: PNode[] }

export default function PNodeTable({ locations, nodes }: Props) {
  const { items, loading, error } = useAppSelector(s => s.pnodes)

  const data = useMemo(() => nodes ?? items, [nodes, items])

  if (error) {
    return <div className="alert alert-error">{error}</div>
  }

  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        {loading ? (
          <div className="overflow-x-auto ">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Storage (GB)</th>
                  <th>CPU (%)</th>
                  <th>RAM Used (GB)</th>
                  <th>RAM Total (GB)</th>
                  <th>RAM Used (%)</th>
                  <th>Uptime (h)</th>
                  <th>Active Streams</th>
                  <th>Packets Rx/Tx</th>
                  <th>Location</th>
                  <th>Version</th>
                  <th>Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i}>
                    <td><div className="skeleton h-4 w-32"></div></td>
                    <td><div className="skeleton h-4 w-16"></div></td>
                    <td><div className="skeleton h-4 w-20"></div></td>
                    <td><div className="skeleton h-4 w-16"></div></td>
                    <td><div className="skeleton h-4 w-20"></div></td>
                    <td><div className="skeleton h-4 w-20"></div></td>
                    <td><div className="skeleton h-4 w-16"></div></td>
                    <td><div className="skeleton h-4 w-20"></div></td>
                    <td><div className="skeleton h-4 w-16"></div></td>
                    <td><div className="skeleton h-4 w-28"></div></td>
                    <td><div className="skeleton h-4 w-32"></div></td>
                    <td><div className="skeleton h-4 w-20"></div></td>
                    <td><div className="skeleton h-4 w-28"></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : data.length === 0 ? (
          <div className="text-center text-sm opacity-70">No pNodes found</div>
        ) : (
          <div className="overflow-x-auto ">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Storage (GB)</th>
                  <th>CPU (%)</th>
                  <th>RAM Used (GB)</th>
                  <th>RAM Total (GB)</th>
                  <th>RAM Used (%)</th>
                  <th>Uptime (h)</th>
                  <th>Active Streams</th>
                  <th>Packets Rx/Tx</th>
                  <th>Location</th>
                  <th>Version</th>
                  <th>Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {data.map(n => (
                  <tr key={`${n.id}-${n.gossipAddress}`}>
                    <td className="font-mono text-sm">{n.id}</td>
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
                    <td>{typeof n.uptimeSeconds === 'number' ? (Math.round((n.uptimeSeconds / 3600) * 10) / 10) : '-'}</td>
                    <td>{typeof n.activeStreams === 'number' ? n.activeStreams : '-'}</td>
                    <td>{typeof n.packetsReceived === 'number' || typeof n.packetsSent === 'number' ? `${n.packetsReceived ?? 0} / ${n.packetsSent ?? 0}` : '-'}</td>
                    <td>{(locations && locations[n.id]) ?? n.region ?? '-'}</td>
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
