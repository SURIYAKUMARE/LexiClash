import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  OfflineCloudSimulationState,
  CloudEc2Instance,
  CloudS3Bucket,
  CloudIamUser,
  CloudSecurityGroup
} from '../db/indexedDb';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  Server,
  Database,
  Shield,
  Layers,
  Activity,
  CreditCard,
  Plus,
  Play,
  Square,
  RefreshCw,
  Trash2,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Search,
  ExternalLink,
  ChevronRight,
  Upload,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ActionMapPanel } from '../components/actionMap/ActionMapPanel';
import { ActionExecutor } from '../actionMap/actionExecutor';

type CloudService = 'EC2' | 'S3' | 'IAM' | 'VPC' | 'CloudWatch' | 'Billing';

export const CloudConsole: React.FC = () => {
  const [activeService, setActiveService] = useState<CloudService>('EC2');
  const [simState, setSimState] = useState<OfflineCloudSimulationState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isLaunchEc2Open, setIsLaunchEc2Open] = useState(false);
  const [isCreateS3Open, setIsCreateS3Open] = useState(false);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<CloudS3Bucket | null>(null);

  // Form states
  const [newInstanceName, setNewInstanceName] = useState('web-api-node-03');
  const [newInstanceType, setNewInstanceType] = useState('t3.micro');
  const [newBucketName, setNewBucketName] = useState('skillpath-analytics-bucket');
  const [newBucketBlockPublic, setNewBucketBlockPublic] = useState(true);
  const [newUsername, setNewUsername] = useState('developer-jordan');
  const [newUserPolicy, setNewUserPolicy] = useState('AmazonEC2ReadOnlyAccess');

  const fetchCloudState = async () => {
    try {
      const state = await api.getCloudSimulation();
      setSimState(state);
      if (selectedBucket) {
        const updatedBkt = state.s3.buckets.find(b => b.id === selectedBucket.id);
        setSelectedBucket(updatedBkt || null);
      }
    } catch (err) {
      console.error('Failed to load cloud simulation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCloudState();
  }, []);

  // EC2 Actions
  const handleToggleInstanceState = async (instanceId: string, targetState: 'running' | 'stopped' | 'terminated') => {
    if (!simState) return;
    const instances = simState.ec2.instances.map(i => {
      if (i.id === instanceId) {
        return {
          ...i,
          state: targetState,
          cpuUtilization: targetState === 'running' ? 24.5 : 0
        };
      }
      return i;
    });

    const updated = {
      ...simState,
      ec2: { ...simState.ec2, instances }
    };
    await api.updateCloudSimulation(updated);
    setSimState(updated);
    ActionExecutor.executeAction(`EC2:${targetState}-instance:${instanceId}`);
  };

  const handleLaunchInstance = async () => {
    if (!simState || !newInstanceName.trim()) return;
    const id = `i-0${Math.random().toString(16).substring(2, 10)}`;
    const newInst: CloudEc2Instance = {
      id,
      name: newInstanceName.trim(),
      type: newInstanceType,
      state: 'running',
      publicIp: `54.210.${Math.floor(Math.random() * 200)}.${Math.floor(Math.random() * 250)}`,
      privateIp: `10.0.1.${Math.floor(Math.random() * 200)}`,
      securityGroupId: 'sg-web-public',
      az: 'us-east-1a',
      launchTime: new Date().toISOString(),
      cpuUtilization: 14.2
    };

    const updated = {
      ...simState,
      ec2: {
        ...simState.ec2,
        instances: [newInst, ...simState.ec2.instances]
      }
    };
    await api.updateCloudSimulation(updated);
    setSimState(updated);
    ActionExecutor.executeAction('EC2:launch-instance');
    setIsLaunchEc2Open(false);
    setNewInstanceName(`web-api-node-${Math.floor(Math.random() * 100)}`);
  };

  // S3 Actions
  const handleCreateBucket = async () => {
    if (!simState || !newBucketName.trim()) return;
    const bktName = newBucketName.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const newBkt: CloudS3Bucket = {
      id: `bkt-${Date.now()}`,
      name: bktName,
      region: 'us-east-1',
      blockPublicAccess: newBucketBlockPublic,
      isPublic: !newBucketBlockPublic,
      versioning: false,
      createdAt: new Date().toISOString(),
      objects: [
        { key: 'sample-config.json', sizeKb: 1.4, lastModified: new Date().toISOString(), storageClass: 'STANDARD' }
      ]
    };

    const updated = {
      ...simState,
      s3: {
        ...simState.s3,
        buckets: [newBkt, ...simState.s3.buckets]
      }
    };
    await api.updateCloudSimulation(updated);
    setSimState(updated);
    ActionExecutor.executeAction(`S3:create-bucket:${bktName}`);
    setIsCreateS3Open(false);
    setNewBucketName(`skillpath-bucket-${Date.now()}`);
  };

  const handleToggleBucketPublicAccess = async (bucketId: string) => {
    if (!simState) return;
    let nextBlock = true;
    const buckets = simState.s3.buckets.map(b => {
      if (b.id === bucketId) {
        nextBlock = !b.blockPublicAccess;
        return {
          ...b,
          blockPublicAccess: nextBlock,
          isPublic: !nextBlock
        };
      }
      return b;
    });

    const updated = {
      ...simState,
      s3: { ...simState.s3, buckets }
    };
    await api.updateCloudSimulation(updated);
    setSimState(updated);
    ActionExecutor.executeAction(`S3:${nextBlock ? 'block' : 'enable'}-public-access:${bucketId}`);
    if (selectedBucket && selectedBucket.id === bucketId) {
      setSelectedBucket(buckets.find(b => b.id === bucketId) || null);
    }
  };

  // IAM Actions
  const handleCreateUser = async () => {
    if (!simState || !newUsername.trim()) return;
    const uname = newUsername.trim();
    const newUser: CloudIamUser = {
      id: `usr-${Date.now()}`,
      username: uname,
      accessKeyId: `AKIA${Math.random().toString(36).substring(2, 14).toUpperCase()}`,
      policies: [newUserPolicy],
      mfaEnabled: false,
      createdAt: new Date().toISOString()
    };

    const updated = {
      ...simState,
      iam: {
        ...simState.iam,
        users: [...simState.iam.users, newUser]
      }
    };
    await api.updateCloudSimulation(updated);
    setSimState(updated);
    ActionExecutor.executeAction(`IAM:create-user:${uname}`);
    setIsCreateUserOpen(false);
    setNewUsername(`developer-${Date.now().toString().slice(-4)}`);
  };

  const handleToggleUserMfa = async (userId: string) => {
    if (!simState) return;
    let mfaState = true;
    const users = simState.iam.users.map(u => {
      if (u.id === userId) {
        mfaState = !u.mfaEnabled;
        return { ...u, mfaEnabled: mfaState };
      }
      return u;
    });
    const updated = {
      ...simState,
      iam: { ...simState.iam, users }
    };
    await api.updateCloudSimulation(updated);
    setSimState(updated);
    ActionExecutor.executeAction(`IAM:${mfaState ? 'enable' : 'disable'}-mfa:${userId}`);
  };

  if (isLoading || !simState) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-charcoal-muted dark:text-slate-400 font-medium font-mono">
            Initializing Safe Simulated Cloud Environment...
          </p>
        </div>
      </div>
    );
  }

  const servicesList = [
    { id: 'EC2' as CloudService, name: 'EC2', label: 'Virtual Servers', icon: Server, badge: `${simState.ec2.instances.filter(i => i.state === 'running').length} Running` },
    { id: 'S3' as CloudService, name: 'S3', label: 'Scalable Storage', icon: Database, badge: `${simState.s3.buckets.length} Buckets` },
    { id: 'IAM' as CloudService, name: 'IAM', label: 'Access Management', icon: Shield, badge: `${simState.iam.users.length} Users` },
    { id: 'VPC' as CloudService, name: 'VPC', label: 'Isolated Cloud Network', icon: Layers, badge: `${simState.vpc.subnets.length} Subnets` },
    { id: 'CloudWatch' as CloudService, name: 'CloudWatch', label: 'Metrics & Logs', icon: Activity, badge: `${simState.cloudWatch.alarms.length} Alarms` },
    { id: 'Billing' as CloudService, name: 'Billing', label: 'Cost Management', icon: CreditCard, badge: `$${simState.billing.currentMonthSpend.toFixed(2)}` }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Educational Banner Notice */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-amber-900 dark:text-amber-200">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Safe Educational Cloud Simulation:</strong> All AWS services and state mutations run in an offline-first sandbox stored in IndexedDB. Zero external AWS credentials or cloud billing are incurred.
          </span>
        </div>
        <Link to="/security-inspector" className="text-brand-600 dark:text-brand-400 font-semibold hover:underline flex items-center gap-1 shrink-0">
          Run Security Audit <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Cloud Console Top Navigation Bar */}
      <div className="bg-[#1A1C1E] text-white rounded-xl p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-[#FF9900] flex items-center justify-center font-bold text-xs text-slate-900">
            AWS
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-white">Management Console</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                Educational Sim
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Region: us-east-1 (N. Virginia)</span>
          </div>
        </div>

        {/* Global Cloud Search / Navigation Links */}
        <div className="flex items-center gap-2">
          <Link to="/architecture">
            <Button size="sm" variant="secondary" className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 text-xs gap-1.5">
              <Layers className="w-3.5 h-3.5 text-brand-400" />
              Architecture Visualizer
            </Button>
          </Link>
          <Link to="/terminal">
            <Button size="sm" variant="secondary" className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 text-xs gap-1.5 font-mono">
              $ CLI Terminal
            </Button>
          </Link>
        </div>
      </div>

      {/* Service Switcher Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {servicesList.map(srv => {
          const isActive = activeService === srv.id;
          const Icon = srv.icon;
          return (
            <button
              key={srv.id}
              onClick={() => {
                setActiveService(srv.id);
                setSelectedBucket(null);
                ActionExecutor.executeAction(`NAV:${srv.id.toLowerCase()}`).catch(console.error);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                isActive
                  ? 'border-brand-600 bg-white dark:bg-surface-dark-card shadow-xs ring-1 ring-brand-600'
                  : 'border-surface-border dark:border-surface-dark-border bg-surface-subtle dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-charcoal-subtle'}`} />
                <span className="text-[10px] font-mono text-charcoal-subtle dark:text-slate-400">
                  {srv.badge}
                </span>
              </div>
              <div className="text-xs font-bold text-charcoal dark:text-slate-100">{srv.name}</div>
              <div className="text-[10px] text-charcoal-muted dark:text-slate-400 truncate">{srv.label}</div>
            </button>
          );
        })}
      </div>

      {/* ActionMap Goal Validation Engine & Quest Verifier */}
      <ActionMapPanel
        onNavigateService={(svc) => {
          const lower = svc.toLowerCase();
          if (lower === 's3') {
            setActiveService('S3');
            setSelectedBucket(null);
          } else if (lower === 'ec2') {
            setActiveService('EC2');
          } else if (lower === 'iam') {
            setActiveService('IAM');
          } else if (lower === 'vpc') {
            setActiveService('VPC');
          } else if (lower === 'cw' || lower === 'cloudwatch') {
            setActiveService('CloudWatch');
          } else if (lower === 'billing') {
            setActiveService('Billing');
          }
        }}
      />

      {/* ========================================================= */}
      {/* SERVICE 1: EC2 COMPUTE                                    */}
      {/* ========================================================= */}
      {activeService === 'EC2' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-charcoal dark:text-slate-100">EC2 Instances</h2>
              <p className="text-xs text-charcoal-muted dark:text-slate-400">
                Manage virtual compute instances, lifecycle states, and attached security perimeters.
              </p>
            </div>
            <Button size="sm" variant="primary" className="gap-1.5 text-xs" onClick={() => setIsLaunchEc2Open(true)}>
              <Plus className="w-3.5 h-3.5" />
              Launch Instance
            </Button>
          </div>

          <div className="bg-white dark:bg-surface-dark-card border border-surface-border dark:border-surface-dark-border rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-subtle dark:bg-slate-800/80 border-b border-surface-border dark:border-surface-dark-border text-charcoal-subtle dark:text-slate-400 font-mono text-[11px]">
                    <th className="p-3">Instance ID / Name</th>
                    <th className="p-3">State</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Public IP</th>
                    <th className="p-3">Private IP</th>
                    <th className="p-3">Security Group</th>
                    <th className="p-3">AZ</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border dark:divide-surface-dark-border">
                  {simState.ec2.instances.map(inst => (
                    <tr key={inst.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 font-mono text-[11px]">
                      <td className="p-3 font-medium text-charcoal dark:text-slate-200">
                        <div>{inst.name}</div>
                        <span className="text-[10px] text-charcoal-subtle dark:text-slate-400">{inst.id}</span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                            inst.state === 'running'
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : inst.state === 'stopped'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${inst.state === 'running' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                          {inst.state}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-charcoal dark:text-slate-300">{inst.type}</td>
                      <td className="p-3 text-charcoal-muted dark:text-slate-400">{inst.publicIp || '-'}</td>
                      <td className="p-3 text-charcoal-muted dark:text-slate-400">{inst.privateIp}</td>
                      <td className="p-3">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-charcoal dark:text-slate-300">
                          {inst.securityGroupId}
                        </span>
                      </td>
                      <td className="p-3 text-charcoal-subtle dark:text-slate-400">{inst.az}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {inst.state === 'running' ? (
                            <button
                              onClick={() => handleToggleInstanceState(inst.id, 'stopped')}
                              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-charcoal dark:text-white text-[10px] font-sans font-medium flex items-center gap-1"
                              title="Stop Instance"
                            >
                              <Square className="w-3 h-3 text-amber-600" /> Stop
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleInstanceState(inst.id, 'running')}
                              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-charcoal dark:text-white text-[10px] font-sans font-medium flex items-center gap-1"
                              title="Start Instance"
                            >
                              <Play className="w-3 h-3 text-emerald-600" /> Start
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleInstanceState(inst.id, 'terminated')}
                            className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Terminate Instance"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Security Groups Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Card>
              <h3 className="text-xs font-bold text-charcoal dark:text-slate-100 uppercase tracking-wider mb-2">
                Security Groups (Inbound Rules)
              </h3>
              <div className="space-y-3">
                {simState.ec2.securityGroups.map(sg => (
                  <div key={sg.id} className="p-3 rounded-lg border border-surface-border dark:border-surface-dark-border text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-charcoal dark:text-white">{sg.name}</span>
                      <span className="font-mono text-[10px] text-charcoal-subtle">{sg.id}</span>
                    </div>
                    <p className="text-[11px] text-charcoal-muted dark:text-slate-400 mb-2">{sg.description}</p>
                    <div className="space-y-1 font-mono text-[10px]">
                      {sg.inboundRules.map(r => (
                        <div key={r.id} className="flex justify-between bg-surface-subtle dark:bg-slate-800 px-2 py-1 rounded">
                          <span>Port {r.port} ({r.protocol})</span>
                          <span className={r.source === '0.0.0.0/0' && r.port === 22 ? 'text-rose-600 font-bold' : 'text-charcoal-muted'}>
                            Source: {r.source}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-xs font-bold text-charcoal dark:text-slate-100 uppercase tracking-wider mb-2">
                Application Load Balancers & Auto Scaling
              </h3>
              <div className="space-y-3 text-xs">
                {simState.ec2.loadBalancers.map(alb => (
                  <div key={alb.id} className="p-3 rounded-lg border border-surface-border dark:border-surface-dark-border">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-charcoal dark:text-white">{alb.name}</span>
                      <Badge variant="success" size="sm">{alb.state}</Badge>
                    </div>
                    <div className="font-mono text-[10px] text-charcoal-subtle truncate mt-1">
                      DNS: {alb.dnsName}
                    </div>
                    <div className="mt-2 text-[11px] text-charcoal-muted">
                      Healthy Target Instances: <strong>{alb.targetInstanceIds.length}</strong>
                    </div>
                  </div>
                ))}

                {simState.ec2.autoScalingGroups.map(asg => (
                  <div key={asg.id} className="p-3 rounded-lg border border-surface-border dark:border-surface-dark-border">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-charcoal dark:text-white">{asg.name}</span>
                      <span className="text-[10px] font-mono text-brand-600 font-bold">ASG Cluster</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2 font-mono text-[11px] text-center">
                      <div className="p-1.5 bg-surface-subtle dark:bg-slate-800 rounded">
                        <span className="text-[9px] text-charcoal-subtle block">MIN</span>
                        <strong>{asg.minSize}</strong>
                      </div>
                      <div className="p-1.5 bg-surface-subtle dark:bg-slate-800 rounded">
                        <span className="text-[9px] text-charcoal-subtle block">DESIRED</span>
                        <strong>{asg.desiredCapacity}</strong>
                      </div>
                      <div className="p-1.5 bg-surface-subtle dark:bg-slate-800 rounded">
                        <span className="text-[9px] text-charcoal-subtle block">MAX</span>
                        <strong>{asg.maxSize}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SERVICE 2: S3 OBJECT STORAGE                              */}
      {/* ========================================================= */}
      {activeService === 'S3' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-charcoal dark:text-slate-100">S3 Buckets</h2>
              <p className="text-xs text-charcoal-muted dark:text-slate-400">
                Create buckets, manage public access block perimeters, and inspect stored objects.
              </p>
            </div>
            <Button size="sm" variant="primary" className="gap-1.5 text-xs" onClick={() => setIsCreateS3Open(true)}>
              <Plus className="w-3.5 h-3.5" />
              Create Bucket
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {simState.s3.buckets.map(bkt => (
              <Card
                key={bkt.id}
                className={`cursor-pointer transition-all ${
                  selectedBucket?.id === bkt.id ? 'ring-2 ring-brand-600' : ''
                }`}
                onClick={() => setSelectedBucket(bkt)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-brand-600" />
                    <span className="font-bold text-xs text-charcoal dark:text-white truncate">
                      {bkt.name}
                    </span>
                  </div>
                  {bkt.blockPublicAccess ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 flex items-center gap-1 shrink-0">
                      <Lock className="w-2.5 h-2.5" /> Private
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 flex items-center gap-1 shrink-0 animate-pulse">
                      <Unlock className="w-2.5 h-2.5" /> Public
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-[11px] text-charcoal-muted dark:text-slate-400 font-mono">
                  <div>Region: {bkt.region}</div>
                  <div>Objects: {bkt.objects.length} files</div>
                  <div>Created: {bkt.createdAt.substring(0, 10)}</div>
                </div>

                <div className="mt-3 pt-2 border-t border-surface-border dark:border-surface-dark-border flex items-center justify-between">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleBucketPublicAccess(bkt.id);
                    }}
                    className="text-[11px] text-brand-600 hover:underline font-medium"
                  >
                    {bkt.blockPublicAccess ? 'Enable Public Access' : 'Block All Public Access'}
                  </button>
                  <span className="text-[10px] text-charcoal-subtle">Click to inspect</span>
                </div>
              </Card>
            ))}
          </div>

          {/* Bucket Object Explorer Drawer */}
          {selectedBucket && (
            <Card className="mt-4 border-brand-500">
              <div className="flex items-center justify-between pb-3 border-b border-surface-border dark:border-surface-dark-border">
                <div>
                  <span className="text-xs font-mono text-charcoal-subtle">s3://{selectedBucket.name}</span>
                  <h3 className="text-sm font-bold text-charcoal dark:text-slate-100">
                    Object Explorer ({selectedBucket.objects.length} items)
                  </h3>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-xs gap-1.5 font-mono"
                  onClick={() => {
                    const mockFileName = `upload-${Date.now().toString().slice(-4)}.log`;
                    selectedBucket.objects.push({
                      key: mockFileName,
                      sizeKb: 12.5,
                      lastModified: new Date().toISOString(),
                      storageClass: 'STANDARD'
                    });
                    api.updateCloudSimulation(simState).then(() => fetchCloudState());
                  }}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Mock Upload Object
                </Button>
              </div>

              <div className="divide-y divide-surface-border dark:divide-surface-dark-border mt-2 font-mono text-xs">
                {selectedBucket.objects.map((obj, i) => (
                  <div key={i} className="py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded">
                    <div>
                      <span className="font-semibold text-charcoal dark:text-white">{obj.key}</span>
                      <span className="text-[10px] text-charcoal-subtle block">Class: {obj.storageClass}</span>
                    </div>
                    <div className="text-right text-[11px]">
                      <span className="text-charcoal-muted">{obj.sizeKb} KB</span>
                      <span className="text-[10px] text-charcoal-subtle block">{obj.lastModified.substring(0, 10)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SERVICE 3: IAM IDENTITY                                   */}
      {/* ========================================================= */}
      {activeService === 'IAM' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-charcoal dark:text-slate-100">IAM Users & Policies</h2>
              <p className="text-xs text-charcoal-muted dark:text-slate-400">
                Manage access keys, enforce MFA credentials, and audit least-privilege policy attachments.
              </p>
            </div>
            <Button size="sm" variant="primary" className="gap-1.5 text-xs" onClick={() => setIsCreateUserOpen(true)}>
              <Plus className="w-3.5 h-3.5" />
              Add User
            </Button>
          </div>

          <div className="bg-white dark:bg-surface-dark-card border border-surface-border dark:border-surface-dark-border rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono text-[11px]">
                <thead>
                  <tr className="bg-surface-subtle dark:bg-slate-800/80 border-b border-surface-border dark:border-surface-dark-border text-charcoal-subtle dark:text-slate-400">
                    <th className="p-3">User Name</th>
                    <th className="p-3">Access Key ID</th>
                    <th className="p-3">Attached Policies</th>
                    <th className="p-3">MFA Status</th>
                    <th className="p-3">Created</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border dark:divide-surface-dark-border">
                  {simState.iam.users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-3 font-bold text-charcoal dark:text-white">{u.username}</td>
                      <td className="p-3 text-charcoal-muted">{u.accessKeyId}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {u.policies.map(p => (
                            <span
                              key={p}
                              className={`px-1.5 py-0.5 rounded text-[10px] ${
                                p === 'AdministratorAccess'
                                  ? 'bg-rose-50 text-rose-700 font-bold'
                                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        {u.mfaEnabled ? (
                          <span className="text-status-success font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Enabled
                          </span>
                        ) : (
                          <span className="text-amber-600 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Disabled
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-charcoal-subtle">{u.createdAt.substring(0, 10)}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleToggleUserMfa(u.id)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[10px] text-charcoal dark:text-slate-200"
                        >
                          {u.mfaEnabled ? 'Disable MFA' : 'Enable MFA'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SERVICE 4: VPC NETWORKING                                 */}
      {/* ========================================================= */}
      {activeService === 'VPC' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-charcoal dark:text-slate-100">Virtual Private Cloud (VPC)</h2>
            <p className="text-xs text-charcoal-muted dark:text-slate-400">
              Isolated network topography, public and private subnets, and route table definitions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <h3 className="text-xs font-bold text-charcoal-subtle uppercase mb-2">VPC CIDR Block</h3>
              <div className="font-mono text-base font-bold text-charcoal dark:text-white">
                {simState.vpc.vpcs[0]?.cidrBlock || '10.0.0.0/16'}
              </div>
              <span className="text-xs text-charcoal-muted mt-1 block">
                Name: {simState.vpc.vpcs[0]?.name || 'vpc-main-prod'}
              </span>
            </Card>

            <Card>
              <h3 className="text-xs font-bold text-charcoal-subtle uppercase mb-2">Internet Gateway</h3>
              <div className="font-mono text-xs font-bold text-status-success flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Attached (igw-prod-main)
              </div>
              <span className="text-xs text-charcoal-muted mt-1 block">
                Handles egress routing for public subnets
              </span>
            </Card>

            <Card>
              <h3 className="text-xs font-bold text-charcoal-subtle uppercase mb-2">NAT Gateway</h3>
              <div className="font-mono text-xs font-bold text-brand-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Available (52.4.112.98)
              </div>
              <span className="text-xs text-charcoal-muted mt-1 block">
                Enables secure outbound access for private subnets
              </span>
            </Card>
          </div>

          {/* Subnet List */}
          <Card>
            <h3 className="text-xs font-bold text-charcoal dark:text-slate-100 uppercase tracking-wider mb-3">
              Subnet Partitioning
            </h3>
            <div className="divide-y divide-surface-border dark:divide-surface-dark-border font-mono text-xs">
              {simState.vpc.subnets.map(sub => (
                <div key={sub.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-charcoal dark:text-white">{sub.name}</span>
                    <span className="text-[10px] text-charcoal-subtle block">AZ: {sub.az}</span>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <span className="font-mono text-charcoal-muted">{sub.cidrBlock}</span>
                    <Badge variant={sub.isPublic ? 'brand' : 'neutral'} size="sm">
                      {sub.isPublic ? 'Public' : 'Private'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* SERVICE 5: CLOUDWATCH                                     */}
      {/* ========================================================= */}
      {activeService === 'CloudWatch' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-charcoal dark:text-slate-100">CloudWatch Telemetry & Logs</h2>
            <p className="text-xs text-charcoal-muted dark:text-slate-400">
              Operational metrics, alarm conditions, and unified log group streams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {simState.cloudWatch.alarms.map(alm => (
              <Card key={alm.id} className="flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-xs text-charcoal dark:text-white">{alm.name}</span>
                    <Badge variant={alm.state === 'OK' ? 'success' : 'danger'} size="sm">
                      {alm.state}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-charcoal-muted font-mono mt-1">
                    Metric: {alm.metricName} {alm.comparison === 'GreaterThanThreshold' ? '>' : '<'} {alm.threshold} {alm.unit}
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-surface-border dark:border-surface-dark-border text-[10px] text-charcoal-subtle">
                  State evaluated continuously every 60s
                </div>
              </Card>
            ))}
          </div>

          {/* Log Stream Viewer */}
          <Card>
            <h3 className="text-xs font-bold text-charcoal dark:text-slate-100 uppercase tracking-wider mb-2">
              Live Log Streams (/aws/ec2/app-server)
            </h3>
            <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] leading-relaxed space-y-1.5 overflow-x-auto border border-slate-800">
              {simState.cloudWatch.logs.map(log => (
                <div key={log.id} className="flex gap-2">
                  <span className="text-slate-500">[{log.timestamp.substring(11, 19)}]</span>
                  <span className={log.level === 'WARN' ? 'text-amber-400 font-bold' : log.level === 'ERROR' ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                    [{log.level}]
                  </span>
                  <span>{log.message}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* SERVICE 6: BILLING                                        */}
      {/* ========================================================= */}
      {activeService === 'Billing' && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-charcoal dark:text-slate-100">AWS Billing & Cost Management</h2>
            <p className="text-xs text-charcoal-muted dark:text-slate-400">
              Simulated expenses, budget burn rates, and architectural cost optimization tips.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <h3 className="text-xs font-bold text-charcoal-subtle uppercase mb-2">Current Month Spend</h3>
              <div className="text-3xl font-extrabold text-charcoal dark:text-white font-mono">
                ${simState.billing.currentMonthSpend.toFixed(2)}
              </div>
              <p className="text-xs text-charcoal-muted mt-1">
                Forecasted month-end total: ${(simState.billing.currentMonthSpend * 1.15).toFixed(2)} / Budget limit: ${simState.billing.budgetLimit.toFixed(2)}
              </p>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
                <div
                  className="h-full bg-brand-600 rounded-full"
                  style={{ width: `${(simState.billing.currentMonthSpend / simState.billing.budgetLimit) * 100}%` }}
                />
              </div>
            </Card>

            <Card>
              <h3 className="text-xs font-bold text-charcoal-subtle uppercase mb-2">Cost Optimization Advisor</h3>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200">
                  <strong>t3.micro Right-Sizing:</strong> Save ~$14/mo by transitioning idle bastion-jump-host to t4g.nano.
                </div>
                <div className="p-2.5 rounded bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 text-blue-900 dark:text-blue-200">
                  <strong>S3 Intelligent-Tiering:</strong> Move archival logs in skillpath-cloudtrail-audit-vault to Glacier Flexible Archive for 68% savings.
                </div>
              </div>
            </Card>
          </div>

          {/* Service Breakdown */}
          <Card>
            <h3 className="text-xs font-bold text-charcoal dark:text-slate-100 uppercase tracking-wider mb-3">
              Cost Allocation by Service
            </h3>
            <div className="space-y-3">
              {simState.billing.serviceBreakdown.map(srv => (
                <div key={srv.service}>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span className="text-charcoal dark:text-slate-200">{srv.service}</span>
                    <span className="font-mono text-charcoal dark:text-white font-bold">${srv.amount.toFixed(2)} ({srv.percentage}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-600 rounded-full" style={{ width: `${srv.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODALS: LAUNCH EC2 / CREATE S3 / ADD USER                 */}
      {/* ========================================================= */}
      {isLaunchEc2Open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-dark-card border border-surface-border dark:border-surface-dark-border rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-charcoal dark:text-white">Launch Simulated EC2 Instance</h3>
            <div>
              <label className="text-xs font-medium text-charcoal-muted block mb-1">Instance Name</label>
              <input
                type="text"
                value={newInstanceName}
                onChange={e => setNewInstanceName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-surface-border dark:border-surface-dark-border text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-charcoal-muted block mb-1">Instance Type</label>
              <select
                value={newInstanceType}
                onChange={e => setNewInstanceType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-surface-border dark:border-surface-dark-border text-xs font-mono"
              >
                <option value="t3.nano">t3.nano (0.5 GiB RAM, 2 vCPU)</option>
                <option value="t3.micro">t3.micro (1.0 GiB RAM, 2 vCPU)</option>
                <option value="c5.large">c5.large (4.0 GiB RAM, 2 vCPU)</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="secondary" onClick={() => setIsLaunchEc2Open(false)}>Cancel</Button>
              <Button size="sm" variant="primary" onClick={handleLaunchInstance}>Launch</Button>
            </div>
          </div>
        </div>
      )}

      {isCreateS3Open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-dark-card border border-surface-border dark:border-surface-dark-border rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-charcoal dark:text-white">Create Simulated S3 Bucket</h3>
            <div>
              <label className="text-xs font-medium text-charcoal-muted block mb-1">Bucket Name (Globally Unique)</label>
              <input
                type="text"
                value={newBucketName}
                onChange={e => setNewBucketName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-surface-border dark:border-surface-dark-border text-xs font-mono"
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="blockPublic"
                checked={newBucketBlockPublic}
                onChange={e => setNewBucketBlockPublic(e.target.checked)}
                className="rounded text-brand-600"
              />
              <label htmlFor="blockPublic" className="text-xs text-charcoal dark:text-slate-200">
                Block all public access (Recommended)
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="secondary" onClick={() => setIsCreateS3Open(false)}>Cancel</Button>
              <Button size="sm" variant="primary" onClick={handleCreateBucket}>Create</Button>
            </div>
          </div>
        </div>
      )}

      {isCreateUserOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-dark-card border border-surface-border dark:border-surface-dark-border rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-charcoal dark:text-white">Add IAM User</h3>
            <div>
              <label className="text-xs font-medium text-charcoal-muted block mb-1">User Name</label>
              <input
                type="text"
                value={newUsername}
                onChange={e => setNewUsername(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-surface-border dark:border-surface-dark-border text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-charcoal-muted block mb-1">Attach Policy</label>
              <select
                value={newUserPolicy}
                onChange={e => setNewUserPolicy(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-surface-border dark:border-surface-dark-border text-xs font-mono"
              >
                <option value="AmazonEC2ReadOnlyAccess">AmazonEC2ReadOnlyAccess</option>
                <option value="AmazonS3ReadOnlyAccess">AmazonS3ReadOnlyAccess</option>
                <option value="AdministratorAccess">AdministratorAccess (Over-permissive!)</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="secondary" onClick={() => setIsCreateUserOpen(false)}>Cancel</Button>
              <Button size="sm" variant="primary" onClick={handleCreateUser}>Create User</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
