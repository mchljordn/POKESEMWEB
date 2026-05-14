# Dinopedia - Pokemon Semantic Web Backend

A Next.js REST API backend for querying Pokemon data from an Apache Jena Fuseki SPARQL endpoint.

## 📋 Project Structure

```
src/
├── lib/
│   ├── fuseki.js       ← HTTP client to Fuseki with health checks
│   └── queries.js      ← 13 SPARQL query templates
└── app/
    ├── layout.js       ← Root layout component
    ├── page.js         ← Home page
    ├── globals.css     ← Global styles
    └── api/
        ├── health/     ← GET: Fuseki status + dataset stats
        ├── sparql/     ← POST: Free-form SPARQL explorer
        ├── types/      ← GET: List all Pokemon types
        ├── stats/      ← GET: Aggregated statistics
        └── pokemon/
            ├── route.js     ← GET: List, search, filter, sort
            └── [id]/        ← GET: Detail by Pokedex ID
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Fuseki

Edit `.env.local`:

```
FUSEKI_URL=http://localhost:3030/pokemon/query
FUSEKI_DATASET=pokemon
```

Make sure Fuseki is running at `http://localhost:3030`

### 3. Run Development Server

```bash
npm run dev
```

Server will be available at `http://localhost:3000`

## 📡 API Endpoints

### Health Check
```
GET /api/health
```
Returns Fuseki endpoint status and dataset statistics.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-05-13T10:30:00.000Z",
  "fuseki": {
    "healthy": true,
    "url": "http://localhost:3030/pokemon/query"
  },
  "data": {
    "totalTriples": 15000
  }
}
```

### List All Types
```
GET /api/types
```
Returns all distinct Pokemon types for use in dropdowns.

**Response:**
```json
{
  "types": [
    { "type": "Fire" },
    { "type": "Water" },
    { "type": "Grass" }
  ],
  "count": 18,
  "timestamp": "2026-05-13T10:30:00.000Z"
}
```

### Get Statistics
```
GET /api/stats?stat=overview
```

**Query parameters:**
- `stat`: `overview` | `topHP` | `topAttack` | `topSpeed` | `averageStats`

**Example responses:**

```bash
# Overview stats
curl "http://localhost:3000/api/stats?stat=overview"

# Top 10 by HP
curl "http://localhost:3000/api/stats?stat=topHP"

# Top 10 by Attack
curl "http://localhost:3000/api/stats?stat=topAttack"

# Top 10 by Speed
curl "http://localhost:3000/api/stats?stat=topSpeed"

# Average stats by type
curl "http://localhost:3000/api/stats?stat=averageStats"
```

### List Pokemon
```
GET /api/pokemon
```

**Query parameters:**
- `search`: Search by name (case-insensitive substring)
- `type`: Filter by Pokemon type
- `sort`: `id` | `name` | `type` (default: `id`)
- `limit`: Max results (default: 100)

**Examples:**
```bash
# Get all Pokemon (first 100)
curl "http://localhost:3000/api/pokemon"

# Search by name
curl "http://localhost:3000/api/pokemon?search=pikachu"

# Filter by type
curl "http://localhost:3000/api/pokemon?type=Fire"

# Sort by name
curl "http://localhost:3000/api/pokemon?sort=name"

# Combined filters
curl "http://localhost:3000/api/pokemon?type=Water&sort=name&limit=50"
```

**Response:**
```json
{
  "pokemon": [
    {
      "id": 1,
      "name": "Bulbasaur",
      "type": "Grass",
      "generation": "1"
    }
  ],
  "count": 1,
  "filters": {
    "search": null,
    "type": null,
    "sort": "id",
    "limit": 100
  },
  "timestamp": "2026-05-13T10:30:00.000Z"
}
```

### Get Pokemon Details
```
GET /api/pokemon/{id}
```

Where `{id}` is the Pokedex number.

**Example:**
```bash
curl "http://localhost:3000/api/pokemon/25"
```

**Response:**
```json
{
  "pokemon": {
    "id": 25,
    "name": "Pikachu",
    "type": "Electric",
    "generation": "1",
    "stats": {
      "height": 0.4,
      "weight": 6,
      "hp": 35,
      "attack": 55,
      "defense": 40,
      "spAtk": 50,
      "spDef": 50,
      "speed": 90,
      "total": 360
    }
  },
  "timestamp": "2026-05-13T10:30:00.000Z"
}
```

### Free-form SPARQL Explorer
```
POST /api/sparql
```

Execute custom SPARQL queries directly.

**Request body:**
```json
{
  "query": "SELECT * WHERE { ?s ?p ?o } LIMIT 10"
}
```

**Example:**
```bash
curl -X POST "http://localhost:3000/api/sparql" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> SELECT ?type (COUNT(?s) as ?count) WHERE { ?s rdf:type ?type } GROUP BY ?type ORDER BY DESC(?count)"
  }'
```

**Response:**
```json
{
  "query": "SELECT * WHERE { ?s ?p ?o } LIMIT 10",
  "results": {
    "bindings": [
      {
        "s": { "value": "http://example.com/pokemon/1" },
        "p": { "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" },
        "o": { "value": "http://example.com/pokemon/Pokemon" }
      }
    ]
  },
  "timestamp": "2026-05-13T10:30:00.000Z"
}
```

## 🔍 Query Templates

The `src/lib/queries.js` file contains 13 predefined SPARQL query templates:

1. **getAllPokemon** - All Pokemon with basic info
2. **getPokemonById** - Detailed data for one Pokemon
3. **searchPokemonByName** - Search by name (contains)
4. **getPokemonByType** - Filter by type
5. **getAllTypes** - Distinct Pokemon types
6. **getAllGenerations** - Distinct generations
7. **countPokemonPerType** - Count grouped by type
8. **countPokemonPerGeneration** - Count grouped by generation
9. **getTopByHP** - Top Pokemon by HP stat
10. **getTopByAttack** - Top Pokemon by Attack stat
11. **getTopBySpeed** - Top Pokemon by Speed stat
12. **getAverageStatsByType** - Average stats per type
13. **filterByStatsRange** - Filter by stat thresholds

## 🔧 Environment Variables

Create `.env.local`:

```bash
# Required
FUSEKI_URL=http://localhost:3030/pokemon/query
FUSEKI_DATASET=pokemon

# Optional
NEXT_PUBLIC_API_URL=http://localhost:3000
API_RATE_LIMIT=100
API_RATE_LIMIT_WINDOW=3600
```

## 📦 Build & Deploy

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## 🛠️ Customization

### Modifying SPARQL Queries
Edit `src/lib/queries.js` to add or modify query templates.

### Adding New Endpoints
Create new route files in `src/app/api/` following Next.js App Router conventions.

### Fuseki Configuration
Update the URL and dataset name in `.env.local` to point to your Fuseki instance.

## ⚙️ Dependencies

- **next** - React framework for production
- **react** - UI library
- **react-dom** - React DOM rendering

## 📝 Notes

- All timestamps are in ISO 8601 format (UTC)
- Pokemon IDs are 1-indexed based on Pokedex number
- Stats calculations exclude height and weight
- Search is case-insensitive substring matching
- Rate limiting and CORS can be configured via environment variables

## 🐛 Troubleshooting

**"Cannot connect to Fuseki"**
- Ensure Fuseki is running: `http://localhost:3030`
- Check `FUSEKI_URL` in `.env.local`
- Verify dataset name matches

**"Invalid query" errors**
- SPARQL queries must be SELECT, CONSTRUCT, ASK, or DESCRIBE
- Check SPARQL syntax in online validator
- Ensure RDF prefixes are properly defined

**Performance issues**
- Reduce `limit` parameter for large result sets
- Use specific filters (type, generation) instead of querying all Pokemon
- Consider adding indexes in Fuseki for frequently queried properties

## 📄 License

ISC
