import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';
import { bootstrapFirstAdmin } from '../utils/adminBootstrap';

export const runAdminBootstrap = async (): Promise<void> => {
  try {
    await connectDatabase();
    await bootstrapFirstAdmin();
    console.log('First administrator account created successfully');
  } finally {
    await mongoose.connection.close();
  }
};
