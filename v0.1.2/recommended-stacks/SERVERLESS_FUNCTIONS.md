# Serverless Functions Stack

## Overview

A cloud-native serverless architecture for building event-driven applications, microservices, and API endpoints. Optimized for scale, cost-efficiency, and minimal operational overhead.

## Philosophy

- **Event-Driven**: React to events, not poll for changes
- **Pay-Per-Use**: No idle costs, automatic scaling
- **Stateless**: Functions are ephemeral and independent
- **Managed Infrastructure**: Focus on code, not servers

## Core Technologies

### Runtime & Framework
- **Node.js 18/20**: JavaScript runtime (AWS Lambda)
- **TypeScript**: Type safety and better tooling
- **Serverless Framework**: Infrastructure as code
- **AWS SAM**: Alternative to Serverless Framework
- **CDK**: For complex infrastructure needs

### AWS Services
- **Lambda**: Function compute
- **API Gateway**: REST/WebSocket APIs
- **DynamoDB**: NoSQL database
- **S3**: Object storage
- **SQS/SNS**: Message queuing
- **EventBridge**: Event routing

### Development Tools
- **LocalStack**: Local AWS environment
- **SAM CLI**: Local testing
- **Jest**: Unit testing
- **Artillery**: Load testing
- **X-Ray**: Distributed tracing

## Project Structure

```
project-root/
├── functions/
│   ├── api/
│   │   ├── users/
│   │   │   ├── create.ts
│   │   │   ├── get.ts
│   │   │   └── list.ts
│   │   └── auth/
│   │       └── login.ts
│   ├── events/
│   │   ├── process-upload.ts
│   │   └── send-notification.ts
│   └── scheduled/
│       └── cleanup.ts
├── lib/
│   ├── database.ts
│   ├── auth.ts
│   └── utils.ts
├── types/
│   └── index.ts
├── tests/
│   ├── unit/
│   └── integration/
├── serverless.yml
└── package.json
```

## Function Patterns

### HTTP API Function
```typescript
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const UserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  age: z.number().optional(),
});

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    // Parse and validate input
    const body = JSON.parse(event.body || '{}');
    const userData = UserSchema.parse(body);
    
    // Create user
    const user = {
      id: uuidv4(),
      ...userData,
      createdAt: new Date().toISOString(),
    };
    
    // Save to DynamoDB
    await docClient.send(new PutCommand({
      TableName: process.env.USERS_TABLE!,
      Item: user,
    }));
    
    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Validation failed',
          details: error.errors,
        }),
      };
    }
    
    console.error('Error creating user:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Internal server error',
      }),
    };
  }
};
```

### Event Processing Function
```typescript
import { S3Event, S3Handler } from 'aws-lambda';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';

const s3Client = new S3Client({});

export const handler: S3Handler = async (event: S3Event) => {
  const promises = event.Records.map(async (record) => {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
    
    try {
      // Get image from S3
      const getCommand = new GetObjectCommand({ Bucket: bucket, Key: key });
      const { Body } = await s3Client.send(getCommand);
      
      // Process image
      const imageBuffer = await streamToBuffer(Body);
      const thumbnail = await sharp(imageBuffer)
        .resize(200, 200)
        .toBuffer();
      
      // Save thumbnail
      const thumbnailKey = `thumbnails/${key}`;
      await s3Client.send(new PutCommand({
        Bucket: bucket,
        Key: thumbnailKey,
        Body: thumbnail,
        ContentType: 'image/jpeg',
      }));
      
      console.log(`Thumbnail created: ${thumbnailKey}`);
    } catch (error) {
      console.error(`Error processing ${key}:`, error);
      throw error;
    }
  });
  
  await Promise.all(promises);
};
```

### Scheduled Function
```typescript
import { ScheduledHandler } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler: ScheduledHandler = async (event) => {
  console.log('Running cleanup job:', event.time);
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // Scan for old items
  const scanResult = await docClient.send(new ScanCommand({
    TableName: process.env.TEMP_TABLE!,
    FilterExpression: 'createdAt < :date',
    ExpressionAttributeValues: {
      ':date': thirtyDaysAgo.toISOString(),
    },
  }));
  
  // Delete old items
  const deletePromises = (scanResult.Items || []).map(item =>
    docClient.send(new DeleteCommand({
      TableName: process.env.TEMP_TABLE!,
      Key: { id: item.id },
    }))
  );
  
  await Promise.all(deletePromises);
  
  console.log(`Deleted ${deletePromises.length} old items`);
};
```

## Serverless Configuration

### serverless.yml
```yaml
service: my-serverless-app

frameworkVersion: '3'

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  stage: ${opt:stage, 'dev'}
  environment:
    STAGE: ${self:provider.stage}
    USERS_TABLE: ${self:custom.usersTable}
    TEMP_TABLE: ${self:custom.tempTable}
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - dynamodb:PutItem
            - dynamodb:GetItem
            - dynamodb:Query
            - dynamodb:Scan
            - dynamodb:DeleteItem
          Resource:
            - !GetAtt UsersTable.Arn
            - !GetAtt TempTable.Arn

custom:
  usersTable: ${self:service}-users-${self:provider.stage}
  tempTable: ${self:service}-temp-${self:provider.stage}

functions:
  createUser:
    handler: functions/api/users/create.handler
    events:
      - httpApi:
          path: /users
          method: post
  
  getUser:
    handler: functions/api/users/get.handler
    events:
      - httpApi:
          path: /users/{id}
          method: get
  
  processUpload:
    handler: functions/events/process-upload.handler
    events:
      - s3:
          bucket: uploads-${self:provider.stage}
          event: s3:ObjectCreated:*
          rules:
            - prefix: images/
  
  cleanup:
    handler: functions/scheduled/cleanup.handler
    events:
      - schedule:
          rate: rate(1 day)
          description: 'Clean up old temporary data'

resources:
  Resources:
    UsersTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:custom.usersTable}
        AttributeDefinitions:
          - AttributeName: id
            AttributeType: S
          - AttributeName: email
            AttributeType: S
        KeySchema:
          - AttributeName: id
            KeyType: HASH
        GlobalSecondaryIndexes:
          - IndexName: email-index
            KeySchema:
              - AttributeName: email
                KeyType: HASH
            Projection:
              ProjectionType: ALL
        BillingMode: PAY_PER_REQUEST
    
    TempTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:custom.tempTable}
        AttributeDefinitions:
          - AttributeName: id
            AttributeType: S
        KeySchema:
          - AttributeName: id
            KeyType: HASH
        BillingMode: PAY_PER_REQUEST
        TimeToLiveSpecification:
          AttributeName: ttl
          Enabled: true

plugins:
  - serverless-esbuild
  - serverless-offline
  - serverless-dynamodb-local
```

## Authentication & Authorization

### JWT Authorizer
```typescript
import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult } from 'aws-lambda';
import jwt from 'jsonwebtoken';

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent
): Promise<APIGatewayAuthorizerResult> => {
  try {
    const token = event.authorizationToken.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    return {
      principalId: decoded.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: event.methodArn,
          },
        ],
      },
      context: {
        userId: decoded.sub,
        email: decoded.email,
        role: decoded.role,
      },
    };
  } catch (error) {
    console.error('Authorization failed:', error);
    throw new Error('Unauthorized');
  }
};
```

## Database Patterns

### DynamoDB Single Table Design
```typescript
// Entity definitions
interface User {
  PK: `USER#${string}`;
  SK: 'PROFILE';
  email: string;
  name: string;
}

interface Post {
  PK: `USER#${string}`;
  SK: `POST#${string}`;
  title: string;
  content: string;
  createdAt: string;
}

// Repository pattern
export class UserRepository {
  constructor(private docClient: DynamoDBDocumentClient) {}
  
  async createUser(userData: Omit<User, 'PK' | 'SK'>): Promise<User> {
    const user: User = {
      PK: `USER#${uuidv4()}`,
      SK: 'PROFILE',
      ...userData,
    };
    
    await this.docClient.send(new PutCommand({
      TableName: process.env.TABLE_NAME!,
      Item: user,
    }));
    
    return user;
  }
  
  async getUserPosts(userId: string): Promise<Post[]> {
    const result = await this.docClient.send(new QueryCommand({
      TableName: process.env.TABLE_NAME!,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
      ExpressionAttributeValues: {
        ':pk': `USER#${userId}`,
        ':sk': 'POST#',
      },
    }));
    
    return result.Items as Post[];
  }
}
```

## Testing Strategy

### Unit Tests
```typescript
import { handler } from '../functions/api/users/create';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('Create User Handler', () => {
  beforeEach(() => {
    ddbMock.reset();
    process.env.USERS_TABLE = 'test-table';
  });
  
  it('should create a user successfully', async () => {
    ddbMock.on(PutCommand).resolves({});
    
    const event = {
      body: JSON.stringify({
        email: 'test@example.com',
        name: 'Test User',
      }),
    };
    
    const result = await handler(event as any, {} as any, {} as any);
    
    expect(result.statusCode).toBe(201);
    const body = JSON.parse(result.body as string);
    expect(body.email).toBe('test@example.com');
    expect(body.id).toBeDefined();
  });
});
```

### Integration Tests
```typescript
// Using LocalStack
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import axios from 'axios';

const localStackEndpoint = 'http://localhost:4566';

describe('API Integration Tests', () => {
  const client = new DynamoDBClient({
    endpoint: localStackEndpoint,
    region: 'us-east-1',
  });
  
  beforeAll(async () => {
    // Create test table
    await client.send(new CreateTableCommand({
      TableName: 'test-users',
      // ... table definition
    }));
  });
  
  it('should create and retrieve user', async () => {
    // Create user
    const createResponse = await axios.post('http://localhost:3000/users', {
      email: 'test@example.com',
      name: 'Test User',
    });
    
    expect(createResponse.status).toBe(201);
    const userId = createResponse.data.id;
    
    // Get user
    const getResponse = await axios.get(`http://localhost:3000/users/${userId}`);
    expect(getResponse.data.email).toBe('test@example.com');
  });
});
```

## Monitoring & Observability

### Structured Logging
```typescript
import { Logger } from '@aws-lambda-powertools/logger';

const logger = new Logger({ serviceName: 'user-service' });

export const handler = async (event: any) => {
  logger.addContext({ requestId: event.requestContext.requestId });
  
  try {
    logger.info('Creating user', { email: event.body.email });
    
    // ... create user logic
    
    logger.info('User created successfully', { userId: user.id });
    return response;
  } catch (error) {
    logger.error('Failed to create user', error as Error);
    throw error;
  }
};
```

### Distributed Tracing
```typescript
import { Tracer } from '@aws-lambda-powertools/tracer';

const tracer = new Tracer({ serviceName: 'user-service' });

export const handler = tracer.captureLambdaHandler(async (event: any) => {
  const segment = tracer.getSegment();
  
  const subsegment = segment.addNewSubsegment('database-operation');
  try {
    // Database operation
    const result = await docClient.send(command);
    subsegment.addAnnotation('userId', result.id);
  } finally {
    subsegment.close();
  }
  
  return response;
});
```

## Deployment & CI/CD

### GitHub Actions
```yaml
name: Deploy Serverless

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Deploy to AWS
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        run: npx serverless deploy --stage prod
```

## Context7 Documentation

When using context7, fetch documentation for:
- **AWS Lambda**: Handler types, context object, layers
- **DynamoDB**: Single table design, queries, indexes
- **API Gateway**: REST APIs, WebSocket APIs, authorizers
- **S3**: Event notifications, presigned URLs
- **EventBridge**: Event patterns, rules
- **CloudFormation/SAM**: Infrastructure as code
- **Node.js**: Async patterns, streams

## Best Practices

1. **Cold Start Optimization**: Minimize package size, use layers
2. **Error Handling**: Use dead letter queues, implement retries
3. **Security**: Least privilege IAM, encrypt sensitive data
4. **Cost Optimization**: Right-size memory, use provisioned concurrency wisely
5. **Monitoring**: CloudWatch metrics, X-Ray tracing, structured logs
6. **Testing**: Unit tests for logic, integration tests with LocalStack
7. **Idempotency**: Handle duplicate events gracefully

## Common Patterns

### Step Functions
```yaml
# State machine for order processing
Comment: Process order workflow
StartAt: ValidateOrder
States:
  ValidateOrder:
    Type: Task
    Resource: !GetAtt ValidateOrderFunction.Arn
    Next: ChargePayment
    Catch:
      - ErrorEquals: [ValidationError]
        Next: OrderFailed
  
  ChargePayment:
    Type: Task
    Resource: !GetAtt ChargePaymentFunction.Arn
    Next: ShipOrder
    Retry:
      - ErrorEquals: [PaymentError]
        IntervalSeconds: 2
        MaxAttempts: 3
  
  ShipOrder:
    Type: Task
    Resource: !GetAtt ShipOrderFunction.Arn
    End: true
  
  OrderFailed:
    Type: Fail
    Cause: Order validation failed
```

### Event Sourcing
```typescript
// Event store pattern
interface Event {
  aggregateId: string;
  eventType: string;
  eventData: any;
  eventTime: string;
  version: number;
}

export class EventStore {
  async appendEvent(event: Omit<Event, 'eventTime' | 'version'>) {
    const lastEvent = await this.getLastEvent(event.aggregateId);
    
    const newEvent: Event = {
      ...event,
      eventTime: new Date().toISOString(),
      version: (lastEvent?.version || 0) + 1,
    };
    
    await docClient.send(new PutCommand({
      TableName: process.env.EVENTS_TABLE!,
      Item: {
        PK: `AGG#${event.aggregateId}`,
        SK: `EVENT#${newEvent.version.toString().padStart(10, '0')}`,
        ...newEvent,
      },
    }));
    
    // Publish to EventBridge
    await eventBridge.send(new PutEventsCommand({
      Entries: [{
        Source: 'my-app',
        DetailType: event.eventType,
        Detail: JSON.stringify(newEvent),
      }],
    }));
  }
}