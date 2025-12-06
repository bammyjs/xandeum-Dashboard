# Xandeum pNode Dashboard

Interactive dashboard for public pNodes. Built with React, TypeScript, Redux Toolkit, Vite, Tailwind + DaisyUI, and Recharts.

## Features

- Aggregates node stats via JSON‑RPC and a seed list
- Dev proxy to avoid CORS when talking to pNodes
- Table with search, status filter, sorting, and "Online only" toggle
- Charts: status pie and configurable area chart (CPU/RAM, RAM stacked, Storage)

## Prerequisites

- Node.js LTS
- A browser with dev tools

## Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Create `.env` at the project root and set seeds as a comma‑separated list (no brackets):

   ```env
   VITE_PNODE_SEEDS=173.212.203.145,173.212.220.65,161.97.97.41,192.190.136.36,192.190.136.37,192.190.136.38,192.190.136.28,192.190.136.29,207.244.255.1
   VITE_PNODE_RPC_ENDPOINT=/prpc
   ```

   Notes:
   - `.env` must be in the project root for Vite to load it.
   - `VITE_PNODE_SEEDS` must be CSV, not JSON; do not wrap in `[]`.
   - `VITE_PNODE_RPC_ENDPOINT` should be `/prpc` in development to use the dev proxy.

## Development

- Start dev server:

  ```sh
  npm run dev
  ```

- Open the app and use the navbar "Refresh" to re‑fetch nodes.
- Dev proxy routes:
  - `/prpc` → proxied to the first seed at `/rpc`
  - `/pnode/<ip>` → proxied to `http://<ip>:6000/rpc`

## Usage

- Dashboard stats show total, online count, and average storage.
- Status Pie summarizes Online/Offline/Unknown nodes.
- Area Chart supports three modes via the dropdown:
  - CPU & RAM (% and GB)
  - RAM Used vs Free (stacked)
  - Storage (GB)
- Table supports search, status filter, sorting, and an "Online only" checkbox.

## Production Build

1. Build:

   ```sh
   npm run build
   ```

2. Preview locally:

   ```sh
   npm run preview
   ```

3. Host the `dist` folder on any static hosting.

### Reverse Proxy (production)

In production, the browser cannot call pNodes directly due to CORS. Configure a reverse proxy to forward dashboard paths to pNodes. Example Nginx:

```nginx
server {
  listen 80;
  server_name dashboard.example.com;

  root /var/www/xandeum-dashboard/dist;
  location / {
    try_files $uri /index.html;
  }

  location /prpc {
    proxy_pass http://173.212.203.145:6000/rpc;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  location ~ ^/pnode/(.*)$ {
    set $ip $1;
    proxy_pass http://$ip:6000/rpc;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

Adjust the IPs and domain as needed. Ensure only trusted IPs are allowed if you restrict access.

## Troubleshooting

- Failed to parse URL: Ensure `VITE_PNODE_RPC_ENDPOINT=/prpc` and do not use placeholders like `http://<pnode-ip>:6000/rpc`.
- Method not found (`-32601`): The app falls back to seed aggregation using `get-stats`/`get-version`.
- 500 from a node: That node is responding with an error; it will appear as offline. Use "Online only" to hide it.
- Seeds not applied: `.env` must be at the project root and seeds must be comma separated.

## Scripts

- `npm run dev` – start dev server
- `npm run build` – typecheck and build production bundle
- `npm run preview` – preview built site
- `npm run lint` – run ESLint
