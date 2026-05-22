/**
 * Fuseki HTTP Client
 * Handles all communication with Apache Jena Fuseki SPARQL endpoint
 */

const FUSEKI_URL: string = process.env.FUSEKI_URL || 'http://localhost:3030/pokemon/query';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DATASET: string = process.env.FUSEKI_DATASET || 'pokemon';

/**
 * Execute SPARQL query against Fuseki
 * @param {string} query - SPARQL query string
 * @returns {Promise<any>} Query results
 */
export async function executeSparqlQuery(query: string): Promise<any> {
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
 * Health check for Fuseki endpoint with a 5-second timeout
 * @returns {Promise<boolean>} True if Fuseki is accessible
 */
export async function checkFusekiHealth(): Promise<boolean> {
  try {
    // 1. Buat instance AbortController untuk handle timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(FUSEKI_URL.replace('/query', ''), {
      method: 'HEAD',
      signal: controller.signal // 2. Pasang signal-nya di sini menggantikan timeout
    });

    // 3. Clear timeout-nya kalau fetch berhasil selesai sebelum 5 detik
    clearTimeout(timeoutId);
    
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
export async function getDatasetStats(): Promise<number> {
  const query = `
    SELECT (COUNT(*) as ?count) {
      ?s ?p ?o
    }
  `;

  try {
    const result = await executeSparqlQuery(query);
    const count = result.results?.bindings?.[0]?.count?.value || '0';
    return parseInt(count, 10);
  } catch (error) {
    console.error('Failed to get dataset stats:', error);
    return 0;
  }
}