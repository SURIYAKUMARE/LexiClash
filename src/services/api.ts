import {
  db,
  OfflineUser,
  OfflineProfile,
  OfflineSkill,
  OfflineCareerRole,
  OfflineRoadmap,
  OfflineAssessmentAttempt,
  OfflineMentorMessage,
  OfflineAgentTrace,
  OfflineProjectIdea,
  OfflineCloudSimulationState,
  OfflineIncidentAttempt,
  OfflinePlacementResult,
  OfflinePortfolioCredential,
  OfflineLearningPreference
} from '../db/indexedDb';
import { initializeOfflineDatabase, loadDemoPersona } from '../db/initDb';
import {
  SEED_CAREER_ROLES,
  SEED_QUESTIONS,
  OFFLINE_STUDY_GUIDES,
  SEED_LEARNING_DOMAINS,
  SEED_CLOUD_SIMULATION_STATE,
  SEED_SRE_INCIDENTS,
  SEED_PLACEMENT_SCENARIOS,
  SEED_TERMINAL_QUESTS,
  SEED_PORTFOLIO_CREDENTIALS,
  LearningDomain,
  SreIncidentScenario,
  PlacementQuestion,
  TerminalQuest
} from '../db/seedData';
import { CareerArchitectAgent } from '../agents/careerArchitectAgent';
import { CurriculumStrategistAgent } from '../agents/curriculumStrategistAgent';
import { AdaptiveMentorAgent } from '../agents/adaptiveMentorAgent';
import { ProfilerAgent } from '../agents/profilerAgent';
import { AgentOrchestrator } from '../agents/orchestrator';

class OfflineFirstApiService {
  private activeUserId: string = 'user-student';

  private async ensureInitialized(): Promise<string> {
    const stored = typeof localStorage !== 'undefined' ? localStorage.getItem('skillpath_offline_user_id') : null;
    if (stored) {
      this.activeUserId = stored;
      const count = await db.careers.count();
      if (count > 0) return this.activeUserId;
    }
    const init = await initializeOfflineDatabase();
    this.activeUserId = init.activeUser.id;
    return this.activeUserId;
  }

  public setToken(token: string): void {
    localStorage.setItem('skillpath_token', token);
  }

  public removeToken(): void {
    localStorage.removeItem('skillpath_token');
    localStorage.removeItem('skillpath_offline_user_id');
  }

  // Auth
  public async getMe(): Promise<{ user: OfflineUser; profile: OfflineProfile }> {
    const userId = await this.ensureInitialized();
    let user = await db.users.get(userId);
    let profile = await db.profiles.where('userId').equals(userId).first();

    if (!user || !profile) {
      const init = await loadDemoPersona('persona-student');
      user = init.activeUser;
      profile = init.activeProfile;
    }

    return { user, profile };
  }

  public async login(credentials: { email: string; password?: string }): Promise<{ token: string; user: OfflineUser; profile: OfflineProfile }> {
    await this.ensureInitialized();
    const cleanEmail = credentials.email.trim().toLowerCase();
    
    // If logging in as demo@skillpath.app, map directly to the Full Stack student persona
    if (cleanEmail === 'demo@skillpath.app') {
      const init = await loadDemoPersona('persona-student');
      this.activeUserId = init.activeUser.id;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('skillpath_offline_user_id', init.activeUser.id);
      }
      const token = `offline-token-${init.activeUser.id}`;
      this.setToken(token);
      return { token, user: { ...init.activeUser, email: 'demo@skillpath.app' }, profile: init.activeProfile };
    }

    let user = await db.users.where('email').equalsIgnoreCase(cleanEmail).first();

    if (!user) {
      // Find matching demo persona or create new
      const init = await loadDemoPersona('persona-student');
      user = init.activeUser;
    }

    let profile = await db.profiles.where('userId').equals(user.id).first();
    if (!profile) {
      const init = await loadDemoPersona('persona-student');
      profile = init.activeProfile;
    }

    this.activeUserId = user.id;
    localStorage.setItem('skillpath_offline_user_id', user.id);
    const token = `offline-token-${user.id}`;
    this.setToken(token);

    return { token, user, profile };
  }

  public async loginWithPasscode(passcode: string): Promise<{ token: string; user: OfflineUser; profile: OfflineProfile }> {
    // Local offline vault passcode unlock
    return this.login({ email: 'priya.student@skillpath.local' });
  }

  public async register(payload: { name: string; email: string; role?: string; college?: string }): Promise<{ token: string; user: OfflineUser; profile: OfflineProfile }> {
    await this.ensureInitialized();
    const id = `user-${Date.now()}`;
    const user: OfflineUser = {
      id,
      name: payload.name.trim(),
      email: payload.email.trim(),
      role: (payload.role as any) || 'student',
      college: payload.college?.trim(),
      createdAt: new Date().toISOString()
    };
    await db.users.put(user);

    // Initial Full Stack target
    const targetRole = (await db.careers.get('role-fullstack')) || SEED_CAREER_ROLES[0];
    const initialRoadmap = CurriculumStrategistAgent.generateRoadmap(id, targetRole, [], 10);
    await db.roadmaps.put(initialRoadmap);

    const profile: OfflineProfile = {
      id: `profile-${id}`,
      userId: id,
      targetCareerRoleId: targetRole.id,
      completedOnboarding: true,
      hoursPerWeek: 10,
      educationLevel: payload.college ? 'Undergraduate Degree' : 'Professional',
      streakDays: 1,
      totalLearningHours: 0,
      completedTasksCount: 0,
      overallMasteryLevel: 1,
      overallReadinessScore: 35,
      lastActiveDate: new Date().toISOString()
    };
    await db.profiles.put(profile);

    this.activeUserId = id;
    localStorage.setItem('skillpath_offline_user_id', id);
    const token = `offline-token-${id}`;
    this.setToken(token);

    return { token, user, profile };
  }

  public async switchPersona(personaId: string): Promise<{ user: OfflineUser; profile: OfflineProfile }> {
    const result = await loadDemoPersona(personaId);
    this.activeUserId = result.activeUser.id;
    await AgentOrchestrator.runFullOrchestration(this.activeUserId);
    return { user: result.activeUser, profile: result.activeProfile };
  }

  public async logout(): Promise<void> {
    this.removeToken();
  }

  // Profile
  public async getProfile(): Promise<{ profile: OfflineProfile }> {
    const userId = await this.ensureInitialized();
    let profile = await db.profiles.where('userId').equals(userId).first();
    if (!profile) {
      const me = await this.getMe();
      profile = me.profile;
    }
    return { profile };
  }

  public async updateProfile(payload: Partial<OfflineProfile>): Promise<{ profile: OfflineProfile }> {
    const userId = await this.ensureInitialized();
    const profile = await db.profiles.where('userId').equals(userId).first();
    if (!profile) throw new Error('Profile not found');

    const updated = { ...profile, ...payload };
    await db.profiles.update(profile.id, updated);
    return { profile: updated };
  }

  public async submitOnboarding(payload: any): Promise<{ success: boolean; profile: OfflineProfile }> {
    const userId = await this.ensureInitialized();
    const profile = await db.profiles.where('userId').equals(userId).first();
    if (!profile) throw new Error('Profile not found');

    await db.profiles.update(profile.id, {
      completedOnboarding: true,
      targetCareerRoleId: payload.targetCareerRoleId || profile.targetCareerRoleId,
      hoursPerWeek: Number(payload.hoursPerWeek) || profile.hoursPerWeek
    });

    const updated = await db.profiles.get(profile.id);
    await AgentOrchestrator.runFullOrchestration(userId);
    return { success: true, profile: updated! };
  }

  // Skills
  public async getSkills(): Promise<{ skills: any[] }> {
    const userId = await this.ensureInitialized();
    const rawSkills = await db.skills.where('userId').equals(userId).toArray();
    const skills = rawSkills.map(s => ({
      ...s,
      name: (s as any).name || s.skillName || '',
      skillName: s.skillName || (s as any).name || ''
    }));
    return { skills };
  }

  public async addSkill(payload: { skillName: string; category: string; proficiencyLevel: number; evidence?: string }): Promise<{ skill: OfflineSkill }> {
    const userId = await this.ensureInitialized();
    const skill: OfflineSkill = {
      id: `skill-${userId}-${Date.now()}`,
      userId,
      skillName: payload.skillName.trim(),
      category: payload.category as any,
      proficiencyLevel: payload.proficiencyLevel,
      isVerified: false,
      evidence: payload.evidence?.trim()
    };
    await db.skills.put(skill);
    await AgentOrchestrator.runFullOrchestration(userId);
    return { skill };
  }

  public async updateSkill(id: string, payload: Partial<OfflineSkill>): Promise<{ skill: OfflineSkill }> {
    const userId = await this.ensureInitialized();
    const existing = await db.skills.get(id);
    if (!existing) throw new Error('Skill not found');

    const updated = { ...existing, ...payload };
    await db.skills.update(id, updated);
    await AgentOrchestrator.runFullOrchestration(userId);
    return { skill: updated };
  }

  public async deleteSkill(id: string): Promise<{ message: string }> {
    const userId = await this.ensureInitialized();
    await db.skills.delete(id);
    await AgentOrchestrator.runFullOrchestration(userId);
    return { message: 'Skill removed' };
  }

  public async getSkillGapAnalysis(roleId?: string): Promise<{ gapAnalysis: any }> {
    const userId = await this.ensureInitialized();
    const skills = await db.skills.where('userId').equals(userId).toArray();
    const profile = await db.profiles.where('userId').equals(userId).first();
    const careers = await db.careers.toArray();

    const targetRoleId = roleId || profile?.targetCareerRoleId || 'role-fullstack';
    const targetRole = careers.find(c => c.id === targetRoleId) || careers[0];

    const benchmark = CareerArchitectAgent.benchmarkRole(skills, targetRole);

    return {
      gapAnalysis: {
        roleId: targetRole.id,
        roleTitle: targetRole.title,
        overallReadinessScore: benchmark.readinessPercentage,
        totalRequiredSkills: targetRole.requiredSkills.length,
        matchedSkillsCount: benchmark.strengths.length,
        verifiedMatchPercentage: Math.round((skills.filter(s => s.isVerified).length / (skills.length || 1)) * 100),
        strengths: benchmark.strengths.map(s => ({ skillName: s.skillName, level: s.level })),
        gaps: [
          ...benchmark.criticalMissing.map(m => ({
            skillName: m.skillName,
            currentLevel: 0,
            benchmarkLevel: m.benchmark,
            delta: m.benchmark,
            recommendation: `Start Phase 1 foundation modules for ${m.skillName}.`
          })),
          ...benchmark.needsReinforcement.map(n => ({
            skillName: n.skillName,
            currentLevel: n.level,
            benchmarkLevel: n.benchmark,
            delta: n.delta,
            recommendation: `Advance ${n.skillName} by +${n.delta} level via practical exercises.`
          }))
        ],
        prioritizedPlan: [
          { step: 1, title: 'Reinforce Critical Runtime Gaps', description: 'Master Node.js asynchronous event loop and Express middleware.', estimatedWeeks: 2 },
          { step: 2, title: 'Data Layer & PostgreSQL Indexing', description: 'Design normalized relational schemas and optimize query plans.', estimatedWeeks: 2 },
          { step: 3, title: 'Full Stack Integration & Testing', description: 'Build end-to-end type-safe API contracts and containerize with Docker.', estimatedWeeks: 3 }
        ],
        mathematicalBreakdown: benchmark.mathematicalBreakdown,
        disclaimer: 'Transparent Benchmark Notice: Readiness scores reflect algorithmic alignment with standard industry criteria and do not imply or guarantee employment offers.'
      }
    };
  }

  // Careers
  public async getCareers(): Promise<{ careers: OfflineCareerRole[] }> {
    await this.ensureInitialized();
    let careers = await db.careers.toArray();
    if (careers.length === 0) {
      await db.careers.bulkAdd(SEED_CAREER_ROLES);
      careers = await db.careers.toArray();
    }
    return { careers };
  }

  public async getCareerDetails(id: string): Promise<{ career: OfflineCareerRole }> {
    await this.ensureInitialized();
    const career = await db.careers.get(id);
    if (!career) throw new Error('Career role not found');
    return { career };
  }

  public async selectTargetCareer(roleId: string): Promise<{ success: boolean; targetRole: OfflineCareerRole; readinessScore: number; roadmap: OfflineRoadmap }> {
    const userId = await this.ensureInitialized();
    const targetRole = await db.careers.get(roleId);
    if (!targetRole) throw new Error('Target role not found');

    const profile = await db.profiles.where('userId').equals(userId).first();
    const skills = await db.skills.where('userId').equals(userId).toArray();

    // Re-generate roadmap for new role
    const newRoadmap = CurriculumStrategistAgent.generateRoadmap(
      userId,
      targetRole,
      skills,
      profile?.hoursPerWeek || 10
    );
    await db.roadmaps.where('userId').equals(userId).delete();
    await db.roadmaps.put(newRoadmap);

    const benchmark = CareerArchitectAgent.benchmarkRole(skills, targetRole);

    if (profile) {
      await db.profiles.update(profile.id, {
        targetCareerRoleId: targetRole.id,
        overallReadinessScore: benchmark.readinessPercentage
      });
    }

    // Log adjustment
    await db.roadmapAdjustments.add({
      id: `adj-${Date.now()}`,
      userId,
      timestamp: new Date().toISOString(),
      triggerEvent: 'Career Goal Pivot',
      description: `Target career role pivoted to ${targetRole.title}.`,
      changesSummary: `Roadmap recalibrated across 4 phases to align with ${targetRole.requiredSkills.length} benchmark competencies.`
    });

    await AgentOrchestrator.runFullOrchestration(userId);

    return {
      success: true,
      targetRole,
      readinessScore: benchmark.readinessPercentage,
      roadmap: newRoadmap
    };
  }

  // Roadmap
  public async getRoadmap(): Promise<{ roadmap: OfflineRoadmap }> {
    const userId = await this.ensureInitialized();
    let roadmap = await db.roadmaps.where('userId').equals(userId).first();

    if (!roadmap) {
      const profile = await db.profiles.where('userId').equals(userId).first();
      const targetRole = (await db.careers.get(profile?.targetCareerRoleId || 'role-fullstack')) || SEED_CAREER_ROLES[0];
      const skills = await db.skills.where('userId').equals(userId).toArray();
      roadmap = CurriculumStrategistAgent.generateRoadmap(userId, targetRole, skills, profile?.hoursPerWeek || 10);
      await db.roadmaps.put(roadmap);
    }

    return { roadmap };
  }

  public async toggleRoadmapTask(taskId: string): Promise<{ success: boolean; roadmap: OfflineRoadmap }> {
    const userId = await this.ensureInitialized();
    const roadmap = await db.roadmaps.where('userId').equals(userId).first();
    if (!roadmap) throw new Error('Roadmap not found');

    let taskToggled = false;
    roadmap.phases.forEach(p => {
      p.tasks.forEach(t => {
        if (t.id === taskId) {
          t.completed = !t.completed;
          taskToggled = true;
        }
      });
      // Check phase status
      const allDone = p.tasks.every(t => t.completed);
      const someDone = p.tasks.some(t => t.completed);
      p.status = allDone ? 'completed' : someDone ? 'in_progress' : 'upcoming';
    });

    const totalTasks = roadmap.phases.reduce((a, b) => a + b.tasks.length, 0);
    const completedTasks = roadmap.phases.reduce((a, b) => a + b.tasks.filter(t => t.completed).length, 0);
    roadmap.overallProgressPercentage = Math.round((completedTasks / totalTasks) * 100);
    roadmap.lastAdjustedAt = new Date().toISOString();

    await db.roadmaps.update(roadmap.id, roadmap as any);

    // Update profile task counts
    const profile = await db.profiles.where('userId').equals(userId).first();
    if (profile) {
      await db.profiles.update(profile.id, {
        completedTasksCount: completedTasks
      });
    }

    return { success: taskToggled, roadmap };
  }

  public async updateRoadmapTask(phaseId: string, taskId: string, completed: boolean): Promise<{ success: boolean; roadmap: OfflineRoadmap }> {
    return this.toggleRoadmapTask(taskId);
  }

  public async regenerateRoadmap(): Promise<{ success: boolean; roadmap: OfflineRoadmap }> {
    const userId = await this.ensureInitialized();
    const profile = await db.profiles.where('userId').equals(userId).first();
    const targetRole = (await db.careers.get(profile?.targetCareerRoleId || 'role-fullstack')) || SEED_CAREER_ROLES[0];
    const skills = await db.skills.where('userId').equals(userId).toArray();

    const newRoadmap = CurriculumStrategistAgent.generateRoadmap(userId, targetRole, skills, profile?.hoursPerWeek || 10);
    await db.roadmaps.where('userId').equals(userId).delete();
    await db.roadmaps.put(newRoadmap);

    await db.roadmapAdjustments.add({
      id: `adj-${Date.now()}`,
      userId,
      timestamp: new Date().toISOString(),
      triggerEvent: 'Manual Roadmap Recalculation',
      description: 'Learner requested re-sequencing based on updated skill competencies.',
      changesSummary: 'All 4 phases re-ordered to address current priority gap vectors.'
    });

    return { success: true, roadmap: newRoadmap };
  }

  public async getRoadmapAdjustments(): Promise<{ adjustments: any[] }> {
    const userId = await this.ensureInitialized();
    const adjustments = await db.roadmapAdjustments.where('userId').equals(userId).reverse().sortBy('timestamp');
    return { adjustments };
  }

  // Assessments
  public async getQuestions(params: { topic?: string; difficulty?: string }): Promise<{ questions: any[]; total: number }> {
    await this.ensureInitialized();
    let questions = await db.questions.toArray();
    if (questions.length === 0) {
      await db.questions.bulkAdd(SEED_QUESTIONS);
      questions = await db.questions.toArray();
    }

    if (params.topic) {
      questions = questions.filter(q => q.topic.toLowerCase().includes(params.topic!.toLowerCase()));
    }
    if (params.difficulty) {
      questions = questions.filter(q => q.difficulty === params.difficulty);
    }

    return { questions, total: questions.length };
  }

  public async submitAssessment(payload: {
    topic: string;
    difficulty: string;
    userAnswers: { questionId: string; selectedOption: number }[];
    integrityStatus?: 'VERIFIED_CLEAN' | 'FLAGGED_REVIEW' | 'PROCTOR_WARNING';
    violationsCount?: number;
    violationsLog?: any[];
    timeSpentSeconds?: number;
  }): Promise<{
    attempt: OfflineAssessmentAttempt;
    diagnosis: any;
    detailedAnswers: any[];
    skillUpdated?: OfflineSkill;
  }> {
    const userId = await this.ensureInitialized();
    const allQuestions = await db.questions.toArray();

    let correctCount = 0;
    const weakSubtopics: string[] = [];
    const detailedAnswers = payload.userAnswers.map(ans => {
      const q = allQuestions.find(item => item.id === ans.questionId);
      const isCorrect = q ? q.correctAnswerIndex === ans.selectedOption : false;
      if (isCorrect) {
        correctCount++;
      } else if (q && q.subtopic) {
        weakSubtopics.push(q.subtopic);
      }
      return {
        questionId: ans.questionId,
        question: q?.question,
        selectedOption: ans.selectedOption,
        correctOption: q?.correctAnswerIndex,
        isCorrect,
        explanation: q?.explanation
      };
    });

    const totalQuestions = payload.userAnswers.length || 1;
    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePercentage >= 70;

    let feedback = '';
    if (passed) {
      feedback = `Mastery Verified! Scored ${scorePercentage}% on ${payload.topic} (${payload.difficulty}). Verified skill credential badge awarded.`;
    } else {
      feedback = `Score ${scorePercentage}% is below the 70% benchmark. Weak subtopic identified: ${weakSubtopics.join(', ') || 'Core concepts'}. Targeted remedial modules have been injected into your roadmap.`;
    }

    const attempt: OfflineAssessmentAttempt = {
      id: `att-${Date.now()}`,
      userId,
      topic: payload.topic,
      difficulty: payload.difficulty as any,
      scorePercentage,
      correctAnswers: correctCount,
      totalQuestions,
      passed,
      feedback,
      weakSubtopics,
      completedAt: new Date().toISOString(),
      integrityStatus: payload.integrityStatus || (payload.violationsCount && payload.violationsCount > 2 ? 'FLAGGED_REVIEW' : 'VERIFIED_CLEAN'),
      violationsCount: payload.violationsCount || 0,
      violationsLog: payload.violationsLog || [],
      timeSpentSeconds: payload.timeSpentSeconds || 0
    };
    await db.assessmentAttempts.add(attempt);

    // Update Skill in DB
    let skill = await db.skills.where('userId').equals(userId).and(s => s.skillName.toLowerCase().includes(payload.topic.toLowerCase())).first();
    if (!skill) {
      skill = {
        id: `skill-${userId}-${Date.now()}`,
        userId,
        skillName: payload.topic,
        category: 'languages',
        proficiencyLevel: passed ? 4 : 2,
        isVerified: passed,
        verifiedScore: scorePercentage,
        evidence: `Assessment on ${new Date().toLocaleDateString()}: ${scorePercentage}%`,
        lastAssessedAt: new Date().toISOString()
      };
      await db.skills.put(skill);
    } else {
      await db.skills.update(skill.id, {
        isVerified: passed ? true : skill.isVerified,
        verifiedScore: Math.max(skill.verifiedScore || 0, scorePercentage),
        proficiencyLevel: passed ? Math.max(skill.proficiencyLevel, 4) : skill.proficiencyLevel,
        lastAssessedAt: new Date().toISOString()
      });
      skill = await db.skills.get(skill.id);
    }

    // Dynamic Re-Routing if score < 70%
    if (!passed && weakSubtopics.length > 0) {
      const currentRoadmap = await db.roadmaps.where('userId').equals(userId).first();
      if (currentRoadmap) {
        const reRoute = CurriculumStrategistAgent.injectRemedialModule(
          currentRoadmap,
          payload.topic,
          weakSubtopics[0]
        );
        await db.roadmaps.update(currentRoadmap.id, reRoute.updatedRoadmap as any);

        await db.roadmapAdjustments.add({
          id: `adj-remedial-${Date.now()}`,
          userId,
          timestamp: new Date().toISOString(),
          triggerEvent: `Assessment Score < 70% on ${payload.topic}`,
          description: `Identified gap in ${weakSubtopics[0]}. Injected targeted remedial micro-module into active phase.`,
          changesSummary: `Task "${reRoute.injectedTaskTitle}" added to Phase 1.`
        });
      }
    }

    await AgentOrchestrator.runFullOrchestration(userId);

    return {
      attempt,
      diagnosis: {
        diagnosticFeedback: feedback,
        weakSubtopics,
        recommendedAction: passed ? 'Advance to next phase milestone.' : 'Review injected remedial module in roadmap.'
      },
      detailedAnswers,
      skillUpdated: skill
    };
  }

  public async getAssessmentHistory(): Promise<{ history: OfflineAssessmentAttempt[] }> {
    const userId = await this.ensureInitialized();
    const history = await db.assessmentAttempts.where('userId').equals(userId).reverse().sortBy('completedAt');
    return { history };
  }

  // Mentor Chat
  public async getMentorHistory(): Promise<{ messages: OfflineMentorMessage[] }> {
    const userId = await this.ensureInitialized();
    const messages = await db.mentorMessages.where('userId').equals(userId).sortBy('createdAt');
    return { messages };
  }

  public async sendMentorMessage(message: string, mode: string = 'general'): Promise<{
    userMessage: OfflineMentorMessage;
    assistantMessage: OfflineMentorMessage;
    suggestedFollowUps: string[];
  }> {
    const userId = await this.ensureInitialized();
    const profile = (await db.profiles.where('userId').equals(userId).first())!;
    const targetRole = (await db.careers.get(profile.targetCareerRoleId)) || SEED_CAREER_ROLES[0];
    const skills = await db.skills.where('userId').equals(userId).toArray();

    const userMessage: OfflineMentorMessage = {
      id: `msg-${Date.now()}-u`,
      userId,
      role: 'user',
      content: message,
      createdAt: new Date().toISOString(),
      mode
    };
    await db.mentorMessages.add(userMessage);

    const result = AdaptiveMentorAgent.handleMessage(message, profile, targetRole, skills, mode);

    const assistantMessage: OfflineMentorMessage = {
      id: `msg-${Date.now()}-a`,
      userId,
      role: 'assistant',
      content: result.reply,
      createdAt: new Date().toISOString(),
      mode,
      agentReasoningTrace: result.agentReasoningTraces.map(t => `${t.agentName}: ${t.thought}`)
    };
    await db.mentorMessages.add(assistantMessage);

    return {
      userMessage,
      assistantMessage,
      suggestedFollowUps: result.suggestedFollowUps
    };
  }

  public async clearMentorHistory(): Promise<{ message: string }> {
    const userId = await this.ensureInitialized();
    await db.mentorMessages.where('userId').equals(userId).delete();
    return { message: 'Chat history cleared' };
  }

  // Agent Telemetry
  public async getAgentActivity(): Promise<{ executions: OfflineAgentTrace[]; hasGeminiApiKey: boolean }> {
    const userId = await this.ensureInitialized();
    const traces = await db.agentTraces.where('userId').equals(userId).reverse().sortBy('timestamp');
    const hasKey = Boolean(localStorage.getItem('user_gemini_api_key'));
    return { executions: traces, hasGeminiApiKey: hasKey };
  }

  public async runAgent(agentName: string): Promise<{ success: boolean; agentName: string; result: any; executions: OfflineAgentTrace[] }> {
    const userId = await this.ensureInitialized();
    const res = await AgentOrchestrator.runFullOrchestration(userId);
    const traces = await db.agentTraces.where('userId').equals(userId).reverse().sortBy('timestamp');
    return { success: true, agentName, result: res, executions: traces };
  }

  // Analytics
  public async getAnalytics(): Promise<{
    metrics: any;
    radarData: any[];
    weeklyActivity: any[];
    progressTimeline: any[];
    assessmentStats: any;
  }> {
    const userId = await this.ensureInitialized();
    const profile = await db.profiles.where('userId').equals(userId).first();
    const skills = await db.skills.where('userId').equals(userId).toArray();
    const roadmap = await db.roadmaps.where('userId').equals(userId).first();
    const attempts = await db.assessmentAttempts.where('userId').equals(userId).toArray();

    const streakDays = profile?.streakDays || 9;
    const learningHours = profile?.totalLearningHours || 36.5;
    const readinessScore = profile?.overallReadinessScore || 72;
    const verifiedSkillsCount = skills.filter(s => s.isVerified).length;

    // Build radar data across 6 categories
    const categories = ['Languages', 'Frameworks', 'Databases', 'Cloud / DevOps', 'Analytics', 'System Design'];
    const radarData = [
      { category: 'Languages', current: 85, benchmark: 95, fullMark: 100 },
      { category: 'Frameworks', current: 70, benchmark: 90, fullMark: 100 },
      { category: 'Databases', current: 55, benchmark: 80, fullMark: 100 },
      { category: 'Cloud & DevOps', current: 40, benchmark: 75, fullMark: 100 },
      { category: 'Analytics', current: 65, benchmark: 70, fullMark: 100 },
      { category: 'System Design', current: 50, benchmark: 85, fullMark: 100 }
    ];

    const weeklyActivity = [
      { day: 'Mon', hours: 2.5, tasksCompleted: 2 },
      { day: 'Tue', hours: 3.0, tasksCompleted: 3 },
      { day: 'Wed', hours: 1.5, tasksCompleted: 1 },
      { day: 'Thu', hours: 4.0, tasksCompleted: 4 },
      { day: 'Fri', hours: 2.0, tasksCompleted: 2 },
      { day: 'Sat', hours: 5.0, tasksCompleted: 4 },
      { day: 'Sun', hours: 3.5, tasksCompleted: 3 }
    ];

    const progressTimeline = [
      { week: 'W1', readiness: 42, completedTasks: 2 },
      { week: 'W2', readiness: 50, completedTasks: 5 },
      { week: 'W3', readiness: 61, completedTasks: 9 },
      { week: 'W4', readiness: 68, completedTasks: 12 },
      { week: 'Current', readiness: readinessScore, completedTasks: profile?.completedTasksCount || 14 }
    ];

    return {
      metrics: {
        streakDays,
        totalLearningHours: learningHours,
        overallReadinessScore: readinessScore,
        totalSkills: skills.length,
        verifiedSkills: verifiedSkillsCount,
        completedTasksCount: profile?.completedTasksCount || 14,
        averageAssessmentScore: attempts.length
          ? Math.round(attempts.reduce((a, b) => a + b.scorePercentage, 0) / attempts.length)
          : 85,
        assessmentsTaken: attempts.length
      },
      radarData,
      weeklyActivity,
      progressTimeline,
      assessmentStats: {
        total: attempts.length,
        passed: attempts.filter(a => a.passed).length
      }
    };
  }

  // Projects
  public async getProjects(): Promise<{ projects: OfflineProjectIdea[] }> {
    const userId = await this.ensureInitialized();
    const skills = await db.skills.where('userId').equals(userId).toArray();
    const profile = await db.profiles.where('userId').equals(userId).first();
    const targetRole = (await db.careers.get(profile?.targetCareerRoleId || 'role-fullstack')) || SEED_CAREER_ROLES[0];

    const existingNames = skills.filter(s => s.proficiencyLevel >= 3).map(s => s.skillName);
    const targetNames = targetRole.requiredSkills.map(r => r.skillName);

    const generated = AdaptiveMentorAgent.generateProjectIdeas(existingNames, targetNames, targetRole.title);

    return {
      projects: generated.map((g, idx) => ({
        id: `proj-${idx}`,
        userId,
        title: g.title,
        description: g.elevatorPitch,
        existingSkillsUsed: g.existingSkillsCombined,
        newSkillsTargeted: g.newSkillsTargeted,
        complexity: g.complexity,
        estimatedHours: g.complexity === 'Capstone' ? 40 : 20,
        architecture: g.architectureDiagram,
        deliverables: g.milestones
      }))
    };
  }

  // Resources
  public async getResources(params: Record<string, string> = {}): Promise<{ resources: any[]; total: number }> {
    const list = [
      {
        id: 'res-1',
        title: 'MDN Web Docs: JavaScript Concurrency & Event Loop',
        provider: 'MDN Web Docs',
        type: 'documentation',
        difficulty: 'Intermediate',
        skill: 'JavaScript',
        duration: '1.5 hrs',
        rating: 4.9,
        isFree: true,
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop',
        description: 'Comprehensive architectural guide to call stacks, microtasks, timers, and non-blocking I/O.'
      },
      {
        id: 'res-2',
        title: 'React Official Documentation: Managing State',
        provider: 'React.dev',
        type: 'documentation',
        difficulty: 'Intermediate',
        skill: 'React',
        duration: '2.0 hrs',
        rating: 4.9,
        isFree: true,
        url: 'https://react.dev/learn/managing-state',
        description: 'Master immutable state trees, component composition, and memoization.'
      },
      {
        id: 'res-3',
        title: 'Node.js Official Guide: Streams and Buffer Pipelines',
        provider: 'Nodejs.org',
        type: 'tutorial',
        difficulty: 'Advanced',
        skill: 'Node.js',
        duration: '2.5 hrs',
        rating: 4.8,
        isFree: true,
        url: 'https://nodejs.org/en/learn/manipulating-files/nodejs-streams',
        description: 'Build backpressure-regulated streaming data flows without memory leak vulnerabilities.'
      },
      {
        id: 'res-4',
        title: 'PostgreSQL Indexes and Query Optimization',
        provider: 'PostgreSQL.org',
        type: 'documentation',
        difficulty: 'Intermediate',
        skill: 'PostgreSQL',
        duration: '3.0 hrs',
        rating: 4.9,
        isFree: true,
        url: 'https://www.postgresql.org/docs/current/indexes.html',
        description: 'B-tree index mechanics, composite indexes, and EXPLAIN ANALYZE execution inspection.'
      },
      {
        id: 'res-5',
        title: 'Docker Official Get Started Tutorial',
        provider: 'Docker Docs',
        type: 'tutorial',
        difficulty: 'Beginner',
        skill: 'Docker',
        duration: '2.0 hrs',
        rating: 4.8,
        isFree: true,
        url: 'https://docs.docker.com/get-started/',
        description: 'Container fundamentals, multi-stage Dockerfiles, and compose configurations.'
      }
    ];

    return { resources: list, total: list.length };
  }

  // Certificates & Notifications
  public async getCertificates(): Promise<{ certificates: any[] }> {
    const userId = await this.ensureInitialized();
    const skills = await db.skills.where('userId').equals(userId).and(s => s.isVerified).toArray();
    return {
      certificates: [
        {
          id: 'cert-1',
          title: 'Full Stack Engineering Verification',
          issuedTo: 'Priya Sharma',
          issuedDate: new Date().toISOString(),
          skillsCovered: skills.map(s => s.skillName),
          gradePercentage: 92,
          credentialId: 'SP-VERIFIED-2026-9814'
        }
      ]
    };
  }

  public async getNotifications(): Promise<{ notifications: any[] }> {
    return {
      notifications: [
        {
          id: 'notif-1',
          title: 'Adaptive Roadmap Recalibrated',
          message: 'Your roadmap pace was optimized based on your weekly study commitment.',
          read: false,
          createdAt: new Date().toISOString()
        }
      ]
    };
  }

  public async markAllNotificationsRead(): Promise<void> {
    return;
  }

  public async markNotificationRead(_id: string): Promise<void> {
    return;
  }

  public async claimCertificate(payload: { title?: string; skillId?: string; topic?: string; skillsCovered?: string[]; gradePercentage?: number }): Promise<{ certificate: any }> {
    const cert = {
      id: 'cert-' + Date.now(),
      title: payload.title || payload.topic || 'Certificate of Competency',
      credentialId: 'LC-' + Math.random().toString(36).substring(2, 9).toUpperCase(),
      verificationHash: 'sha256-' + Math.random().toString(36).substring(2, 12),
      issuedAt: new Date().toISOString(),
      skillsCovered: payload.skillsCovered || [],
      gradePercentage: payload.gradePercentage || 100
    };
    return { certificate: cert };
  }

  public async forgotPassword(_email: string): Promise<{ resetToken: string; message: string }> {
    return {
      resetToken: 'demo-reset-token-' + Date.now(),
      message: 'Reset token dispatched. Check your email or use the generated token below.'
    };
  }

  public async resetPassword(_payload: any): Promise<{ success: boolean; message: string }> {
    return { success: true, message: 'Password has been successfully updated.' };
  }

  // -------------------------------------------------------------
  // 1. Learning Universe
  // -------------------------------------------------------------
  public async getLearningDomains(): Promise<{ domains: LearningDomain[] }> {
    return { domains: SEED_LEARNING_DOMAINS };
  }

  // -------------------------------------------------------------
  // 2. Dual Mode & User Preferences
  // -------------------------------------------------------------
  public async getLearningPreference(): Promise<OfflineLearningPreference> {
    const userId = await this.ensureInitialized();
    let pref = await db.learningPreferences.where('userId').equals(userId).first();
    if (!pref) {
      pref = {
        id: `pref-${userId}`,
        userId,
        mode: 'student',
        speechEnabled: false,
        language: 'english',
        updatedAt: new Date().toISOString()
      };
      await db.learningPreferences.put(pref);
    }
    return pref;
  }

  public async updateLearningPreference(updates: Partial<OfflineLearningPreference>): Promise<OfflineLearningPreference> {
    const userId = await this.ensureInitialized();
    let pref = await this.getLearningPreference();
    const updated: OfflineLearningPreference = {
      ...pref,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await db.learningPreferences.put(updated);
    return updated;
  }

  // -------------------------------------------------------------
  // 3. Interactive Cloud Console Simulation
  // -------------------------------------------------------------
  public async getCloudSimulation(): Promise<OfflineCloudSimulationState> {
    const userId = await this.ensureInitialized();
    let sim = await db.cloudSimulations.where('userId').equals(userId).first();
    if (!sim) {
      sim = {
        ...SEED_CLOUD_SIMULATION_STATE,
        id: `sim-${userId}`,
        userId
      };
      await db.cloudSimulations.put(sim);
    }
    return sim;
  }

  public async updateCloudSimulation(state: OfflineCloudSimulationState): Promise<OfflineCloudSimulationState> {
    const userId = await this.ensureInitialized();
    const updated: OfflineCloudSimulationState = {
      ...state,
      id: state.id || `sim-${userId}`,
      userId,
      lastUpdated: new Date().toISOString()
    };
    await db.cloudSimulations.put(updated);
    return updated;
  }

  // -------------------------------------------------------------
  // 4. Simulated Terminal & Quests
  // -------------------------------------------------------------
  public async getTerminalQuests(): Promise<{ quests: (TerminalQuest & { completed: boolean })[] }> {
    const storedDone = JSON.parse(localStorage.getItem('skillpath_terminal_quests_done') || '[]');
    return {
      quests: SEED_TERMINAL_QUESTS.map(q => ({
        ...q,
        completed: storedDone.includes(q.id)
      }))
    };
  }

  public async executeTerminalCommand(cmdString: string): Promise<{
    output: string;
    isError: boolean;
    questUnlocked?: TerminalQuest;
  }> {
    const trimmed = cmdString.trim();
    if (!trimmed) return { output: '', isError: false };

    const sim = await this.getCloudSimulation();
    const lower = trimmed.toLowerCase();

    let output = '';
    let isError = false;

    // Command Dispatcher
    if (lower === 'clear') {
      return { output: '__CLEAR__', isError: false };
    } else if (lower === 'help') {
      output = `SkillPath Safe Educational Cloud Terminal (v2.4)
Supported AWS CLI & Linux Commands:
  aws sts get-caller-identity
  aws ec2 describe-instances
  aws ec2 run-instances --instance-type <type> --name <name>
  aws ec2 stop-instances --instance-ids <id>
  aws s3 ls [s3://bucket-name]
  aws s3 mb s3://<bucket-name>
  aws s3 cp <filename> s3://<bucket-name>/
  aws iam list-users
  aws iam create-user --user-name <username>
  aws ec2 describe-vpcs
  ls, pwd, cat <file>, curl <url>, top, uname -a
  git status, git log
  clear, help`;
    } else if (lower.startsWith('aws sts get-caller-identity')) {
      output = JSON.stringify({
        UserId: 'AIDASAMPLEUSER7EXAMPLE',
        Account: '123456789012',
        Arn: 'arn:aws:iam::123456789012:user/devops-lead'
      }, null, 2);
    } else if (lower.startsWith('aws ec2 describe-instances')) {
      const formatted = sim.ec2.instances.map(inst => ({
        InstanceId: inst.id,
        InstanceType: inst.type,
        State: { Name: inst.state },
        PublicIpAddress: inst.publicIp || 'None',
        PrivateIpAddress: inst.privateIp,
        SecurityGroups: [{ GroupName: inst.securityGroupId }],
        Placement: { AvailabilityZone: inst.az },
        Tags: [{ Key: 'Name', Value: inst.name }]
      }));
      output = JSON.stringify({ Reservations: [{ Instances: formatted }] }, null, 2);
    } else if (lower.startsWith('aws ec2 run-instances')) {
      const newInstId = `i-0${Math.random().toString(16).substring(2, 10)}`;
      const newInst = {
        id: newInstId,
        name: `sim-instance-${newInstId.substring(0, 6)}`,
        type: 't3.micro',
        state: 'running' as const,
        publicIp: `54.210.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 250)}`,
        privateIp: `10.0.1.${Math.floor(Math.random() * 200)}`,
        securityGroupId: 'sg-web-public',
        az: 'us-east-1a',
        launchTime: new Date().toISOString(),
        cpuUtilization: 12.5
      };
      sim.ec2.instances.push(newInst);
      await this.updateCloudSimulation(sim);
      output = JSON.stringify({ Instances: [{ InstanceId: newInstId, State: { Name: 'pending' }, InstanceType: 't3.micro' }] }, null, 2);
    } else if (lower.startsWith('aws ec2 stop-instances')) {
      const match = trimmed.match(/--instance-ids\s+([\w-]+)/i);
      const targetId = match ? match[1] : sim.ec2.instances[0]?.id;
      const target = sim.ec2.instances.find(i => i.id === targetId);
      if (target) {
        target.state = 'stopped';
        target.cpuUtilization = 0;
        await this.updateCloudSimulation(sim);
        output = JSON.stringify({ StoppingInstances: [{ CurrentState: { Name: 'stopping' }, PreviousState: { Name: 'running' }, InstanceId: targetId }] }, null, 2);
      } else {
        output = `An error occurred (InvalidInstanceID.NotFound) when calling the StopInstances operation: The instance ID '${targetId}' does not exist`;
        isError = true;
      }
    } else if (lower === 'aws s3 ls') {
      output = sim.s3.buckets.map(b => `${b.createdAt.substring(0, 10)} 12:00:00 ${b.name}`).join('\n');
    } else if (lower.startsWith('aws s3 ls s3://')) {
      const bktName = trimmed.replace(/aws s3 ls s3:\/\//i, '').replace(/\/$/, '').trim();
      const bkt = sim.s3.buckets.find(b => b.name === bktName);
      if (bkt) {
        output = bkt.objects.map(o => `${o.lastModified.substring(0, 10)} 10:00:00  ${o.sizeKb * 1024}  ${o.key}`).join('\n');
      } else {
        output = `fatal error: An error occurred (NoSuchBucket) when calling the ListObjectsV2 operation: The specified bucket does not exist.`;
        isError = true;
      }
    } else if (lower.startsWith('aws s3 mb s3://')) {
      const bktName = trimmed.replace(/aws s3 mb s3:\/\//i, '').trim();
      if (sim.s3.buckets.find(b => b.name === bktName)) {
        output = `fatal error: An error occurred (BucketAlreadyExists) when calling the CreateBucket operation: The requested bucket name is not available.`;
        isError = true;
      } else {
        sim.s3.buckets.push({
          id: `bkt-${Date.now()}`,
          name: bktName,
          region: 'us-east-1',
          blockPublicAccess: true,
          isPublic: false,
          versioning: false,
          createdAt: new Date().toISOString(),
          objects: []
        });
        await this.updateCloudSimulation(sim);
        output = `make_bucket: s3://${bktName}`;
      }
    } else if (lower.startsWith('aws iam list-users')) {
      output = JSON.stringify({
        Users: sim.iam.users.map(u => ({
          UserName: u.username,
          UserId: u.id,
          Arn: `arn:aws:iam::123456789012:user/${u.username}`,
          CreateDate: u.createdAt
        }))
      }, null, 2);
    } else if (lower.startsWith('aws iam create-user')) {
      const match = trimmed.match(/--user-name\s+([\w.-]+)/i);
      const username = match ? match[1] : `user-${Date.now()}`;
      sim.iam.users.push({
        id: `usr-${Date.now()}`,
        username,
        accessKeyId: `AKIA${Math.random().toString(36).substring(2, 14).toUpperCase()}`,
        policies: ['AmazonEC2ReadOnlyAccess'],
        mfaEnabled: false,
        createdAt: new Date().toISOString()
      });
      await this.updateCloudSimulation(sim);
      output = JSON.stringify({ User: { UserName: username, Arn: `arn:aws:iam::123456789012:user/${username}` } }, null, 2);
    } else if (lower.startsWith('aws ec2 describe-vpcs')) {
      output = JSON.stringify({
        Vpcs: sim.vpc.vpcs.map(v => ({
          VpcId: v.id,
          CidrBlock: v.cidrBlock,
          State: 'available',
          IsDefault: v.isDefault,
          Tags: [{ Key: 'Name', Value: v.name }]
        }))
      }, null, 2);
    } else if (lower === 'ls' || lower === 'ls -la') {
      output = `total 24\ndrwxr-xr-x 4 devops-lead staff  128 Nov 14 05:00 .\ndrwxr-xr-x 8 root        staff  256 Nov 14 04:00 ..\n-rw-r--r-- 1 devops-lead staff  412 Nov 14 04:30 architecture.tf\n-rw-r--r-- 1 devops-lead staff  842 Nov 14 04:35 package.json\n-rw-r--r-- 1 devops-lead staff 1024 Nov 14 04:40 README.md`;
    } else if (lower === 'pwd') {
      output = '/home/devops-lead/workspace';
    } else if (lower.startsWith('cat ')) {
      const file = trimmed.replace('cat ', '').trim();
      if (file.includes('tf') || file.includes('architecture')) {
        output = `resource "aws_vpc" "main" {\n  cidr_block = "10.0.0.0/16"\n  tags = { Name = "production-vpc" }\n}`;
      } else {
        output = `# SkillPath Engineering Lab\nSimulated Cloud Workspace v2.4.\nAll simulated cloud infrastructure state is stored safely in local browser IndexedDB.`;
      }
    } else if (lower.startsWith('curl ')) {
      output = `HTTP/1.1 200 OK\nDate: Sat, 14 Nov 2026 05:40:00 GMT\nServer: nginx/1.24.0\nContent-Type: application/json\nContent-Length: 42\n\n{"status":"healthy","cluster":"us-east-1a"}`;
    } else if (lower.startsWith('git status')) {
      output = `On branch main\nYour branch is up to date with 'origin/main'.\n\nChanges not staged for commit:\n  modified:   architecture.tf\n\nno changes added to commit (use "git add" and/or "git commit -a")`;
    } else if (lower.startsWith('git log')) {
      output = `commit 4f91629 (HEAD -> main, origin/main)\nAuthor: SkillPath Engineer <dev@skillpath.ai>\nDate:   Sat Nov 14 05:27:06 2026 +0000\n\n    feat: integrate cloud simulation and multi-agent systems`;
    } else {
      output = `bash: ${trimmed.split(' ')[0]}: command not recognized. Type 'help' to see safe educational commands.`;
      isError = true;
    }

    // Check Quests
    let questUnlocked: TerminalQuest | undefined;
    const storedDone = JSON.parse(localStorage.getItem('skillpath_terminal_quests_done') || '[]');
    for (const q of SEED_TERMINAL_QUESTS) {
      if (!storedDone.includes(q.id) && lower.includes(q.targetCommandPattern.toLowerCase())) {
        storedDone.push(q.id);
        localStorage.setItem('skillpath_terminal_quests_done', JSON.stringify(storedDone));
        questUnlocked = q;
        break;
      }
    }

    return { output, isError, questUnlocked };
  }

  // -------------------------------------------------------------
  // 5. SRE Incident War Room
  // -------------------------------------------------------------
  public async getSreIncidents(): Promise<{ incidents: SreIncidentScenario[] }> {
    return { incidents: SEED_SRE_INCIDENTS };
  }

  public async resolveSreIncident(incidentId: string, actionId: string, durationSeconds: number): Promise<{
    success: boolean;
    consequence: string;
    postMortem: any;
    score: number;
    credentialAwarded?: OfflinePortfolioCredential;
  }> {
    const userId = await this.ensureInitialized();
    const scenario = SEED_SRE_INCIDENTS.find(i => i.id === incidentId) || SEED_SRE_INCIDENTS[0];
    const action = scenario.mitigationOptions.find(a => a.id === actionId) || scenario.mitigationOptions[0];

    const isSuccess = action.isCorrect;
    const score = isSuccess ? Math.max(70, Math.min(100, Math.round(100 - (durationSeconds / 60) * 5))) : 40;

    // Apply state remediation if valid
    if (isSuccess && incidentId === 'inc-101') {
      const sim = await this.getCloudSimulation();
      const bkt = sim.s3.buckets.find(b => b.name === 'skillpath-customer-exports-backup');
      if (bkt) {
        bkt.blockPublicAccess = true;
        bkt.isPublic = false;
        await this.updateCloudSimulation(sim);
      }
    } else if (isSuccess && incidentId === 'inc-102') {
      const sim = await this.getCloudSimulation();
      if (sim.ec2.autoScalingGroups[0]) {
        sim.ec2.autoScalingGroups[0].maxSize = 6;
        sim.ec2.autoScalingGroups[0].desiredCapacity = 4;
        sim.ec2.instances.forEach(i => { i.cpuUtilization = 35; });
        await this.updateCloudSimulation(sim);
      }
    }

    // Save attempt
    const attempt: OfflineIncidentAttempt = {
      id: `inc-attempt-${Date.now()}`,
      userId,
      scenarioId: incidentId,
      scenarioTitle: scenario.title,
      severity: scenario.severity,
      resolved: isSuccess,
      durationSeconds,
      score,
      actionsTaken: [action.actionName],
      feedback: action.consequenceExplanation,
      timestamp: new Date().toISOString()
    };
    await db.incidentAttempts.put(attempt);

    let credentialAwarded: OfflinePortfolioCredential | undefined;
    if (isSuccess && score >= 80) {
      credentialAwarded = {
        id: `cred-${Date.now()}`,
        userId,
        credentialId: `SKILLPATH-SRE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        title: `SRE Incident Responder: ${scenario.title}`,
        skillCategory: 'DevOps & SRE',
        verificationHash: Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        scorePercentage: score,
        issuedDate: new Date().toISOString(),
        status: 'Verified',
        verifiedByAgent: 'Incident Analysis Agent',
        skillsCovered: ['Incident Triage', 'Cloud Resilience', 'Root Cause Analysis'],
        evidenceSummary: `Successfully resolved ${scenario.code} (${scenario.title}) in ${Math.round(durationSeconds)}s with verified post-mortem.`
      };
      await db.portfolioCredentials.put(credentialAwarded);
    }

    return {
      success: isSuccess,
      consequence: action.consequenceExplanation,
      postMortem: scenario.postMortemTemplate,
      score,
      credentialAwarded
    };
  }

  // -------------------------------------------------------------
  // 6. Placement & Diagnostic System
  // -------------------------------------------------------------
  public async getPlacementScenarios(): Promise<{ questions: PlacementQuestion[] }> {
    return { questions: SEED_PLACEMENT_SCENARIOS };
  }

  public async submitPlacementAssessment(answers: Record<string, number>): Promise<{
    result: OfflinePlacementResult;
  }> {
    const userId = await this.ensureInitialized();
    const questions = SEED_PLACEMENT_SCENARIOS;

    let techPoints = 0;
    let probPoints = 0;
    let pracPoints = 0;
    let expPoints = 0;

    questions.forEach(q => {
      const selectedIndex = answers[q.id];
      const selectedOption = q.options[selectedIndex] || q.options[0];
      const pts = selectedOption.points;

      if (q.dimension === 'technical') techPoints += pts;
      else if (q.dimension === 'problem_solving') probPoints += pts;
      else if (q.dimension === 'practical') pracPoints += pts;
      else if (q.dimension === 'experience') expPoints += pts;
    });

    const totalPoints = techPoints + probPoints + pracPoints + expPoints;
    const overallScore = Math.round((totalPoints / (questions.length * 10)) * 100);

    let level: 1 | 2 | 3 | 4 | 5 = 1;
    let levelName = 'Level 1: Beginner / Fresher';
    let recommendedMode: 'student' | 'professional' = 'student';

    if (overallScore >= 85) {
      level = 5;
      levelName = 'Level 5: Professional / SRE';
      recommendedMode = 'professional';
    } else if (overallScore >= 70) {
      level = 4;
      levelName = 'Level 4: Advanced Learner';
      recommendedMode = 'professional';
    } else if (overallScore >= 50) {
      level = 3;
      levelName = 'Level 3: Intermediate Learner';
      recommendedMode = 'student';
    } else if (overallScore >= 30) {
      level = 2;
      levelName = 'Level 2: Junior Learner';
      recommendedMode = 'student';
    }

    const result: OfflinePlacementResult = {
      id: `place-${Date.now()}`,
      userId,
      targetRole: 'Full Stack & Cloud Architecture',
      placementLevel: level,
      levelName,
      technicalScore: Math.round((techPoints / 20) * 100) || 75,
      problemSolvingScore: Math.round((probPoints / 10) * 100) || 80,
      practicalScore: Math.round((pracPoints / 10) * 100) || 70,
      experienceScore: Math.round((expPoints / 10) * 100) || 60,
      overallScore,
      recommendedMode,
      personalizedSummary: `Based on your diagnostic score of ${overallScore}%, your demonstrated core strengths align with ${levelName}. We have initialized your curriculum pacing and placed you into ${recommendedMode.toUpperCase()} mode.`,
      recommendedFocusAreas: [
        'VPC Subnetting & Network Egress',
        'Asynchronous Node.js Stream Buffers',
        'IAM Least-Privilege Policy Enforcement'
      ],
      completedAt: new Date().toISOString()
    };

    await db.placementDiagnostics.put(result);
    await this.updateLearningPreference({ mode: recommendedMode });

    return { result };
  }

  // -------------------------------------------------------------
  // 7. Security & Compliance Inspector
  // -------------------------------------------------------------
  public async getSecurityAudit(): Promise<{
    score: number;
    status: 'COMPLIANT' | 'WARNING' | 'CRITICAL';
    findings: {
      id: string;
      benchmark: string;
      title: string;
      severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      status: 'FAIL' | 'PASS';
      description: string;
      remediationSuggestion: string;
      canAutoRemediate: boolean;
    }[];
  }> {
    const sim = await this.getCloudSimulation();

    const findings = [
      {
        id: 'cis-mfa-root',
        benchmark: 'CIS 1.1',
        title: 'Enforce Multi-Factor Authentication on All IAM Users',
        severity: 'HIGH' as const,
        status: sim.iam.users.every(u => u.mfaEnabled) ? ('PASS' as const) : ('FAIL' as const),
        description: 'One or more IAM users have console access without MFA enabled (developer-alex).',
        remediationSuggestion: 'Enable virtual MFA token on developer-alex credentials.',
        canAutoRemediate: true
      },
      {
        id: 'cis-iam-wildcard',
        benchmark: 'CIS 1.16',
        title: 'Ensure IAM Least Privilege (No Wildcard Admin on Service Accounts)',
        severity: 'CRITICAL' as const,
        status: sim.iam.users.some(u => u.username === 'developer-alex' && u.policies.includes('AdministratorAccess')) ? ('FAIL' as const) : ('PASS' as const),
        description: 'AdministratorAccess attached directly to non-admin developer user.',
        remediationSuggestion: 'Detach AdministratorAccess and replace with scoped developer policy.',
        canAutoRemediate: true
      },
      {
        id: 'cis-s3-public',
        benchmark: 'CIS 2.1',
        title: 'Ensure S3 Bucket Block Public Access is Enabled',
        severity: 'CRITICAL' as const,
        status: sim.s3.buckets.every(b => b.blockPublicAccess) ? ('PASS' as const) : ('FAIL' as const),
        description: 'Bucket skillpath-customer-exports-backup allows public unauthenticated reads.',
        remediationSuggestion: 'Enable BlockPublicAcls, IgnorePublicAcls, BlockPublicPolicy on all buckets.',
        canAutoRemediate: true
      },
      {
        id: 'cis-sg-ssh',
        benchmark: 'CIS 4.1',
        title: 'Ensure Security Groups Do Not Allow 0.0.0.0/0 on Port 22 (SSH)',
        severity: 'HIGH' as const,
        status: sim.ec2.securityGroups.some(sg => sg.inboundRules.some(r => r.port === 22 && r.source === '0.0.0.0/0')) ? ('FAIL' as const) : ('PASS' as const),
        description: 'Security group sg-web-public permits inbound SSH (Port 22) from the entire internet.',
        remediationSuggestion: 'Restrict SSH ingress to specific corporate bastion IP or VPN CIDR.',
        canAutoRemediate: true
      },
      {
        id: 'cis-cloudtrail',
        benchmark: 'CIS 3.1',
        title: 'Ensure Multi-Region CloudTrail Audit Logging is Active',
        severity: 'MEDIUM' as const,
        status: 'PASS' as const,
        description: 'CloudTrail audit vault bucket skillpath-cloudtrail-audit-vault is active.',
        remediationSuggestion: 'Keep logging enabled with Object Lock immutability.',
        canAutoRemediate: false
      }
    ];

    const passCount = findings.filter(f => f.status === 'PASS').length;
    const score = Math.round((passCount / findings.length) * 100);
    const status = score >= 85 ? 'COMPLIANT' : score >= 60 ? 'WARNING' : 'CRITICAL';

    return { score, status, findings };
  }

  public async remediateSecurityIssue(findingId: string): Promise<{ success: boolean; message: string }> {
    const sim = await this.getCloudSimulation();

    if (findingId === 'cis-mfa-root') {
      sim.iam.users.forEach(u => { u.mfaEnabled = true; });
      await this.updateCloudSimulation(sim);
      return { success: true, message: 'Enabled MFA across all active IAM user accounts.' };
    } else if (findingId === 'cis-iam-wildcard') {
      const user = sim.iam.users.find(u => u.username === 'developer-alex');
      if (user) {
        user.policies = user.policies.filter(p => p !== 'AdministratorAccess');
        user.policies.push('AmazonEC2ReadOnlyAccess');
        await this.updateCloudSimulation(sim);
      }
      return { success: true, message: 'Detached AdministratorAccess policy from developer-alex and enforced least privilege.' };
    } else if (findingId === 'cis-s3-public') {
      sim.s3.buckets.forEach(b => {
        b.blockPublicAccess = true;
        b.isPublic = false;
      });
      await this.updateCloudSimulation(sim);
      return { success: true, message: 'Enabled S3 Block Public Access on all buckets.' };
    } else if (findingId === 'cis-sg-ssh') {
      const webSg = sim.ec2.securityGroups.find(sg => sg.id === 'sg-web-public');
      if (webSg) {
        webSg.inboundRules = webSg.inboundRules.filter(r => !(r.port === 22 && r.source === '0.0.0.0/0'));
        await this.updateCloudSimulation(sim);
      }
      return { success: true, message: 'Removed unrestricted 0.0.0.0/0 SSH rule from sg-web-public.' };
    }

    return { success: false, message: 'Manual remediation required for this finding.' };
  }

  // -------------------------------------------------------------
  // 8. Verified Proof of Work Portfolio
  // -------------------------------------------------------------
  public async getPortfolioCredentials(): Promise<{ credentials: OfflinePortfolioCredential[] }> {
    const userId = await this.ensureInitialized();
    let creds = await db.portfolioCredentials.where('userId').equals(userId).toArray();
    if (creds.length === 0) {
      await db.portfolioCredentials.bulkAdd(SEED_PORTFOLIO_CREDENTIALS);
      creds = SEED_PORTFOLIO_CREDENTIALS;
    }
    return { credentials: creds };
  }
}

export const api = new OfflineFirstApiService();
