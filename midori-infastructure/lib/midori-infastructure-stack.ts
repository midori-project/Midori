import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigatewayv2_integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';

export class MidoriInfastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. สร้าง VPC สำหรับ DB และ Lambda (ไม่มี NAT Gateway)
    const vpc = new ec2.Vpc(this, 'MidoriVPC', {
      maxAzs: 2,
      natGateways: 0, // ยกเลิก NAT Gateway
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: 'Private',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED, // เปลี่ยนเป็น ISOLATED
        },
        {
          cidrMask: 24,
          name: 'Database',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    // 2. เพิ่ม VPC Endpoints ที่จำเป็นสำหรับ Lambda ภายใน VPC
    const secretsManagerEndpoint = new ec2.InterfaceVpcEndpoint(this, 'SecretsManagerEndpoint', {
      vpc,
      service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      privateDnsEnabled: true,
    });
    const logsEndpoint = new ec2.InterfaceVpcEndpoint(this, 'LogsEndpoint', {
      vpc,
      service: ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
      subnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      privateDnsEnabled: true,
    });

    // 3. สร้าง Security Group สำหรับ RDS
    const dbSecurityGroup = new ec2.SecurityGroup(this, 'DatabaseSecurityGroup', {
      vpc,
      description: 'Security group for RDS database',
      allowAllOutbound: false,
    });

    

    // ให้ Lambda เข้าถึง RDS
    dbSecurityGroup.addIngressRule(
      ec2.Peer.ipv4('125.27.255.248/32'),
      ec2.Port.tcp(5432),
      'Allow PostgreSQL from 125.27.255.248 Korn'
    );
    
    dbSecurityGroup.addIngressRule(
      ec2.Peer.ipv4('110.168.219.48/32'), // แทนค่าเป็น IP ที่สองของคุณ
      ec2.Port.tcp(5432),
      'Allow PostgreSQL from 110.168.219.48 Jin'
    );
    // 3. สร้าง RDS PostgreSQL
    const dbCredentials = rds.Credentials.fromGeneratedSecret('midori_admin', {
      secretName: 'midori/db-credentials',
    });

    const database = new rds.DatabaseInstance(this, 'MidoriDatabase', {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_17_2, // ใช้ 17.2 ที่เสถียร
      }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
      credentials: dbCredentials,
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      securityGroups: [dbSecurityGroup],
      databaseName: 'midori_db',
      backupRetention: cdk.Duration.days(7),
      deletionProtection: false,
      publiclyAccessible: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // 4. สร้าง Lambda Functions (ไม่ระบุ SG แยก) และเชื่อมกับ RDS/Secrets
    const apiLambda = new lambda.Function(this, 'MidoriApiLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda/api'),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      environment: {
        DB_HOST: database.instanceEndpoint.hostname,
        DB_PORT: database.instanceEndpoint.port.toString(),
        DB_NAME: 'midori_db',
        DB_SECRET_NAME: database.secret!.secretName,
      },
      timeout: cdk.Duration.seconds(30),
    });

    const migrationLambda = new lambda.Function(this, 'MidoriMigrationLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'migrate.handler',
      code: lambda.Code.fromAsset('lambda/api'),
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      environment: {
        DB_HOST: database.instanceEndpoint.hostname,
        DB_PORT: database.instanceEndpoint.port.toString(),
        DB_NAME: 'midori_db',
        DB_SECRET_NAME: database.secret!.secretName,
      },
      timeout: cdk.Duration.seconds(60),
    });

    // เปิดให้ VPC Endpoints รับทราฟฟิกจาก Lambda SG อัตโนมัติ
    secretsManagerEndpoint.connections.allowDefaultPortFrom(apiLambda);
    secretsManagerEndpoint.connections.allowDefaultPortFrom(migrationLambda);
    logsEndpoint.connections.allowDefaultPortFrom(apiLambda);
    logsEndpoint.connections.allowDefaultPortFrom(migrationLambda);

    // อนุญาตให้ Lambda เข้าถึง RDS และ Secrets
    database.grantConnect(apiLambda);
    database.connections.allowDefaultPortFrom(apiLambda);
    database.secret!.grantRead(apiLambda);

    database.grantConnect(migrationLambda);
    database.connections.allowDefaultPortFrom(migrationLambda);
    database.secret!.grantRead(migrationLambda);

    // 5. สร้าง API Gateway และเชื่อม Lambda
    const httpApi = new apigatewayv2.HttpApi(this, 'MidoriHttpApi', {
      corsPreflight: {
        allowHeaders: ['Content-Type'],
        allowMethods: [apigatewayv2.CorsHttpMethod.GET, apigatewayv2.CorsHttpMethod.POST],
        allowOrigins: ['*'],
      },
    });

    const lambdaIntegration = new apigatewayv2_integrations.HttpLambdaIntegration(
      'LambdaIntegration',
      apiLambda,
    );

    httpApi.addRoutes({
      path: '/api/health',
      methods: [apigatewayv2.HttpMethod.GET],
      integration: lambdaIntegration,
    });

    // 6. Output URL ของ API และข้อมูลสำคัญของ Database
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: httpApi.url!,
      description: 'API Gateway URL',
    });

    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: database.instanceEndpoint.hostname,
      description: 'Database endpoint',
    });

    new cdk.CfnOutput(this, 'DatabaseSecretName', {
      value: database.secret!.secretName,
      description: 'Database credentials secret name',
    });
  }
}
