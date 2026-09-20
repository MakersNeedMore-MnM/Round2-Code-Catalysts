import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Password validation rule
function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters long';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return 'Password must contain at least one special character';
  return null;
}

// In-memory rate limiting map for admin login attempts
const adminLoginAttempts = new Map<string, { count: number; lockUntil?: number }>();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Full Name, Email and Password are required.' });
    }

    // Check password rules
    const pwdErr = validatePassword(password);
    if (pwdErr) {
      return res.status(400).json({ error: pwdErr });
    }

    // Check duplicate email
    const existingEmail = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (existingEmail) {
      return res.status(409).json({ error: 'This email is already registered. Please log in instead.' });
    }

    // Check duplicate phone if provided
    if (phone && phone.trim()) {
      const existingPhone = await prisma.user.findUnique({ where: { phone: phone.trim() } });
      if (existingPhone) {
        return res.status(409).json({ error: 'This mobile number is already registered. Please use another number or log in.' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        phone: phone ? phone.trim() : null,
        role: role || 'CITIZEN'
      },
      select: { id: true, name: true, email: true, role: true, phone: true, city: true, state: true, avatarUrl: true, createdAt: true }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' as any }
    );

    res.status(201).json({ user, token });
  } catch (error: any) {
    console.error('Register error:', error);
    if (error.code === 'P2002') {
      const target = error.meta?.target?.[0];
      if (target === 'phone') {
        return res.status(409).json({ error: 'This mobile number is already registered. Please use another number or log in.' });
      }
      return res.status(409).json({ error: 'This email is already registered. Please log in instead.' });
    }
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// POST /api/auth/login — Citizen & General Login (Email or Phone)
router.post('/login', async (req, res) => {
  try {
    const { loginId, email, password } = req.body;
    const identifier = (loginId || email || '').trim();

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/Mobile and password are required.' });
    }

    // Find by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase() },
          { phone: identifier }
        ]
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid email/mobile or password.' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email/mobile or password.' });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' as any }
    );

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        city: user.city,
        state: user.state,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/admin-login — Dedicated Admin Login with Rate Limiting & Attempt Lockout
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const clientKey = (email || req.ip).toLowerCase();

    // Check rate limit status
    const attempt = adminLoginAttempts.get(clientKey);
    if (attempt && attempt.lockUntil && Date.now() < attempt.lockUntil) {
      const waitMins = Math.ceil((attempt.lockUntil - Date.now()) / 60000);
      return res.status(429).json({
        error: `Too many unsuccessful attempts. Account locked for safety. Please try again in ${waitMins} minute(s).`
      });
    }

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });

    if (!user || !user.isActive || user.role !== 'ADMIN') {
      // Record failed attempt
      const currentCount = (attempt?.count || 0) + 1;
      let lockUntil: number | undefined;
      if (currentCount >= 5) {
        lockUntil = Date.now() + 15 * 60 * 1000; // 15 mins lock
        console.warn(`[SECURITY ALERT] Admin login locked for ${clientKey} after 5 failed attempts.`);
      }
      adminLoginAttempts.set(clientKey, { count: currentCount, lockUntil });

      return res.status(401).json({ error: 'Invalid admin credentials or insufficient permissions.' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      const currentCount = (attempt?.count || 0) + 1;
      let lockUntil: number | undefined;
      if (currentCount >= 5) {
        lockUntil = Date.now() + 15 * 60 * 1000;
        console.warn(`[SECURITY ALERT] Admin login locked for ${clientKey} after 5 failed attempts.`);
      }
      adminLoginAttempts.set(clientKey, { count: currentCount, lockUntil });

      return res.status(401).json({ error: 'Invalid admin credentials.' });
    }

    // Reset attempt counter on success
    adminLoginAttempts.delete(clientKey);

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '1d' as any }
    );

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error: any) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Admin login failed' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        city: true,
        state: true,
        avatarUrl: true,
        lastLogin: true,
        createdAt: true
      }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// PATCH /api/auth/profile — Update Profile (Name, Phone, City, State, Avatar)
router.patch('/profile', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { name, phone, city, state, avatarUrl } = req.body;

    if (phone && phone.trim()) {
      const existing = await prisma.user.findFirst({
        where: { phone: phone.trim(), id: { not: userId } }
      });
      if (existing) {
        return res.status(409).json({ error: 'This mobile number is already in use by another account.' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name: name.trim() }),
        ...(phone !== undefined && { phone: phone ? phone.trim() : null }),
        ...(city !== undefined && { city: city ? city.trim() : null }),
        ...(state !== undefined && { state: state ? state.trim() : null }),
        ...(avatarUrl !== undefined && { avatarUrl: avatarUrl || null })
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        city: true,
        state: true,
        avatarUrl: true,
        lastLogin: true,
        createdAt: true
      }
    });

    res.json({ user: updatedUser, message: 'Profile updated successfully' });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /api/auth/change-password — Secure Password Change
router.post('/change-password', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'Current password, new password, and confirmation are required.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New password and confirm password do not match.' });
    }

    const pwdErr = validatePassword(newPassword);
    if (pwdErr) {
      return res.status(400).json({ error: pwdErr });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password changed successfully.' });
  } catch (error: any) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

export default router;
