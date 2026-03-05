import type { GraphCommit, LaneConn } from '@/types'

// CSS color tokens (work inline in SVG via style prop)
const P = 'hsl(var(--primary))'   // neon mint / deep blue
const W = 'hsl(var(--warning))'   // amber  – fix/memory-leak
const A = 'hsl(var(--accent))'    // blue   – feat/auth
const S = 'hsl(var(--success))'   // green  – feat/observability

const p0: LaneConn = { lane: 0, color: P }
const p1w: LaneConn = { lane: 1, color: W }
const p1a: LaneConn = { lane: 1, color: A }
const p1s: LaneConn = { lane: 1, color: S }

/*
 Graph layout (top = newest, bottom = oldest):

  Row  Hash     Lane  Branch
  ───────────────────────────────────────────────────────
   0   a3f9d21   0   HEAD → feat/circuit-breaker
   1   f1c8a23   0   feat/circuit-breaker
   2   c9d5e71   0   feat/circuit-breaker  ← branch fix/memory-leak starts
   3   e8f1234   1   fix/memory-leak (newer)
   4   c1a5f83   1   fix/memory-leak (older)
   5   b7e2c48   0   main / origin/main    ← fix merges back
   6   d4e9a12   0   main                  ← feat/auth branches off
   7   39a2c17   1   feat/auth (newer)
   8   7b3d891   1   feat/auth (older)
   9   e7f2b45   0   main                  ← auth merges back
  10   f9a1d68   0   main (merge commit)   ← observability branches off
  11   a2c7e91   1   feat/observability (newer)
  12   b4c9d13   1   feat/observability (older)
  13   1d8e3f9   0   main                  ← obs merges back
  14   2a7f4c1   0   main (oldest)
*/

export const mockGraphCommits: GraphCommit[] = [
  {
    hash: 'a3f9d21e8b4c7f2a1d6e9b3c',
    shortHash: 'a3f9d21',
    message: 'feat: add exponential backoff to circuit breaker',
    author: 'Alex Chen',
    authorEmail: 'alex@company.io',
    date: new Date(Date.now() - 1000 * 60 * 12),
    parents: ['f1c8a23d'],
    refs: ['HEAD', 'feat/circuit-breaker'],
    lane: 0, color: P,
    topLanes: [],
    bottomLanes: [p0],
    isMergeCommit: false,
    changedFiles: [
      { path: 'internal/breaker/circuit.go', status: 'modified', additions: 124, deletions: 18 },
      { path: 'internal/breaker/backoff.go', status: 'added', additions: 67, deletions: 0 },
      { path: 'internal/breaker/circuit_test.go', status: 'modified', additions: 89, deletions: 12 },
    ],
  },
  {
    hash: 'f1c8a23d9e7b4f5c2a8d1e6b',
    shortHash: 'f1c8a23',
    message: 'feat: implement half-open state transitions',
    author: 'Alex Chen',
    authorEmail: 'alex@company.io',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2),
    parents: ['c9d5e71a'],
    refs: [],
    lane: 0, color: P,
    topLanes: [p0],
    bottomLanes: [p0],
    changedFiles: [
      { path: 'internal/breaker/circuit.go', status: 'modified', additions: 58, deletions: 6 },
      { path: 'internal/breaker/states.go', status: 'added', additions: 34, deletions: 0 },
    ],
  },
  {
    hash: 'c9d5e71a2b8f3c6d1e9a4b7c',
    shortHash: 'c9d5e71',
    message: 'feat: add circuit breaker state machine skeleton',
    author: 'Alex Chen',
    authorEmail: 'alex@company.io',
    date: new Date(Date.now() - 1000 * 60 * 60 * 5),
    parents: ['b7e2c48f'],
    refs: [],
    lane: 0, color: P,
    topLanes: [p0],
    bottomLanes: [p0, p1w],   // lane 1 (W) branches off here
    changedFiles: [
      { path: 'internal/breaker/circuit.go', status: 'added', additions: 112, deletions: 0 },
      { path: 'internal/breaker/errors.go', status: 'added', additions: 14, deletions: 0 },
      { path: 'go.mod', status: 'modified', additions: 2, deletions: 0 },
    ],
  },
  {
    hash: 'e8f1234a9b7c3d5e2f1a8b4c',
    shortHash: 'e8f1234',
    message: 'fix: resolve goroutine leak in HTTP connection pool',
    author: 'Jordan Kim',
    authorEmail: 'jordan@company.io',
    date: new Date(Date.now() - 1000 * 60 * 60 * 6),
    parents: ['c1a5f83b'],
    refs: ['fix/memory-leak'],
    lane: 1, color: W,
    topLanes: [p0, p1w],
    bottomLanes: [p0, p1w],
    changedFiles: [
      { path: 'internal/transport/pool.go', status: 'modified', additions: 31, deletions: 19 },
      { path: 'internal/transport/pool_test.go', status: 'modified', additions: 44, deletions: 7 },
    ],
  },
  {
    hash: 'c1a5f83b7e2d9f4a1c6b3e8d',
    shortHash: 'c1a5f83',
    message: 'fix: track goroutines in pool with sync.WaitGroup',
    author: 'Jordan Kim',
    authorEmail: 'jordan@company.io',
    date: new Date(Date.now() - 1000 * 60 * 60 * 7),
    parents: ['b7e2c48f'],
    refs: [],
    lane: 1, color: W,
    topLanes: [p0, p1w],
    bottomLanes: [p0, p1w],
    changedFiles: [
      { path: 'internal/transport/pool.go', status: 'modified', additions: 18, deletions: 4 },
    ],
  },
  {
    hash: 'b7e2c48f1a3d9e7b2c5f8a4d',
    shortHash: 'b7e2c48',
    message: 'chore: bump go.mod to latest stable dependencies',
    author: 'Maya Patel',
    authorEmail: 'maya@company.io',
    date: new Date(Date.now() - 1000 * 60 * 60 * 8),
    parents: ['d4e9a12b'],
    refs: ['main', 'origin/main'],
    lane: 0, color: P,
    topLanes: [p0, p1w],   // lane 1 (W) merges back here
    bottomLanes: [p0],
    changedFiles: [
      { path: 'go.mod', status: 'modified', additions: 12, deletions: 12 },
      { path: 'go.sum', status: 'modified', additions: 48, deletions: 48 },
    ],
  },
  {
    hash: 'd4e9a12b3c7f5e8a1b6d2c9f',
    shortHash: 'd4e9a12',
    message: 'fix: resolve race condition in request deduplication cache',
    author: 'Sam Rivera',
    authorEmail: 'sam@company.io',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24),
    parents: ['39a2c17e'],
    refs: [],
    lane: 0, color: P,
    topLanes: [p0],
    bottomLanes: [p0, p1a],   // lane 1 (A) branches off: feat/auth
    changedFiles: [
      { path: 'internal/dedup/cache.go', status: 'modified', additions: 22, deletions: 8 },
      { path: 'internal/dedup/cache_test.go', status: 'modified', additions: 35, deletions: 2 },
    ],
  },
  {
    hash: '39a2c17e4b8f1d6a3c9e2b7f',
    shortHash: '39a2c17',
    message: 'feat: add JWT validation middleware with JWKS caching',
    author: 'Maya Patel',
    authorEmail: 'maya@company.io',
    date: new Date(Date.now() - 1000 * 60 * 60 * 28),
    parents: ['7b3d891c'],
    refs: ['feat/auth'],
    lane: 1, color: A,
    topLanes: [p0, p1a],
    bottomLanes: [p0, p1a],
    changedFiles: [
      { path: 'middleware/auth.go', status: 'added', additions: 178, deletions: 0 },
      { path: 'middleware/auth_test.go', status: 'added', additions: 92, deletions: 0 },
      { path: 'config/auth.yaml', status: 'added', additions: 18, deletions: 0 },
    ],
  },
  {
    hash: '7b3d891c2a6f4e9b1d8c5a3f',
    shortHash: '7b3d891',
    message: 'feat: implement refresh token rotation with Redis store',
    author: 'Maya Patel',
    authorEmail: 'maya@company.io',
    date: new Date(Date.now() - 1000 * 60 * 60 * 30),
    parents: ['e7f2b45a'],
    refs: [],
    lane: 1, color: A,
    topLanes: [p0, p1a],
    bottomLanes: [p0, p1a],
    changedFiles: [
      { path: 'middleware/tokens.go', status: 'added', additions: 134, deletions: 0 },
      { path: 'internal/store/redis.go', status: 'modified', additions: 45, deletions: 3 },
    ],
  },
  {
    hash: 'e7f2b45a9d3c1e8b6f4a2d7c',
    shortHash: 'e7f2b45',
    message: 'perf: optimize hot path in request routing with trie',
    author: 'Sam Rivera',
    authorEmail: 'sam@company.io',
    date: new Date(Date.now() - 1000 * 60 * 60 * 36),
    parents: ['f9a1d68b'],
    refs: [],
    lane: 0, color: P,
    topLanes: [p0, p1a],   // lane 1 (A) merges back
    bottomLanes: [p0],
    changedFiles: [
      { path: 'internal/router/trie.go', status: 'added', additions: 201, deletions: 0 },
      { path: 'internal/router/router.go', status: 'modified', additions: 38, deletions: 72 },
      { path: 'internal/router/router_bench_test.go', status: 'added', additions: 56, deletions: 0 },
    ],
  },
  {
    hash: 'f9a1d68b7e4c2a9f3b5d8e1c',
    shortHash: 'f9a1d68',
    message: 'Merge pull request #42: feat/observability into main',
    author: 'Alex Chen',
    authorEmail: 'alex@company.io',
    date: new Date(Date.now() - 1000 * 60 * 60 * 48),
    parents: ['a2c7e91d', 'b4c9d13f'],
    refs: [],
    lane: 0, color: P,
    topLanes: [p0],
    bottomLanes: [p0, p1s],   // lane 1 (S) branches off: feat/observability
    isMergeCommit: true,
    changedFiles: [],
  },
  {
    hash: 'a2c7e91d3b6f9e4c1a8d5b2f',
    shortHash: 'a2c7e91',
    message: 'feat: add OpenTelemetry distributed tracing support',
    author: 'Jordan Kim',
    authorEmail: 'jordan@company.io',
    date: new Date(Date.now() - 1000 * 60 * 60 * 52),
    parents: ['b4c9d13f'],
    refs: ['feat/observability'],
    lane: 1, color: S,
    topLanes: [p0, p1s],
    bottomLanes: [p0, p1s],
    changedFiles: [
      { path: 'observability/tracer.go', status: 'added', additions: 156, deletions: 0 },
      { path: 'observability/middleware.go', status: 'added', additions: 88, deletions: 0 },
      { path: 'go.mod', status: 'modified', additions: 4, deletions: 0 },
    ],
  },
  {
    hash: 'b4c9d13f8a2e7b5c1d4f9a3e',
    shortHash: 'b4c9d13',
    message: 'feat: instrument HTTP handlers with Prometheus metrics',
    author: 'Jordan Kim',
    authorEmail: 'jordan@company.io',
    date: new Date(Date.now() - 1000 * 60 * 60 * 55),
    parents: ['1d8e3f9a'],
    refs: [],
    lane: 1, color: S,
    topLanes: [p0, p1s],
    bottomLanes: [p0, p1s],
    changedFiles: [
      { path: 'observability/metrics.go', status: 'added', additions: 112, deletions: 0 },
      { path: 'internal/server/server.go', status: 'modified', additions: 24, deletions: 1 },
    ],
  },
  {
    hash: '1d8e3f9a4b7c2e6d9f1a5c8b',
    shortHash: '1d8e3f9',
    message: 'docs: update ADR-003 for new observability architecture',
    author: 'Maya Patel',
    authorEmail: 'maya@company.io',
    date: new Date(Date.now() - 1000 * 60 * 60 * 60),
    parents: ['2a7f4c1d'],
    refs: [],
    lane: 0, color: P,
    topLanes: [p0, p1s],   // lane 1 (S) merges back
    bottomLanes: [p0],
    changedFiles: [
      { path: 'docs/adr/003-observability.md', status: 'added', additions: 87, deletions: 0 },
      { path: 'docs/README.md', status: 'modified', additions: 3, deletions: 1 },
    ],
  },
  {
    hash: '2a7f4c1d8e3b9f5a2c7d1e4b',
    shortHash: '2a7f4c1',
    message: 'chore: update CI pipeline to use BuildKit cache mounts',
    author: 'Sam Rivera',
    authorEmail: 'sam@company.io',
    date: new Date(Date.now() - 1000 * 60 * 60 * 72),
    parents: [],
    refs: ['origin/main~14'],
    lane: 0, color: P,
    topLanes: [p0],
    bottomLanes: [],   // last commit
    changedFiles: [
      { path: '.github/workflows/ci.yaml', status: 'modified', additions: 28, deletions: 14 },
      { path: 'Dockerfile', status: 'modified', additions: 6, deletions: 4 },
    ],
  },
]
