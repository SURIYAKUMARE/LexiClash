import { db, OfflineUser, OfflineProfile, OfflineSkill, OfflineRoadmap } from './indexedDb';
import { SEED_CAREER_ROLES, SEED_QUESTIONS, DEMO_PERSONAS } from './seedData';
import { CurriculumStrategistAgent } from '../agents/curriculumStrategistAgent';
import { CareerArchitectAgent } from '../agents/careerArchitectAgent';

export async function initializeOfflineDatabase(): Promise<{
  activeUser: OfflineUser;
  activeProfile: OfflineProfile;
}> {
  // Check if careers exist; if not, seed careers and questions
  const careerCount = await db.careers.count();
  if (careerCount === 0) {
    await db.careers.bulkAdd(SEED_CAREER_ROLES);
    await db.questions.bulkAdd(SEED_QUESTIONS);
  }

  // Check if active user exists
  const userCount = await db.users.count();
  if (userCount === 0) {
    // Seed default persona: CS Student targeting Full Stack Developer
    return await loadDemoPersona('persona-student');
  }

  // Retrieve current active user from localStorage or first user
  const storedUserId = localStorage.getItem('skillpath_offline_user_id');
  let user = storedUserId ? await db.users.get(storedUserId) : null;
  if (!user) {
    user = await db.users.toCollection().first();
  }

  if (!user) {
    return await loadDemoPersona('persona-student');
  }

  let profile = await db.profiles.where('userId').equals(user.id).first();
  if (!profile) {
    profile = {
      id: `profile-${user.id}`,
      userId: user.id,
      targetCareerRoleId: 'role-fullstack',
      completedOnboarding: true,
      hoursPerWeek: 12,
      educationLevel: 'B.Tech Computer Science',
      streakDays: 9,
      totalLearningHours: 36.5,
      completedTasksCount: 14,
      overallMasteryLevel: 3,
      overallReadinessScore: 72,
      lastActiveDate: new Date().toISOString()
    };
    await db.profiles.add(profile);
  }

  localStorage.setItem('skillpath_offline_user_id', user.id);
  return { activeUser: user, activeProfile: profile };
}

export async function loadDemoPersona(personaId: string): Promise<{
  activeUser: OfflineUser;
  activeProfile: OfflineProfile;
}> {
  const persona = DEMO_PERSONAS.find(p => p.id === personaId) || DEMO_PERSONAS[0];

  // 1. Create or overwrite user
  const user: OfflineUser = {
    id: persona.user.id,
    email: persona.user.email,
    name: persona.user.name,
    role: persona.user.role,
    college: persona.user.college,
    createdAt: new Date().toISOString()
  };
  await db.users.put(user);

  // 2. Clear old skills for this user and insert persona skills
  await db.skills.where('userId').equals(user.id).delete();
  const skillsToInsert: OfflineSkill[] = persona.skills.map((s, idx) => ({
    id: `skill-${user.id}-${idx}`,
    userId: user.id,
    skillName: s.skillName,
    category: s.category as any,
    proficiencyLevel: s.proficiencyLevel,
    isVerified: s.isVerified,
    verifiedScore: s.verifiedScore,
    evidence: s.evidence,
    lastAssessedAt: s.isVerified ? new Date().toISOString() : undefined
  }));
  await db.skills.bulkAdd(skillsToInsert);

  // 3. Find target role
  const targetRole = await db.careers.get(persona.targetRoleId) || SEED_CAREER_ROLES[0];

  // 4. Calculate initial readiness score
  const benchmark = CareerArchitectAgent.benchmarkRole(skillsToInsert, targetRole);

  // 5. Generate roadmap
  const roadmap = CurriculumStrategistAgent.generateRoadmap(
    user.id,
    targetRole,
    skillsToInsert,
    persona.hoursPerWeek
  );
  await db.roadmaps.where('userId').equals(user.id).delete();
  await db.roadmaps.put(roadmap);

  // 6. Create or update profile
  const profile: OfflineProfile = {
    id: `profile-${user.id}`,
    userId: user.id,
    targetCareerRoleId: targetRole.id,
    completedOnboarding: true,
    hoursPerWeek: persona.hoursPerWeek,
    educationLevel: 'Higher Education in Computing',
    streakDays: 9,
    totalLearningHours: 32.0,
    completedTasksCount: roadmap.phases[0]?.tasks.filter(t => t.completed).length || 2,
    overallMasteryLevel: 3,
    overallReadinessScore: benchmark.readinessPercentage,
    lastActiveDate: new Date().toISOString()
  };
  await db.profiles.put(profile);

  localStorage.setItem('skillpath_offline_user_id', user.id);
  localStorage.setItem('skillpath_token', `offline-token-${user.id}`);

  return { activeUser: user, activeProfile: profile };
}

export async function resetDatabaseToCleanState(): Promise<void> {
  await db.delete();
  await db.open();
  await initializeOfflineDatabase();
}
