export default function howTo() {
  // Kita pisah string curl-nya ke variabel biar TypeScript gak pusing nyari escape character
  const curlExamples = `# Check health
curl http://localhost:3000/api/health

# List all types
curl http://localhost:3000/api/types

# Get Pokemon by ID
curl http://localhost:3000/api/pokemon/1

# Search Pokemon
curl "http://localhost:3000/api/pokemon?search=pikachu"

# Filter by type
curl "http://localhost:3000/api/pokemon?type=Fire"

# Get stats
curl "http://localhost:3000/api/stats?stat=overview"
curl "http://localhost:3000/api/stats?stat=topHP"

# Custom SPARQL query
curl -X POST http://localhost:3000/api/sparql \\
  -H "Content-Type: application/json" \\
  -d '{"query": "SELECT * WHERE { ?s ?p ?o } LIMIT 10"}'`;

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🐉 Pokedexia - Pokemon Semantic Web API</h1>
      
      <div style={{ marginTop: '30px' }}>
        <h2>API Endpoints</h2>
        <ul style={{ lineHeight: '1.8' }}>
          <li><strong>GET /api/health</strong> - Fuseki endpoint status and dataset stats</li>
          <li><strong>POST /api/sparql</strong> - Execute custom SPARQL queries</li>
          <li><strong>GET /api/types</strong> - List all Pokemon types</li>
          <li><strong>GET /api/stats</strong> - Aggregated statistics (by type, generation, top stats)</li>
          <li><strong>GET /api/pokemon</strong> - List Pokemon with search, filter, sort</li>
          <li><strong>GET /api/pokemon/[id]</strong> - Get detailed Pokemon data by Pokedex ID</li>
        </ul>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h2>Quick Examples</h2>
        <pre style={{ background: '#f4f4f4', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
          {curlExamples}
        </pre>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h2>Configuration</h2>
        <p>Configure Fuseki endpoint in <code>.env.local</code>:</p>
        <pre style={{ background: '#f4f4f4', padding: '10px', borderRadius: '4px' }}>
{`FUSEKI_URL=http://localhost:3030/pokemon/query
FUSEKI_DATASET=pokemon`}
        </pre>
      </div>

      <footer style={{ marginTop: '60px', borderTop: '1px solid #ccc', paddingTop: '20px', color: '#666' }}>
        <p>Next.js + SPARQL Fuseki Backend | Pokemon Semantic Web Project</p>
      </footer>
    </div>
  );
}