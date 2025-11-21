import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { json, urlencoded } from 'express';
import 'express-async-errors';
import routes from './routes';
import { errorHandler } from './middlewares/error.handler';

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

app.get('/', (_req, res) => res.send({ ok: true }));

app.use('/api/v1', routes);

app.use(errorHandler);

export default app;
