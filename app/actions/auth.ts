'use server';

import { hash, compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSession, deleteSession } from '@/lib/auth';

export async function registerAction(name: string, email: string, password: string) {
  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: 'Email already in use' };
    }

    // Hash password
    const password_hash = await hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password_hash,
      },
    });

    // Create streak record
    await prisma.streakRecord.create({
      data: {
        user_id: user.id,
      },
    });

    // Create session
    await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return { success: true };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Registration failed' };
  }
}

export async function loginAction(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const isPasswordValid = await compare(password, user.password_hash);

    if (!isPasswordValid) {
      return { success: false, error: 'Invalid password' };
    }

    await createSession({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    return { success: true };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed' };
  }
}

export async function logoutAction() {
  try {
    await deleteSession();
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'Logout failed' };
  }
}
