/**
 * POST /api/sparql
 * Free-form SPARQL query explorer
 */

import { executeSparqlQuery } from '@/lib/fuseki';

export async function POST(request) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return Response.json({
        error: 'Query is required and must be a non-empty string'
      }, {
        status: 400
      });
    }

    // Optional: Validate that it looks like SPARQL
    if (!query.trim().toUpperCase().includes('SELECT') &&
        !query.trim().toUpperCase().includes('CONSTRUCT') &&
        !query.trim().toUpperCase().includes('ASK') &&
        !query.trim().toUpperCase().includes('DESCRIBE')) {
      return Response.json({
        error: 'Query must be a valid SPARQL SELECT, CONSTRUCT, ASK, or DESCRIBE query'
      }, {
        status: 400
      });
    }

    const results = await executeSparqlQuery(query);

    return Response.json({
      query,
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return Response.json({
      error: error.message
    }, {
      status: 500
    });
  }
}
