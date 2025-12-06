export interface PNode {
  id: string
  gossipAddress: string
  status: string
  storageGb?: number
  region?: string
  version?: string
  lastSeen?: string
  cpuPercent?: number
  ramUsedGb?: number
  ramTotalGb?: number
  ramUsedPercent?: number
  uptimeSeconds?: number
}
