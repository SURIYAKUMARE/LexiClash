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
  OfflineProjectIdea
} from '../db/indexedDb';
import { initializeOfflineDatabase, loadDemoPersona } from '../db/initDb';
import { SEED_CAREER_ROLES, SEED_QUESTIONS, OFFLINE_STUDY_GUIDES } from '../db/seedData';
import { CareerArchitectAgent } from '../agents/careerArchitectAgent';
import { CurriculumStrategistAgent } from '../agents/curriculumStrategistAgent';
import { AdaptiveMentorAgent } from '../agents/adaptiveMentorAgent';
import { ProfilerAgent } from '../agents/profilerAgent';
import { AgentOrchestrator } from '../agents/orchestrator';

class OfflineFirstApiService {
  private activeUserId: string = 'user-student';

  private async ensureInitialized(): Promise<string> {
    const stored = localStorage.getItem('skillpath_offline_user_id');
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
    let user = await db.users.where('email').equalsIgnoreCase(credentials.email.trim()).first();

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
  public async getSkills(): Promise<{ skills: OfflineSkill[] }> {
    const userId = await this.ensureInitialized();
    const skills = await db.skills.where('userId').equals(userId).toArray();
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

    await db.roadmaps.update(roadmap.id, roadmap);

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
      completedAt: new Date().toISOString()
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
        await db.roadmaps.update(currentRoadmap.id, reRoute.updatedRoadmap);

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
}

export const api = new OfflineFirstApiService();
