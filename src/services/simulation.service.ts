import { InstrumentModel } from '../models/instrument.model';
import { ShareClassModel } from '../models/shareclass.model';
import { D } from '../utils/decimal.util';

type Holding = { shareholder: string; shares: any };

export const SimulationService = {
  runSimulation: async (companyId: string, scenario: any) => {
    const instruments = await InstrumentModel.find({ company: companyId })
      .populate('shareholder shareClass')
      .exec();

    const cap: Record<string, { totalShares: any; holdings: Holding[] }> = {};

    instruments.forEach((inst: any) => {
      const clsName = inst.shareClass?.name || 'UNKNOWN';

      if (!cap[clsName]) cap[clsName] = { totalShares: D(0), holdings: [] };

      cap[clsName].holdings.push({
        shareholder: inst.shareholder.name,
        shares: D(inst.shares)
      });

      cap[clsName].totalShares = cap[clsName].totalShares.plus(D(inst.shares));
    });

    let totalExistingShares = D(0);
    Object.values(cap).forEach((c) => {
      totalExistingShares = totalExistingShares.plus(c.totalShares);
    });

    if (scenario.type === 'round') {
      const A = D(scenario.data.amountRaised);
      const pre = D(scenario.data.preMoney);

      const pricePerShare =
        totalExistingShares.equals(0) ? D(0) : pre.div(totalExistingShares);

      const newShares =
        pricePerShare.equals(0) ? D(0) : A.div(pricePerShare);

      const investorClass = scenario.data.shareClassName || 'Investor Preferred';

      if (!cap[investorClass])
        cap[investorClass] = { totalShares: D(0), holdings: [] };

      cap[investorClass].holdings.push({
        shareholder: scenario.data.investorName || 'New Investor',
        shares: newShares
      });

      cap[investorClass].totalShares =
        cap[investorClass].totalShares.plus(newShares);

      let proformaTotal = D(0);
      Object.values(cap).forEach((c) => {
        proformaTotal = proformaTotal.plus(c.totalShares);
      });

      const shareholderMap: Record<string, any> = {};
      Object.values(cap).forEach((c) => {
        c.holdings.forEach((h) => {
          if (!shareholderMap[h.shareholder]) shareholderMap[h.shareholder] = D(0);
          shareholderMap[h.shareholder] = shareholderMap[h.shareholder].plus(h.shares);
        });
      });

      const resultHoldings = Object.entries(shareholderMap).map(
        ([name, shares]) => ({
          shareholder: name,
          shares: shares.toFixed(),
          percent: shares.div(proformaTotal).times(100).toFixed(4)
        })
      );

      return {
        type: 'round',
        pricePerShare: pricePerShare.toFixed(),
        newShares: newShares.toFixed(),
        proformaTotal: proformaTotal.toFixed(),
        holdings: resultHoldings
      };
    }

    if (scenario.type === 'exit') {
      const exitValue = D(scenario.data.exitValue);

      const shareholderMap: Record<string, any> = {};

      Object.values(cap).forEach((c) => {
        c.holdings.forEach((h) => {
          if (!shareholderMap[h.shareholder]) shareholderMap[h.shareholder] = D(0);
          shareholderMap[h.shareholder] = shareholderMap[h.shareholder].plus(h.shares);
        });
      });

      let totalShares = D(0);
      Object.values(shareholderMap).forEach((s) => {
        totalShares = totalShares.plus(s);
      });

      const distributions = Object.entries(shareholderMap).map(
        ([name, shares]) => ({
          shareholder: name,
          shares: shares.toFixed(),
          payout: exitValue.times(shares.div(totalShares)).toFixed(2)
        })
      );

      return {
        type: 'exit',
        exitValue: exitValue.toFixed(),
        distributions
      };
    }

    throw new Error('Unknown scenario type');
  }
};
