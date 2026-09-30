import { Router, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { generateToken, hashPassword, comparePassword, requireAuth, AuthRequest } from '../auth';

const router = Router();

const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(11, 'Please enter a valid phone number (e.g. 01812345678)'),
});

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

router.post('/register', async (req, res: Response) => {
  try {
    const parse = RegisterSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        message: parse.error.issues[0]?.message || 'Validation error',
      });
    }

    const { name, email, password, phone } = parse.data;

    const existing = await db.getUserByEmail(email);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const passwordHash = await hashPassword(password);
    const newUser = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name,
      email: email.toLowerCase(),
      phone,
      passwordHash,
      role: 'CUSTOMER' as const,
      addresses: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
    };

    await db.createUser(newUser);
    const { passwordHash: _, ...safeUser } = newUser;
    const token = generateToken(safeUser);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to Saturn Tech BD.',
      data: {
        user: safeUser,
        token,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Server error during registration' });
  }
});

router.post('/login', async (req, res: Response) => {
  try {
    const parse = LoginSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        success: false,
        message: parse.error.issues[0]?.message || 'Invalid input',
      });
    }

    const { email, password } = parse.data;
    const user = await db.getUserByEmail(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact customer support.',
      });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const { passwordHash: _, ...safeUser } = user;
    const token = generateToken(safeUser);

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        user: safeUser,
        token,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }
  res.json({
    success: true,
    data: req.user,
  });
});

router.put('/profile', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });

    const { name, phone, addresses } = req.body;
    const updated = await db.updateUser(req.user.id, {
      ...(name ? { name } : {}),
      ...(phone ? { phone } : {}),
      ...(addresses ? { addresses } : {}),
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { passwordHash: _, ...safeUser } = updated;
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: safeUser,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
});

router.post('/forgot-password', async (req, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address is required' });
  }

  const user = await db.getUserByEmail(email);
  if (!user) {
    // Return positive message for security
    return res.json({
      success: true,
      message: 'If that email exists in our records, a password reset link has been dispatched.',
    });
  }

  // Simulated reset token dispatched
  res.json({
    success: true,
    message: 'Password reset link sent to your registered email address.',
    data: { simulatedResetCode: 'STB-RESET-7788' },
  });
});

router.post('/reset-password', async (req, res: Response) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword || newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Valid email and new password (min 6 chars) required.',
    });
  }

  const user = await db.getUserByEmail(email);
  if (!user) {
    return res.status(404).json({ success: false, message: 'Account not found' });
  }

  const passwordHash = await hashPassword(newPassword);
  await db.updateUser(user.id, { passwordHash });

  res.json({
    success: true,
    message: 'Password has been successfully updated. You may now log in.',
  });
});

export default router;
