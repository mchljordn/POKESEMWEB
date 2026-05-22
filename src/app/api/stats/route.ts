/**
 * GET /api/stats
 * Aggregated statistics: count per type/generation, top stats, averages
 */

import { executeSparqlQuery } from "../../../lib/fuseki";
import { getQuery } from "../../../lib/queries";

interface StatsData {
  perType?: { type: string; count: number }[];
  perGeneration?: { generation: number; count: number }[];
  topHP?: { id: number; name: string; type: string; hp: number }[];
  topAttack?: { id: number; name: string; type: string; attack: number }[];
  topSpeed?: { id: number; name: string; type: string; speed: number }[];
  averageStats?: {
    type: string;
    avgHP: number;
    avgAttack: number;
    avgDefense: number;
    avgSpAtk: number;
    avgSpDef: number;
    avgSpeed: number;
  }[];
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const stat = searchParams.get('stat') || 'overview';

  try {
    let query;
    let data: StatsData = {};

    switch (stat) {
      case 'overview':
        // All stats overview
        query = getQuery('countPokemonPerType');
        const typeCount = await executeSparqlQuery(query);
        data.perType = (typeCount.results?.bindings || []).map(b => ({
          type: b.type?.value,
          count: parseInt(b.count?.value)
        }));

        query = getQuery('countPokemonPerGeneration');
        const genCount = await executeSparqlQuery(query);
        data.perGeneration = (genCount.results?.bindings || []).map(b => ({
          generation: parseInt(b.generation?.value),
          count: parseInt(b.count?.value)
        }));
        break;

      case 'topHP':
        query = getQuery('getTopByHP', 10);
        const topHP = await executeSparqlQuery(query);
        data.topHP = (topHP.results?.bindings || []).map(b => ({
          id: parseInt(b.id?.value),
          name: b.name?.value,
          type: b.type?.value,
          hp: parseInt(b.hp?.value)
        }));
        break;

      case 'topAttack':
        query = getQuery('getTopByAttack', 10);
        const topAttack = await executeSparqlQuery(query);
        data.topAttack = (topAttack.results?.bindings || []).map(b => ({
          id: parseInt(b.id?.value),
          name: b.name?.value,
          type: b.type?.value,
          attack: parseInt(b.attack?.value)
        }));
        break;

      case 'topSpeed':
        query = getQuery('getTopBySpeed', 10);
        const topSpeed = await executeSparqlQuery(query);
        data.topSpeed = (topSpeed.results?.bindings || []).map(b => ({
          id: parseInt(b.id?.value),
          name: b.name?.value,
          type: b.type?.value,
          speed: parseInt(b.speed?.value)
        }));
        break;

      case 'averageStats':
        query = getQuery('getAverageStatsByType');
        const avgStats = await executeSparqlQuery(query);
        data.averageStats = (avgStats.results?.bindings || []).map(b => ({
          type: b.type?.value,
          avgHP: Math.round(parseFloat(b.avgHP?.value) || 0),
          avgAttack: Math.round(parseFloat(b.avgAttack?.value) || 0),
          avgDefense: Math.round(parseFloat(b.avgDefense?.value) || 0),
          avgSpAtk: Math.round(parseFloat(b.avgSpAtk?.value) || 0),
          avgSpDef: Math.round(parseFloat(b.avgSpDef?.value) || 0),
          avgSpeed: Math.round(parseFloat(b.avgSpeed?.value) || 0)
        }));
        break;

      default:
        return Response.json({
          error: 'Unknown stat: ' + stat + '. Available: overview, topHP, topAttack, topSpeed, averageStats'
        }, {
          status: 400
        });
    }

    return Response.json({
      stat,
      data,
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
