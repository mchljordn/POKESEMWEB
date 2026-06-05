/**
 * GET /api/pokemon
 * List all Pokemon with optional search, filter, and sort
 */

import { executeSparqlQuery } from "../../../lib/fuseki";
import { getQuery } from "../../../lib/queries";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const type = searchParams.get('type');
  const sort = searchParams.get('sort') || 'id'; // id, name, type
  const limit = parseInt(searchParams.get('limit') || '100', 10);

  try {
    let query;

    // Determine which query to use based on filters
    if (search && search.trim().length > 0) {
      query = getQuery('searchPokemonByName', search);
    } else if (type && type.trim().length > 0) {
      query = getQuery('getPokemonByType', type);
    } else {
      query = getQuery('getAllPokemon');
    }

    const result = await executeSparqlQuery(query);
    let pokemon = result.results?.bindings || [];

    // Apply sorting
    if (sort === 'name') {
      pokemon.sort((a, b) => 
        (a.name?.value || '').localeCompare(b.name?.value || '')
      );
    } else if (sort === 'type') {
      pokemon.sort((a, b) => 
        (a.type?.value || '').localeCompare(b.type?.value || '')
      );
    } else {
      // Default: sort by id
      pokemon.sort((a, b) => 
        parseInt(a.id?.value || 0) - parseInt(b.id?.value || 0)
      );
    }

    // Apply limit
    pokemon = pokemon.slice(0, limit);

  return Response.json({
    pokemon: pokemon.map(p => ({
      id: parseInt(p.id?.value),
      name: p.name?.value,
      primaryType: p.primaryType?.value,
      secondaryType: p.secondaryType?.value || null, // Menghandle null jika tipe tunggal
      generation: p.generation?.value,
      imageUrl: p.imageUrl?.value || null           // Menghandle URL gambar
    })),
    count: pokemon.length,
    filters: { search, type, sort, limit },
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
