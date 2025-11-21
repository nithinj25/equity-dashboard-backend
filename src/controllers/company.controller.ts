import { Request, Response } from 'express';
import { CompanyRepository } from '../repositories/company.repository';
import { CsvImporterService } from '../services/csvImporter.service';
import { SimulationService } from '../services/simulation.service';
import { InstrumentModel } from '../models/instrument.model';
import { ShareClassModel } from '../models/shareclass.model';
import { ShareholderModel } from '../models/shareholder.model';

export const CompanyController = {
  createCompany: async (req: Request, res: Response) => {
    const payload = { name: req.body.name, currency: req.body.currency };
    const c = await CompanyRepository.create(payload as any);
    res.json(c);
  },

  getCompany: async (req: Request, res: Response) => {
    const id = req.params.companyId;

    const company = await CompanyRepository.findById(id);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    const shareClasses = await ShareClassModel.find({ company: id }).exec();
    const shareholders = await ShareholderModel.find({ company: id }).exec();
    const instruments = await InstrumentModel.find({ company: id })
      .populate('shareholder shareClass')
      .exec();

    res.json({ company, shareClasses, shareholders, instruments });
  },

  importCSV: async (req: Request, res: Response) => {
    const companyId = req.params.companyId;

    if (!req.file) return res.status(400).json({ message: 'CSV file required' });

    const results = await CsvImporterService.parseAndCreate(
      req.file.buffer,
      companyId
    );

    res.json({ success: true, results });
  },

  simulate: async (req: Request, res: Response) => {
    const companyId = req.params.companyId;
    const scenario = req.body;

    const result = await SimulationService.runSimulation(companyId, scenario);

    res.json(result);
  }
};
