import React from 'react';
import { FileText, AlertCircle } from 'lucide-react';

export const DesignExerciseTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Callout at the top */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-orange-600 mt-1 flex-shrink-0" />
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">10k-100k Design Exercise</h2>
            <p className="text-gray-700 mb-2">
              This section contains the complete design exercise outcome for scaling from 10,000 to 100,000 GB200 GPUs. 
              The content below is static and based on the original exercise guidelines and requirements.
            </p>
          </div>
        </div>
      </div>

      {/* Full HTML document content */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            GPU Cluster Technical Architecture Document
          </h3>
        </div>
        
        {/* Embedded HTML content */}
        <div className="p-6">
          <div 
            dangerouslySetInnerHTML={{
              __html: `
                <style>
                  .design-exercise-content {
                    font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    font-size: 11pt;
                    line-height: 1.6;
                    color: #2c3e50;
                    max-width: 100%;
                  }
                  
                  .design-exercise-content h1 {
                    font-size: 24pt;
                    font-weight: 300;
                    color: #2c3e50;
                    letter-spacing: 0.5px;
                    margin-bottom: 10px;
                    text-align: center;
                  }
                  
                  .design-exercise-content h2 {
                    font-size: 16pt;
                    font-weight: 500;
                    color: #2c3e50;
                    margin: 40px 0 20px 0;
                    padding-bottom: 8px;
                    border-bottom: 1px solid #bdc3c7;
                  }
                  
                  .design-exercise-content h3 {
                    font-size: 13pt;
                    font-weight: 500;
                    color: #34495e;
                    margin: 30px 0 15px 0;
                  }
                  
                  .design-exercise-content h4 {
                    font-size: 11pt;
                    font-weight: 500;
                    color: #34495e;
                    margin: 20px 0 10px 0;
                  }
                  
                  .design-exercise-content p {
                    margin: 12px 0;
                    text-align: justify;
                    color: #34495e;
                  }
                  
                  .design-exercise-content ul, .design-exercise-content ol {
                    margin: 15px 0 15px 30px;
                    color: #34495e;
                  }
                  
                  .design-exercise-content li {
                    margin: 8px 0;
                    line-height: 1.6;
                  }
                  
                  .design-exercise-content table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 20px 0;
                    font-size: 10pt;
                    background: #ffffff;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                  }
                  
                  .design-exercise-content th {
                    background: #34495e;
                    color: #ffffff;
                    padding: 12px 15px;
                    text-align: left;
                    font-weight: 500;
                    font-size: 10pt;
                    border: 1px solid #2c3e50;
                  }
                  
                  .design-exercise-content td {
                    padding: 10px 15px;
                    border: 1px solid #ecf0f1;
                    vertical-align: top;
                    background: #ffffff;
                  }
                  
                  .design-exercise-content tr:nth-child(even) td {
                    background: #f8f9fa;
                  }
                  
                  .design-exercise-content tr:hover td {
                    background: #f5f6f7;
                  }
                  
                  .design-exercise-content .technical-spec, .design-exercise-content pre {
                    background: #f8f9fa;
                    border: 1px solid #dee2e6;
                    border-left: 3px solid #7f8c8d;
                    padding: 15px 20px;
                    margin: 20px 0;
                    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                    font-size: 9pt;
                    line-height: 1.5;
                    overflow-x: auto;
                    white-space: pre;
                  }
                  
                  .design-exercise-content code {
                    background: #f8f9fa;
                    padding: 2px 6px;
                    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                    font-size: 9pt;
                    color: #e74c3c;
                    border-radius: 2px;
                  }
                  
                  .design-exercise-content .alert-box {
                    padding: 15px 20px;
                    margin: 20px 0;
                    border-left: 3px solid #7f8c8d;
                    background: #f8f9fa;
                  }
                  
                  .design-exercise-content .alert-critical {
                    border-left-color: #e74c3c;
                    background: #fef5f5;
                  }
                  
                  .design-exercise-content .alert-warning {
                    border-left-color: #f39c12;
                    background: #fef9f0;
                  }
                  
                  .design-exercise-content .alert-success {
                    border-left-color: #27ae60;
                    background: #f0fdf4;
                  }
                  
                  .design-exercise-content .alert-info {
                    border-left-color: #3498db;
                    background: #f0f7ff;
                  }
                  
                  .design-exercise-content .alert-box strong {
                    display: block;
                    margin-bottom: 8px;
                    font-weight: 500;
                    color: #2c3e50;
                  }
                  
                  .design-exercise-content .metric-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 15px;
                    margin: 20px 0;
                  }
                  
                  .design-exercise-content .metric-card {
                    background: #f8f9fa;
                    border: 1px solid #dee2e6;
                    padding: 15px;
                    text-align: center;
                  }
                  
                  .design-exercise-content .metric-label {
                    font-size: 9pt;
                    color: #7f8c8d;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-weight: 500;
                  }
                  
                  .design-exercise-content .metric-value {
                    font-size: 16pt;
                    font-weight: 400;
                    color: #2c3e50;
                    margin-top: 5px;
                  }
                  
                  .design-exercise-content .architecture-diagram {
                    background: #ffffff;
                    border: 1px solid #dee2e6;
                    padding: 20px;
                    margin: 20px 0;
                    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                    font-size: 9pt;
                    line-height: 1.3;
                    overflow-x: auto;
                    white-space: pre;
                  }
                  
                  .design-exercise-content .comparison-box {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 15px;
                    margin: 20px 0;
                  }
                  
                  .design-exercise-content .comparison-item {
                    padding: 15px;
                    border: 1px solid #dee2e6;
                    background: #f8f9fa;
                  }
                  
                  .design-exercise-content .comparison-item h4 {
                    margin-top: 0;
                    font-size: 11pt;
                    font-weight: 500;
                    color: #2c3e50;
                    border-bottom: 1px solid #dee2e6;
                    padding-bottom: 8px;
                  }
                  
                  .design-exercise-content .document-header {
                    text-align: center;
                    padding: 40px 0 30px 0;
                    margin-bottom: 30px;
                    border-bottom: 2px solid #34495e;
                  }
                  
                  .design-exercise-content .subtitle {
                    font-size: 12pt;
                    color: #7f8c8d;
                    font-weight: 400;
                    line-height: 1.4;
                  }
                  
                  .design-exercise-content .version-info {
                    margin-top: 15px;
                    font-size: 10pt;
                    color: #95a5a6;
                  }
                  
                  .design-exercise-content strong {
                    font-weight: 500;
                    color: inherit;
                  }
                  
                  .design-exercise-content a {
                    color: #3498db;
                    text-decoration: none;
                  }
                  
                  .design-exercise-content a:hover {
                    text-decoration: underline;
                  }
                </style>
                
                <div class="design-exercise-content">
                  <div class="document-header">
                      <h1>GPU Cluster Technical Architecture</h1>
                      <div class="subtitle">
                          Large-Scale GPU Cluster Reference Architecture<br/>
                          10,000 GB200 GPUs Day-1 → 100,000 GB200 GPUs Scale-Out Design
                      </div>
                      <div class="version-info">
                          RoCE v2 Ethernet Fabric • EVPN/VXLAN Overlay • Slurm + Kubernetes Orchestration<br/>
                          Version 3.0 • Power Calculations Corrected & Validated<br/>
                          GB200 NVL72 Rack-Scale System Architecture
                      </div>
                  </div>

                  <h2>1. Reference Pod Architecture - HLD & LLD</h2>

                  <h3>1.1 Pod Size Selection and Justification</h3>

                  <div class="alert-info">
                      <strong>Recommended Pod Size: 1,008 GB200 GPUs (14 NVL72 Rack Systems)</strong>
                      <p>Day-1 Deployment: 10 pods × 1,008 GPUs = 10,080 GB200 GPUs total</p>
                      <p><strong>Important:</strong> Each GB200 NVL72 is a complete rack-scale system containing 72 GPUs</p>
                      <ul>
                          <li><strong>Failure Domain:</strong> Each pod represents ~1% of 100k cluster (limits blast radius)</li>
                          <li><strong>Network Scale:</strong> 112 × 400GbE ports fits within 2-tier Clos topology</li>
                          <li><strong>Power/Cooling:</strong> ~1.7-1.85 MW per pod (120-132kW per NVL72 rack)</li>
                          <li><strong>Operational:</strong> Manageable upgrade/maintenance unit</li>
                          <li><strong>Job Scheduling:</strong> Common training job sizes (512-2048 GPUs) fit within pod</li>
                      </ul>
                  </div>

                  <table>
                      <thead>
                          <tr>
                              <th>Component</th>
                              <th>Per Pod Specification</th>
                              <th>Quantity</th>
                              <th>Day-1 Total (10 Pods)</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr>
                              <td><strong>GB200 NVL72 Systems</strong></td>
                              <td>72 GPUs per rack system</td>
                              <td>14 systems/pod</td>
                              <td>140 systems (10,080 GPUs)</td>
                          </tr>
                          <tr>
                              <td><strong>Rack Count</strong></td>
                              <td>One NVL72 per rack (liquid-cooled)</td>
                              <td>14 racks/pod</td>
                              <td>140 racks total</td>
                          </tr>
                          <tr>
                              <td><strong>Network Connections</strong></td>
                              <td>8× 400GbE per NVL72 (BlueField-3)</td>
                              <td>112 ports/pod</td>
                              <td>1,120 × 400GbE ports</td>
                          </tr>
                          <tr>
                              <td><strong>Leaf Switches</strong></td>
                              <td>64×400G ports (Spectrum-X or Nexus)</td>
                              <td>4 switches/pod</td>
                              <td>40 leaf switches</td>
                          </tr>
                          <tr>
                              <td><strong>Spine Switches</strong></td>
                              <td>64×400G ports</td>
                              <td>4 switches/pod</td>
                              <td>40 spine switches</td>
                          </tr>
                          <tr>
                              <td><strong>Total Bandwidth</strong></td>
                              <td>44.8 Tbps per pod</td>
                              <td>-</td>
                              <td>448 Tbps aggregate</td>
                          </tr>
                          <tr>
                              <td><strong>Power Requirement</strong></td>
                              <td>1.68-1.85 MW per pod</td>
                              <td>-</td>
                              <td>16.8-18.5 MW total</td>
                          </tr>
                      </tbody>
                  </table>

                  <h3>1.2 GB200 NVL72 System Architecture</h3>

                  <div class="alert-success">
                      <strong>GB200 NVL72 Rack-Scale System Components</strong>
                      <p>Each NVL72 is a complete integrated rack system, not individual GPUs:</p>
                      <ul>
                          <li><strong>Compute:</strong> 18× compute trays (2 Grace CPUs + 4 Blackwell GPUs each)</li>
                          <li><strong>Total:</strong> 36 Grace CPUs + 72 Blackwell GB200 GPUs</li>
                          <li><strong>Interconnect:</strong> 9× NVLink Switch trays (130 TB/s aggregate bandwidth)</li>
                          <li><strong>Power:</strong> 8× 33kW power shelves (264kW total capacity, 120-132kW typical)</li>
                          <li><strong>Memory:</strong> 13.5 TB HBM3e (72 × ~188 GB) + CPU memory</li>
                          <li><strong>Cooling:</strong> Direct liquid cooling integrated (mandatory)</li>
                          <li><strong>Network:</strong> 4× dual-port BlueField-3 DPUs (8× 400GbE total)</li>
                      </ul>
                  </div>

                  <h3>1.3 Fabric Design - RoCE v2 Clos Network</h3>

                  <pre class="technical-spec">
Pod Network Topology (Per 1,008 GPU Pod):
────────────────────────────────────────
Architecture: 2-tier spine-leaf Clos
NVL72 Systems: 14 (1,008 GPUs total)
Network Ports: 112× 400GbE (8 per system via BlueField-3 DPUs)

Switching Requirements:
- Leaf Layer: 4× 64-port switches (256 ports total)
  • 112 ports for NVL72 downlinks
  • 144 ports for spine uplinks (36 per leaf)
  
- Spine Layer: 4× 64-port switches
  • 144 ports used for leaf connections
  • Non-blocking 1:1 bandwidth

Oversubscription Analysis:
- Compute bandwidth: 14 systems × 3.2 Tbps = 44.8 Tbps
- Bisection bandwidth: 144 links × 400G = 57.6 Tbps
- Oversubscription: NONE (1:1 non-blocking)

Switch Platform Options:
- NVIDIA Spectrum-X SN5600: 64× 400GbE, 25.6 Tbps
- Cisco Nexus 9364D-GX2A: 64× 400GbE, 25.6 Tbps
                  </pre>

                  <h4>Network Port Allocation Per Pod</h4>

                  <table>
                      <thead>
                          <tr>
                              <th>Component</th>
                              <th>Port Count</th>
                              <th>Speed</th>
                              <th>Total Bandwidth</th>
                              <th>Purpose</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr>
                              <td><strong>NVL72 to Leaf</strong></td>
                              <td>112 ports</td>
                              <td>400 GbE</td>
                              <td>44.8 Tbps</td>
                              <td>Compute connectivity (8 per system)</td>
                          </tr>
                          <tr>
                              <td><strong>Leaf to Spine</strong></td>
                              <td>144 ports</td>
                              <td>400 GbE</td>
                              <td>57.6 Tbps</td>
                              <td>Fabric interconnect (36 per leaf)</td>
                          </tr>
                          <tr>
                              <td><strong>Inter-Pod Links</strong></td>
                              <td>16 ports</td>
                              <td>400 GbE</td>
                              <td>6.4 Tbps</td>
                              <td>Pod-to-pod connectivity</td>
                          </tr>
                          <tr>
                              <td><strong>Storage Network</strong></td>
                              <td>32 ports</td>
                              <td>400 GbE</td>
                              <td>12.8 Tbps</td>
                              <td>VAST NVMe-oF targets</td>
                          </tr>
                      </tbody>
                  </table>

                  <h4>QoS Mapping for RoCE v2</h4>

                  <div class="alert-warning">
                      <strong>Note:</strong> Pin DSCP/queue maps, ECN/WRED curves, DCQCN constants, and PFC watchdogs to vendor-specific configurations per switch/NIC firmware and release notes.
                  </div>

                  <table>
                      <thead>
                          <tr>
                              <th>Traffic Class</th>
                              <th>DSCP Value</th>
                              <th>CoS Priority</th>
                              <th>Queue Config</th>
                              <th>Bandwidth %</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr>
                              <td><strong>RoCE/RDMA</strong></td>
                              <td>26 (AF31)</td>
                              <td>3</td>
                              <td>No-drop (PFC enabled)</td>
                              <td>50%</td>
                          </tr>
                          <tr>
                              <td><strong>CNP Traffic</strong></td>
                              <td>48 (CS6)</td>
                              <td>7</td>
                              <td>Strict priority</td>
                              <td>5%</td>
                          </tr>
                          <tr>
                              <td><strong>Storage I/O</strong></td>
                              <td>18 (AF21)</td>
                              <td>2</td>
                              <td>Weighted fair queue</td>
                              <td>20%</td>
                          </tr>
                          <tr>
                              <td><strong>Management</strong></td>
                              <td>16 (CS2)</td>
                              <td>1</td>
                              <td>Best effort</td>
                              <td>5%</td>
                          </tr>
                          <tr>
                              <td><strong>Default</strong></td>
                              <td>0 (BE)</td>
                              <td>0</td>
                              <td>Best effort</td>
                              <td>20%</td>
                          </tr>
                      </tbody>
                  </table>

                  <h4>PFC and ECN Configuration</h4>

                  <pre class="technical-spec">
Priority Flow Control (PFC) Settings:
────────────────────────────────────────
PFC Enable: Priority 3 only (RoCE traffic)
PFC Watchdog Timer: 200ms detection
PFC Recovery Timer: 400ms
Storm Protection: Auto-disable after 3 storms/min

Explicit Congestion Notification (ECN):
────────────────────────────────────────
Marking Threshold (Min): 150KB (10% buffer)
Marking Threshold (Max): 3MB (25% buffer)
Marking Probability: 5-10% gradient
Drop Probability: 0% (lossless for RDMA)

DCQCN Parameters:
────────────────────────────────────────
Rate Increase (Rp): 50 Mbps
Additive Increase (Rai): 5 Mbps  
Multiplicative Decrease (Gd): 1/256
CNP Generation Timer: 10ms
Rate Recovery Timer: 55ms
Byte Counter Reset: 10MB
                  </pre>

                  <h3>1.4 BlueField-3 DPU Integration</h3>

                  <div class="alert-info">
                      <strong>DPU Configuration Per NVL72 System</strong>
                      <p>Each GB200 NVL72 system includes 4× dual-port BlueField-3 DPUs for network acceleration</p>
                  </div>

                  <table>
                      <thead>
                          <tr>
                              <th>DPU Component</th>
                              <th>Specification</th>
                              <th>Per System</th>
                              <th>Per Pod (14 systems)</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr>
                              <td><strong>BlueField-3 DPUs</strong></td>
                              <td>Dual-port 400GbE</td>
                              <td>4 DPUs (8 ports)</td>
                              <td>56 DPUs (112 ports)</td>
                          </tr>
                          <tr>
                              <td><strong>Network Bandwidth</strong></td>
                              <td>800 Gbps per DPU</td>
                              <td>3.2 Tbps</td>
                              <td>44.8 Tbps</td>
                          </tr>
                          <tr>
                              <td><strong>ARM Cores</strong></td>
                              <td>16 cores @ 2.75GHz</td>
                              <td>64 cores</td>
                              <td>896 cores</td>
                          </tr>
                          <tr>
                              <td><strong>Memory</strong></td>
                              <td>32GB DDR5 per DPU</td>
                              <td>128GB</td>
                              <td>1.79TB</td>
                          </tr>
                          <tr>
                              <td><strong>Power per DPU</strong></td>
                              <td>Up to 150W</td>
                              <td>600W (4 DPUs)</td>
                              <td>8.4kW</td>
                          </tr>
                          <tr>
                              <td><strong>Offload Features</strong></td>
                              <td>RDMA, GPUDirect, OVS</td>
                              <td>Full offload</td>
                              <td>-</td>
                          </tr>
                      </tbody>
                  </table>

                  <h2>2. Storage – Layout & Data Paths</h2>

                  <div class="alert-info">
                      <strong>Storage Sizing for 10,000 GPU Day-1 Deployment</strong>
                      <p>20 PB usable storage scales linearly with GPU count to support 100,000 GPU deployment (200 PB)</p>
                  </div>

                  <h3>2.1 VAST Data Platform Configuration</h3>

                  <table>
                      <thead>
                          <tr>
                              <th>Component</th>
                              <th>Day-1 (10k GPUs)</th>
                              <th>Scale (100k GPUs)</th>
                              <th>Per-Pod Allocation</th>
                          </tr>
                      </thead>
                      <tbody>
                          <tr>
                              <td><strong>Usable Capacity</strong></td>
                              <td>20 PB</td>
                              <td>200 PB</td>
                              <td>2 PB per pod</td>
                          </tr>
                          <tr>
                              <td><strong>Raw Capacity</strong></td>
                              <td>32-35 PB</td>
                              <td>320-350 PB</td>
                              <td>3.2-3.5 PB per pod</td>
                          </tr>
                          <tr>
                              <td><strong>VAST CNodes</strong></td>
                              <td>10 nodes</td>
                              <td>100 nodes</td>
                              <td>1 CNode per pod</td>
                          </tr>
                          <tr>
                              <td><strong>VAST DBoxes</strong></td>
                              <td>10 enclosures</td>
                              <td>100 enclosures</td>
                              <td>1 DBox per pod</td>
                          </tr>
                          <tr>
                              <td><strong>Network Connections</strong></td>
                              <td>40× 400 GbE</td>
                              <td>400× 400 GbE</td>
                              <td>4× 400 GbE per pod</td>
                          </tr>
                          <tr>
                              <td><strong>Aggregate Throughput</strong></td>
                              <td>1.6 TB/s</td>
                              <td>16 TB/s</td>
                              <td>160 GB/s per pod</td>
                          </tr>
                      </tbody>
                  </table>

                  <h2>3. Scale-Out Architecture to 100,000 GPUs</h2>

                  <h3>3.1 Scaling Strategy</h3>

                  <div class="metric-grid">
                      <div class="metric-card">
                          <div class="metric-label">Day-1 GPUs</div>
                          <div class="metric-value">10,080</div>
                      </div>
                      <div class="metric-card">
                          <div class="metric-label">Target Scale</div>
                          <div class="metric-value">100,800</div>
                      </div>
                      <div class="metric-card">
                          <div class="metric-label">Pod Count</div>
                          <div class="metric-value">10 → 100</div>
                      </div>
                  </div>

                  <h2>4. Executive Summary</h2>

                  <div class="alert-success">
                      <h3 style="margin-top: 0;">Architecture Overview</h3>
                      <p><strong>Scalable GPU Cluster: 10,000 → 100,000 GB200 GPUs</strong></p>
                      <ol>
                          <li><strong>Day-1 Deployment:</strong> 10 pods × 1,008 GPUs = 10,080 GB200 GPUs (140 NVL72 rack systems)</li>
                          <li><strong>Scale Path:</strong> Linear scaling to 100 pods (1,400 NVL72 systems) = 100,800 GPUs</li>
                          <li><strong>System Architecture:</strong> Each NVL72 is a complete rack with 72 GPUs + 36 Grace CPUs + NVLink fabric</li>
                          <li><strong>Network:</strong> 2-tier Clos per pod with BlueField-3 DPUs, scaling to 3-tier at 30+ pods</li>
                          <li><strong>Storage:</strong> 20 PB VAST (2 PB per pod) scaling to 200 PB</li>
                          <li><strong>Bandwidth:</strong> 44.8 Tbps per pod compute bandwidth, non-blocking within pods</li>
                          <li><strong>Power:</strong> 16.8-18.5 MW Day-1, scaling to 168-185 MW at full deployment</li>
                      </ol>
                  </div>

                  <div class="metric-grid">
                      <div class="metric-card">
                          <div class="metric-label">Systems Day-1</div>
                          <div class="metric-value">140</div>
                      </div>
                      <div class="metric-card">
                          <div class="metric-label">GPUs per System</div>
                          <div class="metric-value">72</div>
                      </div>
                      <div class="metric-card">
                          <div class="metric-label">Total Day-1 GPUs</div>
                          <div class="metric-value">10,080</div>
                      </div>
                  </div>
                </div>
              `
            }}
          />
        </div>
      </div>
    </div>
  );
};
