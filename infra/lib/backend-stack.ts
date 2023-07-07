import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import * as apigatewayv2 from "@aws-cdk/aws-apigatewayv2-alpha";
import * as apigatewayv2Integrations from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    const handler = new lambda.Function(this, "hello-world-lambda", {
      code: lambda.Code.fromAsset("../functions/dist"),
      functionName: "helloWorld",
      handler: "index.handler",
      memorySize: 1024,
      runtime: lambda.Runtime.NODEJS_18_X,
      timeout: cdk.Duration.seconds(100),
    });

    const httpApi = new apigatewayv2.HttpApi(this, "http-api", {
      apiName: "HTTP API",
      description: "This service serves is a test.",
      corsPreflight: {
        allowOrigins: ["*"],
        allowMethods: [apigatewayv2.CorsHttpMethod.ANY],
      },
    });

    httpApi.addRoutes({
      path: "/hello-world",
      methods: [apigatewayv2.HttpMethod.ANY],
      integration: new apigatewayv2Integrations.HttpLambdaIntegration(
        "hello-world",
        handler
      ),
    });

    new cdk.CfnOutput(this, "http-api-url", {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      value: httpApi?.url ?? "error",
    });

    const table = new dynamodb.Table(this, "dyanmo-table", {
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    new cdk.CfnOutput(this, "dynamo-table-name", {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      value: table.tableName ?? "error",
    });
  }
}
