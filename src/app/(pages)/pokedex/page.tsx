"use client";

import { useEffect, useState, useRef } from "react";
import { Search, Funnel, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/Logo";

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
  const [selectedType2, setSelectedType2] = useState("");
  const [selectedGen, setSelectedGen] = useState("");
  const [sortBy, setSortBy] = useState("id_asc");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("");
  const limitPerPage = 16; 

  const [isLoaded, setIsLoaded] = useState(false);
  const prevSearchRef = useRef(searchTerm);
  const prevTypeRef = useRef(selectedType);
  const prevType2Ref = useRef(selectedType2);
  const prevGenRef = useRef(selectedGen);

  // Load state from sessionStorage on mount
  useEffect(() => {
    const savedSearch = sessionStorage.getItem("pokedex_search") || "";
    const savedType = sessionStorage.getItem("pokedex_type") || "";
    const savedType2 = sessionStorage.getItem("pokedex_type2") || "";
    const savedGen = sessionStorage.getItem("pokedex_gen") || "";
    const savedSort = sessionStorage.getItem("pokedex_sort") || "id_asc";
    const savedPage = sessionStorage.getItem("pokedex_page") || "1";

    if (savedSearch) setSearchTerm(savedSearch);
    if (savedType) setSelectedType(savedType);
    if (savedType2) setSelectedType2(savedType2);
    if (savedGen) setSelectedGen(savedGen);
    if (savedSort) setSortBy(savedSort);
    if (savedPage) setCurrentPage(parseInt(savedPage, 10));

    prevSearchRef.current = savedSearch;
    prevTypeRef.current = savedType;
    prevType2Ref.current = savedType2;
    prevGenRef.current = savedGen;
    setIsLoaded(true);
  }, []);

  // Save search, type, and page to sessionStorage
  useEffect(() => {
    if (isLoaded) {
      sessionStorage.setItem("pokedex_search", searchTerm);
    }
  }, [searchTerm, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      sessionStorage.setItem("pokedex_type", selectedType);
    }
  }, [selectedType, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      sessionStorage.setItem("pokedex_type2", selectedType2);
    }
  }, [selectedType2, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      sessionStorage.setItem("pokedex_gen", selectedGen);
    }
  }, [selectedGen, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      sessionStorage.setItem("pokedex_sort", sortBy);
    }
  }, [sortBy, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      sessionStorage.setItem("pokedex_page", currentPage.toString());
    }
  }, [currentPage, isLoaded]);

  // Scroll to query results when page changes
  useEffect(() => {
    if (isLoaded) {
      const resultsElement = document.getElementById("query-results");
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, [currentPage, isLoaded]);

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

    // Filter by Primary Type
    if (selectedType !== "") {
      result = result.filter(
        (p) =>
          p.primaryType.toLowerCase() === selectedType.toLowerCase() ||
          p.secondaryType?.toLowerCase() === selectedType.toLowerCase()
      );
    }

    // Filter by Secondary Type (if specified)
    if (selectedType2 !== "") {
      result = result.filter(
        (p) =>
          p.primaryType.toLowerCase() === selectedType2.toLowerCase() ||
          p.secondaryType?.toLowerCase() === selectedType2.toLowerCase()
      );
    }

    // Filter by Generation
    if (selectedGen !== "") {
      result = result.filter(
        (p) => p.generation === selectedGen
      );
    }

    // Sort the results
    const sorted = [...result];
    if (sortBy === "name_asc") {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "name_desc") {
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortBy === "id_desc") {
      sorted.sort((a, b) => b.id - a.id);
    } else {
      // Default: id_asc
      sorted.sort((a, b) => a.id - b.id);
    }

    setFilteredPokemon(sorted);

    // Only reset to page 1 if the filter actually changed (user changed it, not initial load)
    if (
      isLoaded &&
      (prevSearchRef.current !== searchTerm ||
        prevTypeRef.current !== selectedType ||
        prevType2Ref.current !== selectedType2 ||
        prevGenRef.current !== selectedGen)
    ) {
      setCurrentPage(1);
    }

    // Update refs
    prevSearchRef.current = searchTerm;
    prevTypeRef.current = selectedType;
    prevType2Ref.current = selectedType2;
    prevGenRef.current = selectedGen;
  }, [searchTerm, selectedType, selectedType2, selectedGen, sortBy, allPokemon, isLoaded]);

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

  const isFilterActive = selectedType !== "" || selectedType2 !== "" || selectedGen !== "" || sortBy !== "id_asc";

  return (
    <div className="flex flex-col items-center min-h-screen bg-white mt-10 font-sf-pro text-gray-800 gap-10 overflow-hidden">
      
            {/* 1. HEADER LOGO */}
            <Logo text="PoKéDex" className="w-[85vw] sm:w-[60vw] md:w-[45vw] max-w-3xl mt-8 mb-4" />
      
      {/* 2. SEARCH & FILTER BAR */}
      <div className="relative flex gap-3 items-center justify-center w-full max-w-3xl px-4 z-50">
        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            placeholder="Search by Name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-6 pr-12 bg-[#516A9A] text-[#F9CF01] placeholder-[#F9CF01]/60 rounded-full outline-none font-sf-pro italic shadow-md focus:ring-2 focus:ring-[#F9CF01] transition-all"
          />
          <div className="absolute right-4 text-[#F9CF01] pointer-events-none flex items-center justify-center">
            <Search />
          </div>
        </div>

        {/* Tombol Filter */}
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className={`w-12 h-12 rounded-full cursor-pointer flex items-center justify-center transition-colors shadow-md ${
              isFilterActive ? "bg-[#F9CF01] text-[#516A9A]" : "bg-[#516A9A] hover:bg-[#425780] text-[#F9CF01]"
            }`}
          >
            <Funnel />
          </button>

          {/* Dropdown Filter */}
          {showFilterDropdown && (
            <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] max-w-[380px] sm:max-w-none sm:w-[540px] bg-[#516A9A]/95 backdrop-blur-md border border-[#4276BD] rounded-2xl shadow-[0_20px_50px_rgba(66,118,189,0.3)] p-4 sm:p-5 z-50 flex flex-col gap-4 font-sf-pro text-xs text-white">
              {/* Header */}
              <div className="flex justify-between items-center border-b border-white/20 pb-2">
                <span className="font-bold text-[#F9CF01] text-base tracking-wider uppercase">Advanced Filters</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedType("");
                    setSelectedType2("");
                    setSelectedGen("");
                    setSortBy("id_asc");
                  }}
                  className="text-red-300 font-bold hover:text-red-200 transition-colors uppercase text-[10px] tracking-wider"
                >
                  Reset All
                </button>
              </div>

              {/* Generation Filter Section */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white/70 uppercase tracking-widest text-[10px]">Generation</span>
                  <span className="text-[#F9CF01] font-bold text-xs">{selectedGen === "" ? "All Generations" : `Generation ${selectedGen}`}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="9" 
                  step="1" 
                  value={selectedGen === "" ? 0 : parseInt(selectedGen)}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setSelectedGen(val === 0 ? "" : val.toString());
                  }}
                  className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#F9CF01] outline-none mt-2"
                />
                <div className="flex justify-between text-[9px] text-white/40 font-bold mt-0.5 px-0.5">
                  <span>All</span>
                  <span>9</span>
                </div>
              </div>

              {/* Type Filter Section */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white/70 uppercase tracking-widest text-[10px]">Types (Max 2)</span>
                  <span className="text-[#F9CF01] font-bold text-[10px]">
                    {selectedType && selectedType2 ? "2 Selected" : selectedType || selectedType2 ? "1 Selected" : "None"}
                  </span>
                </div>
                <div className="grid grid-cols-6 gap-2 sm:gap-3 max-h-32 overflow-y-auto pr-2 custom-scrollbar pb-2 pt-1">
                  {Object.keys(typeColors).map((type) => {
                    const isSelected = selectedType === type || selectedType2 === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          if (selectedType === type) {
                            setSelectedType(selectedType2);
                            setSelectedType2("");
                          } else if (selectedType2 === type) {
                            setSelectedType2("");
                          } else if (!selectedType) {
                            setSelectedType(type);
                          } else if (!selectedType2) {
                            setSelectedType2(type);
                          } else {
                            setSelectedType2(type);
                          }
                        }}
                        className={`relative py-1.5 px-1 rounded-lg text-[9px] tracking-wide text-white font-bold capitalize cursor-pointer transition-all shadow-sm text-center ${
                          typeColors[type]
                        } ${isSelected ? "opacity-100 scale-[1.05] shadow-lg z-10" : "opacity-60 hover:opacity-100 hover:scale-[1.05] z-0"}`}
                      >
                        {type}
                        {selectedType === type && (
                          <span className="absolute -top-1.5 -right-1.5 bg-[#F9CF01] text-[#516A9A] rounded-full w-3.5 h-3.5 flex items-center justify-center text-[7px] font-black shadow z-20">1</span>
                        )}
                        {selectedType2 === type && (
                          <span className="absolute -top-1.5 -right-1.5 bg-[#F9CF01] text-[#516A9A] rounded-full w-3.5 h-3.5 flex items-center justify-center text-[7px] font-black shadow z-20">2</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sort By Section */}
              <div className="flex flex-col gap-2">
                <span className="font-semibold text-white/70 uppercase tracking-widest text-[10px]">Sort By</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "id_asc", label: "ID (Lowest First)" },
                    { value: "id_desc", label: "ID (Highest First)" },
                    { value: "name_asc", label: "Name (A-Z)" },
                    { value: "name_desc", label: "Name (Z-A)" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSortBy(opt.value)}
                      className={`py-1.5 px-2 rounded-lg font-bold text-[10px] text-center cursor-pointer transition-all ${
                        sortBy === opt.value
                          ? "bg-[#F9CF01] text-[#516A9A] shadow-md scale-[1.02]"
                          : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* NAV LINKS */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-11 text-[#516A9A] font-sf-pro text-sm sm:text-base font-semibold px-4 z-40">
        <Link href="/pokedex" className="hover:underline hover:text-[#4276BD] transition-colors">pokédex</Link>
        <span className="hidden sm:inline">|</span>
        <Link href="/pokeddle" className="hover:underline hover:text-[#4276BD] transition-colors">pokeddle</Link>
        <span className="hidden sm:inline">|</span>
        <Link href="/pokedex-ai" className="hover:underline hover:text-[#4276BD] transition-colors">pokédex AI</Link>
      </div>

      {/* 3. GRID POKÉMON */}
      <div id="query-results"></div>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 sm:gap-x-12 gap-y-12 sm:gap-y-16 max-w-5xl w-full px-4 sm:px-6 font-sf-pro">
          {currentItems.map((pokemon) => (
            <div key={pokemon.id} className="flex flex-col items-center w-full max-w-[210px] mx-auto group">
              <Link href={`/pokemon/${pokemon.id}`} className="w-full flex flex-col items-center">
                {/* Image */}
                <div className="h-32 w-32 sm:h-44 sm:w-44 flex items-center justify-center p-2 relative cursor-pointer">
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