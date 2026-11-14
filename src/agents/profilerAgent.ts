import { OfflineSkill, OfflineProfile, OfflineUser } from '../db/indexedDb';
import { ProfilerAnalysisResult, AgentReasoningTrace } from './types';

export class ProfilerAgent {
  public static analyzeProfile(
    user: OfflineUser,
    profile: OfflineProfile,
    skills: OfflineSkill[]
  ): ProfilerAnalysisResult {
    const traces: AgentReasoningTrace[] = [];
    const timestamp = new Date().toISOString();

    traces.push({
      step: 1,
      agentName: 'Profiler & Skill Analyst Agent',
      thought: `Initiating multi-vector profiling for user "${user.name}" (${user.role}). Evaluating ${skills.length} stored skills against target role ${profile.targetCareerRoleId}.`,
      action: 'INGEST_USER_CREDENTIALS',
      observation: `Profile shows ${profile.hoursPerWeek} hrs/week available study budget. Completed tasks: ${profile.completedTasksCount}. Verified skills ratio: ${skills.filter(s => s.isVerified).length}/${skills.length}.`,
      timestamp
    });

    const strengths: string[] = [];
    const blindSpots: string[] = [];

    // Analyze verified vs self-reported
    const unverifiedSkills = skills.filter(s => !s.isVerified && s.proficiencyLevel >= 3);
    if (unverifiedSkills.length > 0) {
      blindSpots.push(
        `High self-reported proficiency in ${unverifiedSkills.map(s => s.skillName).join(', ')} lacks assessment validation. Unverified ratings introduce hiring risk.`
      );
    }

    skills.forEach(s => {
      if (s.proficiencyLevel >= 4) {
        strengths.push(`${s.skillName} (Level ${s.proficiencyLevel}/5${s.isVerified ? ' - Verified' : ''})`);
      } else if (s.proficiencyLevel <= 2) {
        blindSpots.push(`Foundational deficit in ${s.skillName} (Level ${s.proficiencyLevel}/5).`);
      }
    });

    traces.push({
      step: 2,
      agentName: 'Profiler & Skill Analyst Agent',
      thought: 'Synthesizing learner persona archetype and computing cognitive velocity capacity.',
      action: 'COMPUTE_PERSONA_ARCHETYPE',
      observation: `Identified ${strengths.length} core competencies and ${blindSpots.length} structural blind spots. Pacing indexed to ${profile.hoursPerWeek}h/week commitment.`,
      timestamp
    });

    const personaSummary = profile.hoursPerWeek >= 12
      ? `High-velocity ${user.role.replace('_', ' ')} with solid aptitude. Well positioned for intensive project execution.`
      : `Moderate-pace ${user.role.replace('_', ' ')} balancing commitments. Requires structured milestone chunking to prevent cognitive fatigue.`;

    return {
      personaSummary,
      strengths,
      blindSpots,
      reasoningTraces: traces
    };
  }

  /**
   * Automatic Skill Extractor & Parser for Pasted Resumes or Project Overviews
   */
  public static parseResumeOrProjectText(rawText: string): {
    extractedSkills: {
      skillName: string;
      category: 'languages' | 'frameworks' | 'databases' | 'cloud' | 'analytics' | 'design' | 'security' | 'soft_skills';
      confidenceLevel: number;
      sourceSnippet: string;
    }[];
    reasoningTraces: AgentReasoningTrace[];
  } {
    const traces: AgentReasoningTrace[] = [];
    const timestamp = new Date().toISOString();

    traces.push({
      step: 1,
      agentName: 'Profiler & Skill Analyst Agent',
      thought: 'Received unformatted text payload. Tokenizing text and executing deterministic keyword & regex pattern matchers.',
      action: 'SCAN_RESUME_TEXT',
      observation: `Raw text length: ${rawText.length} characters. Looking for known technical entities and proficiency qualifiers.`,
      timestamp
    });

    const DICTIONARY: {
      name: string;
      category: 'languages' | 'frameworks' | 'databases' | 'cloud' | 'analytics' | 'design' | 'security' | 'soft_skills';
      regex: RegExp;
    }[] = [
      { name: 'JavaScript', category: 'languages', regex: /\b(javascript|es6|es20\d\d|js)\b/i },
      { name: 'TypeScript', category: 'languages', regex: /\b(typescript|ts)\b/i },
      { name: 'Python', category: 'languages', regex: /\b(python|py)\b/i },
      { name: 'React', category: 'frameworks', regex: /\b(react|reactjs|react\.js|redux|zustand)\b/i },
      { name: 'Node.js', category: 'frameworks', regex: /\b(node|nodejs|node\.js|express|nest|fastify)\b/i },
      { name: 'HTML & CSS', category: 'languages', regex: /\b(html|html5|css|css3|sass|tailwind|bootstrap)\b/i },
      { name: 'SQL / Databases', category: 'databases', regex: /\b(sql|mysql|postgresql|postgres|sqlite|relational)\b/i },
      { name: 'PostgreSQL', category: 'databases', regex: /\b(postgres|postgresql|psql)\b/i },
      { name: 'Docker', category: 'cloud', regex: /\b(docker|container|containerization|dockerfile)\b/i },
      { name: 'Kubernetes', category: 'cloud', regex: /\b(kubernetes|k8s|helm)\b/i },
      { name: 'AWS / Cloud', category: 'cloud', regex: /\b(aws|amazon web services|ec2|s3|lambda|gcp|azure)\b/i },
      { name: 'Git & Version Control', category: 'cloud', regex: /\b(git|github|gitlab|version control)\b/i },
      { name: 'REST APIs', category: 'frameworks', regex: /\b(rest|restful|api|endpoints|json|crud)\b/i },
      { name: 'Machine Learning', category: 'analytics', regex: /\b(machine learning|ml|scikit-learn|pandas|numpy|neural networks)\b/i },
      { name: 'PyTorch', category: 'analytics', regex: /\b(pytorch|torch|deep learning|llm|transformers)\b/i },
      { name: 'Figma', category: 'design', regex: /\b(figma|wireframing|prototyping|ui\/ux|design system)\b/i },
      { name: 'Cybersecurity', category: 'security', regex: /\b(cybersecurity|owasp|penetration testing|infosec|network security)\b/i },
    ];

    const results: {
      skillName: string;
      category: 'languages' | 'frameworks' | 'databases' | 'cloud' | 'analytics' | 'design' | 'security' | 'soft_skills';
      confidenceLevel: number;
      sourceSnippet: string;
    }[] = [];

    const lower = rawText.toLowerCase();

    DICTIONARY.forEach(dict => {
      const match = rawText.match(dict.regex);
      if (match && match.index !== undefined) {
        // Extract surrounding sentence snippet
        const start = Math.max(0, match.index - 35);
        const end = Math.min(rawText.length, match.index + match[0].length + 45);
        const snippet = '...' + rawText.substring(start, end).replace(/\n/g, ' ').trim() + '...';

        // Estimate proficiency level based on surrounding language
        const context = rawText.substring(Math.max(0, match.index - 50), Math.min(rawText.length, match.index + 50)).toLowerCase();
        let level = 3; // Intermediate default
        if (context.includes('senior') || context.includes('architect') || context.includes('production') || context.includes('led') || context.includes('years')) {
          level = 4;
        } else if (context.includes('expert') || context.includes('master') || context.includes('principal')) {
          level = 5;
        } else if (context.includes('learned') || context.includes('basic') || context.includes('intro') || context.includes('student')) {
          level = 2;
        }

        results.push({
          skillName: dict.name,
          category: dict.category,
          confidenceLevel: level,
          sourceSnippet: snippet
        });
      }
    });

    traces.push({
      step: 2,
      agentName: 'Profiler & Skill Analyst Agent',
      thought: `Parsing complete. Successfully extracted ${results.length} distinct technical competencies with context confidence levels.`,
      action: 'EMIT_PARSED_SKILLS',
      observation: `Detected skills: ${results.map(r => `${r.skillName} (L${r.confidenceLevel})`).join(', ')}.`,
      timestamp
    });

    return {
      extractedSkills: results,
      reasoningTraces: traces
    };
  }
}
