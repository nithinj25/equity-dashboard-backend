import mongoose from 'mongoose';
import { logger } from '../utils/logger';

// Caching strategy for serverless (Vercel) to prevent opening
// a new MongoDB connection on every invocation.
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache: MongooseCache | undefined;
}

const globalCache: MongooseCache = global.__mongooseCache || { conn: null, promise: null };
global.__mongooseCache = globalCache;

export const connectDatabase = async (): Promise<typeof mongoose> => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) throw new Error('MONGO_URI is not defined in environment variables');

  if (globalCache.conn) {
    return globalCache.conn;
  }

  if (!globalCache.promise) {
    globalCache.promise = mongoose.connect(mongoUri).then((m) => {
      logger.info('MongoDB connected');

      m.connection.on('error', (error) => {
        logger.error({ err: error }, 'MongoDB connection error');
      });
      m.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
      });
      m.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
      });
      return m;
    }).catch((err) => {
      logger.error({ err }, 'Initial MongoDB connection failed');
      throw err;
    });
  }

  globalCache.conn = await globalCache.promise;
  return globalCache.conn;
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    if (globalCache.conn) {
      await globalCache.conn.connection.close();
      globalCache.conn = null;
      globalCache.promise = null;
      logger.info('MongoDB disconnected successfully');
    }
  } catch (error) {
    logger.error({ err: error }, 'Error disconnecting from MongoDB');
  }
};
