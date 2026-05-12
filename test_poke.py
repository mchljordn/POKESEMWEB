import requests
import json
import time
import os

BASE_URL = "https://pokeapi.co/api/v2"

def get_or_fetch(url):
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def main():
    print("Starting simplified Pokémon TTL generation...")
    # Get the list of all pokemon
    response = requests.get(f"{BASE_URL}/pokemon?limit=1025", timeout=10)
    pokemon_list = response.json()['results']
    
    ttl_lines = ["@prefix : <http://example.org/pokemon#> .", "@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .", ""]
    
    for idx, p in enumerate(pokemon_list, 1):
        name = p['name']
        print(f"Processing {idx}/1025: {name}", end='\r')
        data = get_or_fetch(p['url'])
        if data:
            ttl_lines.append(f":{name} a :Pokemon ;")
            ttl_lines.append(f"    :id {data['id']} ;")
            ttl_lines.append(f"    :name \"{name}\" ;")
            ttl_lines.append(f"    :height {data['height']} ;")
            ttl_lines.append(f"    :weight {data['weight']} .")
            ttl_lines.append("")
    
    with open("pokemon_simple.ttl", "w", encoding="utf-8") as f:
        f.write("\n".join(ttl_lines))
    print(f"\nDone! Generated pokemon_simple.ttl")

if __name__ == '__main__':
    main()
