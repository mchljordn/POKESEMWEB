/**
 * GET /api/pokemon/[id]
 * Get detailed Pokemon data by Pokedex number
 */

import { executeSparqlQuery } from '@/lib/fuseki';
import { getQuery } from '@/lib/queries';

export async function GET(request, { params }) {
  const { id } = params;

  // Validate ID is a number
  const pokemonId = parseInt(id, 10);
  if (isNaN(pokemonId) || pokemonId < 1) {
    return Response.json({
      error: 'Invalid Pokemon ID. Must be a positive integer.'
    }, {
      status: 400
    });
  }

  try {
    const query = getQuery('getPokemonById', pokemonId);
    const result = await executeSparqlQuery(query);
    const binding = result.results?.bindings?.[0];

    if (!binding) {
      return Response.json({
        error: 'Pokemon with ID ' + pokemonId + ' not found'
      }, {
        status: 404
      });
    }

    const pokemon = {
      id: parseInt(binding.id?.value),
      name: binding.name?.value,
      type: binding.type?.value,
      generation: binding.generation?.value,
      stats: {
        hp: parseInt(binding.hp?.value),
        attack: parseInt(binding.attack?.value),
        defense: parseInt(binding.defense?.value),
        spAttack: parseInt(binding.spAtk?.value),
        spDefense: parseInt(binding.spDef?.value),
        speed: parseInt(binding.speed?.value)
      }
    };

    // Calculate total stats
    pokemon.stats.total = Object.values(pokemon.stats).reduce((a, b) => a + b, 0);

    return Response.json({
      pokemon,
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
