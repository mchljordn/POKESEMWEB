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
      return Response.json({ error: 'Pokemon with ID ' + pokemonId + ' not found' }, { status: 404 });
    }

    const hp = parseInt(binding.hp?.value || '0', 10);
    const attack = parseInt(binding.attack?.value || '0', 10);
    const defense = parseInt(binding.defense?.value || '0', 10);
    const spAttack = parseInt(binding.spAtk?.value || '0', 10);
    const spDefense = parseInt(binding.spDef?.value || '0', 10);
    const speed = parseInt(binding.speed?.value || '0', 10);
    const total = hp + attack + defense + spAttack + spDefense + speed;

    const currentName = binding.name?.value || "";
    const currentEvolvesFrom = binding.evolvesFrom?.value || "";

    // ========================================================================
    // STRATEGI BARU: AMBIL DAFTAR NAMA KELUARGA DULU SECARA SPESIFIK
    // ========================================================================
    const familyNames: string[] = [currentName.toLowerCase()];
    let rootName = currentName.toLowerCase();

    // 1. CARI AKAR TERATAS (STAGE 1)
    // Jika Pokemon saat ini punya induk (Stage 2 atau 3)
    if (currentEvolvesFrom) {
      const parentName = currentEvolvesFrom.toLowerCase();
      familyNames.push(parentName);
      rootName = parentName; // Geser dugaan root ke induk

      // Cek apakah induknya punya induk lagi (Kakek / Stage 1 asli)
      const grandParentQuery = `
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        SELECT DISTINCT ?grandParentName WHERE {
          ?pMember <http://example.org/pokemon/evolvesFrom> ?gpURI .
          ?pMember rdfs:label "${parentName}" .
          ?gpURI rdfs:label ?grandParentName .
        }
      `;
      const gpResult = await executeSparqlQuery(grandParentQuery);
      const gpName = gpResult.results?.bindings?.[0]?.grandParentName?.value;
      if (gpName) {
        const cleanGPName = gpName.toLowerCase();
        familyNames.push(cleanGPName);
        rootName = cleanGPName; // Akar asli ditemukan (Stage 1)
      }
    }

    // 2. TARIK SEMUA KETURUNAN DARI SI ROOT (DARI STAGE 1 TURUN KE STAGE 2 & 3)
    // Cari anak-anak dari root (Stage 2)
    const childrenQuery = `
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      SELECT DISTINCT ?childName WHERE {
        ?child <http://example.org/pokemon/evolvesFrom> ?parentURI .
        ?parentURI rdfs:label "${rootName}" .
        ?child rdfs:label ?childName .
      }
    `;
    const childrenResult = await executeSparqlQuery(childrenQuery);
    const stage2Names: string[] = [];
    
    childrenResult.results?.bindings?.forEach((b: any) => {
      if (b.childName?.value) {
        const cName = b.childName.value.toLowerCase();
        familyNames.push(cName);
        stage2Names.push(cName); // Simpan daftar anak buat nyari cucu
      }
    });

    // Cari cucu-cucu dari root (Stage 3) berdasarkan daftar anak Stage 2 yang didapat
    if (stage2Names.length > 0) {
      const formattedStage2 = stage2Names.map(n => `"${n}"`).join(", ");
      const grandChildrenQuery = `
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        SELECT DISTINCT ?grandChildName WHERE {
          ?gChild <http://example.org/pokemon/evolvesFrom> ?pURI .
          ?pURI rdfs:label ?pName .
          ?gChild rdfs:label ?grandChildName .
          FILTER(STR(?pName) IN (${formattedStage2}))
        }
      `;
      const gcResult = await executeSparqlQuery(grandChildrenQuery);
      gcResult.results?.bindings?.forEach((b: any) => {
        if (b.grandChildName?.value) familyNames.push(b.grandChildName.value.toLowerCase());
      });
    }

    // Bersihkan duplikat nama di array keluarga
    const uniqueFamilyNames = Array.from(new Set(familyNames));

    // ========================================================================
    // QUERY UTAMA EVOLUSI: Hanya tarik data dari list nama yang sudah pasti sah!
    // ========================================================================
    // Kita ubah array nama menjadi format string SPARQL filter: "starmie", "staryu"
    const formattedNames = uniqueFamilyNames.map(name => `"${name}"`).join(", ");

    const evolutionQuery = `
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      
      SELECT DISTINCT ?id ?name ?primaryType ?secondaryType ?imageUrl ?memberEvolvesFrom WHERE {
        ?evoMember <http://example.org/pokemon/pokedexNumber> ?id ;
                   <http://example.org/pokemon/hasPrimaryType> ?pTypeURI ;
                   rdfs:label ?name .
                   
        OPTIONAL { ?evoMember <http://example.org/pokemon/hasSecondaryType> ?sTypeURI }
        OPTIONAL { ?evoMember <http://example.org/pokemon/imageUrl> ?imageUrl }
        OPTIONAL { 
          ?evoMember <http://example.org/pokemon/evolvesFrom> ?pURI .
          ?pURI rdfs:label ?memberEvolvesFrom .
        }
        
        # Kunci rapat! Hanya ambil Node yang namanya ada di daftar keluarga inti
        FILTER (STR(?name) IN (${formattedNames}))
      }
    `;

    const evoResult = await executeSparqlQuery(evolutionQuery);

    // Mapping hasil beralih ke format frontend
    const evolutionChain = evoResult.results?.bindings?.map((b: any) => {
      const pType = b.primaryType?.value || b.pTypeURI?.value || "";
      const sType = b.secondaryType?.value || b.sTypeURI?.value || null;
      const mEvolvesFrom = b.memberEvolvesFrom?.value || "";

      // Bersihkan teks URL URI jika terbawa
      const cleanPType = pType.replace("http://example.org/pokemon/", "");
      const cleanSType = sType ? sType.replace("http://example.org/pokemon/", "") : null;

      // Hitung stage secara mandiri di level kode Node.js (Jauh lebih aman daripada BIND Fuseki)
      let calculatedStage = 1;
      if (mEvolvesFrom) {
        calculatedStage = 2;
        // Kasus khusus jika dia adalah cucu (Stage 3): jika induknya juga punya induk di data kita
        const parentName = mEvolvesFrom.toLowerCase();
        const hasGrandParent = evoResult.results?.bindings?.some((x: any) => {
          const xName = x.name?.value || "";
          const xEvolvesFrom = x.memberEvolvesFrom?.value || "";
          return xName.toLowerCase() === parentName && xEvolvesFrom !== "";
        });
        if (hasGrandParent) calculatedStage = 3;
      }

      return {
        id: parseInt(b.id?.value, 10),
        name: b.name?.value,
        primaryType: cleanPType,
        secondaryType: cleanSType,
        stage: calculatedStage,
        imageUrl: b.imageUrl?.value || null
      };
    }) || [];

    // Mengurutkan silsilah berdasarkan ID agar tidak acak-acakan di UI
    evolutionChain.sort((a, b) => a.id - b.id);

    // ========================================================================

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
      stats: { hp, attack, defense, spAttack, spDefense, speed, total },
      evolutionChain
    };

    pokemon.stats.total = Object.values(pokemon.stats).reduce((a, b) => a + b, 0);

    return Response.json({ pokemon, timestamp: new Date().toISOString() });
  } catch (error: any) {
    return Response.json({
      error: error.message
    }, {
      status: 500
    });
  }
}