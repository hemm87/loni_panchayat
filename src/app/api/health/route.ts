/**
 * Health Check API Endpoint
 * 
 * Used for monitoring and load balancer health checks
 * Returns 200 OK if the application is running
 */

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Add any additional health checks here
    // e.g., database connectivity, external service checks
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
    };

    return NextResponse.json(healthStatus, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
