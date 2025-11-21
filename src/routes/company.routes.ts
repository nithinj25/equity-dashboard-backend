import { Router } from 'express';
import multer from 'multer';
import { asyncWrapper } from '../middlewares/async.wrapper';
import { CompanyController } from '../controllers/company.controller';

const upload = multer();
const router = Router();

router.post('/', asyncWrapper(CompanyController.createCompany as any));
router.get('/:companyId', asyncWrapper(CompanyController.getCompany as any));
router.post(
  '/:companyId/import-csv',
  upload.single('file'),
  asyncWrapper(CompanyController.importCSV as any)
);
router.post(
  '/:companyId/simulate',
  asyncWrapper(CompanyController.simulate as any)
);

export default router;
