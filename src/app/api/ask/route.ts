import { GoogleGenerativeAI } from "@google/generative-ai";
import { executeSparqlQuery } from "../../../lib/fuseki";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_INSTRUCTION = `
You are a translation assistant that translates natural language questions (in English or Indonesian) into SPARQL queries for a Pokemon RDF/OWL graph.
Your response MUST be ONLY the SPARQL query as plain text. Do not wrap it in markdown codeblocks (like \`\`\`sparql or \`\`\`), do not write explanations, do not include any other text.

Ontology Schema & Vocabulary:
- Base Namespace URI: <http://example.org/pokemon/>
- Prefixes:
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX : <http://example.org/pokemon/>
  PREFIX poke: <http://example.org/pokemon/>

- Classes:
  * :Pokemon - represents a Pokemon (e.g., ?pokemon rdf:type :Pokemon)
  * :Type - represents a Pokemon type (e.g., ?type rdf:type :Type)
  * :Generation - represents a Pokemon generation (e.g., ?gen rdf:type :Generation)

- Properties:
  * :pokedexNumber - links a Pokemon to its ID (integer). Example: ?pokemon :pokedexNumber ?id
  * rdfs:label - links a Pokemon or Type to its name (string). Example: ?pokemon rdfs:label ?name. ?typeObj rdfs:label ?primaryType.
  * :hasPrimaryType - links a Pokemon to its primary type object. Example: ?pokemon :hasPrimaryType ?typeObj . ?typeObj rdfs:label ?primaryType .
  * :hasSecondaryType - links a Pokemon to its secondary type object (optional). Example: OPTIONAL { ?pokemon :hasSecondaryType ?secTypeObj . ?secTypeObj rdfs:label ?secondaryType . }
  * :belongsToGen - links a Pokemon to its Generation object. Example: ?pokemon :belongsToGen ?genObj . ?genObj :genNumber ?generation .
  * :genNumber - links a Generation object to its number (string/integer). Example: ?genObj :genNumber ?generation .
  * :baseHP, :baseAttack, :baseDefense, :baseSpAttack, :baseSpDefense, :baseSpeed - integer statistics.
  * :heightM - float height in meters.
  * :weightKg - float weight in kilograms.
  * :imageUrl - string image URL. Example: OPTIONAL { ?pokemon :imageUrl ?imageUrl . }
  * :hasAbility, :hasHiddenAbility - links a Pokemon to its abilities.
  * :evolvesFrom - links a Pokemon to the Pokemon it evolves from.

Standard Query Guidelines:
1. When asked to "list", "show", "get", "find", or "display" Pokemon, ALWAYS select the following variables:
   SELECT ?id ?name ?primaryType ?secondaryType ?generation ?imageUrl WHERE { ... }
   This ensures consistency with the frontend rendering system.
2. The type names in the RDF database are capitalized (e.g., "Grass", "Fire", "Water", "Poison"). So when filtering by type, compare with LCASE or capitalized strings (e.g., FILTER(?primaryType = "Fire") or FILTER(LCASE(?primaryType) = "fire")).
3. When searching for names, use CONTAINS and LCASE. Example: FILTER(CONTAINS(LCASE(?name), "pikachu"))
4. Order standard lists by ?id ascending: ORDER BY ?id
5. Example SPARQL Query for "Tampilkan pokemon tipe air dari generasi 1":
   PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
   PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
   PREFIX : <http://example.org/pokemon/>
   SELECT ?id ?name ?primaryType ?secondaryType ?generation ?imageUrl WHERE {
     ?pokemon rdf:type :Pokemon ;
              :pokedexNumber ?id ;
              rdfs:label ?name ;
              :hasPrimaryType ?typeObj ;
              :belongsToGen ?genObj .
     ?typeObj rdfs:label ?primaryType .
     ?genObj :genNumber ?generation .
     OPTIONAL {
       ?pokemon :hasSecondaryType ?secTypeObj .
       ?secTypeObj rdfs:label ?secondaryType .
     }
     OPTIONAL {
       ?pokemon :imageUrl ?imageUrl .
     }
     FILTER(LCASE(?primaryType) = "water")
     FILTER(?generation = "1")
   }
   ORDER BY ?id
`;

export async function POST(request: Request) {
  try {
    const { question } = await request.json();

    if (!question || question.trim() === "") {
      return Response.json(
        { error: "Question cannot be empty" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: "GEMINI_API_KEY is not configured in .env.local" },
        { status: 500 }
      );
    }

    // 1. Initialize the Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    // 2. Call Gemini API to translate natural language to SPARQL
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: question }] }],
    });
    
    let sparqlQuery = result.response.text().trim();

    // Clean up markdown wrapper formatting if Gemini returns it despite instructions
    if (sparqlQuery.startsWith("```")) {
      sparqlQuery = sparqlQuery.replace(/^```[a-zA-Z]*\n/, "").replace(/\n```$/, "");
    }
    sparqlQuery = sparqlQuery.trim();

    // 3. Execute the generated SPARQL query against Fuseki
    const fusekiResult = await executeSparqlQuery(sparqlQuery);

    // 4. Send back the generated query and results
    return Response.json({
      question,
      sparqlQuery,
      results: fusekiResult.results?.bindings || [],
      count: fusekiResult.results?.bindings?.length || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Pokedex AI API error:", error);
    return Response.json(
      { 
        error: error.message || "An error occurred during query execution",
        details: error.stack
      },
      { status: 500 }
    );
  }
}
