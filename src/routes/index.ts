import { Router } from 'express';
import companyRoutes from './company.routes';

const router = Router();

router.use('/companies', companyRoutes);

export default router;
