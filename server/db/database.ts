import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  UserProfile,
  Skill,
  CareerRole,
  LearningRoadmap,
  RoadmapAdjustmentLog,
  Question,
  AssessmentAttempt,
  MentorMessage,
  AgentExecutionRecord,
  LearningResource,
  ProjectItem,
  Certificate,
  NotificationItem
} from '../types.js';
import { SEED_CAREER_ROLES, SEED_QUESTIONS, SEED_RESOURCES } from '../seedData.js';

interface DatabaseSchema {
  users: User[];
  profiles: UserProfile[];
  skills: Skill[];
  careerRoles: CareerRole[];
  roadmaps: LearningRoadmap[];
  roadmapAdjustments: RoadmapAdjustmentLog[];
  questions: Question[];
  assessments: AssessmentAttempt[];
  mentorMessages: MentorMessage[];
  agentExecutions: AgentExecutionRecord[];
  resources: LearningResource[];
  projects: ProjectItem[];
  certificates: Certificate[];
  notifications: NotificationItem[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

class Database {
  private data: DatabaseSchema;
  private isSaving = false;

  constructor() {
    this.ensureDirectory();
    this.data = this.load();
    this.seedIfEmpty();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          users: parsed.users || [],
          profiles: parsed.profiles || [],
          skills: parsed.skills || [],
          careerRoles: parsed.careerRoles || [],
          roadmaps: parsed.roadmaps || [],
          roadmapAdjustments: parsed.roadmapAdjustments || [],
          questions: parsed.questions || [],
          assessments: parsed.assessments || [],
          mentorMessages: parsed.mentorMessages || [],
          agentExecutions: parsed.agentExecutions || [],
          resources: parsed.resources || [],
          projects: parsed.projects || [],
          certificates: parsed.certificates || [],
          notifications: parsed.notifications || []
        };
      }
    } catch (err) {
      console.error('Error loading database file, initializing fresh state:', err);
    }

    return {
      users: [],
      profiles: [],
      skills: [],
      careerRoles: [],
      roadmaps: [],
      roadmapAdjustments: [],
      questions: [],
      assessments: [],
      mentorMessages: [],
      agentExecutions: [],
      resources: [],
      projects: [],
      certificates: [],
      notifications: []
    };
  }

  public save(): void {
    if (this.isSaving) return;
    this.isSaving = true;
    try {
      this.ensureDirectory();
      const tmpFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tmpFile, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Failed to write database file:', err);
    } finally {
      this.isSaving = false;
    }
  }

  private seedIfEmpty(): void {
    let modified = false;

    // Seed roles
    if (this.data.careerRoles.length === 0) {
      this.data.careerRoles = [...SEED_CAREER_ROLES];
      modified = true;
    }

    // Seed questions
    if (this.data.questions.length === 0) {
      this.data.questions = [...SEED_QUESTIONS];
      modified = true;
    }

    // Seed resources
    if (this.data.resources.length === 0) {
      this.data.resources = [...SEED_RESOURCES];
      modified = true;
    }

    // Seed Demo User if not exists
    const demoUser = this.data.users.find(u => u.email === 'demo@skillpath.ai');
    if (!demoUser) {
      const demoUserId = 'user-demo-1001';
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync('Password123!', salt);
      const now = new Date().toISOString();

      const user: User = {
        id: demoUserId,
        name: 'Alex Rivera',
        email: 'demo@skillpath.ai',
        passwordHash,
        college: 'Stanford University',
        educationLevel: 'Bachelor\'s Degree',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'student',
        termsAccepted: true,
        createdAt: now,
        updatedAt: now
      };
      this.data.users.push(user);

      const profile: UserProfile = {
        userId: demoUserId,
        completedOnboarding: true,
        degree: 'Computer Science B.S.',
        college: 'Stanford University',
        graduationYear: '2025',
        bio: 'Passionate aspiring full-stack engineer focused on modern React web apps, TypeScript, and distributed systems.',
        targetCareerRoleId: 'role-fullstack',
        careerInterests: ['Full Stack Development', 'Cloud Systems', 'AI Applications'],
        learningPreferences: {
          hoursPerWeek: 12,
          style: 'practical',
          pace: 'moderate'
        },
        overallMasteryLevel: 3,
        overallReadinessScore: 78,
        profileCompletionPercentage: 100,
        streakDays: 9,
        lastActiveDate: now,
        totalLearningHours: 36,
        completedTasksCount: 14,
        completedAssessmentsCount: 3
      };
      this.data.profiles.push(profile);

      // Seed Initial Skills for Demo User
      const demoSkills: Skill[] = [
        {
          id: 'skill-demo-1',
          userId: demoUserId,
          skillName: 'JavaScript',
          category: 'languages',
          proficiencyLevel: 4,
          isVerified: true,
          evidence: 'Built e-commerce cart and completed JS assessment with 100% score',
          lastAssessedAt: now,
          verifiedScore: 100,
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'skill-demo-2',
          userId: demoUserId,
          skillName: 'React',
          category: 'frameworks',
          proficiencyLevel: 4,
          isVerified: true,
          evidence: 'Interactive dashboard project with custom hooks',
          lastAssessedAt: now,
          verifiedScore: 92,
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'skill-demo-3',
          userId: demoUserId,
          skillName: 'TypeScript',
          category: 'languages',
          proficiencyLevel: 3,
          isVerified: false,
          evidence: 'Migrated personal portfolio to TypeScript',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'skill-demo-4',
          userId: demoUserId,
          skillName: 'SQL / PostgreSQL',
          category: 'databases',
          proficiencyLevel: 3,
          isVerified: true,
          evidence: 'Completed database querying quiz with 85%',
          lastAssessedAt: now,
          verifiedScore: 85,
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'skill-demo-5',
          userId: demoUserId,
          skillName: 'Node.js',
          category: 'frameworks',
          proficiencyLevel: 3,
          isVerified: false,
          evidence: 'Built REST APIs with Express & JWT auth',
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'skill-demo-6',
          userId: demoUserId,
          skillName: 'Git & Version Control',
          category: 'other',
          proficiencyLevel: 3,
          isVerified: true,
          evidence: 'Active GitHub workflow with feature branches and PRs',
          lastAssessedAt: now,
          verifiedScore: 95,
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'skill-demo-7',
          userId: demoUserId,
          skillName: 'Docker',
          category: 'cloud',
          proficiencyLevel: 2,
          isVerified: false,
          evidence: 'Containerized Node.js service for local dev',
          createdAt: now,
          updatedAt: now
        }
      ];
      this.data.skills.push(...demoSkills);

      // Seed Initial Roadmap for Demo User
      const demoRoadmap: LearningRoadmap = {
        id: 'roadmap-demo-1',
        userId: demoUserId,
        targetRoleId: 'role-fullstack',
        targetRoleTitle: 'Full Stack Developer',
        generatedBy: 'agent',
        generatedAt: now,
        lastAdjustedAt: now,
        overallProgressPercentage: 42,
        phases: [
          {
            id: 'phase-1',
            phaseNumber: 1,
            title: 'Phase 1: Foundations & Type Safety',
            description: 'Master core JavaScript runtime behavior, ES6+, and strict TypeScript development patterns.',
            durationWeeks: 3,
            status: 'completed',
            tasks: [
              {
                id: 'task-1-1',
                phaseId: 'phase-1',
                order: 1,
                title: 'Deep dive into JS Event Loop & Microtasks',
                description: 'Understand promises, call stack, macrotasks, and async/await mechanics.',
                estimatedHours: 4,
                completed: true,
                completedAt: now,
                category: 'languages',
                associatedSkill: 'JavaScript',
                criteria: 'Pass the JS asynchronous runtime challenge quiz.',
                resourceLinks: [
                  { title: 'MDN Event Loop Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop', type: 'doc' }
                ]
              },
              {
                id: 'task-1-2',
                phaseId: 'phase-1',
                order: 2,
                title: 'TypeScript Generics & Utility Types',
                description: 'Implement mapped types, conditional types, and utility types (Pick, Omit, Record).',
                estimatedHours: 5,
                completed: true,
                completedAt: now,
                category: 'languages',
                associatedSkill: 'TypeScript',
                criteria: 'Build a generic type-safe API client wrapper.',
                resourceLinks: [
                  { title: 'TypeScript Handbook: Generics', url: 'https://www.typescriptlang.org/docs/handbook/2/generics.html', type: 'doc' }
                ]
              }
            ]
          },
          {
            id: 'phase-2',
            phaseNumber: 2,
            title: 'Phase 2: Modern React & State Architecture',
            description: 'Build performant UI systems, custom hooks, and scalable client state management.',
            durationWeeks: 4,
            status: 'in_progress',
            tasks: [
              {
                id: 'task-2-1',
                phaseId: 'phase-2',
                order: 1,
                title: 'Advanced React Hooks & Performance Profiling',
                description: 'Profile re-renders with React DevTools, useMemo, useCallback, and React.memo.',
                estimatedHours: 6,
                completed: true,
                completedAt: now,
                category: 'frameworks',
                associatedSkill: 'React',
                criteria: 'Optimize a virtualized feed with 10k items.',
                resourceLinks: [
                  { title: 'React.dev: Memoization', url: 'https://react.dev/reference/react/useMemo', type: 'doc' }
                ]
              },
              {
                id: 'task-2-2',
                phaseId: 'phase-2',
                order: 2,
                title: 'Clean API Client with TanStack Query / SWR',
                description: 'Implement optimistic updates, retry policies, and cache invalidation.',
                estimatedHours: 5,
                completed: false,
                category: 'frameworks',
                associatedSkill: 'React',
                criteria: 'Connect React dashboard with real-time server mutations.',
                resourceLinks: [
                  { title: 'MDN Fetch API Reference', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API', type: 'doc' }
                ]
              }
            ]
          },
          {
            id: 'phase-3',
            phaseNumber: 3,
            title: 'Phase 3: Backend Services & Database Modeling',
            description: 'Design production-grade REST APIs, relational schema migrations, and indexing strategies.',
            durationWeeks: 4,
            status: 'not_started',
            tasks: [
              {
                id: 'task-3-1',
                phaseId: 'phase-3',
                order: 1,
                title: 'PostgreSQL Advanced Indexing & Query Tuning',
                description: 'Analyze EXPLAIN plans, implement B-tree and GIN indexes, and avoid N+1 queries.',
                estimatedHours: 6,
                completed: false,
                category: 'databases',
                associatedSkill: 'SQL / PostgreSQL',
                criteria: 'Optimize slow queries on a 1-million row dataset.',
                resourceLinks: [
                  { title: 'PostgreSQL Indexing Tutorial', url: 'https://www.postgresqltutorial.com/postgresql-indexes/', type: 'tutorial' }
                ]
              },
              {
                id: 'task-3-2',
                phaseId: 'phase-3',
                order: 2,
                title: 'Microservices & Containerization with Docker',
                description: 'Write multi-stage Dockerfiles and orchestrate multi-container setups with Docker Compose.',
                estimatedHours: 8,
                completed: false,
                category: 'cloud',
                associatedSkill: 'Docker',
                criteria: 'Deploy full-stack app with frontend, backend, and postgres services.',
                resourceLinks: [
                  { title: 'Docker Official Documentation', url: 'https://docker-curriculum.com/', type: 'tutorial' }
                ]
              }
            ]
          },
          {
            id: 'phase-4',
            phaseNumber: 4,
            title: 'Phase 4: Capstone Project & Technical Interview Prep',
            description: 'Build a production SaaS portfolio project and pass full-stack system design interviews.',
            durationWeeks: 3,
            status: 'not_started',
            tasks: [
              {
                id: 'task-4-1',
                phaseId: 'phase-4',
                order: 1,
                title: 'Full Stack Capstone Application Deployment',
                description: 'Deploy production SaaS with CI/CD, SSL, database backups, and health checks.',
                estimatedHours: 12,
                completed: false,
                category: 'frameworks',
                associatedSkill: 'REST API Design',
                criteria: 'Submit public GitHub repo and live production URL.',
                resourceLinks: [
                  { title: 'Pro Git Workflow Guide', url: 'https://git-scm.com/book/en/v2', type: 'doc' }
                ]
              }
            ]
          }
        ]
      };
      this.data.roadmaps.push(demoRoadmap);

      // Seed Notifications
      this.data.notifications.push({
        id: 'notif-1',
        userId: demoUserId,
        title: 'Welcome to SkillPath AI!',
        message: 'Your personalized Full Stack Developer roadmap is ready. Complete your first task to start your streak.',
        type: 'success',
        read: false,
        createdAt: now,
        link: '/roadmap'
      });

      // Seed Demo Project
      this.data.projects.push({
        id: 'proj-demo-1',
        userId: demoUserId,
        title: 'DevPulse Realtime Collaboration Board',
        description: 'A full-stack collaborative workspace with drag-and-drop kanban boards, live user presence, and PostgreSQL persistence.',
        skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
        githubUrl: 'https://github.com/example/devpulse',
        liveUrl: 'https://devpulse-demo.example.com',
        status: 'completed',
        createdAt: now,
        completedAt: now
      });

      // Seed Demo Certificate
      this.data.certificates.push({
        id: 'cert-demo-1',
        userId: demoUserId,
        userName: 'Alex Rivera',
        title: 'Full Stack Foundations & TypeScript Mastery',
        credentialId: 'SKILLPATH-FS-2025-8841',
        verificationHash: '9a8d7e6f5b4c3a2b1c0e9d8c7b6a5f4e',
        skillsCovered: ['JavaScript', 'TypeScript', 'React', 'SQL / PostgreSQL'],
        issuedAt: now,
        gradePercentage: 94
      });

      modified = true;
    }

    if (modified) {
      this.save();
    }
  }

  // Collections accessors
  public get users() { return this.data.users; }
  public get profiles() { return this.data.profiles; }
  public get skills() { return this.data.skills; }
  public get careerRoles() { return this.data.careerRoles; }
  public get roadmaps() { return this.data.roadmaps; }
  public get roadmapAdjustments() { return this.data.roadmapAdjustments; }
  public get questions() { return this.data.questions; }
  public get assessments() { return this.data.assessments; }
  public get mentorMessages() { return this.data.mentorMessages; }
  public get agentExecutions() { return this.data.agentExecutions; }
  public get resources() { return this.data.resources; }
  public get projects() { return this.data.projects; }
  public get certificates() { return this.data.certificates; }
  public get notifications() { return this.data.notifications; }
}

export const db = new Database();
