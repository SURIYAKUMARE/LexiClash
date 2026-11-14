import { CareerRole, Question, LearningResource } from './types.js';

export const SEED_CAREER_ROLES: CareerRole[] = [
  {
    id: 'role-fullstack',
    title: 'Full Stack Developer',
    category: 'Software Engineering',
    description: 'Builds end-to-end web applications, designing interactive client frontends, scalable server APIs, and database architectures.',
    shortDescription: 'Master modern frontend & backend architectures to build full-scale web applications.',
    marketDemand: 'Very High',
    salaryRange: '$85,000 - $145,000',
    typicalRoles: ['Junior Full Stack Engineer', 'Full Stack Software Engineer', 'Web Applications Developer'],
    dailyResponsibilities: [
      'Architect and build responsive user interfaces in React or Next.js',
      'Design RESTful and GraphQL APIs with Node.js/Express or Python/FastAPI',
      'Model and query relational and NoSQL databases with PostgreSQL and MongoDB',
      'Implement authentication, authorization, and secure state management',
      'Deploy applications using Docker, CI/CD pipelines, and cloud hosting'
    ],
    prerequisites: ['Basic HTML/CSS/JS knowledge', 'General programming logic'],
    requiredSkills: [
      { skillName: 'JavaScript', category: 'languages', benchmarkLevel: 4, weight: 3.0, importance: 'critical' },
      { skillName: 'TypeScript', category: 'languages', benchmarkLevel: 3, weight: 2.5, importance: 'important' },
      { skillName: 'React', category: 'frameworks', benchmarkLevel: 4, weight: 3.0, importance: 'critical' },
      { skillName: 'Node.js', category: 'frameworks', benchmarkLevel: 3, weight: 2.5, importance: 'critical' },
      { skillName: 'SQL / PostgreSQL', category: 'databases', benchmarkLevel: 3, weight: 2.5, importance: 'important' },
      { skillName: 'Git & Version Control', category: 'other', benchmarkLevel: 3, weight: 2.0, importance: 'critical' },
      { skillName: 'REST API Design', category: 'frameworks', benchmarkLevel: 3, weight: 2.0, importance: 'important' }
    ],
    optionalSkills: [
      { skillName: 'Docker', category: 'cloud', benchmarkLevel: 2, weight: 1.5, importance: 'nice_to_have' },
      { skillName: 'Tailwind CSS', category: 'frameworks', benchmarkLevel: 3, weight: 1.5, importance: 'nice_to_have' },
      { skillName: 'Testing (Jest/Vitest)', category: 'other', benchmarkLevel: 3, weight: 1.5, importance: 'nice_to_have' },
      { skillName: 'GraphQL', category: 'frameworks', benchmarkLevel: 2, weight: 1.0, importance: 'nice_to_have' }
    ]
  },
  {
    id: 'role-aiml',
    title: 'AI/ML Engineer',
    category: 'Artificial Intelligence',
    description: 'Designs, trains, deploys, and monitors machine learning models and generative AI systems in production.',
    shortDescription: 'Train deep learning models, fine-tune LLMs, and deploy AI systems to production.',
    marketDemand: 'Very High',
    salaryRange: '$110,000 - $185,000',
    typicalRoles: ['Machine Learning Engineer', 'Applied AI Researcher', 'LLM Application Engineer'],
    dailyResponsibilities: [
      'Process, clean, and engineer features from massive tabular, text, and image datasets',
      'Train supervised and unsupervised models using PyTorch, TensorFlow, and Scikit-learn',
      'Build RAG pipelines, prompt systems, and fine-tune LLM embeddings',
      'Serve models with low latency using FastAPI, Triton, or ONNX runtime',
      'Monitor model drift, hallucination metrics, and inference costs'
    ],
    prerequisites: ['Linear algebra & calculus', 'Python programming proficiency'],
    requiredSkills: [
      { skillName: 'Python', category: 'languages', benchmarkLevel: 4, weight: 3.0, importance: 'critical' },
      { skillName: 'Machine Learning (Scikit-Learn)', category: 'analytics', benchmarkLevel: 3, weight: 2.5, importance: 'critical' },
      { skillName: 'Deep Learning (PyTorch)', category: 'frameworks', benchmarkLevel: 3, weight: 3.0, importance: 'critical' },
      { skillName: 'Data Analysis (Pandas & NumPy)', category: 'analytics', benchmarkLevel: 4, weight: 2.5, importance: 'critical' },
      { skillName: 'Mathematics & Statistics', category: 'other', benchmarkLevel: 3, weight: 2.0, importance: 'important' },
      { skillName: 'Model Deployment & APIs', category: 'cloud', benchmarkLevel: 3, weight: 2.0, importance: 'important' }
    ],
    optionalSkills: [
      { skillName: 'Docker & Kubernetes', category: 'cloud', benchmarkLevel: 2, weight: 1.5, importance: 'nice_to_have' },
      { skillName: 'LangChain & Vector DBs', category: 'frameworks', benchmarkLevel: 3, weight: 2.0, importance: 'important' },
      { skillName: 'MLOps (MLflow, Weights & Biases)', category: 'other', benchmarkLevel: 2, weight: 1.5, importance: 'nice_to_have' }
    ]
  },
  {
    id: 'role-data-analyst',
    title: 'Data Analyst',
    category: 'Data & Analytics',
    description: 'Transforms raw business data into actionable dashboards, KPIs, statistical findings, and strategic recommendations.',
    shortDescription: 'Uncover business insights, query massive datasets, and craft compelling visual narratives.',
    marketDemand: 'High',
    salaryRange: '$65,000 - $105,000',
    typicalRoles: ['Business Data Analyst', 'Operations Analyst', 'Product Intelligence Analyst'],
    dailyResponsibilities: [
      'Write complex SQL queries, window functions, and aggregations across enterprise data warehouses',
      'Create interactive executive dashboards in Tableau, PowerBI, or Metabase',
      'Perform exploratory data analysis and hypothesis testing in Python or R',
      'Partner with cross-functional stakeholders to translate business questions into data models',
      'Automate regular metrics reporting and anomaly detection pipelines'
    ],
    prerequisites: ['Basic math & statistics', 'Familiarity with spreadsheets'],
    requiredSkills: [
      { skillName: 'SQL / PostgreSQL', category: 'databases', benchmarkLevel: 4, weight: 3.0, importance: 'critical' },
      { skillName: 'Data Visualization (Tableau/PowerBI)', category: 'analytics', benchmarkLevel: 3, weight: 2.5, importance: 'critical' },
      { skillName: 'Python', category: 'languages', benchmarkLevel: 3, weight: 2.0, importance: 'important' },
      { skillName: 'Data Analysis (Pandas & NumPy)', category: 'analytics', benchmarkLevel: 3, weight: 2.0, importance: 'important' },
      { skillName: 'Statistical Analysis', category: 'analytics', benchmarkLevel: 3, weight: 2.0, importance: 'important' },
      { skillName: 'Communication & Storytelling', category: 'soft_skills', benchmarkLevel: 4, weight: 2.0, importance: 'critical' }
    ],
    optionalSkills: [
      { skillName: 'dbt (Data Build Tool)', category: 'analytics', benchmarkLevel: 2, weight: 1.5, importance: 'nice_to_have' },
      { skillName: 'Excel / Google Sheets Modeling', category: 'analytics', benchmarkLevel: 4, weight: 1.5, importance: 'nice_to_have' },
      { skillName: 'BigQuery / Snowflake', category: 'cloud', benchmarkLevel: 2, weight: 1.5, importance: 'nice_to_have' }
    ]
  },
  {
    id: 'role-data-scientist',
    title: 'Data Scientist',
    category: 'Data & Analytics',
    description: 'Combines computer science, predictive modeling, experimental design, and statistics to solve complex analytical problems.',
    shortDescription: 'Harness predictive statistics, A/B testing, and machine learning to build data-driven algorithms.',
    marketDemand: 'High',
    salaryRange: '$100,000 - $160,000',
    typicalRoles: ['Applied Data Scientist', 'Decision Scientist', 'Product Data Scientist'],
    dailyResponsibilities: [
      'Formulate analytical hypotheses, design robust A/B tests, and analyze causal inference',
      'Build predictive classification, regression, and clustering algorithms in Python',
      'Work with engineers to productionize data features and pipeline transformations',
      'Present mathematical findings to executives with clear business impact statements'
    ],
    prerequisites: ['Multivariate calculus & probability', 'Strong programming foundation'],
    requiredSkills: [
      { skillName: 'Python', category: 'languages', benchmarkLevel: 4, weight: 3.0, importance: 'critical' },
      { skillName: 'SQL / PostgreSQL', category: 'databases', benchmarkLevel: 4, weight: 2.5, importance: 'critical' },
      { skillName: 'Statistical Modeling & Hypothesis Testing', category: 'analytics', benchmarkLevel: 4, weight: 3.0, importance: 'critical' },
      { skillName: 'Machine Learning (Scikit-Learn)', category: 'analytics', benchmarkLevel: 3, weight: 2.5, importance: 'critical' },
      { skillName: 'Data Analysis (Pandas & NumPy)', category: 'analytics', benchmarkLevel: 4, weight: 2.0, importance: 'important' }
    ],
    optionalSkills: [
      { skillName: 'Deep Learning (PyTorch)', category: 'frameworks', benchmarkLevel: 2, weight: 1.5, importance: 'nice_to_have' },
      { skillName: 'Spark / Big Data', category: 'analytics', benchmarkLevel: 2, weight: 1.5, importance: 'nice_to_have' },
      { skillName: 'A/B Experimentation', category: 'analytics', benchmarkLevel: 3, weight: 2.0, importance: 'important' }
    ]
  },
  {
    id: 'role-cloud-engineer',
    title: 'Cloud Engineer',
    category: 'Cloud & Infrastructure',
    description: 'Architects, secures, deploys, and optimizes scalable multi-cloud infrastructure and distributed server architectures.',
    shortDescription: 'Design scalable, highly-available infrastructure across AWS, Azure, and Google Cloud.',
    marketDemand: 'Very High',
    salaryRange: '$95,000 - $155,000',
    typicalRoles: ['Cloud Solutions Architect', 'Cloud Infrastructure Engineer', 'Cloud Systems Admin'],
    dailyResponsibilities: [
      'Provision cloud infrastructure with Terraform and CloudFormation',
      'Configure VPCs, IAM policies, security groups, subnets, and routing tables',
      'Optimize compute costs and establish high-availability multi-region failovers',
      'Manage container orchestration clusters using Kubernetes (EKS/GKE)'
    ],
    prerequisites: ['Networking fundamentals (TCP/IP, DNS, SSL)', 'Linux CLI proficiency'],
    requiredSkills: [
      { skillName: 'AWS / Cloud Architecture', category: 'cloud', benchmarkLevel: 4, weight: 3.0, importance: 'critical' },
      { skillName: 'Linux & Bash Scripting', category: 'other', benchmarkLevel: 4, weight: 2.5, importance: 'critical' },
      { skillName: 'Infrastructure as Code (Terraform)', category: 'cloud', benchmarkLevel: 3, weight: 2.5, importance: 'critical' },
      { skillName: 'Docker & Containerization', category: 'cloud', benchmarkLevel: 3, weight: 2.5, importance: 'important' },
      { skillName: 'Cloud Security & Networking', category: 'cloud', benchmarkLevel: 3, weight: 2.0, importance: 'important' }
    ],
    optionalSkills: [
      { skillName: 'Kubernetes', category: 'cloud', benchmarkLevel: 3, weight: 2.0, importance: 'important' },
      { skillName: 'Python Scripting', category: 'languages', benchmarkLevel: 3, weight: 1.5, importance: 'nice_to_have' },
      { skillName: 'CI/CD Pipelines', category: 'other', benchmarkLevel: 3, weight: 1.5, importance: 'nice_to_have' }
    ]
  },
  {
    id: 'role-cybersecurity',
    title: 'Cybersecurity Analyst',
    category: 'Security',
    description: 'Safeguards organizations against cyber threats, conducts vulnerability assessments, investigates security incidents, and enforces compliance.',
    shortDescription: 'Defend systems from intrusion, audit vulnerabilities, and ensure resilient security postures.',
    marketDemand: 'Very High',
    salaryRange: '$85,000 - $140,000',
    typicalRoles: ['SOC Analyst', 'Information Security Specialist', 'Penetration Tester'],
    dailyResponsibilities: [
      'Monitor SIEM logs, firewalls, and intrusion detection systems for active threats',
      'Perform regular vulnerability scans and penetration tests on networks and web apps',
      'Coordinate incident response protocols and forensic evidence collection',
      'Implement zero-trust access policies, multi-factor auth, and encryption standards'
    ],
    prerequisites: ['Operating systems & protocols', 'Ethical hacking concepts'],
    requiredSkills: [
      { skillName: 'Network Security & Protocols', category: 'other', benchmarkLevel: 4, weight: 3.0, importance: 'critical' },
      { skillName: 'Linux & Terminal Operations', category: 'other', benchmarkLevel: 3, weight: 2.5, importance: 'critical' },
      { skillName: 'Vulnerability Assessment & Penetration Testing', category: 'other', benchmarkLevel: 3, weight: 2.5, importance: 'critical' },
      { skillName: 'SIEM & Log Analysis (Splunk/ELK)', category: 'analytics', benchmarkLevel: 3, weight: 2.0, importance: 'important' },
      { skillName: 'Security Compliance (OWASP, NIST)', category: 'other', benchmarkLevel: 3, weight: 2.0, importance: 'important' }
    ],
    optionalSkills: [
      { skillName: 'Python for Security Scripting', category: 'languages', benchmarkLevel: 3, weight: 1.5, importance: 'nice_to_have' },
      { skillName: 'Cloud Security (AWS IAM)', category: 'cloud', benchmarkLevel: 2, weight: 1.5, importance: 'nice_to_have' },
      { skillName: 'Cryptography Fundamentals', category: 'other', benchmarkLevel: 2, weight: 1.0, importance: 'nice_to_have' }
    ]
  },
  {
    id: 'role-devops',
    title: 'DevOps Engineer',
    category: 'Cloud & Infrastructure',
    description: 'Unifies software development and IT operations by building automated CI/CD pipelines, container orchestration, and real-time observability.',
    shortDescription: 'Automate build pipelines, orchestrate Kubernetes clusters, and maximize release velocity.',
    marketDemand: 'Very High',
    salaryRange: '$100,000 - $160,000',
    typicalRoles: ['Site Reliability Engineer (SRE)', 'Build & Release Engineer', 'DevOps Specialist'],
    dailyResponsibilities: [
      'Build and maintain robust CI/CD pipelines with GitHub Actions or GitLab CI',
      'Manage microservice deployments across Kubernetes clusters with Helm and ArgoCD',
      'Implement observability stacks using Prometheus, Grafana, and OpenTelemetry',
      'Automate environment provisioning and drift remediation with Ansible and Terraform'
    ],
    prerequisites: ['Linux administration', 'Basic coding/scripting'],
    requiredSkills: [
      { skillName: 'Linux & Bash Scripting', category: 'other', benchmarkLevel: 4, weight: 3.0, importance: 'critical' },
      { skillName: 'Docker & Containerization', category: 'cloud', benchmarkLevel: 4, weight: 3.0, importance: 'critical' },
      { skillName: 'Kubernetes', category: 'cloud', benchmarkLevel: 3, weight: 3.0, importance: 'critical' },
      { skillName: 'CI/CD Pipelines (GitHub Actions)', category: 'other', benchmarkLevel: 4, weight: 2.5, importance: 'critical' },
      { skillName: 'Infrastructure as Code (Terraform)', category: 'cloud', benchmarkLevel: 3, weight: 2.0, importance: 'important' },
      { skillName: 'Monitoring & Observability (Prometheus/Grafana)', category: 'analytics', benchmarkLevel: 3, weight: 2.0, importance: 'important' }
    ],
    optionalSkills: [
      { skillName: 'Python or Go Scripting', category: 'languages', benchmarkLevel: 3, weight: 1.5, importance: 'nice_to_have' },
      { skillName: 'GitOps (ArgoCD)', category: 'cloud', benchmarkLevel: 2, weight: 1.5, importance: 'nice_to_have' }
    ]
  },
  {
    id: 'role-uiux',
    title: 'UI/UX Designer',
    category: 'Design & Product',
    description: 'Crafts intuitive, accessible, and delightful digital user experiences through user research, wireframing, design systems, and usability testing.',
    shortDescription: 'Design user-centric interfaces, interactive prototypes, and production design systems.',
    marketDemand: 'High',
    salaryRange: '$75,000 - $130,000',
    typicalRoles: ['Product Designer', 'User Experience Architect', 'Design Systems Specialist'],
    dailyResponsibilities: [
      'Conduct user interviews, surveys, and usability testing sessions',
      'Build wireframes, interactive Figma prototypes, and component libraries',
      'Establish unified design tokens, typography scales, and accessibility standards (WCAG)',
      'Collaborate closely with frontend engineers to ensure pixel-perfect implementation'
    ],
    prerequisites: ['Empathy & visual awareness', 'Basic design fundamentals'],
    requiredSkills: [
      { skillName: 'Figma & Prototyping', category: 'other', benchmarkLevel: 4, weight: 3.0, importance: 'critical' },
      { skillName: 'User Research & Usability Testing', category: 'soft_skills', benchmarkLevel: 3, weight: 2.5, importance: 'critical' },
      { skillName: 'Design Systems & Component Architecture', category: 'other', benchmarkLevel: 4, weight: 2.5, importance: 'critical' },
      { skillName: 'Information Architecture & Wireframing', category: 'other', benchmarkLevel: 3, weight: 2.0, importance: 'important' },
      { skillName: 'Accessibility & WCAG Compliance', category: 'other', benchmarkLevel: 3, weight: 2.0, importance: 'important' }
    ],
    optionalSkills: [
      { skillName: 'HTML & CSS Fundamentals', category: 'frameworks', benchmarkLevel: 3, weight: 1.5, importance: 'nice_to_have' },
      { skillName: 'Micro-animations & Motion Design', category: 'other', benchmarkLevel: 2, weight: 1.5, importance: 'nice_to_have' }
    ]
  },
  {
    id: 'role-software-eng',
    title: 'Software Engineer',
    category: 'Software Engineering',
    description: 'Applies engineering principles, algorithms, and software design patterns to develop reliable, maintainable enterprise systems.',
    shortDescription: 'Write clean, scalable code, optimize algorithms, and engineer robust software architectures.',
    marketDemand: 'Very High',
    salaryRange: '$90,000 - $150,000',
    typicalRoles: ['Core Software Engineer', 'Backend Developer', 'Systems Engineer'],
    dailyResponsibilities: [
      'Design clean, object-oriented or functional software architectures',
      'Analyze computational complexity and optimize algorithm bottlenecks',
      'Write comprehensive unit, integration, and regression test suites',
      'Conduct rigorous code reviews and adhere to continuous integration workflows'
    ],
    prerequisites: ['Computer science principles', 'Comfort with at least one programming language'],
    requiredSkills: [
      { skillName: 'Data Structures & Algorithms', category: 'other', benchmarkLevel: 4, weight: 3.0, importance: 'critical' },
      { skillName: 'Object-Oriented & Functional Design', category: 'other', benchmarkLevel: 3, weight: 2.5, importance: 'critical' },
      { skillName: 'Git & Version Control', category: 'other', benchmarkLevel: 3, weight: 2.0, importance: 'critical' },
      { skillName: 'Software Testing & Debugging', category: 'other', benchmarkLevel: 3, weight: 2.5, importance: 'important' },
      { skillName: 'SQL / Databases', category: 'databases', benchmarkLevel: 3, weight: 2.0, importance: 'important' }
    ],
    optionalSkills: [
      { skillName: 'System Design Fundamentals', category: 'other', benchmarkLevel: 3, weight: 2.0, importance: 'important' },
      { skillName: 'Java, C++, or Go', category: 'languages', benchmarkLevel: 3, weight: 2.0, importance: 'important' },
      { skillName: 'Concurrency & Multithreading', category: 'other', benchmarkLevel: 2, weight: 1.5, importance: 'nice_to_have' }
    ]
  }
];

export const SEED_QUESTIONS: Question[] = [
  // JavaScript
  {
    id: 'q-js-1',
    topic: 'JavaScript',
    skillName: 'JavaScript',
    difficulty: 'beginner',
    type: 'multiple_choice',
    question: 'What is the difference between "==" and "===" in JavaScript?',
    options: [
      'They are completely identical and interchangeable',
      '"==" checks value only with type coercion, while "===" checks value and type without coercion',
      '"===" is used exclusively for comparing objects and arrays',
      '"==" is faster than "===" in all JavaScript engines'
    ],
    correctOptionIndex: 1,
    explanation: 'The double equals (==) operator performs abstract equality comparison with type coercion if the operands are of different types. The triple equals (===) operator performs strict equality comparison with no type coercion.'
  },
  {
    id: 'q-js-2',
    topic: 'JavaScript',
    skillName: 'JavaScript',
    difficulty: 'intermediate',
    type: 'code_snippet',
    question: 'What will be output to the console when the following code executes?',
    codeSnippet: `console.log(1);
setTimeout(() => console.log(2), 0);
Promise.resolve().then(() => console.log(3));
console.log(4);`,
    options: [
      '1, 2, 3, 4',
      '1, 4, 2, 3',
      '1, 4, 3, 2',
      '1, 3, 4, 2'
    ],
    correctOptionIndex: 2,
    explanation: 'Synchronous statements run first (1, 4). Then the microtask queue (Promise.then) runs before the macrotask queue (setTimeout callback), producing 1, 4, 3, 2.'
  },
  {
    id: 'q-js-3',
    topic: 'JavaScript',
    skillName: 'JavaScript',
    difficulty: 'intermediate',
    type: 'multiple_choice',
    question: 'In JavaScript closures, what does an inner function retain access to?',
    options: [
      'Only global variables declared with var',
      'Its own scope, the outer enclosing function\'s lexical scope, and the global scope',
      'Only the parameters explicitly passed into the inner function',
      'A cloned snapshot of primitive values at execution time'
    ],
    correctOptionIndex: 1,
    explanation: 'A closure is the combination of a function bundled together with references to its surrounding state (the lexical environment). An inner function has access to variables in its own scope, its outer functions, and global scope.'
  },
  {
    id: 'q-js-4',
    topic: 'JavaScript',
    skillName: 'JavaScript',
    difficulty: 'advanced',
    type: 'code_snippet',
    question: 'What does this JavaScript generator expression evaluate to?',
    codeSnippet: `function* idGen() {
  let id = 1;
  while (true) {
    yield id++;
  }
}
const gen = idGen();
console.log(gen.next().value, gen.next().value);`,
    options: [
      '1 1',
      '1 2',
      'undefined undefined',
      'Throws an infinite loop memory error'
    ],
    correctOptionIndex: 1,
    explanation: 'Generators execute lazily. Each call to gen.next() runs the generator function until the next yield statement, returning the value and pausing execution. The first call yields 1, and the second yields 2.'
  },

  // React
  {
    id: 'q-react-1',
    topic: 'React',
    skillName: 'React',
    difficulty: 'beginner',
    type: 'multiple_choice',
    question: 'Why should keys in React lists be unique and stable across renders?',
    options: [
      'To prevent CSS styles from clashing on adjacent list items',
      'To help React identify which items have changed, been added, or been removed during reconciliation',
      'React will throw a fatal compile-time syntax error without them',
      'Keys are used by the browser to allocate DOM memory'
    ],
    correctOptionIndex: 1,
    explanation: 'Keys provide a permanent identity to each element so React\'s virtual DOM diffing algorithm can accurately preserve component state and avoid re-rendering unmutated sibling nodes.'
  },
  {
    id: 'q-react-2',
    topic: 'React',
    skillName: 'React',
    difficulty: 'intermediate',
    type: 'code_snippet',
    question: 'What is the issue with this React useEffect implementation?',
    codeSnippet: `useEffect(() => {
  const timer = setInterval(() => {
    setCount(c => c + 1);
  }, 1000);
}, []);`,
    options: [
      'It has a memory leak because it does not return a cleanup function to clearInterval on unmount',
      'The dependency array cannot be empty in React 18',
      'setCount cannot accept a function argument',
      'setInterval does not work inside useEffect'
    ],
    correctOptionIndex: 0,
    explanation: 'Subscribing to timers or listeners inside useEffect must return a cleanup function (e.g., () => clearInterval(timer)) to prevent memory leaks and zombie intervals when the component unmounts.'
  },
  {
    id: 'q-react-3',
    topic: 'React',
    skillName: 'React',
    difficulty: 'advanced',
    type: 'multiple_choice',
    question: 'When is useMemo genuinely beneficial for performance optimization?',
    options: [
      'Wrap every single string and number variable in useMemo by default',
      'When recalculating expensive computational operations or preserving referential equality for dependency arrays of child components wrapped in memo',
      'Only when making asynchronous fetch API requests',
      'It replaces the need for useState in functional components'
    ],
    correctOptionIndex: 1,
    explanation: 'useMemo has memory and invocation overhead. It is beneficial when performing genuinely expensive calculations (e.g., sorting 10k items) or passing object/array references to memoized children to prevent unnecessary re-renders.'
  },

  // Python
  {
    id: 'q-py-1',
    topic: 'Python',
    skillName: 'Python',
    difficulty: 'beginner',
    type: 'multiple_choice',
    question: 'What is the primary difference between a Python list and a tuple?',
    options: [
      'Tuples can hold strings while lists can only hold numbers',
      'Lists are mutable (can be changed after creation), whereas tuples are immutable',
      'Tuples are indexed from 1, whereas lists are indexed from 0',
      'Lists cannot contain nested structures'
    ],
    correctOptionIndex: 1,
    explanation: 'In Python, lists are mutable sequences defined with square brackets [], whereas tuples are immutable sequences defined with parentheses (), meaning items cannot be added, removed, or reassigned after instantiation.'
  },
  {
    id: 'q-py-2',
    topic: 'Python',
    skillName: 'Python',
    difficulty: 'intermediate',
    type: 'code_snippet',
    question: 'What does the following Python list comprehension produce?',
    codeSnippet: `data = [1, 2, 3, 4, 5, 6]
result = [x**2 for x in data if x % 2 == 0]
print(result)`,
    options: [
      '[1, 4, 9, 16, 25, 36]',
      '[4, 16, 36]',
      '[2, 4, 6]',
      '[1, 9, 25]'
    ],
    correctOptionIndex: 1,
    explanation: 'The condition "if x % 2 == 0" filters only even numbers from data (2, 4, 6). The expression x**2 squares each: 2^2=4, 4^2=16, 6^2=36.'
  },
  {
    id: 'q-py-3',
    topic: 'Python',
    skillName: 'Python',
    difficulty: 'advanced',
    type: 'multiple_choice',
    question: 'What is the role of the Global Interpreter Lock (GIL) in standard CPython?',
    options: [
      'It encrypts Python bytecode during compilation',
      'It is a mutex that prevents multiple native threads from executing Python bytecodes at once',
      'It prevents files from being modified by two processes simultaneously',
      'It limits Python programs to using a maximum of 4GB of RAM'
    ],
    correctOptionIndex: 1,
    explanation: 'The GIL is a mechanism used by CPython to ensure thread-safe memory management. It allows only one OS thread to execute Python bytecode at a time, which is why multiprocessing or C extensions are typically used for CPU-bound parallelism.'
  },

  // SQL & Databases
  {
    id: 'q-sql-1',
    topic: 'SQL / Databases',
    skillName: 'SQL / PostgreSQL',
    difficulty: 'beginner',
    type: 'multiple_choice',
    question: 'What is the difference between WHERE and HAVING clauses in SQL?',
    options: [
      'WHERE and HAVING are completely identical aliases',
      'WHERE filters rows before aggregation, while HAVING filters aggregated groups created by GROUP BY',
      'HAVING only works on integer primary keys',
      'WHERE is only supported in SQLite, not PostgreSQL'
    ],
    correctOptionIndex: 1,
    explanation: 'The WHERE clause filters individual records before any grouping takes place. The HAVING clause filters the summarized groups that result from a GROUP BY clause.'
  },
  {
    id: 'q-sql-2',
    topic: 'SQL / Databases',
    skillName: 'SQL / PostgreSQL',
    difficulty: 'intermediate',
    type: 'code_snippet',
    question: 'What will this SQL query return?',
    codeSnippet: `SELECT department, AVG(salary) as avg_sal
FROM employees
GROUP BY department
HAVING AVG(salary) > 80000;`,
    options: [
      'All employees who individually earn more than 80,000',
      'Departments where the average salary among employees exceeds 80,000 along with their average salary',
      'The highest paid department and its minimum salary',
      'A syntax error because AVG cannot be placed in the HAVING clause'
    ],
    correctOptionIndex: 1,
    explanation: 'The query groups all rows by department, calculates the average salary for each department, and then filters to include only those departments whose average salary is strictly greater than 80,000.'
  },
  {
    id: 'q-sql-3',
    topic: 'SQL / Databases',
    skillName: 'SQL / PostgreSQL',
    difficulty: 'advanced',
    type: 'multiple_choice',
    question: 'In database transaction processing, what does the "I" in ACID stand for and guarantee?',
    options: [
      'Indexing: Ensures all columns have B-tree indices',
      'Isolation: Ensures concurrent execution of transactions leaves the database in the same state as if executed sequentially',
      'Iteration: Guarantees recursive queries terminate',
      'Immutability: Disallows updating historical records'
    ],
    correctOptionIndex: 1,
    explanation: 'Isolation guarantees that transactions are isolated from each other so that concurrent transactions do not observe intermediate, uncommitted states, preventing phenomena like dirty reads and phantom reads.'
  },

  // Git & DevOps / Cloud
  {
    id: 'q-git-1',
    topic: 'Git & Version Control',
    skillName: 'Git & Version Control',
    difficulty: 'beginner',
    type: 'multiple_choice',
    question: 'What is the command to create a new branch named "feature-login" and switch to it in Git?',
    options: [
      'git new branch feature-login',
      'git checkout -b feature-login (or git switch -c feature-login)',
      'git branch --switch feature-login',
      'git merge feature-login'
    ],
    correctOptionIndex: 1,
    explanation: 'Both "git checkout -b <name>" and the modern "git switch -c <name>" create the specified branch and immediately point HEAD to it.'
  },
  {
    id: 'q-devops-1',
    topic: 'Docker & DevOps',
    skillName: 'Docker',
    difficulty: 'intermediate',
    type: 'multiple_choice',
    question: 'What is the primary difference between a Docker Image and a Docker Container?',
    options: [
      'An image is a running process, while a container is a compiled binary file',
      'An image is a read-only template with instructions, while a container is a runnable, isolated instance of an image',
      'Containers can only run on Linux, while images can only run on Windows',
      'Images require a hypervisor, while containers do not'
    ],
    correctOptionIndex: 1,
    explanation: 'A Docker image is an immutable, layered blueprint containing application code, runtime, libraries, and dependencies. A container is a live, running instance of an image with a thin writable container layer.'
  },

  // Data Structures & Algorithms
  {
    id: 'q-dsa-1',
    topic: 'Data Structures & Algorithms',
    skillName: 'Data Structures & Algorithms',
    difficulty: 'intermediate',
    type: 'multiple_choice',
    question: 'What is the average time complexity for searching an element in a Hash Map?',
    options: [
      'O(n)',
      'O(log n)',
      'O(1)',
      'O(n log n)'
    ],
    correctOptionIndex: 2,
    explanation: 'Hash maps compute the bucket index using a hash function, providing O(1) constant average time complexity for lookups, insertions, and deletions under good hashing distribution.'
  },
  {
    id: 'q-dsa-2',
    topic: 'Data Structures & Algorithms',
    skillName: 'Data Structures & Algorithms',
    difficulty: 'advanced',
    type: 'multiple_choice',
    question: 'Which sorting algorithm has a worst-case time complexity of O(n log n) and guarantees stable ordering?',
    options: [
      'Quick Sort',
      'Merge Sort',
      'Heap Sort',
      'Selection Sort'
    ],
    correctOptionIndex: 1,
    explanation: 'Merge Sort uses a divide-and-conquer strategy that consistently runs in O(n log n) time across best, average, and worst cases, and is stable (preserves relative order of equal elements).'
  }
];

export const SEED_RESOURCES: LearningResource[] = [
  {
    id: 'res-mdn-js',
    title: 'MDN Web Docs: JavaScript Fundamentals & Reference',
    provider: 'Mozilla Developer Network',
    type: 'documentation',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    skill: 'JavaScript',
    category: 'languages',
    difficulty: 'Beginner',
    duration: '20 hours',
    isFree: true,
    rating: 4.9,
    description: 'The authoritative, comprehensive documentation on JavaScript syntax, standard objects, event loop, and web APIs.'
  },
  {
    id: 'res-react-docs',
    title: 'React Official Documentation (react.dev)',
    provider: 'Meta Open Source',
    type: 'documentation',
    url: 'https://react.dev/learn',
    skill: 'React',
    category: 'frameworks',
    difficulty: 'Beginner',
    duration: '15 hours',
    isFree: true,
    rating: 4.9,
    description: 'Interactive tutorials, diagrams, and best practices for building component-based interfaces with modern React Hooks.'
  },
  {
    id: 'res-ts-handbook',
    title: 'TypeScript Official Handbook',
    provider: 'Microsoft',
    type: 'documentation',
    url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
    skill: 'TypeScript',
    category: 'languages',
    difficulty: 'Intermediate',
    duration: '12 hours',
    isFree: true,
    rating: 4.8,
    description: 'Comprehensive guide covering static typing, generics, interfaces, union types, and utility types.'
  },
  {
    id: 'res-fcc-js',
    title: 'freeCodeCamp: JavaScript Algorithms and Data Structures',
    provider: 'freeCodeCamp',
    type: 'course',
    url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/',
    skill: 'JavaScript',
    category: 'languages',
    difficulty: 'Beginner',
    duration: '40 hours',
    isFree: true,
    rating: 4.8,
    description: 'Hands-on interactive curriculum covering JavaScript basics, ES6, regular expressions, debugging, and data structures.'
  },
  {
    id: 'res-py-official',
    title: 'Python Official Tutorial & Documentation',
    provider: 'Python Software Foundation',
    type: 'documentation',
    url: 'https://docs.python.org/3/tutorial/',
    skill: 'Python',
    category: 'languages',
    difficulty: 'Beginner',
    duration: '14 hours',
    isFree: true,
    rating: 4.7,
    description: 'Direct from the creators: control flow, data structures, modules, classes, and standard library reference.'
  },
  {
    id: 'res-pg-tutorial',
    title: 'PostgreSQL Tutorial & Interactive Reference',
    provider: 'PostgreSQL Global Development Group',
    type: 'tutorial',
    url: 'https://www.postgresqltutorial.com/',
    skill: 'SQL / PostgreSQL',
    category: 'databases',
    difficulty: 'Intermediate',
    duration: '18 hours',
    isFree: true,
    rating: 4.8,
    description: 'Master table constraints, joins, window functions, indexes, CTEs, and query optimization in PostgreSQL.'
  },
  {
    id: 'res-docker-curriculum',
    title: 'Docker for Beginners Curriculum',
    provider: 'Docker Open Docs',
    type: 'tutorial',
    url: 'https://docker-curriculum.com/',
    skill: 'Docker',
    category: 'cloud',
    difficulty: 'Beginner',
    duration: '6 hours',
    isFree: true,
    rating: 4.8,
    description: 'Hands-on guide to containerization, Dockerfiles, multi-stage builds, and Docker Compose multi-container setups.'
  },
  {
    id: 'res-cs50',
    title: 'Harvard CS50: Introduction to Computer Science',
    provider: 'Harvard University / edX',
    type: 'course',
    url: 'https://cs50.harvard.edu/x/',
    skill: 'Data Structures & Algorithms',
    category: 'other',
    difficulty: 'Beginner',
    duration: '60 hours',
    isFree: true,
    rating: 4.9,
    description: 'World-renowned introduction to computer science, memory management, algorithms, and computational thinking.'
  },
  {
    id: 'res-mit-ocw-6006',
    title: 'MIT 6.006: Introduction to Algorithms',
    provider: 'MIT OpenCourseWare',
    type: 'course',
    url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/',
    skill: 'Data Structures & Algorithms',
    category: 'other',
    difficulty: 'Advanced',
    duration: '45 hours',
    isFree: true,
    rating: 4.9,
    description: 'Rigorous academic lectures on sorting, trees, hashing, shortest paths, dynamic programming, and complexity.'
  },
  {
    id: 'res-fastapi-docs',
    title: 'FastAPI Interactive Documentation & Tutorial',
    provider: 'FastAPI / Tiangolo',
    type: 'documentation',
    url: 'https://fastapi.tiangolo.com/tutorial/',
    skill: 'Python',
    category: 'frameworks',
    difficulty: 'Intermediate',
    duration: '10 hours',
    isFree: true,
    rating: 4.9,
    description: 'Building high-performance async REST APIs in Python with automatic OpenAPI schema generation.'
  },
  {
    id: 'res-git-scm',
    title: 'Pro Git Book (Complete & Free)',
    provider: 'Git SCM Community',
    type: 'documentation',
    url: 'https://git-scm.com/book/en/v2',
    skill: 'Git & Version Control',
    category: 'other',
    difficulty: 'Intermediate',
    duration: '12 hours',
    isFree: true,
    rating: 4.9,
    description: 'The definitive open-source guide to Git branching, rebasing, remotes, internals, and team workflows.'
  },
  {
    id: 'res-kaggle-intro',
    title: 'Kaggle Intro to Machine Learning',
    provider: 'Kaggle / Google',
    type: 'platform',
    url: 'https://www.kaggle.com/learn/intro-to-machine-learning',
    skill: 'Machine Learning (Scikit-Learn)',
    category: 'analytics',
    difficulty: 'Beginner',
    duration: '8 hours',
    isFree: true,
    rating: 4.7,
    description: 'Micro-courses with interactive browser notebooks covering decision trees, validation, underfitting, and random forests.'
  }
];
