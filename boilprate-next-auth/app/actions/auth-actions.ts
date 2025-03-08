// actions/auth-actions.ts
'use server';

import { hash, compare } from 'bcryptjs';
import { sign } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sendEmail } from '@/utils/sendEmail';
import { verify } from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

export async function handleRegister(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  // Cek apakah email sudah terdaftar
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return { error: 'Email already registered' }; // Kembalikan pesan error
  }

  // Hash password sebelum disimpan ke database
  const hashedPassword = await hash(password, 12);

  // Buat pengguna baru
  await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  redirect('/login');
}

export async function handleLogin(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await compare(password, user.password))) {
    return { error: 'Invalid credentials' };
  }

  const token = sign({ userId: user.id }, 'your-secret-key', { expiresIn: '7d' });

  // Atur cookie tanpa `expires` atau `max-age`
  const cookieStore = await cookies(); // Tunggu hasil dari cookies()
  
  cookieStore.set('token', token, {
    httpOnly: true, // Cookie hanya bisa diakses oleh server
    secure: process.env.NODE_ENV === 'production', // Hanya kirim cookie melalui HTTPS di production
    sameSite: 'strict', // Cookie hanya dikirim ke situs yang sama,
    maxAge: 60 * 60 * 24 * 7, // 7 hari
  });

  redirect('/dashboard');
}

export async function handleLogout() {
  // Delete cookie
  const cookieStore = await cookies();
  cookieStore.delete('token');
  redirect('/login');
}

// actions/auth-actions.ts
// actions/auth-actions.ts 
export async function handleResetPassword(token: string | null, password: string) {
  if (!token) {
    return { message: 'Invalid or expired token.' };
  }

  try {
    // Verifikasi token reset password
    const payload = verify(token, "your-secret-key") as { userId: number };
    const userId = payload.userId;

    // Cek apakah token sudah digunakan
    await prisma.user.findUnique({
      where: { id: userId },
    });

    // Hash password baru
    const hashedPassword = await hash(password, 12);

    // Update password, tandai token sebagai sudah digunakan, dan hapus resetToken
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        resetTokenUsed: true, // Tandai token sebagai sudah digunakan
        resetToken: null, // Hapus token
      },
    });

    return { message: 'Password reset successful.' };
  } catch (error) {
    console.error(error);
    return { message: 'Invalid or expired token.' };
  }
}

export async function handleForgotPassword(email: string) {
  // Cek apakah email terdaftar
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { message: 'If the email is registered, you will receive a reset link.' };
  }

  // Buat token reset password
  const resetToken = sign({ userId: user.id }, 'your-secret-key', { expiresIn: '1h' });

  // Simpan token reset password di database
  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken },
  });

  // Kirim email reset password
  const resetLink = `${process.env.RESET_PASSWORD_URL}${resetToken}`;
  await sendEmail(
    email,
    'Reset Your Password',
    `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
  );

  return { message: 'If the email is registered, you will receive a reset link.' };
}

export async function validateResetToken(token: string) {
  try {
    const payload = verify(token, "your-secret-key") as { userId: number };
    const userId = payload.userId;

    // Cek apakah token sudah digunakan
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.resetTokenUsed || user.resetToken !== token) {
      return { valid: false, message: 'Invalid or expired token.' };
    }

    return { valid: true, userId: user.id };
  } catch (error) {
    console.error(error);
    return { valid: false, message: 'Invalid or expired token.' };
  }
}