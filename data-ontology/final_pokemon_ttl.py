#!/usr/bin/env python3
"""
Complete Pokémon Semantic Web Solution - FINAL VERSION (SPRITES UPDATE)
Includes:
- @prefix declarations
- Master data (all 18 types, generations)
- 1,025 Pokémon with correct stats and new properties
- owl:NamedIndividual declarations
- Evolution chains
- Sprites (front_shiny, back_default, back_shiny)
- REMOVED: moves, items, games
"""

import requests
import json
import urllib3
from typing import Dict, List, Optional, Tuple

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
SESSION = requests.Session()
SESSION.verify = False

BASE_URL = "https://pokeapi.co/api/v2"

def fetch_data(url: str) -> Optional[Dict]:
    try:
        response = SESSION.get(url, timeout=10)
        response.raise_for_status()
        return response.json()
    except:
        return None

def get_all_pokemon() -> List[Dict]:
    print("📥 Fetching Pokémon list...")
    url = f"{BASE_URL}/pokemon?limit=1025"
    data = fetch_data(url)
    return data.get('results', [])[:1025] if data else []

def normalize_name(name: str) -> str:
    special = {
        'nidoran-m': 'NidoranM', 'nidoran-f': 'NidoranF', 'farfetchd': 'Farfetchd',
        'type-null': 'TypeNull', 'mr-mime': 'MrMime', 'mime-jr': 'MimeJr',
        'ho-oh': 'HoOh', 'tapu-koko': 'TapuKoko', 'tapu-lele': 'TapuLele',
        'tapu-bulu': 'TapuBulu', 'tapu-fini': 'TapuFini',
    }
    return special.get(name.lower(), ''.join(w.capitalize() for w in name.lower().replace('-', ' ').split()))

def extract_stats(pokemon_data: Dict) -> tuple:
    hp = attack = defense = spattack = spdefense = speed = 0
    for stat in pokemon_data.get('stats', []):
        name = stat['stat']['name'].lower()
        val = stat['base_stat']
        if name == 'hp': hp = val
        elif name == 'attack': attack = val
        elif name == 'defense': defense = val
        elif name == 'special-attack': spattack = val
        elif name == 'special-defense': spdefense = val
        elif name == 'speed': speed = val
    return hp, attack, defense, spattack, spdefense, speed

def get_gen(poke_id: int) -> int:
    if poke_id <= 151: return 1
    elif poke_id <= 251: return 2
    elif poke_id <= 386: return 3
    elif poke_id <= 493: return 4
    elif poke_id <= 649: return 5
    elif poke_id <= 721: return 6
    elif poke_id <= 807: return 7
    elif poke_id <= 893: return 8
    else: return 9

def get_evolution_chain(poke_id: int) -> Optional[str]:
    """Get evolution relationship if exists"""
    try:
        species = fetch_data(f"{BASE_URL}/pokemon-species/{poke_id}")
        if not species or 'evolves_from_species' not in species:
            return None
        
        evolves_from = species.get('evolves_from_species')
        if evolves_from:
            return normalize_name(evolves_from['name'])
        return None
    except:
        return None

def generate_pokemon_ttl(pokemon_data: Dict) -> str:
    poke_id = normalize_name(pokemon_data['name'])
    hp, attack, defense, spattack, spdefense, speed = extract_stats(pokemon_data)
    stat_total = sum([hp, attack, defense, spattack, spdefense, speed])
    
    types = [t['type']['name'] for t in pokemon_data.get('types', [])]
    primary_type = f"poke:{types[0].capitalize()}" if types else "poke:Normal"
    secondary_type = f"poke:{types[1].capitalize()}" if len(types) > 1 else None
    
    abilities = []
    hidden_ability = None
    for ab in pokemon_data.get('abilities', []):
        ability_name = ab['ability']['name']
        if ab.get('is_hidden'):
            hidden_ability = ability_name
        else:
            if not abilities:
                abilities.append(ability_name)
    
    height_m = pokemon_data.get('height', 0) / 10
    weight_kg = pokemon_data.get('weight', 0) / 10
    gen_num = get_gen(pokemon_data['id'])
    
    sprites_data = pokemon_data.get('sprites', {})
    
    image_url = sprites_data.get('other', {}).get('official-artwork', {}).get('front_default')
    if not image_url:
        image_url = f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{pokemon_data['id']}.png"
        
    front_shiny = sprites_data.get('front_shiny')
    back_default = sprites_data.get('back_default')
    back_shiny = sprites_data.get('back_shiny')
    
    # Evolution
    evolves_from = get_evolution_chain(pokemon_data['id'])

    # New properties
    base_exp = pokemon_data.get('base_experience')
    is_default = str(pokemon_data.get('is_default', True)).lower()
    cry = pokemon_data.get('cries', {}).get('latest', '')
    
    lines = [
        "",
        f"# {poke_id} #{pokemon_data['id']}",
        f"poke:{poke_id} rdf:type owl:NamedIndividual ,",
        f"                     :Pokemon ;",
        f'    rdfs:label "{pokemon_data["name"]}" ;',
        f"    :pokedexNumber {pokemon_data['id']} ;",
        f"    :hasPrimaryType {primary_type} ;",
    ]
    
    if secondary_type:
        lines.append(f"    :hasSecondaryType {secondary_type} ;")
    
    lines.append(f"    :belongsToGen poke:Gen{gen_num} ;")
    
    if abilities:
        ability_id = ''.join(w.capitalize() for w in abilities[0].split('-'))
        lines.append(f"    :hasAbility poke:{ability_id} ;")
    
    if hidden_ability:
        hidden_id = ''.join(w.capitalize() for w in hidden_ability.split('-'))
        lines.append(f"    :hasHiddenAbility poke:{hidden_id} ;")
    
    if evolves_from:
        lines.append(f"    :evolvesFrom poke:{evolves_from} ;")
        
    if base_exp is not None:
        lines.append(f"    :baseExperience {base_exp} ;")
        
    if is_default:
        lines.append(f'    :isDefault "{is_default}"^^xsd:boolean ;')
        
    if cry:
        lines.append(f'    :cryUrl "{cry}"^^xsd:anyURI ;')
        
    if front_shiny:
        lines.append(f'    :frontShiny "{front_shiny}"^^xsd:anyURI ;')
        
    if back_default:
        lines.append(f'    :backDefault "{back_default}"^^xsd:anyURI ;')
        
    if back_shiny:
        lines.append(f'    :backShiny "{back_shiny}"^^xsd:anyURI ;')
        
    lines.extend([
        f"    :baseHP {hp} ;",
        f"    :baseAttack {attack} ;",
        f"    :baseDefense {defense} ;",
        f"    :baseSpAttack {spattack} ;",
        f"    :baseSpDefense {spdefense} ;",
        f"    :baseSpeed {speed} ;",
        f"    :baseStatTotal {stat_total} ;",
        f"    :heightM {height_m} ;",
        f"    :weightKg {weight_kg} ;",
        f'    :imageUrl "{image_url}"^^xsd:anyURI .',
    ])
    
    return '\n'.join(lines)

def main():
    print("\n🚀 Final Pokémon TTL Generator (SPRITES UPDATE)\n")
    
    pokemon_list = get_all_pokemon()
    if not pokemon_list:
        print("✗ Failed to fetch Pokémon")
        return
    
    POKEMON_TTLS = []
    
    total = len(pokemon_list)
    for idx, poke_summary in enumerate(pokemon_list, 1):
        poke_data = fetch_data(poke_summary['url'])
        if poke_data:
            ttl = generate_pokemon_ttl(poke_data)
            POKEMON_TTLS.append(ttl)
        
        if idx % 100 == 0 or idx == 1:
            pct = (idx / total) * 100
            print(f"⏳ {idx}/{total} ({pct:.0f}%) - {poke_summary['name']}")
    
    print("\n💾 Generating Master Data...")
    
    # MASTER DATA SECTION
    output = []
    output.append("@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .")
    output.append("@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .")
    output.append("@prefix owl: <http://www.w3.org/2002/07/owl#> .")
    output.append("@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .")
    output.append("@prefix poke: <http://example.org/pokemon/> .")
    output.append("@prefix : <http://example.org/pokemon/> .")
    output.append("")
    
    # MASTER: TYPES (ALL 18)
    output.append("### =======================================")
    output.append("### MASTER DATA: TIPE (18 TYPES)")
    output.append("### =======================================")
    
    types_18 = [
        "Normal", "Fire", "Water", "Electric", "Grass", "Ice",
        "Fighting", "Poison", "Ground", "Flying", "Psychic", "Bug",
        "Rock", "Ghost", "Dragon", "Dark", "Steel", "Fairy"
    ]
    
    for type_name in types_18:
        output.append(f"poke:{type_name} rdf:type owl:NamedIndividual ,")
        output.append(f"                      :Type ;")
        output.append(f'    rdfs:label "{type_name}" .')
        output.append("")
    
    # MASTER: GENERATIONS
    output.append("### =======================================")
    output.append("### MASTER DATA: GENERASI")
    output.append("### =======================================")
    for i in range(1, 10):
        output.append(f"poke:Gen{i} rdf:type owl:NamedIndividual ,")
        output.append(f"                    :Generation ;")
        output.append(f"    :genNumber {i} .")
        output.append("")
    
    # POKÉMON DATA
    output.append("### =======================================")
    output.append("### POKÉMON DATA (All 1,025 Species)")
    output.append("### =======================================")
    
    output.extend(POKEMON_TTLS)
    
    print("\n💾 Writing to file...")
    
    with open(r"c:\coding\sem 6\semweb\dinopedia\data-ontology\pokemon.ttl", 'w', encoding='utf-8') as f:
        f.write('\n'.join(output) + '\n')
    
    print(f"✅ COMPLETE!")
    print(f"✓ All 1,025 Pokémon generated")
    print(f"✓ Includes Sprites, Excludes Moves/Items/Games")
    print(f"✓ owl:NamedIndividual for all entries")

if __name__ == "__main__":
    main()
