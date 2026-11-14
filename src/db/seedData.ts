import {
  OfflineCareerRole,
  OfflineQuestion,
  OfflineSkill,
  OfflineUser,
  OfflineProfile,
  OfflineRoadmap,
  OfflineProjectIdea
} from './indexedDb';

export const SEED_CAREER_ROLES: OfflineCareerRole[] = [
  {
    id: 'role-fullstack',
    title: 'Full Stack Developer',
    category: 'Software Engineering',
    salaryRange: '$95,000 - $145,000',
    marketDemand: 'Very High',
    shortDescription: 'Builds end-to-end web applications, resilient backend architectures, and reactive frontend experiences.',
    description: 'A Full Stack Developer commands both client-side and server-side paradigms: modern reactive components (React/TypeScript), scalable runtime servers (Node.js/Express), relational data modeling (PostgreSQL), containerized deployments (Docker), and automated CI/CD pipelines.',
    requiredSkills: [
      { skillName: 'JavaScript', benchmarkLevel: 5, importance: 'core' },
      { skillName: 'React', benchmarkLevel: 4, importance: 'core' },
      { skillName: 'Node.js', benchmarkLevel: 4, importance: 'core' },
      { skillName: 'TypeScript', benchmarkLevel: 4, importance: 'core' },
      { skillName: 'PostgreSQL', benchmarkLevel: 3, importance: 'core' },
      { skillName: 'Docker', benchmarkLevel: 3, importance: 'supporting' },
      { skillName: 'REST APIs', benchmarkLevel: 4, importance: 'core' }
    ],
    preferredSkills: [
      { skillName: 'GraphQL', benchmarkLevel: 3 },
      { skillName: 'Redis', benchmarkLevel: 3 },
      { skillName: 'CI/CD Pipelines', benchmarkLevel: 3 }
    ]
  },
  {
    id: 'role-aiml',
    title: 'AI / Machine Learning Engineer',
    category: 'Artificial Intelligence',
    salaryRange: '$115,000 - $175,000',
    marketDemand: 'Very High',
    shortDescription: 'Designs, trains, and deploys scalable machine learning models, neural networks, and generative LLM pipelines.',
    description: 'An AI/ML Engineer specializes in statistical modeling, neural network architectures, vector representations, model fine-tuning, and production inference pipelines with low latency.',
    requiredSkills: [
      { skillName: 'Python', benchmarkLevel: 5, importance: 'core' },
      { skillName: 'PyTorch', benchmarkLevel: 4, importance: 'core' },
      { skillName: 'Machine Learning', benchmarkLevel: 4, importance: 'core' },
      { skillName: 'Pandas & NumPy', benchmarkLevel: 4, importance: 'core' },
      { skillName: 'Vector Databases', benchmarkLevel: 3, importance: 'supporting' },
      { skillName: 'MLOps & Deployment', benchmarkLevel: 3, importance: 'supporting' }
    ],
    preferredSkills: [
      { skillName: 'TensorFlow', benchmarkLevel: 3 },
      { skillName: 'LangChain / RAG', benchmarkLevel: 4 },
      { skillName: 'CUDA / GPU Optimization', benchmarkLevel: 3 }
    ]
  },
  {
    id: 'role-devops',
    title: 'Cloud DevOps Architect',
    category: 'Cloud & Infrastructure',
    salaryRange: '$110,000 - $165,000',
    marketDemand: 'Very High',
    shortDescription: 'Orchestrates distributed cloud infrastructure, Kubernetes clusters, and zero-downtime CI/CD pipelines.',
    description: 'Architects infrastructure as code (IaC), ensures high availability and resilience across multi-cloud environments, and guarantees enterprise security and telemetry.',
    requiredSkills: [
      { skillName: 'Linux & Bash', benchmarkLevel: 4, importance: 'core' },
      { skillName: 'Docker', benchmarkLevel: 4, importance: 'core' },
      { skillName: 'Kubernetes', benchmarkLevel: 4, importance: 'core' },
      { skillName: 'AWS / Cloud', benchmarkLevel: 4, importance: 'core' },
      { skillName: 'Terraform', benchmarkLevel: 3, importance: 'core' },
      { skillName: 'CI/CD Pipelines', benchmarkLevel: 4, importance: 'core' }
    ],
    preferredSkills: [
      { skillName: 'Prometheus & Grafana', benchmarkLevel: 3 },
      { skillName: 'Ansible', benchmarkLevel: 3 },
      { skillName: 'Networking & VPC', benchmarkLevel: 4 }
    ]
  },
  {
    id: 'role-designer',
    title: 'Product Designer (UI/UX)',
    category: 'Design & Product',
    salaryRange: '$85,000 - $135,000',
    marketDemand: 'High',
    shortDescription: 'Designs intuitive digital interfaces, accessible design systems, and user journeys grounded in behavioral research.',
    description: 'A Product Designer combines user research, wireframing, high-fidelity interactive prototyping, design token architectures, and accessibility standards (WCAG).',
    requiredSkills: [
      { skillName: 'Figma', benchmarkLevel: 5, importance: 'core' },
      { skillName: 'Design Systems', benchmarkLevel: 4, importance: 'core' },
      { skillName: 'UX Research', benchmarkLevel: 4, importance: 'core' },
      { skillName: 'Wireframing', benchmarkLevel: 4, importance: 'core' },
      { skillName: 'Interaction Design', benchmarkLevel: 4, importance: 'core' },
      { skillName: 'Accessibility (WCAG)', benchmarkLevel: 3, importance: 'supporting' }
    ],
    preferredSkills: [
      { skillName: 'HTML / CSS Basics', benchmarkLevel: 3 },
      { skillName: 'Usability Testing', benchmarkLevel: 4 },
      { skillName: 'Prototyping Tools', benchmarkLevel: 4 }
    ]
  },
  {
    id: 'role-security',
    title: 'Cybersecurity Analyst',
    category: 'Security',
    salaryRange: '$90,000 - $140,000',
    marketDemand: 'Very High',
    shortDescription: 'Protects enterprise digital assets through vulnerability assessments, penetration testing, and threat telemetry.',
    description: 'Investigates attack vectors, secures web applications against OWASP Top 10 vulnerabilities, audits cloud IAM configurations, and responds to active incident vectors.',
    requiredSkills: [
      { skillName: 'Network Security', benchmarkLevel: 4, importance: 'core' },
      { skillName: 'OWASP Top 10', benchmarkLevel: 4, importance: 'core' },
      { skillName: 'Linux & Bash', benchmarkLevel: 4, importance: 'core' },
      { skillName: 'Threat Modeling', benchmarkLevel: 3, importance: 'core' },
      { skillName: 'Penetration Testing', benchmarkLevel: 3, importance: 'supporting' },
      { skillName: 'Cryptography', benchmarkLevel: 3, importance: 'supporting' }
    ],
    preferredSkills: [
      { skillName: 'SIEM / Splunk', benchmarkLevel: 3 },
      { skillName: 'Wireshark', benchmarkLevel: 3 },
      { skillName: 'Cloud Security IAM', benchmarkLevel: 4 }
    ]
  }
];

export const DEMO_PERSONAS = [
  {
    id: 'persona-student',
    label: 'CS Student targeting Full Stack Developer',
    description: 'Solid foundations in Python & SQL; needs JavaScript, React, and Node.js runtime mastery.',
    user: {
      id: 'user-student',
      name: 'Priya Sharma',
      email: 'priya.student@skillpath.local',
      role: 'student' as const,
      college: 'National Institute of Technology'
    },
    targetRoleId: 'role-fullstack',
    hoursPerWeek: 12,
    skills: [
      { skillName: 'Python', category: 'languages' as const, proficiencyLevel: 3, isVerified: true, verifiedScore: 88, evidence: 'Completed Data Structures in Python and algorithms coursework.' },
      { skillName: 'SQL / Databases', category: 'databases' as const, proficiencyLevel: 3, isVerified: true, verifiedScore: 82, evidence: 'Relational schema design and multi-table queries.' },
      { skillName: 'HTML & CSS', category: 'languages' as const, proficiencyLevel: 2, isVerified: false, evidence: 'Built basic static course projects.' },
      { skillName: 'Git & Version Control', category: 'tools' as const, proficiencyLevel: 2, isVerified: true, verifiedScore: 78, evidence: 'Commits, branching, and pull requests on GitHub.' }
    ]
  },
  {
    id: 'persona-frontend',
    label: 'Junior Frontend Developer targeting Full Stack',
    description: 'Proficient in HTML, CSS, JavaScript, and React; needs Node.js, PostgreSQL, and Docker backend depth.',
    user: {
      id: 'user-frontend',
      name: 'Alex Rivera',
      email: 'alex.frontend@skillpath.local',
      role: 'job_seeker' as const,
      college: 'State University of New York'
    },
    targetRoleId: 'role-fullstack',
    hoursPerWeek: 15,
    skills: [
      { skillName: 'HTML & CSS', category: 'languages' as const, proficiencyLevel: 4, isVerified: true, verifiedScore: 92, evidence: 'Responsive layout designs and Tailwind CSS.' },
      { skillName: 'JavaScript', category: 'languages' as const, proficiencyLevel: 3, isVerified: true, verifiedScore: 85, evidence: 'ES6+ async/await, DOM APIs, and closures.' },
      { skillName: 'React', category: 'frameworks' as const, proficiencyLevel: 3, isVerified: true, verifiedScore: 80, evidence: 'Custom hooks, Context API, and single-page apps.' },
      { skillName: 'Git & Version Control', category: 'tools' as const, proficiencyLevel: 3, isVerified: true, verifiedScore: 90, evidence: 'Feature branching and team PR workflows.' },
      { skillName: 'Node.js', category: 'frameworks' as const, proficiencyLevel: 1, isVerified: false, evidence: 'Followed introductory tutorial.' },
      { skillName: 'PostgreSQL', category: 'databases' as const, proficiencyLevel: 1, isVerified: false, evidence: 'Self-studied basics.' }
    ]
  },
  {
    id: 'persona-analyst',
    label: 'Data Analyst pivoting to AI/ML Engineer',
    description: 'Expert in SQL, Pandas & BI; needs PyTorch, Deep Learning, MLOps, and vector search mastery.',
    user: {
      id: 'user-analyst',
      name: 'David Chen',
      email: 'david.analyst@skillpath.local',
      role: 'career_changer' as const,
      college: 'Georgia Tech'
    },
    targetRoleId: 'role-aiml',
    hoursPerWeek: 10,
    skills: [
      { skillName: 'Python', category: 'languages' as const, proficiencyLevel: 3, isVerified: true, verifiedScore: 85, evidence: 'Data analysis and automation scripts.' },
      { skillName: 'Pandas & NumPy', category: 'analytics' as const, proficiencyLevel: 4, isVerified: true, verifiedScore: 90, evidence: 'Feature engineering and pipeline transformations.' },
      { skillName: 'SQL / Databases', category: 'databases' as const, proficiencyLevel: 4, isVerified: true, verifiedScore: 94, evidence: 'Complex analytic window queries and aggregations.' },
      { skillName: 'Data Visualization', category: 'analytics' as const, proficiencyLevel: 4, isVerified: true, verifiedScore: 88, evidence: 'Executive dashboards and reporting.' }
    ]
  },
  {
    id: 'persona-sysadmin',
    label: 'Linux SysAdmin pivoting to Cloud DevOps Architect',
    description: 'Commands Linux & Bash; needs Kubernetes orchestration, Terraform IaC, and cloud architecture.',
    user: {
      id: 'user-sysadmin',
      name: 'Marcus Vance',
      email: 'marcus.sysadmin@skillpath.local',
      role: 'professional' as const,
      college: 'Community College of Philadelphia'
    },
    targetRoleId: 'role-devops',
    hoursPerWeek: 8,
    skills: [
      { skillName: 'Linux & Bash', category: 'cloud' as const, proficiencyLevel: 4, isVerified: true, verifiedScore: 95, evidence: 'Kernel tuning, systemd, and cron automations.' },
      { skillName: 'Networking & VPC', category: 'cloud' as const, proficiencyLevel: 3, isVerified: true, verifiedScore: 84, evidence: 'TCP/IP routing, DNS, and firewall configurations.' },
      { skillName: 'Git & Version Control', category: 'tools' as const, proficiencyLevel: 3, isVerified: true, verifiedScore: 82, evidence: 'Server configuration repos.' },
      { skillName: 'Docker', category: 'cloud' as const, proficiencyLevel: 2, isVerified: false, evidence: 'Basic container management.' }
    ]
  }
];

export const SEED_QUESTIONS: OfflineQuestion[] = [
  {
    id: 'q-js-1',
    topic: 'JavaScript',
    difficulty: 'intermediate',
    question: 'What is the exact execution order output of the following asynchronous code snippet?',
    codeSnippet: `console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');`,
    options: [
      '1, 2, 3, 4',
      '1, 4, 3, 2',
      '1, 4, 2, 3',
      '1, 3, 4, 2'
    ],
    correctAnswerIndex: 1,
    explanation: 'Synchronous statements execute first (1, 4). The microtask queue (Promise resolution) runs before the macrotask queue (setTimeout timer). Therefore 3 prints before 2.',
    subtopic: 'Event Loop & Microtasks'
  },
  {
    id: 'q-js-2',
    topic: 'JavaScript',
    difficulty: 'intermediate',
    question: 'How do JavaScript closures retain access to outer function scope variables after outer execution terminates?',
    codeSnippet: `function makeCounter() {
  let count = 0;
  return () => ++count;
}
const counter = makeCounter();
console.log(counter()); // 1`,
    options: [
      'By copying outer variables into the global window object.',
      'Through a permanent lexical environment reference stored inside the returned function object.',
      'Through garbage collector exempt flags set in memory.',
      'By serialization of variable states into localStorage.'
    ],
    correctAnswerIndex: 1,
    explanation: 'Functions in JavaScript carry an internal [[Environment]] reference to the Lexical Environment in which they were instantiated, keeping outer variables reachable and preventing garbage collection.',
    subtopic: 'Closures & Lexical Scope'
  },
  {
    id: 'q-react-1',
    topic: 'React',
    difficulty: 'intermediate',
    question: 'Why does direct state mutation cause React components to miss rerender notifications?',
    codeSnippet: `const [items, setItems] = useState([1, 2]);
// Bad pattern:
items.push(3);
setItems(items);`,
    options: [
      'React performs deep recursive comparison on every render cycle.',
      'React checks Object.is reference equality on state changes; mutating the array preserves the same memory address.',
      'useState only accepts primitive numbers and strings.',
      'Array.prototype.push triggers an internal error in React fiber.'
    ],
    correctAnswerIndex: 1,
    explanation: 'React optimizes reconciliation by evaluating Object.is(prevState, nextState). Mutating an array in-place keeps the exact same object reference, so React assumes nothing changed and skips rerendering.',
    subtopic: 'State Immutability & Reconciliation'
  },
  {
    id: 'q-node-1',
    topic: 'Node.js',
    difficulty: 'intermediate',
    question: 'Which Node.js core abstraction should be used to stream a 5GB file over an HTTP response without overflowing process RAM?',
    codeSnippet: `const fs = require('fs');
app.get('/download', (req, res) => {
  // Optimal streaming method:
  const stream = fs.createReadStream('archive.tar.gz');
  stream.pipe(res);
});`,
    options: [
      'fs.readFileSync into a giant Buffer object.',
      'fs.createReadStream piped to the response Stream with automatic backpressure.',
      'Recursive worker_threads computing base64 chunks.',
      'Child process invoking curl directly.'
    ],
    correctAnswerIndex: 1,
    explanation: 'Readable streams chunk data into memory-constrained packets (default 64KB) and stream.pipe() automatically regulates backpressure if the HTTP consumer reads slower than disk I/O.',
    subtopic: 'Streams & Backpressure'
  },
  {
    id: 'q-sql-1',
    topic: 'PostgreSQL',
    difficulty: 'intermediate',
    question: 'In PostgreSQL, why does adding a B-tree index on "users(email)" drastically accelerate WHERE email = $1 queries?',
    options: [
      'It changes the table storage engine from Heap to In-Memory Key-Value.',
      'It constructs a balanced multi-way tree supporting O(log N) lookup without scanning full heap pages.',
      'It hashes passwords into an encrypted bloom filter.',
      'It converts string values into 32-bit integer row identifiers.'
    ],
    correctAnswerIndex: 1,
    explanation: 'B-tree indexes maintain sorted pointers to table heap rows. PostgreSQL navigates the tree in O(log N) operations, avoiding costly sequential table scans across thousands of disk blocks.',
    subtopic: 'Indexes & Query Optimization'
  },
  {
    id: 'q-docker-1',
    topic: 'Docker',
    difficulty: 'intermediate',
    question: 'Why do multi-stage Dockerfiles produce significantly leaner, more secure production container images?',
    options: [
      'They compress the Linux kernel into an Alpine micro-binary.',
      'They isolate build tools and devDependencies into a temporary builder stage, copying only production artifacts into the final runtime image.',
      'They bypass the Docker daemon cache completely.',
      'They run containers in unprivileged rootless chroot jail automatically.'
    ],
    correctAnswerIndex: 1,
    explanation: 'Multi-stage builds allow compiling TypeScript and installing heavy build dependencies in stage 1, then copying only the minified dist/ output into a minimal runtime image (e.g. node:alpine), cutting image size by 80%+ and reducing vulnerability surface.',
    subtopic: 'Multi-Stage Builds'
  }
];

export const OFFLINE_STUDY_GUIDES: Record<string, string> = {
  'js-event-loop': `# JavaScript Event Loop & Concurrency Model
The JavaScript runtime is single-threaded, meaning it has one call stack and one memory heap. Concurrency is handled via the **libuv event loop**.

### The Processing Hierarchy:
1. **Call Stack:** Executes synchronous JavaScript code frame by frame.
2. **Microtask Queue:** Processes \`Promise.then\`, \`queueMicrotask\`, and \`MutationObserver\`. Always drained completely after every stack frame before checking macrotasks.
3. **Macrotask Queue (Task Queue):** Processes \`setTimeout\`, \`setInterval\`, and I/O callbacks.
4. **Render Pipeline:** The browser updates layout and paints between task turns.

### Key Rule for Full Stack Engineers:
Never block the call stack with intensive synchronous computations (e.g., regex loops or crypto). In Node.js, delegate compute-heavy tasks to \`worker_threads\`.`,

  'react-state': `# React State Design & Custom Hook Architecture
State is the single source of truth for UI rendering.

### Principles of Predictable State:
- **Never Mutate State In-Place:** Always return a fresh object or array reference using spread (\`[...items, newItem]\`) or immutability utilities.
- **Derive Rather Than Duplicate:** If a value can be computed from existing props or state, compute it during render instead of creating redundant state.
- **Compound Components:** Group related stateful components using React Context so parent and children communicate cleanly without prop drilling.`,

  'node-streams': `# Node.js Streams & Backpressure Mechanics
Reading an entire file or network response into a buffer consumes RAM equal to file size. For files larger than available RAM, processes crash with \`ERR_STRING_TOO_LONG\` or \`OOM\`.

### Stream Types:
- **Readable:** Sources of data (e.g., \`fs.createReadStream\`, \`req\` in Express).
- **Writable:** Destinations (e.g., \`fs.createWriteStream\`, \`res\` in Express).
- **Transform:** Modifies data on the fly (e.g., \`zlib.createGzip\`).

### The Backpressure Solution:
When the writable stream's internal buffer is full, \`write()\` returns \`false\`. The readable stream must pause until the writable emits \`drain\`. Using \`pipeline()\` from \`stream/promises\` handles this automatically.`
};
