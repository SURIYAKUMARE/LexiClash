import { OfflineCloudSimulationState } from '../db/indexedDb';
import { AgentReasoningTrace, ArchitectureAuditResult } from './types';

export class CloudArchitectureAgent {
  public static analyzeArchitecture(simState: OfflineCloudSimulationState): ArchitectureAuditResult {
    const traces: AgentReasoningTrace[] = [];
    const spofs: string[] = [];
    const recommendations: string[] = [];

    let step = 1;

    // 1. Audit VPC Subnets & Multi-AZ
    const subnets = simState.vpc.subnets;
    const azSet = new Set(subnets.map(s => s.az));

    traces.push({
      step: step++,
      agentName: 'Cloud Architecture Agent',
      thought: `Auditing network partition across Availability Zones. Detected ${azSet.size} unique AZs (${Array.from(azSet).join(', ')}).`,
      action: 'INSPECT_VPC_TOPOLOGY',
      observation: azSet.size >= 2
        ? 'Redundant Multi-AZ subnets configured across us-east-1a and us-east-1b.'
        : 'Single-AZ vulnerability: Failure in one datacenter will disrupt all compute.',
      timestamp: new Date().toISOString()
    });

    if (azSet.size < 2) {
      spofs.push('Single Availability Zone: Compute lack multi-AZ geographic redundancy.');
      recommendations.push('Provision secondary public and private subnets in us-east-1b.');
    }

    // 2. Audit Load Balancer & Targets
    const albs = simState.ec2.loadBalancers;
    const runningInstances = simState.ec2.instances.filter(i => i.state === 'running');

    traces.push({
      step: step++,
      agentName: 'Cloud Architecture Agent',
      thought: `Evaluating ingress traffic distribution. Found ${albs.length} ALBs distributing to ${runningInstances.length} running EC2 instances.`,
      action: 'INSPECT_LOAD_BALANCER_TARGETS',
      observation: runningInstances.length >= 2
        ? 'Traffic distributed across active cluster nodes.'
        : 'Single compute node active: Instance crash will cause complete outage.',
      timestamp: new Date().toISOString()
    });

    if (runningInstances.length < 2) {
      spofs.push('Compute layer has fewer than 2 active target instances.');
      recommendations.push('Increase Auto Scaling Group minimum capacity to at least 2 instances.');
    }

    // 3. Audit Storage Public Access
    const publicBuckets = simState.s3.buckets.filter(b => b.isPublic || !b.blockPublicAccess);
    traces.push({
      step: step++,
      agentName: 'Cloud Architecture Agent',
      thought: `Auditing S3 storage perimeter across ${simState.s3.buckets.length} buckets.`,
      action: 'AUDIT_S3_PERIMETER',
      observation: publicBuckets.length > 0
        ? `ALERT: Found ${publicBuckets.length} bucket(s) with Block Public Access disabled.`
        : 'All S3 storage buckets enforce strict private Block Public Access.',
      timestamp: new Date().toISOString()
    });

    if (publicBuckets.length > 0) {
      spofs.push(`Public S3 Bucket Exposure: ${publicBuckets.map(b => b.name).join(', ')}`);
      recommendations.push('Enable S3 Block Public Access on all non-static web storage buckets.');
    }

    // 4. Ingress Security Groups
    const openSsh = simState.ec2.securityGroups.some(sg =>
      sg.inboundRules.some(r => r.port === 22 && r.source === '0.0.0.0/0')
    );

    traces.push({
      step: step++,
      agentName: 'Cloud Architecture Agent',
      thought: 'Auditing Security Group ingress perimeter for administrative ports (SSH 22 / RDP 3389).',
      action: 'CHECK_SECURITY_GROUPS',
      observation: openSsh
        ? 'Insecure configuration: Port 22 SSH open to entire internet (0.0.0.0/0).'
        : 'Administrative ports properly scoped or restricted to private CIDR blocks.',
      timestamp: new Date().toISOString()
    });

    if (openSsh) {
      spofs.push('Security Group sg-web-public permits unrestricted SSH from 0.0.0.0/0.');
      recommendations.push('Restrict SSH access strictly to bastion host or corporate VPN CIDR.');
    }

    // Scoring
    let healthScore = 95;
    if (azSet.size < 2) healthScore -= 20;
    if (runningInstances.length < 2) healthScore -= 25;
    if (publicBuckets.length > 0) healthScore -= 25;
    if (openSsh) healthScore -= 15;
    healthScore = Math.max(20, Math.min(100, healthScore));

    const haStatus = healthScore >= 85
      ? 'High Availability Multi-AZ'
      : healthScore >= 60
        ? 'Degraded'
        : 'Single AZ Risk';

    return {
      architectureHealthScore: healthScore,
      haStatus,
      singlePointsOfFailure: spofs,
      securityPerimeterScore: openSsh || publicBuckets.length > 0 ? 55 : 95,
      recommendations,
      reasoningTraces: traces
    };
  }
}
