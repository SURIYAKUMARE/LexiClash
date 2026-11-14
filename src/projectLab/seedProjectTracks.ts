import { LabProjectTrack } from './types';

export const SEED_LAB_PROJECTS: LabProjectTrack[] = [
  // 1. Beginner Project 1
  {
    id: 'proj-task-queue',
    title: 'Distributed Background Task Queue & CLI Monitor',
    complexity: 'Beginner',
    estimatedHours: 15,
    domain: 'Systems & Backend',
    elevatorPitch: 'Build a lightweight, reliable asynchronous task queue with worker pools, retry logic, exponential backoff, and a terminal progress dashboard.',
    technologies: ['Node.js', 'TypeScript', 'Worker Threads', 'EventEmitter'],
    skillsTargeted: ['Node.js', 'JavaScript', 'Concurrency'],
    starterGithubTemplate: 'https://github.com/skillpath-ai/template-task-queue',
    milestones: [
      {
        id: 'm-tq-1',
        stepNumber: 1,
        title: 'Task Producer & Priority Queue Engine',
        deliverable: 'Implement priority min-heap queue with enqueue/dequeue operations.',
        acceptanceCriteria: [
          'Support high, normal, low task priorities.',
          'Prevent memory leaks during queue backlog spikes.'
        ]
      },
      {
        id: 'm-tq-2',
        stepNumber: 2,
        title: 'Worker Thread Pool & Error Retry Logic',
        deliverable: 'Spawn worker threads and execute tasks with exponential backoff on failure.',
        acceptanceCriteria: [
          'Configurable max retry attempts (default: 3).',
          'Dead-letter queue (DLQ) for permanently failed tasks.'
        ]
      },
      {
        id: 'm-tq-3',
        stepNumber: 3,
        title: 'CLI Dashboard & Telemetry Reporting',
        deliverable: 'Real-time terminal telemetry reporting throughput (tasks/sec) and error rates.',
        acceptanceCriteria: [
          'ANSI color-coded output.',
          'Graceful shutdown on SIGINT.'
        ]
      }
    ],
    rubricCriteria: [
      { id: 'c-arch', name: 'Architecture & Heap Design', maxScore: 25, description: 'Evaluation of priority queue data structure and memory management.' },
      { id: 'c-concur', name: 'Worker Concurrency & Backoff', maxScore: 25, description: 'Correctness of worker thread dispatching and exponential backoff.' },
      { id: 'c-test', name: 'Unit & Stress Testing', maxScore: 25, description: 'Passing automated tests verifying queue draining and DLQ routing.' },
      { id: 'c-doc', name: 'Documentation & CLI Usability', maxScore: 25, description: 'Clear README setup, architecture diagram, and clean CLI flags.' }
    ]
  },

  // 2. Beginner Project 2
  {
    id: 'proj-auth-microservice',
    title: 'Zero-Trust Authentication & RBAC Micro-Service',
    complexity: 'Beginner',
    estimatedHours: 18,
    domain: 'Security & Web APIs',
    elevatorPitch: 'Develop an enterprise-grade authentication service featuring salted PBKDF2 hashing, dual-token rotation (JWT + Refresh), and Role-Based Access Control.',
    technologies: ['Express', 'TypeScript', 'WebCrypto', 'JWT', 'SQLite'],
    skillsTargeted: ['Node.js', 'Cybersecurity', 'SQL / Databases'],
    starterGithubTemplate: 'https://github.com/skillpath-ai/template-auth-service',
    milestones: [
      {
        id: 'm-auth-1',
        stepNumber: 1,
        title: 'Cryptographic Credential Storage & Hashing',
        deliverable: 'Implement PBKDF2 or bcrypt password hashing with unique per-user salts.',
        acceptanceCriteria: [
          'Minimum 10,000 hash iterations.',
          'Zero plaintext password leakage in logs or exceptions.'
        ]
      },
      {
        id: 'm-auth-2',
        stepNumber: 2,
        title: 'Dual Token Rotation & Blacklist Invalidation',
        deliverable: 'Access token (15m expiry) and Refresh token rotation with reuse detection.',
        acceptanceCriteria: [
          'Revoke entire token family if refresh token reuse is detected.',
          'Secure HttpOnly cookie attributes.'
        ]
      },
      {
        id: 'm-auth-3',
        stepNumber: 3,
        title: 'RBAC Authorization Middleware & Rate Limiting',
        deliverable: 'Middleware enforcing granular permissions (read:reports, write:admin).',
        acceptanceCriteria: [
          'Rate limit failed login attempts (max 5 per minute per IP).',
          'Automated integration tests for 401/403 boundaries.'
        ]
      }
    ],
    rubricCriteria: [
      { id: 'c-crypto', name: 'Cryptographic Security', maxScore: 30, description: 'Verification of password hashing algorithms and secure token signing.' },
      { id: 'c-rbac', name: 'RBAC Enforcement', maxScore: 25, description: 'Robust middleware architecture preventing privilege escalation.' },
      { id: 'c-tests', name: 'Security Test Coverage', maxScore: 25, description: 'Tests covering expired tokens, invalid signatures, and brute-force lockouts.' },
      { id: 'c-docs', name: 'API Specifications', maxScore: 20, description: 'OpenAPI/Swagger specs and architectural rationale.' }
    ]
  },

  // 3. Intermediate Project 1
  {
    id: 'proj-event-inventory',
    title: 'High-Concurrency Event-Driven Inventory Engine',
    complexity: 'Intermediate',
    estimatedHours: 25,
    domain: 'Distributed Systems',
    elevatorPitch: 'Engineer a transactional stock reservation engine that handles flash-sale surges without overselling, utilizing PostgreSQL row-level locks and event streams.',
    technologies: ['PostgreSQL', 'Node.js', 'Redis', 'Docker'],
    skillsTargeted: ['SQL / Databases', 'Node.js', 'Backend'],
    starterGithubTemplate: 'https://github.com/skillpath-ai/template-inventory-engine',
    milestones: [
      {
        id: 'm-inv-1',
        stepNumber: 1,
        title: 'Relational Schema & Atomic Reservation Transactions',
        deliverable: 'Design normalized schema with ACID isolation and SELECT FOR UPDATE.',
        acceptanceCriteria: [
          'Enforce non-negative inventory constraints at the database level.',
          'Idempotent reservation tokens.'
        ]
      },
      {
        id: 'm-inv-2',
        stepNumber: 2,
        title: 'Distributed In-Memory Cache & Lock Coordination',
        deliverable: 'Integrate Redis caching for read-heavy inventory lookups with cache invalidation.',
        acceptanceCriteria: [
          'Sub-5ms read latency for stock checks.',
          'Zero race conditions under concurrent load test (100 simultaneous requests for 1 item).'
        ]
      },
      {
        id: 'm-inv-3',
        stepNumber: 3,
        title: 'Auto-Release Expired Reservations Worker',
        deliverable: 'Background cron job releasing stock if checkout is not completed in 10 minutes.',
        acceptanceCriteria: [
          'Releases reserved inventory cleanly back into available pool.',
          'Emits reservation_expired event.'
        ]
      }
    ],
    rubricCriteria: [
      { id: 'c-acid', name: 'ACID Concurrency & Invariants', maxScore: 30, description: 'Guarantees zero overselling under aggressive parallel simulation.' },
      { id: 'c-perf', name: 'Latency & Cache Hygiene', maxScore: 25, description: 'Efficient Redis caching and prompt invalidation.' },
      { id: 'c-bench', name: 'Load Benchmark Script', maxScore: 25, description: 'Automated test simulating high concurrency flash sales.' },
      { id: 'c-arch', name: 'Architecture & Diagrams', maxScore: 20, description: 'State machine diagram and entity relational schema documentation.' }
    ]
  },

  // 4. Intermediate Project 2
  {
    id: 'proj-offline-pwa',
    title: 'Offline-First Realtime Collaborative Kanban Board',
    complexity: 'Intermediate',
    estimatedHours: 28,
    domain: 'Frontend & Progressive Web Apps',
    elevatorPitch: 'Construct a zero-network-dependent Kanban board with local Dexie persistence, service worker precaching, drag-and-drop, and optimistic synchronization.',
    technologies: ['React', 'TypeScript', 'Dexie.js', 'Tailwind CSS', 'Service Workers'],
    skillsTargeted: ['React', 'JavaScript', 'Frontend'],
    starterGithubTemplate: 'https://github.com/skillpath-ai/template-offline-kanban',
    milestones: [
      {
        id: 'm-kanban-1',
        stepNumber: 1,
        title: 'IndexedDB State Machine & Drag-and-Drop Arena',
        deliverable: 'Board with To-Do, In-Progress, and Done columns persisted completely offline.',
        acceptanceCriteria: [
          'Smooth 60fps drag and drop reordering.',
          'IndexedDB transactional persistence.'
        ]
      },
      {
        id: 'm-kanban-2',
        stepNumber: 2,
        title: 'Service Worker Precaching & PWA Manifest',
        deliverable: 'Complete offline capability enabling full usage in Airplane Mode.',
        acceptanceCriteria: [
          'Lighthouse PWA score >= 90.',
          'Immediate offline fallback without broken icons or assets.'
        ]
      },
      {
        id: 'm-kanban-3',
        stepNumber: 3,
        title: 'Outbox Sync Queue & Conflict Resolution',
        deliverable: 'Background sync outbox recording changes and applying last-write-wins.',
        acceptanceCriteria: [
          'Visual sync indicator (Pending / Synced / Conflict).',
          'Automatic sync retry on network reconnection.'
        ]
      }
    ],
    rubricCriteria: [
      { id: 'c-pwa', name: 'PWA & Offline Resilience', maxScore: 30, description: 'Flawless execution with zero network access.' },
      { id: 'c-ui', name: 'UI/UX & Tactile Interaction', maxScore: 25, description: 'Google Stitch design compliance, smooth drag-and-drop animations.' },
      { id: 'c-sync', name: 'Sync Queue & Conflict Handling', maxScore: 25, description: 'Outbox pattern and reliable state rehydration.' },
      { id: 'c-code', name: 'Code Modularity & Cleanliness', maxScore: 20, description: 'Custom React hooks, clean component boundaries, and strict typing.' }
    ]
  },

  // 5. Advanced / Capstone Project 1
  {
    id: 'proj-cloud-mesh',
    title: 'Cloud Native Multi-Zone Microservices Infrastructure',
    complexity: 'Advanced',
    estimatedHours: 40,
    domain: 'Cloud Architecture & DevOps',
    elevatorPitch: 'Architect an enterprise multi-tier AWS infrastructure with VPC peering, Application Load Balancers, Auto Scaling Groups, and Prometheus metrics telemetry.',
    technologies: ['AWS Architecture', 'Terraform / CloudFormation', 'Docker', 'Prometheus'],
    skillsTargeted: ['Cloud Architecture', 'DevOps', 'Security'],
    starterGithubTemplate: 'https://github.com/skillpath-ai/template-cloud-mesh',
    milestones: [
      {
        id: 'm-mesh-1',
        stepNumber: 1,
        title: 'Isolated Network Topology & Security Perimeter',
        deliverable: 'Multi-AZ VPC with public web subnets, private app subnets, and NAT Gateways.',
        acceptanceCriteria: [
          'Strict security groups prohibiting open 0.0.0.0/0 SSH.',
          'Private database subnets isolated with zero internet routing.'
        ]
      },
      {
        id: 'm-mesh-2',
        stepNumber: 2,
        title: 'Auto-Scaling Compute & Health-Checked ALB',
        deliverable: 'Application Load Balancer distributing traffic with automated scaling policies.',
        acceptanceCriteria: [
          'Health check target group detecting node termination in < 15s.',
          'Auto-scaling triggered on CPU utilization > 70%.'
        ]
      },
      {
        id: 'm-mesh-3',
        stepNumber: 3,
        title: 'Observability Alarms & Disaster Recovery Drill',
        deliverable: 'CloudWatch/Prometheus metric alarms and simulated AZ failover recovery plan.',
        acceptanceCriteria: [
          'P99 latency alarm and synthetic traffic generator.',
          'Zero-downtime failover test.'
        ]
      }
    ],
    rubricCriteria: [
      { id: 'c-topo', name: 'Cloud Topology & CIS Compliance', maxScore: 30, description: 'VPC design satisfying CIS AWS Foundations Benchmark.' },
      { id: 'c-ha', name: 'High-Availability & Auto-Scaling', maxScore: 25, description: 'Seamless load balancing across multiple availability zones.' },
      { id: 'c-obs', name: 'Observability & Alarm Triggers', maxScore: 25, description: 'Actionable metrics dashboards and automated incident alerts.' },
      { id: 'c-spec', name: 'Infrastructure-as-Code Specs', maxScore: 20, description: 'Declarative IaC definitions with clean modular parameters.' }
    ]
  },

  // 6. Advanced / Capstone Project 2
  {
    id: 'proj-agent-recommender',
    title: 'Multi-Agent Autonomous Career Navigation Engine',
    complexity: 'Capstone',
    estimatedHours: 45,
    domain: 'AI Systems & Compilers',
    elevatorPitch: 'Build an autonomous multi-agent recommendation engine featuring structured message passing, conflict resolution, AST skill diagnosis, and explainable AI.',
    technologies: ['TypeScript', 'AST Parsers', 'Heuristic State Machines', 'Dexie.js'],
    skillsTargeted: ['AI Systems', 'Software Architecture', 'Data Modeling'],
    starterGithubTemplate: 'https://github.com/skillpath-ai/template-multi-agent-engine',
    milestones: [
      {
        id: 'm-agent-1',
        stepNumber: 1,
        title: 'Structured Inter-Agent Message Protocol',
        deliverable: 'Message bus with correlation IDs, intent routing, and hand-off event broadcasting.',
        acceptanceCriteria: [
          'Deterministic agent hand-offs (Profiler -> GapAnalyzer -> CurriculumStrategist).',
          'Telemetry log capturing inputs, outputs, and latencies.'
        ]
      },
      {
        id: 'm-agent-2',
        stepNumber: 2,
        title: 'Conflict Detection & Automatic Roadmap Rebalancing',
        deliverable: 'Engine detecting pacing, prerequisite, and competence score conflicts.',
        acceptanceCriteria: [
          'Resolves conflicts through explainable rule negotiation.',
          'Emits diff notifications for roadmap adjustments.'
        ]
      },
      {
        id: 'm-agent-3',
        stepNumber: 3,
        title: 'Verifiable Proof of Work Credential Issuer',
        deliverable: 'Cryptographically hashed portfolio credential issuer with verifiable IDs.',
        acceptanceCriteria: [
          'SHA-256 verification hash computation.',
          'Public shareable portfolio verification drawer.'
        ]
      }
    ],
    rubricCriteria: [
      { id: 'c-proto', name: 'Agent Protocol & Architecture', maxScore: 30, description: 'Loose coupling, typed message envelopes, and asynchronous event bus.' },
      { id: 'c-conf', name: 'Conflict Resolution Logic', maxScore: 25, description: 'Intelligent heuristic balancing of learner constraints vs requirements.' },
      { id: 'c-xai', name: 'Explainability & Transparency', maxScore: 25, description: 'Clear plain-English rationale for every curriculum modification.' },
      { id: 'c-prod', name: 'Production Packaging & Tests', maxScore: 20, description: 'Full unit test suite verifying agent message routing invariants.' }
    ]
  }
];
