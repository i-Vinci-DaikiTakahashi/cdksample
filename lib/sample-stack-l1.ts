import { Construct } from 'constructs';
import { Stack, StackProps, aws_ec2 as ec2 } from 'aws-cdk-lib';
import { GenerateResourceName } from './util/resourceNameUtil';
import {
  CfnDBCluster,
  CfnDBClusterParameterGroup,
  CfnDBInstance,
  CfnDBSubnetGroup,
  PostgresEngineVersion,
} from 'aws-cdk-lib/aws-rds';

interface SampleStackProps extends StackProps {
  env: {
    account: string;
    region: string;
  };
  envName: string;
  systemName: string;
}

export class SampleStackL1 extends Stack {
  constructor(scope: Construct, id: string, props: SampleStackProps) {
    super(scope, id, props);

    const generateResourceName = GenerateResourceName(
      props.systemName,
      props.envName
    );

    const vpc = new ec2.CfnVPC(this, 'Vpc', {
      cidrBlock: '10.33.0.0/16',
      enableDnsHostnames: false,
      enableDnsSupport: false,
      tags: [{ key: 'Name', value: generateResourceName('vpc') }],
    });

    const subnetPrivate1a = new ec2.CfnSubnet(this, 'SubnetPrivate1a', {
      cidrBlock: '10.33.11.0/24',
      vpcId: vpc.ref,
      availabilityZone: 'ap-northeast-1a',
      tags: [{ key: 'Name', value: generateResourceName('subnet-private-1a') }],
    });

    const subnetApp1a = new ec2.CfnSubnet(this, 'SubnetApp1a', {
      cidrBlock: '10.33.21.0/24',
      vpcId: vpc.ref,
      availabilityZone: 'ap-northeast-1a',
      tags: [{ key: 'Name', value: generateResourceName('subnet-app-1a') }],
    });

    const subnetDb1a = new ec2.CfnSubnet(this, 'SubnetDb1a', {
      cidrBlock: '10.33.31.0/24',
      vpcId: vpc.ref,
      availabilityZone: 'ap-northeast-1a',
      tags: [{ key: 'Name', value: generateResourceName('subnet-db-1a') }],
    });

    const subnetDb1c = new ec2.CfnSubnet(this, 'SubnetDb1c', {
      cidrBlock: '10.33.32.0/24',
      vpcId: vpc.ref,
      availabilityZone: 'ap-northeast-1c',
      tags: [{ key: 'Name', value: generateResourceName('subnet-db-1c') }],
    });

    const routeTablePrivate1a = new ec2.CfnRouteTable(
      this,
      'RouteTablePrivate1a',
      {
        vpcId: vpc.ref,
        tags: [
          { key: 'Name', value: generateResourceName('routetable-private-1a') },
        ],
      }
    );

    const routeTableApp1a = new ec2.CfnRouteTable(this, 'RouteTableApp1a', {
      vpcId: vpc.ref,
      tags: [{ key: 'Name', value: generateResourceName('routetable-app-1a') }],
    });

    const routeTableDb1a = new ec2.CfnRouteTable(this, 'RouteTableDb1a', {
      vpcId: vpc.ref,
      tags: [{ key: 'Name', value: generateResourceName('routetable-db-1a') }],
    });

    const routeTableDb1c = new ec2.CfnRouteTable(this, 'RouteTableDb1c', {
      vpcId: vpc.ref,
      tags: [{ key: 'Name', value: generateResourceName('routetable-db-1c') }],
    });

    const securityGroupPrivate1a = new ec2.CfnSecurityGroup(
      this,
      'SecurityGroupPrivate1a',
      {
        groupDescription: 'for Private',
        groupName: generateResourceName('securitygroup-private-1a'),
        vpcId: vpc.ref,
        securityGroupIngress: [
          {
            ipProtocol: 'tcp',
            fromPort: 443,
            toPort: 443,
          },
        ],
        tags: [
          {
            key: 'Name',
            value: generateResourceName('securitygroup-private-1a'),
          },
        ],
      }
    );

    const securityGroupApp1a = new ec2.CfnSecurityGroup(
      this,
      'SecurityGroupApp1a',
      {
        groupDescription: 'for Application',
        groupName: generateResourceName('securitygroup-app-1a'),
        vpcId: vpc.ref,
        securityGroupIngress: [
          {
            ipProtocol: 'tcp',
            fromPort: 443,
            toPort: 443,
            sourceSecurityGroupId: securityGroupPrivate1a.attrGroupId,
          },
        ],
        tags: [
          { key: 'Name', value: generateResourceName('securitygroup-app-1a') },
        ],
      }
    );

    const securityGroupDb = new ec2.CfnSecurityGroup(this, 'SecurityGroupDb', {
      groupDescription: 'for RDS',
      groupName: generateResourceName('securitygroup-db'),
      vpcId: vpc.ref,
      securityGroupIngress: [
        {
          ipProtocol: 'tcp',
          fromPort: 5432,
          toPort: 5432,
          sourceSecurityGroupId: securityGroupApp1a.attrGroupId,
        },
      ],
      tags: [{ key: 'Name', value: generateResourceName('securitygroup-db') }],
    });

    const networkAclPrivate = new ec2.CfnNetworkAcl(this, 'NetworkAclPrivate', {
      vpcId: vpc.ref,
      tags: [
        { key: 'Name', value: generateResourceName('networkacl-private-1a') },
      ],
    });

    const networkAclEntryInboundPrivate = new ec2.CfnNetworkAclEntry(
      this,
      'NetworkAclEntryInboundPrivate',
      {
        networkAclId: networkAclPrivate.attrId,
        protocol: -1,
        ruleAction: 'allow',
        ruleNumber: 100,
        cidrBlock: '0.0.0.0/0',
        egress: false,
      }
    );

    const networkAclEntryOutboundPrivate = new ec2.CfnNetworkAclEntry(
      this,
      'NetworkAclEntryOutboundPrivate',
      {
        networkAclId: networkAclPrivate.attrId,
        protocol: -1,
        ruleAction: 'allow',
        ruleNumber: 100,
        cidrBlock: '0.0.0.0/0',
        egress: true,
      }
    );

    const subnetNetworkAclAssociationPrivate =
      new ec2.CfnSubnetNetworkAclAssociation(
        this,
        'NetworkAssociationPrivate',
        {
          networkAclId: networkAclPrivate.attrId,
          subnetId: subnetPrivate1a.ref,
        }
      );

    const networkAclApp = new ec2.CfnNetworkAcl(this, 'NetworkAclApp', {
      vpcId: vpc.ref,
      tags: [{ key: 'Name', value: generateResourceName('networkacl-app-1a') }],
    });

    const networkAclEntryInboundApp = new ec2.CfnNetworkAclEntry(
      this,
      'NetworkAclEntryInboundApp',
      {
        networkAclId: networkAclApp.attrId,
        protocol: -1,
        ruleAction: 'allow',
        ruleNumber: 100,
        cidrBlock: '0.0.0.0/0',
        egress: false,
      }
    );

    const networkAclEntryOutboundApp = new ec2.CfnNetworkAclEntry(
      this,
      'NetworkAclEntryOutboundApp',
      {
        networkAclId: networkAclApp.attrId,
        protocol: -1,
        ruleAction: 'allow',
        ruleNumber: 100,
        cidrBlock: '0.0.0.0/0',
        egress: true,
      }
    );

    const subnetNetworkAclAssociationApp =
      new ec2.CfnSubnetNetworkAclAssociation(this, 'NetworkAssociationApp', {
        networkAclId: networkAclApp.attrId,
        subnetId: subnetApp1a.ref,
      });

    const networkAclDb1a = new ec2.CfnNetworkAcl(this, 'NetworkAclDb1a', {
      vpcId: vpc.ref,
      tags: [{ key: 'Name', value: generateResourceName('networkacl-db-1a') }],
    });

    const networkAclEntryInboundDb1a = new ec2.CfnNetworkAclEntry(
      this,
      'NetworkAclEntryInboundDb1a',
      {
        networkAclId: networkAclDb1a.attrId,
        protocol: -1,
        ruleAction: 'allow',
        ruleNumber: 100,
        cidrBlock: '0.0.0.0/0',
        egress: false,
      }
    );

    const networkAclEntryOutboundDb1a = new ec2.CfnNetworkAclEntry(
      this,
      'NetworkAclEntryOutboundDb1a',
      {
        networkAclId: networkAclDb1a.attrId,
        protocol: -1,
        ruleAction: 'allow',
        ruleNumber: 100,
        cidrBlock: '0.0.0.0/0',
        egress: true,
      }
    );

    const subnetNetworkAclAssociationDb1a =
      new ec2.CfnSubnetNetworkAclAssociation(this, 'NetworkAssociationDb1a', {
        networkAclId: networkAclDb1a.attrId,
        subnetId: subnetDb1a.ref,
      });

    const networkAclDb1c = new ec2.CfnNetworkAcl(this, 'NetworkAclDb1c', {
      vpcId: vpc.ref,
      tags: [{ key: 'Name', value: generateResourceName('networkacl-db-1c') }],
    });

    const networkAclEntryInboundDb1c = new ec2.CfnNetworkAclEntry(
      this,
      'NetworkAclEntryInboundDb1c',
      {
        networkAclId: networkAclDb1c.attrId,
        protocol: -1,
        ruleAction: 'allow',
        ruleNumber: 100,
        cidrBlock: '0.0.0.0/0',
        egress: false,
      }
    );

    const networkAclEntryOutboundDb1c = new ec2.CfnNetworkAclEntry(
      this,
      'NetworkAclEntryOutboundDb1c',
      {
        networkAclId: networkAclDb1c.attrId,
        protocol: -1,
        ruleAction: 'allow',
        ruleNumber: 100,
        cidrBlock: '0.0.0.0/0',
        egress: true,
      }
    );

    const subnetNetworkAclAssociationDb1c =
      new ec2.CfnSubnetNetworkAclAssociation(this, 'NetworkAssociationDb1c', {
        networkAclId: networkAclDb1c.attrId,
        subnetId: subnetDb1c.ref,
      });

    const dbClusterParameterGroup = new CfnDBClusterParameterGroup(
      this,
      'RdsDbClusterParameterGroup',
      {
        description: 'Cluster Parameter for RDS',
        family: 'aurora-postgresql13',
        parameters: { apg_ccm_enabled: false },
      }
    );

    // Singre-AZ構成でも2つ以上のAZにまたがるSubnetを設定する必要がある
    const dbSubnetGroup = new CfnDBSubnetGroup(this, 'RdsDbSubnetGroup', {
      dbSubnetGroupDescription: 'Subnet Grouop for RDS',
      subnetIds: [subnetDb1a.ref, subnetDb1c.ref],
      dbSubnetGroupName: generateResourceName('subnetgroup-rds'),
    });

    const dbCluster = new CfnDBCluster(this, 'RdsDbCluster', {
      engine: 'aurora-postgresql',
      backupRetentionPeriod: 1,
      databaseName: 'SAMPLE',
      dbClusterIdentifier: generateResourceName('rds-cluster'),
      dbClusterParameterGroupName: dbClusterParameterGroup.ref,
      enableCloudwatchLogsExports: ['postgresql'],
      engineMode: 'provisioned',
      engineVersion: PostgresEngineVersion.VER_13_6.postgresFullVersion,
      port: 5432,
      masterUsername: 'sampleadmin',
      masterUserPassword: 'sampleadmin',
      vpcSecurityGroupIds: [securityGroupDb.attrGroupId],
      dbSubnetGroupName: dbSubnetGroup.ref,
    });

    const dbInstance = new CfnDBInstance(this, 'RdsDbInstance', {
      dbInstanceClass: 'db.t3.medium',
      autoMinorVersionUpgrade: false,
      availabilityZone: 'ap-northeast-1a',
      dbClusterIdentifier: dbCluster.ref,
      dbInstanceIdentifier: generateResourceName('rds-instance-1a'),
      dbSubnetGroupName: dbSubnetGroup.ref,
      enablePerformanceInsights: false,
      engine: 'aurora-postgresql',
    });
  }
}
