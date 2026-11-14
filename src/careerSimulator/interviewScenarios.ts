import { RoleInterviewTrack } from './types';

export const SEED_INTERVIEW_TRACKS: RoleInterviewTrack[] = [
  // 1. Full Stack Developer Track
  {
    roleId: 'role-fullstack',
    roleTitle: 'Full Stack Developer',
    difficulty: 'Mid',
    targetReadinessScore: 80,
    questions: [
      {
        id: 'fs-q1',
        stage: 'foundations',
        stageName: 'Stage 1: Core Runtime & Invariants',
        question: 'Explain the JavaScript event loop, microtask queue vs macrotask queue, and how Node.js handles high-concurrency non-blocking I/O.',
        scenarioContext: 'An interviewer asks how your backend handles 10,000 concurrent API requests without spawning 10,000 OS threads.',
        expectedKeywords: ['event loop', 'libuv', 'microtask', 'macrotask', 'promise', 'callback', 'non-blocking', 'thread pool'],
        evaluationCriteria: [
          { criterion: 'Event Loop Mechanics', weight: 40, description: 'Correctly identifies single-threaded execution and libuv thread pool.' },
          { criterion: 'Microtask vs Macrotask Prioritization', weight: 35, description: 'Explains Promises (microtasks) drain before timer/I/O callbacks (macrotasks).' },
          { criterion: 'Real-World Concurrency Awareness', weight: 25, description: 'Understands how non-blocking OS epoll/kqueue handles high concurrent connections.' }
        ],
        sampleGoodAnswerSnippet: 'Node.js runs JavaScript on a single thread using the libuv event loop. When I/O operations occur, they are delegated to the OS kernel or the libuv worker pool...'
      },
      {
        id: 'fs-q2',
        stage: 'architecture',
        stageName: 'Stage 2: Code Architecture & Concurrency',
        question: 'How do you prevent double-spending or race conditions in an e-commerce inventory checkout system when multiple users buy the last available item simultaneously?',
        scenarioContext: 'Two users click "Checkout" at the exact same millisecond for 1 remaining item in stock.',
        expectedKeywords: ['optimistic locking', 'pessimistic locking', 'transaction', 'acid', 'select for update', 'version column', 'isolation level', 'atomic'],
        evaluationCriteria: [
          { criterion: 'Concurrency Control Strategy', weight: 40, description: 'Presents Optimistic Concurrency Control (OCC) with version counter or SELECT ... FOR UPDATE.' },
          { criterion: 'Database Invariants & ACID', weight: 35, description: 'Ensures database transaction isolation and atomic balance updates.' },
          { criterion: 'Distributed Locking & Caching', weight: 25, description: 'Mentions Redis Redlock or distributed lock for ultra-high throughput environments.' }
        ],
        sampleGoodAnswerSnippet: 'To prevent inventory race conditions, we can use an ACID database transaction combined with Optimistic Concurrency Control using a version column, or pessimistic locking (SELECT FOR UPDATE)...'
      },
      {
        id: 'fs-q3',
        stage: 'system_design',
        stageName: 'Stage 3: Resilient System Design',
        question: 'Design a resilient rate limiter for a public API that protects backend services from being overwhelmed during traffic spikes.',
        scenarioContext: 'Public clients must be restricted to 100 requests per minute per IP or API key, with graceful degradation and fast response times.',
        expectedKeywords: ['token bucket', 'leaky bucket', 'sliding window', 'redis', 'middleware', '429 too many requests', 'headers', 'cluster'],
        evaluationCriteria: [
          { criterion: 'Algorithm Choice & Trade-offs', weight: 40, description: 'Selects Token Bucket or Sliding Window Log and explains memory vs precision trade-offs.' },
          { criterion: 'Distributed Storage & Latency', weight: 35, description: 'Uses Redis with Lua scripts for atomic increments and minimal overhead.' },
          { criterion: 'HTTP Standard Compliance', weight: 25, description: 'Returns HTTP 429 with Retry-After and X-RateLimit headers.' }
        ],
        sampleGoodAnswerSnippet: 'I would implement a Token Bucket or Sliding Window Counter algorithm using Redis and an atomic Lua script...'
      },
      {
        id: 'fs-q4',
        stage: 'behavioral',
        stageName: 'Stage 4: Incident Ownership & Post-Mortem',
        question: 'Tell me about a time you deployed a breaking bug to production. What was your immediate response, how did you communicate with stakeholders, and what root-cause mitigations did you put in place?',
        scenarioContext: 'Assessing engineering maturity, blame-free post-mortem culture, and preventative CI/CD improvements.',
        expectedKeywords: ['rollback', 'telemetry', 'post-mortem', 'blameless', 'root cause', 'monitoring', 'canary', 'automated tests'],
        evaluationCriteria: [
          { criterion: 'Immediate Incident Containment', weight: 40, description: 'Prioritized rapid rollback or feature flag disablement over panic debugging in prod.' },
          { criterion: 'Transparent Stakeholder Communication', weight: 30, description: 'Provided clear incident status updates to customer support and leadership.' },
          { criterion: 'Systemic Long-term Prevention', weight: 30, description: 'Conducted a blameless post-mortem and added automated tests/alerts.' }
        ],
        sampleGoodAnswerSnippet: 'My first priority was mitigating user impact by rolling back the release within 3 minutes using our automated blue/green deployment...'
      }
    ]
  },

  // 2. DevOps & Cloud SRE Track
  {
    roleId: 'role-devops',
    roleTitle: 'DevOps & SRE Engineer',
    difficulty: 'Senior',
    targetReadinessScore: 85,
    questions: [
      {
        id: 'devops-q1',
        stage: 'foundations',
        stageName: 'Stage 1: Container & Networking Invariants',
        question: 'How do Linux cgroups, namespaces, and overlay filesystems enable Docker container isolation, and how do you enforce non-root execution?',
        scenarioContext: 'Hardening Kubernetes pods against privilege escalation attacks.',
        expectedKeywords: ['cgroups', 'namespaces', 'overlayfs', 'securitycontext', 'non-root', 'cap-drop', 'pid', 'network'],
        evaluationCriteria: [
          { criterion: 'Kernel Isolation Mechanisms', weight: 50, description: 'Explains how cgroups constrain memory/CPU and namespaces isolate PID/network.' },
          { criterion: 'Container Security Hardening', weight: 50, description: 'Specifies runAsNonRoot, read-only root filesystems, and dropping Linux capabilities.' }
        ],
        sampleGoodAnswerSnippet: 'Containers rely on Linux namespaces for process and network isolation, while cgroups enforce resource quotas...'
      },
      {
        id: 'devops-q2',
        stage: 'system_design',
        stageName: 'Stage 2: Zero-Downtime Blue/Green Deployments',
        question: 'Describe an automated zero-downtime deployment strategy with automated rollback on canary failure (e.g., error rate spike > 1%).',
        scenarioContext: 'Deploying a critical payment service across multi-availability zones in AWS.',
        expectedKeywords: ['blue green', 'canary', 'prometheus', 'health check', 'traffic shift', 'rollback', 'circuit breaker', 'cloudwatch'],
        evaluationCriteria: [
          { criterion: 'Traffic Shifting Strategy', weight: 40, description: 'Routes 5% traffic to canary and monitors telemetry before 100% rollout.' },
          { criterion: 'Automated Metric Verification', weight: 40, description: 'Monitors P99 latency and 5xx error spikes via CloudWatch/Prometheus.' },
          { criterion: 'Fast Rollback Invariants', weight: 20, description: 'Instantly shifts DNS or load balancer weights back upon alarm trigger.' }
        ],
        sampleGoodAnswerSnippet: 'We deploy the new release as a canary pod receiving 5% of incoming traffic through an Application Load Balancer...'
      }
    ]
  },

  // 3. Cybersecurity Analyst Track
  {
    roleId: 'role-cybersecurity',
    roleTitle: 'Cybersecurity Analyst',
    difficulty: 'Mid',
    targetReadinessScore: 80,
    questions: [
      {
        id: 'sec-q1',
        stage: 'foundations',
        stageName: 'Stage 1: Identity & Perimeter Defenses',
        question: 'What are the top three vulnerabilities associated with JSON Web Tokens (JWT), and how do you protect authentication flows against them?',
        scenarioContext: 'Reviewing authentication architecture for a financial student platform.',
        expectedKeywords: ['none algorithm', 'signature verification', 'secret strength', 'token revocation', 'httponly', 'csrf', 'xss'],
        evaluationCriteria: [
          { criterion: 'Algorithm Confusion & "none" Attack', weight: 40, description: 'Explicitly enforces strict algorithm verification (e.g. RS256/HS256).' },
          { criterion: 'Client Storage Security', weight: 35, description: 'Stores tokens in secure HttpOnly SameSite cookies rather than localStorage to prevent XSS.' },
          { criterion: 'Revocation & Token Expiry', weight: 25, description: 'Uses short-lived access tokens paired with refresh token rotation.' }
        ],
        sampleGoodAnswerSnippet: 'Three critical JWT vulnerabilities are algorithm confusion (allowing "none" algorithm), insecure storage vulnerable to XSS, and lack of revocation...'
      }
    ]
  }
];
