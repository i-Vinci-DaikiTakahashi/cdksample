import { Construct } from 'constructs';
import { Stack, StackProps, aws_ec2 as ec2, Tags } from 'aws-cdk-lib';
import { GenerateResourceName } from './util/resourceNameUtil';
import {
  AuroraPostgresEngineVersion,
  DatabaseCluster,
  DatabaseClusterEngine,
  DatabaseInstance,
  DatabaseInstanceEngine,
} from 'aws-cdk-lib/aws-rds';

interface SampleStackProps extends StackProps {
  env: {
    account: string;
    region: string;
  };
  envName: string;
  systemName: string;
}

export class SampleStackL2 extends Stack {
  constructor(scope: Construct, id: string, props: SampleStackProps) {
    super(scope, id, props);

    const generateResourceName = GenerateResourceName(
      props.systemName,
      props.envName
    );

    const vpc = new ec2.Vpc(this, 'Vpc', {
      cidr: '10.33.0.0/16',
    });
    Tags.of(vpc).add('Name', generateResourceName('vpc'));

    const dbCluster = new DatabaseCluster(this, 'RdsDbCluster', {
      engine: DatabaseClusterEngine.auroraPostgres({
        version: AuroraPostgresEngineVersion.VER_13_4,
      }),
      instanceProps: { vpc },
      defaultDatabaseName: 'SAMPLE',
      instanceIdentifierBase: generateResourceName('rds-cluster'),
    });
  }
}
