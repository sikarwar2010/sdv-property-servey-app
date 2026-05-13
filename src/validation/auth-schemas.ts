/**
 * Auth & forgot-password validation schemas.
 */
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72, 'Password is too long'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotIdentifierSchema = z.discriminatedUnion('channel', [
  z.object({
    channel: z.literal('sms'),
    mobileNo: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile'),
  }),
  z.object({
    channel: z.literal('email'),
    email: z.string().email('Enter a valid email'),
  }),
]);

export const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code'),
});

export const newPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Use at least 8 characters')
      .regex(/[A-Za-z]/, 'Include at least one letter')
      .regex(/\d/, 'Include at least one number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type NewPasswordInput = z.infer<typeof newPasswordSchema>;
