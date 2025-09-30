export function formatNumber(num: number): string {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(0)}K`;
  return `$${num.toFixed(0)}`;
}

export function formatPower(watts: number): string {
  if (watts >= 1e9) return `${(watts / 1e9).toFixed(2)} GW`;
  if (watts >= 1e6) return `${(watts / 1e6).toFixed(1)} MW`;
  if (watts >= 1e3) return `${(watts / 1e3).toFixed(0)} kW`;
  return `${watts.toFixed(0)} W`;
}

export function formatStorage(bytes: number): string {
  if (bytes >= 1e15) return `${(bytes / 1e15).toFixed(2)} PB`;
  if (bytes >= 1e12) return `${(bytes / 1e12).toFixed(1)} TB`;
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(0)} GB`;
  return `${bytes.toFixed(0)} B`;
}

export function formatBandwidth(gbps: number): string {
  if (gbps >= 1000) return `${(gbps / 1000).toFixed(1)} Tbps`;
  return `${gbps.toFixed(0)} Gbps`;
}
