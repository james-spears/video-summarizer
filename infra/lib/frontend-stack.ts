import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3Deployment from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as cloudfrontOrigins from "aws-cdk-lib/aws-cloudfront-origins";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53Targets from "aws-cdk-lib/aws-route53-targets";
import * as certificateManager from "aws-cdk-lib/aws-certificatemanager";

export class FrontendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    const bucket = new s3.Bucket(this, "cf-origin-exmaple", {
      publicReadAccess: true,
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      websiteIndexDocument: "index.html",
    });

    new s3Deployment.BucketDeployment(this, "deployCloudFrontOrigin", {
      sources: [s3Deployment.Source.asset("../dist")],
      destinationBucket: bucket,
    });

    const domainName = "rxplc.dev";

    // We retrieve the HostedZone associated with our domain by finding it via the domain name
    const hostedZone = route53.HostedZone.fromLookup(
      this,
      "website-hosted-zone",
      {
        domainName,
      }
    );

    // We then create a certificate to be used by the CloudFront distribution for this domain
    // The ownership of the domain will be validated by AWS via DNS entries in the HostedZone
    const certificate = new certificateManager.Certificate(
      this,
      "website-certificate",
      {
        domainName,
        validation:
          certificateManager.CertificateValidation.fromDns(hostedZone),
      }
    );

    const originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      "OriginAccessIdentity"
    );
    bucket.grantRead(originAccessIdentity);

    const distribution = new cloudfront.Distribution(
      this,
      "CloudFrontDistribution",
      {
        defaultRootObject: "index.html",
        domainNames: [domainName],
        certificate: certificate,
        defaultBehavior: {
          cachePolicy: new cloudfront.CachePolicy(this, "website-caching", {
            defaultTtl: cdk.Duration.minutes(1),
          }),
          origin: new cloudfrontOrigins.S3Origin(bucket, {
            originAccessIdentity,
          }),
        },
      }
    );

    // And lastly we need to tell Amazon Route 53 to forward traffic to the Amazon CloudFront distribution
    new route53.ARecord(this, "website-arecord", {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(distribution)
      ),
      ttl: cdk.Duration.minutes(1),
    });

    new cdk.CfnOutput(this, "distributionUrl", {
      value: distribution.distributionDomainName,
      description: "CloudFront URL",
      exportName: "distributionDomainName",
    });

    new cdk.CfnOutput(this, "url", {
      value: domainName,
      description: "URL",
      exportName: "domainName",
    });
  }
}
