#!/usr/bin/env python3
"""
Generate complete Pokémon TTL data from PokéAPI - OPTIMIZED VERSION
Fetches all 1,025 official Pokémon and formats them as RDF/Turtle triples
"""

import requests
import json
import urllib3
from typing import Dict, List, Optional

# Suppress SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

BASE_URL = "https://pokeapi.co/api/v2"
SESSION = requests.Session()
SESSION.verify = False

def fetch_data(url: str) -> Optional[Dict]:
    """Fetch JSON data from URL with error handling"""
    try:
        response = SESSION.get(url, timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"✗ Error: {e}")
        return None

def get_all_pokemon() -> List[Dict]:
    """Fetch complete list of all Pokémon"""
    print("📥 Fetching Pokémon list...")
    all_pokemon = []
    
    url = f"{BASE_URL}/pokemon?limit=1025"
    data = fetch_data(url)
    if data:
        all_pokemon = data.get('results', [])[:1025]
        print(f"✓ Found {len(all_pokemon)} Pokémon")
    
    return all_pokemon

def normalize_pokemon_name(name: str) -> str:
    """Normalize Pokémon name for use as TTL ID"""
    special_cases = {
        'nidoran-m': 'NidoranM',
        'nidoran-f': 'NidoranF',
        'farfetchd': 'Farfetchd',
        'type-null': 'TypeNull',
        'mr-mime': 'MrMime',
        'mime-jr': 'MimeJr',
        'ho-oh': 'HoOh',
        'tapu-koko': 'TapuKoko',
        'tapu-lele': 'TapuLele',
        'tapu-bulu': 'TapuBulu',
        'tapu-fini': 'TapuFini',
        'nidoran♂': 'NidoranM',
        'nidoran♀': 'NidoranF',
    }
    
    name_lower = name.lower()
    if name_lower in special_cases:
        return special_cases[name_lower]
    
    return ''.join(word.capitalize() for word in name_lower.replace('-', ' ').split())

def get_type_id(type_name: str) -> str:
    """Get TTL ID for type"""
    return type_name.capitalize()

def get_ability_id(ability_name: str) -> str:
    """Get TTL ID for ability"""
    return ''.join(word.capitalize() for word in ability_name.split('-'))

def get_gen_from_pokemon_id(pokemon_id: int) -> int:
    """Determine generation from Pokémon ID"""
    if pokemon_id <= 151:
        return 1
    elif pokemon_id <= 251:
        return 2
    elif pokemon_id <= 386:
        return 3
    elif pokemon_id <= 493:
        return 4
    elif pokemon_id <= 649:
        return 5
    elif pokemon_id <= 721:
        return 6
    elif pokemon_id <= 807:
        return 7
    elif pokemon_id <= 893:
        return 8
    else:
        return 9

def generate_pokemon_ttl(pokemon_data: Dict) -> str:
    """Generate TTL entry for single Pokémon"""
    
    pokemon_id = normalize_pokemon_name(pokemon_data['name'])
    
    # Stats
    stats_map = {}
    for stat in pokemon_data.get('stats', []):
        stat_name = stat['stat']['name'].replace('-', '')
        stats_map[stat_name] = stat['base_stat']
    
    hp = stats_map.get('hp', 0)
    attack = stats_map.get('attack', 0)
    defense = stats_map.get('defense', 0)
    spattack = stats_map.get('spattack', 0)
    spdefense = stats_map.get('spdefense', 0)
    speed = stats_map.get('speed', 0)
    stat_total = sum([hp, attack, defense, spattack, spdefense, speed])
    
    # Types
    types = [t['type']['name'] for t in pokemon_data.get('types', [])]
    primary_type = get_type_id(types[0]) if types else 'Normal'
    secondary_type = get_type_id(types[1]) if len(types) > 1 else None
    
    # Abilities
    abilities = []
    hidden_ability = None
    for ability_data in pokemon_data.get('abilities', []):
        ability_name = ability_data['ability']['name']
        if ability_data.get('is_hidden'):
            hidden_ability = ability_name
        else:
            if not abilities:  # Only take first non-hidden
                abilities.append(ability_name)
    
    # Dimensions
    height_m = pokemon_data.get('height', 0) / 10
    weight_kg = pokemon_data.get('weight', 0) / 10
    
    # Generation
    gen_num = get_gen_from_pokemon_id(pokemon_data['id'])
    gen_id = f"Gen{gen_num}"
    
    # Image
    image_url = pokemon_data.get('sprites', {}).get('other', {}).get('official-artwork', {}).get('front_default')
    if not image_url:
        image_url = f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{pokemon_data['id']}.png"
    
    # Build TTL
    lines = []
    lines.append("")
    lines.append(f"# {pokemon_id} #{pokemon_data['id']}")
    lines.append(f":{pokemon_id} rdf:type :Pokemon ;")
    lines.append(f'    :name "{pokemon_data["name"]}" ;')
    lines.append(f"    :pokedexNumber {pokemon_data['id']} ;")
    lines.append(f"    :hasPrimaryType :{primary_type} ;")
    
    if secondary_type:
        lines.append(f"    :hasSecondaryType :{secondary_type} ;")
    
    lines.append(f"    :belongsToGen :{gen_id} ;")
    
    if abilities:
        ability_id = get_ability_id(abilities[0])
        lines.append(f"    :hasAbility :{ability_id} ;")
    
    if hidden_ability:
        hidden_ability_id = get_ability_id(hidden_ability)
        lines.append(f"    :hasHiddenAbility :{hidden_ability_id} ;")
    
    lines.append(f"    :baseHP {hp} ;")
    lines.append(f"    :baseAttack {attack} ;")
    lines.append(f"    :baseDefense {defense} ;")
    lines.append(f"    :baseSpAttack {spattack} ;")
    lines.append(f"    :baseSpDefense {spdefense} ;")
    lines.append(f"    :baseSpeed {speed} ;")
    lines.append(f"    :baseStatTotal {stat_total} ;")
    lines.append(f"    :heightM {height_m} ;")
    lines.append(f"    :weightKg {weight_kg} ;")
    lines.append(f'    :imageUrl "{image_url}"^^xsd:anyURI .')
    
    return '\n'.join(lines)

def main():
    print("\n🚀 Starting Pokémon TTL Generation...\n")
    
    # Get all Pokémon summaries
    pokemon_summaries = get_all_pokemon()
    if not pokemon_summaries:
        print("✗ Failed to fetch Pokémon list")
        return
    
    # Read existing header
    print("📖 Reading existing file...")
    try:
        with open(r"c:\coding\sem 6\semweb\dinopedia\pokemon.ttl", 'r', encoding='utf-8') as f:
            existing = f.read()
    except:
        existing = ""
    
    # Find insertion point
    if "### POKÉMON DATA" in existing or "### INDIVIDU POKÉMON" in existing:
        marker = "### POKÉMON DATA" if "### POKÉMON DATA" in existing else "### INDIVIDU POKÉMON"
        pos = existing.find(marker)
        if pos >= 0:
            pos = existing.rfind('\n', 0, pos) + 1
            prefix = existing[:pos]
        else:
            prefix = existing
    else:
        prefix = existing
    
    # Generate new content
    output_lines = [
        "",
        "### =======================================",
        "### POKÉMON DATA (All 1,025 Species)",
        "### =======================================",
    ]
    
    total = len(pokemon_summaries)
    for idx, poke_summary in enumerate(pokemon_summaries, 1):
        # Fetch full data
        poke_data = fetch_data(poke_summary['url'])
        if poke_data:
            ttl = generate_pokemon_ttl(poke_data)
            output_lines.append(ttl)
        
        # Progress
        if idx % 25 == 0 or idx == 1:
            pct = (idx / total) * 100
            print(f"⏳ Progress: {idx}/{total} ({pct:.1f}%) - {poke_summary['name']}")
    
    print("\n💾 Writing to file...")
    
    # Write complete file
    complete_output = prefix + '\n'.join(output_lines) + '\n'
    
    try:
        with open(r"c:\coding\sem 6\semweb\dinopedia\pokemon.ttl", 'w', encoding='utf-8') as f:
            f.write(complete_output)
        print(f"✓ Success! Generated TTL for {total} Pokémon")
        print(f"✓ Saved to: c:\\coding\\sem 6\\semweb\\dinopedia\\pokemon.ttl")
    except Exception as e:
        print(f"✗ Error writing file: {e}")

if __name__ == "__main__":
    main()
