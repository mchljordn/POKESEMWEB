/**
 * GET /api/pokemon/[id]
 * Get detailed Pokemon data by Pokedex number
 */

import { executeSparqlQuery } from "../../../../lib/fuseki";
import { getQuery } from "../../../../lib/queries";

interface RouteContext {
  params: Promise<{ id: string }> | { id: string };
}
export async function GET(request: Request, context: RouteContext) {
  const params = await context.params;
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
    const binding = result.results?.bindings?.[0] as any;

    if (!binding) {
      return Response.json({
        error: 'Pokemon with ID ' + pokemonId + ' not found'
      }, {
        status: 404
      });
    }

    const hp = parseInt(binding.hp?.value || '0', 10);
    const attack = parseInt(binding.attack?.value || '0', 10);
    const defense = parseInt(binding.defense?.value || '0', 10);
    const spAttack = parseInt(binding.spAtk?.value || '0', 10);
    const spDefense = parseInt(binding.spDef?.value || '0', 10);
    const speed = parseInt(binding.speed?.value || '0', 10);
    
    // Hitung total stat secara eksplisit (lebih cepat & aman di TypeScript)
    const total = hp + attack + defense + spAttack + spDefense + speed;

    const pokemon = {
      id: parseInt(binding.id?.value, 10),
      name: binding.name?.value,
      primaryType: binding.primaryType?.value,
      secondaryType: binding.secondaryType?.value || null,
      generation: binding.generation?.value,
      height: parseFloat(binding.height?.value || '0'),
      weight: parseFloat(binding.weight?.value || '0'),
      imageUrl: binding.imageUrl?.value || null,
      ability: binding.ability?.value || null,
      hiddenAbility: binding.hiddenAbility?.value || null,
      evolvesFrom: binding.evolvesFrom?.value || null,
      stats: {
        hp,
        attack,
        defense,
        spAttack,
        spDefense,
        speed,
        total
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
