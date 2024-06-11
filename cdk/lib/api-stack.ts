import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Architecture, Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Role, ServicePrincipal, ManagedPolicy } from 'aws-cdk-lib/aws-iam';

export class ApiStack extends cdk.Stack {
    private readonly api: appsync.GraphqlApi;
    public getEndpointUrl = () => this.api.graphqlUrl;
      
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
      
    const assignResolver = (api:appsync.GraphqlApi, query: string, ds: appsync.LambdaDataSource) => {
        new appsync.Resolver(this, 'FacultyCVResolver-' + query, {
            api: api,
            dataSource: ds,
            typeName: 'Query',
            fieldName: query
        });
        return;
    }

    const createResolver = (api:appsync.GraphqlApi, directory: string, queries: string[], env: { [key: string]: string }, role: Role) => {
        const resolver = new Function(this, `facultycv-${directory}-resolver`, {
            functionName: `facultycv-${directory}-resolver`,
            runtime: Runtime.PYTHON_3_11,
            memorySize: 512,
            code: Code.fromAsset(`./lambda/${directory}`),
            handler: 'resolver.lambda_handler',
            architecture: Architecture.X86_64,
            timeout: cdk.Duration.minutes(1),
            environment: env,
            role: role
        });

        const lambdaDataSource = new appsync.LambdaDataSource(this, `${directory}-data-source`, {
            api: api,
            lambdaFunction: resolver,
            name: `${directory}-data-source`
        });

        queries.forEach(query => assignResolver(api, query, lambdaDataSource))
    }

    this.api = new appsync.GraphqlApi(this, 'FacultyCVApi', {
        name: 'faculty-cv-api',
        definition: appsync.Definition.fromFile('./graphql/schema.graphql'),
        authorizationConfig: {
            defaultAuthorization: {
                authorizationType: appsync.AuthorizationType.IAM
            }
        },
        logConfig: {
            fieldLogLevel: appsync.FieldLogLevel.ALL
        }
    });

    const resolverRole = new Role(this, 'FacultyCVResolverRole', {
        assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
        roleName: 'facultycv-resolver-role',
        managedPolicies: [
            ManagedPolicy.fromAwsManagedPolicyName('AwsAppSyncInvokeFullAccess'),
            ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLogsFullAccess')
        ],
        description: 'IAM role for the lambda resolver function'
    });

    createResolver(this.api, 'sampleResolver', ['getFacultyMember'], {}, resolverRole);
    }
}
