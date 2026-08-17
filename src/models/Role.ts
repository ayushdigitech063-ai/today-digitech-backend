import mongoose, { Schema, Document } from 'mongoose';
import { AdminRoleName, Permission } from '@today-digitech/shared';

export interface IRole extends Document {
  name: AdminRoleName;
  description: string;
  permissions: Permission[];
  isSystemRole: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roleSchema = new Schema<IRole>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    permissions: [
      {
        type: String,
        required: true,
      },
    ],
    isSystemRole: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Role = mongoose.model<IRole>('Role', roleSchema);
