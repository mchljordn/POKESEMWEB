/**
 * SPARQL Query Templates
 * 13 predefined queries for Pokemon semantic data
 * 
 * Prefix: poke: <http://example.org/pokemon/>
 * 
 * Property mappings:
 * - :pokedexNumber = Pokemon ID
 * - :hasPrimaryType = Type
 * - :belongsToGen = Generation
 * - :baseHP, :baseAttack, :baseDefense, :baseSpAttack, :baseSpDefense, :baseSpeed = Stats
 */

export const QUERIES = {
  // 1. Get all Pokemon with basic info
  getAllPokemon: () => `
    PREFIX poke: <http://example.org/pokemon/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX : <http://example.org/pokemon/>
    
    SELECT ?id ?name ?type ?generation WHERE {
      ?pokemon rdf:type :Pokemon ;
               :pokedexNumber ?id ;
               rdfs:label ?name ;
               :hasPrimaryType ?typeObj ;
               :belongsToGen ?genObj .
      ?typeObj rdfs:label ?type .
      ?genObj :genNumber ?generation .
    }
    ORDER BY ?id
  `,

  // 2. Get Pokemon by ID (Pokedex number)
  getPokemonById: (id) => `
    PREFIX poke: <http://example.org/pokemon/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX : <http://example.org/pokemon/>
    
    SELECT ?id ?name ?type ?generation ?hp ?attack ?defense ?spAtk ?spDef ?speed WHERE {
      ?pokemon rdf:type :Pokemon ;
               :pokedexNumber ?id ;
               rdfs:label ?name ;
               :hasPrimaryType ?typeObj ;
               :belongsToGen ?genObj ;
               :baseHP ?hp ;
               :baseAttack ?attack ;
               :baseDefense ?defense ;
               :baseSpAttack ?spAtk ;
               :baseSpDefense ?spDef ;
               :baseSpeed ?speed .
      ?typeObj rdfs:label ?type .
      ?genObj :genNumber ?generation .
      FILTER(?id = ${id})
    }
  `,

  // 3. Search Pokemon by name (contains)
  searchPokemonByName: (name) => `
    PREFIX poke: <http://example.org/pokemon/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX : <http://example.org/pokemon/>
    
    SELECT ?id ?name ?type WHERE {
      ?pokemon rdf:type :Pokemon ;
               :pokedexNumber ?id ;
               rdfs:label ?name ;
               :hasPrimaryType ?typeObj .
      ?typeObj rdfs:label ?type .
      FILTER(CONTAINS(LCASE(?name), LCASE("${name}")))
    }
    ORDER BY ?id
  `,

  // 4. Get Pokemon by type
  getPokemonByType: (type) => `
    PREFIX poke: <http://example.org/pokemon/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX : <http://example.org/pokemon/>
    
    SELECT ?id ?name ?type WHERE {
      ?pokemon rdf:type :Pokemon ;
               :pokedexNumber ?id ;
               rdfs:label ?name ;
               :hasPrimaryType ?typeObj .
      ?typeObj rdfs:label ?type .
      FILTER(?type = "${type}")
    }
    ORDER BY ?id
  `,

  // 5. Get all distinct types
  getAllTypes: () => `
    PREFIX poke: <http://example.org/pokemon/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    
    SELECT DISTINCT ?type WHERE {
      ?t rdf:type poke:Type ;
         rdfs:label ?type .
    }
    ORDER BY ?type
  `,

  // 6. Get all generations
  getAllGenerations: () => `
    PREFIX poke: <http://example.org/pokemon/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX : <http://example.org/pokemon/>
    
    SELECT DISTINCT ?generation WHERE {
      ?gen rdf:type :Generation ;
           :genNumber ?generation .
    }
    ORDER BY ?generation
  `,

  // 7. Count Pokemon per type
  countPokemonPerType: () => `
    PREFIX poke: <http://example.org/pokemon/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX : <http://example.org/pokemon/>
    
    SELECT ?type (COUNT(?pokemon) as ?count) WHERE {
      ?pokemon rdf:type :Pokemon ;
               :hasPrimaryType ?typeObj .
      ?typeObj rdfs:label ?type .
    }
    GROUP BY ?type
    ORDER BY DESC(?count)
  `,

  // 8. Count Pokemon per generation
  countPokemonPerGeneration: () => `
    PREFIX poke: <http://example.org/pokemon/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX : <http://example.org/pokemon/>
    
    SELECT ?generation (COUNT(?pokemon) as ?count) WHERE {
      ?pokemon rdf:type :Pokemon ;
               :belongsToGen ?gen .
      ?gen :genNumber ?generation .
    }
    GROUP BY ?generation
    ORDER BY ?generation
  `,

  // 9. Get top Pokemon by HP
  getTopByHP: (limit = 10) => `
    PREFIX poke: <http://example.org/pokemon/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX : <http://example.org/pokemon/>
    
    SELECT ?id ?name ?type ?hp WHERE {
      ?pokemon rdf:type :Pokemon ;
               :pokedexNumber ?id ;
               rdfs:label ?name ;
               :hasPrimaryType ?typeObj ;
               :baseHP ?hp .
      ?typeObj rdfs:label ?type .
    }
    ORDER BY DESC(?hp)
    LIMIT ${limit}
  `,

  // 10. Get top Pokemon by Attack
  getTopByAttack: (limit = 10) => `
    PREFIX poke: <http://example.org/pokemon/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX : <http://example.org/pokemon/>
    
    SELECT ?id ?name ?type ?attack WHERE {
      ?pokemon rdf:type :Pokemon ;
               :pokedexNumber ?id ;
               rdfs:label ?name ;
               :hasPrimaryType ?typeObj ;
               :baseAttack ?attack .
      ?typeObj rdfs:label ?type .
    }
    ORDER BY DESC(?attack)
    LIMIT ${limit}
  `,

  // 11. Get top Pokemon by Speed
  getTopBySpeed: (limit = 10) => `
    PREFIX poke: <http://example.org/pokemon/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX : <http://example.org/pokemon/>
    
    SELECT ?id ?name ?type ?speed WHERE {
      ?pokemon rdf:type :Pokemon ;
               :pokedexNumber ?id ;
               rdfs:label ?name ;
               :hasPrimaryType ?typeObj ;
               :baseSpeed ?speed .
      ?typeObj rdfs:label ?type .
    }
    ORDER BY DESC(?speed)
    LIMIT ${limit}
  `,

  // 12. Get average stats per type
  getAverageStatsByType: () => `
    PREFIX poke: <http://example.org/pokemon/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX : <http://example.org/pokemon/>
    
    SELECT ?type 
           (AVG(?hp) as ?avgHP) 
           (AVG(?attack) as ?avgAttack) 
           (AVG(?defense) as ?avgDefense) 
           (AVG(?spAtk) as ?avgSpAtk) 
           (AVG(?spDef) as ?avgSpDef) 
           (AVG(?speed) as ?avgSpeed) WHERE {
      ?pokemon rdf:type :Pokemon ;
               :hasPrimaryType ?typeObj ;
               :baseHP ?hp ;
               :baseAttack ?attack ;
               :baseDefense ?defense ;
               :baseSpAttack ?spAtk ;
               :baseSpDefense ?spDef ;
               :baseSpeed ?speed .
      ?typeObj rdfs:label ?type .
    }
    GROUP BY ?type
    ORDER BY ?type
  `,

  // 13. Filter Pokemon by stats range
  filterByStatsRange: (minHP, maxHP, minAttack, maxAttack) => `
    PREFIX poke: <http://example.org/pokemon/>
    PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX : <http://example.org/pokemon/>
    
    SELECT ?id ?name ?type ?hp ?attack WHERE {
      ?pokemon rdf:type :Pokemon ;
               :pokedexNumber ?id ;
               rdfs:label ?name ;
               :hasPrimaryType ?typeObj ;
               :baseHP ?hp ;
               :baseAttack ?attack .
      ?typeObj rdfs:label ?type .
      FILTER(?hp >= ${minHP} && ?hp <= ${maxHP})
      FILTER(?attack >= ${minAttack} && ?attack <= ${maxAttack})
    }
    ORDER BY ?id
  `
};

/**
 * Get a query template by name
 * @param {string} name - Query template name
 * @param {...any} args - Arguments for query template
 * @returns {string} SPARQL query string
 */
export function getQuery(name, ...args) {
  if (typeof QUERIES[name] === 'function') {
    return QUERIES[name](...args);
  }
  throw new Error('Query template "' + name + '" not found');
}
