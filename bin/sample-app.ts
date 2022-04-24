#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { SampleStackL1 } from '../lib/sample-stack-l1';
import { SampleStackL2 } from '../lib/sample-stack-l2';

const app = new cdk.App();

const systemName = app.node.tryGetContext('systemName');
const env = app.node.tryGetContext(app.node.tryGetContext('env'));

if (app.node.tryGetContext('type') === 'L1') {
  new SampleStackL1(app, `${systemName}-${env.envName}-stack`, {
    env: env.envVariables,
    envName: env.envName,
    systemName: systemName,
  });
}

if (app.node.tryGetContext('type') === 'L2') {
  new SampleStackL2(app, `${systemName}-${env.envName}-stack`, {
    env: env.envVariables,
    envName: env.envName,
    systemName: systemName,
  });
}
