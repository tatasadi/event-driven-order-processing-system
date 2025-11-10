import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

/**
 * Health check endpoint for monitoring and smoke tests
 */
export async function Health(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log('Health check requested');

  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {
      serviceBus: checkServiceBusConnection(),
      appInsights: checkAppInsightsConnection(),
    },
  };

  return {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    jsonBody: health,
  };
}

function checkServiceBusConnection(): string {
  return process.env.SERVICE_BUS_CONNECTION_STRING ? 'configured' : 'not configured';
}

function checkAppInsightsConnection(): string {
  return process.env.APPLICATIONINSIGHTS_CONNECTION_STRING
    ? 'configured'
    : 'not configured';
}

app.http('health', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'health',
  handler: Health,
});
