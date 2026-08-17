import mongoose from 'mongoose';
import app from './app';
import { env } from './config/env';
import { connectDatabase } from './config/database';

const PORT = env.PORT;

const startServer = async () => {
  // Connect to MongoDB
  await connectDatabase();

  const server = app.listen(PORT, () => {
    console.log(`🚀 [Backend Server]: Running on http://localhost:${PORT} in ${env.NODE_ENV} mode`);
  });

  const gracefulShutdown = (signal: string) => {
    console.log(`\n⚠️  [${signal}] Received. Starting graceful shutdown...`);
    server.close(async () => {
      console.log('🔒 HTTP server closed.');
      try {
        await mongoose.connection.close();
        console.log('🔒 MongoDB connection terminated.');
        process.exit(0);
      } catch (err) {
        console.error('❌ Error during MongoDB disconnection:', err);
        process.exit(1);
      }
    });

    // Force exit after 10s if shutdown hangs
    setTimeout(() => {
      console.error('⏰ Forceful shutdown triggered after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  process.on('unhandledRejection', (reason: Error) => {
    console.error('❌ Unhandled Promise Rejection:', reason);
  });

  process.on('uncaughtException', (error: Error) => {
    console.error('❌ Uncaught Exception:', error);
    process.exit(1);
  });
};

startServer();
