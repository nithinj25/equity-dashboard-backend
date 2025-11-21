import { CompanyRepository } from '../repositories/company.repository';
import { CreateCompanyDTO } from '../dtos/company.dto';
import { CompanyDoc } from '../models/company.model';
import { NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';

// Service layer adapted to repository exported as a plain object.
export class CompanyService {
  async createCompany(companyData: CreateCompanyDTO): Promise<CompanyDoc> {
    try {
      logger.info({ name: companyData.name }, 'Creating new company');
      return await CompanyRepository.create(companyData as Partial<CompanyDoc>);
    } catch (error) {
      logger.error({ err: error }, 'Error creating company');
      throw error;
    }
  }

  async getCompanyById(id: string): Promise<CompanyDoc> {
    try {
      logger.info({ id }, 'Fetching company by id');
      const company = await CompanyRepository.findById(id);
      if (!company) {
        throw new NotFoundError('Company not found');
      }
      return company;
    } catch (error) {
      logger.error({ err: error }, 'Error fetching company');
      throw error;
    }
  }
}
