import { Buffer } from 'buffer';
import { parse } from 'csv-parse/sync';
import { ShareClassModel } from '../models/shareclass.model';
import { ShareholderModel } from '../models/shareholder.model';
import { InstrumentModel } from '../models/instrument.model';

interface Row {
  shareholder: string;
  share_class: string;
  shares: string;
  price_per_share?: string;
  grant_date?: string;
  class_type?: string;
  email?: string;
}

export const CsvImporterService = {
  parseAndCreate: async (buffer: Buffer, companyId: string) => {
    const text = buffer.toString();
    const rows: Row[] = parse(text, { columns: true, skip_empty_lines: true });

    const results: any[] = [];

    for (const r of rows) {
      let sc = await ShareClassModel.findOne({ company: companyId, name: r.share_class }).exec();
      if (!sc)
        sc = await ShareClassModel.create({
          company: companyId,
          name: r.share_class,
          classType: (r.class_type as any) || 'COMMON'
        });

      let sh = await ShareholderModel.findOne({ company: companyId, name: r.shareholder }).exec();
      if (!sh)
        sh = await ShareholderModel.create({
          company: companyId,
          name: r.shareholder,
          email: r.email
        });

      const inst = await InstrumentModel.create({
        company: companyId,
        shareholder: sh._id,
        shareClass: sc._id,
        shares: Number(r.shares || 0),
        pricePerShare: r.price_per_share ? Number(r.price_per_share) : undefined,
        grantDate: r.grant_date ? new Date(r.grant_date) : undefined
      });

      results.push(inst);
    }

    return results;
  }
};
