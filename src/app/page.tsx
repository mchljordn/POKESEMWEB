"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Funnel, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/Logo";

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

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const router = useRouter();

  // Advanced Filter States
  const [selectedType, setSelectedType] = useState("");
  const [selectedType2, setSelectedType2] = useState("");
  const [selectedGen, setSelectedGen] = useState("");
  const [sortBy, setSortBy] = useState("id_asc");

  // Autocomplete Suggestions States
  const [allNames, setAllNames] = useState<{name: string, id: number}[]>([]);
  const [suggestions, setSuggestions] = useState<{name: string, id: number}[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch daftar nama pokemon untuk saran autocomplete
  useEffect(() => {
    async function loadNames() {
      try {
        const res = await fetch("/api/pokemon?limit=1025");
        const data = await res.json();
        if (data.pokemon) {
          setAllNames(data.pokemon.map((p: any) => ({ name: p.name, id: p.id })));
        }
      } catch (err) {
        console.error("Failed to fetch Pokémon names for suggestions:", err);
      }
    }
    loadNames();
  }, []);

  // Update suggestions berdasarkan input pencarian
  const handleInputChange = (val: string) => {
    setSearchTerm(val);
    if (val.trim().length > 1) {
      const filtered = allNames
        .filter((p) => p.name.toLowerCase().includes(val.toLowerCase()))
        .slice(0, 5); // Batasi hanya menampilkan 5 saran
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Simpan semua state pencarian dan filter ke sessionStorage
    sessionStorage.setItem("pokedex_search", searchTerm);
    sessionStorage.setItem("pokedex_type", selectedType);
    sessionStorage.setItem("pokedex_type2", selectedType2);
    sessionStorage.setItem("pokedex_gen", selectedGen);
    sessionStorage.setItem("pokedex_sort", sortBy);
    sessionStorage.setItem("pokedex_page", "1");
    
    router.push("/pokedex");
  };

  const handleSuggestionClick = (name: string) => {
    setSearchTerm(name);
    setSuggestions([]);
    setShowSuggestions(false);
    
    // Langsung arahkan ke halaman Pokedex setelah saran dipilih
    sessionStorage.setItem("pokedex_search", name);
    sessionStorage.setItem("pokedex_type", selectedType);
    sessionStorage.setItem("pokedex_type2", selectedType2);
    sessionStorage.setItem("pokedex_gen", selectedGen);
    sessionStorage.setItem("pokedex_sort", sortBy);
    sessionStorage.setItem("pokedex_page", "1");
    
    router.push("/pokedex");
  };

  const isFilterActive = selectedType !== "" || selectedType2 !== "" || selectedGen !== "" || sortBy !== "id_asc";

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-10 bg-white select-none font-sf-pro overflow-hidden">
      {/* Logo */}
      <Logo text="PoKéDexiA" className="w-[95vw] sm:w-[80vw] md:w-[75vw] lg:w-[65vw] max-w-5xl" />

      {/* Search & Filter Bar Container */}
      <div className="relative flex gap-3 items-center justify-center w-full max-w-3xl px-4 z-50">
        <div className="relative flex-1 flex flex-col">
          {/* Form pencarian */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
            <input
              type="text"
              placeholder="Search by Name or ID..."
              value={searchTerm}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => {
                if (searchTerm.trim().length > 1) setShowSuggestions(true);
              }}
              onBlur={() => {
                // Delay agar click event pada suggestion terpicu sebelum dropdown ditutup
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              className="w-full h-12 pl-6 pr-12 bg-[#516A9A] text-[#F9CF01] placeholder-[#F9CF01]/60 rounded-full outline-none font-sf-pro italic shadow-md focus:ring-2 focus:ring-[#F9CF01] transition-all"
            />

            <button
              type="submit"
              className="absolute right-4 text-[#F9CF01] flex items-center justify-center hover:opacity-85 cursor-pointer"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-[#516A9A]/95 backdrop-blur-md border border-[#4276BD] rounded-2xl shadow-xl z-50 overflow-hidden py-1">
              {suggestions.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleSuggestionClick(p.name)}
                  className="w-full text-left px-6 py-2.5 hover:bg-[#4276BD] capitalize transition-colors cursor-pointer text-white font-sf-pro text-sm font-semibold flex items-center gap-2"
                >
                  <span>{p.name}</span>
                  <span className="italic text-[#F9CF01] text-xs">#{String(p.id).padStart(4, '0')}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tombol Filter */}
        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className={`w-12 h-12 rounded-full cursor-pointer flex items-center justify-center transition-colors shadow-md ${
              isFilterActive ? "bg-[#F9CF01] text-[#516A9A]" : "bg-[#516A9A] hover:bg-[#425780] text-[#F9CF01]"
            }`}
          >
            <Funnel className="w-5 h-5" />
          </button>

          {/* Advanced Filter Panel di Homepage */}
          {showFilterDropdown && (
            <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] max-w-[380px] sm:max-w-none sm:w-[540px] bg-[#516A9A]/95 backdrop-blur-md border border-[#4276BD] rounded-2xl shadow-[0_20px_50px_rgba(66,118,189,0.3)] p-4 sm:p-5 z-50 flex flex-col gap-4 font-sf-pro text-xs text-white select-text text-left">
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

              {/* Action Button */}
              <button
                type="button"
                onClick={() => handleSearchSubmit()}
                className="w-full bg-[#F9CF01] hover:bg-[#ebd03b] text-[#516A9A] font-bold py-2 rounded-xl shadow-[0_4px_14px_rgba(249,207,1,0.39)] hover:shadow-[0_6px_20px_rgba(249,207,1,0.23)] hover:-translate-y-0.5 transition-all text-center cursor-pointer mt-1 text-sm tracking-wider uppercase"
              >
                Apply & Search
              </button>
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
    </div>
  );
}