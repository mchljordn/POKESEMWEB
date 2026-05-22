"use client";

import { useEffect, useState } from "react";
import { Search, Funnel, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

// 1. DEFINISI TIPE TS UNTUK POKEMON
interface Pokemon {
  id: number;
  name: string;
  primaryType: string;
  secondaryType: string | null;
  generation: string;
  imageUrl: string | null;
  region?: string; // region asal (bisa kita simpulkan dari gen)
}

// Helper untuk menyimpulkan Region asal berdasarkan Generasi
const getRegionName = (gen: string): string => {
  const regions: Record<string, string> = {
    "1": "Kanto Region",
    "2": "Johto Region",
    "3": "Hoenn Region",
    "4": "Sinnoh Region",
    "5": "Unova Region",
    "6": "Kalos Region",
    "7": "Alola Region",
    "8": "Galar Region",
    "9": "Paldea Region",
  };
  return regions[gen] || "Unknown";
};

// 2. PEMETAAN WARNA TIPE POKEMON
const typeColors: Record<string, string> = {
  grass: "bg-[#4A9641]",
  poison: "bg-[#9F5BBA]",
  fire: "bg-[#E6732B]",
  water: "bg-[#4E90D6]",
  flying: "bg-[#8EA8DE]",
  electric: "bg-[#EBB72E]",
  normal: "bg-[#929BA3]",
  bug: "bg-[#8CB320]",
  ground: "bg-[#D97845]",
  rock: "bg-[#C5B78C]",
  fairy: "bg-[#EE90E6]",
  psychic: "bg-[#F55B73]",
  ghost: "bg-[#5269AD]",
  ice: "bg-[#74CEC0]",
  dragon: "bg-[#0C69C8]",
  dark: "bg-[#5A5465]",
  steel: "bg-[#5A8F9E]",
  fighting: "bg-[#D3425F]",
};

export default function Pokedex() {
  const [allPokemon, setAllPokemon] = useState<Pokemon[]>([]);
  const [filteredPokemon, setFilteredPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("");
  const limitPerPage = 16; 

  // Fetch data dari API backend Next.js
  useEffect(() => {
    async function fetchPokemon() {
      try {
        setLoading(true);
        // Kita panggil API lokal kita
        const res = await fetch("/api/pokemon?limit=1025");
        const data = await res.json();
        
        if (data.pokemon) {
          // Map data sekalian menambahkan region
          const mapped = data.pokemon.map((p: any) => ({
            ...p,
            region: getRegionName(p.generation),
          }));
          setAllPokemon(mapped);
          setFilteredPokemon(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch Pokémon:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPokemon();
  }, []);

  // Filter & Search Logic
  useEffect(() => {
    let result = allPokemon;

    // Filter by Search (Name or ID)
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.id.toString() === term ||
          `#${p.id.toString().padStart(4, "0")}`.includes(term)
      );
    }

    // Filter by Type
    if (selectedType !== "") {
      result = result.filter(
        (p) =>
          p.primaryType.toLowerCase() === selectedType.toLowerCase() ||
          p.secondaryType?.toLowerCase() === selectedType.toLowerCase()
      );
    }

    setFilteredPokemon(result);
    setCurrentPage(1); // Reset ke halaman 1 setiap filter berubah
  }, [searchTerm, selectedType, allPokemon]);

  // Perhitungan Pagination
  const totalPokemon = filteredPokemon.length;
  const totalPages = Math.ceil(totalPokemon / limitPerPage) || 1;
  const indexOfLastItem = currentPage * limitPerPage;
  const indexOfFirstItem = indexOfLastItem - limitPerPage;
  const currentItems = filteredPokemon.slice(indexOfFirstItem, indexOfLastItem);

  const handleGoToPage = () => {
    const pageNum = parseInt(pageInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setPageInput("");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-white mt-10 font-sans text-gray-800 gap-10">
      
            {/* 1. HEADER LOGO */}
            <h1
              data-text="PoKéDex"
              className="
                relative font-pokemon text-8xl text-[#F9CF01] tracking-wider
                before:content-[attr(data-text)] before:absolute before:inset-0
                before:[-webkit-text-stroke:24px_#4276BD] before:text-[#4276BD]
                before:z-[-1] drop-shadow-xl leading-normal 
              "
            >
              PoKéDex
            </h1>
      
      {/* 2. SEARCH & FILTER BAR */}
      <div className="relative flex gap-3 items-center justify-center w-full max-w-3xl px-4">
        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            placeholder="Search by Name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-6! pr-5 bg-[#516A9A] text-[#F9CF01] placeholder-[#F9CF01]/60 rounded-full outline-none font-sf-pro italic"
          />
          <div className="absolute right-4 text-[#F9CF01] pointer-events-none flex items-center justify-center">
            <Search />
          </div>
        </div>

        {/* Tombol Filter */}
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className={`w-12 h-12 rounded-full cursor-pointer flex items-center justify-center transition-colors ${
              selectedType !== "" ? "bg-[#F9CF01] text-[#516A9A]" : "bg-[#516A9A] hover:bg-[#425780] text-[#F9CF01]"
            }`}
          >
            <Funnel />
          </button>

          {/* Dropdown Filter Tipe */}
          {showFilterDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50 grid grid-cols-2 gap-1 p-2">
              <button
                onClick={() => { setSelectedType(""); setShowFilterDropdown(false); }}
                className="col-span-2 text-xs py-1.5 rounded bg-gray-100 hover:bg-gray-200 font-bold"
              >
                Clear Filter
              </button>
              {Object.keys(typeColors).map((type) => (
                <button
                  key={type}
                  onClick={() => { setSelectedType(type); setShowFilterDropdown(false); }}
                  className={`text-[10px] py-1.5 px-2 text-white font-bold rounded capitalize ${typeColors[type]} hover:brightness-90`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

            {/* NAV LINKS */}
      <div className="flex gap-11 text-[#516A9A] font-sf-pro">
        <Link href="/pokedex">pokédex</Link>
        <span>|</span>
        <Link href="/statistics">statistic</Link>
        <span>|</span>
        <Link href="/pokeddle">pokeddle</Link>
      </div>

      {/* 3. GRID POKÉMON */}
      {loading ? (
      
        <div className="flex flex-col items-center justify-center h-64 gap-3 font-sf-pro">
          <div className="w-10 h-10 border-4 border-[#516A9A] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-semibold">Loading PokéDex...</p>
        </div>
      ) : currentItems.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400 font-sf-pro">
          No Pokémon found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-16 max-w-5xl w-full px-6 font-sf-pro">
          {currentItems.map((pokemon) => (
            <div key={pokemon.id} className="flex flex-col items-center w-full max-w-[210px] mx-auto group">
              <Link href={`/pokemon/${pokemon.id}`} className="w-full flex flex-col items-center">
                {/* Image */}
                <div className="h-44 w-44 flex items-center justify-center p-2 relative cursor-pointer">
                  <img
                    src={pokemon.imageUrl || "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/0.png"}
                    alt={pokemon.name}
                    className="h-36 w-36 object-contain group-hover:scale-110 transition-transform duration-300 ease-out"
                  />
                </div>
              </Link>

              {/* Line Divider */}
              <div className="w-full border-b border-gray-300 my-3"></div>

              {/* Name & ID */}
              <div className="flex justify-between w-full text-base font-sf-pro px-1 text-gray-800">
                <span className="capitalize font-sf-pro tracking-wide truncate pr-2">{pokemon.name}</span>
                <span className="font-sf-pro text-gray-500">
                  #{String(pokemon.id).padStart(4, "0")}
                </span>
              </div>

              {/* Region & Types */}
              <div className="flex justify-between w-full text-sm mt-1 px-1 items-center">
                <span className="text-gray-400 capitalize font-sf-pro">{pokemon.region}</span>
                <div className="flex gap-1.5">
                  <TypeIcon type={pokemon.primaryType} />
                  {pokemon.secondaryType && <TypeIcon type={pokemon.secondaryType} />}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. FOOTER PAGINATION */}
      {!loading && filteredPokemon.length > 0 && (
        <div className="w-full max-w-5xl mt-16  px-6 flex flex-col gap-0 text-xs font-sf-pro italic text-[#516A9A] tracking-wide">
          {/* Info Texts Above Divider */}
          <div className="flex justify-between items-center w-full select-none px-10">
            <span>Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, totalPokemon)} of {totalPokemon}</span>
            <span>Page {currentPage} of {totalPages}</span>
          </div>

          {/* Divider Line with Go To and Arrows */}
          <div className="flex items-center w-full">
            {/* Previous Arrow */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="hover:opacity-75 transition-opacity disabled:opacity-30 
              disabled:cursor-not-allowed cursor-pointer flex items-center justify-center mr-3
              rounded-none"
            >
              <ArrowLeft className="w-5 h-5 text-[#516A9A]" strokeWidth={3} strokeLinecap="square" strokeLinejoin="miter" />
            </button>

            {/* Left Divider Line */}
            <div className="flex-grow border-t-4 border-[#516A9A] rounded-none"></div>

            {/* Go to Input */}
            <div className="flex items-center gap-2 px-4 text-[#516A9A] font-sf-pro not-italic font-medium">
              <span className="italic text-xs text-[#516A9A] tracking-wide">Go to</span>
              <input
                type="text"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleGoToPage();
                }}
                className="w-10 h-7 border border-[#516A9A] rounded text-center outline-none bg-transparent font-mono text-[#516A9A] not-italic text-xs"
              />
            </div>

            {/* Right Divider Line */}
            <div className="flex-grow border-t-4 border-[#516A9A] rounded-none"></div>

            {/* Next Arrow */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="hover:opacity-75 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center ml-3"
            >
              <ArrowRight className="w-5 h-5 text-[#516A9A]" strokeWidth={3} strokeLinecap="square" strokeLinejoin="miter" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

function TypeIcon({ type }: { type: string }) {
  const typeLower = type.toLowerCase();
  
  return (
    <div title={type} className="h-6 flex items-center select-none">
      <img
        src={`/pokemon-type/${typeLower}.png`} // Mengarah ke folder public/pokemon-type/
        alt={type}
        className="h-full w-auto object-contain" // Kunci tinggi (h-full), lebar otomatis (w-auto)
        onError={(e) => {
          e.currentTarget.src = "https://via.placeholder.com/24?text=?";
        }}
      />
    </div>
  );
}