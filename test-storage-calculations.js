// Test script to validate enhanced storage calculations at different scales
const { calculateEnhancedStorage } = require('./sesterce-dashboard/src/utils/storageCalculationsEnhanced.ts');

// Test configurations for different scales
const testConfigs = [
  {
    name: "Small Scale (1,024 GPUs)",
    config: {
      gpuCount: 1024,
      gpuModel: 'h100',
      workloadMix: { training: 70, inference: 20, finetuning: 10 },
      tenantMix: { whale: 40, medium: 40, small: 20 },
      budget: 'cost-conscious',
      storageVendor: 'auto',
      tierDistribution: 'balanced'
    }
  },
  {
    name: "Medium Scale (10,000 GPUs)",
    config: {
      gpuCount: 10000,
      gpuModel: 'gb200',
      workloadMix: { training: 80, inference: 15, finetuning: 5 },
      tenantMix: { whale: 60, medium: 30, small: 10 },
      budget: 'optimized',
      storageVendor: 'auto',
      tierDistribution: 'trainingHeavy'
    }
  },
  {
    name: "Large Scale (100,000 GPUs)",
    config: {
      gpuCount: 100000,
      gpuModel: 'gb200',
      workloadMix: { training: 90, inference: 8, finetuning: 2 },
      tenantMix: { whale: 80, medium: 15, small: 5 },
      budget: 'unlimited',
      storageVendor: 'auto',
      tierDistribution: 'trainingHeavy'
    }
  }
];

console.log("🧪 Testing Enhanced Storage Calculations at Different Scales\n");

testConfigs.forEach(test => {
  console.log(`\n📊 ${test.name}`);
  console.log("=" .repeat(50));
  
  try {
    const results = calculateEnhancedStorage(test.config);
    
    console.log(`Total Capacity: ${results.totalCapacity.totalPB.toFixed(1)} PB`);
    console.log(`Sustained Bandwidth: ${results.bandwidth.sustainedTBps.toFixed(1)} TB/s`);
    console.log(`Primary Vendor: ${results.vendors.primary.toUpperCase()}`);
    console.log(`Checkpoint Frequency: ${results.checkpoints.frequency.toFixed(1)} minutes`);
    console.log(`Total CAPEX: $${(results.costs.capex.total / 1000000).toFixed(1)}M`);
    console.log(`Annual OPEX: $${(results.costs.opex.annual / 1000000).toFixed(1)}M`);
    console.log(`5-Year TCO: $${(results.costs.tco5Year / 1000000).toFixed(1)}M`);
    console.log(`Cost per GPU: $${results.costs.costPerGPU.toFixed(0)}`);
    console.log(`Power Consumption: ${results.powerConsumption.totalKW.toFixed(0)} kW`);
    console.log(`Warnings: ${results.warnings.length} scale threshold warnings`);
    
    // Validate key metrics
    const expectedBandwidth = test.config.gpuCount * 2.7 * 1.074 / 1000; // Rough estimate
    const bandwidthDiff = Math.abs(results.bandwidth.sustainedTBps - expectedBandwidth) / expectedBandwidth;
    
    if (bandwidthDiff > 0.2) {
      console.log(`⚠️  WARNING: Bandwidth calculation may be off by ${(bandwidthDiff * 100).toFixed(1)}%`);
    } else {
      console.log(`✅ Bandwidth calculation validated`);
    }
    
    // Check vendor selection logic
    if (test.config.gpuCount >= 100000 && !['vastdata', 'weka', 'ddn'].includes(results.vendors.primary)) {
      console.log(`⚠️  WARNING: Unexpected vendor for mega-scale: ${results.vendors.primary}`);
    } else if (test.config.gpuCount < 5000 && ['vastdata', 'ddn'].includes(results.vendors.primary)) {
      console.log(`⚠️  WARNING: Over-engineered vendor for small scale: ${results.vendors.primary}`);
    } else {
      console.log(`✅ Vendor selection validated`);
    }
    
  } catch (error) {
    console.log(`❌ ERROR: ${error.message}`);
  }
});

console.log("\n🎯 Scale Testing Summary:");
console.log("- Small scale should use enterprise vendors (Dell, NetApp)");
console.log("- Medium scale should use production vendors (WEKA, Pure)");
console.log("- Large scale should use mega-scale vendors (VAST, DDN)");
console.log("- Checkpoint frequency should decrease with scale");
console.log("- Power consumption should scale linearly with capacity");
