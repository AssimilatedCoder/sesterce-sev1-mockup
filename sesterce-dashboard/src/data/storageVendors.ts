interface StorageVendor {
  name: string;
  pricePerGB: number;
  powerPerTB: number;
  throughputPerPB: number;
  tier: string;
}

export const storageVendors: Record<string, StorageVendor> = {
  // Hot tier vendors
  'vast': { name: 'VAST Data', pricePerGB: 0.03, powerPerTB: 2, throughputPerPB: 100, tier: 'hot' },
  'weka': { name: 'WekaFS', pricePerGB: 0.045, powerPerTB: 1.5, throughputPerPB: 100, tier: 'hot' },
  'ddn': { name: 'DDN AI400X2', pricePerGB: 0.04, powerPerTB: 3, throughputPerPB: 70, tier: 'hot' },
  'pure': { name: 'Pure FlashBlade//E', pricePerGB: 0.05, powerPerTB: 1.3, throughputPerPB: 50, tier: 'hot' },
  
  // Warm tier vendors
  'pure-e': { name: 'Pure FlashBlade//E', pricePerGB: 0.02, powerPerTB: 0.9, throughputPerPB: 15, tier: 'warm' },
  'netapp': { name: 'NetApp AFF A-Series', pricePerGB: 0.035, powerPerTB: 2.5, throughputPerPB: 30, tier: 'warm' },
  'qumulo': { name: 'Qumulo', pricePerGB: 0.025, powerPerTB: 2, throughputPerPB: 25, tier: 'warm' },
  'isilon': { name: 'Dell PowerScale', pricePerGB: 0.03, powerPerTB: 2.2, throughputPerPB: 20, tier: 'warm' },
  
  // Cold tier vendors  
  'ceph': { name: 'Ceph HDD', pricePerGB: 0.005, powerPerTB: 8, throughputPerPB: 3, tier: 'cold' },
  'minio': { name: 'MinIO', pricePerGB: 0.006, powerPerTB: 7, throughputPerPB: 4, tier: 'cold' },
  'cloudian': { name: 'Cloudian HyperStore', pricePerGB: 0.008, powerPerTB: 6, throughputPerPB: 5, tier: 'cold' },
  'scality': { name: 'Scality RING', pricePerGB: 0.007, powerPerTB: 6.5, throughputPerPB: 4.5, tier: 'cold' },
  
  // Archive tier vendors
  'glacier': { name: 'AWS Glacier', pricePerGB: 0.001, powerPerTB: 0, throughputPerPB: 0.1, tier: 'archive' },
  'azure-archive': { name: 'Azure Archive', pricePerGB: 0.00099, powerPerTB: 0, throughputPerPB: 0.1, tier: 'archive' },
  'gcp-archive': { name: 'GCP Archive', pricePerGB: 0.0012, powerPerTB: 0, throughputPerPB: 0.1, tier: 'archive' },
  'tape': { name: 'LTO Tape Library', pricePerGB: 0.002, powerPerTB: 1, throughputPerPB: 0.5, tier: 'archive' }
};
