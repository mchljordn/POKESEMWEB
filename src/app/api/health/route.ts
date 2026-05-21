/**
 * GET /api/health
 * Status check for Fuseki endpoint and dataset statistics
 */

import { checkFusekiHealth, getDatasetStats } from "../../../lib/fuseki";


export async function GET(request) {
  try {
    const isHealthy = await checkFusekiHealth();
    const totalTriples = await getDatasetStats();

    return Response.json({
      status: isHealthy ? 'ok' : 'disconnected',
      timestamp: new Date().toISOString(),
      fuseki: {
        healthy: isHealthy,
        url: process.env.FUSEKI_URL || 'http://localhost:3030/pokemon/query'
      },
      data: {
        totalTriples
      }
    }, {
      status: isHealthy ? 200 : 503
    });
  } catch (error) {
    return Response.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    }, {
      status: 500
    });
  }
}
