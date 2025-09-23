import React from 'react';

interface ServicePricingTabProps {
  config: any;
  results: any;
  formatNumber: (num: number) => string;
  tierDistribution: { tier1: number; tier2: number; tier3: number; tier4: number };
  serviceModifiers: {
    storage: { extreme: boolean; high: boolean; balanced: boolean; cost: boolean };
    compliance: { hipaa: boolean; fedramp: boolean; secnum: boolean; airgap: boolean };
    sustainability: { renewable: boolean; carbon: boolean; netzero: boolean };
  };
  setTierDistribution: (d: { tier1: number; tier2: number; tier3: number; tier4: number }) => void;
  setServiceModifiers: (m: ServicePricingTabProps['serviceModifiers']) => void;
}

const serviceTiers = [
  { id: 'tier1', name: 'Tier 1: Bare Metal GPU', baseMultiplier: 1.0 },
  { id: 'tier2', name: 'Tier 2: Orchestrated Kubernetes', baseMultiplier: 1.45 },
  { id: 'tier3', name: 'Tier 3: Managed MLOps Platform', baseMultiplier: 2.2 },
  { id: 'tier4', name: 'Tier 4: Inference-as-a-Service', baseMultiplier: 3.0 }
];

export const ServicePricingTab: React.FC<ServicePricingTabProps> = ({
  config,
  results,
  formatNumber,
  tierDistribution,
  serviceModifiers,
  setTierDistribution,
  setServiceModifiers
}) => {
  const baseCostPerHour = (() => {
    if (!results) return 0;
    const annualDep = (results.totalCapex || 0) / (config.depreciation || 3);
    const totalAnnualCost = annualDep + (results.annualOpex || 0);
    const effectiveGpuHours = (config.numGPUs || 0) * 8760 * ((config.utilization || 0) / 100);
    if (effectiveGpuHours <= 0) return 0;
    return totalAnnualCost / effectiveGpuHours;
  })();

  const modifierValue = (mods: typeof serviceModifiers): number => {
    let sum = 0;
    if (mods.storage.extreme) sum += 0.25;
    if (mods.storage.high) sum += 0.15;
    if (mods.storage.balanced) sum += 0.08;
    if (mods.storage.cost) sum += 0.02;
    if (mods.compliance.hipaa) sum += 0.15;
    if (mods.compliance.fedramp) sum += 0.25;
    if (mods.compliance.secnum) sum += 0.30;
    if (mods.compliance.airgap) sum += 0.50;
    if (mods.sustainability.renewable) sum += 0.10;
    if (mods.sustainability.carbon) sum += 0.15;
    if (mods.sustainability.netzero) sum += 0.20;
    return sum;
  };

  const totalModifier = modifierValue(serviceModifiers);

  const tierRows = serviceTiers.map((tier) => {
    const totalMultiplier = tier.baseMultiplier + totalModifier;
    const effectiveRate = baseCostPerHour * totalMultiplier;
    const pct = (tierDistribution as any)[tier.id] || 0;
    const annualRevenue = effectiveRate * (config.numGPUs || 0) * 8760 * ((config.utilization || 0) / 100) * (pct / 100);
    return {
      name: tier.name,
      baseMultiplier: tier.baseMultiplier,
      modifiers: totalModifier,
      totalMultiplier,
      effectiveRate,
      clusterPercentage: pct,
      annualRevenue
    };
  });

  const blendedRate = tierRows.reduce((acc, r) => acc + r.effectiveRate * (r.clusterPercentage / 100), 0);
  const totalRevenue = tierRows.reduce((acc, r) => acc + r.annualRevenue, 0);
  const grossMargin = totalRevenue > 0 ? ((totalRevenue - ((results?.annualOpex || 0) + (results?.totalCapex || 0) / (config.depreciation || 3))) / totalRevenue) * 100 : 0;

  const updateSlider = (id: string, value: number) => {
    const current = tierDistribution;
    const diff = value - (current as any)[id];
    const others = Object.keys(current).filter(k => k !== id);
    const sumOthers = others.reduce((s, k) => s + (current as any)[k], 0);
    const updated: any = { ...current, [id]: value };
    if (sumOthers > 0) {
      others.forEach(k => {
        const proportion = (current as any)[k] / sumOthers;
        updated[k] = Math.max(0, (current as any)[k] - diff * proportion);
      });
    }
    const total = ['tier1','tier2','tier3','tier4'].reduce((s, k) => s + (updated[k] || 0), 0);
    if (total !== 100 && total > 0) {
      ['tier1','tier2','tier3','tier4'].forEach(k => { updated[k] = (updated[k] / total) * 100; });
    }
    ['tier1','tier2','tier3','tier4'].forEach(k => { updated[k] = Math.max(0, Math.min(100, Number(updated[k].toFixed(1)))); });
    setTierDistribution(updated);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-2">Service Tier Pricing Model</h2>
        <p className="text-sm text-gray-600">Base infrastructure-derived GPU-hour cost and service multipliers.</p>
        <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200 inline-block">
          <span className="text-sm text-blue-800 font-medium">Raw GPU Hour Cost (incl. depreciation): </span>
          <span className="text-sm font-bold text-blue-900">${baseCostPerHour.toFixed(2)}/GPU-hour</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold text-gray-800 mb-3">Premium Service Modifiers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Storage Performance</h4>
            {[
              ['extreme','Extreme Performance (+0.25x)'],
              ['high','High Performance (+0.15x)'],
              ['balanced','Balanced (+0.08x)'],
              ['cost','Cost-Optimized (+0.02x)']
            ].map(([key, label]: any) => (
              <label key={key} className="flex items-center gap-2 text-sm mb-1">
                <input type="checkbox" checked={(serviceModifiers.storage as any)[key]} onChange={(e) => setServiceModifiers({ ...serviceModifiers, storage: { ...serviceModifiers.storage, [key]: e.target.checked } })} />
                {label}
              </label>
            ))}
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Compliance Certifications</h4>
            {[
              ['hipaa','HIPAA (+0.15x)'],
              ['fedramp','FedRAMP (+0.25x)'],
              ['secnum','SecNumCloud (+0.30x)'],
              ['airgap','Air-gapped/Classified (+0.50x)']
            ].map(([key, label]: any) => (
              <label key={key} className="flex items-center gap-2 text-sm mb-1">
                <input type="checkbox" checked={(serviceModifiers.compliance as any)[key]} onChange={(e) => setServiceModifiers({ ...serviceModifiers, compliance: { ...serviceModifiers.compliance, [key]: e.target.checked } })} />
                {label}
              </label>
            ))}
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Sustainability</h4>
            {[
              ['renewable','100% Renewable (+0.10x)'],
              ['carbon','Carbon Neutral (+0.15x)'],
              ['netzero','Net-Zero (+0.20x)']
            ].map(([key, label]: any) => (
              <label key={key} className="flex items-center gap-2 text-sm mb-1">
                <input type="checkbox" checked={(serviceModifiers.sustainability as any)[key]} onChange={(e) => setServiceModifiers({ ...serviceModifiers, sustainability: { ...serviceModifiers.sustainability, [key]: e.target.checked } })} />
                {label}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold text-gray-800 mb-3">Effective Pricing by Tier</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-700">
                <th className="p-2 text-left">Service Tier</th>
                <th className="p-2 text-left">Base Multiplier</th>
                <th className="p-2 text-left">Modifiers</th>
                <th className="p-2 text-left">Total Multiplier</th>
                <th className="p-2 text-left">$/GPU-hour</th>
                <th className="p-2 text-left">% of Cluster</th>
                <th className="p-2 text-left">Annual Revenue</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {tierRows.map((tier) => (
                <tr key={tier.name} className="border-t">
                  <td className="p-2">{tier.name}</td>
                  <td className="p-2">{tier.baseMultiplier.toFixed(2)}x</td>
                  <td className="p-2">{tier.modifiers.toFixed(2)}</td>
                  <td className="p-2">{tier.totalMultiplier.toFixed(2)}x</td>
                  <td className="p-2">${tier.effectiveRate.toFixed(2)}</td>
                  <td className="p-2">
                    <input type="range" min={0} max={100} value={tier.clusterPercentage} onChange={(e) => updateSlider(serviceTiers.find(t => t.name === tier.name)!.id, parseFloat(e.target.value))} />
                    <span className="ml-2 font-medium">{tier.clusterPercentage.toFixed(1)}%</span>
                  </td>
                  <td className="p-2">{formatNumber(tier.annualRevenue)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-blue-50 font-semibold border-t">
                <td className="p-2" colSpan={4}>Blended Average Rate</td>
                <td className="p-2">${blendedRate.toFixed(2)}/GPU-hour</td>
                <td className="p-2">Total</td>
                <td className="p-2">{formatNumber(totalRevenue)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold text-gray-800 mb-2">Revenue & ROI Impact</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="p-4 rounded bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <div>Annual Revenue Potential</div>
            <div className="text-2xl font-bold">{formatNumber(totalRevenue)}</div>
          </div>
          <div className="p-4 rounded bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <div>Gross Margin</div>
            <div className="text-2xl font-bold">{grossMargin.toFixed(1)}%</div>
          </div>
          <div className="p-4 rounded bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
            <div>Blended Rate</div>
            <div className="text-2xl font-bold">${blendedRate.toFixed(2)}/GPU-hr</div>
          </div>
          <div className="p-4 rounded bg-gradient-to-br from-rose-500 to-pink-600 text-white">
            <div>Utilization</div>
            <div className="text-2xl font-bold">{(config.utilization || 0).toFixed ? (config.utilization).toFixed(0) : config.utilization}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicePricingTab;


