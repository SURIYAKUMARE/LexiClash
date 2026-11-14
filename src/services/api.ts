import {
  User,
  UserProfile,
  Skill,
  CareerRole,
  SkillGapAnalysisResult,
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
} from '../types';

const API_BASE = '/api';

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('skillpath_token');
  }

  public setToken(token: string): void {
    localStorage.setItem('skillpath_token', token);
  }

  public removeToken(): void {
    localStorage.removeItem('skillpath_token');
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.removeToken();
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || data.message || 'API request failed');
    }

    return data as T;
  }

  // Auth Endpoints
  public async register(payload: any) {
    const data = await this.request<{ token: string; user: User; profile: UserProfile }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(data.token);
    return data;
  }

  public async login(credentials: { email: string; password: string }) {
    const data = await this.request<{ token: string; user: User; profile: UserProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setToken(data.token);
    return data;
  }

  public async googleLogin(payload: { email?: string; name?: string; avatar?: string }) {
    const data = await this.request<{ token: string; user: User; profile: UserProfile }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    this.setToken(data.token);
    return data;
  }

  public async forgotPassword(email: string) {
    return this.request<{ message: string; resetToken?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  public async resetPassword(payload: { email: string; newPassword: string }) {
    return this.request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async getMe() {
    return this.request<{ user: User; profile: UserProfile }>('/auth/me');
  }

  public async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.removeToken();
    }
  }

  // Profile Endpoints
  public async getProfile() {
    return this.request<{ profile: UserProfile }>('/profile');
  }

  public async updateProfile(payload: Partial<UserProfile>) {
    return this.request<{ profile: UserProfile }>('/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  public async submitOnboarding(payload: any) {
    return this.request<{ success: boolean; profile: UserProfile; synthesis?: any }>('/profile/onboarding', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Skills Endpoints
  public async getSkills() {
    return this.request<{ skills: Skill[] }>('/skills');
  }

  public async addSkill(payload: { skillName: string; category: string; proficiencyLevel: number; evidence?: string }) {
    return this.request<{ skill: Skill }>('/skills', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async updateSkill(id: string, payload: Partial<Skill>) {
    return this.request<{ skill: Skill }>(`/skills/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  public async deleteSkill(id: string) {
    return this.request<{ message: string; skill: Skill }>(`/skills/${id}`, {
      method: 'DELETE',
    });
  }

  public async getSkillGapAnalysis(roleId?: string) {
    const query = roleId ? `?roleId=${encodeURIComponent(roleId)}` : '';
    return this.request<{ gapAnalysis: SkillGapAnalysisResult }>(`/skills/gap-analysis${query}`);
  }

  // Careers Endpoints
  public async getCareers() {
    return this.request<{ careers: CareerRole[] }>('/careers');
  }

  public async getCareerDetails(id: string) {
    return this.request<{ career: CareerRole }>(`/careers/${id}`);
  }

  public async getCareerIntelligence(id: string) {
    return this.request<{ intelligence: any }>(`/careers/${id}/intelligence`);
  }

  public async selectTargetCareer(roleId: string) {
    return this.request<{
      success: boolean;
      targetRole: CareerRole;
      readinessScore: number;
      roadmap: LearningRoadmap;
    }>('/careers/select-target', {
      method: 'POST',
      body: JSON.stringify({ roleId }),
    });
  }

  // Roadmap Endpoints
  public async getRoadmap() {
    return this.request<{ roadmap: LearningRoadmap }>('/roadmap');
  }

  public async toggleRoadmapTask(taskId: string) {
    return this.request<{
      success: boolean;
      task: any;
      overallProgressPercentage: number;
      roadmap: LearningRoadmap;
    }>(`/roadmap/task/${taskId}/toggle`, {
      method: 'POST',
    });
  }

  public async regenerateRoadmap() {
    return this.request<{ success: boolean; roadmap: LearningRoadmap }>('/roadmap/regenerate', {
      method: 'POST',
    });
  }

  public async getRoadmapAdjustments() {
    return this.request<{ adjustments: RoadmapAdjustmentLog[] }>('/roadmap/adjustments');
  }

  // Assessments Endpoints
  public async getQuestions(params: { topic?: string; difficulty?: string; skill?: string }) {
    const q = new URLSearchParams();
    if (params.topic) q.append('topic', params.topic);
    if (params.difficulty) q.append('difficulty', params.difficulty);
    if (params.skill) q.append('skill', params.skill);
    return this.request<{ questions: Question[]; total: number }>(`/assessments/questions?${q.toString()}`);
  }

  public async submitAssessment(payload: {
    topic: string;
    difficulty: string;
    userAnswers: { questionId: string; selectedOption: number }[];
  }) {
    return this.request<{
      attempt: AssessmentAttempt;
      diagnosis: any;
      detailedAnswers: any[];
      skillUpdated: Skill;
      adaptiveResult?: any;
    }>('/assessments/submit', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async getAssessmentHistory() {
    return this.request<{ history: AssessmentAttempt[] }>('/assessments/history');
  }

  // Mentor Chat Endpoints
  public async getMentorHistory() {
    return this.request<{ messages: MentorMessage[] }>('/mentor/history');
  }

  public async sendMentorMessage(message: string, mode: string = 'general') {
    return this.request<{
      userMessage: MentorMessage;
      assistantMessage: MentorMessage;
      suggestedFollowUps: string[];
    }>('/mentor/chat', {
      method: 'POST',
      body: JSON.stringify({ message, mode }),
    });
  }

  public async clearMentorHistory() {
    return this.request<{ message: string }>('/mentor/history', { method: 'DELETE' });
  }

  // Agents Activity Endpoints
  public async getAgentActivity() {
    return this.request<{ executions: AgentExecutionRecord[]; hasGeminiApiKey: boolean }>('/agents/activity');
  }

  public async runAgent(agentName: string) {
    return this.request<{ success: boolean; agentName: string; result: any; executions: AgentExecutionRecord[] }>(
      '/agents/run',
      {
        method: 'POST',
        body: JSON.stringify({ agentName }),
      }
    );
  }

  // Analytics Endpoints
  public async getAnalytics() {
    return this.request<{
      metrics: any;
      radarData: any[];
      weeklyActivity: any[];
      progressTimeline: any[];
      assessmentStats: any;
    }>('/analytics');
  }

  // Resources Endpoints
  public async getResources(params: Record<string, string> = {}) {
    const q = new URLSearchParams(params);
    return this.request<{ resources: LearningResource[]; total: number }>(`/resources?${q.toString()}`);
  }

  // Projects Endpoints
  public async getProjects() {
    return this.request<{ projects: ProjectItem[] }>('/projects');
  }

  public async addProject(payload: Partial<ProjectItem>) {
    return this.request<{ project: ProjectItem }>('/projects', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public async updateProject(id: string, payload: Partial<ProjectItem>) {
    return this.request<{ project: ProjectItem }>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  public async deleteProject(id: string) {
    return this.request<{ message: string; project: ProjectItem }>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Certificates Endpoints
  public async getCertificates() {
    return this.request<{ certificates: Certificate[] }>('/certificates');
  }

  public async claimCertificate(payload: { title: string; skillsCovered?: string[]; gradePercentage?: number }) {
    return this.request<{ certificate: Certificate }>('/certificates/claim', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Notifications Endpoints
  public async getNotifications() {
    return this.request<{ notifications: NotificationItem[] }>('/notifications');
  }

  public async markNotificationRead(id: string) {
    return this.request<{ success: boolean; notification: NotificationItem }>(`/notifications/${id}/read`, {
      method: 'PUT',
    });
  }

  public async markAllNotificationsRead() {
    return this.request<{ success: boolean; message: string }>('/notifications/read-all', {
      method: 'PUT',
    });
  }
}

export const api = new ApiService();
