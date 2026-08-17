import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { AdminUser } from '../models/AdminUser';

const bootstrapSchema = z.object({
  name: z.string().trim().min(2, 'BOOTSTRAP_ADMIN_NAME must be at least 2 characters'),
  email: z.string().trim().email('BOOTSTRAP_ADMIN_EMAIL must be a valid email address'),
  password: z
    .string()
    .min(14, 'BOOTSTRAP_ADMIN_PASSWORD must be at least 14 characters')
    .regex(/[a-z]/, 'BOOTSTRAP_ADMIN_PASSWORD must contain a lowercase letter')
    .regex(/[A-Z]/, 'BOOTSTRAP_ADMIN_PASSWORD must contain an uppercase letter')
    .regex(/\d/, 'BOOTSTRAP_ADMIN_PASSWORD must contain a number')
    .regex(/[^A-Za-z0-9]/, 'BOOTSTRAP_ADMIN_PASSWORD must contain a symbol'),
});

const getBootstrapInput = () => {
  const parsed = bootstrapSchema.safeParse({
    name: process.env.BOOTSTRAP_ADMIN_NAME,
    email: process.env.BOOTSTRAP_ADMIN_EMAIL,
    password: process.env.BOOTSTRAP_ADMIN_PASSWORD,
  });

  if (!parsed.success) {
    throw new Error(
      `Invalid bootstrap administrator configuration: ${parsed.error.errors
        .map((error) => error.message)
        .join(', ')}`,
    );
  }

  return parsed.data;
};

export const bootstrapFirstAdmin = async (): Promise<void> => {
  const existingAdmin = await AdminUser.exists({});
  if (existingAdmin) {
    throw new Error('Bootstrap aborted: an administrator account already exists');
  }

  const input = getBootstrapInput();
  const passwordHash = await bcrypt.hash(input.password, 12);

  await AdminUser.create({
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash,
    role: 'Super Admin',
    isActive: true,
    isSuperAdmin: true,
    customPermissions: [],
  });
};
