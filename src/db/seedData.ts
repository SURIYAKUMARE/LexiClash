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

// -------------------------------------------------------------
// 8 Technical Domains for Learning Universe
// -------------------------------------------------------------
export interface LearningDomain {
  id: string;
  name: string;
  tagline: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  status: 'In Progress' | 'Available' | 'Mastered';
  progressPercentage: number;
  availablePaths: string[];
  skillRequirements: { name: string; level: number }[];
  careerOpportunities: { title: string; avgSalary: string; demand: 'Very High' | 'High' | 'Steady' }[];
  orbitalRadius: number; // for SVG cosmos visualization
  orbitalSpeed: number;
  color: string;
}

export const SEED_LEARNING_DOMAINS: LearningDomain[] = [
  {
    id: 'domain-cloud',
    name: 'Cloud Computing',
    tagline: 'Distributed Infrastructure, High Availability & Elastic Scale',
    description: 'Master enterprise multi-region cloud topology, Infrastructure as Code, IAM security perimeters, VPC networking, and serverless compute.',
    difficulty: 'Intermediate',
    status: 'In Progress',
    progressPercentage: 68,
    availablePaths: ['Cloud Solutions Architect', 'Cloud Security Engineer', 'Serverless Specialist'],
    skillRequirements: [
      { name: 'VPC & Networking', level: 4 },
      { name: 'IAM Security & Least Privilege', level: 4 },
      { name: 'EC2 & Container Compute', level: 4 },
      { name: 'S3 & Object Lifecycle', level: 3 }
    ],
    careerOpportunities: [
      { title: 'AWS Cloud Architect', avgSalary: '$145,000', demand: 'Very High' },
      { title: 'Cloud Infrastructure Engineer', avgSalary: '$130,000', demand: 'Very High' }
    ],
    orbitalRadius: 110,
    orbitalSpeed: 45,
    color: '#0B57D0'
  },
  {
    id: 'domain-fullstack',
    name: 'Full Stack Development',
    tagline: 'End-to-End Modern Web Engineering & Resilient Architectures',
    description: 'Design production client-side component trees in React/TypeScript, high-throughput asynchronous Node.js runtimes, and ACID-compliant relational schemas.',
    difficulty: 'Intermediate',
    status: 'In Progress',
    progressPercentage: 82,
    availablePaths: ['Full Stack Web Engineer', 'Frontend Specialist', 'Backend Systems Architect'],
    skillRequirements: [
      { name: 'JavaScript & TypeScript', level: 5 },
      { name: 'React Architecture', level: 4 },
      { name: 'Node.js & Express', level: 4 },
      { name: 'PostgreSQL Relational Design', level: 3 }
    ],
    careerOpportunities: [
      { title: 'Senior Full Stack Engineer', avgSalary: '$138,000', demand: 'Very High' },
      { title: 'Software Applications Architect', avgSalary: '$152,000', demand: 'High' }
    ],
    orbitalRadius: 155,
    orbitalSpeed: 60,
    color: '#1B5E20'
  },
  {
    id: 'domain-ai',
    name: 'Artificial Intelligence',
    tagline: 'Agentic Workflows, Neural Architectures & Retrieval Systems',
    description: 'Build autonomous multi-agent reasoning graphs, semantic embedding pipelines, vector retrieval (RAG), and fine-tuned domain LLM applications.',
    difficulty: 'Advanced',
    status: 'Available',
    progressPercentage: 35,
    availablePaths: ['Generative AI Engineer', 'AI Systems Architect', 'Cognitive Search Engineer'],
    skillRequirements: [
      { name: 'Python Systems Programming', level: 4 },
      { name: 'LangGraph & Multi-Agent Loops', level: 4 },
      { name: 'Vector Databases (pgvector/Pinecone)', level: 3 },
      { name: 'Prompt Engineering & Guardrails', level: 4 }
    ],
    careerOpportunities: [
      { title: 'AI Solutions Engineer', avgSalary: '$160,000', demand: 'Very High' },
      { title: 'Agentic AI Developer', avgSalary: '$155,000', demand: 'Very High' }
    ],
    orbitalRadius: 200,
    orbitalSpeed: 75,
    color: '#7C3AED'
  },
  {
    id: 'domain-ml',
    name: 'Machine Learning',
    tagline: 'Mathematical Foundations, Model Training & Production MLOps',
    description: 'Deep dive into loss functions, backpropagation, PyTorch model graphs, feature pipelines, distributed training, and low-latency inference serving.',
    difficulty: 'Advanced',
    status: 'Available',
    progressPercentage: 28,
    availablePaths: ['Machine Learning Scientist', 'MLOps Engineer', 'Computer Vision Specialist'],
    skillRequirements: [
      { name: 'PyTorch & Neural Networks', level: 4 },
      { name: 'Linear Algebra & Calculus', level: 4 },
      { name: 'Model Evaluation & Loss Metrics', level: 3 },
      { name: 'MLOps Pipeline Deployment', level: 3 }
    ],
    careerOpportunities: [
      { title: 'Machine Learning Engineer', avgSalary: '$158,000', demand: 'Very High' },
      { title: 'MLOps Architect', avgSalary: '$150,000', demand: 'High' }
    ],
    orbitalRadius: 245,
    orbitalSpeed: 90,
    color: '#EA580C'
  },
  {
    id: 'domain-dataeng',
    name: 'Data Engineering',
    tagline: 'Scalable Streaming Pipelines, Lakehouses & Distributed Storage',
    description: 'Construct fault-tolerant ETL/ELT pipelines, Apache Spark / Kafka streaming topologies, columnar Parquet lakehouses, and real-time analytics syncs.',
    difficulty: 'Intermediate',
    status: 'Available',
    progressPercentage: 42,
    availablePaths: ['Data Pipeline Engineer', 'Analytics Platform Architect', 'Data Lake Specialist'],
    skillRequirements: [
      { name: 'SQL Query Optimization', level: 4 },
      { name: 'Kafka & Event Streaming', level: 3 },
      { name: 'Apache Spark Distributed Compute', level: 3 },
      { name: 'Data Warehousing (Snowflake/BigQuery)', level: 4 }
    ],
    careerOpportunities: [
      { title: 'Lead Data Engineer', avgSalary: '$142,000', demand: 'Very High' },
      { title: 'Data Platform Engineer', avgSalary: '$135,000', demand: 'High' }
    ],
    orbitalRadius: 290,
    orbitalSpeed: 105,
    color: '#0284C7'
  },
  {
    id: 'domain-analytics',
    name: 'Data Analytics',
    tagline: 'Decision Intelligence, Business Modeling & Statistical Insight',
    description: 'Transform raw operational telemetry into predictive business insights, executive dashboards, cohort analysis, and statistical significance testing.',
    difficulty: 'Beginner',
    status: 'Available',
    progressPercentage: 55,
    availablePaths: ['Business Intelligence Engineer', 'Product Data Analyst', 'Growth Scientist'],
    skillRequirements: [
      { name: 'Advanced SQL & CTEs', level: 4 },
      { name: 'Data Storytelling & Dashboards', level: 4 },
      { name: 'A/B Testing & Statistics', level: 3 },
      { name: 'Pandas Exploratory Analysis', level: 3 }
    ],
    careerOpportunities: [
      { title: 'Senior Product Analyst', avgSalary: '$112,000', demand: 'High' },
      { title: 'BI Systems Engineer', avgSalary: '$108,000', demand: 'Steady' }
    ],
    orbitalRadius: 335,
    orbitalSpeed: 120,
    color: '#0D9488'
  },
  {
    id: 'domain-cyber',
    name: 'Cybersecurity',
    tagline: 'Threat Modeling, Network Defense, Cryptography & Zero Trust',
    description: 'Master offensive vulnerability assessment, penetration defense, cryptographic handshake mechanics, identity federation, and zero-trust perimeter control.',
    difficulty: 'Expert',
    status: 'Available',
    progressPercentage: 20,
    availablePaths: ['Security Operations Analyst', 'Application Security Specialist', 'Penetration Tester'],
    skillRequirements: [
      { name: 'Network Protocol Defense & Firewalls', level: 4 },
      { name: 'OWASP Top 10 Vulnerabilities', level: 5 },
      { name: 'Public Key Infrastructure (PKI)', level: 3 },
      { name: 'Threat Detection & SIEM Analysis', level: 3 }
    ],
    careerOpportunities: [
      { title: 'Application Security Engineer', avgSalary: '$148,000', demand: 'Very High' },
      { title: 'Cyber Defense Specialist', avgSalary: '$132,000', demand: 'High' }
    ],
    orbitalRadius: 380,
    orbitalSpeed: 140,
    color: '#DC2626'
  },
  {
    id: 'domain-devops',
    name: 'DevOps & SRE',
    tagline: 'Infrastructure as Code, Kubernetes, Chaos Engineering & Observability',
    description: 'Automate declarative infrastructure with Terraform, orchestrate containerized workloads in Kubernetes, enforce GitOps CI/CD, and maintain 99.99% availability.',
    difficulty: 'Advanced',
    status: 'In Progress',
    progressPercentage: 74,
    availablePaths: ['Site Reliability Engineer (SRE)', 'Platform Engineer', 'Release Infrastructure Architect'],
    skillRequirements: [
      { name: 'Kubernetes Cluster Operations', level: 4 },
      { name: 'Terraform & Declarative IaC', level: 4 },
      { name: 'Prometheus & Grafana Telemetry', level: 4 },
      { name: 'CI/CD Pipeline Automation', level: 5 }
    ],
    careerOpportunities: [
      { title: 'Staff Site Reliability Engineer', avgSalary: '$162,000', demand: 'Very High' },
      { title: 'Platform Automation Engineer', avgSalary: '$140,000', demand: 'Very High' }
    ],
    orbitalRadius: 425,
    orbitalSpeed: 160,
    color: '#4F46E5'
  }
];

// -------------------------------------------------------------
// Seed Cloud Simulation State (AWS-Inspired Safe Simulation)
// -------------------------------------------------------------
import { OfflineCloudSimulationState } from './indexedDb';

export const SEED_CLOUD_SIMULATION_STATE: OfflineCloudSimulationState = {
  id: 'sim-default',
  userId: 'user-student',
  iam: {
    users: [
      {
        id: 'usr-101',
        username: 'devops-lead',
        accessKeyId: 'AKIAIOSFODNN7EXAMPLE',
        policies: ['AdministratorAccess'],
        mfaEnabled: true,
        createdAt: '2026-10-15T08:00:00Z'
      },
      {
        id: 'usr-102',
        username: 'developer-alex',
        accessKeyId: 'AKIAI44QH8DHBEXAMPLE',
        policies: ['AmazonEC2ReadOnlyAccess', 'AmazonS3FullAccess'],
        mfaEnabled: false, // Flagged for Security Inspector!
        createdAt: '2026-10-22T10:30:00Z'
      },
      {
        id: 'usr-103',
        username: 'ci-runner-deployer',
        accessKeyId: 'AKIAJSIE27827EXAMPLE',
        policies: ['AmazonECS_FullAccess', 'AWSLambda_FullAccess'],
        mfaEnabled: false,
        createdAt: '2026-11-01T14:15:00Z'
      }
    ],
    roles: [
      {
        id: 'role-ec2-s3',
        name: 'EC2InstanceRole-S3Access',
        trustEntity: 'ec2.amazonaws.com',
        attachedPolicies: ['AmazonS3ReadOnlyAccess', 'CloudWatchLogsFullAccess']
      },
      {
        id: 'role-lambda-db',
        name: 'LambdaVpcAccessExecutionRole',
        trustEntity: 'lambda.amazonaws.com',
        attachedPolicies: ['AWSLambdaVPCAccessExecutionRole', 'AmazonRDSReadOnlyAccess']
      }
    ],
    policies: [
      {
        id: 'pol-admin',
        name: 'AdministratorAccess',
        document: '{\n  "Version": "2012-10-17",\n  "Statement": [{\n    "Effect": "Allow",\n    "Action": "*",\n    "Resource": "*"\n  }]\n}',
        description: 'Provides full administrative access to AWS services and resources.'
      },
      {
        id: 'pol-s3-read',
        name: 'AmazonS3ReadOnlyAccess',
        document: '{\n  "Version": "2012-10-17",\n  "Statement": [{\n    "Effect": "Allow",\n    "Action": ["s3:Get*", "s3:List*"],\n    "Resource": "*"\n  }]\n}',
        description: 'Provides read only access to all buckets via AWS S3.'
      },
      {
        id: 'pol-s3-full',
        name: 'AmazonS3FullAccess',
        document: '{\n  "Version": "2012-10-17",\n  "Statement": [{\n    "Effect": "Allow",\n    "Action": "s3:*",\n    "Resource": "*"\n  }]\n}',
        description: 'Provides full access to all buckets via AWS S3.'
      }
    ]
  },
  ec2: {
    instances: [
      {
        id: 'i-0a12b34c56d78e01',
        name: 'prod-api-cluster-01',
        type: 't3.micro',
        state: 'running',
        publicIp: '54.210.82.14',
        privateIp: '10.0.1.18',
        securityGroupId: 'sg-web-public',
        az: 'us-east-1a',
        launchTime: '2026-11-08T04:12:00Z',
        cpuUtilization: 34.2
      },
      {
        id: 'i-0a12b34c56d78e02',
        name: 'prod-api-cluster-02',
        type: 't3.micro',
        state: 'running',
        publicIp: '54.210.82.15',
        privateIp: '10.0.2.24',
        securityGroupId: 'sg-web-public',
        az: 'us-east-1b',
        launchTime: '2026-11-08T04:15:00Z',
        cpuUtilization: 38.6
      },
      {
        id: 'i-0f99887766554433',
        name: 'bastion-jump-host',
        type: 't3.nano',
        state: 'stopped',
        publicIp: '54.210.99.200',
        privateIp: '10.0.1.99',
        securityGroupId: 'sg-bastion',
        az: 'us-east-1a',
        launchTime: '2026-10-30T11:00:00Z',
        cpuUtilization: 0
      }
    ],
    securityGroups: [
      {
        id: 'sg-web-public',
        name: 'sg-web-alb-ingress',
        description: 'Allows HTTPS and HTTP traffic from internet and port 22 (Insecure check)',
        vpcId: 'vpc-main-prod',
        inboundRules: [
          { id: 'rule-1', protocol: 'TCP', port: 443, source: '0.0.0.0/0', description: 'Public HTTPS traffic' },
          { id: 'rule-2', protocol: 'TCP', port: 80, source: '0.0.0.0/0', description: 'Public HTTP redirect' },
          { id: 'rule-3', protocol: 'TCP', port: 22, source: '0.0.0.0/0', description: 'SSH open to world (Risk!)' }
        ],
        outboundRules: [
          { id: 'out-1', protocol: 'ALL', port: 'ALL', source: '0.0.0.0/0', description: 'Allow all egress' }
        ]
      },
      {
        id: 'sg-db-private',
        name: 'sg-db-isolated',
        description: 'PostgreSQL traffic restricted only to application security group',
        vpcId: 'vpc-main-prod',
        inboundRules: [
          { id: 'rule-db-1', protocol: 'TCP', port: 5432, source: '10.0.0.0/16', description: 'VPC internal DB access' }
        ],
        outboundRules: [
          { id: 'out-db-1', protocol: 'ALL', port: 'ALL', source: '0.0.0.0/0', description: 'Allow all egress' }
        ]
      },
      {
        id: 'sg-bastion',
        name: 'sg-bastion-ssh',
        description: 'Bastion SSH management perimeter',
        vpcId: 'vpc-main-prod',
        inboundRules: [
          { id: 'rule-b-1', protocol: 'TCP', port: 22, source: '198.51.100.1/32', description: 'Corporate VPN CIDR' }
        ],
        outboundRules: [
          { id: 'out-b-1', protocol: 'ALL', port: 'ALL', source: '0.0.0.0/0', description: 'Allow all egress' }
        ]
      }
    ],
    loadBalancers: [
      {
        id: 'alb-prod-external',
        name: 'alb-prod-external',
        dnsName: 'alb-prod-external-8192847.us-east-1.elb.amazonaws.com',
        state: 'active',
        scheme: 'internet-facing',
        targetInstanceIds: ['i-0a12b34c56d78e01', 'i-0a12b34c56d78e02']
      }
    ],
    autoScalingGroups: [
      {
        id: 'asg-prod-api',
        name: 'asg-prod-api',
        minSize: 2,
        maxSize: 6,
        desiredCapacity: 2,
        instanceType: 't3.micro'
      }
    ]
  },
  s3: {
    buckets: [
      {
        id: 'bkt-prod-assets',
        name: 'skillpath-prod-static-assets',
        region: 'us-east-1',
        blockPublicAccess: true,
        isPublic: false,
        versioning: true,
        createdAt: '2026-10-10T12:00:00Z',
        objects: [
          { key: 'index.html', sizeKb: 12.4, lastModified: '2026-11-12T10:00:00Z', storageClass: 'STANDARD' },
          { key: 'assets/app.bundle.js', sizeKb: 345.8, lastModified: '2026-11-12T10:00:00Z', storageClass: 'STANDARD' },
          { key: 'assets/main.css', sizeKb: 48.2, lastModified: '2026-11-12T10:00:00Z', storageClass: 'STANDARD' }
        ]
      },
      {
        id: 'bkt-customer-data',
        name: 'skillpath-customer-exports-backup',
        region: 'us-east-1',
        blockPublicAccess: false, // FLAG for War Room & Security Inspector!
        isPublic: true,
        versioning: false,
        createdAt: '2026-10-18T16:20:00Z',
        objects: [
          { key: 'telemetry_export_202611.json', sizeKb: 1840.5, lastModified: '2026-11-13T02:00:00Z', storageClass: 'STANDARD' },
          { key: 'customer_credentials_v1.csv', sizeKb: 215.1, lastModified: '2026-11-13T02:05:00Z', storageClass: 'STANDARD' }
        ]
      },
      {
        id: 'bkt-audit-logs',
        name: 'skillpath-cloudtrail-audit-vault',
        region: 'us-east-1',
        blockPublicAccess: true,
        isPublic: false,
        versioning: true,
        createdAt: '2026-10-05T09:00:00Z',
        objects: [
          { key: 'AWSLogs/account/CloudTrail/us-east-1/2026/11/log.json.gz', sizeKb: 890.2, lastModified: '2026-11-14T05:00:00Z', storageClass: 'GLACIER' }
        ]
      }
    ]
  },
  vpc: {
    vpcs: [
      {
        id: 'vpc-main-prod',
        name: 'vpc-production-us-east',
        cidrBlock: '10.0.0.0/16',
        isDefault: false
      }
    ],
    subnets: [
      { id: 'sub-pub-1a', vpcId: 'vpc-main-prod', name: 'public-subnet-1a', cidrBlock: '10.0.1.0/24', az: 'us-east-1a', isPublic: true },
      { id: 'sub-pub-1b', vpcId: 'vpc-main-prod', name: 'public-subnet-1b', cidrBlock: '10.0.2.0/24', az: 'us-east-1b', isPublic: true },
      { id: 'sub-priv-app-1a', vpcId: 'vpc-main-prod', name: 'private-app-subnet-1a', cidrBlock: '10.0.10.0/24', az: 'us-east-1a', isPublic: false },
      { id: 'sub-priv-app-1b', vpcId: 'vpc-main-prod', name: 'private-app-subnet-1b', cidrBlock: '10.0.20.0/24', az: 'us-east-1b', isPublic: false },
      { id: 'sub-priv-db-1a', vpcId: 'vpc-main-prod', name: 'isolated-db-subnet-1a', cidrBlock: '10.0.50.0/24', az: 'us-east-1a', isPublic: false }
    ],
    routeTables: [
      {
        id: 'rtb-pub',
        vpcId: 'vpc-main-prod',
        name: 'rtb-public-internet',
        routes: [
          { destination: '10.0.0.0/16', target: 'local' },
          { destination: '0.0.0.0/0', target: 'igw-prod-main' }
        ],
        associatedSubnetIds: ['sub-pub-1a', 'sub-pub-1b']
      },
      {
        id: 'rtb-priv',
        vpcId: 'vpc-main-prod',
        name: 'rtb-private-nat',
        routes: [
          { destination: '10.0.0.0/16', target: 'local' },
          { destination: '0.0.0.0/0', target: 'nat-prod-01' }
        ],
        associatedSubnetIds: ['sub-priv-app-1a', 'sub-priv-app-1b', 'sub-priv-db-1a']
      }
    ],
    internetGateways: [
      { id: 'igw-prod-main', vpcId: 'vpc-main-prod', name: 'igw-production-egress', attached: true }
    ],
    natGateways: [
      { id: 'nat-prod-01', subnetId: 'sub-pub-1a', name: 'nat-gw-az1a', ip: '52.4.112.98', state: 'available' }
    ]
  },
  cloudWatch: {
    alarms: [
      {
        id: 'alm-cpu-high',
        name: 'High-CPU-Utilization-App-Cluster',
        metricName: 'CPUUtilization',
        threshold: 80,
        state: 'OK',
        comparison: 'GreaterThanThreshold',
        unit: 'Percent'
      },
      {
        id: 'alm-latency',
        name: 'ALB-TargetResponseTime-Spike',
        metricName: 'TargetResponseTime',
        threshold: 1.5,
        state: 'OK',
        comparison: 'GreaterThanThreshold',
        unit: 'Seconds'
      },
      {
        id: 'alm-s3-public',
        name: 'S3-Public-Bucket-Detection',
        metricName: 'NumberOfPublicBuckets',
        threshold: 0,
        state: 'ALARM',
        comparison: 'GreaterThanThreshold',
        unit: 'Count'
      }
    ],
    logs: [
      {
        id: 'log-1',
        group: '/aws/ec2/app-server',
        stream: 'i-0a12b34c56d78e01',
        message: 'INFO [HttpServer] 200 OK GET /api/v1/healthcheck - 2.1ms latency',
        timestamp: '2026-11-14T05:32:00Z',
        level: 'INFO'
      },
      {
        id: 'log-2',
        group: '/aws/ec2/app-server',
        stream: 'i-0a12b34c56d78e02',
        message: 'INFO [DatabasePool] Active connections: 14/100, idle: 86',
        timestamp: '2026-11-14T05:32:04Z',
        level: 'INFO'
      },
      {
        id: 'log-3',
        group: '/aws/cloudtrail/audit',
        stream: 'security-events',
        message: 'WARN [SecurityAudit] Bucket skillpath-customer-exports-backup has BlockPublicAcls set to FALSE',
        timestamp: '2026-11-14T05:31:55Z',
        level: 'WARN'
      }
    ]
  },
  billing: {
    currentMonthSpend: 142.85,
    budgetLimit: 200.0,
    serviceBreakdown: [
      { service: 'Amazon Elastic Compute Cloud (EC2)', amount: 78.40, percentage: 55 },
      { service: 'Amazon Relational Database Service (RDS)', amount: 34.20, percentage: 24 },
      { service: 'Amazon Simple Storage Service (S3)', amount: 18.50, percentage: 13 },
      { service: 'VPC NAT Gateways & Data Transfer', amount: 11.75, percentage: 8 }
    ]
  },
  lastUpdated: new Date().toISOString()
};

// -------------------------------------------------------------
// SRE War Room Incidents (6 Simulated Scenarios)
// -------------------------------------------------------------
export interface SreIncidentScenario {
  id: string;
  code: string;
  title: string;
  severity: 'P1' | 'P2' | 'P3';
  impactDescription: string;
  symptoms: string[];
  mockLogs: { timestamp: string; level: 'FATAL' | 'ERROR' | 'WARN' | 'INFO'; message: string }[];
  diagnosticChecks: { id: string; label: string; command: string; output: string }[];
  mitigationOptions: {
    id: string;
    actionName: string;
    tradeoffSummary: string;
    isCorrect: boolean;
    consequenceExplanation: string;
    statePatch?: Partial<OfflineCloudSimulationState>;
  }[];
  postMortemTemplate: {
    rootCause: string;
    preventativeMeasures: string[];
    lessonsLearned: string;
  };
}

export const SEED_SRE_INCIDENTS: SreIncidentScenario[] = [
  {
    id: 'inc-101',
    code: 'INC-101',
    title: 'Publicly Exposed Storage Bucket Leaking Customer Telemetry',
    severity: 'P1',
    impactDescription: 'External threat telemetry indicates open GET requests indexing unencrypted customer data from an Amazon S3 bucket.',
    symptoms: [
      'CloudWatch Alarm S3-Public-Bucket-Detection is firing in ALARM state.',
      'S3 Access Logs reveal unauthenticated IP addresses downloading telemetry_export_202611.json.',
      'Regulatory compliance audit alert for unauthorized public exposure.'
    ],
    mockLogs: [
      { timestamp: '05:30:12', level: 'WARN', message: 'S3 Access Log: 198.51.100.42 GET /telemetry_export_202611.json HTTP/1.1 200 OK (Anonymous)' },
      { timestamp: '05:30:18', level: 'ERROR', message: 'CIS Benchmark Alert: Bucket skillpath-customer-exports-backup has public read ACL' },
      { timestamp: '05:30:25', level: 'FATAL', message: 'Data Governance: PII detected in publicly accessible object storage' }
    ],
    diagnosticChecks: [
      {
        id: 'diag-1',
        label: 'Inspect Bucket Public Access Settings',
        command: 'aws s3api get-public-access-block --bucket skillpath-customer-exports-backup',
        output: '{\n  "PublicAccessBlockConfiguration": {\n    "BlockPublicAcls": false,\n    "IgnorePublicAcls": false,\n    "BlockPublicPolicy": false,\n    "RestrictPublicBuckets": false\n  }\n}'
      },
      {
        id: 'diag-2',
        label: 'List Bucket Policy Statements',
        command: 'aws s3api get-bucket-policy --bucket skillpath-customer-exports-backup',
        output: '{\n  "Statement": [{\n    "Effect": "Allow",\n    "Principal": "*",\n    "Action": "s3:GetObject",\n    "Resource": "arn:aws:s3:::skillpath-customer-exports-backup/*"\n  }]\n}'
      }
    ],
    mitigationOptions: [
      {
        id: 'act-101-a',
        actionName: 'Enable S3 Block Public Access & Remove Public Policy',
        tradeoffSummary: 'Instantly revokes public read permissions without taking service offline.',
        isCorrect: true,
        consequenceExplanation: 'Excellent mitigation. Enabling Block Public Access on all 4 dimensions instantly closes the leak, cutting off anonymous GET requests and passing CIS compliance checks.'
      },
      {
        id: 'act-101-b',
        actionName: 'Delete the entire S3 bucket immediately',
        tradeoffSummary: 'Eliminates exposure but causes irrecoverable customer data loss.',
        isCorrect: false,
        consequenceExplanation: 'Severe overreaction: deleting the bucket destroyed historical customer export files, creating an outage and data-loss emergency.'
      },
      {
        id: 'act-101-c',
        actionName: 'Rename the files to obscure random strings',
        tradeoffSummary: 'Security through obscurity; bucket remains publicly indexable.',
        isCorrect: false,
        consequenceExplanation: 'Ineffective: security through obscurity fails compliance. The bucket remains publicly enumerable via ListBucket.'
      }
    ],
    postMortemTemplate: {
      rootCause: 'An administrative bucket upload script overrode the default S3 Block Public Access setting using --acl public-read.',
      preventativeMeasures: [
        'Enforce SCP (Service Control Policy) disallowing s3:PutBucketAcl with public principals.',
        'Integrate AWS Config automated auto-remediation rule s3-bucket-public-read-prohibited.'
      ],
      lessonsLearned: 'Infrastructure defaults must be enforced at the organization root, not left to individual developer scripts.'
    }
  },
  {
    id: 'inc-102',
    code: 'INC-102',
    title: 'Production Web Cluster CPU Exhaustion (99.8%) & 503 Outage',
    severity: 'P1',
    impactDescription: 'Incoming traffic surge has pushed both API cluster instances to 99.8% CPU utilization. Application Load Balancer is returning 503 Service Unavailable.',
    symptoms: [
      'CPUUtilization sustained at >99% across prod-api-cluster-01 and prod-api-cluster-02.',
      'ALB HTTP 503 count exceeded 2,400 requests/minute.',
      'Auto Scaling Group is capped at desired capacity 2 due to max size limit.'
    ],
    mockLogs: [
      { timestamp: '05:31:02', level: 'FATAL', message: 'OS Kernel: Node.js process 1284 unresponsive, call stack starved' },
      { timestamp: '05:31:10', level: 'ERROR', message: 'ALB Target Group: Health check failed for target i-0a12b34c56d78e01: Connection timeout (5000ms)' },
      { timestamp: '05:31:15', level: 'ERROR', message: 'AutoScaling: Failed to launch new instance - Current size (2) equals MaxSize (2)' }
    ],
    diagnosticChecks: [
      {
        id: 'diag-102-1',
        label: 'Query Auto Scaling Group Capacity Limits',
        command: 'aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names asg-prod-api',
        output: '{\n  "MinSize": 2,\n  "MaxSize": 2,\n  "DesiredCapacity": 2,\n  "Instances": ["i-0a12b34c56d78e01", "i-0a12b34c56d78e02"]\n}'
      },
      {
        id: 'diag-102-2',
        label: 'Inspect Server Process Resource Usage',
        command: 'ssh ec2-user@10.0.1.18 "top -b -n 1 | head -n 12"',
        output: 'PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n1284 node      20   0 1482012 892014  24128 R  99.8  89.4  14:22.18 node server.js'
      }
    ],
    mitigationOptions: [
      {
        id: 'act-102-a',
        actionName: 'Increase ASG Max Capacity to 6 & Trigger Desired Scale to 4',
        tradeoffSummary: 'Allows horizontal scale-out to absorb ingress traffic across 4 nodes.',
        isCorrect: true,
        consequenceExplanation: 'Optimal decision: unlocking ASG MaxSize allows horizontal autoscaling to distribute the load across new healthy instances, dropping CPU to 45%.'
      },
      {
        id: 'act-102-b',
        actionName: 'Reboot both EC2 instances simultaneously',
        tradeoffSummary: 'Clears memory temporarily but guarantees 100% complete downtime.',
        isCorrect: false,
        consequenceExplanation: 'Incorrect: rebooting both instances at once caused an absolute total outage. Once restarted, traffic immediately crashed them again.'
      },
      {
        id: 'act-102-c',
        actionName: 'Drop all inbound traffic at the Security Group level',
        tradeoffSummary: 'Relieves CPU but shuts down service for all legitimate users.',
        isCorrect: false,
        consequenceExplanation: 'Dropping all inbound traffic stopped CPU exhaustion but achieved the exact same result as the outage: zero user access.'
      }
    ],
    postMortemTemplate: {
      rootCause: 'Auto Scaling Group was configured with MaxSize equal to DesiredCapacity (2), preventing reactive scale-out under flash crowds.',
      preventativeMeasures: [
        'Set ASG MaxSize to at least 3x DesiredCapacity with dynamic target tracking at 70% CPU.',
        'Implement Cloudflare edge caching for static API payloads.'
      ],
      lessonsLearned: 'Static capacity caps negate the primary resilience benefit of cloud autoscaling.'
    }
  },
  {
    id: 'inc-103',
    code: 'INC-103',
    title: 'PostgreSQL Database Connection Pool Exhaustion & 504 Timeouts',
    severity: 'P2',
    impactDescription: 'API microservices cannot acquire connection handles from PostgreSQL primary. Client queries queue up and timeout at 30 seconds.',
    symptoms: [
      'Database active connections count pegged at 100/100 (max_connections reached).',
      'API logs displaying error: "remaining connection slots are reserved for non-replication superuser connections".',
      'ALB P99 latency spiked from 45ms to 31,000ms.'
    ],
    mockLogs: [
      { timestamp: '05:33:01', level: 'ERROR', message: 'PostgreSQL: FATAL - 53300: sorry, too many clients already' },
      { timestamp: '05:33:14', level: 'WARN', message: 'Node.js pg-pool: Connection acquisition timed out after 30000ms' },
      { timestamp: '05:33:22', level: 'ERROR', message: 'HTTP 504 Gateway Timeout returned on /api/v1/user/profile' }
    ],
    diagnosticChecks: [
      {
        id: 'diag-103-1',
        label: 'Query Active Connections by Client State',
        command: 'psql -c "SELECT state, count(*) FROM pg_stat_activity GROUP BY state;"',
        output: 'state  | count\n-------+------\nidle   |    88\nactive |    12\n(Total: 100 max_connections)'
      }
    ],
    mitigationOptions: [
      {
        id: 'act-103-a',
        actionName: 'Enable AWS RDS Proxy / PgBouncer connection multiplexing and kill idle connections',
        tradeoffSummary: 'Multiplexes hundreds of ephemeral application connections over a small pool of warm database connections.',
        isCorrect: true,
        consequenceExplanation: 'Correct resolution: RDS Proxy or PgBouncer handles connection pooling efficiently, reusing connections and preventing idle connection leakage.'
      },
      {
        id: 'act-103-b',
        actionName: 'Hard-kill the PostgreSQL primary instance',
        tradeoffSummary: 'Risks WAL corruption and uncommitted transaction rollback.',
        isCorrect: false,
        consequenceExplanation: 'Abruptly terminating the database caused crash-recovery replay delays and lost uncommitted user transactions.'
      }
    ],
    postMortemTemplate: {
      rootCause: 'Node.js serverless functions opened independent DB connections without connection pooling, leaking idle connections.',
      preventativeMeasures: [
        'Place AWS RDS Proxy between API handlers and PostgreSQL.',
        'Configure idle_in_transaction_session_timeout to 10 seconds.'
      ],
      lessonsLearned: 'Connection pools must be managed centrally when backend services scale horizontally.'
    }
  },
  {
    id: 'inc-104',
    code: 'INC-104',
    title: 'NAT Gateway Route Table Blackhole Causing Backend Isolation',
    severity: 'P2',
    impactDescription: 'Private subnet microservices cannot reach external third-party payment APIs, GitHub webhooks, or public registries.',
    symptoms: [
      'Outbound curl requests from private app subnets hang indefinitely.',
      'Payment processing webhooks failing with ETIMEDOUT.',
      'VPC Route Table route 0.0.0.0/0 targets a deleted or mismatched NAT gateway ID.'
    ],
    mockLogs: [
      { timestamp: '05:34:00', level: 'ERROR', message: 'PaymentGateway: Request to api.stripe.com failed: connect ETIMEDOUT 54.187.159.182:443' },
      { timestamp: '05:34:12', level: 'WARN', message: 'VPC Flow Logs: REJECT packets from 10.0.10.14 -> 54.187.159.182 (No route to host)' }
    ],
    diagnosticChecks: [
      {
        id: 'diag-104-1',
        label: 'Inspect Route Table for Private Subnets',
        command: 'aws ec2 describe-route-tables --route-table-ids rtb-priv',
        output: '{\n  "Routes": [\n    { "DestinationCidrBlock": "10.0.0.0/16", "GatewayId": "local" },\n    { "DestinationCidrBlock": "0.0.0.0/0", "NatGatewayId": "nat-deadbeef-deleted", "State": "blackhole" }\n  ]\n}'
      }
    ],
    mitigationOptions: [
      {
        id: 'act-104-a',
        actionName: 'Update route 0.0.0.0/0 to point to active NAT Gateway nat-prod-01',
        tradeoffSummary: 'Restores egress routing through healthy NAT Gateway immediately.',
        isCorrect: true,
        consequenceExplanation: 'Resolved: updating the route table replaced the blackhole route with the active NAT gateway in public subnet 1a, restoring outbound connectivity.'
      },
      {
        id: 'act-104-b',
        actionName: 'Attach an Internet Gateway directly to the private subnet',
        tradeoffSummary: 'Violates private subnet security architecture.',
        isCorrect: false,
        consequenceExplanation: 'Architectural violation: private subnets cannot directly route to an IGW without giving every instance a public IP, destroying security isolation.'
      }
    ],
    postMortemTemplate: {
      rootCause: 'A Terraform destroy on an experimental NAT gateway inadvertently orphaned the production route table pointer.',
      preventativeMeasures: [
        'Add lifecycle { prevent_destroy = true } on core networking modules.',
        'Use separate Terraform state files for VPC networking vs application compute.'
      ],
      lessonsLearned: 'Network route dependencies must be protected against accidental teardowns.'
    }
  },
  {
    id: 'inc-105',
    code: 'INC-105',
    title: 'IAM Compromise – Unauthorized Admin Policy Attached to Service User',
    severity: 'P1',
    impactDescription: 'Automated security inspector detected AdministratorAccess policy attached to developer-alex without MFA or change approval.',
    symptoms: [
      'CloudTrail log records AttachUserPolicy event with Action: "*", Resource: "*".',
      'User lacks Multi-Factor Authentication (MFA).',
      'CIS Benchmark 1.16 alert: IAM least-privilege violation.'
    ],
    mockLogs: [
      { timestamp: '05:35:01', level: 'FATAL', message: 'CloudTrail: AttachUserPolicy user=developer-alex policy=AdministratorAccess by IP=198.51.100.99' },
      { timestamp: '05:35:10', level: 'ERROR', message: 'AWS GuardDuty: IAMUser/AdministrativePermissionsAssigned without ticket reference' }
    ],
    diagnosticChecks: [
      {
        id: 'diag-105-1',
        label: 'List Policies for developer-alex',
        command: 'aws iam list-attached-user-policies --user-name developer-alex',
        output: '{\n  "AttachedPolicies": [\n    { "PolicyName": "AdministratorAccess", "PolicyArn": "arn:aws:iam::aws:policy/AdministratorAccess" },\n    { "PolicyName": "AmazonS3FullAccess", "PolicyArn": "arn:aws:iam::aws:policy/AmazonS3FullAccess" }\n  ]\n}'
      }
    ],
    mitigationOptions: [
      {
        id: 'act-105-a',
        actionName: 'Detach AdministratorAccess, enforce scoped developer role, and rotate access keys',
        tradeoffSummary: 'Revokes root privilege, enforces least-privilege, and prevents credential misuse.',
        isCorrect: true,
        consequenceExplanation: 'Perfect response: instantly revoked excessive administrative privileges, forced key rotation, and restored baseline developer access.'
      },
      {
        id: 'act-105-b',
        actionName: 'Leave policy as-is and email the user asking why they attached it',
        tradeoffSummary: 'Leaves active security vulnerability open indefinitely.',
        isCorrect: false,
        consequenceExplanation: 'Dangerous passivity: leaving active admin rights unmitigated during an ongoing security incident risks complete AWS account takeover.'
      }
    ],
    postMortemTemplate: {
      rootCause: 'Developer attached AdministratorAccess to unblock a build script rather than crafting a scoped IAM policy.',
      preventativeMeasures: [
        'Enforce IAM permissions boundaries preventing non-admin users from escalating policies.',
        'Mandate MFA for all IAM users with console or API access.'
      ],
      lessonsLearned: 'Least privilege must be enforced by automated boundaries, not developer discretion.'
    }
  },
  {
    id: 'inc-106',
    code: 'INC-106',
    title: 'Application Latency Spike from Unindexed Full Table Scans',
    severity: 'P2',
    impactDescription: 'New feature query on user_events table executes sequential scan on 4.2 million rows, locking database worker threads.',
    symptoms: [
      'P99 API response times escalated from 60ms to 5,400ms.',
      'RDS ReadIOPS spiked to 3,800 IOPS.',
      'Slow query log flooded with statements taking >4,200ms.'
    ],
    mockLogs: [
      { timestamp: '05:36:00', level: 'WARN', message: 'PostgreSQL: duration: 4210.821 ms  statement: SELECT * FROM user_events WHERE tenant_id = \'t_981\' AND created_at > NOW() - INTERVAL \'7 days\'' },
      { timestamp: '05:36:15', level: 'ERROR', message: 'API Latency: P99 threshold breached (5420ms > 1500ms limit)' }
    ],
    diagnosticChecks: [
      {
        id: 'diag-106-1',
        label: 'Run EXPLAIN ANALYZE on Slow Query',
        command: 'psql -c "EXPLAIN ANALYZE SELECT * FROM user_events WHERE tenant_id = \'t_981\' AND created_at > NOW() - INTERVAL \'7 days\';"',
        output: 'Seq Scan on user_events  (cost=0.00..89412.00 rows=1402 width=180) (actual time=4192.12..4208.41 rows=1400 loops=1)\n  Filter: ((tenant_id = \'t_981\'::text) AND (created_at > (now() - \'7 days\'::interval)))\n  Rows Removed by Filter: 4198600\nPlanning Time: 0.184 ms\nExecution Time: 4210.82 ms'
      }
    ],
    mitigationOptions: [
      {
        id: 'act-106-a',
        actionName: 'Create composite B-tree index on user_events (tenant_id, created_at DESC) CONCURRENTLY',
        tradeoffSummary: 'Transforms O(N) 4-million-row sequential scan into O(log N) B-tree lookup without locking writes.',
        isCorrect: true,
        consequenceExplanation: 'Superb engineering: the composite index reduced query execution time from 4,210ms to 1.8ms, dropping ReadIOPS and instantly stabilizing latency.'
      },
      {
        id: 'act-106-b',
        actionName: 'Double RDS instance size from db.t3.medium to db.r5.4xlarge',
        tradeoffSummary: 'Costly vertical scaling that masks the missing index problem temporarily.',
        isCorrect: false,
        consequenceExplanation: 'Anti-pattern: throwing expensive compute at unindexed O(N) full table scans wastes thousands of dollars without solving the root algorithmic flaw.'
      }
    ],
    postMortemTemplate: {
      rootCause: 'PR merged new analytics feature without staging database query EXPLAIN plan verification.',
      preventativeMeasures: [
        'Add automated migration linting checking for missing foreign key and tenant_id indexes.',
        'Set statement_timeout = 3000 to prevent long-running queries from starving thread pools.'
      ],
      lessonsLearned: 'Always verify query execution plans on production-sized datasets before merging.'
    }
  }
];

// -------------------------------------------------------------
// Placement Assessment Scenarios (5 Levels: Beginner to Pro)
// -------------------------------------------------------------
export interface PlacementQuestion {
  id: string;
  level: 1 | 2 | 3 | 4 | 5;
  levelTitle: string;
  dimension: 'technical' | 'problem_solving' | 'practical' | 'experience';
  scenario: string;
  codeOrDiagram?: string;
  options: { text: string; points: number; explanation: string }[];
}

export const SEED_PLACEMENT_SCENARIOS: PlacementQuestion[] = [
  {
    id: 'pq-1',
    level: 1,
    levelTitle: 'Level 1: Beginner / Fresher',
    dimension: 'technical',
    scenario: 'You are deploying your first web app with React frontend and Express backend. What is the fundamental role of HTTP CORS (Cross-Origin Resource Sharing)?',
    options: [
      { text: 'A browser security mechanism that restricts web pages from making API requests to a different domain/port unless the server explicitly permits it.', points: 10, explanation: 'Correct! CORS is enforced by browsers to prevent malicious scripts on one origin from making unauthorized requests to another origin.' },
      { text: 'A database query optimizer that speeds up REST API calls.', points: 0, explanation: 'Incorrect: CORS has nothing to do with database speed.' },
      { text: 'A cloud load balancer protocol for encrypting SSL certificates.', points: 0, explanation: 'Incorrect: CORS is an application-layer browser security policy.' }
    ]
  },
  {
    id: 'pq-2',
    level: 2,
    levelTitle: 'Level 2: Junior Learner',
    dimension: 'problem_solving',
    scenario: 'Your Node.js Express server is handling user file uploads. Occasionally, when a user uploads a 500MB video, the entire server crashes with JavaScript heap out of memory. How do you resolve this?',
    codeOrDiagram: 'app.post("/upload", (req, res) => {\n  let fileBuffer = Buffer.alloc(0);\n  req.on("data", chunk => fileBuffer = Buffer.concat([fileBuffer, chunk]));\n  req.on("end", () => fs.writeFileSync("video.mp4", fileBuffer));\n});',
    options: [
      { text: 'Stream the incoming request directly to disk or S3 via req.pipe(fs.createWriteStream("video.mp4")), buffering only small chunks with backpressure.', points: 10, explanation: 'Correct! Streaming avoids loading the entire 500MB payload into RAM, operating in a fixed small memory footprint.' },
      { text: 'Increase Node.js memory limit using --max-old-space-size=8192.', points: 4, explanation: 'Partial: Increasing heap size delays crashes but does not fix the underlying memory leak vulnerability.' },
      { text: 'Split the file into 100 separate HTTP POST requests manually.', points: 0, explanation: 'Ineffective and creates complex network overhead.' }
    ]
  },
  {
    id: 'pq-3',
    level: 3,
    levelTitle: 'Level 3: Intermediate Learner',
    dimension: 'practical',
    scenario: 'You are designing an AWS cloud infrastructure for an e-commerce API. You need to ensure the PostgreSQL database can never be accessed directly from the public internet, while backend EC2 instances can communicate with it and with the internet for payments. What is the proper VPC architecture?',
    options: [
      { text: 'Place EC2 instances in private subnets with a NAT Gateway in the public subnet for egress; place RDS in isolated private subnets with no internet gateway route.', points: 10, explanation: 'Standard enterprise cloud architecture: public subnet holds ALB and NAT Gateway; private subnets hold compute; isolated subnets hold data.' },
      { text: 'Put EC2 and RDS both in public subnets with 0.0.0.0/0 ingress open on all ports.', points: 0, explanation: 'Critical security violation: exposing databases directly to the public internet invites credential brute-forcing.' },
      { text: 'Run PostgreSQL inside a Docker container on the same public EC2 instance as the frontend.', points: 3, explanation: 'Poor production design: single point of failure and lacks high availability.' }
    ]
  },
  {
    id: 'pq-4',
    level: 4,
    levelTitle: 'Level 4: Advanced Learner',
    dimension: 'technical',
    scenario: 'During high traffic, your PostgreSQL database experiences lock contention and connection pool exhaustion. Which pattern best isolates high-volume read traffic from critical transactional writes?',
    options: [
      { text: 'Deploy an RDS Multi-AZ Read Replica cluster: route heavy reporting & read queries to the replica endpoint while reserving the Primary instance for ACID write transactions.', points: 10, explanation: 'Correct! Read replicas offload analytical and read-heavy queries, preserving the primary for writes and reducing lock contention.' },
      { text: 'Disable all PostgreSQL foreign keys and transaction isolation.', points: 0, explanation: 'Dangerous: destroys data integrity and leads to corrupted orphaned records.' },
      { text: 'Increase the query timeout to 5 minutes so requests queue indefinitely.', points: 0, explanation: 'Anti-pattern: long timeouts cause connection pool starvation and massive cascade failures.' }
    ]
  },
  {
    id: 'pq-5',
    level: 5,
    levelTitle: 'Level 5: Professional / SRE',
    dimension: 'experience',
    scenario: 'In an incident where an API Load Balancer is returning HTTP 502 Bad Gateway under sudden traffic spikes, which diagnostic pipeline should an SRE execute first?',
    options: [
      { text: 'Inspect ALB target group health check metrics, check target instance CPU/RAM utilization, verify backend process event loop latency, and check socket backlog queue drops.', points: 10, explanation: 'Exemplary SRE methodology: HTTP 502 indicates the ALB cannot establish or maintain connections with backend targets. Systematic target group and socket inspection reveals root cause.' },
      { text: 'Instantly delete and recreate the Application Load Balancer.', points: 0, explanation: 'Guarantees extended downtime and deletes active DNS configurations.' },
      { text: 'Post a tweet apologizing to users without checking server telemetry.', points: 0, explanation: 'Unacceptable engineering behavior.' }
    ]
  }
];

// -------------------------------------------------------------
// Interactive Terminal Quests
// -------------------------------------------------------------
export interface TerminalQuest {
  id: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  targetCommandPattern: string; // regex or prefix
  hint: string;
  expectedOutputSnippet: string;
  xpReward: number;
}

export const SEED_TERMINAL_QUESTS: TerminalQuest[] = [
  {
    id: 'tq-1',
    title: 'Audit Active Cloud Caller Identity',
    difficulty: 'Beginner',
    description: 'Verify your current IAM authentication context and account credentials using the AWS STS service.',
    targetCommandPattern: 'aws sts get-caller-identity',
    hint: 'Type: aws sts get-caller-identity',
    expectedOutputSnippet: 'arn:aws:iam::123456789012:user/devops-lead',
    xpReward: 50
  },
  {
    id: 'tq-2',
    title: 'Inspect Running Compute Instances',
    difficulty: 'Beginner',
    description: 'List all running EC2 virtual machines in the default region to check their state and IP addresses.',
    targetCommandPattern: 'aws ec2 describe-instances',
    hint: 'Type: aws ec2 describe-instances',
    expectedOutputSnippet: 'prod-api-cluster-01',
    xpReward: 75
  },
  {
    id: 'tq-3',
    title: 'Audit Object Storage Buckets',
    difficulty: 'Intermediate',
    description: 'List all Amazon S3 storage buckets in the account to verify bucket names and creation dates.',
    targetCommandPattern: 'aws s3 ls',
    hint: 'Type: aws s3 ls',
    expectedOutputSnippet: 'skillpath-prod-static-assets',
    xpReward: 100
  },
  {
    id: 'tq-4',
    title: 'Audit IAM User Accounts & Credentials',
    difficulty: 'Intermediate',
    description: 'Retrieve the list of all IAM users in the account to inspect active credentials.',
    targetCommandPattern: 'aws iam list-users',
    hint: 'Type: aws iam list-users',
    expectedOutputSnippet: 'devops-lead',
    xpReward: 100
  },
  {
    id: 'tq-5',
    title: 'Inspect VPC Network Topology',
    difficulty: 'Advanced',
    description: 'Describe all Virtual Private Clouds (VPCs) to check the primary CIDR block configuration.',
    targetCommandPattern: 'aws ec2 describe-vpcs',
    hint: 'Type: aws ec2 describe-vpcs',
    expectedOutputSnippet: '10.0.0.0/16',
    xpReward: 150
  }
];

// -------------------------------------------------------------
// Verified Proof of Work Credentials
// -------------------------------------------------------------
import { OfflinePortfolioCredential } from './indexedDb';

export const SEED_PORTFOLIO_CREDENTIALS: OfflinePortfolioCredential[] = [
  {
    id: 'cred-101',
    userId: 'user-student',
    credentialId: 'SKILLPATH-V9824-AWS',
    title: 'Cloud Architecture & Multi-AZ VPC Design',
    skillCategory: 'Cloud & Infrastructure',
    verificationHash: '9f83ab2e4c1970d8a5621ef0021c798e4d293f0b29841da924c76b92a15f0134',
    scorePercentage: 94,
    issuedDate: '2026-11-10T14:30:00Z',
    status: 'Verified',
    verifiedByAgent: 'Cloud Architecture Agent',
    skillsCovered: ['VPC Subnetting', 'NAT Gateways', 'EC2 Auto Scaling', 'IAM Least Privilege'],
    evidenceSummary: 'Successfully configured 2-tier high-availability VPC with private data subnets, resilient ALB target groups, and strict egress route tables.'
  },
  {
    id: 'cred-102',
    userId: 'user-student',
    credentialId: 'SKILLPATH-V8412-SRE',
    title: 'SRE Incident Commander: Public Storage Leak Mitigation',
    skillCategory: 'DevOps & SRE',
    verificationHash: 'c7120a84e29b11928374d6f8812e99a4c1029384756b1029384756a1b2c3d4e5',
    scorePercentage: 98,
    issuedDate: '2026-11-12T09:15:00Z',
    status: 'Verified',
    verifiedByAgent: 'Incident Analysis Agent',
    skillsCovered: ['Incident Response', 'S3 Bucket Policies', 'CIS Benchmark Audit', 'MTTR Optimization'],
    evidenceSummary: 'Diagnosed unauthorized anonymous read traffic on S3 telemetry bucket in INC-101, applied Block Public Access in 2m 14s, and filed compliant post-mortem report.'
  },
  {
    id: 'cred-103',
    userId: 'user-student',
    credentialId: 'SKILLPATH-V7301-FS',
    title: 'Full Stack Asynchronous Systems & Streams Mastery',
    skillCategory: 'Software Engineering',
    verificationHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    scorePercentage: 92,
    issuedDate: '2026-11-04T16:00:00Z',
    status: 'Verified',
    verifiedByAgent: 'Assessment Agent',
    skillsCovered: ['JavaScript Event Loop', 'Node.js Backpressure Streams', 'PostgreSQL B-Tree Indexing'],
    evidenceSummary: 'Demonstrated mastery across call stack scheduling, stream backpressure pipelines, and EXPLAIN ANALYZE query index tuning.'
  }
];
