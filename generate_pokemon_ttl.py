#!/usr/bin/env python3
"""
Generate complete Pokémon TTL data from PokéAPI
Fetches all 1,025 official Pokémon and formats them as RDF/Turtle triples
"""

import requests
import json
from collections import defaultdict
import time

BASE_URL = "https://pokeapi.co/api/v2"

# Cache for generation and region data
gens_cache = {}
regions_cache = {}
types_cache = set()
abilities_cache = {}

def get_or_fetch(url, cache_key=None):
    """Fetch data with simple caching"""
    try:
        response = requests.get(url, timeout=10, verify=False)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error fetching {url}: {e}")
        return None

def get_generation_ttl_id(gen_number):
    """Convert generation number to TTL ID"""
    return f"Gen{gen_number}"

def get_region_ttl_id(region_name):
    """Convert region name to TTL ID"""
    name_map = {
        "kanto": "Kanto",
        "johto": "Johto",
        "hoenn": "Hoenn",
        "sinnoh": "Sinnoh",
        "unova": "Unova",
        "kalos": "Kalos",
        "alola": "Alola",
        "galar": "Galar",
        "paldea": "Paldea"
    }
    return name_map.get(region_name.lower(), region_name)

def get_type_ttl_id(type_name):
    """Convert type name to TTL ID (capitalize)"""
    return type_name.capitalize()

def get_ability_ttl_id(ability_name):
    """Convert ability name to TTL ID (remove hyphens, capitalize)"""
    return ''.join(word.capitalize() for word in ability_name.split('-'))

def normalize_pokemon_name(name):
    """Normalize Pokémon name for use as TTL ID"""
    # Handle special cases
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
    
    # Remove hyphens and spaces, capitalize each word
    return ''.join(word.capitalize() for word in name_lower.replace('-', ' ').split())

def fetch_all_pokemon():
    """Fetch all Pokémon from API"""
    print("Fetching all Pokémon data...")
    pokemon_list = []
    
    # PokéAPI limits results to 1000 per request, so we need pagination
    limit = 1000
    offset = 0
    
    while offset < 1025:
        url = f"{BASE_URL}/pokemon?limit={limit}&offset={offset}"
        data = get_or_fetch(url)
        if not data:
            break
        
        pokemon_list.extend(data['results'])
        offset += limit
        
        if not data.get('next'):
            break
    
    print(f"Found {len(pokemon_list)} Pokémon")
    return pokemon_list[:1025]  # Limit to 1025 official

def fetch_pokemon_details(pokemon_name_or_id):
    """Fetch detailed data for a specific Pokémon"""
    url = f"{BASE_URL}/pokemon/{pokemon_name_or_id}"
    return get_or_fetch(url)

def fetch_species_details(pokemon_id):
    """Fetch species data for evolutionary relationships"""
    url = f"{BASE_URL}/pokemon-species/{pokemon_id}"
    return get_or_fetch(url)

def escape_string(s):
    """Escape special characters in TTL strings"""
    if s is None:
        return '""'
    s = str(s)
    s = s.replace('\\', '\\\\')
    s = s.replace('"', '\\"')
    s = s.replace('\n', '\\n')
    s = s.replace('\r', '\\r')
    return f'"{s}"'

def generate_pokemon_ttl(pokemon_data, species_data, order_num):
    """Generate TTL triples for a single Pokémon"""
    
    ttl_lines = []
    
    # Determine Pokémon ID (use TTL-safe name)
    pokemon_id = normalize_pokemon_name(pokemon_data['name'])
    
    # Determine generation
    generation = species_data.get('generation', {}).get('name', 'generation-i').replace('generation-', '')
    gen_number = {'i': 1, 'ii': 2, 'iii': 3, 'iv': 4, 'v': 5, 'vi': 6, 'vii': 7, 'viii': 8, 'ix': 9}.get(generation, 1)
    gen_ttl_id = get_generation_ttl_id(gen_number)
    
    # Base stats
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
    primary_type = types[0] if len(types) > 0 else 'normal'
    secondary_type = types[1] if len(types) > 1 else None
    
    # Abilities
    abilities = []
    hidden_ability = None
    for ability_data in pokemon_data.get('abilities', []):
        ability_name = ability_data['ability']['name']
        if ability_data.get('is_hidden'):
            hidden_ability = ability_name
        else:
            abilities.append(ability_name)
    
    # Dimensions
    height_m = pokemon_data.get('height', 0) / 10  # Convert from decimeters to meters
    weight_kg = pokemon_data.get('weight', 0) / 10  # Convert from hectograms to kg
    
    # Capture rate and color (from species data)
    capture_rate = species_data.get('capture_rate', 45)
    
    # Image URL
    image_url = pokemon_data['sprites'].get('other', {}).get('official-artwork', {}).get('front_default')
    if not image_url:
        image_url = f"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{pokemon_data['id']}.png"
    
    # Evolution info
    evolution_chain = species_data.get('evolves_from_species')
    
    # Build TTL
    ttl_lines.append("")
    ttl_lines.append(f"# --- {pokemon_id.upper()} (#{pokemon_data['id']}) ---")
    
    # Determine Pokémon class (Starter, Legendary, etc.)
    is_starter = pokemon_data['id'] in [1, 4, 7, 25, 152, 155, 158, 172, 175, 246, 258, 261, 273, 333, 339, 345, 352, 355, 360, 363, 371, 374, 393, 399, 403, 406, 495, 498, 501, 540, 551, 554, 557, 560, 566, 569, 572, 577, 580, 585, 588, 595, 599, 603, 606, 610, 619, 622, 629, 632, 677, 679, 682, 686, 690, 696, 700]
    pokemon_class = "StarterPokemon" if is_starter else "Pokemon"
    
    ttl_lines.append(f":{pokemon_id} rdf:type :{pokemon_class} ;")
    ttl_lines.append(f'    :name "{pokemon_data["name"]}" ;')
    ttl_lines.append(f"    :pokedexNumber {pokemon_data['id']} ;")
    
    # Types
    primary_type_id = get_type_ttl_id(primary_type)
    ttl_lines.append(f"    :hasPrimaryType :{primary_type_id} ;")
    if secondary_type:
        secondary_type_id = get_type_ttl_id(secondary_type)
        ttl_lines.append(f"    :hasSecondaryType :{secondary_type_id} ;")
    
    # Generation
    ttl_lines.append(f"    :belongsToGen :{gen_ttl_id} ;")
    
    # Abilities
    if abilities:
        ability_id = get_ability_ttl_id(abilities[0])
        ttl_lines.append(f"    :hasAbility :{ability_id} ;")
    
    if hidden_ability:
        hidden_ability_id = get_ability_ttl_id(hidden_ability)
        ttl_lines.append(f"    :hasHiddenAbility :{hidden_ability_id} ;")
    
    # Base stats
    ttl_lines.append(f"    :baseHP {hp} ;")
    ttl_lines.append(f"    :baseAttack {attack} ;")
    ttl_lines.append(f"    :baseDefense {defense} ;")
    ttl_lines.append(f"    :baseSpAttack {spattack} ;")
    ttl_lines.append(f"    :baseSpDefense {spdefense} ;")
    ttl_lines.append(f"    :baseSpeed {speed} ;")
    ttl_lines.append(f"    :baseStatTotal {stat_total} ;")
    
    # Dimensions
    ttl_lines.append(f"    :heightM {height_m} ;")
    ttl_lines.append(f"    :weightKg {weight_kg} ;")
    ttl_lines.append(f"    :captureRate {capture_rate} ;")
    
    # Image URL
    if image_url:
        ttl_lines.append(f'    :imageUrl "{image_url}"^^xsd:anyURI .')
    else:
        ttl_lines.append('    :imageUrl ""^^xsd:anyURI .')
    
    return '\n'.join(ttl_lines)

def main():
    print("Starting Pokémon TTL generation...")
    
    # Fetch all Pokémon
    pokemon_list = fetch_all_pokemon()
    
    if not pokemon_list:
        print("Failed to fetch Pokémon list")
        return
    
    ttl_content = []
    ttl_content.append("")
    ttl_content.append("### =======================================")
    ttl_content.append("### POKÉMON DATA (All 1,025 Species)")
    ttl_content.append("### =======================================")
    
    # Process each Pokémon
    for idx, pokemon_summary in enumerate(pokemon_list, 1):
        print(f"Processing Pokémon {idx}/1025: {pokemon_summary['name']}", end='\r')
        
        # Fetch full details
        pokemon_data = fetch_pokemon_details(pokemon_summary['name'])
        if not pokemon_data:
            continue
        
        # Fetch species data for evolution info
        species_data = fetch_species_details(pokemon_data['id'])
        if not species_data:
            species_data = {}
        
        # Generate TTL
        pokemon_ttl = generate_pokemon_ttl(pokemon_data, species_data, idx)
        ttl_content.append(pokemon_ttl)
        
        # Rate limiting to avoid overwhelming the API
        if idx % 10 == 0:
            time.sleep(0.1)
    
    print("\nWriting to file...")
    
    # Read existing file
    try:
        with open("c:\\coding\\sem 6\\semweb\\dinopedia\\pokemon.ttl", 'r', encoding='utf-8') as f:
            existing_content = f.read()
    except:
        existing_content = ""
    
    # Find the position to insert (after master data, before "### INDIVIDU POKÉMON")
    if "### INDIVIDU POKÉMON" in existing_content:
        insert_pos = existing_content.find("### INDIVIDU POKÉMON")
        # Skip to end of that line
        insert_pos = existing_content.find('\n', insert_pos) + 1
        prefix = existing_content[:insert_pos]
    else:
        prefix = existing_content
    
    # Combine
    full_ttl = prefix + '\n'.join(ttl_content)
    
    # Write to file
    with open("c:\\coding\\sem 6\\semweb\\dinopedia\\pokemon.ttl", 'w', encoding='utf-8') as f:
        f.write(full_ttl)
    
    print(f"✓ Successfully generated TTL for {len(pokemon_list)} Pokémon!")
    print(f"✓ File written to: c:\\coding\\sem 6\\semweb\\dinopedia\\pokemon.ttl")

if __name__ == "__main__":
    main()
