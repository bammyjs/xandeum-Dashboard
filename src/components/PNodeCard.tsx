import { Cpu, HardDrive, MapPin, Gauge, Package, Clock, Activity, Timer, ExternalLink, Copy } from 'lucide-react'
import type { PNode } from '../types/PNode'
import type { ReactNode } from 'react'

type Props = {
  node: PNode
  uptimePct?: number
  locationText?: string
  variant?: 'compact' | 'detailed'
  loading?: boolean
}

function RowItem({ icon, label, children, valueClassName, labelClassName }: { icon?: ReactNode; label: ReactNode; children: ReactNode; valueClassName?: string; labelClassName?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`flex items-center gap-2 opacity-70 ${labelClassName ?? 'text-sm'}`}>{icon}{label}</span>
      <div className={valueClassName ?? 'text-sm'}>{children}</div>
    </div>
  )
}

export default function PNodeCard({ node, uptimePct, locationText, variant = 'compact', loading }: Props) {
  const statusClass = !loading
    ? (node.status?.toLowerCase() === 'online' ? 'badge badge-success' : node.status?.toLowerCase() === 'offline' ? 'badge badge-error' : 'badge')
    : 'badge'
  const title = `pNode-${typeof node.nodeIndex === 'number' ? node.nodeIndex : node.id}`
  return (
    <div className="card bg-base-100 shadow">
      <div className="card-body">
        <div className="flex items-center justify-between">
          {loading ? (
            <>
              <div className="skeleton h-5 w-28"></div>
              <div className="skeleton h-6 w-16 rounded-full"></div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-bold">{title}</h3>
              <span className={statusClass}>{node.status}</span>
            </>
          )}
        </div>
        <div className="divider my-2"></div>
        {variant === 'compact' ? (
          <div className="space-y-2">
            {loading ? (
              <>
                <div className="skeleton h-4 w-24"></div>
                <div className="skeleton h-4 w-20"></div>
                <div className="skeleton h-4 w-16"></div>
                <div className="skeleton h-4 w-32"></div>
              </>
            ) : (
              <>
                <RowItem icon={<HardDrive size={16} />} label="Storage">{typeof node.storageGb === 'number' ? `${node.storageGb.toFixed(1)} GB` : '-'}</RowItem>
                <RowItem icon={<Cpu size={16} />} label="Performance">{typeof node.cpuPercent === 'number' ? `${node.cpuPercent.toFixed(2)}%` : '-'}</RowItem>
                <RowItem icon={<Gauge size={16} />} label="Uptime">{uptimePct != null ? `${uptimePct.toFixed(1)}%` : '-'}</RowItem>
                <RowItem icon={<MapPin size={16} />} label="Location">{locationText ?? '-'}</RowItem>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {loading ? (
              <>
                <div className="skeleton h-4 w-24"></div>
                <div className="skeleton h-4 w-20"></div>
                <div className="skeleton h-4 w-16"></div>
                <div className="skeleton h-4 w-32"></div>
                <div className="skeleton h-4 w-28"></div>
                <div className="skeleton h-4 w-36"></div>
                <div className="skeleton h-4 w-24"></div>
                <div className="skeleton h-4 w-32"></div>
              </>
            ) : (
              <>
                <RowItem icon={<HardDrive size={16} />} label="Storage">{typeof node.storageGb === 'number' ? `${node.storageGb.toFixed(1)} GB` : '-'}</RowItem>
                <RowItem icon={<Cpu size={16} />} label="Performance">{typeof node.cpuPercent === 'number' ? `${node.cpuPercent.toFixed(2)}%` : '-'}</RowItem>
                <RowItem icon={<Gauge size={16} />} label="Uptime">{uptimePct != null ? `${uptimePct.toFixed(1)}%` : '-'}</RowItem>
                <RowItem icon={<MapPin size={16} />} label="Location">{locationText ?? '-'}</RowItem>
                <RowItem icon={<Activity size={16} />} label="Active Streams">{typeof node.activeStreams === 'number' ? node.activeStreams : '-'}</RowItem>
                <RowItem icon={<Activity size={16} />} label="Packets Rx/Tx">{typeof node.packetsReceived === 'number' || typeof node.packetsSent === 'number' ? `${node.packetsReceived ?? 0} / ${node.packetsSent ?? 0}` : '-'}</RowItem>
                <RowItem icon={<Activity size={16} />} label="RAM Used %">{typeof node.ramUsedPercent === 'number' ? `${node.ramUsedPercent.toFixed(1)}%` : '-'}</RowItem>
                <RowItem icon={<Timer size={16} />} label="Uptime Hours">{typeof node.uptimeSeconds === 'number' ? `${(Math.round((node.uptimeSeconds / 3600) * 10) / 10).toFixed(1)}h` : '-'}</RowItem>
              </>
            )}
          </div>
        )}
        <div className="divider my-2"></div>
        <div className="space-y-2">
          {loading ? (
            <>
              <div className="skeleton h-3 w-24"></div>
              <div className="skeleton h-3 w-20"></div>
              <div className="skeleton h-3 w-40"></div>
            </>
          ) : (
            <>
              <RowItem icon={<Clock size={14} />} label="Last Seen" labelClassName="text-xs" valueClassName="text-sm whitespace-nowrap">
                {node.lastSeen ?? '-'}
              </RowItem>
              <RowItem icon={<Package size={14} />} label="Version" labelClassName="text-xs" valueClassName="text-sm">
                {node.version ?? '-'}
              </RowItem>
              <RowItem label="Node ID" labelClassName="text-xs" valueClassName="font-mono text-sm break-all">
                {node.id}
              </RowItem>
            </>
          )}
        </div>
        {!loading && variant === 'detailed' && (
          <>
            <div className="divider my-2"></div>
            <div className="flex items-center gap-2">
              <a href={node.gossipAddress} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm"><ExternalLink size={14} /> Open</a>
              <button className="btn btn-outline btn-sm" onClick={() => navigator.clipboard?.writeText(node.gossipAddress)}><Copy size={14} /> Copy Address</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
