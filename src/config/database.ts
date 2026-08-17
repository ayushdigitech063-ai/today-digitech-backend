import mongoose from 'mongoose';
import { env } from './env';

export const connectDatabase = async (): Promise<typeof mongoose> => {
  try {
    mongoose.set('strictQuery', true);

    const connection = await mongoose.connect(env.MONGODB_URI, {
      autoIndex: !env.isProduction,
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB connected to database: ${connection.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB connection disconnected');
    });

    return connection;
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

export const getDatabaseState = () => {
  const states: Record<number, string> = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
  };
  const stateCode = mongoose.connection.readyState;
  return {
    state: states[stateCode] || 'Unknown',
    readyState: stateCode,
    dbName: mongoose.connection.name || 'Not Connected',
    host: mongoose.connection.host || 'N/A',
  };
};
