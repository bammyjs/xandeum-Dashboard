const RPC_ENDPOINT = import.meta.env.VITE_PNODE_RPC_ENDPOINT ?? '/prpc'
const SEEDS = (import.meta.env.VITE_PNODE_SEEDS as string | undefined)?.split(',').map(s => s.trim()).filter(Boolean)
const RPC_METHOD = 'pn_gossip_getNodes'

async function jsonRpcCall(method: string, params?: unknown[]): Promise<unknown> {
  const body = {
    jsonrpc: '2.0',
    id: Date.now(),
    method,
    params: params ?? []
  }
  const res = await fetch(RPC_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!res.ok) throw new Error(`RPC ${res.status}`)
  const data: unknown = await res.json()
  const err = (data as Record<string, unknown>)['error'] as Record<string, unknown> | undefined
  if (err) throw new Error(String(err['message'] ?? 'RPC error'))
  return (data as Record<string, unknown>)['result']
}

async function jsonRpcCallAt(endpoint: string, method: string, params?: unknown[]): Promise<unknown> {
  const body = {
    jsonrpc: '2.0',
    id: Date.now(),
    method,
    params: params ?? []
  }
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!res.ok) throw new Error(`RPC ${res.status}`)
  const data: unknown = await res.json()
  const err = (data as Record<string, unknown>)['error'] as Record<string, unknown> | undefined
  if (err) throw new Error(String(err['message'] ?? 'RPC error'))
  return (data as Record<string, unknown>)['result']
}

export async function fetchPNodesFromGossip(): Promise<import('../types/PNode').PNode[]> {
  let result: unknown
  try {
    result = await jsonRpcCall(RPC_METHOD)
  } catch {
    const calls = SEEDS?.map(async ip => {
      const ep = `/pnode/${ip}`
      const [statsRes, verRes] = await Promise.allSettled([
        jsonRpcCallAt(ep, 'get-stats'),
        jsonRpcCallAt(ep, 'get-version')
      ])
      const verVal = verRes.status === 'fulfilled' ? verRes.value as unknown : undefined
      const verString = typeof verVal === 'string'
        ? verVal
        : (verVal && typeof (verVal as Record<string, unknown>)['version'] === 'string'
            ? ((verVal as Record<string, unknown>)['version'] as string)
            : undefined)
      if (statsRes.status === 'fulfilled') {
        const r = statsRes.value as Record<string, unknown>
        return Object.assign({}, r, { version: verString, __ip: ip })
      }
      if (verRes.status === 'fulfilled') {
        return { __ip: ip, version: verString }
      }
      return { __ip: ip, offline: true }
    })
    result = await Promise.all(calls ?? [])
  }
  const list = Array.isArray(result) ? result : [result]
  return (list as unknown[]).map(n => {
    const r = n as Record<string, unknown>
    const isStats = 'cpu_percent' in r || 'uptime' in r
    if (isStats) {
      const id = String((r['current_index'] ?? r['__ip'] ?? 'node') as number | string)
      const ip = r['__ip']
      const addr = typeof ip === 'string' ? `http://${ip}:6000` : String(import.meta.env.VITE_PNODE_RPC_ENDPOINT ?? '/prpc')
      const status = 'online'
      const fileSize = typeof r['file_size'] === 'number' ? (r['file_size'] as number) : undefined
      const storageGb = typeof fileSize === 'number' ? Math.round((fileSize / 1_000_000_000) * 10) / 10 : undefined
      const versionVal = r['version']
      const version = typeof versionVal === 'string' ? versionVal : undefined
      const lastUpdated = r['last_updated']
      const lastSeen = typeof lastUpdated === 'number' ? new Date(lastUpdated * 1000).toISOString() : undefined
      const cpuRaw = r['cpu_percent']
      const cpuPercent = typeof cpuRaw === 'number' ? Math.round(cpuRaw * 100) / 100 : undefined
      const ramUsed = r['ram_used']
      const ramTotal = r['ram_total']
      const ramUsedGb = typeof ramUsed === 'number' ? Math.round((ramUsed / 1_000_000_000) * 10) / 10 : undefined
      const ramTotalGb = typeof ramTotal === 'number' ? Math.round((ramTotal / 1_000_000_000) * 10) / 10 : undefined
      const uptime = r['uptime']
      const uptimeSeconds = typeof uptime === 'number' ? uptime : undefined
      return { id, gossipAddress: addr, status, storageGb, region: undefined, version, lastSeen, cpuPercent, ramUsedGb, ramTotalGb, uptimeSeconds }
    }
    const id = String((r['id'] ?? r['nodeId'] ?? r['__ip'] ?? '') as string)
    const ip = r['__ip']
    const addr = typeof ip === 'string' ? `http://${ip}:6000` : String((r['gossipAddress'] ?? r['addr'] ?? '') as string)
    const status = 'offline' in r ? 'offline' : String((r['status'] ?? 'unknown') as string)
    const storage = typeof r['storageGb'] === 'number' ? (r['storageGb'] as number) : undefined
    const region = typeof r['region'] === 'string' ? (r['region'] as string) : undefined
    const version = typeof r['version'] === 'string' ? (r['version'] as string) : undefined
    const lastSeen = typeof r['lastSeen'] === 'string' ? (r['lastSeen'] as string) : undefined
    return { id, gossipAddress: addr, status, storageGb: storage, region, version, lastSeen }
  })
}

export { jsonRpcCall }
