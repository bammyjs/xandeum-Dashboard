import { } from 'react'

type SortKey = 'stake' | 'perf' | 'uptime' | ''
type ViewMode = 'cards' | 'list'
type CardVariant = 'compact' | 'detailed'

type Props = {
  open: boolean
  onClose: () => void
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
}

export default function MobileFiltersModal({ open, onClose, q, setQ, status, setStatus, sortKey, setSortKey, sortOrder, setSortOrder, viewMode, setViewMode, cardVariant, setCardVariant }: Props) {
  return (
    <dialog className="modal modal-bottom lg:hidden" open={open}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">Filters</h3>
        <div className="space-y-4 mt-3">
          <input type="text" placeholder="Search by name or node ID..." className="input input-bordered w-full" value={q} onChange={e => setQ(e.target.value)} />
          <div className="flex items-center gap-3">
            <span className="opacity-70">Status</span>
            <select className="select select-bordered w-36" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">All</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <span className="opacity-70">Sort by</span>
            <select className="select select-bordered w-40" value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)}>
              <option value="stake">Stake</option>
              <option value="perf">Performance</option>
              <option value="uptime">Uptime</option>
            </select>
            <select className="select select-bordered w-28" value={sortOrder} onChange={e => setSortOrder(e.target.value as 'asc' | 'desc')}>
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
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
              <select className="select select-bordered select-sm" value={cardVariant} onChange={e => setCardVariant(e.target.value as CardVariant)}>
                <option value="compact">Compact</option>
                <option value="detailed">Detailed</option>
              </select>
            )}
          </div>
        </div>
        <div className="modal-action">
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>Close</button>
      </form>
    </dialog>
  )
}
