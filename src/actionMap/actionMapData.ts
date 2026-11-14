import { ActionMapGoal } from './types';

export const ACTION_MAP_WHITELIST: Record<string, string[]> = {
  NAV: [
    'NAV:ec2',
    'NAV:s3',
    'NAV:iam',
    'NAV:vpc',
    'NAV:cloudwatch',
    'NAV:billing',
    'NAV:architecture',
    'NAV:terminal',
    'NAV:war-room',
    'NAV:security-inspector'
  ],
  EC2: [
    'EC2:launch-instance',
    'EC2:start-instance:{id}',
    'EC2:stop-instance:{id}',
    'EC2:terminate-instance:{id}',
    'EC2:reboot-instance:{id}',
    'EC2:scale-asg:{desired}'
  ],
  S3: [
    'S3:create-bucket:{name}',
    'S3:block-public-access:{id}',
    'S3:enable-public-access:{id}',
    'S3:upload-object:{id}:{key}',
    'S3:delete-object:{id}:{key}'
  ],
  IAM: [
    'IAM:create-user:{username}',
    'IAM:enable-mfa:{id}',
    'IAM:disable-mfa:{id}',
    'IAM:attach-policy:{id}:{policy}',
    'IAM:detach-policy:{id}:{policy}'
  ],
  VPC: [
    'VPC:create-vpc:{cidr}',
    'VPC:create-subnet:{vpcId}:{cidr}',
    'VPC:attach-igw:{vpcId}'
  ],
  CW: [
    'CW:create-alarm:{metric}:{threshold}',
    'CW:inspect-logs:{group}',
    'CW:clear-alarms'
  ],
  SEC: [
    'SEC:remediate-mfa-root',
    'SEC:remediate-s3-public',
    'SEC:remediate-ssh-open',
    'SEC:remediate-iam-wildcard',
    'SEC:run-compliance-scan'
  ],
  WAR_ROOM: [
    'WAR_ROOM:triage-incident:{code}',
    'WAR_ROOM:apply-mitigation:{incidentId}:{actionId}'
  ]
};

export const SEED_ACTION_GOALS: ActionMapGoal[] = [
  {
    id: 'goal-s3-harden',
    title: 'Harden S3 Object Perimeter & Verify CIS Compliance',
    description: 'Navigate to S3, block all anonymous public access on the customer exports bucket, and execute a security compliance scan.',
    category: 'Security',
    targetSequence: [
      'NAV:s3',
      'S3:block-public-access:bkt-customer-data',
      'SEC:run-compliance-scan'
    ],
    completedSteps: [],
    isCompleted: false,
    xpReward: 120
  },
  {
    id: 'goal-iam-mfa',
    title: 'Enforce MFA Authentication on Developer Credentials',
    description: 'Locate developer-alex in IAM User Management and enable Multi-Factor Authentication to satisfy CIS Benchmark 1.1.',
    category: 'Security',
    targetSequence: [
      'NAV:iam',
      'IAM:enable-mfa:usr-102',
      'SEC:run-compliance-scan'
    ],
    completedSteps: [],
    isCompleted: false,
    xpReward: 100
  },
  {
    id: 'goal-ec2-resilience',
    title: 'Deploy High-Availability EC2 Compute Node',
    description: 'Launch a secondary t3.micro web node to ensure multi-node load balanced distribution.',
    category: 'Compute',
    targetSequence: [
      'NAV:ec2',
      'EC2:launch-instance'
    ],
    completedSteps: [],
    isCompleted: false,
    xpReward: 90
  },
  {
    id: 'goal-sre-remediation',
    title: 'Resolve P1 Outage in Incident War Room',
    description: 'Triage incident INC-101 and apply the verified mitigation runbook.',
    category: 'SRE',
    targetSequence: [
      'NAV:war-room',
      'WAR_ROOM:triage-incident:INC-101',
      'WAR_ROOM:apply-mitigation:inc-101:act-101-a'
    ],
    completedSteps: [],
    isCompleted: false,
    xpReward: 150
  }
];
