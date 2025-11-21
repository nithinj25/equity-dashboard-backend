import mongoose from 'mongoose';
import app from './app';
import { config } from './config';
import { logger } from './utils/logger';

async function start() {
  try {
    await mongoose.connect(config.mongoUri);
    logger.info('Connected to MongoDB');

    app.listen(config.port, () => {
      logger.info(`Server listening on port ${config.port}`);
    });
  } catch (err) {
    logger.error({ err }, 'Failed to start server');
    process.exit(1);
  }
}

start();
