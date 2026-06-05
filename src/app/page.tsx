"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Funnel, Search, Sparkles } from "lucide-react";
import Link from "next/link";

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
  const [allNames, setAllNames] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch daftar nama pokemon untuk saran autocomplete
  useEffect(() => {
    async function loadNames() {
      try {
        const res = await fetch("/api/pokemon?limit=1025");
        const data = await res.json();
        if (data.pokemon) {
          setAllNames(data.pokemon.map((p: any) => p.name));
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
        .filter((name) => name.toLowerCase().includes(val.toLowerCase()))
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
    <div className="flex flex-col items-center justify-center h-screen gap-10 bg-white select-none">
      {/* Logo */}
      <h1
        data-text="PoKéDexiA"
        className="
          relative font-pokemon text-8xl text-[#F9CF01] tracking-wider select-none
          before:content-[attr(data-text)] before:absolute before:inset-0
          before:[-webkit-text-stroke:24px_#4276BD] before:text-[#4276BD]
          before:z-[-1] drop-shadow-xl leading-normal
        "
      >
        PoKéDexiA
      </h1>

      {/* Search & Filter Bar Container */}
      <div className="relative flex gap-3 items-center justify-center w-full max-w-3xl px-4 z-40">
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
            <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden py-1">
              {suggestions.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleSuggestionClick(name)}
                  className="w-full text-left px-6 py-2.5 hover:bg-slate-50 capitalize transition-colors cursor-pointer text-gray-700 font-sf-pro text-sm font-semibold flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#F9CF01] fill-[#F9CF01]" />
                  <span>{name}</span>
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
            <div className="absolute right-0 mt-3 w-[340px] sm:w-[420px] bg-white border border-gray-200 rounded-xl shadow-2xl p-4 z-50 flex flex-col gap-4 font-sf-pro text-xs text-gray-700 select-text text-left">
              {/* Header */}
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="font-bold text-[#516A9A] text-sm">Advanced Filters</span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedType("");
                    setSelectedType2("");
                    setSelectedGen("");
                    setSortBy("id_asc");
                  }}
                  className="text-red-500 font-bold hover:underline cursor-pointer"
                >
                  Reset All
                </button>
              </div>

              {/* Generation Filter Section */}
              <div className="flex flex-col gap-1.5">
                <span className="font-semibold text-gray-500">Generation</span>
                <div className="grid grid-cols-5 gap-1">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((gen) => (
                    <button
                      key={gen}
                      type="button"
                      onClick={() => setSelectedGen(selectedGen === gen ? "" : gen)}
                      className={`py-1 rounded font-bold text-center border cursor-pointer text-[10px] transition-colors ${
                        selectedGen === gen
                          ? "bg-[#516A9A] border-[#516A9A] text-white"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      Gen {gen}
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Type Filter Section */}
              <div className="flex flex-col gap-1.5">
                <span className="font-semibold text-gray-500">Primary Type</span>
                <div className="grid grid-cols-6 gap-1 max-h-24 overflow-y-auto pr-1">
                  {Object.keys(typeColors).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType(selectedType === type ? "" : type)}
                      className={`py-1 px-1 rounded text-[9px] text-white font-bold capitalize cursor-pointer transition-all ${
                        typeColors[type]
                      } ${selectedType === type ? "ring-2 ring-offset-1 ring-gray-400 opacity-100" : "opacity-60 hover:opacity-100"}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Secondary Type Filter Section */}
              <div className="flex flex-col gap-1.5">
                <span className="font-semibold text-gray-500">Secondary Type</span>
                <div className="grid grid-cols-6 gap-1 max-h-24 overflow-y-auto pr-1">
                  {Object.keys(typeColors).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSelectedType2(selectedType2 === type ? "" : type)}
                      className={`py-1 px-1 rounded text-[9px] text-white font-bold capitalize cursor-pointer transition-all ${
                        typeColors[type]
                      } ${selectedType2 === type ? "ring-2 ring-offset-1 ring-gray-400 opacity-100" : "opacity-60 hover:opacity-100"}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By Section */}
              <div className="flex flex-col gap-1.5">
                <span className="font-semibold text-gray-500">Sort By</span>
                <div className="grid grid-cols-2 gap-1.5">
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
                      className={`py-1 px-2 rounded font-bold border text-[10px] text-center cursor-pointer transition-colors ${
                        sortBy === opt.value
                          ? "bg-[#F9CF01] border-[#F9CF01] text-[#516A9A]"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
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
                className="w-full bg-[#516A9A] hover:bg-[#425780] text-white font-bold py-2 rounded shadow transition-colors text-center cursor-pointer mt-1"
              >
                Apply Filters & Search
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigasi Bawah */}
      <div className="flex gap-11 text-[#516A9A] font-sf-pro font-medium z-30">
        <Link href="/pokedex" className="hover:underline">pokédex</Link>
        <span>|</span>
        <Link href="/pokeddle" className="hover:underline">pokeddle</Link>
        <span>|</span>
        <Link href="/pokedex-ai" className="hover:underline">pokédex AI</Link>
      </div>
    </div>
  );
}