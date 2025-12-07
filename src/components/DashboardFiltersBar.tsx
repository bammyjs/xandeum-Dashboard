import { Filter } from 'lucide-react'

type SortKey = 'storage' | 'perf' | 'uptime' | ''
type ViewMode = 'cards' | 'list'
type CardVariant = 'compact' | 'detailed'

type Props = {
  q: string
  setQ: (v: string) => void
  status: string
  setStatus: (v: string) => void
  sortKey: SortKey
  setSortKey: (v: SortKey) => void
  sortOrder: 'asc' | 'desc'
  setSortOrder: (v: 'asc' | 'desc') => void
  viewMode: ViewMode
  setViewMode: (v: ViewMode) => void
  cardVariant: CardVariant
  setCardVariant: (v: CardVariant) => void
  onOpenMobileFilters: () => void
}

export default function DashboardFiltersBar({ q, setQ, status, setStatus, sortKey, setSortKey, sortOrder, setSortOrder, viewMode, setViewMode, cardVariant, setCardVariant, onOpenMobileFilters }: Props) {
  return (
    <div className="space-y-3 mt-4">
      <div className="flex items-center gap-4 justify-between">
        <div className="flex items-center gap-3 flex-1">
          <input type="text" placeholder="Search by name or node ID..." className="input input-bordered w-full" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <div className="flex items-center justify-between lg:hidden">
          <button className="btn btn-square btn-outline border-neutral-600 p-2" onClick={onOpenMobileFilters}><Filter size={24}  className='text-neutral-600'/></button>
        </div>
      </div>
      <div className="hidden lg:flex lg:flex-wrap items-center gap-2 my-6">
        <div className="flex items-center gap-2">
          <span className="opacity-70">Status</span>
          <select className="select select-sm w-36" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
            <option value="unknown">Unknown</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="opacity-70 whitespace-nowrap">Sort by</span>
          <select className="select select-bordered select-sm w-40" value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)}>
            <option value="storage">Storage</option>
            <option value="perf">Performance</option>
            <option value="uptime">Uptime</option>
          </select>
          <select className="select select-bordered select-sm w-28" value={sortOrder} onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}>
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          
          {viewMode === 'cards' && (
            <select className="select select-bordered select-sm" value={cardVariant} onChange={e => setCardVariant(e.target.value as CardVariant)}>
              <option value="compact">Compact</option>
              <option value="detailed">Detailed</option>
            </select>
          )}
          <label className="label cursor-pointer w-auto justify-start gap-3">
            <span className="label-text">{viewMode === 'list' ? 'Table view' : 'Card view'}</span>
            <input
              type="checkbox"
              className="toggle toggle-sm"
              checked={viewMode === 'list'}
              onChange={e => setViewMode(e.target.checked ? 'list' : 'cards')}
            />
          </label>
        </div>
      </div>
    </div>
  )
}

