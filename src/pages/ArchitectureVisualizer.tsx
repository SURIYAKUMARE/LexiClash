import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { OfflineCloudSimulationState } from '../db/indexedDb';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  Globe,
  Server,
  Database,
  Shield,
  Layers,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Zap,
  RotateCcw,
  Maximize2,
  Info,
  Radio,
  Cpu,
  Flame,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface TopologyNode {
  id: string;
  name: string;
  type: 'IGW' | 'ALB' | 'NAT' | 'EC2' | 'RDS' | 'S3';
  az?: 'us-east-1a' | 'us-east-1b' | 'global';
  subnet?: 'public' | 'private' | 'isolated';
  status: 'healthy' | 'degraded' | 'failed';
  ip?: string;
  details: Record<string, string>;
}

export const ArchitectureVisualizer: React.FC = () => {
  const [simState, setSimState] = useState<OfflineCloudSimulationState | null>(null);
  const [selectedNode, setSelectedNode] = useState<TopologyNode | null>(null);
  const [chaosMode, setChaosMode] = useState<'none' | 'fail_az1b' | 'sever_db' | 'ingress_surge'>('none');
  const [packetOffset, setPacketOffset] = useState(0);

  useEffect(() => {
    const fetchState = async () => {
      const state = await api.getCloudSimulation();
      setSimState(state);
    };
    fetchState();
  }, []);

  // Continuous network packet animation
  useEffect(() => {
    const interval = setInterval(() => {
      setPacketOffset(prev => (prev + 1) % 100);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const nodes: TopologyNode[] = [
    {
      id: 'node-igw',
      name: 'Internet Gateway',
      type: 'IGW',
      az: 'global',
      status: 'healthy',
      details: {
        'Gateway ID': 'igw-prod-main',
        'Attached VPC': 'vpc-main-prod (10.0.0.0/16)',
        'Route Egress': '0.0.0.0/0 Direct',
        'State': 'Attached & Active'
      }
    },
    {
      id: 'node-alb',
      name: 'Application Load Balancer',
      type: 'ALB',
      subnet: 'public',
      status: chaosMode === 'ingress_surge' ? 'degraded' : 'healthy',
      ip: '54.210.82.10',
      details: {
        'DNS Name': 'alb-prod-external.us-east-1.elb.amazonaws.com',
        'Scheme': 'Internet-Facing',
        'Port Listeners': 'HTTP 80 -> HTTPS 443 Redirect',
        'Target Groups': '2 Healthy EC2 Targets',
        'Security Group': 'sg-web-public (443, 80)'
      }
    },
    {
      id: 'node-nat-1a',
      name: 'NAT Gateway (AZ-1a)',
      type: 'NAT',
      az: 'us-east-1a',
      subnet: 'public',
      status: 'healthy',
      ip: '52.4.112.98',
      details: {
        'NAT ID': 'nat-prod-01',
        'Public Elastic IP': '52.4.112.98',
        'Subnet': 'public-subnet-1a (10.0.1.0/24)',
        'Egress Throughput': '14.2 Mbps'
      }
    },
    {
      id: 'node-ec2-1a',
      name: 'API Cluster Node 01',
      type: 'EC2',
      az: 'us-east-1a',
      subnet: 'private',
      status: 'healthy',
      ip: '10.0.1.18',
      details: {
        'Instance ID': 'i-0a12b34c56d78e01',
        'Instance Type': 't3.micro (2 vCPU, 1 GB)',
        'Subnet': 'private-app-subnet-1a (10.0.10.0/24)',
        'CPU Utilization': chaosMode === 'ingress_surge' ? '98.4% (CRITICAL)' : '34.2%',
        'Security Group': 'sg-web-public'
      }
    },
    {
      id: 'node-ec2-1b',
      name: 'API Cluster Node 02',
      type: 'EC2',
      az: 'us-east-1b',
      subnet: 'private',
      status: chaosMode === 'fail_az1b' ? 'failed' : 'healthy',
      ip: '10.0.2.24',
      details: {
        'Instance ID': 'i-0a12b34c56d78e02',
        'Instance Type': 't3.micro (2 vCPU, 1 GB)',
        'Subnet': 'private-app-subnet-1b (10.0.20.0/24)',
        'CPU Utilization': chaosMode === 'fail_az1b' ? '0% (OFFLINE)' : '38.6%',
        'Security Group': 'sg-web-public'
      }
    },
    {
      id: 'node-rds-primary',
      name: 'PostgreSQL RDS Primary',
      type: 'RDS',
      az: 'us-east-1a',
      subnet: 'isolated',
      status: chaosMode === 'sever_db' ? 'failed' : 'healthy',
      ip: '10.0.50.12',
      details: {
        'Engine': 'PostgreSQL 16.2',
        'Deployment': 'Multi-AZ Cluster (Primary)',
        'Subnet': 'isolated-db-subnet-1a (10.0.50.0/24)',
        'Port': '5432 (Restricted to VPC CIDR)',
        'Active Connections': chaosMode === 'sever_db' ? '0 (Connection Refused)' : '14/100'
      }
    },
    {
      id: 'node-s3',
      name: 'S3 Object Storage',
      type: 'S3',
      az: 'global',
      status: 'healthy',
      details: {
        'Buckets Active': '3 Buckets',
        'Access Policy': 'Block Public Access Enforced',
        'Global Endpoint': 's3.us-east-1.amazonaws.com',
        'Storage Class': 'Standard + Glacier Vault'
      }
    }
  ];

  const getNodeColor = (type: TopologyNode['type']) => {
    switch (type) {
      case 'IGW': return '#0B57D0';
      case 'ALB': return '#0284C7';
      case 'NAT': return '#0D9488';
      case 'EC2': return '#1B5E20';
      case 'RDS': return '#7C3AED';
      case 'S3': return '#EA580C';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-surface-border dark:border-surface-dark-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
              Topology Canvas v2.4
            </span>
            <span className="text-xs text-charcoal-subtle dark:text-slate-400">Multi-AZ Resilient VPC (10.0.0.0/16)</span>
          </div>
          <h1 className="text-2xl font-bold text-charcoal dark:text-slate-100 tracking-tight">
            Live Cloud Architecture Visualizer
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-muted dark:text-slate-400 mt-1 max-w-2xl">
            Interactive network topology editor and telemetry inspector. Click infrastructure nodes to examine configuration parameters or trigger simulated chaos scenarios.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/cloud-console">
            <Button size="sm" variant="secondary" className="text-xs">
              Open Cloud Console
            </Button>
          </Link>
          <Link to="/war-room">
            <Button size="sm" variant="primary" className="text-xs gap-1.5 bg-rose-600 hover:bg-rose-700">
              <Flame className="w-3.5 h-3.5" />
              SRE War Room
            </Button>
          </Link>
        </div>
      </div>

      {/* Chaos Engineering Experiment Controls */}
      <div className="bg-white dark:bg-surface-dark-card border border-surface-border dark:border-surface-dark-border rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 text-xs">
          <Zap className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="font-semibold text-charcoal dark:text-slate-200">Chaos Engineering Simulator:</span>
          <span className="text-charcoal-muted dark:text-slate-400 hidden md:inline">
            Inject simulated real-time infrastructure failures to observe failover routing.
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setChaosMode('fail_az1b')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              chaosMode === 'fail_az1b'
                ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 font-bold'
                : 'bg-surface-subtle border-surface-border text-charcoal hover:bg-slate-100 dark:bg-slate-800'
            }`}
          >
            Fail AZ-1b Datacenter
          </button>
          <button
            onClick={() => setChaosMode('sever_db')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              chaosMode === 'sever_db'
                ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 font-bold'
                : 'bg-surface-subtle border-surface-border text-charcoal hover:bg-slate-100 dark:bg-slate-800'
            }`}
          >
            Sever Database Connection
          </button>
          <button
            onClick={() => setChaosMode('none')}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 flex items-center gap-1 font-semibold"
          >
            <RotateCcw className="w-3 h-3" /> Restore All Healthy
          </button>
        </div>
      </div>

      {/* Main Canvas & Inspector Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Topology Diagram (8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-surface-dark-card border border-surface-border dark:border-surface-dark-border rounded-xl p-6 relative overflow-hidden shadow-xs min-h-[580px]">
          {/* Subtle Grid Canvas Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

          {/* VPC Boundary Marker */}
          <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 relative pt-7">
            <div className="absolute top-2 left-4 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-charcoal-muted dark:text-slate-300 uppercase tracking-wider">
              VPC Boundary: vpc-main-prod (10.0.0.0/16)
            </div>

            {/* Public Subnets Zone */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-slate-50/50 dark:bg-slate-900/40 mb-4 relative pt-6">
              <span className="absolute top-1.5 left-3 text-[9px] font-mono font-semibold text-charcoal-subtle uppercase">
                Public Ingress Tier (Subnets: 10.0.1.0/24 & 10.0.2.0/24)
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* IGW */}
                <div
                  onClick={() => setSelectedNode(nodes.find(n => n.id === 'node-igw') || null)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedNode?.id === 'node-igw'
                      ? 'border-brand-600 bg-brand-50/40 dark:bg-brand-950/40 shadow-xs ring-1 ring-brand-600'
                      : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="text-xs font-bold text-charcoal dark:text-white">Internet Gateway</div>
                  <span className="text-[10px] font-mono text-charcoal-subtle">0.0.0.0/0 Direct</span>
                </div>

                {/* ALB */}
                <div
                  onClick={() => setSelectedNode(nodes.find(n => n.id === 'node-alb') || null)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedNode?.id === 'node-alb'
                      ? 'border-brand-600 bg-brand-50/40 dark:bg-brand-950/40 shadow-xs ring-1 ring-brand-600'
                      : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Layers className="w-4 h-4 text-sky-600" />
                    <span className={`w-2 h-2 rounded-full ${chaosMode === 'ingress_surge' ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
                  </div>
                  <div className="text-xs font-bold text-charcoal dark:text-white">Application Load Balancer</div>
                  <span className="text-[10px] font-mono text-charcoal-subtle">HTTPS Target Group</span>
                </div>

                {/* NAT */}
                <div
                  onClick={() => setSelectedNode(nodes.find(n => n.id === 'node-nat-1a') || null)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedNode?.id === 'node-nat-1a'
                      ? 'border-brand-600 bg-brand-50/40 dark:bg-brand-950/40 shadow-xs ring-1 ring-brand-600'
                      : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Shield className="w-4 h-4 text-teal-600" />
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  </div>
                  <div className="text-xs font-bold text-charcoal dark:text-white">NAT Gateway (1a)</div>
                  <span className="text-[10px] font-mono text-charcoal-subtle">Egress IP: 52.4.112.98</span>
                </div>
              </div>
            </div>

            {/* Private Compute Subnets Zone (Multi-AZ) */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-slate-50/50 dark:bg-slate-900/40 mb-4 relative pt-6">
              <span className="absolute top-1.5 left-3 text-[9px] font-mono font-semibold text-charcoal-subtle uppercase">
                Private Compute Cluster (Subnets: 10.0.10.0/24 & 10.0.20.0/24)
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Node EC2 1A */}
                <div
                  onClick={() => setSelectedNode(nodes.find(n => n.id === 'node-ec2-1a') || null)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedNode?.id === 'node-ec2-1a'
                      ? 'border-brand-600 bg-brand-50/40 dark:bg-brand-950/40 shadow-xs ring-1 ring-brand-600'
                      : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Server className="w-4 h-4 text-emerald-600" />
                    <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-1.5 py-0.2 rounded">
                      AZ: us-east-1a
                    </span>
                  </div>
                  <div className="text-xs font-bold text-charcoal dark:text-white">API Cluster Node 01</div>
                  <span className="text-[10px] font-mono text-charcoal-subtle">IP: 10.0.1.18 (t3.micro)</span>
                </div>

                {/* Node EC2 1B */}
                <div
                  onClick={() => setSelectedNode(nodes.find(n => n.id === 'node-ec2-1b') || null)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    chaosMode === 'fail_az1b'
                      ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 ring-1 ring-rose-500'
                      : selectedNode?.id === 'node-ec2-1b'
                      ? 'border-brand-600 bg-brand-50/40 dark:bg-brand-950/40 shadow-xs ring-1 ring-brand-600'
                      : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Server className="w-4 h-4 text-emerald-600" />
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      chaosMode === 'fail_az1b' ? 'bg-rose-200 text-rose-800' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      AZ: us-east-1b
                    </span>
                  </div>
                  <div className="text-xs font-bold text-charcoal dark:text-white">API Cluster Node 02</div>
                  <span className={`text-[10px] font-mono ${chaosMode === 'fail_az1b' ? 'text-rose-600 font-bold' : 'text-charcoal-subtle'}`}>
                    {chaosMode === 'fail_az1b' ? 'OUTAGE: Instance Unreachable' : 'IP: 10.0.2.24 (t3.micro)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Isolated Database Subnet Zone */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-slate-50/50 dark:bg-slate-900/40 relative pt-6">
              <span className="absolute top-1.5 left-3 text-[9px] font-mono font-semibold text-charcoal-subtle uppercase">
                Isolated Data Persistence Tier (Subnet: 10.0.50.0/24)
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* RDS Primary */}
                <div
                  onClick={() => setSelectedNode(nodes.find(n => n.id === 'node-rds-primary') || null)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    chaosMode === 'sever_db'
                      ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 ring-1 ring-rose-500'
                      : selectedNode?.id === 'node-rds-primary'
                      ? 'border-brand-600 bg-brand-50/40 dark:bg-brand-950/40 shadow-xs ring-1 ring-brand-600'
                      : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Database className="w-4 h-4 text-purple-600" />
                    <span className="text-[9px] font-mono font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 px-1.5 py-0.2 rounded">
                      Port 5432
                    </span>
                  </div>
                  <div className="text-xs font-bold text-charcoal dark:text-white">PostgreSQL Multi-AZ Primary</div>
                  <span className={`text-[10px] font-mono ${chaosMode === 'sever_db' ? 'text-rose-600 font-bold' : 'text-charcoal-subtle'}`}>
                    {chaosMode === 'sever_db' ? 'CONNECTION REFUSED (Starvation)' : 'Active Connections: 14/100'}
                  </span>
                </div>

                {/* S3 Storage */}
                <div
                  onClick={() => setSelectedNode(nodes.find(n => n.id === 'node-s3') || null)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedNode?.id === 'node-s3'
                      ? 'border-brand-600 bg-brand-50/40 dark:bg-brand-950/40 shadow-xs ring-1 ring-brand-600'
                      : 'border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-card hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Database className="w-4 h-4 text-orange-600" />
                    <span className="text-[9px] font-mono font-bold bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 px-1.5 py-0.2 rounded">
                      S3 Endpoint
                    </span>
                  </div>
                  <div className="text-xs font-bold text-charcoal dark:text-white">S3 Object Storage</div>
                  <span className="text-[10px] font-mono text-charcoal-subtle">Private Block Public Access</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] text-charcoal-subtle dark:text-slate-400">
            <span>Flow telemetry: ~420 req/sec</span>
            <span>Latency: {chaosMode === 'ingress_surge' ? '4,812ms (SURGE)' : '24.2ms (NORMAL)'}</span>
          </div>
        </div>

        {/* Node Inspector Drawer (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedNode ? (
            <Card className="border-t-4" style={{ borderTopColor: getNodeColor(selectedNode.type) }}>
              <div className="flex items-center justify-between pb-3 border-b border-surface-border dark:border-surface-dark-border">
                <div>
                  <h3 className="text-sm font-bold text-charcoal dark:text-slate-100">
                    {selectedNode.name}
                  </h3>
                  <span className="text-[10px] font-mono text-charcoal-subtle block">
                    Type: {selectedNode.type}
                  </span>
                </div>
                <Badge
                  variant={selectedNode.status === 'healthy' ? 'success' : 'error'}
                  size="sm"
                >
                  {selectedNode.status.toUpperCase()}
                </Badge>
              </div>

              {/* Node Details Table */}
              <div className="py-3 space-y-2 text-xs">
                <span className="text-[11px] font-semibold text-charcoal-subtle uppercase tracking-wider block">
                  Configuration Telemetry
                </span>
                <div className="divide-y divide-surface-border dark:divide-surface-dark-border font-mono text-[11px]">
                  {Object.entries(selectedNode.details).map(([key, val]) => (
                    <div key={key} className="py-1.5 flex justify-between gap-2">
                      <span className="text-charcoal-muted dark:text-slate-400">{key}:</span>
                      <span className="font-semibold text-charcoal dark:text-white text-right">{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-surface-border dark:border-surface-dark-border space-y-2">
                <Link to="/cloud-console" className="w-full block">
                  <Button size="sm" variant="primary" className="w-full text-xs">
                    Configure in Cloud Console
                  </Button>
                </Link>
                <Link to="/security-inspector" className="w-full block">
                  <Button size="sm" variant="secondary" className="w-full text-xs">
                    Audit Security Posture
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <Card className="text-center py-16">
              <Info className="w-8 h-8 text-charcoal-subtle dark:text-slate-500 mx-auto mb-2" />
              <p className="text-xs text-charcoal-muted dark:text-slate-400 max-w-xs mx-auto">
                Select any topology node in the architecture diagram to inspect configuration details, security bounds, and real-time state.
              </p>
            </Card>
          )}

          {/* Quick Metrics Card */}
          <Card>
            <h3 className="text-xs font-bold text-charcoal dark:text-slate-100 uppercase tracking-wider mb-2">
              Architecture Health Assessment
            </h3>
            <div className="space-y-2 text-xs text-charcoal-muted dark:text-slate-300">
              <div className="flex justify-between">
                <span>Multi-AZ Redundancy:</span>
                <span className="font-mono font-bold text-status-success">us-east-1a / 1b</span>
              </div>
              <div className="flex justify-between">
                <span>Database Isolation:</span>
                <span className="font-mono font-bold text-status-success">Private Subnet</span>
              </div>
              <div className="flex justify-between">
                <span>Ingress Perimeter:</span>
                <span className="font-mono font-bold text-status-success">ALB (Target Tracking)</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
