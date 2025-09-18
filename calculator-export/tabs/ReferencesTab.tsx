import React from 'react';
import { ExternalLink, BookOpen, FileText, Server, Cpu, Zap, Building2, Database } from 'lucide-react';

export const ReferencesTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-green-600" />
          Executive Summary: GB200 & GB300 Infrastructure Requirements
        </h2>
        <div className="prose prose-sm max-w-none text-gray-700">
          <p className="mb-4">
            The NVIDIA GB200 and GB300 represent a paradigm shift in AI infrastructure, demanding unprecedented scale 
            and liquid cooling as mandatory requirements. These next-generation AI platforms are designed for the 
            trillion-parameter model era, with each rack consuming 120kW (GB200) to 140kW (GB300) of power.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2">GB200 NVL72 Key Specs:</h3>
              <ul className="text-sm space-y-1">
                <li>• 72 Blackwell GPUs per rack</li>
                <li>• 120kW rack power consumption</li>
                <li>• 192GB HBM3e per GPU (13.8TB per rack)</li>
                <li>• Mandatory liquid cooling (PUE 1.1)</li>
                <li>• 9 NVLink rails per GPU</li>
                <li>• $4.68M per rack (estimated)</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2">GB300 NVL72 Key Specs:</h3>
              <ul className="text-sm space-y-1">
                <li>• 72 Blackwell Ultra GPUs per rack</li>
                <li>• 140kW rack power consumption</li>
                <li>• 288GB HBM4 per GPU (20.7TB per rack)</li>
                <li>• Enhanced liquid cooling required</li>
                <li>• 800G networking throughout</li>
                <li>• $6.12M per rack (estimated)</li>
              </ul>
            </div>
          </div>
          <p className="text-sm italic">
            Based on industry analysis from NVIDIA's 2024-2025 deployment roadmap, these systems require complete 
            datacenter redesign with direct-to-chip liquid cooling, upgraded power infrastructure, and purpose-built 
            facilities capable of handling 30-50MW+ deployments.
          </p>
        </div>
      </div>

      {/* Key Infrastructure Challenges */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Critical Infrastructure Requirements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Power & Cooling</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 30-50MW minimum facility</li>
              <li>• Liquid cooling mandatory</li>
              <li>• PUE 1.08-1.10 achievable</li>
              <li>• CDU per 2-4 racks</li>
              <li>• Closed-loop cooling systems</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Networking Scale</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 400G/800G InfiniBand</li>
              <li>• 3-tier fat tree topology</li>
              <li>• Rail-optimized design</li>
              <li>• RDMA/RoCEv2 support</li>
              <li>• ECN/DCQCN congestion control</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Storage Requirements</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 5-10 PB per 1000 GPUs</li>
              <li>• NVMe-oF for hot tier</li>
              <li>• 400+ GB/s throughput</li>
              <li>• Sub-ms latency targets</li>
              <li>• Tiered architecture essential</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Technical References */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Technical Documentation & Resources
        </h3>
        
        {/* NVIDIA Reference Architectures */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Server className="w-4 h-4" />
            NVIDIA DGX SuperPOD Reference Architectures
          </h4>
          <div className="space-y-2 pl-6">
            <div className="text-sm">
              <span className="font-medium text-gray-700">RA-11338-001:</span>
              <span className="text-gray-600"> NVIDIA DGX SuperPOD GB200 Reference Architecture</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-700">RA-11337-001:</span>
              <span className="text-gray-600"> NVIDIA DGX SuperPOD B300 Reference Architecture</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-700">RA-11339-001:</span>
              <span className="text-gray-600"> NVIDIA SuperPOD B300 XDR Reference Architecture</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-700">RA-11334-001:</span>
              <span className="text-gray-600"> NVIDIA DGX SuperPOD B200 Reference Architecture</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-gray-700">RA-11336-001:</span>
              <span className="text-gray-600"> NVIDIA DGX SuperPOD H200 Reference Architecture</span>
            </div>
          </div>
        </div>

        {/* Software & Management */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            NVIDIA Software & Management
          </h4>
          <div className="space-y-2 pl-6">
            <div className="text-sm text-gray-600">
              • NVIDIA Mission Control Software with GB200 NVL72 Systems Administration Guide
            </div>
            <div className="text-sm text-gray-600">
              • NVIDIA BlueField-3 DPU Controller User Manual
            </div>
          </div>
        </div>

        {/* Storage Solutions */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Enterprise Storage Solutions
          </h4>
          <div className="space-y-3">
            <div className="pl-6">
              <p className="text-sm font-medium text-gray-700">DDN Storage</p>
              <ul className="text-sm text-gray-600 mt-1 space-y-1">
                <li>• DDN A3I Solutions for NVIDIA Cloud Partners (NCP Reference Architecture)</li>
                <li>• DDN A3I Solutions with NVIDIA DGX SuperPOD Reference Architecture</li>
              </ul>
            </div>
            <div className="pl-6">
              <p className="text-sm font-medium text-gray-700">NetApp</p>
              <ul className="text-sm text-gray-600 mt-1">
                <li>• NetApp AFF A90 Storage Systems with NVIDIA DGX SuperPOD Design Guide (NVA-1175)</li>
              </ul>
            </div>
            <div className="pl-6">
              <p className="text-sm font-medium text-gray-700">IBM Storage Scale</p>
              <ul className="text-sm text-gray-600 mt-1">
                <li>• IBM Storage Scale System 6000 with NVIDIA DGX SuperPOD Deployment Guide (IBM Redbooks)</li>
              </ul>
            </div>
            <div className="pl-6">
              <p className="text-sm font-medium text-gray-700">VAST Data</p>
              <ul className="text-sm text-gray-600 mt-1 space-y-1">
                <li>• VAST NVIDIA NCP White Paper 2025</li>
                <li>• NVIDIA DGX SuperPOD VAST Reference Architecture (RA-11389-001)</li>
              </ul>
            </div>
            <div className="pl-6">
              <p className="text-sm font-medium text-gray-700">Pure Storage</p>
              <ul className="text-sm text-gray-600 mt-1">
                <li>• Pure Storage FlashBlade NVIDIA DGX SuperPOD Deployment Guide</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Research Papers */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Research & Analysis
          </h4>
          <div className="pl-6">
            <p className="text-sm font-medium text-gray-700 mb-1">
              NVIDIA GB200 and GB300 Infrastructure Demands
            </p>
            <p className="text-sm text-gray-600">
              Unprecedented Scale and Liquid Cooling Requirements for Next-Generation AI Deployments - 
              Comprehensive analysis of power, cooling, and infrastructure requirements for GB200/GB300 deployments.
            </p>
          </div>
        </div>
      </div>

      {/* Deployment Case Studies */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Real-World Deployments</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">xAI Colossus (100,000 H100s)</h4>
            <p className="text-sm text-gray-600 mb-2">
              Largest known deployment using liquid cooling throughout, achieving 150MW facility power with innovative 
              cooling design. Serves as blueprint for GB200/GB300 deployments.
            </p>
            <div className="text-xs text-gray-500">
              • 150MW total power • Liquid cooled • Built in 122 days
            </div>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Meta AI Research SuperCluster</h4>
            <p className="text-sm text-gray-600 mb-2">
              16,000 GPU deployment showcasing tiered storage architecture and advanced networking topology for 
              training large language models.
            </p>
            <div className="text-xs text-gray-500">
              • 35MW power • Hybrid cooling • 200 PB storage
            </div>
          </div>
        </div>
      </div>

      {/* Cost Optimization Strategies */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
        <h3 className="text-xl font-bold text-gray-800 mb-4">TCO Optimization Strategies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Infrastructure Optimization</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ Liquid cooling reduces PUE from 1.4-1.5 to 1.08-1.10</li>
              <li>✓ Higher utilization (90%+) critical for ROI</li>
              <li>✓ Regional power cost arbitrage (Texas: $0.047/kWh)</li>
              <li>✓ Tiered storage reduces cost by 40-60%</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Operational Excellence</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>✓ Predictive maintenance reduces downtime</li>
              <li>✓ Job scheduling optimization improves utilization</li>
              <li>✓ Power capping during peak hours</li>
              <li>✓ Automated failover and redundancy</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Note:</strong> All specifications and pricing are based on publicly available information and 
          industry analysis as of Q4 2024. Actual configurations and costs may vary based on vendor negotiations, 
          regional factors, and specific deployment requirements. This calculator provides estimates for planning 
          purposes only.
        </p>
      </div>
    </div>
  );
};
