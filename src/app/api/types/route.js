/**
 * GET /api/types
 * List all Pokemon types (for dropdowns and filters)
 */

import { executeSparqlQuery } from '@/lib/fuseki';
import { getQuery } from '@/lib/queries';

export async function GET(request) {
  try {
    const query = getQuery('getAllTypes');
    const result = await executeSparqlQuery(query);

    const types = result.results?.bindings?.map(binding => ({
      type: binding.type?.value
    })) || [];

    return Response.json({
      types,
      count: types.length,
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
