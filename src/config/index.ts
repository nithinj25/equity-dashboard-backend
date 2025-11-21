import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT ? Number(process.env.PORT) : 4000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/equitydb',
  jwtSecret: process.env.JWT_SECRET || 'dev_secret',
  env: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info'
};
