interface PokemonData {
    id: number;
    name: string;
    primaryType: string;
    secondaryType: string | null;
    generation: string;
    height: number;
    weight: number;
    imageUrl: string | null;
    baseExperience: number | null;
    cryUrl: string | null;
    isDefault: boolean;
    ability: string;
    hiddenAbility: string | null;
    sprites: {
        frontDefault: string | null;
        frontShiny: string | null;
        backDefault: string | null;
        backShiny: string | null;
    };
    stats: {
        hp: number;
        attack: number;
        defense: number;
        spAttack: number;
        spDefense: number;
        speed: number;
        total: number;
    };
}
interface EvolutionMember {
    id: number;
    name: string;
    primaryType: string;
    secondaryType: string | null;
    stage: number; // 1, 2, atau 3
    imageUrl: string | null
}

interface PokemonDetail extends PokemonData {
    evolutionChain: EvolutionMember[];
}

'use client';
import Image from "next/image";

import Link from 'next/link';
import Logo from '@/components/Logo';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

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



export default function PokemonPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [pokemon, setPokemon] = useState<PokemonDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchInput, setSearchInput] = useState("");
    const [allNames, setAllNames] = useState<{name: string, id: number}[]>([]);
    const [suggestions, setSuggestions] = useState<{name: string, id: number}[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

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

    const handleInputChange = (val: string) => {
        setSearchInput(val);
        if (val.trim().length > 1) {
            const filtered = allNames
                .filter((p) => p.name.toLowerCase().includes(val.toLowerCase()))
                .slice(0, 5);
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };
    
    const handleSuggestionClick = (name: string) => {
        setSearchInput(name);
        setSuggestions([]);
        setShowSuggestions(false);
        sessionStorage.setItem("pokedex_search", name);
        router.push("/pokedex");
    };

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && searchInput.trim()) {
            sessionStorage.setItem("pokedex_search", searchInput.trim());
            router.push("/pokedex");
        }
    };

    useEffect(() => {
        async function getDetail() {
            try {
                setLoading(true);
                const res = await fetch(`/api/pokemon/${params.id}`);
                const data = await res.json();
                console.log("=== DEBUG DATA DARI API ===", data);
                if (data.pokemon) {
                    // Gunakan data evolutionChain asli dari API. 
                    // Jika kosong (misal pokemon tidak berevolusi), default-kan ke dirinya sendiri.
                    const realEvolution: EvolutionMember[] = data.pokemon.evolutionChain || [
                        {
                            id: data.pokemon.id,
                            name: data.pokemon.name,
                            primaryType: data.pokemon.primaryType,
                            secondaryType: data.pokemon.secondaryType,
                            stage: data.pokemon.evolvesFrom ? 2 : 1
                        }
                    ];

                    setPokemon({
                        ...data.pokemon,
                        imageUrl: data.pokemon.imageUrl || `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${String(data.pokemon.id).padStart(4, '0')}.png`,
                        evolutionChain: realEvolution
                    });
                }
            } catch (err) {
                console.error("Gagal load detail pokemon:", err);
            } finally {
                setLoading(false);
            }
        }
        getDetail();
    }, [params.id]);

    if (loading) return <div className="flex h-screen items-center justify-center text-[#516A9A] font-pokemon text-3xl animate-pulse">Loading PokéDex...</div>;
    if (!pokemon) return <div className="flex h-screen items-center justify-center text-[#516A9A] font-bold text-xl">Pokémon Not Found or Server is Offline.</div>;

    // 💡 LOGIKA DETEKSI MULTI-EVOLUSI (Kayak Eevee)
    const stage2Count = pokemon.evolutionChain.filter(p => p.stage === 2).length;
    const stage3Count = pokemon.evolutionChain.filter(p => p.stage === 3).length;
    const isMultiEvolution = stage2Count > 1 || stage3Count > 1;

    // Kelompokkan evolusi berdasarkan stage untuk mempermudah render layout kanan (grid)
    const evoStage1 = pokemon.evolutionChain.filter(p => p.stage === 1);
    const evoStage2 = pokemon.evolutionChain.filter(p => p.stage === 2);
    const evoStage3 = pokemon.evolutionChain.filter(p => p.stage === 3);

    // Helper untuk render card kecil di section evolusi
    const renderEvoCard = (member: EvolutionMember) => {
        const paddedId = String(member.id).padStart(4, '0');

        // Gunakan imageUrl langsung dari database SemWeb. 
        // Jika kolom di .ttl ternyata kosong, baru lempar ke fallback official artwork 3-digit
        const finalImgUrl = member.imageUrl ||
            `https://assets.pokemon.com/assets/cms2/img/pokedex/full/${member.id < 1000 ? String(member.id).padStart(3, '0') : member.id}.png`;

        return (
            <Link
                href={`/pokemon/${member.id}`}
                key={member.id}
                className="flex flex-col items-center w-[110px] sm:w-[130px] flex-shrink-0 p-3 rounded-xl transition-transform hover:scale-105"
            >
                {/* Pakai tag img standar agar kebal dari restriksi caching Next.js Image Component */}
                <div className="w-24 h-24 flex items-center justify-center">
                    <img
                        src={finalImgUrl}
                        alt={member.name}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                            // Backup jika link database & assets utama dua-duanya crash/404
                            e.currentTarget.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${member.id}.png`;
                        }}
                    />
                </div>

                <span className="font-bold text-[#4276BD] text-sm mt-3 capitalize text-center truncate w-full tracking-wide">
                    {member.name}
                </span>
                <span className="text-xs text-slate-500">#{paddedId}</span>

                {/* Render Ikon Tipe secara dinamis di dalam card kecil */}
                <div className="flex gap-1 mt-2 transform scale-90 justify-center">
                    <TypeIcon type={member.primaryType} />
                    {member.secondaryType && <TypeIcon type={member.secondaryType} />}
                </div>
            </Link>
        );
    };

    const getRegion = (gen: string | number) => {
        switch (String(gen)) {
            case '1': return 'Kanto';
            case '2': return 'Johto';
            case '3': return 'Hoenn';
            case '4': return 'Sinnoh';
            case '5': return 'Unova';
            case '6': return 'Kalos';
            case '7': return 'Alola';
            case '8': return 'Galar';
            case '9': return 'Paldea';
            default: return 'Unknown';
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen py-10 px-4 font-sf-pro overflow-hidden">
            {/* Header Logo */}
            <Logo text="PokéDex" className="w-[70vw] sm:w-[50vw] md:w-[35vw] max-w-xl mt-8 mb-4" />
            <div className="flex flex-wrap justify-center gap-4 sm:gap-11 text-[#516A9A] font-sf-pro text-sm sm:text-base font-semibold px-4 z-40 mb-10">
                <Link href="/pokedex" className="hover:underline hover:text-[#4276BD] transition-colors">pokédex</Link>
                <span className="hidden sm:inline">|</span>
                <Link href="/pokeddle" className="hover:underline hover:text-[#4276BD] transition-colors">pokeddle</Link>
                <span className="hidden sm:inline">|</span>
                <Link href="/pokedex-ai" className="hover:underline hover:text-[#4276BD] transition-colors">pokédex AI</Link>
            </div>

            {/* Main Pokémon Image */}
            <div className="relative flex flex-col items-center my-4">
                <div className="relative w-72 h-72">
                    <Image src={pokemon.imageUrl!} alt={pokemon.name} fill className="object-contain" unoptimized />
                </div>
                {pokemon.cryUrl && (
                    <button
                        onClick={() => new Audio(pokemon.cryUrl!).play()}
                        className="mt-4 text-2xl text-[#4276BD] hover:text-[#F9CF01] font-bold transition-colors"
                    > Play Cry
                    </button>
                )}
            </div>

            {/* Info Grid (ID, Name, Type, Weight, Height, Region) */}
            <div className="grid grid-cols-3 gap-6 text-center w-full max-w-md my-6 p-4 rounded-2xl">
                <div><p className="text-xs  font-medium">ID</p><p className="font-bold ">#{String(pokemon.id).padStart(4, '0')}</p></div>
                <div><p className="text-xs text-slate-400 font-medium">Name</p><p className="font-bold capitalize">{pokemon.name}</p></div>
                <div>
                    <p className="text-xs  font-medium">Type</p>
                    <div className="flex justify-center gap-1 mt-0.5">
                        <div className="flex gap-1.5">
                            <TypeIcon type={pokemon.primaryType} />
                            {pokemon.secondaryType && <TypeIcon type={pokemon.secondaryType} />}
                        </div>
                    </div>
                </div>
                <div><p className="text-xs  font-medium">Weight</p><p className="font-bold ">{pokemon.weight}kg</p></div>
                <div><p className="text-xs  font-medium">Height</p><p className="font-bold ">{pokemon.height}m</p></div>
                <div><p className="text-xs  font-medium">Region</p><p className="font-bold capitalize">{getRegion(pokemon.generation)}</p></div>
                {pokemon.baseExperience && (
                    <div className="col-span-3 pt-4 mt-2 border-t border-slate-800/60">
                        <p className="text-xs font-medium text-slate-400">Base Exp</p>
                        <p className="font-bold text-lg text-[#F9CF01] font-pokemon tracking-wide">{pokemon.baseExperience}</p>
                    </div>
                )}
            </div>

            {/* Abilities Section */}
            <div className="text-center my-4">
                <p className="text-xs font-semibold uppercase tracking-wider">Abilities</p>
                <p className="text-xl font-bold  mt-1">{pokemon.ability || 'None'}</p>
                {pokemon.hiddenAbility && <p className="text-sm font-semibold  mt-0.5">Hidden: {pokemon.hiddenAbility}</p>}
            </div>

            {/* Base Stats Progress Bars */}
            <div className="w-full max-w-md space-y-3p-5 my-4">
                {Object.entries(pokemon.stats).map(([statName, statValue]) => {
                    if (statName === 'total') return null;
                    const maxStatValue = 255; // Stat tertinggi absolut di Pokemon game
                    const percentage = (statValue / maxStatValue) * 100;
                    return (
                        <div key={statName} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold uppercase tracking-wide ">
                                <span>{statName === 'spAttack' ? 'Sp. Attack' : statName === 'spDefense' ? 'Sp. Defense' : statName}</span>
                                <span className="">{statValue}</span>
                            </div>
                            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                                <div className="h-full bg-gradient-to-r from-[#4276BD] to-[#516A9A] rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }} />
                            </div>
                        </div>
                    );
                })}
                <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                    <span className="text-sm font-bold  uppercase">Total</span>
                    <span className="text-2xl font-black text-[#F9CF01] font-pokemon tracking-wide">{pokemon.stats.total}</span>
                </div>
            </div>

            {/* ==================== EVOLUTION SECTION ==================== */}
            <div className="w-full max-w-3xl mt-12 pt-8 border-t border-slate-800/60">
                <h3 className="text-center font-bold text-lg text-slate-400 mb-8 uppercase tracking-widest">
                    Evolution
                </h3>

                {/* KONDISI 1: JIKA POKEMON MULTI-BRANCH (SEPERTI EEVEE / MOCKUP KANAN) */}
                {isMultiEvolution ? (
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 w-full bg-slate-900/10 p-6 border border-slate-900 overflow-x-auto">
                        
                        {evoStage1.length > 0 && (
                            <div className="flex flex-col items-center justify-center min-w-[130px] bg-slate-900/20 p-2 border border-slate-800/40">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Stage 1</span>
                                <div className="flex flex-row flex-wrap justify-center gap-4">
                                    {evoStage1.map(renderEvoCard)}
                                </div>
                            </div>
                        )}

                        {/* Panah Indikator ke Stage 2 */}
                        {evoStage1.length > 0 && evoStage2.length > 0 && (
                            <div className="flex flex-col justify-center items-center text-[#4276BD] text-2xl font-bold transform rotate-90 md:rotate-0 flex-shrink-0 animate-pulse">
                                ➔
                            </div>
                        )}

                        {evoStage2.length > 0 && (
                            <div className="flex flex-col items-center justify-center min-w-[130px] bg-slate-900/20 p-2 border border-slate-800/40">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-3 block text-center">
                                    {evoStage2.length > 1 ? "Stage 2 Branches" : "Stage 2"}
                                </span>
                                <div className="flex flex-row flex-wrap justify-center gap-4">
                                    {evoStage2.map(renderEvoCard)}
                                </div>
                            </div>
                        )}

                        {/* Panah Indikator ke Stage 3 */}
                        {evoStage2.length > 0 && evoStage3.length > 0 && (
                            <div className="flex flex-col justify-center items-center text-[#4276BD] text-2xl font-bold transform rotate-90 md:rotate-0 flex-shrink-0 animate-pulse">
                                ➔
                            </div>
                        )}

                        {evoStage3.length > 0 && (
                            <div className="flex flex-col items-center justify-center min-w-[130px] bg-slate-900/20 p-2 border border-slate-800/40">
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-3 block text-center">
                                    {evoStage3.length > 1 ? "Stage 3 Branches" : "Stage 3"}
                                </span>
                                <div className="flex flex-row flex-wrap justify-center gap-4">
                                    {evoStage3.map(renderEvoCard)}
                                </div>
                            </div>
                        )}

                    </div>
                ) : (
                    /* KONDISI 2: JIKA LINEAR NORMAL (SEPERTI BULBASAUR / MOCKUP KIRI) */
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 max-w-2xl mx-auto bg-slate-900/10 p-6 border border-slate-900">
                        {pokemon.evolutionChain.sort((a, b) => a.stage - b.stage).map((member, index, arr) => (
                            <div key={member.id} className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                                {/* Card Anggota Silsilah */}
                                <div className="relative flex flex-col items-center bg-slate-900/20 p-2 border border-slate-800/40 min-w-[140px]">
                                    {renderEvoCard(member)}
                                    <span className="text-[9px] font-black text-[#516A9A] uppercase tracking-wider mt-1">
                                        Stage {member.stage}
                                    </span>
                                </div>

                                {/* Menggambar panah penyambung antar tahapan */}
                                {index < arr.length - 1 && (
                                    <div className="text-[#4276BD] text-2xl font-bold transform rotate-90 sm:rotate-0 my-1 sm:my-0 animate-pulse">
                                        ➔
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ==================== SPRITES GALLERY ==================== */}
            <div className="w-full max-w-3xl mt-12 pt-8 border-t border-slate-800/60 flex flex-col items-center">
                <h3 className="text-center font-bold text-lg text-slate-400 mb-8 uppercase tracking-widest">
                    Sprites Gallery
                </h3>
                
                <div className="flex flex-row flex-wrap items-center justify-center gap-4 sm:gap-8 max-w-2xl mx-auto bg-slate-900/10 p-6 border border-slate-900 w-full mt-4">
                    
                    
                    {/* Back Default */}
                    <div className="relative flex flex-col items-center bg-slate-900/20 p-2 border border-slate-800/40 min-w-[140px] group">
                        <div className="w-32 h-32 flex items-center justify-center relative hover:scale-110 transition-transform duration-300">
                            {pokemon.sprites.backDefault ? <img src={pokemon.sprites.backDefault} alt="Back Default" className="max-w-full max-h-full pixelated drop-shadow-md scale-[1.5]" /> : <span className="text-slate-600 text-3xl">?</span>}
                        </div>
                        <span className="font-bold text-[#4276BD] text-xs mt-3 uppercase text-center tracking-widest relative z-10">
                            Back Default
                        </span>
                    </div>
                    
                    {/* Front Shiny */}
                    <div className="relative flex flex-col items-center bg-slate-900/20 p-2 border border-slate-800/40 min-w-[140px] group">
                        <div className="w-32 h-32 flex items-center justify-center relative hover:scale-110 transition-transform duration-300">
                            {pokemon.sprites.frontShiny ? <img src={pokemon.sprites.frontShiny} alt="Front Shiny" className="max-w-full max-h-full pixelated drop-shadow-md scale-[1.5]" /> : <span className="text-slate-600 text-3xl">?</span>}
                        </div>
                        <span className="font-bold text-[#4276BD] text-xs mt-3 uppercase text-center tracking-widest relative z-10">
                            Front Shiny
                        </span>
                    </div>

                    {/* Back Shiny */}
                    <div className="relative flex flex-col items-center bg-slate-900/20 p-2 border border-slate-800/40 min-w-[140px] group">
                        <div className="w-32 h-32 flex items-center justify-center relative hover:scale-110 transition-transform duration-300">
                            {pokemon.sprites.backShiny ? <img src={pokemon.sprites.backShiny} alt="Back Shiny" className="max-w-full max-h-full pixelated drop-shadow-md scale-[1.5]" /> : <span className="text-slate-600 text-3xl">?</span>}
                        </div>
                        <span className="font-bold text-[#4276BD] text-xs mt-3 uppercase text-center tracking-widest relative z-10">
                            Back Shiny
                        </span>
                    </div>

                </div>
            </div>

            {/* Bottom Navigation Controls */}
            <div className="flex justify-between items-center w-full max-w-md mt-12 px-4">
                <Link href={`/pokemon/${Math.max(1, pokemon.id - 1)}`} className="text-2xl text-[#4276BD] hover:text-[#F9CF01] font-bold transition-colors">←</Link>
                <div className="relative flex items-center w-full mx-6">
                    <input 
                        type="text" 
                        placeholder="Search by Name or ID..." 
                        value={searchInput}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={handleSearch}
                        onFocus={() => { if (searchInput.trim().length > 1) setShowSuggestions(true); }}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        className="w-full h-12 pl-6 pr-12 bg-[#516A9A] text-[#F9CF01] placeholder-[#F9CF01]/60 rounded-full outline-none font-sf-pro italic shadow-md focus:ring-2 focus:ring-[#F9CF01] transition-all"
                    />
                    <button
                        type="button"
                        onClick={() => {
                            if (searchInput.trim()) {
                                sessionStorage.setItem("pokedex_search", searchInput.trim());
                                router.push("/pokedex");
                            }
                        }}
                        className="absolute right-4 text-[#F9CF01] flex items-center justify-center hover:opacity-85 cursor-pointer"
                    >
                        <Search className="w-5 h-5" />
                    </button>

                    {/* Autocomplete Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute left-0 right-0 bottom-full mb-2 bg-[#516A9A]/95 backdrop-blur-md border border-[#4276BD] rounded-2xl shadow-xl z-50 overflow-hidden py-1">
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
                <Link href={`/pokemon/${pokemon.id + 1}`} className="text-2xl text-[#4276BD] hover:text-[#F9CF01] font-bold transition-colors">→</Link>
            </div>
        </div>
    );
}