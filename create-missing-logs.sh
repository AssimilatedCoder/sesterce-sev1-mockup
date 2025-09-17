#!/bin/bash
# Script to create missing log files for Ubuntu

echo "Creating missing log files for Ubuntu..."

# Create nccl_logs.log
cat > superpod_sev1_fake_telemetry/nccl_logs.log << 'EOF'
2025-09-17T09:38:00+00:00Z job-101 NCCL WARN NET/IB : connection stalled, latency spike
2025-09-17T08:27:00+00:00Z job-104 NCCL WARN NET/IB : connection stalled, latency spike
2025-09-17T09:03:00+00:00Z job-104 NCCL WARN NET/IB : connection stalled, latency spike
2025-09-17T08:42:00+00:00Z job-105 NCCL WARN NET/IB : connection stalled, latency spike
2025-09-17T09:25:00+00:00Z job-107 NCCL ERROR NET/IB : connection stalled, latency spike
2025-09-17T09:22:00+00:00Z job-108 NCCL WARN NET/IB : connection stalled, latency spike
2025-09-17T09:23:00+00:00Z job-108 NCCL WARN NET/IB : connection stalled, latency spike
2025-09-17T09:19:00+00:00Z job-109 NCCL WARN NET/IB : connection stalled, latency spike
2025-09-17T08:46:00+00:00Z job-110 NCCL WARN NET/IB : connection stalled, latency spike
2025-09-17T08:40:00+00:00Z whale-1 NCCL ERROR NET/IB : connection stalled, latency spike
2025-09-17T09:40:00+00:00Z whale-2 NCCL WARN NET/IB : connection stalled, latency spike
2025-09-17T09:15:00+00:00Z whale-3 NCCL WARN NET/IB : connection stalled, latency spike
2025-09-17T08:55:00+00:00Z omega-whale NCCL ERROR NET/IB : connection stalled, latency spike
2025-09-17T09:12:00+00:00Z alpha-large NCCL WARN NET/IB : connection stalled, latency spike
2025-09-17T08:33:00+00:00Z beta-train NCCL WARN NET/IB : connection stalled, latency spike
2025-09-17T09:07:00+00:00Z gamma-infer NCCL WARN NET/IB : connection stalled, latency spike
2025-09-17T08:51:00+00:00Z delta-batch NCCL ERROR NET/IB : connection stalled, latency spike
2025-09-17T09:28:00+00:00Z epsilon-job NCCL WARN NET/IB : connection stalled, latency spike
2025-09-17T08:37:00+00:00Z zeta-model NCCL WARN NET/IB : connection stalled, latency spike
2025-09-17T09:17:00+00:00Z eta-train NCCL WARN NET/IB : connection stalled, latency spike
2025-09-17T08:44:00+00:00Z theta-gpu NCCL ERROR NET/IB : connection stalled, latency spike
2025-09-17T09:31:00+00:00Z iota-work NCCL WARN NET/IB : connection stalled, latency spike
EOF

# Create change_timeline.log
cat > superpod_sev1_fake_telemetry/change_timeline.log << 'EOF'
2025-09-16T16:26:00+00:00Z CHANGE Fabric A: Spine replacement maintenance window started
2025-09-16T18:45:00+00:00Z CHANGE Fabric A: 2 spine switches replaced successfully
2025-09-16T19:12:00+00:00Z CHANGE Fabric A: Maintenance window completed, all links operational
2025-09-17T06:26:00+00:00Z DEPLOY VAST FE: Aggressive prefetch feature flag enabled
2025-09-17T06:28:00+00:00Z DEPLOY VAST FE: Rollout completed across all frontend nodes
2025-09-17T09:41:00+00:00Z ROLLBACK VAST FE: Aggressive prefetch feature flag disabled
2025-09-17T09:43:00+00:00Z ROLLBACK VAST FE: Rollback completed, prefetch back to conservative mode
EOF

# Create evpn_events.log
cat > superpod_sev1_fake_telemetry/evpn_events.log << 'EOF'
2025-09-17T08:27:15+00:00Z EVPN leaf-01 MAC move detected: 00:1b:21:8a:c4:12 moved from vtep 10.1.1.1 to 10.1.1.2
2025-09-17T08:28:22+00:00Z EVPN leaf-03 BUM traffic spike on VNI 10001, investigating
2025-09-17T08:31:45+00:00Z EVPN spine-02 EVPN route withdrawal for prefix 192.168.100.0/24
2025-09-17T08:35:12+00:00Z EVPN leaf-05 MAC move storm detected, rate limiting enabled
2025-09-17T08:42:33+00:00Z EVPN leaf-02 EVPN failover triggered for VNI 10002
2025-09-17T08:45:18+00:00Z EVPN spine-01 Route convergence completed for affected VNIs
2025-09-17T08:48:55+00:00Z EVPN leaf-04 MAC aging timeout adjusted due to high churn
2025-09-17T08:52:41+00:00Z EVPN leaf-06 EVPN multihoming active-active failover
2025-09-17T08:56:27+00:00Z EVPN spine-03 BGP session flap detected with leaf-07
2025-09-17T09:01:14+00:00Z EVPN leaf-07 EVPN route import policy updated
2025-09-17T09:05:38+00:00Z EVPN leaf-08 VNI 10003 experiencing MAC move loops
2025-09-17T09:12:22+00:00Z EVPN spine-04 EVPN type-5 route advertisement issues
2025-09-17T09:18:45+00:00Z EVPN leaf-09 EVPN designated forwarder election completed
2025-09-17T09:25:11+00:00Z EVPN leaf-10 BUM replication list updated for VNI 10004
2025-09-17T09:31:57+00:00Z EVPN spine-02 EVPN route-target auto-derivation conflict
EOF

# Create noc_events.log
cat > superpod_sev1_fake_telemetry/noc_events.log << 'EOF'
2025-09-17T08:26:45+00:00Z ALARM CRITICAL GPU cluster EMEA-Pod-2 performance degradation detected
2025-09-17T08:27:12+00:00Z ALERT WARNING Queue wait times exceeding SLO threshold (>10min)
2025-09-17T08:28:33+00:00Z SNMP TRAP spine-switch-02 link utilization >90%
2025-09-17T08:31:18+00:00Z ALARM MAJOR VAST storage latency spike P99 >2ms
2025-09-17T08:35:42+00:00Z ALERT CRITICAL ECN mark rate >4% on training traffic class
2025-09-17T08:38:55+00:00Z SNMP TRAP leaf-switch-05 PFC pause storm detected
2025-09-17T08:42:21+00:00Z ALARM WARNING GPU utilization drop below 60% in Pod-2
2025-09-17T08:45:37+00:00Z ALERT MAJOR SLA penalty exposure >$10k/hour
2025-09-17T08:48:14+00:00Z SNMP TRAP nvme-fe-03 transport errors increasing
2025-09-17T08:52:28+00:00Z ALARM CRITICAL Customer whale-jobs experiencing >30min queue wait
2025-09-17T08:55:41+00:00Z ALERT WARNING NCCL communication errors spiking
2025-09-17T08:58:16+00:00Z SNMP TRAP fabric-spine-01 congestion tree formation
2025-09-17T09:02:33+00:00Z ALARM MAJOR Job failure rate >5% across all tenants
2025-09-17T09:06:47+00:00Z ALERT CRITICAL Incident escalated to SEV-1 status
2025-09-17T09:11:22+00:00Z SNMP TRAP storage-fe-02 cache hit ratio <70%
2025-09-17T09:15:38+00:00Z ALARM WARNING Cross-domain correlation confirmed
2025-09-17T09:19:51+00:00Z ALERT INFO Rollback initiated for VAST prefetch feature
2025-09-17T09:23:14+00:00Z SNMP TRAP Multiple systems showing recovery signs
2025-09-17T09:27:29+00:00Z ALARM INFO Metrics trending toward normal ranges
2025-09-17T09:31:45+00:00Z ALERT INFO SLA compliance improving, penalty exposure decreasing
EOF

echo "✅ All missing log files created!"
echo "Files created:"
echo "  - superpod_sev1_fake_telemetry/nccl_logs.log"
echo "  - superpod_sev1_fake_telemetry/change_timeline.log"
echo "  - superpod_sev1_fake_telemetry/evpn_events.log"
echo "  - superpod_sev1_fake_telemetry/noc_events.log"
echo ""
echo "Now restart your server:"
echo "  ./dashboard stop"
echo "  ./dashboard start"
