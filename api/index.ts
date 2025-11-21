import { Request, Response } from 'express';
import app from '../src/app';
import { connectDatabase } from '../src/config/database';

// Vercel serverless handler with database connection.
// Ensures MongoDB is connected before processing any request.
export default async (req: Request, res: Response) => {
  try {
    await connectDatabase();
  } catch (error) {
    console.error('Database connection failed:', error);
    return res.status(500).json({ 
      error: 'Database connection failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  return app(req, res);
};
