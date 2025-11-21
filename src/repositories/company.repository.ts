import { CompanyModel, CompanyDoc } from "../models/company.model";

export const CompanyRepository = {
    create: async (payload: Partial<CompanyDoc>) => {
        const c = new CompanyModel(payload);
        return c.save();
    },
    findById: async(id: string) => CompanyModel.findById(id).exec()
};
