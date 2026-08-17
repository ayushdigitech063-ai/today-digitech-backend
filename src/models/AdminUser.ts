import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { AdminRoleName, Permission } from '@today-digitech/shared';

export interface ISession {
  sessionId: string;
  refreshToken: string;
  previousRefreshToken?: string;
  tokenRotatedAt?: Date;
  userAgent?: string;
  ipAddress?: string;
  lastActiveAt: Date;
}

export interface IAdminUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: AdminRoleName;
  customPermissions: Permission[];
  isActive: boolean;
  isSuperAdmin: boolean;
  failedLoginAttempts: number;
  lockUntil?: Date;
  sessions: ISession[];
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  incrementFailedLogin(): Promise<void>;
  resetFailedLogin(): Promise<void>;
  createPasswordResetToken(): string;
  getEffectivePermissions(): Promise<Permission[]>;
}

const adminUserSchema = new Schema<IAdminUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      required: true,
      default: 'Viewer',
    },
    customPermissions: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    sessions: [
      {
        sessionId: { type: String, required: true },
        refreshToken: { type: String, required: true },
        previousRefreshToken: String,
        tokenRotatedAt: Date,
        userAgent: String,
        ipAddress: String,
        lastActiveAt: { type: Date, default: Date.now },
      },
    ],
    passwordResetToken: String,
    passwordResetExpires: Date,
    lastLoginAt: Date,
  },
  { timestamps: true },
);

// Password comparison method
adminUserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Increment failed login attempts & lock for 15 minutes if >= 5
adminUserSchema.methods.incrementFailedLogin = async function (): Promise<void> {
  const MAX_FAILED_ATTEMPTS = 5;
  const LOCK_TIME_MS = 15 * 60 * 1000; // 15 mins

  this.failedLoginAttempts += 1;
  if (this.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
    this.lockUntil = new Date(Date.now() + LOCK_TIME_MS);
  }
  await this.save();
};

// Reset failed login attempts
adminUserSchema.methods.resetFailedLogin = async function (): Promise<void> {
  this.failedLoginAttempts = 0;
  this.lockUntil = undefined;
  this.lastLoginAt = new Date();
  await this.save();
};

// Create password reset token
adminUserSchema.methods.createPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  return resetToken;
};

export const AdminUser = mongoose.model<IAdminUser>('AdminUser', adminUserSchema);
