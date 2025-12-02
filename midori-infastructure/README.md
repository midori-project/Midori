# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template


<!-- script รันบน powershell -->
# ตั้งค่าตามโปรเจกต์ของคุณ
$Region = "ap-southeast-1"
$DbInstanceId = "midoriinfastructurestack-midoridatabase56104fa3-dod3pasvmfqy"

$PublicIpCidr = "$( (Invoke-RestMethod -Uri 'https://checkip.amazonaws.com').Trim() )/32"
$sgIds = (aws rds describe-db-instances --db-instance-identifier $DbInstanceId --region $Region | ConvertFrom-Json).DBInstances[0].VpcSecurityGroups | ForEach-Object { $_.VpcSecurityGroupId }

foreach ($sg in $sgIds) {
  aws ec2 authorize-security-group-ingress `
    --group-id $sg `
    --ip-permissions "IpProtocol=tcp,FromPort=5432,ToPort=5432,IpRanges=[{CidrIp='$PublicIpCidr',Description='Dev temporary access'}]" `
    --region $Region 2>$null
}
"Allowed $PublicIpCidr on SG(s): $($sgIds -join ', ')"


<!-- ทดสอบด้วย Test-NetConnection midoriinfastructurestack-midoridatabase56104fa3-dod3pasvmfqy.cbeguaagse61.ap-southeast-1.rds.amazonaws.com -port 5432 -->

<!-- รัน prisma -->
npx prisma studio --schema=midori-infastructure/lambda/api/prisma/schema.prisma
