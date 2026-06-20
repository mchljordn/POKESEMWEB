"use client";

import { useState, useEffect } from "react";
import { Search, Sparkles, Code, Table, Grid, AlertCircle, RefreshCw, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import Logo from "@/components/Logo";

interface Pokemon {
  id: number;
  name: string;
  primaryType: string;
  secondaryType: string | null;
  generation: string;
  imageUrl: string | null;
  region?: string;
}

const getRegionName = (gen: string): string => {
  const regions: Record<string, string> = {
    "1": "Kanto",
    "2": "Johto",
    "3": "Hoenn",
    "4": "Sinnoh",
    "5": "Unova",
    "6": "Kalos",
    "7": "Alola",
    "8": "Galar",
    "9": "Paldea",
  };
  return regions[gen] || "Unknown";
};

export default function PokedexAI() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sparqlQuery, setSparqlQuery] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [showQuery, setShowQuery] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("");
  const limitPerPage = 16;

  // Load state from sessionStorage on mount
  useEffect(() => {
    const savedQuestion = sessionStorage.getItem("pokedex_ai_question");
    const savedQuery = sessionStorage.getItem("pokedex_ai_query");
    const savedResults = sessionStorage.getItem("pokedex_ai_results");
    const savedPage = sessionStorage.getItem("pokedex_ai_page");

    if (savedQuestion) setQuestion(savedQuestion);
    if (savedQuery) setSparqlQuery(savedQuery);
    if (savedResults) {
      try {
        setResults(JSON.parse(savedResults));
      } catch (e) {
        console.error("Failed to parse saved results:", e);
      }
    }
    if (savedPage) {
      setCurrentPage(parseInt(savedPage, 10));
    }
  }, []);

  // Save current page to sessionStorage whenever it changes
  useEffect(() => {
    if (results.length > 0) {
      sessionStorage.setItem("pokedex_ai_page", currentPage.toString());
    }
  }, [currentPage, results.length]);

  // Scroll to query results when page changes
  useEffect(() => {
    if (results.length > 0) {
      const resultsElement = document.getElementById("query-results");
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, [currentPage, results.length]);

  const handleAsk = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    setResults([]);
    setSparqlQuery(null);
    setCurrentPage(1); // Reset page to 1

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to query Pokedex AI");
      }

      setSparqlQuery(data.sparqlQuery);
      setResults(data.results);

      // Save to sessionStorage to preserve state on refresh
      sessionStorage.setItem("pokedex_ai_question", question);
      sessionStorage.setItem("pokedex_ai_query", data.sparqlQuery);
      sessionStorage.setItem("pokedex_ai_results", JSON.stringify(data.results));
      sessionStorage.setItem("pokedex_ai_page", "1");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Cek apakah hasilnya bisa ditampilkan dalam format Card Pokemon
  // Syaratnya: baris data memiliki properti "id" dan "name"
  const isPokemonCardFormat = results.length > 0 && 
    results[0].id !== undefined && 
    results[0].name !== undefined;

  // Perhitungan Pagination
  const totalPokemon = results.length;
  const totalPages = Math.ceil(totalPokemon / limitPerPage) || 1;
  const indexOfLastItem = currentPage * limitPerPage;
  const indexOfFirstItem = indexOfLastItem - limitPerPage;
  const currentItems = isPokemonCardFormat 
    ? results.slice(indexOfFirstItem, indexOfLastItem)
    : results;

  const handleGoToPage = () => {
    const pageNum = parseInt(pageInput, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setPageInput("");
    }
  };

  // Mendapatkan daftar variabel (kolom) untuk format tabel
  const getTableColumns = () => {
    if (results.length === 0) return [];
    return Object.keys(results[0]);
  };

  return (
    <div className="flex flex-col items-center w-full bg-white font-sf-pro text-gray-800 gap-10 overflow-hidden min-h-screen pt-10">
      
      {/* HEADER LOGO */}
      <Logo text="PokédexAI" className="w-[85vw] sm:w-[60vw] md:w-[45vw] max-w-3xl mt-8 mb-4" />

      {/* 2. AI INPUT BAR */}
      <form onSubmit={handleAsk} className="relative flex gap-3 items-center justify-center w-full max-w-3xl px-4">
        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            placeholder="e.g., Tampilkan semua Pokemon tipe Fire dari Generasi 1..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
            className="w-full h-12 pl-12 pr-12 bg-[#516A9A] text-[#F9CF01] placeholder-[#F9CF01]/60 rounded-full outline-none font-sf-pro italic shadow-md focus:ring-2 focus:ring-[#F9CF01] transition-all"
          />
          <div className="absolute left-4 text-[#F9CF01]/60 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="absolute right-3 bg-[#F9CF01] hover:bg-[#ebd03b] disabled:bg-gray-400 text-[#516A9A] w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors shadow-sm"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </button>
        </div>
      </form>
            
                {/* NAV LINKS */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-11 text-[#516A9A] font-sf-pro text-sm sm:text-base font-semibold px-4 z-40">
        <Link href="/pokedex" className="hover:underline hover:text-[#4276BD] transition-colors">pokédex</Link>
        <span className="hidden sm:inline">|</span>
        <Link href="/pokeddle" className="hover:underline hover:text-[#4276BD] transition-colors">pokeddle</Link>
        <span className="hidden sm:inline">|</span>
        <Link href="/pokedex-ai" className="hover:underline hover:text-[#4276BD] transition-colors">pokédex AI</Link>
      </div>
      <p className="text-sm font-sf-pro italic text-[#516A9A] tracking-wider">
          Ask Gemini in natural language, query Fuseki with Semantic SPARQL
      </p>

      {/* Contoh Pertanyaan */}
      <div className="flex flex-wrap justify-center gap-2 max-w-2xl px-4 -mt-4 text-xs font-sf-pro">
        
        <span className="text-gray-400 py-1">Try asking:</span>
        {[
          "Tampilkan pokemon tipe Fire",
          "Pokemon generasi 1 yang punya speed di atas 120",
          "Hitung jumlah pokemon di setiap generasi",
          "Berapa rata-rata attack pokemon tipe water?",
        ].map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => {
              setQuestion(q);
            }}
            disabled={loading}
            className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1 rounded-full cursor-pointer transition-colors"
          >
            "{q}"
          </button>
        ))}
      </div>

      {/* 3. LOADING & ERROR PANELS */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 gap-3 font-sf-pro">
          <div className="w-10 h-10 border-4 border-[#516A9A] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#516A9A] font-semibold animate-pulse">Gemini is translating question to SPARQL & querying Fuseki...</p>
        </div>
      )}

      {error && (
        <div className="w-full max-w-3xl bg-red-50 border border-red-200 rounded-lg p-4 mx-4 flex gap-3 text-red-700 font-sf-pro text-sm items-start">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Query Error:</span>
            <p className="mt-1 font-mono text-xs bg-red-100/50 p-2 rounded border border-red-200 overflow-x-auto whitespace-pre-wrap">{error}</p>
          </div>
        </div>
      )}

      {/* 4. SPARQL QUERY BLOCK (EDUCATIONAL PANEL) */}
      {sparqlQuery && (
        <div className="w-full max-w-3xl bg-slate-50 border border-slate-200 rounded-lg overflow-hidden mx-4 shadow-sm">
          <button
            type="button"
            onClick={() => setShowQuery(!showQuery)}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-100 hover:bg-slate-200/80 transition-colors font-sf-pro font-semibold text-xs text-[#516A9A] tracking-wider select-none cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              <span>GENERATED SPARQL QUERY</span>
            </div>
            <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded">
              {showQuery ? "HIDE" : "SHOW"}
            </span>
          </button>
          {showQuery && (
            <div className="p-4 border-t border-slate-200 bg-[#516A9A] text-[#516A9A] text-slate-40 font-mono  text-xs overflow-x-auto select-text leading-relaxed">
              <pre>{sparqlQuery}</pre>
            </div>
          )}
        </div>
      )}

      {/* 5. RESULTS DISPLAY */}
      {!loading && results.length > 0 && (
        <div id="query-results" className="w-full max-w-5xl px-6 flex flex-col gap-6 items-center">
          <div className="flex justify-between w-full border-b border-gray-200 pb-3 items-center font-sf-pro text-xs text-[#516A9A] font-semibold tracking-wider">
            <div className="flex items-center gap-2">
              {isPokemonCardFormat ? (
                <Grid className="w-4 h-4" />
              ) : (
                <Table className="w-4 h-4" />
              )}
              <span>QUERY RESULTS ({results.length} rows)</span>
            </div>
          </div>

          {/* RENDER FORMAT A: Pokemon Cards Grid */}
          {isPokemonCardFormat ? (
            <div className="flex flex-col items-center w-full gap-16">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 sm:gap-x-12 gap-y-12 sm:gap-y-16 w-full px-4 sm:px-0 font-sf-pro">
                {currentItems.map((item, idx) => {
                  // Parsing bindings
                  const id = parseInt(item.id?.value || "0", 10);
                  const name = item.name?.value || "Unknown";
                  const primaryType = item.primaryType?.value || "Unknown";
                  const secondaryType = item.secondaryType?.value || null;
                  const generation = item.generation?.value || "Unknown";
                  const imageUrl = item.imageUrl?.value || null;
                  const region = getRegionName(generation);

                  return (
                    <div key={idx} className="flex flex-col items-center w-full max-w-[210px] mx-auto group">
                      <Link href={`/pokemon/${id}`} className="w-full flex flex-col items-center">
                        <div className="h-32 w-32 sm:h-44 sm:w-44 flex items-center justify-center p-2 relative cursor-pointer">
                          <img
                            src={imageUrl || "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/0.png"}
                            alt={name}
                            className="h-36 w-36 object-contain group-hover:scale-110 transition-transform duration-300 ease-out"
                          />
                        </div>
                      </Link>

                      <div className="w-full border-b border-gray-300 my-3"></div>

                      <div className="flex justify-between w-full text-base font-sf-pro px-1 text-gray-800">
                        <span className="capitalize font-sf-pro tracking-wide truncate pr-2">{name}</span>
                        <span className="font-sf-pro text-gray-500">
                          #{String(id).padStart(4, "0")}
                        </span>
                      </div>

                      <div className="flex justify-between w-full text-sm mt-1 px-1 items-center">
                        <span className="text-gray-400 capitalize font-sf-pro">{region}</span>
                        <div className="flex gap-1.5">
                          <TypeIcon type={primaryType} />
                          {secondaryType && <TypeIcon type={secondaryType} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 4. FOOTER PAGINATION */}
              {totalPokemon > limitPerPage && (
                <div className="w-full max-w-5xl mt-16 px-6 flex flex-col gap-0 text-xs font-sf-pro italic text-[#516A9A] tracking-wide">
                  {/* Info Texts Above Divider */}
                  <div className="flex justify-between items-center w-full select-none px-12">
                    <span>Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, totalPokemon)} of {totalPokemon}</span>
                    <span>Page {currentPage} of {totalPages}</span>
                  </div>

                  {/* Divider Line with Go To and Arrows */}
                  <div className="flex items-center w-full mt-1">
                    {/* Previous Arrow */}
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="hover:opacity-75 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center mr-3"
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
          ) : (
            /* RENDER FORMAT B: Dynamic Data Table for Custom Queries */
            <div className="w-full overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
              <table className="min-w-full divide-y divide-gray-200 font-sf-pro text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 font-bold uppercase tracking-wider text-xs">
                  <tr>
                    {getTableColumns().map((col) => (
                      <th key={col} className="px-6 py-3 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100 text-gray-600">
                  {results.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      {getTableColumns().map((col) => {
                        const cellValue = row[col]?.value || "-";
                        return (
                          <td key={col} className="px-6 py-4 whitespace-nowrap font-mono text-xs">
                            {cellValue}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* No Results Info */}
      {!loading && sparqlQuery && results.length === 0 && (
        <div className="text-gray-400 font-sf-pro py-12 text-sm select-none">
          No records returned from the Fuseki dataset for this query.
        </div>
      )}
    </div>
  );
}

// Reusable TypeIcon for rendering Pokemon types
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
