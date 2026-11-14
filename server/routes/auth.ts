import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database.js';
import { User, UserProfile } from '../types.js';
import { authMiddleware, AuthenticatedRequest } from '../middleware/authMiddleware.js';

export const authRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'skillpath_ai_super_secret_jwt_key_2025_change_in_production';

function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/register
authRouter.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, college, educationLevel, termsAccepted } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    if (!termsAccepted) {
      return res.status(400).json({ error: 'You must accept the terms of service.' });
    }

    const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const userId = `user-${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();

    const newUser: User = {
      id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      college: college?.trim() || undefined,
      educationLevel: educationLevel || 'Bachelor\'s Degree',
      role: 'student',
      termsAccepted: Boolean(termsAccepted),
      createdAt: now,
      updatedAt: now
    };
    db.users.push(newUser);

    // Create Initial User Profile
    const newProfile: UserProfile = {
      userId,
      completedOnboarding: false,
      college: college?.trim() || undefined,
      educationLevel: educationLevel || 'Bachelor\'s Degree',
      targetCareerRoleId: 'role-fullstack',
      careerInterests: [],
      learningPreferences: {
        hoursPerWeek: 10,
        style: 'practical',
        pace: 'moderate'
      },
      overallMasteryLevel: 1,
      overallReadinessScore: 0,
      profileCompletionPercentage: 35,
      streakDays: 1,
      lastActiveDate: now,
      totalLearningHours: 0,
      completedTasksCount: 0,
      completedAssessmentsCount: 0
    };
    db.profiles.push(newProfile);

    // Initial Welcome Notification
    db.notifications.push({
      id: `notif-${uuidv4().slice(0, 8)}`,
      userId,
      title: 'Welcome to SkillPath AI!',
      message: 'Complete your initial onboarding profile to unlock your personalized learning roadmap.',
      type: 'info',
      read: false,
      createdAt: now,
      link: '/onboarding'
    });

    db.save();

    const token = generateToken(userId);
    const { passwordHash: _, ...safeUser } = newUser;

    return res.status(201).json({
      token,
      user: safeUser,
      profile: newProfile
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// POST /api/auth/login
authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const profile = db.profiles.find(p => p.userId === user.id);
    const token = generateToken(user.id);
    const { passwordHash: _, ...safeUser } = user;

    return res.json({
      token,
      user: safeUser,
      profile: profile || null
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// POST /api/auth/google (One-Click OAuth simulation)
authRouter.post('/google', async (req, res) => {
  try {
    const { email, name, avatar } = req.body;
    const targetEmail = (email || 'google.user@example.com').toLowerCase().trim();
    const targetName = name || 'Google Learner';

    let user = db.users.find(u => u.email.toLowerCase() === targetEmail);
    const now = new Date().toISOString();

    if (!user) {
      const userId = `user-g-${uuidv4().slice(0, 8)}`;
      const salt = bcrypt.genSaltSync(10);
      const passwordHash = bcrypt.hashSync(uuidv4(), salt);

      user = {
        id: userId,
        name: targetName,
        email: targetEmail,
        passwordHash,
        avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        role: 'student',
        termsAccepted: true,
        createdAt: now,
        updatedAt: now
      };
      db.users.push(user);

      const profile: UserProfile = {
        userId,
        completedOnboarding: true,
        degree: 'Software Engineering',
        college: 'State Technical University',
        graduationYear: '2025',
        bio: 'Google authenticated learner exploring modern full-stack systems and cloud development.',
        targetCareerRoleId: 'role-fullstack',
        careerInterests: ['Full Stack Developer', 'Cloud Computing'],
        learningPreferences: {
          hoursPerWeek: 12,
          style: 'practical',
          pace: 'moderate'
        },
        overallMasteryLevel: 2,
        overallReadinessScore: 65,
        profileCompletionPercentage: 85,
        streakDays: 4,
        lastActiveDate: now,
        totalLearningHours: 18,
        completedTasksCount: 8,
        completedAssessmentsCount: 2
      };
      db.profiles.push(profile);
      db.save();
    }

    const profile = db.profiles.find(p => p.userId === user.id);
    const token = generateToken(user.id);
    const { passwordHash: _, ...safeUser } = user;

    return res.json({
      token,
      user: safeUser,
      profile: profile || null
    });
  } catch (err: any) {
    console.error('Google auth error:', err);
    return res.status(500).json({ error: 'Google sign-in failed.' });
  }
});

// POST /api/auth/forgot-password
authRouter.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) {
    // Return generic success to avoid email harvesting
    return res.json({
      message: 'If an account exists with this email, a password reset link has been dispatched.',
      resetToken: 'demo-reset-token-' + uuidv4().slice(0, 8)
    });
  }

  const resetToken = `reset-${uuidv4()}`;
  return res.json({
    message: 'Password reset link dispatched successfully.',
    resetToken,
    instructions: 'Use the reset token or simulated confirmation flow to update your password.'
  });
});

// POST /api/auth/reset-password
authRouter.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: 'Valid email and password (minimum 8 chars) are required.' });
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) {
    return res.status(404).json({ error: 'Account not found.' });
  }

  const salt = bcrypt.genSaltSync(10);
  user.passwordHash = bcrypt.hashSync(newPassword, salt);
  user.updatedAt = new Date().toISOString();
  db.save();

  return res.json({ message: 'Password has been updated successfully. You may now log in.' });
});

// GET /api/auth/me
authRouter.get('/me', authMiddleware, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const profile = db.profiles.find(p => p.userId === user.id);
  const { passwordHash: _, ...safeUser } = user;
  return res.json({ user: safeUser, profile: profile || null });
});

// POST /api/auth/logout
authRouter.post('/logout', (_req, res) => {
  return res.json({ message: 'Logged out successfully.' });
});
