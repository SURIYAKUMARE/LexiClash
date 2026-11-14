import Dexie, { Table } from 'dexie';

export interface OfflineUser {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'job_seeker' | 'professional' | 'career_changer';
  college?: string;
  passwordHash?: string;
  createdAt: string;
}

export interface OfflineProfile {
  id: string;
  userId: string;
  targetCareerRoleId: string;
  completedOnboarding: boolean;
  hoursPerWeek: number;
  educationLevel: string;
  streakDays: number;
  totalLearningHours: number;
  completedTasksCount: number;
  overallMasteryLevel: number;
  overallReadinessScore: number;
  lastActiveDate: string;
}

export interface OfflineSkill {
  id: string;
  userId: string;
  skillName: string;
  category: 'languages' | 'frameworks' | 'databases' | 'cloud' | 'analytics' | 'design' | 'security' | 'soft_skills';
  proficiencyLevel: number; // 1 to 5
  isVerified: boolean;
  verifiedScore?: number;
  evidence?: string;
  lastAssessedAt?: string;
}

export interface OfflineCareerRole {
  id: string;
  title: string;
  category: string;
  salaryRange: string;
  marketDemand: 'Very High' | 'High' | 'Steady';
  shortDescription: string;
  description: string;
  requiredSkills: { skillName: string; benchmarkLevel: number; importance: 'core' | 'supporting' }[];
  preferredSkills: { skillName: string; benchmarkLevel: number }[];
}

export interface OfflineRoadmap {
  id: string;
  userId: string;
  targetRoleId: string;
  targetRoleTitle: string;
  overallProgressPercentage: number;
  lastAdjustedAt: string;
  phases: OfflineRoadmapPhase[];
}

export interface OfflineRoadmapPhase {
  id: string;
  phaseNumber: number;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'upcoming';
  estimatedWeeks: number;
  tasks: OfflineRoadmapTask[];
}

export interface OfflineRoadmapTask {
  id: string;
  phaseId: string;
  title: string;
  description: string;
  estimatedHours: number;
  criteria: string;
  completed: boolean;
  type: 'Doc' | 'Tutorial' | 'Course' | 'Exercise' | 'Project' | 'Assessment';
  provider: string;
  url: string;
  studyGuideOffline?: string;
  isRemedial?: boolean;
}

export interface OfflineRoadmapAdjustment {
  id: string;
  userId: string;
  timestamp: string;
  triggerEvent: string;
  description: string;
  changesSummary: string;
}

export interface OfflineQuestion {
  id: string;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  subtopic: string;
}

export interface OfflineAssessmentAttempt {
  id: string;
  userId: string;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  scorePercentage: number;
  correctAnswers: number;
  totalQuestions: number;
  passed: boolean;
  feedback: string;
  weakSubtopics: string[];
  completedAt: string;
}

export interface OfflineMentorMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  mode?: string;
  agentReasoningTrace?: string[];
}

export interface OfflineAgentTrace {
  id: string;
  userId: string;
  agentName: string;
  timestamp: string;
  task: string;
  inputSummary: string;
  outputSummary: string;
  reasoningTrace: string[];
  handoffTo?: string;
  latencyMs: number;
}

export interface OfflineProjectIdea {
  id: string;
  userId: string;
  title: string;
  description: string;
  existingSkillsUsed: string[];
  newSkillsTargeted: string[];
  complexity: 'Beginner' | 'Intermediate' | 'Capstone';
  estimatedHours: number;
  architecture: string;
  deliverables: string[];
}

// -------------------------------------------------------------
// Interactive Learning & Cloud Simulation Interfaces
// -------------------------------------------------------------

export interface CloudIamUser {
  id: string;
  username: string;
  accessKeyId: string;
  policies: string[];
  mfaEnabled: boolean;
  createdAt: string;
}

export interface CloudIamRole {
  id: string;
  name: string;
  trustEntity: string;
  attachedPolicies: string[];
}

export interface CloudIamPolicy {
  id: string;
  name: string;
  document: string;
  description: string;
}

export interface CloudEc2Instance {
  id: string;
  name: string;
  type: string;
  state: 'running' | 'stopped' | 'terminated';
  publicIp?: string;
  privateIp: string;
  securityGroupId: string;
  az: string;
  launchTime: string;
  cpuUtilization: number;
}

export interface CloudSecurityGroupRule {
  id: string;
  protocol: string;
  port: number | string;
  source: string;
  description: string;
}

export interface CloudSecurityGroup {
  id: string;
  name: string;
  description: string;
  vpcId: string;
  inboundRules: CloudSecurityGroupRule[];
  outboundRules: CloudSecurityGroupRule[];
}

export interface CloudLoadBalancer {
  id: string;
  name: string;
  dnsName: string;
  state: 'active' | 'provisioning' | 'failed';
  scheme: 'internet-facing' | 'internal';
  targetInstanceIds: string[];
}

export interface CloudAutoScalingGroup {
  id: string;
  name: string;
  minSize: number;
  maxSize: number;
  desiredCapacity: number;
  instanceType: string;
}

export interface CloudS3Object {
  key: string;
  sizeKb: number;
  lastModified: string;
  storageClass: string;
}

export interface CloudS3Bucket {
  id: string;
  name: string;
  region: string;
  blockPublicAccess: boolean;
  isPublic: boolean;
  versioning: boolean;
  createdAt: string;
  objects: CloudS3Object[];
}

export interface CloudVpc {
  id: string;
  name: string;
  cidrBlock: string;
  isDefault: boolean;
}

export interface CloudSubnet {
  id: string;
  vpcId: string;
  name: string;
  cidrBlock: string;
  az: string;
  isPublic: boolean;
}

export interface CloudRouteTable {
  id: string;
  vpcId: string;
  name: string;
  routes: { destination: string; target: string }[];
  associatedSubnetIds: string[];
}

export interface CloudInternetGateway {
  id: string;
  vpcId: string;
  name: string;
  attached: boolean;
}

export interface CloudNatGateway {
  id: string;
  subnetId: string;
  name: string;
  ip: string;
  state: 'available' | 'failed' | 'pending';
}

export interface CloudWatchAlarm {
  id: string;
  name: string;
  metricName: string;
  threshold: number;
  state: 'OK' | 'ALARM' | 'INSUFFICIENT_DATA';
  comparison: 'GreaterThanThreshold' | 'LessThanThreshold';
  unit: string;
}

export interface CloudWatchLogEntry {
  id: string;
  group: string;
  stream: string;
  message: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
}

export interface CloudBillingCostBreakdown {
  service: string;
  amount: number;
  percentage: number;
}

export interface OfflineCloudSimulationState {
  id: string;
  userId: string;
  iam: {
    users: CloudIamUser[];
    roles: CloudIamRole[];
    policies: CloudIamPolicy[];
  };
  ec2: {
    instances: CloudEc2Instance[];
    securityGroups: CloudSecurityGroup[];
    loadBalancers: CloudLoadBalancer[];
    autoScalingGroups: CloudAutoScalingGroup[];
  };
  s3: {
    buckets: CloudS3Bucket[];
  };
  vpc: {
    vpcs: CloudVpc[];
    subnets: CloudSubnet[];
    routeTables: CloudRouteTable[];
    internetGateways: CloudInternetGateway[];
    natGateways: CloudNatGateway[];
  };
  cloudWatch: {
    alarms: CloudWatchAlarm[];
    logs: CloudWatchLogEntry[];
  };
  billing: {
    currentMonthSpend: number;
    budgetLimit: number;
    serviceBreakdown: CloudBillingCostBreakdown[];
  };
  lastUpdated: string;
}

export interface OfflineIncidentAttempt {
  id: string;
  userId: string;
  scenarioId: string;
  scenarioTitle: string;
  severity: 'P1' | 'P2' | 'P3';
  resolved: boolean;
  durationSeconds: number;
  score: number;
  actionsTaken: string[];
  feedback: string;
  timestamp: string;
}

export interface OfflinePlacementResult {
  id: string;
  userId: string;
  targetRole: string;
  placementLevel: 1 | 2 | 3 | 4 | 5;
  levelName: string;
  technicalScore: number;
  problemSolvingScore: number;
  practicalScore: number;
  experienceScore: number;
  overallScore: number;
  recommendedMode: 'student' | 'professional';
  personalizedSummary: string;
  recommendedFocusAreas: string[];
  completedAt: string;
}

export interface OfflinePortfolioCredential {
  id: string;
  userId: string;
  credentialId: string;
  title: string;
  skillCategory: string;
  verificationHash: string;
  scorePercentage: number;
  issuedDate: string;
  status: 'Verified' | 'Pending';
  verifiedByAgent: string;
  skillsCovered: string[];
  evidenceSummary: string;
}

export interface OfflineLearningPreference {
  id: string;
  userId: string;
  mode: 'student' | 'professional';
  speechEnabled: boolean;
  language: 'english' | 'tanglish';
  updatedAt: string;
}

export class SkillPathOfflineDatabase extends Dexie {
  users!: Table<OfflineUser, string>;
  profiles!: Table<OfflineProfile, string>;
  skills!: Table<OfflineSkill, string>;
  careers!: Table<OfflineCareerRole, string>;
  roadmaps!: Table<OfflineRoadmap, string>;
  roadmapAdjustments!: Table<OfflineRoadmapAdjustment, string>;
  questions!: Table<OfflineQuestion, string>;
  assessmentAttempts!: Table<OfflineAssessmentAttempt, string>;
  mentorMessages!: Table<OfflineMentorMessage, string>;
  agentTraces!: Table<OfflineAgentTrace, string>;
  projects!: Table<OfflineProjectIdea, string>;
  cloudSimulations!: Table<OfflineCloudSimulationState, string>;
  incidentAttempts!: Table<OfflineIncidentAttempt, string>;
  placementDiagnostics!: Table<OfflinePlacementResult, string>;
  portfolioCredentials!: Table<OfflinePortfolioCredential, string>;
  learningPreferences!: Table<OfflineLearningPreference, string>;

  constructor() {
    super('SkillPathOfflineDB');
    this.version(1).stores({
      users: 'id, email',
      profiles: 'id, userId, targetCareerRoleId',
      skills: 'id, userId, skillName, category, isVerified',
      careers: 'id, title, category',
      roadmaps: 'id, userId, targetRoleId',
      roadmapAdjustments: 'id, userId, timestamp',
      questions: 'id, topic, difficulty',
      assessmentAttempts: 'id, userId, topic, completedAt',
      mentorMessages: 'id, userId, createdAt',
      agentTraces: 'id, userId, timestamp, agentName',
      projects: 'id, userId, complexity',
    });

    this.version(2).stores({
      cloudSimulations: 'id, userId',
      incidentAttempts: 'id, userId, scenarioId, timestamp',
      placementDiagnostics: 'id, userId, completedAt',
      portfolioCredentials: 'id, userId, credentialId, status',
      learningPreferences: 'id, userId',
    });
  }
}

export const db = new SkillPathOfflineDatabase();
