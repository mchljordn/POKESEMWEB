/**
 * Fuseki HTTP Client
 * Handles all communication with Apache Jena Fuseki SPARQL endpoint
 */

const FUSEKI_URL = process.env.FUSEKI_URL || 'http://localhost:3030/pokemon/query';
const DATASET = process.env.FUSEKI_DATASET || 'pokemon';

/**
 * Execute SPARQL query against Fuseki
 * @param {string} query - SPARQL query string
 * @returns {Promise<Object>} Query results
 */
export async function executeSparqlQuery(query) {
  try {
    const response = await fetch(FUSEKI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/sparql-query',
        'Accept': 'application/sparql-results+json'
      },
      body: query
    });

    if (!response.ok) {
      throw new Error(`Fuseki error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Fuseki query error:', error);
    throw error;
  }
}

/**
 * Health check for Fuseki endpoint
 * @returns {Promise<boolean>} True if Fuseki is accessible
 */
export async function checkFusekiHealth() {
  try {
    const response = await fetch(FUSEKI_URL.replace('/query', ''), {
      method: 'HEAD',
      timeout: 5000
    });
    return response.ok;
  } catch (error) {
    console.error('Fuseki health check failed:', error);
    return false;
  }
}

/**
 * Get total count of resources in dataset
 * @returns {Promise<number>} Total triple count
 */
export async function getDatasetStats() {
  const query = `
    SELECT (COUNT(*) as ?count) {
      ?s ?p ?o
    }
  `;

  try {
    const result = await executeSparqlQuery(query);
    const count = result.results?.bindings?.[0]?.count?.value || 0;
    return parseInt(count, 10);
  } catch (error) {
    console.error('Failed to get dataset stats:', error);
    return 0;
  }
}
